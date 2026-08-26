/**
 * Nusantara Atelier — API Worker（v1，纯 JS 零依赖）
 *
 * 路由：
 *   GET  /health   健康检查（实际执行 SELECT 1）
 *   GET  /cases    案例列表（?style=&limit=&offset=）
 *   GET  /materials 材料 SKU 库（?category=&tier=&limit=，Phase 3a）
 *   POST /quote    估价引擎（与 apps/web/lib/quote.ts 公式/系数保持一致）+ 落库；body.mode="bom" 走 BOM 引擎（Phase 3b）
 *   POST /booking  预约线索落库
 *   POST /design   AI 设计建议
 *   POST /parse-dxf DXF 户型解析
 *
 * 统一响应：{ success, data } / { success:false, error:{ code, message } }
 * CORS：Access-Control-Allow-Origin: *，处理 OPTIONS 预检。
 */

/* ================= 估价引擎常量（与前端 lib/quote.ts 保持一致） =================
 * 口径（业主确认）：设计费按档次单价 × 印尼服务系数 1.2 独立计算；
 * 硬装（施工）加权 1.4（印尼人效比约 5x + 工签成本）；软装不加权；
 * 泳池 8% / 花园 5% 作用于（硬装+软装）。
 */

const BASE_HARD_RMB = 5000;
const BASE_SOFT_RMB = 4250;
const CONSTRUCTION_WEIGHT = 1.4;
const DESIGN_RATE = { standard: 1500, luxury: 2500, ultra: 3500 };
const ID_SERVICE_FACTOR = 1.2;
const USD_CNY = 7.2;
const IDR_USD = 15000;

const STYLE_FACTOR = {
  法式: 1.0, 现代: 0.9, 侘寂: 0.85, 意式极简: 0.95,
  现代奶油: 0.92, 法式轻奢: 1.05, 现代小法: 0.95, 待补充: 1.0,
};
const REGION_FACTOR = { jakarta: 1.0, bali: 1.05, surabaya: 0.9, other: 1.0 };
const TIER_FACTOR = { standard: 1.0, luxury: 1.3, ultra: 1.6 };
const POOL_BONUS = 0.08;
const GARDEN_BONUS = 0.05;
// 硬装内部拆分：结构 45% / 机电 22% / 景观 15%，余 18% 施工人工综合并入「装修」
const HARD_SPLIT = { structure: 0.45, mep: 0.22, landscape: 0.15, fitout: 0.18 };
const AREA_MIN = 50;
const AREA_MAX = 5000;

/** 风格 → 核心材质建议（docs/DATA_MODEL.md 风格映射表） */
const STYLE_MATERIALS = {
  法式: ['大理石拼花地面', '护墙板 + 墙布', '石膏线条吊顶', '实木家具', '水晶吊灯'],
  现代: ['大板瓷砖 / 微水泥', '艺术涂料 / 木饰面', '无主灯平顶', '玻璃', '金属线条'],
  侘寂: ['微水泥 / 木地板', '艺术涂料 / 藤编', '原木梁', '天然石材', '棉麻织物'],
  意式极简: ['大理石 / 木地板', '木饰面 / 金属', '无主灯极简吊顶', '皮革', '玻璃'],
  现代奶油: ['木地板 / 柔光砖', '艺术涂料', '弧形吊顶', '布艺', '哑光漆面'],
  法式轻奢: ['大理石 / 拼花地面', '护墙板 / 金属', '石膏线 + 灯带', '丝绒', '黄铜件'],
  现代小法: ['大理石地面', '护墙板', '石膏线条', '实木', '金属点缀'],
};

/** locale → AI 输出语言 */
const LOCALE_LANG = {
  zh: 'Simplified Chinese (中文)',
  en: 'English',
  id: 'Bahasa Indonesia',
};

/* ================= BOM 引擎（Phase 3b，镜像 apps/web/lib/bom.ts，SKU 取自 D1 materials） =================
 * 口径：LABOR_WEIGHT 与 CONSTRUCTION_WEIGHT 同源同值（1.4）；
 * 无 DXF 按降级房间模型估算；墙面 = Σ(4×√面积 × 2.8m) × 0.85；
 * 附加项与 quote 一致：(材料+人工) × (泳池 8% / 花园 5%)。
 * 改常量时两侧同步。
 */
const LABOR_WEIGHT = CONSTRUCTION_WEIGHT;
const BOM_CEILING_H = 2.8;
const BOM_OPENING_FACTOR = 0.85;
const BOM_LIGHT_DENSITY = 4;
const BOM_CABINET_M = 3.6;
const BOM_KITCHEN_M = 4;
const BOM_FEATURE_WALL_RATIO = 0.3;
const BOM_TYPICAL = { master: 25, bedroom: 20, bathroom: 6, living: 50, dining: 25, kitchen: 12, study: 15 };

const BOM_STYLE_PREF = {
  法式: { floor_public: '大理石', feature_wall: true },
  法式轻奢: { floor_public: '大理石', wall: '艺术涂料' },
  现代小法: { floor_public: '大理石', wall: '艺术涂料' },
  侘寂: { floor_public: '复合地板', wall: '微水泥' },
  现代: { floor_public: '大板瓷砖', wall: '微水泥' },
  意式极简: { floor_public: '大理石' },
  现代奶油: { floor_public: '复合地板', wall: '艺术涂料' },
};

function bomClassifyRoom(name) {
  const n = String(name || '').toLowerCase();
  if (/主卧|master/.test(n)) return 'master';
  if (/卫|浴|wc|toilet|bath/.test(n)) return 'bathroom';
  if (/厨|kitchen|dapur/.test(n)) return 'kitchen';
  if (/餐|dining/.test(n)) return 'dining';
  if (/客厅|living/.test(n)) return 'living';
  if (/书房|茶|study|tea/.test(n)) return 'study';
  if (/卧|bed|kamar tidur/.test(n)) return 'bedroom';
  return 'public';
}

function bomBuildRooms(area, roomsCount, parsedRooms) {
  if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
    return parsedRooms
      .filter((r) => Number.isFinite(Number(r.area)) && Number(r.area) > 0)
      .map((r) => ({ kind: bomClassifyRoom(r.name), name: String(r.name), area: Number(r.area) }));
  }
  const bedrooms = Math.min(Math.max(Math.round(roomsCount) || 3, 1), 10);
  const nBath = bedrooms >= 3 ? 2 : 1;
  const rooms = [{ kind: 'master', name: '主卧', area: BOM_TYPICAL.master }];
  for (let i = 0; i < bedrooms - 1; i++) rooms.push({ kind: 'bedroom', name: `次卧${i + 1}`, area: BOM_TYPICAL.bedroom });
  for (let i = 0; i < nBath; i++) rooms.push({ kind: 'bathroom', name: `卫浴${i + 1}`, area: BOM_TYPICAL.bathroom });
  rooms.push(
    { kind: 'kitchen', name: '厨房', area: BOM_TYPICAL.kitchen },
    { kind: 'dining', name: '餐厅', area: BOM_TYPICAL.dining },
    { kind: 'study', name: '书房/茶室', area: BOM_TYPICAL.study }
  );
  const used = rooms.reduce((s, r) => s + r.area, 0);
  rooms.unshift({ kind: 'living', name: '客厅/公共区', area: Math.max(area - used, BOM_TYPICAL.living) });
  return rooms;
}

/** 选型：档内按 prefSubs 顺序试 →（材质类）档内首个 /（功能类 subFirst）跨档最近档偏好子类 → 兜底 */
const BOM_TIER_IDX = { standard: 0, luxury: 1, ultra: 2 };
function bomPickSku(list, category, tier, prefSubs = [], subFirst = false) {
  const inCat = list.filter((m) => m.category === category);
  const inTier = inCat.filter((m) => m.tier === tier);
  for (const sub of prefSubs) {
    const hit = inTier.find((m) => m.subcategory === sub);
    if (hit) return hit;
  }
  const crossTier = inCat
    .filter((m) => prefSubs.includes(m.subcategory ?? ''))
    .sort(
      (a, b) =>
        Math.abs(BOM_TIER_IDX[a.tier] - BOM_TIER_IDX[tier]) -
          Math.abs(BOM_TIER_IDX[b.tier] - BOM_TIER_IDX[tier]) ||
        BOM_TIER_IDX[a.tier] - BOM_TIER_IDX[b.tier]
    )[0];
  if (subFirst) return crossTier ?? inTier[0] ?? inCat[0] ?? null;
  return inTier[0] ?? crossTier ?? inCat[0] ?? null;
}

function bomRound1(n) {
  return Math.round(n * 10) / 10;
}

function bomSkuLine(sku, category, quantity, scope, fallbackName) {
  const qty = bomRound1(quantity);
  const price = sku?.price_idr ?? 0;
  return {
    category,
    name: sku
      ? { id: sku.name_id, en: sku.name_en ?? sku.name_id, zh: sku.name_zh ?? sku.name_id }
      : { id: fallbackName, en: fallbackName, zh: fallbackName },
    brand: sku?.brand ?? null,
    spec: sku?.spec ?? null,
    quantity: qty,
    unit: sku?.unit ?? '㎡',
    unit_price_idr: price,
    subtotal_idr: Math.round(qty * price),
    labor_idr: Math.round(qty * (sku?.labor_rate_idr ?? 0)),
    supplier: sku?.supplier ?? null,
    sku_id: sku?.sku_id ?? null,
    room_scope: scope,
  };
}

/** BOM 主计算（list 为 D1 materials 行）。anchor = 系数法「装修」(fitout) 分项 {rmb, idr}（同口径对照）。 */
function bomCompute(input, list, anchor) {
  const pref = BOM_STYLE_PREF[input.style] ?? {};
  const rooms = bomBuildRooms(input.area, input.rooms_count, input.parsed_rooms);
  const fromDxf = Array.isArray(input.parsed_rooms) && input.parsed_rooms.length > 0;

  const areaOf = (...kinds) => rooms.filter((r) => kinds.includes(r.kind)).reduce((s, r) => s + r.area, 0);
  const bedroomArea = areaOf('master', 'bedroom');
  const publicArea = areaOf('living', 'dining', 'kitchen', 'study', 'public');
  const bathrooms = rooms.filter((r) => r.kind === 'bathroom');
  const nBath = Math.max(bathrooms.length, 1);
  const bathScope = fromDxf ? bathrooms.map((r) => r.name).join('、') : '卫浴（估算）';
  const nBedrooms = Math.max(rooms.filter((r) => r.kind === 'master' || r.kind === 'bedroom').length, 1);
  const nDoors = rooms.filter((r) => ['master', 'bedroom', 'bathroom', 'kitchen', 'study'].includes(r.kind)).length;
  const wallArea = rooms.reduce((s, r) => s + 4 * Math.sqrt(r.area) * BOM_CEILING_H * BOM_OPENING_FACTOR, 0);
  const totalArea = rooms.reduce((s, r) => s + r.area, 0);
  const livingArea = Math.max(areaOf('living', 'public'), BOM_TYPICAL.living);

  const bom = [];
  const floorPublicStone = pref.floor_public === '大理石' ? bomPickSku(list, '石材', input.tier, ['大理石']) : null;
  const floorPublic = floorPublicStone ?? bomPickSku(list, '瓷砖', input.tier, pref.floor_public ? [pref.floor_public] : []);
  bom.push(bomSkuLine(floorPublic, floorPublicStone ? '石材' : '瓷砖', publicArea * (floorPublic?.waste_factor ?? 1.08), '全屋地面', 'Public flooring'));
  const floorBed = bomPickSku(list, '木地板与木饰面', input.tier, [pref.floor_bedroom ?? '复合地板']);
  bom.push(bomSkuLine(floorBed, '木地板与木饰面', bedroomArea * (floorBed?.waste_factor ?? 1.05), '卧室地面', 'Bedroom flooring'));
  const wall = bomPickSku(list, '涂料与微水泥', input.tier, [pref.wall ?? '内墙漆']);
  bom.push(bomSkuLine(wall, '涂料与微水泥', wallArea * (wall?.waste_factor ?? 1.05), '全屋墙面', 'Wall paint'));
  if (pref.feature_wall) {
    const panel = bomPickSku(list, '木地板与木饰面', input.tier, ['木饰面墙板'], true);
    const featureArea = 4 * Math.sqrt(livingArea) * BOM_CEILING_H * BOM_FEATURE_WALL_RATIO;
    bom.push(bomSkuLine(panel, '木地板与木饰面', featureArea * (panel?.waste_factor ?? 1.08), '客厅背景墙', 'Wood panel feature wall'));
  }
  const closet = bomPickSku(list, '卫浴', input.tier, ['马桶', '智能马桶']);
  bom.push(bomSkuLine(closet, '卫浴', nBath, bathScope, 'Toilet'));
  const shower = bomPickSku(list, '卫浴', input.tier, ['花洒', '龙头', '浴缸'], true);
  bom.push(bomSkuLine(shower, '卫浴', nBath, bathScope, 'Shower set'));
  const door = bomPickSku(list, '门窗五金', input.tier, ['室内门'], true);
  bom.push(bomSkuLine(door, '门窗五金', nDoors, '各房间门', 'Interior door'));
  const light = bomPickSku(list, '灯具电气', input.tier, ['筒灯'], true);
  bom.push(bomSkuLine(light, '灯具电气', Math.ceil(totalArea / BOM_LIGHT_DENSITY), '全屋照明', 'Downlight'));
  const wardrobe = bomPickSku(list, '定制柜软装', input.tier, ['衣柜']);
  bom.push(bomSkuLine(wardrobe, '定制柜软装', nBedrooms * BOM_CABINET_M, '卧室衣柜', 'Wardrobe'));
  const kitchen = bomPickSku(list, '定制柜软装', input.tier, ['厨柜']);
  bom.push(bomSkuLine(kitchen, '定制柜软装', BOM_KITCHEN_M, '厨房厨柜', 'Kitchen cabinet'));

  const materialSub = bom.reduce((s, l) => s + l.subtotal_idr, 0);
  const laborTotal = Math.round(bom.reduce((s, l) => s + l.labor_idr, 0) * LABOR_WEIGHT);
  const extraBase = materialSub + laborTotal;
  if (input.has_pool) {
    bom.push({ category: 'extras', name: { id: 'Kolam Renang (tambahan)', en: 'Swimming Pool (extra)', zh: '泳池附加' }, brand: null, spec: null, quantity: 1, unit: '项', unit_price_idr: Math.round(extraBase * POOL_BONUS), subtotal_idr: Math.round(extraBase * POOL_BONUS), labor_idr: 0, supplier: null, sku_id: null, room_scope: '户外' });
  }
  if (input.has_garden) {
    bom.push({ category: 'extras', name: { id: 'Taman (tambahan)', en: 'Garden (extra)', zh: '花园附加' }, brand: null, spec: null, quantity: 1, unit: '项', unit_price_idr: Math.round(extraBase * GARDEN_BONUS), subtotal_idr: Math.round(extraBase * GARDEN_BONUS), labor_idr: 0, supplier: null, sku_id: null, room_scope: '户外' });
  }

  const materialsTotal = bom.reduce((s, l) => s + l.subtotal_idr, 0);
  const totalIdr = materialsTotal + laborTotal;
  return {
    mode: 'bom',
    total_idr: totalIdr,
    total_usd: Math.round(totalIdr / IDR_USD),
    materials_idr: materialsTotal,
    bom,
    labor: { total_idr: laborTotal, weight: LABOR_WEIGHT },
    estimate_anchor: {
      scope: 'finishing',
      total_rmb: Math.round(anchor.rmb),
      total_idr: Math.round(anchor.idr),
      diff_pct: anchor.idr > 0 ? bomRound1(((totalIdr - anchor.idr) / anchor.idr) * 100) : 0,
    },
    room_source: fromDxf ? 'dxf' : 'estimated',
  };
}

/* ================= 工具函数 ================= */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

function ok(data) {
  return json({ success: true, data });
}

function fail(status, code, message) {
  return json({ success: false, error: { code, message } }, status);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/* ================= 路由处理 ================= */

async function handleHealth(env) {
  try {
    await env.DB.prepare('SELECT 1').first();
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: { db: 'connected' },
    });
  } catch (e) {
    return json(
      { status: 'degraded', services: { db: 'error' }, message: String(e) },
      500
    );
  }
}

async function handleCases(url, env) {
  const style = url.searchParams.get('style');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  const where = style ? 'WHERE style = ?' : '';
  const binds = style ? [style] : [];

  try {
    const countRow = await env.DB.prepare(`SELECT COUNT(*) AS n FROM cases ${where}`)
      .bind(...binds)
      .first();
    const { results } = await env.DB.prepare(
      `SELECT case_id, project_name, location, country, style, area,
              hard_cost_per_sqm, soft_cost_per_sqm, images, tags, description, source, annotations
       FROM cases ${where} ORDER BY id LIMIT ? OFFSET ?`
    )
      .bind(...binds, limit, offset)
      .all();

    const list = (results || []).map((r) => ({
      ...r,
      images: safeParse(r.images, []),
      tags: safeParse(r.tags, []),
      annotations: safeParse(r.annotations, null),
    }));

    return ok({ total: countRow?.n ?? 0, cases: list });
  } catch (e) {
    return fail(500, 'DB_ERROR', String(e));
  }
}

/**
 * GET /materials — 材料 SKU 库（Phase 3a）
 * 参数：category（中文大类，如 瓷砖）、tier（standard/luxury/ultra）、limit（默认 100）
 */
async function handleMaterials(url, env) {
  const category = url.searchParams.get('category');
  const tier = url.searchParams.get('tier');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1), 500);

  const conds = [];
  const binds = [];
  if (category) {
    conds.push('category = ?');
    binds.push(category);
  }
  if (tier) {
    conds.push('tier = ?');
    binds.push(tier);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  try {
    const countRow = await env.DB.prepare(`SELECT COUNT(*) AS n FROM materials ${where}`)
      .bind(...binds)
      .first();
    const { results } = await env.DB.prepare(
      `SELECT sku_id, category, subcategory, name_id, name_en, name_zh, brand, spec, unit,
              price_idr, price_usd, price_rmb, supplier, region, tier,
              labor_rate_idr, waste_factor, updated_at, source
       FROM materials ${where} ORDER BY category, tier, id LIMIT ?`
    )
      .bind(...binds, limit)
      .all();

    return ok({ total: countRow?.n ?? 0, materials: results || [] });
  } catch (e) {
    return fail(500, 'DB_ERROR', String(e));
  }
}

function safeParse(text, fallback) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

async function handleQuote(request, env) {
  const body = await readJson(request);
  if (!body) return fail(400, 'BAD_JSON', 'Request body must be valid JSON');

  const area = Number(body.area);
  if (!Number.isFinite(area) || area < AREA_MIN || area > AREA_MAX) {
    return fail(400, 'INVALID_AREA', `area must be between ${AREA_MIN} and ${AREA_MAX}`);
  }
  const style = typeof body.style === 'string' && body.style ? body.style : '现代';
  const tier = TIER_FACTOR[body.tier] ? body.tier : 'standard';
  const region = REGION_FACTOR[body.location] ? body.location : 'other';
  const hasPool = !!body.has_pool;
  const hasGarden = !!body.has_garden;

  // 与前端 computeQuote 同一公式：总价 = 硬装 + 软装 + 设计费 + 附加项
  const styleFactor = STYLE_FACTOR[style] ?? 1.0;
  const hardRmb =
    area * BASE_HARD_RMB * styleFactor * REGION_FACTOR[region] * TIER_FACTOR[tier] * CONSTRUCTION_WEIGHT;
  const softRmb = area * BASE_SOFT_RMB * styleFactor * TIER_FACTOR[tier];
  const designFeeRmb = area * DESIGN_RATE[tier] * ID_SERVICE_FACTOR;
  const extrasRmb =
    (hardRmb + softRmb) * ((hasPool ? POOL_BONUS : 0) + (hasGarden ? GARDEN_BONUS : 0));

  const totalRmb = hardRmb + softRmb + designFeeRmb + extrasRmb;
  const totalUsd = totalRmb / USD_CNY;
  const totalIdr = totalUsd * IDR_USD;
  const breakdown = {
    structure: Math.round(hardRmb * HARD_SPLIT.structure),
    fitout: Math.round(hardRmb * HARD_SPLIT.fitout),
    mep: Math.round(hardRmb * HARD_SPLIT.mep),
    landscape: Math.round(hardRmb * HARD_SPLIT.landscape),
    furniture: Math.round(softRmb),
    design: Math.round(designFeeRmb),
  };

  // 参考案例：同风格且有造价数据的优先，否则同风格第一个
  let referenceCase = null;
  try {
    referenceCase =
      (await env.DB.prepare(
        `SELECT case_id, project_name, style, area, hard_cost_per_sqm, soft_cost_per_sqm
         FROM cases WHERE style = ? AND hard_cost_per_sqm IS NOT NULL ORDER BY id LIMIT 1`
      ).bind(style).first()) ||
      (await env.DB.prepare(
        `SELECT case_id, project_name, style, area, hard_cost_per_sqm, soft_cost_per_sqm
         FROM cases WHERE style = ? ORDER BY id LIMIT 1`
      ).bind(style).first());
  } catch (e) {
    // 参考案例查询失败不阻塞报价
    console.error('reference case query failed', e);
  }

  // Phase 3b：mode=bom → BOM 精确报价（SKU 取自 D1 materials；估算值作 anchor 对照）
  if (body.mode === 'bom') {
    let matRows = [];
    try {
      const { results } = await env.DB.prepare(
        `SELECT sku_id, category, subcategory, name_id, name_en, name_zh, brand, spec, unit,
                price_idr, labor_rate_idr, waste_factor, supplier, tier
         FROM materials`
      ).all();
      matRows = results || [];
    } catch (e) {
      return fail(500, 'DB_ERROR', String(e));
    }
    const bomResult = bomCompute(
      {
        area,
        style,
        tier,
        rooms_count: Number(body.rooms) || 3,
        has_pool: hasPool,
        has_garden: hasGarden,
        parsed_rooms: Array.isArray(body.parsed_rooms) ? body.parsed_rooms : undefined,
      },
      matRows,
      // 对照口径：系数法「装修」(fitout) 分项 = 硬装 × HARD_SPLIT.fitout
      {
        rmb: hardRmb * HARD_SPLIT.fitout,
        idr: (hardRmb * HARD_SPLIT.fitout) / USD_CNY * IDR_USD,
      }
    );
    const bomQuoteId = `quote_${crypto.randomUUID()}`;
    try {
      await env.DB.prepare(
        `INSERT INTO quotes (quote_id, area, style, tier, location, locale,
                             total_usd, total_idr, total_rmb, breakdown, reference_case_id, payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          bomQuoteId, area, style, tier, region, body.locale ?? null,
          bomResult.total_usd, bomResult.total_idr, null,
          JSON.stringify({
            materials_idr: bomResult.materials_idr,
            labor_idr: bomResult.labor.total_idr,
            anchor_idr: bomResult.estimate_anchor.total_idr,
          }),
          referenceCase?.case_id ?? null,
          JSON.stringify({
            ...body,
            bom_summary: { lines: bomResult.bom.length, total_idr: bomResult.total_idr },
          })
        )
        .run();
    } catch (e) {
      return fail(500, 'DB_ERROR', String(e));
    }
    return ok({
      quote_id: bomQuoteId,
      ...bomResult,
      reference_case: referenceCase
        ? { id: referenceCase.case_id, project_name: referenceCase.project_name, style: referenceCase.style }
        : null,
      generated_at: new Date().toISOString(),
    });
  }

  const quoteId = `quote_${crypto.randomUUID()}`;
  try {
    await env.DB.prepare(
      `INSERT INTO quotes (quote_id, area, style, tier, location, locale,
                           total_usd, total_idr, total_rmb, breakdown, reference_case_id, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        quoteId, area, style, tier, region, body.locale ?? null,
        Math.round(totalUsd), Math.round(totalIdr), Math.round(totalRmb),
        JSON.stringify(breakdown),
        referenceCase?.case_id ?? null,
        JSON.stringify(body)
      )
      .run();
  } catch (e) {
    return fail(500, 'DB_ERROR', String(e));
  }

  return ok({
    quote_id: quoteId,
    total_usd: Math.round(totalUsd),
    total_idr: Math.round(totalIdr),
    total_rmb: Math.round(totalRmb),
    hard_rmb: Math.round(hardRmb),
    soft_rmb: Math.round(softRmb),
    design_fee_rmb: Math.round(designFeeRmb),
    extras_rmb: Math.round(extrasRmb),
    breakdown,
    reference_case: referenceCase
      ? {
          id: referenceCase.case_id,
          project_name: referenceCase.project_name,
          style: referenceCase.style,
        }
      : null,
    generated_at: new Date().toISOString(),
  });
}

async function handleBooking(request, env) {
  const body = await readJson(request);
  if (!body) return fail(400, 'BAD_JSON', 'Request body must be valid JSON');

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
  if (!name || !whatsapp) {
    return fail(400, 'MISSING_FIELDS', 'name and whatsapp are required');
  }

  const bookingId = `booking_${crypto.randomUUID()}`;
  const area = Number.isFinite(Number(body.area)) && body.area !== '' && body.area != null
    ? Number(body.area)
    : null;

  try {
    await env.DB.prepare(
      `INSERT INTO bookings (booking_id, name, whatsapp, email, location, area, style, message, locale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        bookingId, name, whatsapp,
        body.email ?? null, body.location ?? null, area,
        body.style ?? null, body.message ?? null, body.locale ?? null
      )
      .run();
  } catch (e) {
    return fail(500, 'DB_ERROR', String(e));
  }

  return ok({
    booking_id: bookingId,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

/* ================= /design：AI 设计生成 ================= */

async function handleDesign(request, env) {
  const body = await readJson(request);
  if (!body) return fail(400, 'BAD_JSON', 'Request body must be valid JSON');

  const style = typeof body.style === 'string' && body.style ? body.style : '现代';
  const area = Number.isFinite(Number(body.area)) ? Number(body.area) : null;
  const rooms = Number.isFinite(Number(body.rooms)) ? Number(body.rooms) : null;
  const floors = Number.isFinite(Number(body.floors)) ? Number(body.floors) : null;
  const tier = TIER_FACTOR[body.tier] ? body.tier : 'standard';
  const locale = LOCALE_LANG[body.locale] ? body.locale : 'en';

  // 参考案例：同风格且有造价数据的优先，否则同风格第一个
  let matchedCase = null;
  try {
    matchedCase =
      (await env.DB.prepare(
        `SELECT case_id, project_name, location, style, area, hard_cost_per_sqm, soft_cost_per_sqm
         FROM cases WHERE style = ? AND hard_cost_per_sqm IS NOT NULL ORDER BY id LIMIT 1`
      ).bind(style).first()) ||
      (await env.DB.prepare(
        `SELECT case_id, project_name, location, style, area, hard_cost_per_sqm, soft_cost_per_sqm
         FROM cases WHERE style = ? ORDER BY id LIMIT 1`
      ).bind(style).first());
  } catch (e) {
    console.error('matched case query failed', e);
  }

  const materials = STYLE_MATERIALS[style] ?? STYLE_MATERIALS['现代'];
  const lang = LOCALE_LANG[locale];

  const caseInfo = matchedCase
    ? `Reference project: "${matchedCase.project_name}" (${matchedCase.location ?? ''}, ${matchedCase.area ?? '?'} sqm` +
      (matchedCase.hard_cost_per_sqm
        ? `, hard fit-out RMB ${matchedCase.hard_cost_per_sqm}/sqm, soft furnishing RMB ${matchedCase.soft_cost_per_sqm}/sqm`
        : '') + ')'
    : 'No reference project available';

  const messages = [
    {
      role: 'system',
      content:
        `You are a senior luxury villa design consultant at Nusantara Atelier, serving high-net-worth clients in Indonesia. ` +
        `Respond ENTIRELY in ${lang}. Plain text only, no markdown headers. Structure your answer in exactly these parts: ` +
        `1) Design concept (2-3 sentences). 2) Space planning suggestions as bullet points starting with "- " (respect the room/floor counts). ` +
        `3) Material suggestions (3-5 items, bullet points starting with "- "). 4) One sentence connecting the proposal to the reference project.`,
    },
    {
      role: 'user',
      content:
        `Client brief — style: ${style}, area: ${area ?? 'unknown'} sqm, rooms: ${rooms ?? 'unknown'}, floors: ${floors ?? 'unknown'}, tier: ${tier}. ` +
        `${caseInfo}. Suggested material palette: ${materials.join(', ')}.`,
    },
  ];

  let description;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages });
    description = result?.response?.trim();
    if (!description) throw new Error('empty AI response');
  } catch (e) {
    return fail(500, 'AI_ERROR', `AI generation failed: ${String(e)}`);
  }

  const designId = `design_${crypto.randomUUID()}`;
  try {
    await env.DB.prepare(
      `INSERT INTO designs (design_id, style, area, rooms, floors, tier, locale, matched_case_id, design_description, materials, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        designId, style, area, rooms, floors, tier, locale,
        matchedCase?.case_id ?? null, description,
        JSON.stringify(materials), JSON.stringify(body)
      )
      .run();
  } catch (e) {
    // 落库失败不阻塞返回
    console.error('design insert failed', e);
  }

  return ok({
    design_id: designId,
    matched_case: matchedCase
      ? {
          id: matchedCase.case_id,
          project_name: matchedCase.project_name,
          style: matchedCase.style,
          area: matchedCase.area,
          hard_cost_per_sqm: matchedCase.hard_cost_per_sqm,
          soft_cost_per_sqm: matchedCase.soft_cost_per_sqm,
        }
      : null,
    design_description: description,
    materials_suggestion: materials,
    generated_at: new Date().toISOString(),
  });
}

/* ================= /parse-dxf：最小 DXF 解析（纯 JS，LWPOLYLINE → 房间面积） ================= */

function parseDxf(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  // group code 配对
  const pairs = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    pairs.push([lines[i], lines[i + 1]]);
  }

  // 定位 ENTITIES 段
  let inEntities = false;
  const rooms = [];
  let cur = null; // 当前 LWPOLYLINE { layer, xs, ys, closed }

  const flush = () => {
    if (cur && cur.xs.length >= 3) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let area = 0;
      const n = cur.xs.length;
      for (let i = 0; i < n; i++) {
        const x = cur.xs[i], y = cur.ys[i];
        const x2 = cur.xs[(i + 1) % n], y2 = cur.ys[(i + 1) % n];
        area += x * y2 - x2 * y;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      rooms.push({
        name: cur.layer || 'room',
        width: +(maxX - minX).toFixed(2),
        depth: +(maxY - minY).toFixed(2),
        area: +(Math.abs(area) / 2).toFixed(2),
      });
    }
    cur = null;
  };

  for (const [code, value] of pairs) {
    if (code === '0' && value === 'SECTION') { cur = null; continue; }
    if (code === '2' && value === 'ENTITIES') { inEntities = true; continue; }
    if (code === '0' && value === 'ENDSEC') { if (inEntities) flush(); inEntities = false; continue; }
    if (!inEntities) continue;

    if (code === '0') {
      // 新实体开始
      flush();
      if (value === 'LWPOLYLINE') cur = { layer: 'room', xs: [], ys: [], closed: false };
      continue;
    }
    if (!cur) continue;
    if (code === '8') cur.layer = value;
    else if (code === '70') cur.closed = (parseInt(value, 10) & 1) === 1;
    else if (code === '10') cur.xs.push(parseFloat(value));
    else if (code === '20') cur.ys.push(parseFloat(value));
  }
  flush();

  const total = rooms.reduce((s, r) => s + r.area, 0);
  return { rooms, total_area: +total.toFixed(2) };
}

async function handleParseDxf(request, env) {
  const text = await request.text();
  if (!text || text.length < 20) {
    return fail(400, 'EMPTY_BODY', 'DXF text body required');
  }
  let parsed;
  try {
    parsed = parseDxf(text);
  } catch (e) {
    return fail(400, 'PARSE_ERROR', String(e));
  }
  if (parsed.rooms.length === 0) {
    return fail(400, 'NO_POLYLINE', 'No closed LWPOLYLINE entities found in ENTITIES section');
  }
  // 注意：面积单位按 DXF 原样（假设为米），未做 INSUNITS 换算
  return ok(parsed);
}

/* ================= 入口 ================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = url;
    const method = request.method;

    if (method === 'GET' && pathname === '/health') return handleHealth(env);
    if (method === 'GET' && pathname === '/cases') return handleCases(url, env);
    if (method === 'POST' && pathname === '/quote') return handleQuote(request, env);
    if (method === 'POST' && pathname === '/booking') return handleBooking(request, env);
    if (method === 'POST' && pathname === '/design') return handleDesign(request, env);
    if (method === 'POST' && pathname === '/parse-dxf') return handleParseDxf(request, env);
    if (method === 'GET' && pathname === '/materials') return handleMaterials(url, env);

    return fail(404, 'NOT_FOUND', `${method} ${pathname} not found`);
  },
};

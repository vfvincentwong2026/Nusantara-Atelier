/**
 * Nusantara Atelier — API Worker（v1，纯 JS 零依赖）
 *
 * 路由：
 *   GET  /health   健康检查（实际执行 SELECT 1）
 *   GET  /cases    案例列表（?style=&limit=&offset=）
 *   POST /quote    估价引擎（与 apps/web/lib/quote.ts 公式/系数保持一致）+ 落库
 *   POST /booking  预约线索落库
 *
 * 统一响应：{ success, data } / { success:false, error:{ code, message } }
 * CORS：Access-Control-Allow-Origin: *，处理 OPTIONS 预检。
 */

/* ================= 估价引擎常量（与前端 lib/quote.ts 保持一致） ================= */

const BASE_HARD_RMB = 5000;
const BASE_SOFT_RMB = 4250;
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
const BREAKDOWN = [
  { key: 'structure', ratio: 0.25 },
  { key: 'fitout', ratio: 0.38 },
  { key: 'mep', ratio: 0.12 },
  { key: 'landscape', ratio: 0.08 },
  { key: 'furniture', ratio: 0.12 },
  { key: 'design', ratio: 0.05 },
];
const AREA_MIN = 50;
const AREA_MAX = 5000;

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
              hard_cost_per_sqm, soft_cost_per_sqm, images, tags, description, source
       FROM cases ${where} ORDER BY id LIMIT ? OFFSET ?`
    )
      .bind(...binds, limit, offset)
      .all();

    const list = (results || []).map((r) => ({
      ...r,
      images: safeParse(r.images, []),
      tags: safeParse(r.tags, []),
    }));

    return ok({ total: countRow?.n ?? 0, cases: list });
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

  // 与前端 computeQuote 同一公式
  const styleFactor = STYLE_FACTOR[style] ?? 1.0;
  const totalRmb =
    area * (BASE_HARD_RMB + BASE_SOFT_RMB) * styleFactor *
    REGION_FACTOR[region] * TIER_FACTOR[tier] *
    (1 + (hasPool ? POOL_BONUS : 0) + (hasGarden ? GARDEN_BONUS : 0));

  const totalUsd = totalRmb / USD_CNY;
  const totalIdr = totalUsd * IDR_USD;
  const breakdown = {};
  for (const b of BREAKDOWN) breakdown[b.key] = Math.round(totalRmb * b.ratio);

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

    return fail(404, 'NOT_FOUND', `${method} ${pathname} not found`);
  },
};

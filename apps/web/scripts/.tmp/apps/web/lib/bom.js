"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STYLE_PREF = exports.FEATURE_WALL_RATIO = exports.TYPICAL_AREA = exports.KITCHEN_CABINET_M = exports.CABINET_M_PER_BEDROOM = exports.LIGHT_DENSITY_SQM = exports.OPENING_FACTOR = exports.CEILING_H = exports.LABOR_WEIGHT = void 0;
exports.bathroomCount = bathroomCount;
exports.classifyRoom = classifyRoom;
exports.buildRooms = buildRooms;
exports.pickSku = pickSku;
exports.computeBom = computeBom;
const materials_1 = require("./materials");
const quote_1 = require("./quote");
/* ================= 常量区（业务口径集中在这里，后续标定只改这里） =================
 *
 * 业务口径（Phase 3b，PRD §4）：
 * - LABOR_WEIGHT 与 quote.ts 的 CONSTRUCTION_WEIGHT 同源同值（1.4）：
 *   印尼工效能 ≈ 中国产业工人 1/5 + 工签成本；拿到真实施工报价后只校准这一个常量。
 * - 无 DXF 时按降级房间模型估算空间构成（典型面积为经验常量，可标定）。
 * - 墙面 = Σ(周长 × 层高) × 0.85（扣门窗）；周长按面积估算 4×√area。
 * - 泳池/花园附加项与 quote.ts 一致：(材料 + 人工) × (8% / 5%)。
 * - BOM v1 只覆盖 8 大类主材 + 安装人工，不是全口径合同价；
 *   estimate_anchor 保留系数法结果做对照，差异 >15% 提示量房复核。
 */
/** 人工加权系数：与 quote.ts CONSTRUCTION_WEIGHT 同源同值，交叉引用勿改单边 */
exports.LABOR_WEIGHT = quote_1.CONSTRUCTION_WEIGHT;
/** 层高与墙面折减 */
exports.CEILING_H = 2.8;
exports.OPENING_FACTOR = 0.85;
/** 灯具点位密度：每 4㎡ 一个筒灯点位 */
exports.LIGHT_DENSITY_SQM = 4;
/** 定制柜延米常量：每间卧室 3.6 延米衣柜；厨房 4 延米厨柜 */
exports.CABINET_M_PER_BEDROOM = 3.6;
exports.KITCHEN_CABINET_M = 4;
/** 降级房间模型典型面积（㎡）：无 DXF 时的空间构成 */
exports.TYPICAL_AREA = {
    master: 25,
    bedroom: 20,
    bathroom: 6,
    living: 50,
    dining: 25,
    kitchen: 12,
    study: 15,
};
/** 法式护墙板：客厅墙面的 30% 做木饰面（feature wall） */
exports.FEATURE_WALL_RATIO = 0.3;
/** 卫浴间数推算（无图纸）：卧室 ≥3 间配 2 卫，否则 1 卫 */
function bathroomCount(bedrooms) {
    return bedrooms >= 3 ? 2 : 1;
}
/** DXF 房间名 → 空间类型（图层名中英文关键词匹配，识别不了归公共区） */
function classifyRoom(name) {
    const n = name.toLowerCase();
    if (/主卧|master/.test(n))
        return 'master';
    if (/卫|浴|wc|toilet|bath/.test(n))
        return 'bathroom';
    if (/厨|kitchen|dapur/.test(n))
        return 'kitchen';
    if (/餐|dining/.test(n))
        return 'dining';
    if (/客厅|living/.test(n))
        return 'living';
    if (/书房|茶|study|tea/.test(n))
        return 'study';
    if (/卧|bed|kamar tidur/.test(n))
        return 'bedroom';
    return 'public';
}
/** 空间构成：有 parsed_rooms 用真实房间；否则按降级模型估算 */
function buildRooms(input) {
    if (input.parsed_rooms && input.parsed_rooms.length > 0) {
        return input.parsed_rooms
            .filter((r) => Number.isFinite(r.area) && r.area > 0)
            .map((r) => ({ kind: classifyRoom(r.name), name: r.name, area: r.area }));
    }
    const bedrooms = Math.min(Math.max(Math.round(input.rooms_count) || 3, 1), 10);
    const nBath = bathroomCount(bedrooms);
    const rooms = [
        { kind: 'master', name: '主卧', area: exports.TYPICAL_AREA.master },
    ];
    for (let i = 0; i < bedrooms - 1; i++) {
        rooms.push({ kind: 'bedroom', name: `次卧${i + 1}`, area: exports.TYPICAL_AREA.bedroom });
    }
    for (let i = 0; i < nBath; i++) {
        rooms.push({ kind: 'bathroom', name: `卫浴${i + 1}`, area: exports.TYPICAL_AREA.bathroom });
    }
    rooms.push({ kind: 'kitchen', name: '厨房', area: exports.TYPICAL_AREA.kitchen }, { kind: 'dining', name: '餐厅', area: exports.TYPICAL_AREA.dining }, { kind: 'study', name: '书房/茶室', area: exports.TYPICAL_AREA.study });
    const used = rooms.reduce((s, r) => s + r.area, 0);
    // 余量计入客厅/公共区（兜底不低于典型值）
    rooms.unshift({
        kind: 'living',
        name: '客厅/公共区',
        area: Math.max(input.area - used, exports.TYPICAL_AREA.living),
    });
    return rooms;
}
/* ================= SKU 选型 ================= */
/** 风格 → 选型偏好（子类优先；档内无该子类时回落到档内默认 SKU） */
exports.STYLE_PREF = {
    法式: { floor_public: '大理石', feature_wall: true },
    法式轻奢: { floor_public: '大理石', wall: '艺术涂料' },
    现代小法: { floor_public: '大理石', wall: '艺术涂料' },
    侘寂: { floor_public: '复合地板', wall: '微水泥' },
    现代: { floor_public: '大板瓷砖', wall: '微水泥' },
    意式极简: { floor_public: '大理石' },
    现代奶油: { floor_public: '复合地板', wall: '艺术涂料' },
};
const TIER_IDX = { standard: 0, luxury: 1, ultra: 2 };
/**
 * 选型优先级：
 *  1. 大类+档+偏好子类（按 prefSubs 顺序逐个试）
 *  2. subFirst=false（材质类：地面/墙面/柜体，档次优先）→ 大类+档首个 → 跨档最近档的偏好子类 → 大类首个
 *     subFirst=true（功能类：花洒/门/筒灯/护墙板，功能优先）→ 跨档最近档的偏好子类 → 大类+档首个 → 大类首个
 * 「跨档最近档」：同子类中挑与目标档距离最近的 SKU（如 ultra 筒灯回落到 luxury 9W）。
 */
function pickSku(list, category, tier, prefSubs = [], subFirst = false) {
    var _a, _b, _c, _d, _e;
    const inCat = list.filter((m) => m.category === category);
    const inTier = inCat.filter((m) => m.tier === tier);
    for (const sub of prefSubs) {
        const hit = inTier.find((m) => m.subcategory === sub);
        if (hit)
            return hit;
    }
    const crossTier = inCat
        .filter((m) => { var _a; return prefSubs.includes((_a = m.subcategory) !== null && _a !== void 0 ? _a : ''); })
        .sort((a, b) => Math.abs(TIER_IDX[a.tier] - TIER_IDX[tier]) -
        Math.abs(TIER_IDX[b.tier] - TIER_IDX[tier]) ||
        TIER_IDX[a.tier] - TIER_IDX[b.tier])[0];
    if (subFirst)
        return (_b = (_a = crossTier !== null && crossTier !== void 0 ? crossTier : inTier[0]) !== null && _a !== void 0 ? _a : inCat[0]) !== null && _b !== void 0 ? _b : null;
    return (_e = (_d = (_c = inTier[0]) !== null && _c !== void 0 ? _c : crossTier) !== null && _d !== void 0 ? _d : inCat[0]) !== null && _e !== void 0 ? _e : null;
}
/* ================= 算量与报价 ================= */
function round1(n) {
    return Math.round(n * 10) / 10;
}
function skuLine(sku, category, quantity, scope, fallbackName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const qty = round1(quantity);
    const price = (_a = sku === null || sku === void 0 ? void 0 : sku.price_idr) !== null && _a !== void 0 ? _a : 0;
    return {
        category,
        name: sku
            ? { id: sku.name_id, en: (_b = sku.name_en) !== null && _b !== void 0 ? _b : sku.name_id, zh: (_c = sku.name_zh) !== null && _c !== void 0 ? _c : sku.name_id }
            : { id: fallbackName, en: fallbackName, zh: fallbackName },
        brand: (_d = sku === null || sku === void 0 ? void 0 : sku.brand) !== null && _d !== void 0 ? _d : null,
        spec: (_e = sku === null || sku === void 0 ? void 0 : sku.spec) !== null && _e !== void 0 ? _e : null,
        quantity: qty,
        unit: (_f = sku === null || sku === void 0 ? void 0 : sku.unit) !== null && _f !== void 0 ? _f : '㎡',
        unit_price_idr: price,
        subtotal_idr: Math.round(qty * price),
        labor_idr: Math.round(qty * ((_g = sku === null || sku === void 0 ? void 0 : sku.labor_rate_idr) !== null && _g !== void 0 ? _g : 0)),
        supplier: (_h = sku === null || sku === void 0 ? void 0 : sku.supplier) !== null && _h !== void 0 ? _h : null,
        sku_id: (_j = sku === null || sku === void 0 ? void 0 : sku.sku_id) !== null && _j !== void 0 ? _j : null,
        room_scope: scope,
    };
}
/**
 * BOM 精确报价引擎（纯函数）。
 * 总价 = Σ(物料数量 × 单价) + Σ(数量 × 人工单价) × LABOR_WEIGHT + 附加项
 */
function computeBom(input, list = materials_1.materials) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const tier = input.tier;
    const pref = (_a = exports.STYLE_PREF[input.style]) !== null && _a !== void 0 ? _a : {};
    const rooms = buildRooms(input);
    const fromDxf = !!(input.parsed_rooms && input.parsed_rooms.length > 0);
    const areaOf = (...kinds) => rooms.filter((r) => kinds.includes(r.kind)).reduce((s, r) => s + r.area, 0);
    const bedroomArea = areaOf('master', 'bedroom');
    const publicArea = areaOf('living', 'dining', 'kitchen', 'study', 'public');
    const bathrooms = rooms.filter((r) => r.kind === 'bathroom');
    const nBath = Math.max(bathrooms.length, 1);
    const bathScope = fromDxf ? bathrooms.map((r) => r.name).join('、') : '卫浴（估算）';
    const nBedrooms = Math.max(rooms.filter((r) => r.kind === 'master' || r.kind === 'bedroom').length, 1);
    // 门类：房间数扣开放空间（客厅/餐厅/公共区不算门）
    const nDoors = rooms.filter((r) => ['master', 'bedroom', 'bathroom', 'kitchen', 'study'].includes(r.kind)).length;
    // 墙面：Σ(4×√面积 × 层高) × 0.85 扣门窗
    const wallArea = rooms.reduce((s, r) => s + 4 * Math.sqrt(r.area) * exports.CEILING_H * exports.OPENING_FACTOR, 0);
    const totalArea = rooms.reduce((s, r) => s + r.area, 0);
    const livingArea = Math.max(areaOf('living', 'public'), exports.TYPICAL_AREA.living);
    const bom = [];
    // 1. 公共区地面（风格偏好子类：大理石/大板瓷砖/复合地板…）
    const floorPublicStone = pref.floor_public === '大理石'
        ? pickSku(list, '石材', tier, ['大理石'])
        : null;
    const floorPublic = floorPublicStone !== null && floorPublicStone !== void 0 ? floorPublicStone : pickSku(list, '瓷砖', tier, pref.floor_public ? [pref.floor_public] : []);
    bom.push(skuLine(floorPublic, floorPublicStone ? '石材' : '瓷砖', publicArea * ((_b = floorPublic === null || floorPublic === void 0 ? void 0 : floorPublic.waste_factor) !== null && _b !== void 0 ? _b : 1.08), '全屋地面', 'Public flooring'));
    // 2. 卧室地面（木地板）
    const floorBed = pickSku(list, '木地板与木饰面', tier, [(_c = pref.floor_bedroom) !== null && _c !== void 0 ? _c : '复合地板']);
    bom.push(skuLine(floorBed, '木地板与木饰面', bedroomArea * ((_d = floorBed === null || floorBed === void 0 ? void 0 : floorBed.waste_factor) !== null && _d !== void 0 ? _d : 1.05), '卧室地面', 'Bedroom flooring'));
    // 3. 墙面涂料（风格偏好：微水泥/艺术涂料/内墙漆）
    const wall = pickSku(list, '涂料与微水泥', tier, [(_e = pref.wall) !== null && _e !== void 0 ? _e : '内墙漆']);
    bom.push(skuLine(wall, '涂料与微水泥', wallArea * ((_f = wall === null || wall === void 0 ? void 0 : wall.waste_factor) !== null && _f !== void 0 ? _f : 1.05), '全屋墙面', 'Wall paint'));
    // 4. 法式 feature wall：木饰面护墙板（客厅墙面 30%，功能优先跨档选）
    if (pref.feature_wall) {
        const panel = pickSku(list, '木地板与木饰面', tier, ['木饰面墙板'], true);
        const featureArea = 4 * Math.sqrt(livingArea) * exports.CEILING_H * exports.FEATURE_WALL_RATIO;
        bom.push(skuLine(panel, '木地板与木饰面', featureArea * ((_g = panel === null || panel === void 0 ? void 0 : panel.waste_factor) !== null && _g !== void 0 ? _g : 1.08), '客厅背景墙', 'Wood panel feature wall'));
    }
    // 5. 卫浴套件：马桶 + 花洒/龙头/浴缸，按卫浴间数（功能优先，档内逐级回落）
    const closet = pickSku(list, '卫浴', tier, ['马桶', '智能马桶']);
    bom.push(skuLine(closet, '卫浴', nBath, bathScope, 'Toilet'));
    const shower = pickSku(list, '卫浴', tier, ['花洒', '龙头', '浴缸'], true);
    bom.push(skuLine(shower, '卫浴', nBath, bathScope, 'Shower set'));
    // 6. 室内门
    const door = pickSku(list, '门窗五金', tier, ['室内门'], true);
    bom.push(skuLine(door, '门窗五金', nDoors, '各房间门', 'Interior door'));
    // 7. 灯具点位
    const light = pickSku(list, '灯具电气', tier, ['筒灯'], true);
    bom.push(skuLine(light, '灯具电气', Math.ceil(totalArea / exports.LIGHT_DENSITY_SQM), '全屋照明', 'Downlight'));
    // 8. 定制柜：卧室衣柜 + 厨房厨柜（包工包料，labor_rate=0）
    const wardrobe = pickSku(list, '定制柜软装', tier, ['衣柜']);
    bom.push(skuLine(wardrobe, '定制柜软装', nBedrooms * exports.CABINET_M_PER_BEDROOM, '卧室衣柜', 'Wardrobe'));
    const kitchen = pickSku(list, '定制柜软装', tier, ['厨柜']);
    bom.push(skuLine(kitchen, '定制柜软装', exports.KITCHEN_CABINET_M, '厨房厨柜', 'Kitchen cabinet'));
    // 9. 附加项（与 quote.ts 口径一致：作用于 材料+人工）
    const materialSub = bom.reduce((s, l) => s + l.subtotal_idr, 0);
    const laborSub = bom.reduce((s, l) => s + l.labor_idr, 0);
    const laborTotal = Math.round(laborSub * exports.LABOR_WEIGHT);
    const extraBase = materialSub + laborTotal;
    if (input.has_pool) {
        bom.push({
            category: 'extras',
            name: { id: 'Kolam Renang (tambahan)', en: 'Swimming Pool (extra)', zh: '泳池附加' },
            brand: null, spec: null,
            quantity: 1, unit: '项',
            unit_price_idr: Math.round(extraBase * quote_1.POOL_BONUS),
            subtotal_idr: Math.round(extraBase * quote_1.POOL_BONUS),
            labor_idr: 0, supplier: null, sku_id: null,
            room_scope: '户外',
        });
    }
    if (input.has_garden) {
        bom.push({
            category: 'extras',
            name: { id: 'Taman (tambahan)', en: 'Garden (extra)', zh: '花园附加' },
            brand: null, spec: null,
            quantity: 1, unit: '项',
            unit_price_idr: Math.round(extraBase * quote_1.GARDEN_BONUS),
            subtotal_idr: Math.round(extraBase * quote_1.GARDEN_BONUS),
            labor_idr: 0, supplier: null, sku_id: null,
            room_scope: '户外',
        });
    }
    const materialsTotal = bom.reduce((s, l) => s + l.subtotal_idr, 0);
    const totalIdr = materialsTotal + laborTotal;
    // 估算对照：调 quote.ts 系数法，取其「装修」(fitout) 分项做同口径对照
    // （BOM = 主材+安装人工，与全口径总价对比没有意义；region 固定 jakarta，BOM v1 价格为雅加达参考价）
    const anchor = (0, quote_1.computeQuote)({
        area: input.area,
        style: input.style,
        tier,
        region: 'jakarta',
        pool: !!input.has_pool,
        garden: !!input.has_garden,
    });
    const finishing = anchor.breakdown.find((b) => b.key === 'fitout');
    const anchorIdr = (_h = finishing === null || finishing === void 0 ? void 0 : finishing.amountIdr) !== null && _h !== void 0 ? _h : 0;
    const anchorRmb = (_j = finishing === null || finishing === void 0 ? void 0 : finishing.amountRmb) !== null && _j !== void 0 ? _j : 0;
    const diffPct = anchorIdr > 0 ? round1(((totalIdr - anchorIdr) / anchorIdr) * 100) : 0;
    return {
        mode: 'bom',
        total_idr: totalIdr,
        total_usd: Math.round(totalIdr / quote_1.IDR_USD),
        materials_idr: materialsTotal,
        bom,
        labor: { total_idr: laborTotal, weight: exports.LABOR_WEIGHT },
        estimate_anchor: {
            scope: 'finishing',
            total_rmb: Math.round(anchorRmb),
            total_idr: Math.round(anchorIdr),
            diff_pct: diffPct,
        },
        room_source: fromDxf ? 'dxf' : 'estimated',
    };
}

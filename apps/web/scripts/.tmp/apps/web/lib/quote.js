"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AREA_MAX = exports.AREA_MIN = exports.HARD_SPLIT = exports.GARDEN_BONUS = exports.POOL_BONUS = exports.TIER_FACTOR = exports.REGION_FACTOR = exports.STYLE_FACTOR = exports.IDR_USD = exports.USD_CNY = exports.ID_SERVICE_FACTOR = exports.DESIGN_RATE = exports.CONSTRUCTION_WEIGHT = exports.BASE_SOFT_RMB = exports.BASE_HARD_RMB = void 0;
exports.computeQuote = computeQuote;
exports.findReferenceCase = findReferenceCase;
exports.isValidArea = isValidArea;
const cases_1 = require("./cases");
/* ================= 常量区（后续调整集中在这里） =================
 *
 * 业务口径（业主确认，2026-08-26）：
 * - 设计费：国内行情 1500–3500 RMB/㎡ 按档次分档；印尼业主另收跨境服务费
 *   （ID_SERVICE_FACTOR 1.2：跨境服务 + 本地对接成本）。
 * - 施工费：印尼本地工人效能约为中国产业工人 1/5，请中国工人涉及工签与高人工，
 *   故硬装（施工）部分加 CONSTRUCTION_WEIGHT 1.4；软装（成品采购）不加权。
 * - 泳池 +8% / 花园 +5% 作用于（硬装 + 软装），不加到设计费。
 *
 * TODO(Phase 3)：接入 SKU 材料报价库后，硬装基准价与 CONSTRUCTION_WEIGHT
 * 需按真实材料 + 人工清单重新标定（人效比 5x 是经验估值，待实测校准）。
 */
/** 基准单方造价（RMB/㎡）：取派尚案例中位（硬装 4500–5500，软装 4000–4500） */
exports.BASE_HARD_RMB = 5000;
exports.BASE_SOFT_RMB = 4250;
/** 施工加权系数：印尼施工 vs 中国产业工人（人效比约 5x + 工签成本） */
exports.CONSTRUCTION_WEIGHT = 1.4;
/** 设计费单价（RMB/㎡，按档次） */
exports.DESIGN_RATE = {
    standard: 1500,
    luxury: 2500,
    ultra: 3500,
};
/** 印尼跨境服务系数（跨境服务、本地对接成本） */
exports.ID_SERVICE_FACTOR = 1.2;
/** 汇率常量 */
exports.USD_CNY = 7.2;
exports.IDR_USD = 15000;
/** 风格系数（docs/PROJECT_DESCRIPTION.md） */
exports.STYLE_FACTOR = {
    法式: 1.0,
    现代: 0.9,
    侘寂: 0.85,
    意式极简: 0.95,
    现代奶油: 0.92,
    法式轻奢: 1.05,
    现代小法: 0.95,
    待补充: 1.0,
};
/** 地区系数 */
exports.REGION_FACTOR = {
    jakarta: 1.0,
    bali: 1.05,
    surabaya: 0.9,
    other: 1.0,
};
/** 档次系数 */
exports.TIER_FACTOR = {
    standard: 1.0,
    luxury: 1.3,
    ultra: 1.6,
};
/** 附加项加成（作用于 硬装 + 软装） */
exports.POOL_BONUS = 0.08;
exports.GARDEN_BONUS = 0.05;
/**
 * 硬装内部拆分口径：结构 45% / 机电 22% / 景观 15%，
 * 余下 18% 为硬装施工人工与综合费用，并入展示行「装修」。
 */
exports.HARD_SPLIT = {
    structure: 0.45,
    mep: 0.22,
    landscape: 0.15,
    fitout: 0.18,
};
exports.AREA_MIN = 50;
exports.AREA_MAX = 5000;
/**
 * 总价 = 硬装 + 软装 + 设计费 + 附加项
 *   硬装 = 面积 × 5000 × 风格 × 地区 × 档次 × CONSTRUCTION_WEIGHT(1.4)
 *   软装 = 面积 × 4250 × 风格 × 档次
 *   设计费 = 面积 × 设计单价(档次) × ID_SERVICE_FACTOR(1.2)
 *   附加项 = (硬装 + 软装) × (泳池 8% + 花园 5%)
 */
function computeQuote(input) {
    var _a;
    const styleFactor = (_a = exports.STYLE_FACTOR[input.style]) !== null && _a !== void 0 ? _a : 1.0;
    const regionFactor = exports.REGION_FACTOR[input.region];
    const tierFactor = exports.TIER_FACTOR[input.tier];
    const hardRmb = input.area * exports.BASE_HARD_RMB * styleFactor * regionFactor * tierFactor * exports.CONSTRUCTION_WEIGHT;
    const softRmb = input.area * exports.BASE_SOFT_RMB * styleFactor * tierFactor;
    const designFeeRmb = input.area * exports.DESIGN_RATE[input.tier] * exports.ID_SERVICE_FACTOR;
    const extrasRmb = (hardRmb + softRmb) *
        ((input.pool ? exports.POOL_BONUS : 0) + (input.garden ? exports.GARDEN_BONUS : 0));
    const totalRmb = hardRmb + softRmb + designFeeRmb + extrasRmb;
    const totalUsd = totalRmb / exports.USD_CNY;
    const totalIdr = totalUsd * exports.IDR_USD;
    const toIdr = (rmb) => (rmb / exports.USD_CNY) * exports.IDR_USD;
    const hardRows = [
        { key: 'structure', amountRmb: hardRmb * exports.HARD_SPLIT.structure },
        { key: 'fitout', amountRmb: hardRmb * exports.HARD_SPLIT.fitout },
        { key: 'mep', amountRmb: hardRmb * exports.HARD_SPLIT.mep },
        { key: 'landscape', amountRmb: hardRmb * exports.HARD_SPLIT.landscape },
        { key: 'furniture', amountRmb: softRmb },
        { key: 'design', amountRmb: designFeeRmb },
    ];
    const breakdown = hardRows.map((r) => ({
        ...r,
        amountIdr: toIdr(r.amountRmb),
    }));
    return {
        totalRmb,
        totalUsd,
        totalIdr,
        hardRmb,
        softRmb,
        designFeeRmb,
        extrasRmb,
        breakdown,
        referenceCase: findReferenceCase(input.style),
    };
}
/** 参考案例：同风格且有真实造价数据的优先，否则同风格第一个 */
function findReferenceCase(style) {
    var _a, _b;
    const sameStyle = cases_1.cases.filter((c) => c.style === style);
    return ((_b = (_a = sameStyle.find((c) => c.hard_cost_per_sqm !== null)) !== null && _a !== void 0 ? _a : sameStyle[0]) !== null && _b !== void 0 ? _b : null);
}
function isValidArea(area) {
    return Number.isFinite(area) && area >= exports.AREA_MIN && area <= exports.AREA_MAX;
}

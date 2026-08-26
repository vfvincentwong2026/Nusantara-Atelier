import { cases } from './cases';
import type { ProjectCase } from './types';

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
export const BASE_HARD_RMB = 5000;
export const BASE_SOFT_RMB = 4250;

/** 施工加权系数：印尼施工 vs 中国产业工人（人效比约 5x + 工签成本） */
export const CONSTRUCTION_WEIGHT = 1.4;

/** 设计费单价（RMB/㎡，按档次） */
export const DESIGN_RATE = {
  standard: 1500,
  luxury: 2500,
  ultra: 3500,
} as const;

/** 印尼跨境服务系数（跨境服务、本地对接成本） */
export const ID_SERVICE_FACTOR = 1.2;

/** 汇率常量 */
export const USD_CNY = 7.2;
export const IDR_USD = 15000;

/** 风格系数（docs/PROJECT_DESCRIPTION.md） */
export const STYLE_FACTOR: Record<string, number> = {
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
export const REGION_FACTOR = {
  jakarta: 1.0,
  bali: 1.05,
  surabaya: 0.9,
  other: 1.0,
} as const;

/** 档次系数 */
export const TIER_FACTOR = {
  standard: 1.0,
  luxury: 1.3,
  ultra: 1.6,
} as const;

/** 附加项加成（作用于 硬装 + 软装） */
export const POOL_BONUS = 0.08;
export const GARDEN_BONUS = 0.05;

/**
 * 硬装内部拆分口径：结构 45% / 机电 22% / 景观 15%，
 * 余下 18% 为硬装施工人工与综合费用，并入展示行「装修」。
 */
export const HARD_SPLIT = {
  structure: 0.45,
  mep: 0.22,
  landscape: 0.15,
  fitout: 0.18,
} as const;

export const AREA_MIN = 50;
export const AREA_MAX = 5000;

/* ================= 估价引擎 ================= */

export type RegionKey = keyof typeof REGION_FACTOR;
export type TierKey = keyof typeof TIER_FACTOR;
export type BreakdownKey =
  | 'structure'
  | 'fitout'
  | 'mep'
  | 'landscape'
  | 'furniture'
  | 'design';

export interface QuoteInput {
  area: number;
  style: string;
  tier: TierKey;
  region: RegionKey;
  pool: boolean;
  garden: boolean;
}

export interface BreakdownRow {
  key: BreakdownKey;
  amountRmb: number;
  amountIdr: number;
}

export interface QuoteResult {
  totalRmb: number;
  totalUsd: number;
  totalIdr: number;
  hardRmb: number;
  softRmb: number;
  designFeeRmb: number;
  extrasRmb: number;
  breakdown: BreakdownRow[];
  referenceCase: ProjectCase | null;
}

/**
 * 总价 = 硬装 + 软装 + 设计费 + 附加项
 *   硬装 = 面积 × 5000 × 风格 × 地区 × 档次 × CONSTRUCTION_WEIGHT(1.4)
 *   软装 = 面积 × 4250 × 风格 × 档次
 *   设计费 = 面积 × 设计单价(档次) × ID_SERVICE_FACTOR(1.2)
 *   附加项 = (硬装 + 软装) × (泳池 8% + 花园 5%)
 */
export function computeQuote(input: QuoteInput): QuoteResult {
  const styleFactor = STYLE_FACTOR[input.style] ?? 1.0;
  const regionFactor = REGION_FACTOR[input.region];
  const tierFactor = TIER_FACTOR[input.tier];

  const hardRmb =
    input.area * BASE_HARD_RMB * styleFactor * regionFactor * tierFactor * CONSTRUCTION_WEIGHT;
  const softRmb = input.area * BASE_SOFT_RMB * styleFactor * tierFactor;
  const designFeeRmb = input.area * DESIGN_RATE[input.tier] * ID_SERVICE_FACTOR;
  const extrasRmb =
    (hardRmb + softRmb) *
    ((input.pool ? POOL_BONUS : 0) + (input.garden ? GARDEN_BONUS : 0));

  const totalRmb = hardRmb + softRmb + designFeeRmb + extrasRmb;
  const totalUsd = totalRmb / USD_CNY;
  const totalIdr = totalUsd * IDR_USD;

  const toIdr = (rmb: number) => (rmb / USD_CNY) * IDR_USD;
  const hardRows: { key: BreakdownKey; amountRmb: number }[] = [
    { key: 'structure', amountRmb: hardRmb * HARD_SPLIT.structure },
    { key: 'fitout', amountRmb: hardRmb * HARD_SPLIT.fitout },
    { key: 'mep', amountRmb: hardRmb * HARD_SPLIT.mep },
    { key: 'landscape', amountRmb: hardRmb * HARD_SPLIT.landscape },
    { key: 'furniture', amountRmb: softRmb },
    { key: 'design', amountRmb: designFeeRmb },
  ];
  const breakdown: BreakdownRow[] = hardRows.map((r) => ({
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
export function findReferenceCase(style: string): ProjectCase | null {
  const sameStyle = cases.filter((c) => c.style === style);
  return (
    sameStyle.find((c) => c.hard_cost_per_sqm !== null) ?? sameStyle[0] ?? null
  );
}

export function isValidArea(area: number): boolean {
  return Number.isFinite(area) && area >= AREA_MIN && area <= AREA_MAX;
}

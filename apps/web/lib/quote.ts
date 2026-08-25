import { cases } from './cases';
import type { ProjectCase } from './types';

/* ================= 常量区（后续调整集中在这里） ================= */

/** 基准单方造价（RMB/㎡）：取派尚案例中位（硬装 4500–5500，软装 4000–4500） */
export const BASE_HARD_RMB = 5000;
export const BASE_SOFT_RMB = 4250;

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

/** 附加项加成 */
export const POOL_BONUS = 0.08;
export const GARDEN_BONUS = 0.05;

/** 分项拆分比例 */
export const BREAKDOWN = [
  { key: 'structure', ratio: 0.25 },
  { key: 'fitout', ratio: 0.38 },
  { key: 'mep', ratio: 0.12 },
  { key: 'landscape', ratio: 0.08 },
  { key: 'furniture', ratio: 0.12 },
  { key: 'design', ratio: 0.05 },
] as const;

export const AREA_MIN = 50;
export const AREA_MAX = 5000;

/* ================= 估价引擎 ================= */

export type RegionKey = keyof typeof REGION_FACTOR;
export type TierKey = keyof typeof TIER_FACTOR;
export type BreakdownKey = (typeof BREAKDOWN)[number]['key'];

export interface QuoteInput {
  area: number;
  style: string;
  tier: TierKey;
  region: RegionKey;
  pool: boolean;
  garden: boolean;
}

export interface QuoteResult {
  totalRmb: number;
  totalUsd: number;
  totalIdr: number;
  breakdown: { key: BreakdownKey; ratio: number; amountRmb: number }[];
  referenceCase: ProjectCase | null;
}

/** 总价 = 面积 × (硬装+软装基准) × 风格系数 × 地区系数 × 档次系数 × (1 + 附加项) */
export function computeQuote(input: QuoteInput): QuoteResult {
  const styleFactor = STYLE_FACTOR[input.style] ?? 1.0;
  const regionFactor = REGION_FACTOR[input.region];
  const tierFactor = TIER_FACTOR[input.tier];
  const extras = 1 + (input.pool ? POOL_BONUS : 0) + (input.garden ? GARDEN_BONUS : 0);

  const totalRmb =
    input.area * (BASE_HARD_RMB + BASE_SOFT_RMB) * styleFactor * regionFactor * tierFactor * extras;

  return {
    totalRmb,
    totalUsd: totalRmb / USD_CNY,
    totalIdr: (totalRmb / USD_CNY) * IDR_USD,
    breakdown: BREAKDOWN.map((b) => ({
      key: b.key,
      ratio: b.ratio,
      amountRmb: totalRmb * b.ratio,
    })),
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

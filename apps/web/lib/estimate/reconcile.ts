/* ================= M4 · A 级对账验证（设计文档 §5-A） =================
 *
 * 用同一批输入跑三条估价线对比：
 *   - quickEstimate（本模块，硬装工序口径：KG 工时×人工费率 + Atelier SKU 材料价）
 *   - computeQuote（quote.ts 系数法，全口径：设计费+软装+结构+机电+硬装）
 *   - computeBom（bom.ts BOM 引擎，主材+安装人工口径，与 quickEstimate 最接近，主对账对象）
 *
 * 口径说明（对账报告必须同步说明）：
 *   - computeQuote 是全口径，对比时取其 breakdown 的 fitout 分项（硬装施工）做近似对照，不用总价；
 *   - computeBom 与 quickEstimate 同为 bottom-up 主材+人工口径，偏差 <25% 为 A 级验收线；
 *   - bom.ts 的 estimate_anchor.diff_pct 是同思路的既有机制（BOM vs 系数法对照）。
 */
import { computeQuote, type TierKey } from '../quote';
import { computeBom } from '../bom';
import { quickEstimate } from './quickEstimate';

/** 对账矩阵：5 风格 × 3 面积 × jakarta（设计文档 §5-A） */
export const RECONCILE_STYLES: { id: string; zh: string }[] = [
  { id: 'french', zh: '法式' },
  { id: 'modern', zh: '现代' },
  { id: 'wabi-sabi', zh: '侘寂' },
  { id: 'italian-minimal', zh: '意式极简' },
  { id: 'modern-cream', zh: '现代奶油' },
];
export const RECONCILE_AREAS = [120, 200, 350];

/** 固定空间组合（典型全案：客餐厨卫卧） */
const SPACES = ['living', 'dining', 'kitchen', 'bedroom', 'bathroom'];

/** 档次口径对齐：estimate 模块 P1 不分档；quote/bom 用 luxury（≈ estimate 默认 premium） */
const TIER: TierKey = 'luxury';

/** 单行对账结果 */
export interface ReconcileRow {
  style: string;
  area: number;
  /** quick_estimate 总价 mid（IDR） */
  quick_idr: number;
  /** BOM 引擎总价（IDR，主材+安装人工） */
  bom_idr: number;
  /** 系数法 fitout 分项（IDR，硬装施工近似口径） */
  quote_fitout_idr: number;
  /** quick vs BOM 偏差百分比：(quick-bom)/bom × 100 */
  diff_vs_bom_pct: number;
  /** quick vs 系数法 fitout 偏差百分比 */
  diff_vs_quote_pct: number;
  /** quick 单方造价 mid（IDR/㎡） */
  quick_per_sqm: number;
  /** BOM 单方造价（IDR/㎡） */
  bom_per_sqm: number;
  /** quick_estimate 的 data_gaps 数（解释偏差方向用） */
  gaps: number;
}

export interface ReconcileSummary {
  rows: ReconcileRow[];
  /** |quick vs BOM| 平均偏差（%） */
  mean_abs_diff_pct: number;
  /** 偏差 <25%（A 级验收线）的组数 */
  within_25pct: number;
  total: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** 跑完整对账矩阵（纯函数，15 组） */
export function reconcileMatrix(): ReconcileSummary {
  const rows: ReconcileRow[] = [];
  for (const s of RECONCILE_STYLES) {
    for (const area of RECONCILE_AREAS) {
      const quick = quickEstimate({
        style: s.id,
        area,
        spaces: SPACES,
        location: 'jakarta',
        tier: 'premium',
      });
      const bom = computeBom({
        area,
        style: s.zh,
        tier: TIER,
        rooms_count: 3,
      });
      const quote = computeQuote({
        area,
        style: s.zh,
        tier: TIER,
        region: 'jakarta',
        pool: false,
        garden: false,
      });
      const fitout = quote.breakdown.find((b) => b.key === 'fitout')?.amountIdr ?? 0;
      rows.push({
        style: s.id,
        area,
        quick_idr: quick.total_idr.mid,
        bom_idr: bom.total_idr,
        quote_fitout_idr: fitout,
        diff_vs_bom_pct: round1(((quick.total_idr.mid - bom.total_idr) / bom.total_idr) * 100),
        diff_vs_quote_pct: round1(((quick.total_idr.mid - fitout) / fitout) * 100),
        quick_per_sqm: quick.per_sqm_idr.mid,
        bom_per_sqm: Math.round(bom.total_idr / area),
        gaps: quick.data_gaps.length,
      });
    }
  }
  const mean =
    rows.reduce((s, r) => s + Math.abs(r.diff_vs_bom_pct), 0) / rows.length;
  return {
    rows,
    mean_abs_diff_pct: round1(mean),
    within_25pct: rows.filter((r) => Math.abs(r.diff_vs_bom_pct) < 25).length,
    total: rows.length,
  };
}

/** 输出 Markdown 对比表（对账报告与控制台共用） */
export function reconcileTable(summary: ReconcileSummary): string {
  const fmt = (n: number) => (n / 1_000_000).toFixed(1); // 百万 IDR
  const head =
    '| 风格 | 面积(㎡) | quick_estimate (M IDR) | BOM (M IDR) | 系数法fitout (M IDR) | quick vs BOM | quick vs fitout | quick单方 (k/㎡) | BOM单方 (k/㎡) |\n' +
    '|---|---|---|---|---|---|---|---|---|';
  const lines = summary.rows.map(
    (r) =>
      `| ${r.style} | ${r.area} | ${fmt(r.quick_idr)} | ${fmt(r.bom_idr)} | ${fmt(r.quote_fitout_idr)} ` +
      `| ${r.diff_vs_bom_pct > 0 ? '+' : ''}${r.diff_vs_bom_pct}% | ${r.diff_vs_quote_pct > 0 ? '+' : ''}${r.diff_vs_quote_pct}% ` +
      `| ${Math.round(r.quick_per_sqm / 1000)} | ${Math.round(r.bom_per_sqm / 1000)} |`
  );
  return [head, ...lines].join('\n');
}

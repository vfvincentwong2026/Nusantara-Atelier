/* ================= P1 quick_estimate 类型定义 =================
 *
 * 设计来源：KG 仓库 docs/P1_QUICK_ESTIMATE_设计.md §1（2026-08-27 设计稿）。
 * 本模块为纯函数，无 React 依赖，供 /upload 的「精报」标签调用。
 */

/** 估价输入（对齐 /upload 现有表单） */
export interface EstimateInput {
  /** 风格：法式 | 现代 | 侘寂 | 奶油风 | 意式极简 ...（支持别名容错，见 style_default_config.json aliases） */
  style: string;
  /** 建筑面积 m²（50–5000，口径同 quote.ts） */
  area: number;
  /** 空间列表：["living","kitchen","bedroom","bathroom",...] */
  spaces: string[];
  /** 区域：jakarta | bali | ...（影响区域系数） */
  location: string;
  /** 档次，默认 premium（P1 骨架暂不分档定价） */
  tier?: 'standard' | 'premium' | 'luxury';
  /** 斋月施工标志：true 时工期 ×1.3 */
  ramadan?: boolean;
}

/** 金额区间：mid ±15%（P1 固定带宽，回测后校准） */
export interface Range3 {
  low: number;
  mid: number;
  high: number;
}

/** 逐工序明细（§3 Step5 单项计算结果） */
export interface ProcessEstimate {
  /** 空间类型（living/bedroom/bathroom/...） */
  space: string;
  /** 部位元素（floor/wall/ceiling/bathroom/feature_wall，或前置工序标记 prerequisite） */
  element: string;
  /** KG 工艺节点 id */
  process: string;
  /** Atelier SKU id（无 SKU 时为 null，材料费计 0 并记 data_gaps） */
  sku_id: string | null;
  /** 工程量（按元素换算规则：地面=空间面积，墙面=4×√area×层高×0.85，吊顶=空间面积） */
  qty: number;
  /** 工程量单位（㎡ / 延米，随 KG 工时单位） */
  unit: string;
  /** 材料费 = sku.price_idr × qty × sku.waste_factor（IDR） */
  material_cost_idr: number;
  /** 人工费 = (单位工时 × qty / 8) × 日薪中位（IDR） */
  labor_cost_idr: number;
  /** 普工辅助费 = 技工工日 × 0.5 × 普工日薪中位（仅大板/防水/贴砖类计入） */
  aux_cost_idr: number;
  /** 单项工期（工日）= 单位工时 × qty / 8 */
  days: number;
  /** 班组：KG 人工节点 id（china-skilled-labor / indonesian-skilled-labor / local-indonesian-labor） */
  crew: string | null;
  /** 备注（来自风格配置 note 或缺数说明） */
  note?: string;
}

/** 班组配置建议：按人工节点聚合总工日 */
export interface CrewPlan {
  /** KG 人工节点 id */
  labor: string;
  /** 中文名（展示用） */
  name_zh: string;
  /** 总工日 */
  days: number;
}

/** 估价输出 */
export interface EstimateOutput {
  total_idr: Range3;
  per_sqm_idr: Range3;
  /** 逐工序明细 */
  breakdown: ProcessEstimate[];
  /** 工期（天）：likely = Σ工日 × 并行系数(0.7) × 斋月系数；min/max = likely ±15% */
  timeline_days: { min: number; likely: number; max: number };
  crew_plan: CrewPlan[];
  /** P1 阶段只有 low / medium 两档：有任何 data_gaps 即 low */
  confidence: 'low' | 'medium';
  /** 如实列出估算中走了默认值 / 未 verified 的环节 */
  data_gaps: string[];
}

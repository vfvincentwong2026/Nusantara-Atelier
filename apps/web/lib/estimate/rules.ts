/* ================= 常量区（业务口径集中在这里，后续标定只改这里） =================
 *
 * 规则来源：KG 仓库 docs/P1_QUICK_ESTIMATE_设计.md §2 Step④ / Step⑥（2026-08-27）。
 * 标 ⚠️ 的常量待 Owner 拍板（设计文档 §6 开放问题），拍板后只改这里。
 * 面积换算常量（CEILING_H / OPENING_FACTOR）与 bom.ts 同源同值，交叉引用勿改单边。
 */
import { CEILING_H, OPENING_FACTOR, TYPICAL_AREA } from '../bom';
import { AREA_MIN, AREA_MAX } from '../quote';
import type { StyleElement } from './kg';

/** 面积校验口径与 quote.ts 一致 */
export { AREA_MIN, AREA_MAX };

/** 普工辅助配比：辅助工日 = 技工工日 × 0.5（⚠️ 待 Owner 拍板，设计文档 §6-3） */
export const AUX_RATIO = 0.5;

/** 区域系数（bali=1.1 ⚠️ 待 Owner 拍板，设计文档 §6-2；未列出区域回落 1.0 并记 data_gaps） */
export const REGION_FACTOR: Record<string, number> = {
  jakarta: 1.0,
  bali: 1.1, // ⚠️
};

/** 工期并行系数：多工种交叉施工（⚠️ 待 Owner 拍板，设计文档 §6-5） */
export const PARALLEL_FACTOR = 0.7;

/** 斋月工期系数：斋月有效工时下降 20–30%，排期 ×1.3（⚠️ 待 Owner 拍板） */
export const RAMADAN_FACTOR = 1.3;

/** 估价区间带宽：low = mid × 0.85，high = mid × 1.15（P1 固定带宽，回测后校准） */
export const RANGE_LOW = 0.85;
export const RANGE_HIGH = 1.15;

/** 每日工时：单位工时换算工日的除数 */
export const HOURS_PER_DAY = 8;

/** 普工人节点 id（辅助配比用） */
export const GENERAL_LABOR_ID = 'local-indonesian-labor';

/* ---------- Step④ 人工选择硬规则（来自 KG 共识，设计文档 §2 Step④） ---------- */

/**
 * 强制中国技工的工艺：岩板/大板(≥1.2m)、微水泥、无缝结晶、弧形造型、极简收口。
 * （difficulty ≥ 4 同为此档——KG 工艺节点暂无 difficulty 字段，导出为 null，规则预留。）
 */
export const CHINA_FORCED_PROCESSES = new Set([
  'large-format-slab-installation', // 大板/岩板铺贴
  'stone-slab-wall-cladding', // 岩板上墙/干挂
  'microcement-wall-finishing', // 微水泥
  'stone-seamless-crystallization', // 无缝结晶
  'custom-wood-millwork-curved', // 弧形造型
  'minimalist-trimless-edge', // 极简收口
]);

/** 强制中国技工的材料（岩板/大板 ≥1.2m） */
export const CHINA_FORCED_MATERIALS = new Set(['sintered-stone', 'large-format-slab']);

/** 常规印尼技工工艺：常规铺贴 / 防水 / 安装类（兜底默认也是印尼技工） */
export const INDONESIAN_PROCESSES = new Set([
  'wet-method-tiling',
  'bathroom-waterproofing-cistern-system',
  'wood-spc-flooring-installation',
  'floating-suspended-ceiling',
]);

/** 需要计普工辅助的工艺：大板 / 防水 / 贴砖类 */
export const AUX_PROCESSES = new Set([
  'large-format-slab-installation',
  'bathroom-waterproofing-cistern-system',
  'wet-method-tiling',
]);

/**
 * 前置工序的适用空间限制：防水前置只在卫浴空间展开
 * （KG 里防水是 wet-method-tiling 的强制前置，但客餐厅贴砖不做防水）。
 */
export const PREREQ_SCOPE: Record<string, string[]> = {
  'bathroom-waterproofing-cistern-system': ['bathroom'],
};

/**
 * Step④ 人工选择（硬规则兜底）：config 元素已指定 labor 时优先用 config，本函数仅在未指定时调用。
 */
export function selectLaborByRules(
  element: StyleElement,
  processDifficulty: number | null
): string {
  if (
    (processDifficulty !== null && processDifficulty >= 4) ||
    (element.material !== null && CHINA_FORCED_MATERIALS.has(element.material)) ||
    (element.process !== null && CHINA_FORCED_PROCESSES.has(element.process))
  ) {
    return 'china-skilled-labor';
  }
  // 常规铺贴/防水/安装类及其余未列明工艺 → 印尼技工；普工仅辅助（见 AUX_RATIO）
  return 'indonesian-skilled-labor';
}

/* ---------- 面积换算规则（Step③，与 bom.ts 口径一致） ---------- */

/** 墙面面积 = 4×√area × 层高 × 0.85（扣门窗），周长按面积估算 */
export function wallAreaOf(spaceArea: number): number {
  return 4 * Math.sqrt(spaceArea) * CEILING_H * OPENING_FACTOR;
}

/**
 * 元素工程量换算：
 *   floor / ceiling = 空间面积；wall = 墙面估算；
 *   bathroom = 墙地一体（地面 + 墙面）；feature_wall = 墙面的 30%（同 bom.ts 护墙板口径）。
 */
export function qtyOfElement(element: string, spaceArea: number): number {
  switch (element) {
    case 'floor':
    case 'ceiling':
      return spaceArea;
    case 'wall':
      return wallAreaOf(spaceArea);
    case 'bathroom':
      return spaceArea + wallAreaOf(spaceArea);
    case 'feature_wall':
      return wallAreaOf(spaceArea) * 0.3;
    default:
      return spaceArea;
  }
}

/* ---------- 空间面积分摊（无 DXF 时的降级模型，权重同 bom.ts TYPICAL_AREA） ---------- */

/** 空间类型 → 典型面积权重（㎡）；未识别空间按 bedroom 权重并记 data_gaps */
export const SPACE_WEIGHT: Record<string, number> = {
  living: TYPICAL_AREA.living,
  dining: TYPICAL_AREA.dining,
  kitchen: TYPICAL_AREA.kitchen,
  bedroom: TYPICAL_AREA.bedroom,
  master: TYPICAL_AREA.master,
  bathroom: TYPICAL_AREA.bathroom,
  study: TYPICAL_AREA.study,
};

/** 各空间类型展开哪些元素 */
export function elementsOfSpace(space: string): string[] {
  if (space === 'bathroom') return ['bathroom'];
  if (space === 'living') return ['floor', 'wall', 'ceiling', 'feature_wall'];
  return ['floor', 'wall', 'ceiling'];
}

/**
 * 把总建筑面积按典型面积权重分摊到各空间（P1 无逐空间面积输入，先按比例分）。
 * 返回 space → 分摊面积（㎡）。
 */
export function allocateArea(area: number, spaces: string[]): Record<string, number> {
  const weights = spaces.map((s) => SPACE_WEIGHT[s] ?? TYPICAL_AREA.bedroom);
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  const out: Record<string, number> = {};
  spaces.forEach((s, i) => {
    // 同类型空间多次出现时累加（如两个 bathroom）
    out[s] = (out[s] ?? 0) + (area * weights[i]) / total;
  });
  return out;
}

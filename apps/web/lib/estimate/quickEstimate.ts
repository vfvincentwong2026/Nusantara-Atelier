/* ================= P1 quick_estimate 估价引擎（骨架） =================
 *
 * 设计来源：KG 仓库 docs/P1_QUICK_ESTIMATE_设计.md §2 六步管线 + §3 伪代码。
 *
 * 【数据源边界（防双头维护，改数据前先读这里）】
 *   - 材料价 price_idr 与损耗系数 waste_factor：以 Atelier SKU（data/materials.json）为唯一事实源；
 *   - 工时定额与人工选择规则：以 KG（obsidian-vault → data/kg_estimate.json 快照）为唯一事实源；
 *   - 同一工序的材料费以 Atelier SKU 为准，工时以 KG 为准，两边互不覆盖。
 *
 * 管线：输入 → ①输入规范化 → ②配置模板匹配 → ③工序展开 → ④人工选择 → ⑤单项计算 → ⑥汇总输出
 */
import { materials } from '../materials';
import type { Material } from '../types';
import {
  getProcess,
  getLabor,
  getWorkhour,
  loadStyleConfig,
  normalizeStyle,
  supportedStyles,
  prerequisitesOf,
  type StyleElement,
} from './kg';
import {
  AREA_MIN,
  AREA_MAX,
  AUX_RATIO,
  REGION_FACTOR,
  PARALLEL_FACTOR,
  RAMADAN_FACTOR,
  RANGE_LOW,
  RANGE_HIGH,
  HOURS_PER_DAY,
  GENERAL_LABOR_ID,
  AUX_PROCESSES,
  PREREQ_SCOPE,
  selectLaborByRules,
  qtyOfElement,
  elementsOfSpace,
  allocateArea,
} from './rules';
import type {
  EstimateInput,
  EstimateOutput,
  ProcessEstimate,
  CrewPlan,
  Range3,
} from './types';

/* ---------- 内部小工具 ---------- */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function range3(mid: number): Range3 {
  return {
    low: Math.round(mid * RANGE_LOW),
    mid: Math.round(mid),
    high: Math.round(mid * RANGE_HIGH),
  };
}

/** 按 sku_id 查 Atelier SKU（材料价与损耗系数的唯一事实源） */
function findSku(skuId: string | null): Material | null {
  if (!skuId) return null;
  return materials.find((m) => m.sku_id === skuId) ?? null;
}

/* ---------- Step③ 工序展开 ---------- */

/** 展开中的一行：空间 × 元素 × 工艺（含前置工序补行） */
interface ExpandedLine {
  space: string;
  element: string;
  process: string;
  qty: number;
  elementCfg: StyleElement | null; // 前置工序无配置，为 null
  note?: string;
}

/**
 * 对单个空间展开工艺行，并递归补强制前置工序（如贴砖补防水、微水泥补冲筋找平）。
 * visited 防循环；(space, process) 去重，同一空间同一工艺只保留首次展开行。
 */
function expandSpace(
  space: string,
  spaceArea: number,
  elements: Record<string, StyleElement>,
  gaps: string[]
): ExpandedLine[] {
  const lines: ExpandedLine[] = [];
  const seen = new Set<string>(); // `${space}|${process}` 去重

  const addWithPrereqs = (
    element: string,
    processId: string,
    qty: number,
    elementCfg: StyleElement | null,
    note: string | undefined,
    visited: Set<string>
  ) => {
    const key = `${space}|${processId}`;
    if (seen.has(key) || visited.has(processId)) return;
    visited.add(processId);
    seen.add(key);
    lines.push({ space, element, process: processId, qty, elementCfg, note });
    // 强制前置工序（KG relations）：与触发行同空间同工程量
    for (const pre of prerequisitesOf(processId)) {
      const scope = PREREQ_SCOPE[pre];
      if (scope && !scope.includes(space)) continue; // 如防水只在卫浴展开
      addWithPrereqs(`${element}(前置)`, pre, qty, null, 'KG 强制前置工序', visited);
    }
  };

  for (const el of elementsOfSpace(space)) {
    const cfg = elements[el];
    if (!cfg) continue; // 配置无此元素（如实跳过，不报 gap——配置本身即默认口径）
    if (!cfg.process) {
      // 配置元素缺工艺节点（如法式护墙板）→ 如实记 data_gaps
      gaps.push(`${el} 元素无工艺节点，未计价（${cfg.note}）`);
      continue;
    }
    const qty = qtyOfElement(el, spaceArea);
    addWithPrereqs(el, cfg.process, qty, cfg, cfg.note, new Set());
  }
  return lines;
}

/* ---------- 主入口 ---------- */

/**
 * quick_estimate 快速估价（纯函数）。
 * @param input 见 EstimateInput
 * @param deps  测试注入用（默认用快照数据）：sku 列表
 */
export function quickEstimate(
  input: EstimateInput,
  deps: { skus?: Material[] } = {}
): EstimateOutput {
  const skuList = deps.skus ?? materials;
  const gaps: string[] = [];

  /* ----- Step① 输入规范化 ----- */
  if (!Number.isFinite(input.area) || input.area < AREA_MIN || input.area > AREA_MAX) {
    throw new Error(`面积需在 ${AREA_MIN}–${AREA_MAX} ㎡之间（收到 ${input.area}）`);
  }
  const styleId = normalizeStyle(input.style);
  if (!styleId) {
    throw new Error(
      `暂不支持的风格「${input.style}」。当前支持：${supportedStyles().join('；')}`
    );
  }
  if (!input.spaces || input.spaces.length === 0) {
    throw new Error('spaces 不能为空');
  }
  const unknownSpaces = input.spaces.filter((s) => !['living', 'dining', 'kitchen', 'bedroom', 'master', 'bathroom', 'study'].includes(s));
  for (const s of unknownSpaces) {
    gaps.push(`未识别的空间类型「${s}」，按 floor+wall+ceiling 默认展开`);
  }

  /* ----- Step② 配置模板匹配 -----
   * TODO(P2)：按风格从 cases.json 匹配同风格案例的空间/材料配置，
   * 命中 <2 个案例时回落 STYLE_DEFAULT_CONFIG 并在 data_gaps 标注 isDefault。
   * P1 骨架直接使用 STYLE_DEFAULT_CONFIG（isDefault=false，即内置默认模板）。 */
  const config = loadStyleConfig(styleId);
  if (!config) {
    throw new Error(`风格 ${styleId} 缺少默认配置（style_default_config.json）`);
  }
  const isDefault = false;
  if (isDefault) gaps.push(`${styleId} 风格案例不足，走默认配置`);
  for (const g of config.data_gaps) {
    gaps.push(`${config.label}配置缺数：${g}`);
  }

  /* ----- Step③ 工序展开（含前置工序） ----- */
  const spaceAreas = allocateArea(input.area, input.spaces);
  const lines: ExpandedLine[] = [];
  for (const space of Object.keys(spaceAreas)) {
    lines.push(...expandSpace(space, spaceAreas[space], config.elements, gaps));
  }

  /* ----- Step④ 人工选择 + Step⑤ 单项计算 ----- */
  const items: ProcessEstimate[] = [];
  const crewDays = new Map<string, number>(); // labor id → 总工日
  let totalDays = 0;

  const addCrew = (labor: string, days: number) => {
    crewDays.set(labor, (crewDays.get(labor) ?? 0) + days);
    totalDays += days;
  };

  for (const line of lines) {
    const process = getProcess(line.process);
    if (!process) {
      gaps.push(`工艺节点 ${line.process} 在 KG 快照中缺失，跳过计价`);
      continue;
    }

    // Step④：config 指定 labor 优先；否则走 rules.ts 硬规则
    const laborId = line.elementCfg?.labor ?? selectLaborByRules(
      line.elementCfg ?? { material: null, sku: null, process: line.process, labor: null, note: '' },
      process.difficulty
    );
    const labor = getLabor(laborId);

    // Step⑤ 材料费：SKU 唯一事实源
    const sku = findSku(line.elementCfg?.sku ?? null);
    let materialCost = 0;
    if (line.elementCfg?.sku) {
      if (sku && sku.price_idr !== null) {
        materialCost = Math.round(sku.price_idr * line.qty * (sku.waste_factor ?? 1));
      } else {
        gaps.push(`SKU ${line.elementCfg.sku} 未在 materials.json 命中或缺 price_idr，材料费按 0 计`);
      }
    } else if (line.elementCfg) {
      gaps.push(`${line.element} 元素无材料 SKU（${line.elementCfg.note}），材料费按 0 计`);
    }

    // Step⑤ 人工费与工期：KG 工时定额唯一事实源
    const wh = getWorkhour(line.process, laborId);
    let days = 0;
    let laborCost = 0;
    if (!wh) {
      // KG 无该 (工艺, 人工) 工时节点（如艺术漆、微水泥尚未建工时定额）
      gaps.push(`${line.process} × ${laborId} 无 KG 工时定额，人工费与工期按 0 计（待补录）`);
    } else if (wh.na || wh.value === null) {
      gaps.push(`${line.process} 严禁派 ${laborId}（KG 业务结论），需调整人工选择规则`);
    } else {
      days = (wh.value * line.qty) / HOURS_PER_DAY;
      const rateMid = labor?.daily_rate?.mid ?? wh.daily_rate_ref?.mid ?? 0;
      if (!labor?.daily_rate) gaps.push(`${laborId} 日薪缺失，按工时节点日薪参考计`);
      laborCost = Math.round(days * rateMid);
      if (wh.status !== 'verified') {
        gaps.push(`${line.process}（${laborId}）工时未校对（status: ${wh.status}）`);
      }
      addCrew(laborId, days);
    }
    if (labor && labor.status !== 'verified') {
      gaps.push(`${laborId} 日薪未校对（status: ${labor.status}）`);
    }

    // Step⑤ 普工辅助：仅大板/防水/贴砖类计入
    let auxCost = 0;
    if (AUX_PROCESSES.has(line.process) && days > 0) {
      const general = getLabor(GENERAL_LABOR_ID);
      const auxDays = days * AUX_RATIO;
      auxCost = Math.round(auxDays * (general?.daily_rate?.mid ?? 0));
      addCrew(GENERAL_LABOR_ID, auxDays);
    }

    items.push({
      space: line.space,
      element: line.element,
      process: line.process,
      sku_id: line.elementCfg?.sku ?? null,
      qty: round1(line.qty),
      unit: wh?.unit ?? '㎡',
      material_cost_idr: materialCost,
      labor_cost_idr: laborCost,
      aux_cost_idr: auxCost,
      days: round1(days),
      crew: laborId,
      note: line.note,
    });
  }

  /* ----- Step⑥ 汇总与系数 ----- */
  const regionFactor = REGION_FACTOR[input.location];
  if (regionFactor === undefined) {
    gaps.push(`区域「${input.location}」无系数配置，按 1.0 计`);
  }
  const subtotal = items.reduce(
    (s, it) => s + it.material_cost_idr + it.labor_cost_idr + it.aux_cost_idr,
    0
  );
  const totalMid = subtotal * (regionFactor ?? 1.0);
  const total = range3(totalMid);
  const perSqm = range3(totalMid / input.area);

  const ramadanFactor = input.ramadan ? RAMADAN_FACTOR : 1.0;
  const likely = totalDays * PARALLEL_FACTOR * ramadanFactor;
  const timeline = {
    min: round1(likely * RANGE_LOW),
    likely: round1(likely),
    max: round1(likely * RANGE_HIGH),
  };

  const crewPlan: CrewPlan[] = [...crewDays.entries()]
    .map(([labor, d]) => ({
      labor,
      name_zh: getLabor(labor)?.name?.zh ?? labor,
      days: round1(d),
    }))
    .sort((a, b) => b.days - a.days);

  return {
    total_idr: total,
    per_sqm_idr: perSqm,
    breakdown: items,
    timeline_days: timeline,
    crew_plan: crewPlan,
    // data_gaps 去重后非空即 low（P1 阶段数据大量为 draft）
    data_gaps: [...new Set(gaps)],
    confidence: gaps.length > 0 ? 'low' : 'medium',
  };
}

/* ================= KG 数据访问层 =================
 *
 * 两个 json 均为【快照自 KG 仓库 Nusantara-KG-MCP-Server】：
 *   - data/kg_estimate.json         由 KG 仓库 scripts/export_estimate_data.py 生成
 *   - data/style_default_config.json 事实源同路径同名文件
 * 同步方式为【手动复制】，事实源在 Nusantara-KG-MCP-Server；
 * 修改请改 KG 仓库后重新导出 + 复制，勿在本仓库直接改这两个 json。
 */
import kgData from '../../../../data/kg_estimate.json';
import styleConfigData from '../../../../data/style_default_config.json';

/* ---------- KG 快照类型（与 export_estimate_data.py 输出对齐） ---------- */

export interface KGRelation {
  type: string;
  target: string;
}

export interface KGProcess {
  id: string;
  name: { en?: string; zh?: string };
  status: string;
  relations: KGRelation[];
  /** 难度等级（KG 暂无此字段，导出为 null，预留 Step④ 规则） */
  difficulty: number | null;
  /** 正文中解析出的工序步骤数 */
  steps: number;
}

export interface KGDailyRate {
  low: number;
  high: number;
  mid: number;
}

export interface KGLabor {
  id: string;
  name: { en?: string; zh?: string };
  status: string;
  daily_rate: KGDailyRate | null;
}

export interface KGWorkhour {
  id: string;
  process: string;
  labor: string;
  /** 单位工时数值（工时/unit）；na=true 时为 null（该工艺严禁此级人工上手） */
  value: number | null;
  unit: string | null;
  na: boolean;
  daily_rate_ref: KGDailyRate | null;
  status: string;
}

/* ---------- 风格默认配置类型（与 style_default_config.json 对齐） ---------- */

export interface StyleElement {
  /** KG 材料节点 id */
  material: string | null;
  /** Atelier materials.json 的 sku_id */
  sku: string | null;
  /** KG 工艺节点 id */
  process: string | null;
  /** KG 人工节点 id（指定时优先于 rules.ts 硬规则） */
  labor: string | null;
  note: string;
}

export interface StyleConfig {
  label: string;
  aliases: string[];
  case_count: number;
  elements: Record<string, StyleElement>;
  data_gaps: string[];
}

/* ---------- 快照数据（构建时打包，不依赖运行时 API，同 materials.ts 口径） ---------- */

const kg = kgData as unknown as {
  generated_at: string;
  processes: KGProcess[];
  labors: KGLabor[];
  workhours: KGWorkhour[];
};

/** 风格默认配置快照（P1 骨架的唯一配置来源；案例模板匹配见 quickEstimate.ts TODO） */
export const STYLE_DEFAULT_CONFIG = (
  styleConfigData as unknown as { styles: Record<string, StyleConfig> }
).styles;

/* ---------- 查询函数 ---------- */

/** 按 id 取工艺节点 */
export function getProcess(id: string): KGProcess | null {
  return kg.processes.find((p) => p.id === id) ?? null;
}

/** 按 id 取人工节点 */
export function getLabor(id: string): KGLabor | null {
  return kg.labors.find((l) => l.id === id) ?? null;
}

/**
 * 按 (工艺, 人工) 取工时定额。
 * 返回 null = KG 无此组合；返回项 na=true = 该工艺严禁此级人工上手（业务结论）。
 */
export function getWorkhour(processId: string, laborId: string): KGWorkhour | null {
  return (
    kg.workhours.find((w) => w.process === processId && w.labor === laborId) ?? null
  );
}

/** 加载某风格的默认配置；未命中返回 null */
export function loadStyleConfig(styleId: string): StyleConfig | null {
  return STYLE_DEFAULT_CONFIG[styleId] ?? null;
}

/**
 * 风格字符串 → 风格 id（容错映射： aliases + 风格 id 本身，拉丁字符大小写不敏感）。
 * 未命中返回 null，由调用方抛错并列出支持列表。
 */
export function normalizeStyle(style: string): string | null {
  const s = style.trim().toLowerCase();
  if (!s) return null;
  for (const [id, cfg] of Object.entries(STYLE_DEFAULT_CONFIG)) {
    if (id.toLowerCase() === s) return id;
    if (cfg.aliases.some((a) => a.trim().toLowerCase() === s)) return id;
  }
  return null;
}

/** 支持的风格列表（报错提示用：id + 全部别名） */
export function supportedStyles(): string[] {
  return Object.entries(STYLE_DEFAULT_CONFIG).map(
    ([id, cfg]) => `${cfg.label}（${[id, ...cfg.aliases].join(' / ')}）`
  );
}

/**
 * 工序前置关系：返回 processId 的全部强制前置工序 id。
 * KG relations 两种方向都识别：
 *   - X --mandatory_prerequisite_for--> P  ⇒ X 是 P 的前置
 *   - P --requires_process--> X            ⇒ X 是 P 的前置
 */
export function prerequisitesOf(processId: string): string[] {
  const out: string[] = [];
  for (const p of kg.processes) {
    for (const r of p.relations) {
      if (r.type === 'mandatory_prerequisite_for' && r.target === processId) {
        out.push(p.id);
      }
      if (p.id === processId && r.type === 'requires_process') {
        out.push(r.target);
      }
    }
  }
  return [...new Set(out)];
}

export type RoomType =
  | 'living'
  | 'dining'
  | 'kitchen'
  | 'bedroom'
  | 'kids_room'
  | 'bathroom'
  | 'study'
  | 'tea_room'
  | 'recreation'
  | 'staircase'
  | 'bar'
  | 'plan';

export interface RoomAnnotation {
  room: RoomType;
  desc: { zh: string; en: string; id: string };
}

export interface ProjectCase {
  id: string;
  project_name: string;
  location: string | null;
  country: string;
  style: string;
  area: number | null;
  hard_cost_per_sqm: number | null;
  soft_cost_per_sqm: number | null;
  images: string[];
  tags: string[];
  description: string;
  source: string;
  /** 房间级标注（MMIS 风格），按图片文件名索引；可选，向后兼容 */
  annotations?: Record<string, RoomAnnotation>;
}

/** 风格筛选项。「更多」对应数据中 style === '待补充' 的案例 */
export const STYLES = [
  '全部',
  '法式',
  '现代',
  '侘寂',
  '意式极简',
  '现代奶油',
  '法式轻奢',
  '现代小法',
  '更多',
] as const;

export type StyleFilter = (typeof STYLES)[number];

/** style 数据值：已核定的风格 + 待补充（新案例元数据未确认时使用） */
export const STYLE_PENDING = '待补充';

/* ---------- Phase 3a：材料 SKU 库 ---------- */

export type MaterialTier = 'standard' | 'luxury' | 'ultra';

export interface Material {
  sku_id: string;
  /** 中文大类（石材/瓷砖/…，与 style 同口径），展示经 i18n 映射 */
  category: string;
  subcategory: string | null;
  name_id: string;
  name_en: string | null;
  name_zh: string | null;
  brand: string | null;
  spec: string | null;
  unit: string | null;
  price_idr: number | null;
  price_usd: number | null;
  price_rmb: number | null;
  supplier: string | null;
  region: string;
  tier: MaterialTier;
  labor_rate_idr: number | null;
  waste_factor: number | null;
  updated_at: string | null;
  source: string | null;
}

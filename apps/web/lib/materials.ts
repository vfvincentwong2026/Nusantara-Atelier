import rawData from '../../../data/materials.json';
import type { Material } from './types';

/** 印尼本地材料 SKU 库（Phase 3a，构建时打包，不依赖运行时 API） */
export const materials: Material[] = (rawData as unknown as { materials: Material[] }).materials;

/** 大类列表（按数据首见顺序） */
export const MATERIAL_CATEGORIES: string[] = [
  ...new Set(materials.map((m) => m.category)),
];

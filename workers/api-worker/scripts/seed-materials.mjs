/**
 * 从 data/materials.json 生成 D1 seed SQL（materials 表 v2，Phase 3a）。
 * 用法：node scripts/seed-materials.mjs  → 生成 scripts/out/seed-materials.sql
 * 然后：wrangler d1 execute nusantara-db --remote --file=./scripts/out/seed-materials.sql
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const data = JSON.parse(readFileSync(join(repoRoot, 'data', 'materials.json'), 'utf-8'));

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replaceAll("'", "''")}'`;
}

const COLS =
  'sku_id, category, subcategory, name_id, name_en, name_zh, brand, spec, unit, ' +
  'price_idr, price_usd, price_rmb, supplier, region, tier, labor_rate_idr, waste_factor, updated_at, source';

const rows = data.materials.map(
  (m) =>
    `INSERT OR REPLACE INTO materials (${COLS})\nVALUES (${esc(m.sku_id)}, ${esc(m.category)}, ${esc(m.subcategory)}, ${esc(m.name_id)}, ${esc(m.name_en)}, ${esc(m.name_zh)}, ${esc(m.brand)}, ${esc(m.spec)}, ${esc(m.unit)}, ${esc(m.price_idr)}, ${esc(m.price_usd)}, ${esc(m.price_rmb)}, ${esc(m.supplier)}, ${esc(m.region)}, ${esc(m.tier)}, ${esc(m.labor_rate_idr)}, ${esc(m.waste_factor)}, ${esc(m.updated_at)}, ${esc(m.source)});`
);

const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'seed-materials.sql');
writeFileSync(outFile, rows.join('\n') + '\n', 'utf-8');
console.log(`wrote ${rows.length} INSERTs → ${outFile}`);

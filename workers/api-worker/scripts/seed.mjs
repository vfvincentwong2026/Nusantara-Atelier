/**
 * 从 data/cases.json 生成 D1 seed SQL（cases 25 行）。
 * 用法：node scripts/seed.mjs  → 生成 scripts/out/seed-cases.sql
 * 然后：wrangler d1 execute nusantara-db --remote --file=./scripts/out/seed-cases.sql
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const data = JSON.parse(readFileSync(join(repoRoot, 'data', 'cases.json'), 'utf-8'));

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replaceAll("'", "''")}'`;
}

const rows = data.cases.map((c) => {
  return `INSERT OR REPLACE INTO cases (case_id, project_name, location, country, style, area, hard_cost_per_sqm, soft_cost_per_sqm, images, tags, annotations, description, source)
VALUES (${esc(c.id)}, ${esc(c.project_name)}, ${esc(c.location)}, ${esc(c.country)}, ${esc(c.style)}, ${esc(c.area)}, ${esc(c.hard_cost_per_sqm)}, ${esc(c.soft_cost_per_sqm)}, ${esc(JSON.stringify(c.images ?? []))}, ${esc(JSON.stringify(c.tags ?? []))}, ${c.annotations ? esc(JSON.stringify(c.annotations)) : 'NULL'}, ${esc(c.description)}, ${esc(c.source)});`;
});

const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'seed-cases.sql');
writeFileSync(outFile, rows.join('\n') + '\n', 'utf-8');
console.log(`wrote ${rows.length} INSERTs → ${outFile}`);

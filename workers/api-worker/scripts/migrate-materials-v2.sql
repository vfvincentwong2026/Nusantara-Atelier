-- Phase 3a 迁移：materials 表 v2（旧表为空，DROP 后重建）
-- 执行：wrangler d1 execute nusantara-db --remote --file=./scripts/migrate-materials-v2.sql
DROP TABLE IF EXISTS materials;
CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  name_id TEXT NOT NULL,
  name_en TEXT,
  name_zh TEXT,
  brand TEXT,
  spec TEXT,
  unit TEXT,
  price_idr INTEGER,
  price_usd INTEGER,
  price_rmb INTEGER,
  supplier TEXT,
  region TEXT DEFAULT 'jakarta',
  tier TEXT,
  labor_rate_idr INTEGER,
  waste_factor REAL,
  updated_at TEXT,
  source TEXT
);

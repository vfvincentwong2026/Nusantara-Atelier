-- Nusantara Atelier — D1 数据库 schema（后端 v1）
-- 以 docs/DEPLOYMENT.md 草稿为基础，扩展 quotes/bookings，cases 增加 case_id 与 annotations。

-- 案例库表
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT UNIQUE NOT NULL,        -- cases.json 原始 id，如 case_001
  project_name TEXT NOT NULL,
  location TEXT,
  country TEXT DEFAULT '中国',
  style TEXT NOT NULL,
  area INTEGER,
  hard_cost_per_sqm INTEGER,
  soft_cost_per_sqm INTEGER,
  images TEXT,                         -- JSON 数组
  tags TEXT,                           -- JSON 数组
  annotations TEXT,                    -- JSON 对象（房间级标注，可选）
  description TEXT,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 材料价格表
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  unit TEXT,
  price_idr INTEGER,
  price_usd INTEGER,
  supplier TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 报价记录表
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id TEXT UNIQUE NOT NULL,
  lead_id TEXT,
  area INTEGER NOT NULL,
  style TEXT NOT NULL,
  tier TEXT NOT NULL,
  location TEXT,
  locale TEXT,
  total_usd INTEGER,
  total_idr INTEGER,
  total_rmb INTEGER,
  breakdown TEXT,                      -- JSON 对象
  reference_case_id TEXT,              -- 关联 cases.case_id
  payload TEXT,                        -- 完整请求 JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 预约线索表
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  location TEXT,
  area INTEGER,
  style TEXT,
  message TEXT,
  locale TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

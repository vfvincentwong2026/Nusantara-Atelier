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

-- 材料价格表（v2，Phase 3a：BOM 报价 SKU 库）
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku_id TEXT UNIQUE NOT NULL,           -- 唯一编码，如 STONE-MARBLE-001
  category TEXT NOT NULL,                -- 大类（中文，与 style 同口径）：石材/瓷砖/…
  subcategory TEXT,                      -- 子类
  name_id TEXT NOT NULL,                 -- 印尼语名称（主展示）
  name_en TEXT,
  name_zh TEXT,
  brand TEXT,
  spec TEXT,                             -- 规格，如 600×1200mm
  unit TEXT,                             -- 计价单位：㎡ / m / 件 / 套
  price_idr INTEGER,                     -- 印尼本地含税单价（主）
  price_usd INTEGER,
  price_rmb INTEGER,
  supplier TEXT,
  region TEXT DEFAULT 'jakarta',         -- jakarta/bali/surabaya/national
  tier TEXT,                             -- standard / luxury / ultra
  labor_rate_idr INTEGER,                -- 安装人工单价（占位，待标定）
  waste_factor REAL,                     -- 损耗系数（石材 1.12 / 瓷砖 1.08 / 涂料 1.05…）
  updated_at TEXT,
  source TEXT                            -- 价格来源（公开零售参考价 + 参考来源名）
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

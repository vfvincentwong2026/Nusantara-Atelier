# Nusantara Atelier — 技术架构

## 🏗️ 总体架构
┌─────────────────────────────────────────────────────────────────┐
│ 用户层 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Next.js 14 (Cloudflare Pages) │ │
│ │ 首页展示 → 上传图纸 → AI设计 → 3D预览 → 报价 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ API 层 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Pages │ │ Workers │ │ Workers │ │
│ │ Functions │→ │ (AI Worker) │ │ (CAD Worker) │ │
│ │ (Next.js │ │ Python/JS │ │ Python/ │ │
│ │ API Routes) │ │ │ │ ezdxf │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ 数据层 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Cloudflare │ │ Cloudflare │ │ Cloudflare │ │
│ │ D1 │ │ R2 │ │ Workers AI │ │
│ │ (SQLite) │ │ (文件存储) │ │ (AI 推理) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘

text

---

## 🧩 服务详解

### 1. Cloudflare Pages — 前端 + API

**职责**：
- 托管 Next.js 应用（SSR/ISR/静态）
- Pages Functions 提供轻量级 API
- 与 Workers 通过 Service Binding 通信

**配置** (`wrangler.toml`)：
```toml
[pages]
  build_command = "npm run build"
  output_dir = "dist"

[build.environment]
  NODE_VERSION = "20"
2. Cloudflare Workers — 重型后端任务
AI Worker (ai-worker)
职责：

调用 LLM（通过 Workers AI / AI Gateway）

生成设计方案

匹配案例库

输出物料清单

代码入口 (workers/ai-worker/src/index.js)：

javascript
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/design') {
      // 调用 AI 生成设计方案
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [...]
      });
      return Response.json(response);
    }

    if (pathname === '/api/quote') {
      // 从 D1 读取案例数据 + 计算报价
      const { results } = await env.DB.prepare(
        'SELECT * FROM cases WHERE style = ? AND area BETWEEN ? AND ?'
      ).bind(style, area * 0.8, area * 1.2).all();
      // 计算报价...
      return Response.json(quote);
    }
  }
};
CAD Worker (cad-worker) — Python
职责：

解析 DXF/DWG 图纸

提取房间尺寸、门窗位置

输出结构化数据

代码入口 (workers/cad-worker/src/main.py)：

python
from ezdxf import readfile
from pyodide.ffi import to_js

async def on_fetch(request, env):
    # 解析上传的 DXF 文件
    doc = readfile(request.file)
    modelspace = doc.modelspace()
    
    # 提取房间边界
    rooms = []
    for entity in modelspace.query('LWPOLYLINE'):
        if entity.dxf.layer == 'ROOM':
            rooms.append({
                'name': entity.dxf.layer,
                'points': entity.get_points()
            })
    
    return Response.json(to_js({
        'rooms': rooms,
        'area': calculate_area(rooms)
    }))
3. Cloudflare D1 — 数据库
数据表设计：

sql
-- 案例库表
CREATE TABLE cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  style TEXT NOT NULL,
  area INTEGER NOT NULL,
  hard_cost_per_sqm INTEGER,
  soft_cost_per_sqm INTEGER,
  images TEXT,  -- JSON 数组
  tags TEXT,    -- JSON 数组
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 材料价格表
CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,   -- 石材/木材/卫浴/涂料
  name TEXT NOT NULL,
  brand TEXT,
  unit TEXT,
  price_idr INTEGER,
  price_usd INTEGER,
  supplier TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 报价记录表
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT,
  area INTEGER NOT NULL,
  style TEXT NOT NULL,
  tier TEXT NOT NULL,       -- Standard/Luxury/Ultra-Luxury
  total_usd INTEGER,
  total_idr INTEGER,
  breakdown TEXT,           -- JSON
  case_id INTEGER,          -- 关联参考案例
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
4. Cloudflare R2 — 文件存储
存储结构：

text
nusantara-atelier/
├── cases/                    # 案例图片
│   ├── 杭州-汀岸晓庐/
│   │   ├── 01.jpg
│   │   └── 02.jpg
│   └── 东莞-万科璞舍/
│       ├── 01.jpg
│       └── 02.jpg
├── uploads/                  # 客户上传文件
│   ├── {lead_id}/
│   │   ├── floorplan.dxf
│   │   └── photos/
│   └── ...
├── models/                   # 3D 模型
│   └── furniture/
└── exports/                  # 导出的 PDF
    └── {quote_id}.pdf
5. Cloudflare Workers AI — AI 推理
使用示例：

javascript
// 调用 Workers AI 生成设计方案
const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [
    { role: 'system', content: '你是豪宅设计专家，擅长匹配真实案例...' },
    { role: 'user', content: `客户面积${area}㎡，偏好${style}风格，请推荐设计方案` }
  ]
});
备选模型（通过 AI Gateway 统一管理）：

@cf/meta/llama-3-8b-instruct

@cf/mistral/mistral-7b-instruct-v0.1

@hf/thebloke/deepseek-coder-6.7b-instruct-awq

🔐 安全与权限
资源	访问方式
D1	仅 Workers / Pages Functions 可访问（Binding）
R2	前端通过预签名 URL 直传
Workers AI	仅 Workers 可访问（Binding）
📦 本地开发
bash
# 1. 安装依赖
pnpm install

# 2. 启动 D1 本地数据库
npx wrangler d1 execute nusantara-db --local --file=./schema.sql

# 3. 启动 Workers 本地开发
npx wrangler dev --port 8787

# 4. 启动 Next.js 开发服务器
cd apps/web
pnpm dev
🚀 部署
bash
# 1. 构建 Next.js
cd apps/web
npx @cloudflare/next-on-pages@1

# 2. 部署到 Pages
npx wrangler pages deploy

# 3. 部署 Workers
cd workers/ai-worker
npx wrangler deploy

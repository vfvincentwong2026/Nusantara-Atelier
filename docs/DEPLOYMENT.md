# Nusantara Atelier — 部署指南

## 中文

本文档详细说明如何将 Nusantara Atelier 部署到 Cloudflare 生产环境。

---

## 📋 前置条件

| 要求 | 说明 |
|------|------|
| Cloudflare 账号 | 需要绑定支付方式（免费额度足够起步） |
| Node.js 20+ | 本地开发环境 |
| pnpm 9+ | 包管理器 |
| Python 3.11+ | CAD Worker 依赖 |
| wrangler CLI | Cloudflare 命令行工具 |

---

## 第一步：安装 wrangler

```bash
# 全局安装
npm install -g wrangler

# 登录 Cloudflare
wrangler login
第二步：创建 D1 数据库
bash
# 创建生产数据库
wrangler d1 create nusantara-db-production

# 创建开发数据库（本地）
wrangler d1 create nusantara-db-dev --local

# 执行迁移
wrangler d1 execute nusantara-db-production --file=./schema.sql --remote
schema.sql 内容：

sql
-- 案例库表
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT DEFAULT '中国',
  style TEXT NOT NULL,
  area INTEGER,
  hard_cost_per_sqm INTEGER,
  soft_cost_per_sqm INTEGER,
  images TEXT,
  tags TEXT,
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
  lead_id TEXT,
  area INTEGER NOT NULL,
  style TEXT NOT NULL,
  tier TEXT NOT NULL,
  total_usd INTEGER,
  total_idr INTEGER,
  breakdown TEXT,
  case_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
第三步：创建 R2 存储桶
bash
# 创建存储桶
wrangler r2 bucket create nusantara-assets

# 设置 CORS（允许前端直传）
wrangler r2 bucket cors set nusantara-assets --rules '[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]'
第四步：配置 wrangler.toml
在项目根目录创建 wrangler.toml：

toml
name = "nusantara-atelier"
compatibility_date = "2026-08-25"
main = "workers/ai-worker/src/index.js"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "nusantara-db-production"
database_id = "你的-D1-ID"

# R2 存储绑定
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "nusantara-assets"

# Workers AI 绑定
[[ai]]
binding = "AI"

# 环境变量
[vars]
ENVIRONMENT = "production"
第五步：部署 Workers
bash
# 部署 AI Worker
cd workers/ai-worker
wrangler deploy --name nusantara-ai-worker

# 部署 CAD Worker (Python)
cd workers/cad-worker
wrangler deploy --name nusantara-cad-worker
第六步：部署前端到 Pages
bash
# 进入前端目录
cd apps/web

# 安装依赖（如果还没安装）
pnpm install

# 构建
pnpm build

# 使用 next-on-pages 适配
npx @cloudflare/next-on-pages@1

# 部署到 Pages
npx wrangler pages deploy --project-name nusantara-atelier
第七步：配置自定义域名
bash
# 在 Cloudflare Pages 项目中绑定域名
npx wrangler pages project create nusantara-atelier --production-branch main
npx wrangler pages domain add nusantara-atelier yourdomain.com
🔐 环境变量配置
在 Cloudflare Pages 项目设置中添加：

变量名	说明
NEXT_PUBLIC_WORKER_URL	AI Worker 地址
NEXT_PUBLIC_R2_PUBLIC_URL	R2 公开访问地址
OPENAI_API_KEY	OpenAI API Key（备用）
ANTHROPIC_API_KEY	Anthropic API Key（备用）
✅ 验证部署
服务	验证方式
Pages	访问 https://nusantara-atelier.pages.dev
AI Worker	curl https://nusantara-ai-worker.workers.dev/health
CAD Worker	curl https://nusantara-cad-worker.workers.dev/health
D1	wrangler d1 execute nusantara-db-production --command="SELECT COUNT(*) FROM cases" --remote
🔄 持续部署（CI/CD）
创建 .github/workflows/deploy.yml：

yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: cd apps/web && pnpm build
      - run: npx wrangler pages deploy --project-name nusantara-atelier
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-workers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd workers/ai-worker && wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
🐛 常见问题
Q: Pages 部署失败，提示 "Could not find @cloudflare/next-on-pages"
bash
pnpm add -D @cloudflare/next-on-pages
Q: D1 连接失败
检查 wrangler.toml 中的 database_id 是否正确。

Q: R2 上传失败
检查 CORS 配置和 R2 公开访问权限。

📞 需要帮助？
提交 GitHub Issue

联系维护者

English
本部署指南的英文版本即将上线。如有问题，请提交 Issue。

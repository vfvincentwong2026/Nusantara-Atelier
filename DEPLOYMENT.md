## 4. `DEPLOYMENT.md` — 部署指南

```markdown
# Nusantara Atelier — 部署指南

## 前置条件

- Cloudflare 账号
- Node.js 20+
- pnpm 9+
- Python 3.11+（用于 CAD Worker）
- wrangler CLI

---

## 第一步：安装 wrangler

```bash
npm install -g wrangler
wrangler login
第二步：创建 D1 数据库
bash
# 创建数据库
wrangler d1 create nusantara-db

# 运行迁移
wrangler d1 execute nusantara-db --file=./schema.sql

# 导入案例数据
wrangler d1 execute nusantara-db --file=./data/seed.sql
第三步：创建 R2 存储桶
bash
wrangler r2 bucket create nusantara-assets
第四步：配置 wrangler.toml
toml
name = "nusantara-atelier"
compatibility_date = "2026-08-25"

[[d1_databases]]
binding = "DB"
database_name = "nusantara-db"
database_id = "你的-D1-ID"

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "nusantara-assets"

[[ai]]
binding = "AI"
第五步：部署 Workers
bash
# 部署 AI Worker
cd workers/ai-worker
wrangler deploy

# 部署 CAD Worker (Python)
cd workers/cad-worker
wrangler deploy
第六步：部署前端
bash
# 构建
cd apps/web
pnpm build

# 使用 next-on-pages 适配
npx @cloudflare/next-on-pages@1

# 部署到 Pages
npx wrangler pages deploy
环境变量
前端 (.env)
env
NEXT_PUBLIC_WORKER_URL=https://ai-worker.你的域名.workers.dev
NEXT_PUBLIC_R2_PUBLIC_URL=https://你的存储桶.r2.cloudflarestorage.com
Workers (.env)
env
OPENAI_API_KEY=xxx  # 备用
ANTHROPIC_API_KEY=xxx  # 备用
验证部署
服务	验证方式
Pages	访问 https://你的项目.pages.dev
Workers	访问 https://ai-worker.你的域名.workers.dev/health
D1	wrangler d1 execute nusantara-db --command="SELECT COUNT(*) FROM cases"
R2	wrangler r2 object get nusantara-assets/test.txt

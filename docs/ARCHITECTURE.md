# Nusantara Atelier — 技术架构

## 🏗️ 总体架构
┌─────────────────────────────────────────────────────────────────────┐
│ 用户层 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Next.js 14 (Cloudflare Pages) │ │
│ │ 首页展示 → 上传图纸 → AI设计 → 3D预览 → 报价 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ API 层 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Pages │ │ Workers │ │ Workers │ │
│ │ Functions │→ │ (AI Worker) │ │ (CAD Worker) │ │
│ │ (Next.js │ │ Python/JS │ │ Python/ │ │
│ │ API Routes) │ │ │ │ ezdxf │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 数据层 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Cloudflare │ │ Cloudflare │ │ Cloudflare │ │
│ │ D1 │ │ R2 │ │ Workers AI │ │
│ │ (SQLite) │ │ (文件存储) │ │ (AI 推理) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

text


## 🧩 服务详解

### 1. Cloudflare Pages — 前端网站

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
2. Cloudflare Workers — 后端服务
AI Worker (workers/ai-worker/)
职责：

调用 LLM（通过 Workers AI / AI Gateway）

生成设计方案

匹配案例库

输出物料清单

核心代码：

javascript
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/design') {
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: '你是豪宅设计专家...' },
          { role: 'user', content: request.body }
        ]
      });
      return Response.json(response);
    }

    if (pathname === '/api/quote') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM cases WHERE style = ? AND area BETWEEN ? AND ?'
      ).bind(style, area * 0.8, area * 1.2).all();
      // 计算报价...
      return Response.json({ quote: calculateQuote(results) });
    }
  }
};
CAD Worker (workers/cad-worker/) — Python
职责：

解析 DXF/DWG 图纸

提取房间尺寸、门窗位置

输出结构化数据

核心代码：

python
from ezdxf import readfile

async def on_fetch(request, env):
    doc = readfile(request.file)
    modelspace = doc.modelspace()
    
    rooms = []
    for entity in modelspace.query('LWPOLYLINE'):
        if entity.dxf.layer == 'ROOM':
            rooms.append({
                'name': entity.dxf.layer,
                'points': entity.get_points()
            })
    
    return Response.json({
        'rooms': rooms,
        'area': calculate_area(rooms)
    })
3. Cloudflare D1 — 数据库
核心表：

表名	说明
cases	案例库（风格/面积/造价）
materials	材料价格（印尼本地）
quotes	报价记录
4. Cloudflare R2 — 文件存储
存储结构：

text
nusantara-atelier/
├── cases/              # 案例图片
├── uploads/            # 客户上传文件
├── models/             # 3D 模型
└── exports/            # 导出的 PDF
5. Cloudflare Workers AI — AI 推理
支持模型：

@cf/meta/llama-3-8b-instruct

@cf/mistral/mistral-7b-instruct-v0.1

@hf/thebloke/deepseek-coder-6.7b-instruct-awq

使用示例：

javascript
const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [
    { role: 'system', content: '你是豪宅设计专家...' },
    { role: 'user', content: `客户面积${area}㎡，偏好${style}风格` }
  ]
});
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
🔗 相关文档
API 文档

数据模型

部署指南

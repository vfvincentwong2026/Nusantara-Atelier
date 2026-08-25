# 贡献指南 · Contributing to Nusantara Atelier

中文 | [English](#english)

---

## 中文

感谢你对 Nusantara Atelier 的关注！我们欢迎任何形式的贡献。

### 🧑‍💻 开发环境

```bash
# 克隆项目
git clone https://github.com/vfvincentwong2026/Nusantara-Atelier.git
cd Nusantara-Atelier

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
cd apps/web
pnpm dev
📁 代码规范
语言	规范
TypeScript/JavaScript	ESLint + Prettier，遵循 Next.js 官方风格
Python	Black 格式化 + Ruff lint + 完整类型注解
📝 Git 提交规范
text
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式化
refactor: 重构代码
test: 添加测试
chore: 构建工具变动
🔄 提交 PR 流程
Fork 本仓库

创建分支 git checkout -b feature/your-feature

提交代码 git commit -m "feat: add your feature"

推送分支 git push origin feature/your-feature

创建 Pull Request

English
Thank you for your interest in Nusantara Atelier! We welcome all contributions.

Development Environment
bash
git clone https://github.com/vfvincentwong2026/Nusantara-Atelier.git
cd Nusantara-Atelier
pnpm install
cp .env.example .env
cd apps/web
pnpm dev
Code Standards
Language	Standards
TypeScript/JavaScript	ESLint + Prettier, Next.js style guide
Python	Black + Ruff + full type annotations
Commit Convention
text
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code refactoring
test: add tests
chore: build tool changes
PR Process
Fork the repository

Create branch git checkout -b feature/your-feature

Commit git commit -m "feat: add your feature"

Push git push origin feature/your-feature

Open a Pull Request

text

---

### 2. `docs/PROJECT_DESCRIPTION.md` — 项目详细介绍

```markdown
# Nusantara Atelier — 项目详细介绍

## 📖 项目背景

印尼豪宅市场正处于高速增长期，但设计施工行业长期存在三大痛点：

### 痛点一：设计周期长
- 优秀设计师排期 2-4 周
- 反复沟通、反复改稿
- 客户等待焦虑，流失率高

### 痛点二：报价不透明
- 手工算量，容易出错
- 多次询价，效率低下
- 中途加价，客户不信任

### 痛点三：案例看不到
- 只有效果图，没有真实落地参考
- 客户无法想象“我家会是什么样”
- 决策犹豫，转化率低

---

## 💎 解决方案

**Nusantara Atelier** 将中国成熟的豪宅设计经验与印尼本地市场深度结合，用 AI 技术让「设计 + 估价」从 4 周缩短到 30 分钟。

### 核心能力

| 能力 | 说明 |
|------|------|
| **真实案例库** | 拥有大量已落地豪宅案例（法式/现代/侘寂/意式极简），AI 推荐有据可依 |
| **AI 设计生成** | 上传户型图/照片，AI 自动生成 3D 设计方案 |
| **精确报价引擎** | 基于真实成交数据，自动算量 + 生成物料清单 + 预算 |
| **客户沉浸体验** | 3D 漫游，让客户提前“走进”自己的家 |

---

## 👥 目标用户

| 用户类型 | 需求 |
|----------|------|
| **印尼豪宅业主** | 快速获得设计方案和预算，做决策参考 |
| **开发商** | 为样板间/售楼处提供快速设计展示 |
| **设计师** | 提高提案效率，用 AI 辅助设计 |

---

## 📊 报价模型

基于案例库的真实成交数据，报价引擎按以下维度计算：
总价 = 面积 × 单方造价 × 风格系数 × 地区系数 × 档次系数

其中：

单方造价：来自案例库的真实数据

风格系数：法式 1.0 / 现代 0.9 / 侘寂 0.85 / 意式极简 0.95

地区系数：雅加达 1.0 / 巴厘岛 1.05 / 泗水 0.9

档次系数：标准 1.0 / 豪华 1.3 / 顶级 1.6

text

---

## 🏠 案例库概览

### ⑤号设计 — 法式/现代系列

| 项目名称 | 地点 | 风格 | 面积(㎡) |
|----------|------|------|----------|
| 汀岸晓庐 | 杭州 | 法式 | — |
| 曼陀花园 | 杭州 | 法式 | — |
| 香格里拉 | 杭州 | 现代 | 600 |
| 森山半岛 | 义乌 | 现代 | 1200 |
| 玺园 | 绍兴 | 法式轻奢 | — |
| 桃花源 | 义乌 | 法式 | 630 |
| 桃花源 | 义乌 | 侘寂 | 855 |
| 桃花源 | 义乌 | 侘寂 | 500 |
| 科尔世纪外滩 | 杭州 | 现代小法 | 200 |
| 绿谷云溪 | 义乌 | 侘寂 | 450 |
| 御香园 | 绍兴 | 现代奶油 | 780 |
| 皇庭水岸·顶有 | 莆田 | 意式极简 | 520 |
| 佳源珑府 | 桐乡 | 意式极简 | 430 |

### 派尚设计 — 别墅系列

| 项目名称 | 地点 | 面积(㎡) | 硬装(元/㎡) | 软装(元/㎡) |
|----------|------|----------|-------------|-------------|
| 万科松山湖璞舍 | 东莞 | 1100 | 5500 | 4500 |
| 正弘悦云棠 | 郑州 | 207 | 4500 | 4000 |
| 长沙叠墅 | 长沙 | 280 | 4500 | 4000 |
| 华润鹭栖湖 | 嘉兴 | 230 | — | — |
| 广州中建御溪谷 | 广州 | 420 | — | — |

> 📌 完整案例数据见 [DATA_MODEL.md](DATA_MODEL.md)
3. docs/ARCHITECTURE.md — 技术架构文档
markdown
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

---

## 🧩 服务详解

### 1. Cloudflare Pages — 前端网站

**职责**：
- 托管 Next.js 应用（SSR/ISR/静态）
- Pages Functions 提供轻量级 API
- 与 Workers 通过 Service Binding 通信

### 2. Cloudflare Workers — 后端服务

#### AI Worker (`workers/ai-worker/`)
- 调用 LLM 生成设计方案
- 匹配案例库
- 输出物料清单

#### CAD Worker (`workers/cad-worker/`) — Python
- 解析 DXF/DWG 图纸
- 提取房间尺寸、门窗位置
- 输出结构化数据

### 3. Cloudflare D1 — 数据库

**核心表**：
- `cases` — 案例库
- `materials` — 材料价格
- `quotes` — 报价记录

### 4. Cloudflare R2 — 文件存储
nusantara-atelier/
├── cases/ # 案例图片
├── uploads/ # 客户上传文件
├── models/ # 3D 模型
└── exports/ # 导出的 PDF

text

### 5. Cloudflare Workers AI — AI 推理

```javascript
// 调用示例
const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [
    { role: 'system', content: '你是豪宅设计专家...' },
    { role: 'user', content: `客户面积${area}㎡，偏好${style}风格` }
  ]
});
text

---

### 4. `docs/DATA_MODEL.md` — 数据模型

```markdown
# Nusantara Atelier — 数据模型

## 📊 核心数据结构

### 案例 (Case)

```typescript
interface Case {
  id: string;
  project_name: string;
  location: string;
  country: string;
  style: '法式' | '现代' | '侘寂' | '意式极简' | '现代奶油' | '法式轻奢';
  area: number | null;
  hard_cost_per_sqm: number | null;
  soft_cost_per_sqm: number | null;
  images: string[];
  tags: string[];
  description: string;
  source: '⑤号设计' | '派尚设计';
}
报价请求 (QuoteRequest)
typescript
interface QuoteRequest {
  area: number;
  style: string;
  tier: 'standard' | 'luxury' | 'ultra-luxury';
  location: string;
  rooms: number;
  floors: number;
  has_pool: boolean;
  has_garden: boolean;
}
报价结果 (QuoteResult)
typescript
interface QuoteResult {
  total_usd: number;
  total_idr: number;
  breakdown: {
    structure: number;
    finishing: number;
    mep: number;
    landscape: number;
    furniture: number;
    design_fee: number;
    contingency: number;
  };
  material_list: MaterialItem[];
  reference_case: Case;
  generated_at: Date;
}
📁 完整案例库 JSON
json
{
  "cases": [
    {
      "id": "case_001",
      "project_name": "汀岸晓庐",
      "location": "杭州",
      "country": "中国",
      "style": "法式",
      "area": null,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["法式", "杭州"],
      "source": "⑤号设计"
    }
    // ... 完整列表见附录
  ]
}
📌 完整案例数据（18个项目）已整理，详见仓库 /data/cases.json

text

---

### 5. `docs/API.md` — API 接口文档

```markdown
# Nusantara Atelier — API 文档

## 基础信息

- **Base URL:** `https://api.nusantara-atelier.com/v1`
- **格式:** JSON
- **认证:** 暂不需要（MVP 阶段）

---

## 接口列表

### 1. 上传文件
POST /upload

text

**请求参数** (multipart/form-data):

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | 户型图/照片 (JPG/PNG/PDF/DXF) |

**响应示例**:

```json
{
  "success": true,
  "file_id": "file_001",
  "url": "https://r2.../uploads/file_001.jpg"
}
2. AI 设计生成
text
POST /design
请求参数 (JSON):

json
{
  "file_id": "file_001",
  "style": "法式",
  "area": 600,
  "rooms": 5,
  "floors": 2
}
响应示例:

json
{
  "success": true,
  "design_id": "design_001",
  "case_matched": {
    "project_name": "汀岸晓庐",
    "style": "法式",
    "images": ["..."]
  },
  "materials": [
    { "category": "石材", "name": "大理石", "quantity": 120, "unit": "㎡" }
  ]
}
3. 报价生成
text
POST /quote
请求参数 (JSON):

json
{
  "design_id": "design_001",
  "area": 600,
  "style": "法式",
  "tier": "luxury",
  "location": "Jakarta"
}
响应示例:

json
{
  "success": true,
  "quote": {
    "total_usd": 480000,
    "total_idr": 7200000000,
    "breakdown": {
      "structure": 120000,
      "finishing": 180000,
      "mep": 60000,
      "landscape": 40000,
      "furniture": 60000,
      "design_fee": 20000
    },
    "material_list": [...]
  }
}
text

---

### 6. `docs/CASES.md` — 案例展示页面（客户视角）

```markdown
# 我们的作品 · Our Projects

> 以下案例来自中国顶级豪宅项目，为印尼市场提供设计参考与品质标杆。

---

## 🏛️ 法式风格 · French Style

### 汀岸晓庐 · 杭州

| 项目信息 | |
|----------|---|
| 地点 | 杭州，中国 |
| 风格 | 法式 |
| 设计 | ⑤号设计 |

> 对称布局、精美雕花、罗马柱、水晶吊灯

---

### 曼陀花园 · 杭州

| 项目信息 | |
|----------|---|
| 地点 | 杭州，中国 |
| 风格 | 法式 |
| 设计 | ⑤号设计 |

---

### 桃花源 · 义乌 · 630㎡

| 项目信息 | |
|----------|---|
| 地点 | 义乌，中国 |
| 风格 | 法式 |
| 面积 | 630㎡ |
| 设计 | ⑤号设计 |

---

## 🏙️ 现代风格 · Modern Style

### 香格里拉 · 杭州 · 600㎡

| 项目信息 | |
|----------|---|
| 地点 | 杭州，中国 |
| 风格 | 现代 |
| 面积 | 600㎡ |
| 设计 | ⑤号设计 |

---

### 森山半岛 · 义乌 · 1200㎡

| 项目信息 | |
|----------|---|
| 地点 | 义乌，中国 |
| 风格 | 现代 |
| 面积 | 1200㎡ |
| 设计 | ⑤号设计 |

---

### 万科松山湖璞舍 · 东莞 · 1100㎡

| 项目信息 | |
|----------|---|
| 地点 | 东莞，中国 |
| 风格 | 现代 |
| 面积 | 1100㎡ |
| 硬装造价 | 5500元/㎡ |
| 软装造价 | 4500元/㎡ |
| 设计 | 派尚设计 |

---

## 🍂 侘寂风格 · Wabi-Sabi

### 桃花源 · 义乌 · 855㎡

| 项目信息 | |
|----------|---|
| 地点 | 义乌，中国 |
| 风格 | 侘寂 |
| 面积 | 855㎡ |
| 设计 | ⑤号设计 |

---

### 绿谷云溪 · 义乌 · 450㎡

| 项目信息 | |
|----------|---|
| 地点 | 义乌，中国 |
| 风格 | 侘寂 |
| 面积 | 450㎡ |
| 设计 | ⑤号设计 |

---

## 🇮🇹 意式极简 · Italian Minimalist

### 皇庭水岸·顶有 · 莆田 · 520㎡

| 项目信息 | |
|----------|---|
| 地点 | 莆田，中国 |
| 风格 | 意式极简 |
| 面积 | 520㎡ |
| 设计 | ⑤号设计 |

---

### 佳源珑府 · 桐乡 · 430㎡

| 项目信息 | |
|----------|---|
| 地点 | 桐乡，中国 |
| 风格 | 意式极简 |
| 面积 | 430㎡ |
| 设计 | ⑤号设计 |

---

> 📌 更多案例持续更新中...
7. docs/FAQ.md — 常见问题
markdown
# 常见问题 · FAQ

## 中文

### Q1: 这个网站是做什么的？
Nusantara Atelier 是一个 AI 驱动的印尼豪宅设计网站。客户上传户型图或照片，系统自动生成设计方案、物料清单和报价预算。

### Q2: 需要注册才能使用吗？
不需要。客户直接打开网站即可使用，无需注册。

### Q3: 支持哪些文件格式？
支持 JPG、PNG、PDF、DXF 格式。

### Q4: 报价准确吗？
我们的报价基于真实成交的案例数据（单方造价 × 面积），并考虑了风格、地区、档次等系数，具有较高的参考价值。

### Q5: 报价结果可以导出吗？
可以。支持导出为 PDF 格式，方便客户保存或分享。

### Q6: 你们在印尼有落地项目吗？
目前我们拥有丰富的中国豪宅案例库。印尼本地项目正在拓展中，欢迎咨询合作。

---

## English

### Q1: What does this website do?
Nusantara Atelier is an AI-powered luxury villa design website. Clients upload floor plans or photos, and the system automatically generates design proposals, material lists, and budget quotes.

### Q2: Do I need to register?
No. Clients can use the website directly without registration.

### Q3: What file formats are supported?
JPG, PNG, PDF, and DXF formats are supported.

### Q4: How accurate is the quote?
Our quotes are based on real transaction data (cost per sqm × area), adjusted for style, location, and tier, providing highly reliable estimates.

### Q5: Can I export the quote?
Yes. Supports PDF export for saving or sharing.

### Q6: Do you have projects in Indonesia?
We currently have a rich case library from China. Indonesian local projects are in development — feel free to inquire about partnerships.

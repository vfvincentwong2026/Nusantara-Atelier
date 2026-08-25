# Nusantara Atelier

<p align="center">
  <img src="https://via.placeholder.com/800x200/1a1a2e/C9A96E?text=Nusantara+Atelier" alt="Nusantara Atelier Banner" width="800"/>
</p>

<p align="center">
  <strong>印尼高端别墅「AI 设计 + 智能估价」一站式平台</strong>
</p>

<p align="center">
  从图纸到报价，从灵感到落地。<br>
  用 AI 重新定义豪宅设计施工的效率。
</p>

---

## 🎯 项目定位

Nusantara Atelier 是一个面向印尼高端别墅市场的 **AI 驱动型设计施工平台**。

| 传统方式 | Nusantara Atelier |
|----------|-------------------|
| 设计排期 2-4 周 | AI 生成方案，10 分钟 |
| 手工算量、反复询价 | 自动算量 + 即时报价 |
| 只有效果图，没有真实落地参考 | 真实案例库 + 3D 沉浸预览 |
| 设计师凭经验报价 | 基于真实成交数据的智能估价 |

---

## 🏗️ 产品架构
┌─────────────────────────────────────────────────────────────┐
│ Nusantara Atelier │
├─────────────────────────────────────────────────────────────┤
│ 【客户体验层】 │
│ └── 上传户型图/照片 → AI 生成 3D 方案 → 沉浸式漫游 │
│ │
│ 【报价引擎层】 │
│ └── 自动算量 → 物料清单(BOM) → 即时预算生成 │
│ │
│ 【核心数据层】 ← 你的独家资产 │
│ ├── 中国豪宅案例库（法式/现代/侘寂/意式极简） │
│ ├── 印尼本地材料价格库（CITATAH、Touchwood 等） │
│ └── 单方造价数据库（硬装/软装） │
└─────────────────────────────────────────────────────────────┘

text

---

## 🚀 客户使用流程

| 步骤 | 客户操作 | 系统响应 | 耗时 |
|:---:|------|------|:---:|
| ① | 上传户型图 / 现场照片 | AI 识别空间结构 | 3 分钟 |
| ② | 选择偏好风格 | 匹配最优案例参考 | 1 分钟 |
| ③ | 确认方案 | 自动生成 3D 效果图 | 10 分钟 |
| ④ | — | 生成物料清单 + 预算报价 | 5 分钟 |
| ⑤ | 预约设计师 | 销售团队即时跟进 | 即时 |

---

## 📁 项目结构
nusantara-atelier/
├── apps/
│ └── web/ # Next.js 前端 (部署到 Cloudflare Pages)
│ ├── app/
│ │ ├── api/ # Pages Functions
│ │ │ ├── upload/route.ts
│ │ │ ├── design/route.ts
│ │ │ └── quote/route.ts
│ │ ├── page.tsx # 首页（展示案例库）
│ │ ├── upload/page.tsx # 上传页面
│ │ └── result/page.tsx # 结果展示
│ ├── components/
│ │ ├── CaseGallery/ # 案例展示组件
│ │ ├── Scene3D/ # 3D 渲染组件
│ │ └── QuoteBuilder/ # 报价展示组件
│ └── package.json
│
├── workers/ # Cloudflare Workers
│ ├── ai-worker/ # AI 推理 Worker
│ └── cad-worker/ # CAD 解析 Worker (Python + ezdxf)
│
├── data/
│ ├── cases.json # 案例库 ← 你的核心资产
│ └── materials.json # 材料价格库
│
├── wrangler.toml # Cloudflare 配置
└── README.md

text

---

## 🧱 技术栈

| 层级 | 技术选型 |
|------|----------|
| **前端** | Next.js 14 + TypeScript + Tailwind CSS |
| **3D 引擎** | React Three Fiber + Three.js |
| **后端** | Cloudflare Workers (Python + JavaScript) |
| **数据库** | Cloudflare D1 (SQLite) |
| **文件存储** | Cloudflare R2 |
| **AI 推理** | Cloudflare Workers AI + AI Gateway |
| **部署** | Cloudflare Pages |

---

## 🗺️ 路线图

| 阶段 | 时间 | 目标 |
|------|------|------|
| Phase 1 | 2026 Q3 | 案例库迁移 + 首页展示 + 上传流程打通 |
| Phase 2 | 2026 Q4 | AI 设计生成 + 3D 预览 + 基础报价 |
| Phase 3 | 2027 Q1 | 印尼本地材料库 + 精确 BOM 报价 |
| Phase 4 | 2027 Q2 | 与 IndoScout 获客系统打通 |

---

## 📄 License

MIT © 2026 Nusantara Atelier Team

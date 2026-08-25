# Nusantara Atelier

**印尼高端别墅全案服务商 · 室内设计 → 精密装修 → 整装服务 → 家具软装指导**

**Luxury Villa Design & Build Studio for Indonesia — Interior Design · Precision Fit-Out · Turnkey Package · Furniture & Soft Furnishing**

[![Live](https://img.shields.io/badge/Live-nusantara--atelier.pages.dev-C9A96E?style=flat-square)](https://nusantara-atelier.pages.dev)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange?style=flat-square&logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

🌐 **在线体验 · Live Site：<https://nusantara-atelier.pages.dev>**

三语网站 · Trilingual：**Bahasa Indonesia / English / 中文**

---

## 🎯 关于项目 · About

### 中文

Nusantara Atelier 把**中国顶级豪宅的成熟落地经验**带到印尼高端别墅市场，提供一站式服务链条：

- 🏛️ **室内设计** —— 基于真实落地案例的风格体系：法式 / 现代 / 侘寂 / 意式极简 / 现代奶油 / 法式轻奢
- 🔨 **精密装修** —— 硬装造价透明到每平方米，工艺对标中国一线豪宅
- 🛋️ **家具软装指导** —— 真实成交软装标准，完整选型清单与采购指导
- 🗝️ **整装服务** —— 一个团队全程负责，预算锁定、工期锁定，交付即可入住

网站以 **25 个真实落地案例 / 231 张实景照片** 为核心资产，附真实单方造价数据。AI 是后台引擎而非卖点：客户上传户型图，30 分钟即可获得初步方案与透明报价（传统流程 2–4 周）。

### English

Nusantara Atelier brings **China's proven top-tier residential expertise** to Indonesia's luxury villa market, as a one-stop design-and-build studio:

- 🏛️ **Interior Design** — Style systems backed by real completed projects
- 🔨 **Precision Fit-Out** — Transparent per-sqm pricing, first-tier craftsmanship
- 🛋️ **Furniture & Soft Furnishing** — Full selection lists from real transactions
- 🗝️ **Turnkey Package** — One team, one contract, one locked budget. Move in on handover day.

The site is built around **25 real completed projects / 231 photos** with actual unit-cost data. AI is the engine, not the headline: upload a floor plan, get a first proposal and transparent estimate in 30 minutes (vs. 2–4 weeks traditionally).

---

## ✨ 网站板块 · Site Sections

```
① Hero            实景轮播 + 定位语 + 双 CTA
② 服务链条         室内设计 · 精密装修 · 家具软装指导 · 整装服务（四段式）
③ 案例画廊         25 案例 / 231 张实景，8 种风格筛选
④ 透明造价带       真实单方造价 + 报价公式
⑤ 团队介绍         豪宅设计与营造团队 + 自有产业工人
⑥ 快速估价入口     上传户型图，30 分钟初步方案（支持区）
⑦ 预约设计师 CTA   唯一转化目标
⑧ 页脚
```

---

## 🧱 技术栈 · Tech Stack

| 层级 | 技术 | 状态 |
|------|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript + Tailwind CSS，静态导出 | ✅ 已上线 |
| 多语言 | 自研客户端字典 i18n（ID / EN / 中文） | ✅ 已上线 |
| 托管 | Cloudflare Pages（全球 CDN） | ✅ 已上线 |
| 后端 | Cloudflare Workers（AI Worker / CAD Worker） | 📋 规划中，见 [ARCHITECTURE](docs/ARCHITECTURE.md) |
| 数据库 | Cloudflare D1 + R2 | 📋 规划中 |
| AI 推理 | Cloudflare Workers AI | 📋 规划中 |

## 🚀 本地开发 · Development

```bash
git clone https://github.com/vfvincentwong2026/Nusantara-Atelier.git
cd Nusantara-Atelier/apps/web

npm install
npm run dev        # http://localhost:3000
```

构建与部署：

```bash
npm run build                                          # 静态导出到 out/
npx wrangler pages deploy out --project-name=nusantara-atelier
```

详细部署说明见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 📁 项目结构 · Project Structure

```text
nusantara-atelier/
├── apps/
│   └── web/                  # 前端网站（Next.js 14，已上线）
│       ├── app/              # 首页 / booking / upload
│       ├── components/       # CaseGallery / HeroCarousel / LanguageProvider
│       ├── lib/              # i18n 字典（三语）/ 案例数据接入
│       └── public/cases/     # 231 张案例实景照片
│
├── data/
│   └── cases.json            # 案例库单一数据源（25 案例）
│
└── docs/                     # 完整文档
    ├── HOMEPAGE.md           # 首页 PRD + 中英双语文案
    ├── PROJECT_DESCRIPTION.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── API.md
    ├── CASES.md
    ├── DEPLOYMENT.md
    └── FAQ.md
```

## 🗺️ 路线图 · Roadmap

| 阶段 | 时间 | 目标 | 状态 |
|------|------|------|------|
| Phase 1 | 2026 Q3 | 案例库 + 首页 + 三语 + 上线 | ✅ 已完成 |
| Phase 2 | 2026 Q4 | 上传流程 + AI 设计生成 + 基础报价 + 预约表单 | 🚧 进行中 |
| Phase 3 | 2027 Q1 | 印尼本地材料库 + 精确 BOM 报价 + 3D 预览 | 📋 规划中 |
| Phase 4 | 2027 Q2 | 与 IndoScout 获客系统打通 | 📋 规划中 |

## 🤝 贡献 · Contributing

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可证 · License

MIT © 2026 Nusantara Atelier Team

## 🔗 相关项目 · Related Projects

| 项目 | 关系 |
|------|------|
| [IndoScout-D-B](https://github.com/vfvincentwong2026/IndoScout-D-B) | 获客端工具 · Lead Generation |
| **Nusantara Atelier**（本项目） | 设计与转化端 · Design & Conversion |

---

**找到更好的方式，建造更美的空间。**
**Find a better way. Build a beautiful space.**

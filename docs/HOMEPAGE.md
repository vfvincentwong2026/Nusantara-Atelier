# Nusantara Atelier — 首页改版 PRD + 完整文案（中英双语）

> 版本：v1.0 · 2026-08-25
> 定位调整：从「AI 设计工具」改为「豪宅全案服务商」，AI 降级为后台效率引擎。

---

## 1. 产品定位 · Positioning

### 中文

**Nusantara Atelier 是面向印尼高端别墅市场的一站式豪宅全案服务商。**

我们把中国顶级豪宅的成熟落地经验带到印尼，提供从**室内设计 → 精密装修 → 家具软装指导**的完整服务链条。AI 不是卖点，而是后台引擎——它让客户在 30 分钟内拿到初步方案和透明报价，把传统 2–4 周的等待压缩到一杯咖啡的时间。

### English

**Nusantara Atelier is a one-stop luxury villa design-and-build studio for Indonesia's high-end market.**

We bring China's proven top-tier residential expertise to Indonesia, offering a complete service chain: **Interior Design → Precision Fit-Out → Furniture & Soft Furnishing Guidance**. AI is not the headline — it's the engine behind the scenes, compressing a traditional 2–4 week design cycle into a 30-minute first proposal with transparent pricing.

### 定位决策记录（为什么这么改）

| 旧叙事 | 新叙事 | 理由 |
|--------|--------|------|
| "AI 设计网站" | "豪宅全案服务商" | 豪宅客户购买品味与信任，"AI 工具"叙事会拉低品牌、卷入工具比价 |
| AI 生成放首屏 | 案例库放首屏，AI 放第二屏之后 | 18 个真实落地案例 + 真实造价数据是最强信任资产 |
| 功能平铺（上传/设计/报价/预约并列） | 案例为绝对主角，功能服务于转化 | 转化路径：心动（案例）→ 估价（工具）→ 预约（人） |

---

## 2. 目标用户 · Audience

| 用户 | 核心诉求 | 首页对策 |
|------|----------|----------|
| 印尼豪宅业主（含华人业主圈层） | 快速判断"这家公司够不够格" | 首屏案例大图 + 真实造价数据 |
| 开发商（样板间/售楼处） | 落地能力与工期确定性 | 服务链条三段式 + 案例面积/造价背书 |
| 设计师/同行 | 专业水准 | 风格体系与材质细节展示 |

---

## 3. 首页信息架构 · Page Structure

```
① Hero            —— 一句话定位 + 沉浸式案例视觉 + 主次双 CTA
② 服务链条        —— 室内设计 · 精密装修 · 家具软装指导（三段式）
③ 案例画廊        —— 首页最大篇幅，按风格筛选，卡片含面积/造价
④ 透明造价带      —— 真实单方造价数据化展示（派尚 3 案例）
⑤ 快速估价入口    —— AI 能力降级为一张功能卡（支持区）
⑥ 预约设计师 CTA  —— 唯一转化目标
⑦ 页脚            —— 品牌、联系方式、相关项目
```

### 屏次 ① Hero

**中文**

- 主标题：**从设计到软装，一步到位。**
- 副标题：中国顶级豪宅落地经验，服务印尼高端别墅市场。室内设计 · 精密装修 · 家具软装指导。
- 主 CTA：**预约设计师** → `/booking`
- 次 CTA：浏览案例库 → 锚点 `#cases`
- 视觉：全屏案例实景轮播（暂用占位图，标注 `TODO: 替换实景照片`）

**English**

- Headline: **From Design to Furnishing — Done Right, Once.**
- Sub: China's top-tier residential expertise, now serving Indonesia's luxury villa market. Interior Design · Precision Fit-Out · Furniture & Soft Furnishing.
- Primary CTA: **Book a Designer** → `/booking`
- Secondary CTA: Explore Our Work → `#cases`

### 屏次 ② 服务链条 · Our Services

| 服务 | 中文文案 | English |
|------|----------|---------|
| 🏛️ 室内设计 | 基于真实落地案例的风格体系：法式、现代、侘寂、意式极简、现代奶油、法式轻奢。每一套方案都有真实成交项目作为依据。 | Style systems backed by real completed projects: French, Modern, Wabi-Sabi, Italian Minimalist, Cream Modern, French Luxury. Every proposal is grounded in actual delivered work. |
| 🔨 精密装修 | 硬装造价透明到每一平方米。真实案例单方造价 4,500–5,500 元/㎡ 硬装标准，工艺对标中国一线豪宅。 | Transparent hard-fit-out pricing per square meter. Benchmarked at RMB 4,500–5,500/㎡ from real projects, matching China's first-tier luxury craftsmanship. |
| 🛋️ 家具软装指导 | 软装 4,000–4,500 元/㎡ 真实成交标准。从家具选型到饰品陈设，提供完整软装清单与采购指导。 | Soft furnishing at RMB 4,000–4,500/㎡ based on real transactions. Full furniture selection lists and procurement guidance, down to decorative objects. |

### 屏次 ③ 案例画廊 · Selected Works（核心屏）

- 筛选器：`全部 / 法式 / 现代 / 侘寂 / 意式极简 / 现代奶油 / 法式轻奢 / 现代小法`
- 卡片字段：实景图 · 项目名 · 地点 · 风格 · 面积（㎡）· 硬装/软装单方造价（有则展示）
- 数据来源：`data/cases.json`（18 个案例）
- 标题文案：中文 **真实落地，有据可查。** / English **Real Projects. Proven Results.**

> ⚠️ **当前阻塞项**：18 个案例 `images` 字段全部为空。上线前必须为每个案例收集 3–5 张实景照片，否则案例驱动的首页是空架子。这是 Phase 1 第一优先级。

### 屏次 ④ 透明造价带 · Transparent Pricing

**中文**

- 标题：**报价，基于真实成交数据。**
- 正文：我们不凭空估价。每一个报价都来自案例库的真实单方造价，按风格、地区、档次系数校准：
  `总价 = 面积 × 单方造价 × 风格系数 × 地区系数 × 档次系数`
- 三个数据卡片（派尚设计真实数据）：
  - 万科松山湖璞舍 · 东莞 · 1100㎡ —— 硬装 5,500 / 软装 4,500 元/㎡
  - 正弘悦云棠 · 郑州 · 207㎡ —— 硬装 4,500 / 软装 4,000 元/㎡
  - 长沙叠墅 · 长沙 · 280㎡ —— 硬装 4,500 / 软装 4,000 元/㎡ · 2024 艾特奖 TOP10

**English**

- Headline: **Pricing Backed by Real Transaction Data.**
- Body: We never quote from thin air. Every estimate derives from actual per-sqm costs in our case library, calibrated by style, location, and tier:
  `Total = Area × Unit Cost × Style Factor × Location Factor × Tier Factor`

> 📌 展示层需换算 USD/IDR（后台保留人民币原始数据）。印尼客户以 IDR 为主展示币种。

### 屏次 ⑤ 快速估价入口 · Instant Estimate（支持区，降级呈现）

单张功能卡，不再与案例并列：

**中文**

- 标题：**上传户型图，30 分钟获取初步方案与估价**
- 正文：无需注册。支持 JPG / PNG / PDF / DXF，AI 自动识别空间结构并匹配最佳案例。
- CTA：免费快速估价 → `/upload`

**English**

- Headline: **Upload Your Floor Plan. Get a First Proposal in 30 Minutes.**
- Body: No registration needed. JPG / PNG / PDF / DXF supported — AI parses your space and matches the best reference case.
- CTA: Free Instant Estimate → `/upload`

### 屏次 ⑥ 预约 CTA · Book a Designer

**中文**：我们的设计师将在 24 小时内与您联系。初步估价与方案展示完全免费。
**English**: Our designers will reach out within 24 hours. First estimate and proposal are completely free.

### 屏次 ⑦ 页脚 · Footer

- 品牌语：找到更好的方式，建造更美的空间。/ Find a better way. Build a beautiful space.
- 相关项目：IndoScout-D-B（获客端）
- License: MIT © 2026 Nusantara Atelier Team

---

## 4. 转化路径 · Conversion Funnel

```
浏览案例（心动）→ 快速估价（验证预算）→ 预约设计师（留资）→ 销售 24h 跟进
```

- 首页唯一转化指标：**预约提交数**
- 次级指标：估价工具使用数、案例页停留时长

---

## 5. 风险与待办 · Risks & Action Items

| # | 事项 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | 收集 18 个案例实景照片（每个 3–5 张） | P0 | 🔴 未开始 |
| 2 | 造价展示层 USD/IDR 换算（人民币原始数据后台保留） | P0 | 🔴 未开始 |
| 3 | 印尼本地落地团队叙事（目前 18 案例全在中国） | P1 | 🟡 文案已处理，需真实合作背书 |
| 4 | 印尼语版本（id-ID） | P2 | 🔴 未开始 |
| 5 | 上传/估价/预约页面功能实现 | P1 | 🟡 首页静态版先行 |

---

## 🔗 相关文档

- [项目介绍](PROJECT_DESCRIPTION.md)
- [技术架构](ARCHITECTURE.md)
- [数据模型](DATA_MODEL.md)
- [案例展示](CASES.md)

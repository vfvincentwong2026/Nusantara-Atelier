## 5. `CONTRIBUTING.md` — 贡献指南

```markdown
# Nusantara Atelier — 贡献指南

感谢你考虑为 Nusantara Atelier 做出贡献！

## 🧑‍💻 开发环境

```bash
# 克隆项目
git clone https://github.com/vfvincentwong2026/nusantara-atelier.git
cd nusantara-atelier

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev
📁 代码规范
TypeScript/JavaScript
使用 ESLint + Prettier

遵循 Next.js 官方风格指南

所有函数必须有 JSDoc 注释

Python
使用 Black 格式化

使用 Ruff 做 lint

类型注解必须完整

Git 提交
bash
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式化
refactor: 重构代码
test: 添加测试
chore: 构建工具变动
🧪 测试
bash
# 前端测试
cd apps/web
pnpm test

# Workers 测试
cd workers/ai-worker
wrangler test
📝 提交 PR 流程
Fork 本仓库

创建分支 git checkout -b feature/your-feature

提交代码 git commit -m "feat: add your feature"

推送分支 git push origin feature/your-feature

创建 Pull Request

📋 PR 模板
markdown
## 变更内容
- [ ] 新增功能
- [ ] 修复 bug
- [ ] 更新文档

## 测试情况
- [ ] 本地测试通过
- [ ] 单元测试通过

## 关联 Issue
Closes #xxx
📞 联系方式
项目维护者：@vfvincentwong2026

讨论区：GitHub Issues

text

---

## 6. `DATA_MODEL.md` — 数据模型（案例库结构化）

```markdown
# Nusantara Atelier — 数据模型

## 📊 案例库数据模型

### cases.json 结构

```json
{
  "cases": [
    {
      "id": "case_001",
      "project_name": "汀岸晓庐",
      "location": "杭州",
      "country": "中国",
      "style": "法式",
      "area": 630,
      "hard_cost_per_sqm": 5500,
      "soft_cost_per_sqm": 4500,
      "images": [
        "/cases/tingan-xiaolu/01.jpg",
        "/cases/tingan-xiaolu/02.jpg"
      ],
      "tags": ["奢华", "雕花", "对称", "罗马柱"],
      "description": "法式风格别墅，以对称布局和精美雕花为特色",
      "material_highlights": {
        "floor": "大理石拼花",
        "wall": "护墙板 + 艺术涂料",
        "ceiling": "石膏线条 + 水晶吊灯"
      }
    },
    {
      "id": "case_002",
      "project_name": "万科松山湖璞舍",
      "location": "东莞",
      "country": "中国",
      "style": "现代",
      "area": 1100,
      "hard_cost_per_sqm": 5500,
      "soft_cost_per_sqm": 4500,
      "images": [
        "/cases/dg-pushe/01.jpg",
        "/cases/dg-pushe/02.jpg"
      ],
      "tags": ["极简", "大平层", "湖景"],
      "description": "现代极简别墅，与自然景观融合",
      "material_highlights": {
        "floor": "灰色大理石",
        "wall": "微水泥",
        "ceiling": "无主灯设计"
      }
    }
  ],
  "styles": {
    "法式": {
      "id": "french",
      "icon": "🏛️",
      "description": "对称布局、精美雕花、罗马柱、水晶吊灯",
      "keywords": ["奢华", "雕花", "对称", "古典"]
    },
    "现代": {
      "id": "modern",
      "icon": "🏙️",
      "description": "极简线条、大面积玻璃、无主灯设计",
      "keywords": ["极简", "通透", "自然"]
    },
    "侘寂": {
      "id": "wabi-sabi",
      "icon": "🍂",
      "description": "自然材质、中性色调、宁静感",
      "keywords": ["质朴", "宁静", "自然", "禅意"]
    },
    "意式极简": {
      "id": "italian-minimal",
      "icon": "🇮🇹",
      "description": "精致细节、高级质感、理性美学",
      "keywords": ["精致", "高级", "理性"]
    },
    "现代奶油": {
      "id": "cream-modern",
      "icon": "🍦",
      "description": "柔和的奶油色系、圆润线条、温馨感",
      "keywords": ["柔和", "温馨", "圆润"]
    },
    "法式轻奢": {
      "id": "french-luxury",
      "icon": "✨",
      "description": "法式优雅 + 现代轻奢",
      "keywords": ["优雅", "轻奢", "混搭"]
    }
  }
}
报价请求模型 (QuoteRequest)
typescript
interface QuoteRequest {
  area: number;                    // 面积 (㎡)
  style: 'french' | 'modern' | 'wabi-sabi' | 'italian-minimal' | 'cream-modern' | 'french-luxury';
  tier: 'standard' | 'luxury' | 'ultra-luxury';
  location: string;                // 城市
  rooms: number;
  floors: number;
  has_pool: boolean;
  has_garden: boolean;
}
报价结果模型 (QuoteResult)
typescript
interface QuoteResult {
  total_usd: number;
  total_idr: number;
  breakdown: {
    structure: number;             // 结构
    finishing: number;             // 装修
    mep: number;                   // 机电
    landscape: number;             // 园林
    furniture: number;             // 家具
    design_fee: number;            // 设计费
    contingency: number;           // 预备金
  };
  material_list: MaterialItem[];   // 物料清单
  reference_case: ReferenceCase;   // 参考案例
  generated_at: Date;
}

interface MaterialItem {
  category: string;                // 石材/木材/卫浴/涂料
  name: string;
  brand: string;
  unit: string;
  quantity: number;
  unit_price_idr: number;
  unit_price_usd: number;
  total_idr: number;
  total_usd: number;
  supplier: string;
}
风格 → 材料映射表
风格	地面	墙面	天花	核心材质
法式	大理石拼花	护墙板 + 墙布	石膏线条 + 吊灯	大理石、实木、水晶
现代	大板瓷砖/微水泥	艺术涂料/木饰面	无主灯/平顶	微水泥、玻璃、金属
侘寂	微水泥/木地板	艺术涂料/藤编	原木梁/平顶	木材、石材、棉麻
意式极简	大理石/木地板	木饰面/金属	无主灯/极简	大理石、金属、皮革
现代奶油	木地板/柔光砖	艺术涂料/弧形	弧形吊顶	木材、布艺、哑光
法式轻奢	大理石/拼花	护墙板/金属	石膏线 + 灯带	大理石、金属、丝绒
价格库 (materials.json)
json
{
  "categories": {
    "stone": {
      "name": "石材",
      "items": [
        { "name": "印尼大理石 - 白色", "brand": "CITATAH", "unit": "㎡", "price_idr": 1500000, "price_usd": 95 },
        { "name": "印尼大理石 - 灰色", "brand": "CITATAH", "unit": "㎡", "price_idr": 1200000, "price_usd": 76 },
        { "name": "Palimanan 石", "brand": "Palimanan", "unit": "㎡", "price_idr": 800000, "price_usd": 51 }
      ]
    },
    "wood": {
      "name": "木材",
      "items": [
        { "name": "柚木地板", "brand": "Touchwood", "unit": "㎡", "price_idr": 2500000, "price_usd": 160 },
        { "name": "印茄木地板", "brand": "Merbau", "unit": "㎡", "price_idr": 1800000, "price_usd": 115 },
        { "name": "Ulin 铁木", "brand": "Kaltimber", "unit": "㎡", "price_idr": 3000000, "price_usd": 192 }
      ]
    },
    "sanitary": {
      "name": "卫浴",
      "items": [
        { "name": "智能马桶", "brand": "TOTO", "unit": "套", "price_idr": 25000000, "price_usd": 1600 },
        { "name": "花洒套装", "brand": "Hansgrohe", "unit": "套", "price_idr": 8000000, "price_usd": 512 }
      ]
    }
  }
}
📊 数据关系图
text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   cases     │────▶│   styles    │     │  materials  │
│  (项目案例)  │     │   (风格)    │     │  (材料价格)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   quotes    │────▶│  materials  │     │  suppliers  │
│  (报价记录)  │     │  (物料清单)  │     │  (供应商)   │
└─────────────┘     └─────────────┘     └─────────────┘
数据导入脚本
bash
# 导入案例数据到 D1
wrangler d1 execute nusantara-db --command="
INSERT INTO cases (project_name, location, style, area, hard_cost_per_sqm, soft_cost_per_sqm, images, tags)
VALUES
('汀岸晓庐', '杭州', '法式', 630, 5500, 4500, '[\"/cases/tingan/01.jpg\"]', '[\"奢华\",\"雕花\"]'),
('万科松山湖璞舍', '东莞', '现代', 1100, 5500, 4500, '[\"/cases/pushe/01.jpg\"]', '[\"极简\",\"湖景\"]')
"
附录：案例数据 JSON（完整版）
以下是 ⑤号设计 和 派尚设计 全部项目的结构化数据，可以直接复制到 cases.json 中使用：

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
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_002",
      "project_name": "曼陀花园",
      "location": "杭州",
      "country": "中国",
      "style": "法式",
      "area": null,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["法式", "杭州"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_003",
      "project_name": "香格里拉",
      "location": "杭州",
      "country": "中国",
      "style": "现代",
      "area": 600,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代", "杭州", "600㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_004",
      "project_name": "森山半岛",
      "location": "义乌",
      "country": "中国",
      "style": "现代",
      "area": 1200,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代", "义乌", "1200㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_005",
      "project_name": "玺园",
      "location": "绍兴",
      "country": "中国",
      "style": "法式轻奢",
      "area": null,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["法式轻奢", "绍兴"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_006",
      "project_name": "桃花源",
      "location": "义乌",
      "country": "中国",
      "style": "法式",
      "area": 630,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["法式", "义乌", "630㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_007",
      "project_name": "桃花源·佗寂",
      "location": "义乌",
      "country": "中国",
      "style": "侘寂",
      "area": 855,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["侘寂", "义乌", "855㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_008",
      "project_name": "桃花源·佰寂",
      "location": "义乌",
      "country": "中国",
      "style": "侘寂",
      "area": 500,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["侘寂", "义乌", "500㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_009",
      "project_name": "科尔世纪外滩",
      "location": "杭州",
      "country": "中国",
      "style": "现代小法",
      "area": 200,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代小法", "杭州", "200㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_010",
      "project_name": "绿谷云溪",
      "location": "义乌",
      "country": "中国",
      "style": "侘寂",
      "area": 450,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["侘寂", "义乌", "450㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_011",
      "project_name": "御香园",
      "location": "绍兴",
      "country": "中国",
      "style": "现代奶油",
      "area": 780,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代奶油", "绍兴", "780㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_012",
      "project_name": "皇庭水岸·顶有",
      "location": "莆田",
      "country": "中国",
      "style": "意式极简",
      "area": 520,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["意式极简", "莆田", "520㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_013",
      "project_name": "佳源珑府",
      "location": "桐乡",
      "country": "中国",
      "style": "意式极简",
      "area": 430,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["意式极简", "桐乡", "430㎡"],
      "description": "",
      "source": "⑤号设计"
    },
    {
      "id": "case_014",
      "project_name": "万科松山湖璞舍",
      "location": "东莞",
      "country": "中国",
      "style": "现代",
      "area": 1100,
      "hard_cost_per_sqm": 5500,
      "soft_cost_per_sqm": 4500,
      "images": [],
      "tags": ["现代", "东莞", "1100㎡", "硬装5500", "软装4500"],
      "description": "",
      "source": "派尚设计"
    },
    {
      "id": "case_015",
      "project_name": "正弘悦云棠",
      "location": "郑州",
      "country": "中国",
      "style": "现代",
      "area": 207,
      "hard_cost_per_sqm": 4500,
      "soft_cost_per_sqm": 4000,
      "images": [],
      "tags": ["现代", "郑州", "207㎡", "硬装4500", "软装4000"],
      "description": "",
      "source": "派尚设计"
    },
    {
      "id": "case_016",
      "project_name": "长沙叠墅",
      "location": "长沙",
      "country": "中国",
      "style": "现代",
      "area": 280,
      "hard_cost_per_sqm": 4500,
      "soft_cost_per_sqm": 4000,
      "images": [],
      "tags": ["现代", "长沙", "280㎡", "硬装4500", "软装4000", "艾特奖TOP10"],
      "description": "2024年第十三届艾特奖全国杰出设计大奖 TOP10",
      "source": "派尚设计"
    },
    {
      "id": "case_017",
      "project_name": "华润鹭栖湖",
      "location": "嘉兴",
      "country": "中国",
      "style": "现代",
      "area": 230,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代", "嘉兴", "230㎡", "华润最美样板房"],
      "description": "华润内部评选最美样板房",
      "source": "派尚设计"
    },
    {
      "id": "case_018",
      "project_name": "广州中建御溪谷",
      "location": "广州",
      "country": "中国",
      "style": "现代",
      "area": 420,
      "hard_cost_per_sqm": null,
      "soft_cost_per_sqm": null,
      "images": [],
      "tags": ["现代", "广州", "420㎡"],
      "description": "",
      "source": "派尚设计"
    }
  ]
}

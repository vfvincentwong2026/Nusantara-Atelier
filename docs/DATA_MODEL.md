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
  style: '法式' | '现代' | '侘寂' | '意式极简' | '现代奶油' | '法式轻奢' | '现代小法';
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
  area: number;                    // 面积 (㎡)
  style: string;                   // 风格
  tier: 'standard' | 'luxury' | 'ultra-luxury';
  location: string;                // 城市
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
物料清单项 (MaterialItem)
typescript
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
📊 风格映射表
风格	地面	墙面	天花	核心材质
法式	大理石拼花	护墙板 + 墙布	石膏线条 + 吊灯	大理石、实木、水晶
现代	大板瓷砖/微水泥	艺术涂料/木饰面	无主灯/平顶	微水泥、玻璃、金属
侘寂	微水泥/木地板	艺术涂料/藤编	原木梁/平顶	木材、石材、棉麻
意式极简	大理石/木地板	木饰面/金属	无主灯/极简	大理石、金属、皮革
现代奶油	木地板/柔光砖	艺术涂料/弧形	弧形吊顶	木材、布艺、哑光
法式轻奢	大理石/拼花	护墙板/金属	石膏线 + 灯带	大理石、金属、丝绒
🔗 相关文档
API 文档

架构文档

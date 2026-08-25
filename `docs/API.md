```markdown
# Nusantara Atelier — API 文档

## 中文

本文档描述了 Nusantara Atelier 后端 API 的所有接口。

---

## 📡 基础信息

| 项目 | 说明 |
|------|------|
| **Base URL** | `https://nusantara-atelier.pages.dev/api` |
| **格式** | JSON |
| **认证** | 暂不需要（MVP 阶段） |
| **CORS** | 支持跨域 |

---

## 🔌 接口列表

### 1. 健康检查
GET /health

text

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2026-08-25T10:00:00Z",
  "services": {
    "db": "connected",
    "r2": "connected",
    "ai": "ready"
  }
}
2. 获取案例列表
text
GET /cases
参数：

参数	类型	必填	说明
style	string	❌	按风格筛选 (法式/现代/侘寂/意式极简)
limit	number	❌	返回数量，默认 20
offset	number	❌	分页偏移量
响应：

json
{
  "success": true,
  "data": {
    "total": 18,
    "cases": [
      {
        "id": "case_001",
        "project_name": "汀岸晓庐",
        "location": "杭州",
        "style": "法式",
        "area": null,
        "images": ["/cases/tingan/01.jpg"],
        "tags": ["法式", "杭州"]
      }
    ]
  }
}
3. 上传文件
text
POST /upload
请求 (multipart/form-data):

参数	类型	必填	说明
file	File	✅	户型图/照片 (JPG/PNG/PDF/DXF)
type	string	❌	文件类型 (floorplan/photo)，默认 auto
响应：

json
{
  "success": true,
  "data": {
    "file_id": "file_001",
    "url": "https://r2.../uploads/file_001.jpg",
    "type": "floorplan",
    "size": 2457600,
    "parsed": {
      "rooms": [
        { "name": "客厅", "width": 6.2, "depth": 5.0 },
        { "name": "主卧", "width": 4.5, "depth": 3.8 }
      ],
      "total_area": 120.5
    }
  }
}
4. AI 设计生成
text
POST /design
请求：

json
{
  "file_id": "file_001",
  "style": "法式",
  "area": 600,
  "rooms": 5,
  "floors": 2,
  "budget_tier": "luxury"
}
响应：

json
{
  "success": true,
  "data": {
    "design_id": "design_001",
    "matched_case": {
      "id": "case_001",
      "project_name": "汀岸晓庐",
      "style": "法式",
      "images": ["/cases/tingan/01.jpg", "/cases/tingan/02.jpg"]
    },
    "materials": [
      {
        "category": "石材",
        "name": "大理石拼花",
        "quantity": 120,
        "unit": "㎡",
        "estimated_price_usd": 12000,
        "estimated_price_idr": 180000000
      },
      {
        "category": "墙面",
        "name": "护墙板 + 艺术涂料",
        "quantity": 180,
        "unit": "㎡",
        "estimated_price_usd": 15000,
        "estimated_price_idr": 225000000
      }
    ],
    "design_description": "法式风格别墅，以对称布局和精美雕花为特色..."
  }
}
5. 报价生成
text
POST /quote
请求：

json
{
  "design_id": "design_001",
  "area": 600,
  "style": "法式",
  "tier": "luxury",
  "location": "Jakarta",
  "rooms": 5,
  "floors": 2,
  "has_pool": true,
  "has_garden": true
}
响应：

json
{
  "success": true,
  "data": {
    "quote_id": "quote_001",
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
    "material_list": [
      {
        "category": "石材",
        "name": "大理石拼花",
        "brand": "CITATAH",
        "unit": "㎡",
        "quantity": 120,
        "unit_price_usd": 100,
        "total_usd": 12000,
        "unit_price_idr": 1500000,
        "total_idr": 180000000
      }
    ],
    "reference_case": {
      "id": "case_001",
      "project_name": "汀岸晓庐",
      "style": "法式"
    },
    "generated_at": "2026-08-25T10:00:00Z"
  }
}
6. 预约设计师
text
POST /booking
请求：

json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62 812 3456 7890",
  "project_location": "Jakarta",
  "estimated_area": 600,
  "preferred_style": "法式",
  "message": "我想了解更多关于法式别墅设计的信息"
}
响应：

json
{
  "success": true,
  "data": {
    "booking_id": "booking_001",
    "status": "pending",
    "message": "我们的设计师将在 24 小时内与您联系",
    "created_at": "2026-08-25T10:00:00Z"
  }
}
7. 导出报价 PDF
text
GET /quote/:quote_id/export
响应： 返回 PDF 文件 (application/pdf)

🔢 错误码
状态码	说明
200	成功
400	请求参数错误
404	资源不存在
429	请求过于频繁
500	服务器内部错误
错误响应格式：

json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
📘 使用示例 (JavaScript)
javascript
// 上传文件
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { data: { file_id, parsed } } = await uploadRes.json();

// 生成设计
const designRes = await fetch('/api/design', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_id,
    style: '法式',
    area: parsed.total_area
  })
});
const { data: designData } = await designRes.json();

// 获取报价
const quoteRes = await fetch('/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    design_id: designData.design_id,
    area: parsed.total_area,
    style: '法式',
    tier: 'luxury',
    location: 'Jakarta'
  })
});
const { data: quoteData } = await quoteRes.json();

console.log(`预估总价: $${quoteData.total_usd}`);
🔗 相关文档
架构文档

数据模型

部署指南

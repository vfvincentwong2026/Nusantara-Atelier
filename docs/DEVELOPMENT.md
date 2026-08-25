# Nusantara Atelier — 开发指南

## 中文

本文档面向开发者，详细介绍本地开发环境搭建和工作流程。

---

## 📋 前置条件

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 20 LTS | 前端运行时 |
| pnpm | >= 9.0 | 包管理器 |
| Python | >= 3.11 | CAD Worker |
| Wrangler | 最新 | Cloudflare CLI |
| Docker | 可选 | 本地数据库 |

---

## 🚀 快速开始

```bash
# 1. 克隆
git clone https://github.com/vfvincentwong2026/Nusantara-Atelier.git
cd Nusantara-Atelier

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env

# 4. 启动 D1 本地数据库
npx wrangler d1 execute nusantara-db --local --file=./schema.sql

# 5. 启动开发服务器
pnpm dev

📁 开发命令
命令	说明
pnpm dev	启动所有服务
pnpm dev:web	仅启动前端
pnpm dev:workers	仅启动 Workers
pnpm build	构建所有
pnpm test	运行测试
pnpm lint	代码检查
🔧 配置文件
文件	说明
wrangler.toml	Cloudflare 配置
next.config.js	Next.js 配置
tailwind.config.js	Tailwind CSS 配置
tsconfig.json	TypeScript 配置
.eslintrc.json	ESLint 配置
🐛 调试
前端调试
使用 React DevTools

使用 Next.js 内置调试

Workers 调试
bash
npx wrangler dev --inspector
D1 调试
bash
npx wrangler d1 execute nusantara-db --local --command="SELECT * FROM cases"
📝 代码规范
TypeScript
typescript
// ✅ 好的做法
interface User {
  id: string;
  name: string;
}

const fetchUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ 避免
const fetchUser = (id) => {
  // 缺少类型
};
React 组件
typescript
// ✅ 好的做法
export const CaseGallery: React.FC<CaseGalleryProps> = ({ cases, onSelect }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cases.map((case) => (
        <CaseCard key={case.id} case={case} onClick={onSelect} />
      ))}
    </div>
  );
};
🧪 测试
bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test -- --grep "CaseGallery"

# 测试覆盖率
pnpm test -- --coverage
🔗 相关文档
架构文档

API 文档

数据模型

部署指南

📞 需要帮助？
提交 GitHub Issue

联系维护者

English
本开发指南的英文版本即将上线。如有问题，请提交 Issue。

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

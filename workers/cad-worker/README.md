# cad-worker（实验性，未上线）

目标：Python Worker + ezdxf 解析 DXF 户型图（POST /parse-dxf）。

**状态：部署失败，已搁置。** Cloudflare Python Workers（pyodide 运行时，python3.13）两次部署均报
`ModuleNotFoundError: No module named 'workers'`（code 10021），旧 `on_fetch` 与新 `WorkerEntrypoint`
两种入口语法均失败，判断为当前 wrangler 4.125 + Python Workers 的依赖打包机制问题（requirements.txt
方式疑似不再受支持），按 30 分钟止损原则放弃。

**生产路径**：DXF 解析已由 api-worker 内置的纯 JS 最小解析器承担
（`workers/api-worker/src/index.js` 的 `POST /parse-dxf`，LWPOLYLINE + 鞋带公式），已上线并验证。
若未来 Python Workers 依赖机制修复，可回到此目录继续。

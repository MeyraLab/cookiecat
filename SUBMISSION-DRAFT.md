# Cursor Marketplace 提交稿（待 Meyra 批准）

**状态：** 仅草稿。未创建公开仓库、未提交 [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)。  
**归属：** Meyra  
**本地路径：** `/workspace/relayrouter-mcp/`  
**版本：** 0.1.0  
**拟名：** `cookiecat`（displayName：Cookiecat）

---

## 拟提交信息

| 字段 | 拟填内容 |
|---|---|
| Plugin name | `cookiecat` |
| Display name | Cookiecat |
| Description | Call RelayRouter’s OpenAI-compatible API from Cursor: list models and run non-streaming chat completions via MCP. |
| Version | `0.1.0` |
| License | MIT（仓库根目录已有 `LICENSE`） |
| Keywords | cookiecat, relayrouter, llm, mcp, openai-compatible |
| Author | Meyra（`plugin.json` → `author.name`） |
| Homepage | https://relayrouter.io（产品站；可改） |
| Repository | **待建** 公开 GitHub，建议 `MeyraLab/cookiecat` |
| Variables | `RELAYROUTER_API_KEY`（必填 secret）、`RELAYROUTER_BASE_URL`（可选，默认 `https://api.relayrouter.ai/v1`） |
| Tools | `list_models`、`chat_completion` |
| Skill | `skills/cookiecat` |
| MCP entry | `node ${CURSOR_PLUGIN_ROOT}/dist/cookiecat.mjs`（单文件 bundle，含 SDK + zod） |

### 提交页怎么填（批准后）

1. 把插件推到**公开** Git 仓库（建议 `MeyraLab/cookiecat`）  
2. 打开 [Publish a Cursor Marketplace Plugin](https://cursor.com/marketplace/publish)  
3. 粘贴仓库 URL，按表单提交审核  

---

## 阻塞项状态

| # | 项 | 状态 |
|---|---|---|
| 1 | 公开 Git 仓库 | **仍 TODO** — 未创建；建议 `MeyraLab/cookiecat` |
| 2 | clone 可跑 / `dist` | **已修** — esbuild 打成 `dist/cookiecat.mjs`；`.gitignore` 为 `dist/*` + `!dist/cookiecat.mjs`；`mcp.json` 指向该文件 |
| 3 | `LICENSE` | **已修** — MIT，Copyright (c) 2026 Meyra |
| 4 | `plugin.json` author | **已修** — `{"name":"Meyra"}` |
| 5 | README Marketplace 措辞 | **已修** — 品牌 Cookiecat；归属 Meyra；密钥仅 Configure / 本地 gitignored `.env`；不再写「不发布 Marketplace」 |

## 建议一并做（非阻塞）

- 可选 logo：`assets/logo.svg`（或 png）并在 `plugin.json` 写 `logo`  
- 仓库继续忽略 `.env` / `*.key`  
- 不把真实 `RELAYROUTER_API_KEY` 写进任何文件或提交说明  

## 本地已证明

- `npm install` / `bundle` / `typecheck`  
- 无 key → 清楚报缺 `RELAYROUTER_API_KEY`  
- 有 key → `list_models`、短 `chat_completion` 字段形状正常（验证时不打印完整 key）  

## 明确不做（除非 Meyra 再批准）

- **不上架、不点 Publish**  
- 不创建公开 GitHub 仓库（本轮已按指示跳过）  
- 不把密钥提交到 Git / Marketplace 表单  
- 不加流式 / Anthropic `/messages` / 图片（第一版范围外）

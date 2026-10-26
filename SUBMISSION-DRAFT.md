# Cookiecat — Cursor Marketplace 提交稿（终版，待 Meyra 批准）

**状态：** 终版待审。公开仓已就绪；**尚未**在 [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) 提交。  
**归属：** Meyra  
**仓库：** https://github.com/MeyraLab/cookiecat  
**版本：** 0.1.0  

---

## 提交页拟填

| 字段 | 内容 |
|---|---|
| Repository URL | `https://github.com/MeyraLab/cookiecat` |
| Plugin name | `cookiecat` |
| Display name | Cookiecat |
| Description | Call RelayRouter’s OpenAI-compatible API from Cursor: list models and run non-streaming chat completions via MCP. |
| Version | `0.1.0` |
| Author | Meyra |
| License | MIT |
| Homepage | https://relayrouter.io |
| Keywords | cookiecat, relayrouter, llm, mcp, openai-compatible |

## 插件能力（审核员可见）

- **MCP 入口：** `node ${CURSOR_PLUGIN_ROOT}/dist/cookiecat.mjs`（单文件 bundle，克隆后无需 `npm install`）
- **Variables：** `RELAYROUTER_API_KEY`（必填）、`RELAYROUTER_BASE_URL`（可选，默认 `https://api.relayrouter.ai/v1`）
- **Tools：** `list_models`、`chat_completion`（非流式；返回正文 + usage）
- **Skill：** `skills/cookiecat`

## 清单核对

| 项 | 状态 |
|---|---|
| 公开 Git 仓库 | 已有 https://github.com/MeyraLab/cookiecat |
| `.cursor-plugin/plugin.json` | name / displayName / author / variables 齐全 |
| `mcp.json` + `dist/cookiecat.mjs` | 已入库 |
| `LICENSE` MIT | 已有 |
| README 说明安装与密钥 | 已有；密钥不入库 |
| 本地 smoke | build/bundle 过；缺 key 报错清楚；有 key 时 list + 短 chat 通 |

## 批准后我会做的事

1. 打开 Marketplace Publish 页，提交仓库 URL `https://github.com/MeyraLab/cookiecat`
2. 按上表填信息（表单字段以页面为准）
3. **不会**把 API Key 填进任何公开字段

## 本版不做

- 不加 logo（可选后续）
- 不加流式 / Anthropic `/messages` / 图片
- 你点头之前不点 Publish

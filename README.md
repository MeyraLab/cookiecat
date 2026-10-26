# Cookiecat

**Cookiecat** is a Cursor/Agent MCP plugin that wraps [RelayRouter](https://relayrouter.io)’s OpenAI-compatible API: list models and run non-streaming chat completions.

**Ownership:** Meyra  
**Version:** 0.1.0  
**License:** MIT  
**Tools:** `list_models`, `chat_completion` (non-streaming)

## Secrets

Never commit API keys. Set them only via:

1. **Cursor → Plugins → Configure** (plugin variables `RELAYROUTER_API_KEY`, optional `RELAYROUTER_BASE_URL`), or  
2. A local **gitignored** `.env` (copy from `.env.example`) / shell export for smoke tests.

Default base URL: `https://api.relayrouter.ai/v1` (also compatible with `https://relayrouter.io/v1`).

## Install (developers)

```bash
cd /path/to/cookiecat   # or this repo
npm install
npm run bundle          # writes dist/cookiecat.mjs (SDK + zod inlined)
```

Marketplace / clone installs should ship `dist/cookiecat.mjs` so `node` can start without `node_modules`.

### Cursor plugin folder

- Add this folder as a plugin, or clone into the plugin search path.
- `mcp.json` runs: `node ${CURSOR_PLUGIN_ROOT}/dist/cookiecat.mjs`
- Configure `RELAYROUTER_API_KEY` (required) and optional `RELAYROUTER_BASE_URL` in Plugins → Configure.

### MCP-only (no plugin shell)

```json
{
  "mcpServers": {
    "cookiecat": {
      "command": "node",
      "args": ["/absolute/path/to/cookiecat/dist/cookiecat.mjs"],
      "env": {
        "RELAYROUTER_API_KEY": "YOUR_KEY_FROM_CONFIGURE_OR_ENV",
        "RELAYROUTER_BASE_URL": "https://api.relayrouter.ai/v1"
      }
    }
  }
}
```

For source hot-reload during development: `"command": "npx", "args": ["tsx", "/absolute/path/to/src/index.ts"]` (needs `npm install`).

## Verify

```bash
npm run bundle
npm run typecheck
# missing key → clear error:
RELAYROUTER_API_KEY= npm run smoke
# with key → list_models + short chat:
npm run smoke
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run bundle` | esbuild → single `dist/cookiecat.mjs` |
| `npm run build` | `tsc` then `bundle` |
| `npm start` | `node dist/cookiecat.mjs` (stdio MCP) |
| `npm run dev` | `tsx src/index.ts` |
| `npm run typecheck` | typecheck only |
| `npm run smoke` | API smoke without an MCP client |

## Security

- `.gitignore` ignores `node_modules`, `.env`, `*.key`; keeps `dist/cookiecat.mjs` for clone-runnable installs
- Logs/replies mask keys (at most first 4 + last 4 chars)
- Do not put real secrets in the repo or Marketplace forms

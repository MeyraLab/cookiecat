---
name: cookiecat
description: >
  Use RelayRouter MCP tools (list_models, chat_completion) for OpenAI-compatible
  LLM calls via RelayRouter. Prefer when the user asks to call RelayRouter, list
  available models there, or run a chat completion through their RelayRouter key.
---

# RelayRouter

## When to use

- User wants to **list models** on RelayRouter → call `list_models`
- User wants a **chat / completion** through RelayRouter → call `chat_completion`
- Do **not** invent model names; call `list_models` first if unsure
- Do **not** use these tools for unrelated tasks (local code, other providers)

## Config

| Variable | Required | Notes |
|---|---|---|
| `RELAYROUTER_API_KEY` | yes | Bearer `sk-…`. Plugin variable or env. **Never print the full key** (at most first 4 + last 4). |
| `RELAYROUTER_BASE_URL` | no | Default `https://api.relayrouter.ai/v1`. Also valid: `https://relayrouter.io/v1`. Trailing slashes are stripped. |

## Tools

### `list_models`

- No args
- Returns JSON with `data[].id` (and upstream fields like `object` / `owned_by` when present)

### `chat_completion`

- **Required:** `model` (string), `messages` (array of `{ role, content }`)
- **Roles:** `system` | `user` | `assistant` | `tool`
- **Optional:** `temperature`, `max_tokens`, `top_p`, `stop`, `tools`
- Always non-streaming (`stream: false`)
- Returns `{ content, usage }` (usage has prompt/completion/total tokens when upstream sends them)

## Model names

- Prefer exact ids from `list_models` (e.g. `deepseek-v4-flash` if listed)
- Cheap / short probes: pick a small flash / mini-style model from the list

## Errors

- Missing key → message mentioning `RELAYROUTER_API_KEY`
- 401 / 403 / 404 / 429 / 5xx → readable status + short upstream body summary
- Never retry blindly on 401 (fix the key) or 429 (backoff)

## Security

- Never log, echo, or commit the full API key
- Never put secrets in skill text, README examples, or chat replies

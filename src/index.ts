/**
 * RelayRouter MCP server (stdio).
 * Tools: list_models, chat_completion
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  DEFAULT_BASE_URL,
  RelayRouterError,
  chatCompletion,
  listModels,
  normalizeBaseUrl,
  requireApiKey,
} from "./client.js";

const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
});

function getConfig() {
  const apiKey = process.env.RELAYROUTER_API_KEY ?? "";
  const baseUrl = normalizeBaseUrl(process.env.RELAYROUTER_BASE_URL);
  return { apiKey, baseUrl };
}

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function errorResult(err: unknown) {
  const message =
    err instanceof RelayRouterError
      ? err.message
      : err instanceof Error
        ? err.message
        : String(err);
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

const server = new McpServer({
  name: "cookiecat",
  version: "0.1.0",
});

server.registerTool(
  "list_models",
  {
    description:
      "List models available on RelayRouter (GET /v1/models). Returns model ids and any upstream fields such as object/owned_by.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const { apiKey, baseUrl } = getConfig();
      requireApiKey(apiKey);
      const result = await listModels(apiKey, baseUrl);
      const models = result.data.map((m) => {
        const id = typeof m.id === "string" ? m.id : String(m.id ?? "");
        return {
          id,
          ...(m.object !== undefined ? { object: m.object } : {}),
          ...(m.owned_by !== undefined ? { owned_by: m.owned_by } : {}),
          ...m,
        };
      });
      return textResult({
        base_url: baseUrl,
        object: result.object ?? "list",
        count: models.length,
        data: models,
      });
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.registerTool(
  "chat_completion",
  {
    description:
      "Non-streaming chat completion via RelayRouter (POST /v1/chat/completions, stream=false). Returns assistant content and usage.",
    inputSchema: z.object({
      model: z
        .string()
        .describe("Model id from list_models, e.g. deepseek-v4-flash"),
      messages: z
        .array(messageSchema)
        .min(1)
        .describe("Chat messages (system|user|assistant|tool)"),
      temperature: z.number().min(0).max(2).optional(),
      max_tokens: z.number().int().positive().optional(),
      top_p: z.number().min(0).max(1).optional(),
      stop: z.union([z.string(), z.array(z.string())]).optional(),
      tools: z.array(z.unknown()).optional().describe("Optional OpenAI-style tools"),
    }),
  },
  async (args) => {
    try {
      const { apiKey, baseUrl } = getConfig();
      requireApiKey(apiKey);
      const result = await chatCompletion(apiKey, baseUrl, {
        model: args.model,
        messages: args.messages,
        temperature: args.temperature,
        max_tokens: args.max_tokens,
        top_p: args.top_p,
        stop: args.stop,
        tools: args.tools,
      });
      return textResult({
        base_url: baseUrl,
        model: args.model,
        content: result.content,
        usage: result.usage ?? null,
      });
    } catch (err) {
      return errorResult(err);
    }
  }
);

async function main() {
  // Fail fast on missing key only when tools are called; allow server to start
  // so Cursor can list tools. Still normalize default URL for logs.
  const { baseUrl } = getConfig();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr only — stdout is reserved for MCP JSON-RPC
  console.error(`cookiecat 0.1.0 ready (base=${baseUrl})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

// Re-export for smoke scripts / tests
export { DEFAULT_BASE_URL, listModels, chatCompletion, requireApiKey };

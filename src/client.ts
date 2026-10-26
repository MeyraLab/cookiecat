/**
 * RelayRouter OpenAI-compatible HTTP client (pure fetch).
 */

export const DEFAULT_BASE_URL = "https://api.relayrouter.ai/v1";

export class RelayRouterError extends Error {
  readonly status?: number;
  readonly bodySummary?: string;

  constructor(message: string, status?: number, bodySummary?: string) {
    super(message);
    this.name = "RelayRouterError";
    this.status = status;
    this.bodySummary = bodySummary;
  }
}

export function normalizeBaseUrl(raw?: string | null): string {
  const base = (raw?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return base;
}

export function requireApiKey(raw?: string | null): string {
  const key = raw?.trim() ?? "";
  if (!key) {
    throw new RelayRouterError(
      "Missing RELAYROUTER_API_KEY. Set the plugin variable or environment variable RELAYROUTER_API_KEY (sk-…) before calling RelayRouter tools."
    );
  }
  return key;
}

function summarizeBody(text: string, max = 400): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function statusMessage(status: number): string {
  switch (status) {
    case 401:
      return "Unauthorized (401): invalid or missing API key.";
    case 403:
      return "Forbidden (403): key valid but not allowed for this resource.";
    case 404:
      return "Not found (404): check BASE_URL and path.";
    case 429:
      return "Rate limited (429): slow down or retry later.";
    default:
      if (status >= 500) return `Upstream server error (${status}).`;
      return `HTTP ${status}.`;
  }
}

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type ChatCompletionParams = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string | string[];
  tools?: unknown[];
};

export type ListModelsResult = {
  object?: string;
  data: Array<Record<string, unknown>>;
};

export type ChatCompletionResult = {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  raw?: unknown;
};

async function relayFetch(
  baseUrl: string,
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${normalizeBaseUrl(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new RelayRouterError(`Network error calling RelayRouter: ${msg}`);
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    const summary = summarizeBody(bodyText);
    throw new RelayRouterError(
      `${statusMessage(res.status)} Upstream body: ${summary || "(empty)"}`,
      res.status,
      summary
    );
  }
  return res;
}

export async function listModels(
  apiKey: string,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<ListModelsResult> {
  const key = requireApiKey(apiKey);
  const res = await relayFetch(baseUrl, key, "/models", { method: "GET" });
  const json = (await res.json()) as {
    object?: string;
    data?: Array<Record<string, unknown>>;
  };
  const data = Array.isArray(json.data) ? json.data : [];
  return { object: json.object, data };
}

export async function chatCompletion(
  apiKey: string,
  baseUrl: string,
  params: ChatCompletionParams
): Promise<ChatCompletionResult> {
  const key = requireApiKey(apiKey);
  const body = {
    model: params.model,
    messages: params.messages,
    stream: false as const,
    ...(params.temperature !== undefined
      ? { temperature: params.temperature }
      : {}),
    ...(params.max_tokens !== undefined
      ? { max_tokens: params.max_tokens }
      : {}),
    ...(params.top_p !== undefined ? { top_p: params.top_p } : {}),
    ...(params.stop !== undefined ? { stop: params.stop } : {}),
    ...(params.tools !== undefined ? { tools: params.tools } : {}),
  };
  const res = await relayFetch(baseUrl, key, "/chat/completions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  return {
    content: typeof content === "string" ? content : JSON.stringify(content),
    usage: json.usage,
    raw: json,
  };
}

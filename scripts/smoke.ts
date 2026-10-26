/**
 * Smoke test without a full MCP client.
 * - Always checks missing-key error clarity
 * - If RELAYROUTER_API_KEY is set, calls list_models + short chat_completion
 * Never prints the full API key.
 */
import {
  RelayRouterError,
  chatCompletion,
  listModels,
  normalizeBaseUrl,
  requireApiKey,
  DEFAULT_BASE_URL,
} from "../src/client.ts";

function maskKey(key: string): string {
  if (key.length <= 8) return "(too short to mask)";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function testMissingKey(): Promise<void> {
  let threw = false;
  try {
    requireApiKey("");
  } catch (err) {
    threw = true;
    assert(err instanceof RelayRouterError, "expected RelayRouterError");
    assert(
      /RELAYROUTER_API_KEY/.test(err.message),
      `missing-key message should mention RELAYROUTER_API_KEY, got: ${err.message}`
    );
    console.log("OK missing-key:", err.message);
  }
  assert(threw, "requireApiKey('') should throw");

  // Also via listModels
  try {
    await listModels("   ");
    throw new Error("listModels with blank key should throw");
  } catch (err) {
    assert(err instanceof RelayRouterError, "expected RelayRouterError from listModels");
    assert(/RELAYROUTER_API_KEY/.test(err.message), err.message);
    console.log("OK listModels blank key:", err.message);
  }
}

async function testLive(apiKey: string, baseUrl: string): Promise<void> {
  console.log(`Live base=${baseUrl} key=${maskKey(apiKey)}`);
  const listed = await listModels(apiKey, baseUrl);
  assert(Array.isArray(listed.data), "data should be array");
  assert(listed.data.length > 0, "expected at least one model");
  const ids = listed.data
    .map((m) => (typeof m.id === "string" ? m.id : ""))
    .filter(Boolean);
  console.log(`OK list_models count=${ids.length} sample=${ids.slice(0, 5).join(", ")}`);

  const preferred = [
    "deepseek-v4-flash",
    "deepseek-chat",
    "gpt-4o-mini",
    "gemini-2.0-flash",
  ];
  const model =
    preferred.find((p) => ids.includes(p)) ??
    ids.find((id) => /flash|mini|small|lite|haiku/i.test(id)) ??
    ids[0];
  assert(model, "no model id available");

  const chat = await chatCompletion(apiKey, baseUrl, {
    model,
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    max_tokens: 16,
    temperature: 0,
  });
  console.log(
    `OK chat_completion model=${model} content=${JSON.stringify(chat.content).slice(0, 120)} usage=${JSON.stringify(chat.usage ?? null)}`
  );
}

async function main() {
  console.log("=== smoke: missing key ===");
  await testMissingKey();

  const apiKey = process.env.RELAYROUTER_API_KEY?.trim() ?? "";
  const baseUrl = normalizeBaseUrl(process.env.RELAYROUTER_BASE_URL || DEFAULT_BASE_URL);

  if (!apiKey) {
    console.log("=== smoke: skip live (no RELAYROUTER_API_KEY) ===");
    console.log("RESULT: install/build path + missing-key OK; live calls pending key");
    return;
  }

  console.log("=== smoke: live ===");
  await testLive(apiKey, baseUrl);
  console.log("RESULT: all smoke checks passed");
}

main().catch((err) => {
  console.error("SMOKE FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
});

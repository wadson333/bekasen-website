/**
 * OpenRouter — minimal chat-completion wrapper for the Bekasen lead
 * qualification chatbot. Non-streaming for simplicity. Times out at 12s and
 * surfaces errors so the caller can fall back to the rule-based engine.
 *
 * Usage:
 *   const res = await openRouterChat({ messages: [...], model });
 *   if (!res.ok) -> fallback
 *   const text = res.text;
 */

export type OpenRouterRole = "system" | "user" | "assistant";
export type OpenRouterMessage = { role: OpenRouterRole; content: string };

export type OpenRouterResult =
  | { ok: true; text: string; modelUsed: string; usage?: { promptTokens?: number; completionTokens?: number } }
  | { ok: false; reason: "no_key" | "timeout" | "http_error" | "bad_response" | "exception"; status?: number; detail?: string };

const DEFAULT_MODEL = "anthropic/claude-3-haiku";
const TIMEOUT_MS = 12_000;
const MAX_TOKENS = 400;

export async function openRouterChat(opts: {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
}): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey || apiKey === "PLACEHOLDER") {
    return { ok: false, reason: "no_key" };
  }

  const model = opts.model || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  const referer = process.env.OPENROUTER_REFERER?.trim() || "https://bekasen.com";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": "Bekasen Lead Qualification",
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, reason: "http_error", status: res.status, detail: detail.slice(0, 500) };
    }

    type CompletionResponse = {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const json = (await res.json()) as CompletionResponse;
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, reason: "bad_response", detail: "empty content" };
    }

    return {
      ok: true,
      text,
      modelUsed: model,
      usage: {
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens,
      },
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    return {
      ok: false,
      reason: isAbort ? "timeout" : "exception",
      detail: err instanceof Error ? err.message.slice(0, 500) : "unknown",
    };
  }
}

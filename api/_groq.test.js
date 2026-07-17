import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callGroq, GroqError } from "./_groq.js";

function jsonResponse(body, { ok = true, status = 200, finishReason = "stop" } = {}) {
  return {
    ok,
    status,
    json: async () => ({ choices: [{ message: { content: body }, finish_reason: finishReason }] }),
    text: async () => body,
  };
}

const origEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...origEnv, GROQ_API_KEY: "test-groq-key" };
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  process.env = { ...origEnv };
});

describe("callGroq — request shape", () => {
  it("sends the model, reasoning_effort, json response_format, and Bearer auth", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"ok":true}'));
    await callGroq("hello");
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer test-groq-key");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.reasoning_effort).toBe("low");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages).toEqual([{ role: "user", content: "hello" }]);
  });

  it("defaults max_tokens to 1700 when not specified", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"ok":true}'));
    await callGroq("hello");
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(1700);
  });

  it("passes a custom maxTokens through", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"ok":true}'));
    await callGroq("hello", { maxTokens: 2300 });
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.max_tokens).toBe(2300);
  });

  it("prepends a system message only when one is given", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"ok":true}'));
    await callGroq("hello", { systemMessage: "be concise" });
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "system", content: "be concise" },
      { role: "user", content: "hello" },
    ]);
  });

  it("omits the system message entirely when none is given", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"ok":true}'));
    await callGroq("hello");
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.messages).toHaveLength(1);
  });
});

describe("callGroq — network/timeout failures", () => {
  it("maps an AbortError to GroqError(timeout)", async () => {
    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";
    global.fetch.mockRejectedValue(abortErr);
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "timeout" });
  });

  it("maps any other fetch rejection to GroqError(network_error)", async () => {
    global.fetch.mockRejectedValue(new Error("DNS lookup failed"));
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "network_error" });
  });
});

describe("callGroq — HTTP error mapping", () => {
  it("maps a 429 response to GroqError(rate_limited)", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429, text: async () => "slow down" });
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "rate_limited" });
  });

  it("maps any other non-ok status to GroqError(gateway_error)", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => "internal error" });
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "gateway_error" });
  });

  it("truncates the error detail to 300 chars", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => "x".repeat(1000) });
    try {
      await callGroq("hello");
      expect.unreachable();
    } catch (e) {
      expect(e.detail.length).toBe(300);
    }
  });
});

describe("callGroq — response parsing", () => {
  it("parses a clean JSON content string", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"mood":"tense","turns":[]}'));
    const result = await callGroq("hello");
    expect(result).toEqual({ mood: "tense", turns: [] });
  });

  it("strips markdown code fences before parsing", async () => {
    global.fetch.mockResolvedValue(jsonResponse('```json\n{"mood":"warm"}\n```'));
    const result = await callGroq("hello");
    expect(result).toEqual({ mood: "warm" });
  });

  it("extracts JSON even with leading/trailing prose around it", async () => {
    global.fetch.mockResolvedValue(jsonResponse('Sure, here you go: {"mood":"hopeful"} — hope that helps!'));
    const result = await callGroq("hello");
    expect(result).toEqual({ mood: "hopeful" });
  });

  it("throws GroqError(truncated_response) when finish_reason is length", async () => {
    global.fetch.mockResolvedValue(jsonResponse('{"mood":"tense"', { finishReason: "length" }));
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "truncated_response" });
  });

  it("throws GroqError(unparseable_response) for genuinely broken JSON", async () => {
    global.fetch.mockResolvedValue(jsonResponse("this is not json at all, no braces"));
    await expect(callGroq("hello")).rejects.toBeInstanceOf(GroqError);
    global.fetch.mockResolvedValue(jsonResponse("this is not json at all, no braces"));
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "unparseable_response" });
  });

  it("throws GroqError(unparseable_response) when content is entirely empty", async () => {
    global.fetch.mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ choices: [{ message: {}, finish_reason: "stop" }] }),
    });
    await expect(callGroq("hello")).rejects.toMatchObject({ kind: "unparseable_response" });
  });
});

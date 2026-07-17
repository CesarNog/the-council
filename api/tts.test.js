import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./_rateLimit.js", () => ({ enforceEndpointLimit: vi.fn(async () => true) }));

import { enforceEndpointLimit } from "./_rateLimit.js";
import handler from "./tts.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  res.end = vi.fn(() => res);
  return res;
}

function mockReq(overrides = {}) {
  return {
    method: "POST",
    headers: { "content-length": "50" },
    body: { text: "You already know. You're just afraid.", persona: "shadow" },
    ...overrides,
  };
}

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body, text: async () => JSON.stringify(body) };
}

const origEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  enforceEndpointLimit.mockResolvedValue(true);
  process.env = { ...origEnv, OPENAI_API_KEY: "", GEMINI_TTS_API_KEY: "" };
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_TTS_API_KEY;
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  process.env = { ...origEnv };
});

describe("POST /api/tts — request gating", () => {
  it("rejects non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("stops at the rate limiter before touching any provider", async () => {
    enforceEndpointLimit.mockImplementation(async (req, res) => {
      res.status(429).json({ error: "rate_limited" });
      return false;
    });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when neither provider key is configured", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "tts_not_configured" });
  });

  it("rejects an empty text body with 400", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const res = mockRes();
    await handler(mockReq({ body: { text: "", persona: "shadow" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("POST /api/tts — OpenAI path", () => {
  it("requests the persona's mapped voice and streams back mp3 audio", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch.mockResolvedValue({ ok: true, status: 200, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer });
    const res = mockRes();
    await handler(mockReq({ body: { text: "hello", persona: "shadow" } }), res);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/audio/speech",
      expect.objectContaining({ method: "POST" })
    );
    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(sentBody.voice).toBe("ballad"); // shadow's mapped OpenAI voice
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "audio/mpeg");
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(res.end).toHaveBeenCalled();
  });

  it("falls back to the default voice for an unmapped/missing persona", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch.mockResolvedValue({ ok: true, status: 200, arrayBuffer: async () => new Uint8Array([1]).buffer });
    const res = mockRes();
    await handler(mockReq({ body: { text: "hello" } }), res); // no persona
    const sentBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(sentBody.voice).toBe("alloy");
  });
});

describe("POST /api/tts — Gemini path", () => {
  it("uses Gemini when only the Gemini key is configured, and wraps PCM as WAV", async () => {
    process.env.GEMINI_TTS_API_KEY = "test-key";
    const pcmB64 = Buffer.from([0, 1, 2, 3]).toString("base64");
    global.fetch.mockResolvedValue(jsonResponse({
      candidates: [{ content: { parts: [{ inlineData: { data: pcmB64, mimeType: "audio/L16;rate=24000" } } ] } }],
    }));
    const res = mockRes();
    await handler(mockReq({ body: { text: "hello", persona: "monk" } }), res);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("generativelanguage.googleapis.com"), expect.any(Object));
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "audio/wav");
    expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
    const written = res.end.mock.calls[0][0];
    expect(written.subarray(0, 4).toString()).toBe("RIFF"); // valid WAV container
  });
});

describe("POST /api/tts — failure and fallback", () => {
  it("falls back to Gemini when OpenAI fails and both keys are configured", async () => {
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.GEMINI_TTS_API_KEY = "gemini-key";
    const pcmB64 = Buffer.from([9, 9]).toString("base64");
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "openai down" })
      .mockResolvedValueOnce(jsonResponse({
        candidates: [{ content: { parts: [{ inlineData: { data: pcmB64, mimeType: "audio/L16;rate=24000" } } ] } }],
      }));
    const res = mockRes();
    await handler(mockReq(), res);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "audio/wav");
    expect(res.end).toHaveBeenCalled();
  });

  it("returns a safe 502 without leaking provider error detail when there is no fallback key", async () => {
    process.env.OPENAI_API_KEY = "openai-key";
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => "internal org_secret_123" });
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(502);
    const sent = res.json.mock.calls[0][0];
    expect(JSON.stringify(sent)).not.toContain("org_secret_123");
  });

  it("returns a safe 502 when both OpenAI and the Gemini fallback fail", async () => {
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.GEMINI_TTS_API_KEY = "gemini-key";
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "openai down" })
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "gemini also down, org_secret_456" });
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(502);
    const sent = res.json.mock.calls[0][0];
    expect(JSON.stringify(sent)).not.toContain("org_secret_456");
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kvStore = new Map();
vi.mock("./_kv.js", () => ({
  kvGet: vi.fn(async (key) => (kvStore.has(key) ? kvStore.get(key) : null)),
  kvPut: vi.fn(async (key, value) => { kvStore.set(key, value); }),
}));
vi.mock("./_rateLimit.js", () => ({ enforceRateLimit: vi.fn(async () => true) }));
vi.mock("./_email.js", () => ({ getResend: vi.fn(() => null) }));

import { kvGet, kvPut } from "./_kv.js";
import { enforceRateLimit } from "./_rateLimit.js";
import { getResend } from "./_email.js";
import handler from "./waitlist.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

function mockReq(overrides = {}) {
  return { method: "POST", body: { email: "person@example.com" }, ...overrides };
}

const origEnv = { ...process.env };

beforeEach(() => {
  kvStore.clear();
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(true);
  getResend.mockReturnValue(null);
  process.env = { ...origEnv };
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...origEnv };
});

describe("POST /api/waitlist — request gating", () => {
  it("rejects non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("stops at the rate limiter before touching KV", async () => {
    enforceRateLimit.mockImplementation(async (req, res) => {
      res.status(429).json({ error: "rate_limited" });
      return false;
    });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(kvGet).not.toHaveBeenCalled();
  });

  it("rejects a missing email", async () => {
    const res = mockRes();
    await handler(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects a malformed email", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { email: "not-an-email" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(kvPut).not.toHaveBeenCalled();
  });
});

describe("POST /api/waitlist — success path", () => {
  it("stores a new email lowercased/trimmed and reports alreadyIn: false", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { email: "  Person@Example.com  " } }), res);
    expect(res.json).toHaveBeenCalledWith({ ok: true, alreadyIn: false });
    expect(kvStore.has("waitlist:person@example.com")).toBe(true);
  });

  it("does not re-write KV or resend a confirmation for an already-joined email", async () => {
    kvStore.set("waitlist:person@example.com", JSON.stringify({ joinedAt: 1 }));
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ ok: true, alreadyIn: true });
    expect(kvPut).not.toHaveBeenCalled();
  });

  it("returns 503 without crashing when the KV write fails", async () => {
    kvPut.mockRejectedValueOnce(new Error("kv down"));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it("attempts a confirmation email send for a genuinely new signup when Resend is configured", async () => {
    const send = vi.fn().mockResolvedValue({});
    getResend.mockReturnValue({ emails: { send } });
    process.env.RESEND_FROM_EMAIL = "hello@thecouncil.test";
    const res = mockRes();
    await handler(mockReq({ body: { email: "new@example.com", language: "pt" } }), res);
    await new Promise(r => setTimeout(r, 0)); // let the fire-and-forget email call settle
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: "new@example.com",
      subject: "Você está na lista — The Council Premium",
    }));
  });

  it("never lets a failed confirmation email affect the HTTP response", async () => {
    const send = vi.fn().mockRejectedValue(new Error("resend down"));
    getResend.mockReturnValue({ emails: { send } });
    process.env.RESEND_FROM_EMAIL = "hello@thecouncil.test";
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: true, alreadyIn: false });
  });
});

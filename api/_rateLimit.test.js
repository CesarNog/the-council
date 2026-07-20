import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kvStore = new Map();
vi.mock("./_kv.js", () => ({
  kvGet: vi.fn(async (key) => (kvStore.has(key) ? kvStore.get(key) : null)),
  kvPut: vi.fn(async (key, value) => { kvStore.set(key, value); }),
}));

vi.mock("./_upstash.js", () => ({
  checkUpstashLimit: vi.fn(),
  councilTier: vi.fn(),
  isUpstashConfigured: vi.fn(() => false),
}));

import { kvGet, kvPut } from "./_kv.js";
import { checkUpstashLimit, councilTier, isUpstashConfigured } from "./_upstash.js";
import { checkRateLimit, clientIp, enforceRateLimit, enforceCouncilLimit, enforceEndpointLimit, _resetMemCounters } from "./_rateLimit.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

function mockReq(overrides = {}) {
  return { headers: {}, socket: { remoteAddress: "10.0.0.1" }, ...overrides };
}

beforeEach(() => {
  kvStore.clear();
  _resetMemCounters();
  vi.clearAllMocks();
  kvGet.mockImplementation(async (key) => (kvStore.has(key) ? kvStore.get(key) : null));
  kvPut.mockImplementation(async (key, value) => { kvStore.set(key, value); });
  isUpstashConfigured.mockReturnValue(false);
});

afterEach(() => vi.restoreAllMocks());

describe("clientIp", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const req = mockReq({ headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178" } });
    expect(clientIp(req)).toBe("203.0.113.5");
  });

  it("trims whitespace around the first hop", () => {
    const req = mockReq({ headers: { "x-forwarded-for": "  203.0.113.5  , 70.41.3.18" } });
    expect(clientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to socket.remoteAddress when no header is present", () => {
    const req = mockReq({ headers: {}, socket: { remoteAddress: "192.168.1.1" } });
    expect(clientIp(req)).toBe("192.168.1.1");
  });

  it("falls back to \"unknown\" when neither is available", () => {
    const req = mockReq({ headers: {}, socket: undefined });
    expect(clientIp(req)).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  it("allows the first request and persists count=1", async () => {
    const result = await checkRateLimit("rl:test", "1.2.3.4", { limit: 3, windowMs: 60_000 });
    expect(result).toEqual({ allowed: true });
    const stored = JSON.parse(kvStore.get("rl:test:1.2.3.4"));
    expect(stored.c).toBe(1);
  });

  it("blocks once the count reaches the limit within the window", async () => {
    kvStore.set("rl:test:1.2.3.4", JSON.stringify({ c: 3, t: Date.now() }));
    const result = await checkRateLimit("rl:test", "1.2.3.4", { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("resets the window once windowMs has elapsed", async () => {
    kvStore.set("rl:test:1.2.3.4", JSON.stringify({ c: 3, t: Date.now() - 61_000 }));
    const result = await checkRateLimit("rl:test", "1.2.3.4", { limit: 3, windowMs: 60_000 });
    expect(result).toEqual({ allowed: true });
    const stored = JSON.parse(kvStore.get("rl:test:1.2.3.4"));
    expect(stored.c).toBe(1);
  });

  it("scopes counters per IP under the same prefix", async () => {
    await checkRateLimit("rl:test", "1.1.1.1", { limit: 1, windowMs: 60_000 });
    const second = await checkRateLimit("rl:test", "2.2.2.2", { limit: 1, windowMs: 60_000 });
    expect(second.allowed).toBe(true);
  });

  it("fails open (allows) when the KV read errors", async () => {
    kvGet.mockRejectedValueOnce(new Error("kv down"));
    const result = await checkRateLimit("rl:test", "1.2.3.4", { limit: 1, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
  });

  it("does not throw when the KV write fails — the request still succeeds", async () => {
    kvPut.mockRejectedValueOnce(new Error("kv down"));
    await expect(checkRateLimit("rl:test", "1.2.3.4", { limit: 3, windowMs: 60_000 })).resolves.toEqual({ allowed: true });
  });
});

describe("enforceRateLimit", () => {
  it("returns true and touches nothing on res when allowed", async () => {
    const req = mockReq({ headers: { "x-forwarded-for": "9.9.9.9" } });
    const res = mockRes();
    const ok = await enforceRateLimit(req, res, "rl:ep", { limit: 5, windowMs: 60_000 });
    expect(ok).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("sets Retry-After and responds 429 when blocked", async () => {
    kvStore.set("rl:ep:9.9.9.9", JSON.stringify({ c: 5, t: Date.now() }));
    const req = mockReq({ headers: { "x-forwarded-for": "9.9.9.9" } });
    const res = mockRes();
    const ok = await enforceRateLimit(req, res, "rl:ep", { limit: 5, windowMs: 60_000 });
    expect(ok).toBe(false);
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "rate_limited" }));
  });
});

describe("enforceCouncilLimit", () => {
  it("uses the KV per-IP path (3/min) when Upstash is not configured", async () => {
    isUpstashConfigured.mockReturnValue(false);
    const req = mockReq({ headers: { "x-forwarded-for": "5.5.5.5" } });
    const res = mockRes();
    for (let i = 0; i < 3; i++) {
      expect(await enforceCouncilLimit(req, res, null, null)).toBe(true);
    }
    const blocked = await enforceCouncilLimit(req, res, null, null);
    expect(blocked).toBe(false);
    expect(checkUpstashLimit).not.toHaveBeenCalled();
  });

  it("routes through Upstash with the caller's tier when configured, and allows", async () => {
    isUpstashConfigured.mockReturnValue(true);
    councilTier.mockReturnValue("free");
    checkUpstashLimit.mockResolvedValue({ allowed: true });
    const req = mockReq({ headers: { "x-forwarded-for": "5.5.5.5" } });
    const res = mockRes();
    const session = { sub: "user-123" };
    const ok = await enforceCouncilLimit(req, res, session, { plan: "free" });
    expect(ok).toBe(true);
    expect(checkUpstashLimit).toHaveBeenCalledWith("user:user-123", "free");
  });

  it("responds 429 with tier-specific upgrade messaging for a blocked anonymous caller", async () => {
    isUpstashConfigured.mockReturnValue(true);
    councilTier.mockReturnValue("anonymous");
    checkUpstashLimit.mockResolvedValue({ allowed: false, retryAfter: 120 });
    const req = mockReq({ headers: { "x-forwarded-for": "5.5.5.5" } });
    const res = mockRes();
    const ok = await enforceCouncilLimit(req, res, null, null);
    expect(ok).toBe(false);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      tier: "anonymous",
      message: "sign_in_for_more",
      retryAfter: 120,
    }));
  });

  it("responds with upgrade_for_more messaging for a blocked signed-in (non-premium) caller", async () => {
    isUpstashConfigured.mockReturnValue(true);
    councilTier.mockReturnValue("free");
    checkUpstashLimit.mockResolvedValue({ allowed: false, retryAfter: 60 });
    const req = mockReq({ headers: { "x-forwarded-for": "5.5.5.5" } });
    const res = mockRes();
    const ok = await enforceCouncilLimit(req, res, { sub: "user-123" }, { plan: "free" });
    expect(ok).toBe(false);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "upgrade_for_more" }));
  });

  it("keys by user sub when signed in, and by IP when anonymous", async () => {
    isUpstashConfigured.mockReturnValue(true);
    councilTier.mockReturnValue("anonymous");
    checkUpstashLimit.mockResolvedValue({ allowed: true });
    const req = mockReq({ headers: { "x-forwarded-for": "7.7.7.7" } });
    const res = mockRes();
    await enforceCouncilLimit(req, res, null, null);
    expect(checkUpstashLimit).toHaveBeenCalledWith("ip:7.7.7.7", "anonymous");
  });

  it("fails open when the Upstash call itself throws", async () => {
    isUpstashConfigured.mockReturnValue(true);
    councilTier.mockReturnValue("free");
    checkUpstashLimit.mockRejectedValue(new Error("upstash down"));
    const req = mockReq({ headers: { "x-forwarded-for": "5.5.5.5" } });
    const res = mockRes();
    const ok = await enforceCouncilLimit(req, res, { sub: "u1" }, {});
    expect(ok).toBe(true);
  });
});

describe("enforceEndpointLimit", () => {
  it("uses a 5/min KV limit for tts when Upstash is not configured", async () => {
    isUpstashConfigured.mockReturnValue(false);
    const req = mockReq({ headers: { "x-forwarded-for": "8.8.8.8" } });
    const res = mockRes();
    for (let i = 0; i < 5; i++) {
      expect(await enforceEndpointLimit(req, res, "tts")).toBe(true);
    }
    expect(await enforceEndpointLimit(req, res, "tts")).toBe(false);
  });

  it("uses a 10/min KV limit for auth when Upstash is not configured", async () => {
    isUpstashConfigured.mockReturnValue(false);
    const req = mockReq({ headers: { "x-forwarded-for": "8.8.8.9" } });
    const res = mockRes();
    for (let i = 0; i < 10; i++) {
      expect(await enforceEndpointLimit(req, res, "auth")).toBe(true);
    }
    expect(await enforceEndpointLimit(req, res, "auth")).toBe(false);
  });

  it("uses tiered Upstash limiting by IP when configured", async () => {
    isUpstashConfigured.mockReturnValue(true);
    checkUpstashLimit.mockResolvedValue({ allowed: false, retryAfter: 30 });
    const req = mockReq({ headers: { "x-forwarded-for": "8.8.8.8" } });
    const res = mockRes();
    const ok = await enforceEndpointLimit(req, res, "tts");
    expect(ok).toBe(false);
    expect(checkUpstashLimit).toHaveBeenCalledWith("ip:8.8.8.8", "tts");
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "30");
  });
});

// The KV fallback's read-then-write has no atomicity: concurrent calls
// racing on the same key can all read the same pre-write count and all be
// admitted past the limit. An earlier version of this suite measured that
// gap directly (5 racers with limit 2 → all 5 admitted). The synchronous
// in-memory same-instance guard now closes it for requests handled by the
// same warm function instance — exactly what a burst produces under
// Vercel's instance reuse. Cross-instance over-admission remains possible
// without Upstash; that part stays prose (CLAUDE.md) because it can't be
// reproduced inside one process.
describe("checkRateLimit under concurrent load (same-instance guard)", () => {
  it("blocks same-instance racers at the limit even when their KV reads race", async () => {
    // Five truly concurrent callers, limit of 2 — every call's kvGet(...)
    // fires before any kvPut(...) lands, so KV alone would admit all five.
    // The synchronous in-memory counter runs before the first await and
    // admits exactly two.
    const results = await Promise.all(
      Array.from({ length: 5 }, () => checkRateLimit("rl:race", "9.9.9.9", { limit: 2, windowMs: 60_000 }))
    );
    const allowedCount = results.filter(r => r.allowed).length;
    expect(allowedCount).toBe(2);
    const blocked = results.find(r => !r.allowed);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("enforces the limit for sequential calls (memory and KV agree)", async () => {
    let allowedCount = 0;
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit("rl:sequential", "9.9.9.9", { limit: 2, windowMs: 60_000 });
      if (r.allowed) allowedCount++;
    }
    expect(allowedCount).toBe(2);
  });

  it("does not let a burst on one IP consume another IP's budget, even when racing", async () => {
    const [a, b] = await Promise.all([
      checkRateLimit("rl:race2", "1.1.1.1", { limit: 1, windowMs: 60_000 }),
      checkRateLimit("rl:race2", "2.2.2.2", { limit: 1, windowMs: 60_000 }),
    ]);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true); // different keys — correct isolation, not a race
  });

  it("still blocks via the memory guard when KV is down entirely (no more fail-open for same-instance bursts)", async () => {
    kvGet.mockRejectedValue(new Error("kv down"));
    kvPut.mockRejectedValue(new Error("kv down"));
    const results = [];
    for (let i = 0; i < 4; i++) {
      results.push(await checkRateLimit("rl:kvdown", "9.9.9.9", { limit: 2, windowMs: 60_000 }));
    }
    expect(results.filter(r => r.allowed)).toHaveLength(2);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kvStore = new Map();
vi.mock("./_kv.js", () => ({
  kvGet: vi.fn(async (key) => (kvStore.has(key) ? kvStore.get(key) : null)),
  kvPut: vi.fn(async (key, value) => { kvStore.set(key, value); }),
}));
vi.mock("./_rateLimit.js", () => ({ enforceEndpointLimit: vi.fn(async () => true) }));
vi.mock("./_supabase.js", () => ({ upsertProfileFromUser: vi.fn(async () => ({ id: "profile-1" })) }));
vi.mock("./_email.js", () => ({ sendWelcomeEmail: vi.fn(async () => ({ ok: true })) }));
vi.mock("@clerk/backend", () => ({ verifyToken: vi.fn() }));

import { verifyToken } from "@clerk/backend";
import { enforceEndpointLimit } from "./_rateLimit.js";
import { upsertProfileFromUser } from "./_supabase.js";
import { sendWelcomeEmail } from "./_email.js";
import handler from "./clerk-auth.js";

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
    headers: { authorization: "Bearer test-token-123" },
    ...overrides,
  };
}

const origEnv = { ...process.env };

beforeEach(() => {
  kvStore.clear();
  vi.clearAllMocks();
  enforceEndpointLimit.mockResolvedValue(true);
  process.env = { ...origEnv, CLERK_SECRET_KEY: "sk_test_123" };
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...origEnv };
});

describe("DELETE /api/clerk-auth", () => {
  it("clears the session cookie and returns 204", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "DELETE" }), res);
    expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.stringContaining("Max-Age=0"));
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe("POST /api/clerk-auth — request gating", () => {
  it("rejects unsupported methods", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 503 when CLERK_SECRET_KEY isn't configured, before rate limiting or verifying", async () => {
    delete process.env.CLERK_SECRET_KEY;
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(enforceEndpointLimit).not.toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it("stops at the rate limiter before verifying the token", async () => {
    enforceEndpointLimit.mockImplementation(async (req, res) => {
      res.status(429).json({ error: "rate_limited" });
      return false;
    });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it("returns 401 when the Authorization header has no Bearer token", async () => {
    const res = mockRes();
    await handler(mockReq({ headers: {} }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "missing_token" });
  });

  it("returns 401 without leaking verification detail when the Clerk token is invalid", async () => {
    verifyToken.mockRejectedValue(new Error("signature mismatch — key rotation abc123"));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_token" });
  });
});

describe("POST /api/clerk-auth — success path", () => {
  it("creates a new user, prefixes sub with clerk:, and derives a display name from given_name first", async () => {
    verifyToken.mockResolvedValue({ sub: "user_123", email: "a@b.com", given_name: "Alex", name: "Alex Full Name" });
    const res = mockRes();
    await handler(mockReq(), res);
    const user = res.json.mock.calls[0][0];
    expect(user.sub).toBe("clerk:user_123");
    expect(user.clerkId).toBe("user_123");
    expect(user.name).toBe("Alex");
    expect(user.authProvider).toBe("clerk");
    expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.stringContaining("council_session="));
  });

  it("falls back to name, then email prefix, then \"Seeker\" for the display name", async () => {
    verifyToken.mockResolvedValue({ sub: "u1", email: "a@b.com", name: "Just Name" });
    let res = mockRes();
    await handler(mockReq(), res);
    expect(res.json.mock.calls[0][0].name).toBe("Just Name");

    kvStore.clear();
    verifyToken.mockResolvedValue({ sub: "u2", email: "prefix@b.com" });
    res = mockRes();
    await handler(mockReq(), res);
    expect(res.json.mock.calls[0][0].name).toBe("prefix");

    kvStore.clear();
    verifyToken.mockResolvedValue({ sub: "u3" });
    res = mockRes();
    await handler(mockReq(), res);
    expect(res.json.mock.calls[0][0].name).toBe("Seeker");
  });

  it("sends a welcome email only for a brand-new user with an email", async () => {
    verifyToken.mockResolvedValue({ sub: "u1", email: "new@b.com", name: "New" });
    const res = mockRes();
    await handler(mockReq(), res);
    await new Promise(r => setTimeout(r, 0));
    expect(sendWelcomeEmail).toHaveBeenCalledWith({ to: "new@b.com", name: "New" });
  });

  it("does not send a welcome email on repeat sign-in", async () => {
    kvStore.set("user:clerk:u1", JSON.stringify({ sub: "clerk:u1", email: "a@b.com", name: "Alex" }));
    verifyToken.mockResolvedValue({ sub: "u1", email: "a@b.com", name: "Alex Fresh" });
    const res = mockRes();
    await handler(mockReq(), res);
    await new Promise(r => setTimeout(r, 0));
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("syncs the profile to Supabase on every sign-in", async () => {
    verifyToken.mockResolvedValue({ sub: "u1", email: "a@b.com", name: "Alex" });
    const res = mockRes();
    await handler(mockReq(), res);
    await new Promise(r => setTimeout(r, 0));
    expect(upsertProfileFromUser).toHaveBeenCalled();
  });

  it("preserves the existing name/situation on repeat sign-in but keeps the existing googlePicture over a fresh token picture (unlike auth.js)", async () => {
    kvStore.set("user:clerk:u1", JSON.stringify({
      sub: "clerk:u1", name: "Custom Name", situation: "Deciding", values: ["Freedom"],
      googlePicture: "http://old-pic", createdAt: 111,
    }));
    verifyToken.mockResolvedValue({ sub: "u1", email: "a@b.com", name: "Fresh Name", picture: "http://new-pic" });
    const res = mockRes();
    await handler(mockReq(), res);
    const user = res.json.mock.calls[0][0];
    expect(user.name).toBe("Custom Name");
    expect(user.situation).toBe("Deciding");
    expect(user.googlePicture).toBe("http://old-pic"); // existing wins here, opposite of auth.js
    expect(user.createdAt).toBe(111);
  });
});

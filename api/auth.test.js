import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kvStore = new Map();
vi.mock("./_kv.js", () => ({
  kvGet: vi.fn(async (key) => (kvStore.has(key) ? kvStore.get(key) : null)),
  kvPut: vi.fn(async (key, value) => { kvStore.set(key, value); }),
}));

vi.mock("./_rateLimit.js", () => ({ enforceEndpointLimit: vi.fn(async () => true) }));

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(() => "jwks-handle"),
}));

vi.mock("./_session.js", async () => {
  const actual = await vi.importActual("./_session.js");
  return { ...actual, makeSessionCookie: vi.fn(actual.makeSessionCookie), clearSessionCookie: vi.fn(actual.clearSessionCookie) };
});

import { jwtVerify } from "jose";
import { kvGet } from "./_kv.js";
import { enforceEndpointLimit } from "./_rateLimit.js";
import { makeSessionCookie, clearSessionCookie } from "./_session.js";
import handler, { requireUser } from "./auth.js";

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
    body: { credential: "a".repeat(30) },
    ...overrides,
  };
}

const origEnv = { ...process.env };

beforeEach(() => {
  kvStore.clear();
  vi.clearAllMocks();
  enforceEndpointLimit.mockResolvedValue(true);
  process.env = { ...origEnv, GOOGLE_CLIENT_ID: "test-client-id" };
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...origEnv };
});

describe("DELETE /api/auth", () => {
  it("clears the session cookie and returns 204 without touching KV or rate limiting", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "DELETE" }), res);
    expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie", clearSessionCookie());
    expect(res.status).toHaveBeenCalledWith(204);
    expect(kvGet).not.toHaveBeenCalled();
    expect(enforceEndpointLimit).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth — request gating", () => {
  it("rejects methods other than POST/DELETE", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("stops at the rate limiter before verifying the token", async () => {
    enforceEndpointLimit.mockImplementation(async (req, res) => {
      res.status(429).json({ error: "rate_limited" });
      return false;
    });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("rejects a credential that's too short to be a real JWT", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { credential: "short" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("returns 503 when GOOGLE_CLIENT_ID isn't configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "auth_not_configured" });
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("returns 401 without leaking verification detail when the Google token is invalid", async () => {
    jwtVerify.mockRejectedValue(new Error("signature verification failed for issuer xyz"));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_token" });
  });
});

describe("POST /api/auth — success path", () => {
  it("creates a new user with sane defaults and sets the session cookie", async () => {
    jwtVerify.mockResolvedValue({ payload: { sub: "google-1", email: "a@b.com", name: "Alex", picture: "http://pic" } });
    const res = mockRes();
    await handler(mockReq(), res);

    expect(res.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.stringContaining("council_session="));
    expect(res.status).toHaveBeenCalledWith(200);
    const user = res.json.mock.calls[0][0];
    expect(user).toMatchObject({
      sub: "google-1", email: "a@b.com", name: "Alex", googlePicture: "http://pic",
      customPicture: null, situation: "", values: [], debateHistory: [], eclipses: [],
    });
    expect(JSON.parse(kvStore.get("user:google-1")).sub).toBe("google-1");
  });

  it("preserves existing profile fields (name override, situation, history) on repeat sign-in", async () => {
    kvStore.set("user:google-1", JSON.stringify({
      sub: "google-1", name: "Custom Name", situation: "Deciding on a move", values: ["Freedom"],
      customPicture: "data:image/png;base64,xx", debateHistory: [{ id: "d1" }], eclipses: [], createdAt: 111,
    }));
    jwtVerify.mockResolvedValue({ payload: { sub: "google-1", email: "a@b.com", name: "Alex From Google", picture: "http://newpic" } });
    const res = mockRes();
    await handler(mockReq(), res);

    const user = res.json.mock.calls[0][0];
    expect(user.name).toBe("Custom Name"); // not overwritten by the fresh Google payload name
    expect(user.situation).toBe("Deciding on a move");
    expect(user.values).toEqual(["Freedom"]);
    expect(user.customPicture).toBe("data:image/png;base64,xx");
    expect(user.googlePicture).toBe("http://newpic"); // always refreshed from the latest token
    expect(user.debateHistory).toEqual([{ id: "d1" }]);
    expect(user.createdAt).toBe(111); // not reset on repeat sign-in
  });
});

describe("requireUser", () => {
  it("returns 401 and null when there is no session cookie", async () => {
    const res = mockRes();
    const result = await requireUser({ headers: {} }, res);
    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(kvGet).not.toHaveBeenCalled();
  });

  it("returns 401 when the session is valid but the KV user record is gone", async () => {
    const cookie = makeSessionCookie("google-1").split(";")[0];
    const res = mockRes();
    const result = await requireUser({ headers: { cookie } }, res);
    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns { sub, user } for a valid session with a KV record", async () => {
    kvStore.set("user:google-1", JSON.stringify({ sub: "google-1", name: "Alex" }));
    const cookie = makeSessionCookie("google-1").split(";")[0];
    const res = mockRes();
    const result = await requireUser({ headers: { cookie } }, res);
    expect(result).toEqual({ sub: "google-1", user: { sub: "google-1", name: "Alex" } });
    expect(res.status).not.toHaveBeenCalled();
  });
});

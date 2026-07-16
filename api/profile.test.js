import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./_kv.js", () => ({ kvPut: vi.fn(async () => {}) }));
vi.mock("./auth.js", () => ({ requireUser: vi.fn() }));
vi.mock("./_groq.js", async () => {
  const actual = await vi.importActual("./_groq.js");
  return { ...actual, callGroq: vi.fn() };
});

import { kvPut } from "./_kv.js";
import { requireUser } from "./auth.js";
import { callGroq, GroqError } from "./_groq.js";
import handler from "./profile.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

function baseUser(overrides = {}) {
  return {
    sub: "google-1", name: "Alex", situation: "Deciding on a move", values: ["Freedom"],
    lastVisit: null, lifeMode: null, debateHistory: [], eclipses: [],
    ...overrides,
  };
}

function mockReq(overrides = {}) {
  return { method: "GET", headers: { "content-length": "10" }, body: {}, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => vi.restoreAllMocks());

describe("/api/profile — auth gating", () => {
  it("does nothing further when requireUser has already written a 401", async () => {
    requireUser.mockImplementation(async (req, res) => { res.status(401).json({ error: "not_authenticated" }); return null; });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(kvPut).not.toHaveBeenCalled();
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("rejects unsupported methods once authenticated", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "DELETE" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe("GET /api/profile — Life Mode staleness gating", () => {
  it("never generates Life Mode for a first-time visitor (no prior lastVisit)", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lastVisit: null }) });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(callGroq).not.toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.lifeMode).toBeNull();
    expect(payload.lastVisit).toEqual(expect.any(Number)); // baseline established
  });

  it("does not generate Life Mode when the last visit was recent", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lastVisit: Date.now() - 1000 }) });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("generates Life Mode when the gap since last visit exceeds 12h", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lastVisit: Date.now() - 13 * 60 * 60 * 1000 }) });
    callGroq.mockResolvedValue({ persona: "monk", teaser: "Still thinking about it?", turns: [{ p: "monk", t: "..." }] });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(callGroq).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.lifeMode.teaser).toBe("Still thinking about it?");
    expect(payload.lifeMode.generatedAt).toEqual(expect.any(Number));
  });

  it("does not set lifeMode when Groq's response is missing teaser/turns", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lastVisit: Date.now() - 13 * 60 * 60 * 1000 }) });
    callGroq.mockResolvedValue({ persona: "monk" }); // no teaser, no turns
    const res = mockRes();
    await handler(mockReq(), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.lifeMode).toBeNull();
  });

  it("degrades gracefully (no crash, no lifeMode) when Groq generation fails", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lastVisit: Date.now() - 13 * 60 * 60 * 1000 }) });
    callGroq.mockRejectedValue(new GroqError("timeout", "took too long"));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.lifeMode).toBeNull();
  });

  it("persists the refreshed profile to KV on every GET, fire-and-forget", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(kvPut).toHaveBeenCalledWith("user:google-1", expect.any(String));
  });
});

describe("PATCH /api/profile — validation and field updates", () => {
  it("rejects an invalid body with 400 before touching KV", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { unknownField: "x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(kvPut).not.toHaveBeenCalled();
  });

  it("rejects an oversized body with 413", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", headers: { "content-length": String(600_000) }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it("trims and updates situation/values/picture", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { situation: "  New situation  ", values: ["Growth"], picture: "data:image/png;base64,xx" } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.situation).toBe("New situation");
    expect(next.values).toEqual(["Growth"]);
    expect(next.customPicture).toBe("data:image/png;base64,xx");
  });

  it("dismisses Life Mode when asked", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ lifeMode: { teaser: "..." } }) });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { dismissLifeMode: true } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.lifeMode).toBeNull();
  });

  it("records a debate, prepending to history newest-first and capping at 10", async () => {
    const existingHistory = Array.from({ length: 10 }, (_, i) => ({ id: `old-${i}` }));
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser({ debateHistory: existingHistory }) });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { recordDebate: { id: "new-1", question: "Should I move?", verdict: "Yes.", mood: "tense" } } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.debateHistory).toHaveLength(10);
    expect(next.debateHistory[0].id).toBe("new-1");
    expect(next.debateHistory.some(h => h.id === "old-9")).toBe(false); // oldest fell off
  });

  it("adds an eclipse entry only when the vote was unanimous (yes/no)", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { recordDebate: { id: "d1", question: "Q", unanimousVote: "yes" } } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.eclipses).toHaveLength(1);
    expect(next.eclipses[0].id).toBe("d1");
  });

  it("does not add an eclipse entry for a non-unanimous (or absent) vote", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { recordDebate: { id: "d1", question: "Q" } } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.eclipses).toHaveLength(0);
  });

  it("rejects recordDebate missing a required field (question) at the validation layer", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { recordDebate: { id: "d1" } } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(kvPut).not.toHaveBeenCalled();
  });

  it("leaves debateHistory untouched when question passes validation as an empty string (handler's own falsy guard)", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { recordDebate: { id: "d1", question: "" } } }), res);
    const next = res.json.mock.calls[0][0];
    expect(next.debateHistory).toHaveLength(0);
  });

  it("persists the updated profile to KV and awaits it before responding", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: baseUser() });
    const res = mockRes();
    await handler(mockReq({ method: "PATCH", body: { situation: "New" } }), res);
    expect(kvPut).toHaveBeenCalledWith("user:google-1", expect.stringContaining("New"));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

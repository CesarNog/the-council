import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const kvStore = new Map();
vi.mock("./_kv.js", () => ({
  kvGet: vi.fn(async (key) => (kvStore.has(key) ? kvStore.get(key) : null)),
  kvPut: vi.fn(async (key, value) => { kvStore.set(key, value); }),
}));

vi.mock("./_groq.js", async () => {
  const actual = await vi.importActual("./_groq.js");
  return { ...actual, callGroq: vi.fn() };
});

vi.mock("./_session.js", () => ({ getSessionFromRequest: vi.fn(() => null) }));
vi.mock("./_rateLimit.js", () => ({ enforceCouncilLimit: vi.fn(async () => true) }));
vi.mock("./_supabase.js", () => ({
  isSupabaseConfigured: vi.fn(() => false),
  persistDecisionBundle: vi.fn(async () => "decision-1"),
  upsertProfileFromUser: vi.fn(async () => ({ id: "profile-1" })),
}));

import { kvGet, kvPut } from "./_kv.js";
import { callGroq, GroqError } from "./_groq.js";
import { getSessionFromRequest } from "./_session.js";
import { enforceCouncilLimit } from "./_rateLimit.js";
import { isSupabaseConfigured, persistDecisionBundle } from "./_supabase.js";
import handler from "./council.js";

const ALL_PERSONAS = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];

function fullDebate(overrides = {}) {
  return {
    mood: "tense",
    turns: ALL_PERSONAS.map(p => ({ p, t: `${p} says something.` })),
    votes: ALL_PERSONAS.map(p => ({ p, v: "yes", r: "reason" })),
    verdict: "Go for it.",
    quote: "Ship it.",
    question: "What would you build first?",
    realities: [{ label: "A", line: "a" }, { label: "B", line: "b" }, { label: "C", line: "c" }],
    memoryEcho: null,
    ...overrides,
  };
}

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
    body: { question: "Should I move to another city?" },
    ...overrides,
  };
}

beforeEach(() => {
  kvStore.clear();
  vi.clearAllMocks();
  getSessionFromRequest.mockReturnValue(null);
  enforceCouncilLimit.mockResolvedValue(true);
  isSupabaseConfigured.mockReturnValue(false);
});

afterEach(() => vi.restoreAllMocks());

describe("POST /api/council — request gating", () => {
  it("rejects non-POST methods", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("rejects an empty question before ever calling Groq", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { question: "" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("rejects a question over the 500-char limit", async () => {
    const res = mockRes();
    await handler(mockReq({ body: { question: "x".repeat(501) } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("stops at the rate limiter and never calls Groq when the limit is exceeded", async () => {
    enforceCouncilLimit.mockImplementation(async (req, res) => {
      res.status(429).json({ error: "rate_limited" });
      return false;
    });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(callGroq).not.toHaveBeenCalled();
  });
});

describe("POST /api/council — success path", () => {
  it("returns 200 with a generated id merged into the debate JSON", async () => {
    callGroq.mockResolvedValue(fullDebate());
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(typeof payload.id).toBe("string");
    expect(payload.id.length).toBeGreaterThan(0);
    expect(payload.verdict).toBe("Go for it.");
  });

  it("persists to KV under asked — the debate's own `question` field never overwrites the real asked question (regression: CLAUDE.md's documented spread-order bug)", async () => {
    callGroq.mockResolvedValue(fullDebate({ question: "A completely different probing question" }));
    const res = mockRes();
    await handler(mockReq({ body: { question: "Should I move to another city?" } }), res);
    const id = res.json.mock.calls[0][0].id;
    const stored = JSON.parse(kvStore.get(`result:${id}`));
    expect(stored.asked).toBe("Should I move to another city?");
    expect(stored.question).toBe("A completely different probing question");
  });

  it("persists the result to KV with a 30-day TTL", async () => {
    callGroq.mockResolvedValue(fullDebate());
    const res = mockRes();
    await handler(mockReq(), res);
    expect(kvPut).toHaveBeenCalledWith(
      expect.stringMatching(/^result:/),
      expect.any(String),
      60 * 60 * 24 * 30
    );
  });

  it("does not touch Supabase when it is not configured", async () => {
    callGroq.mockResolvedValue(fullDebate());
    isSupabaseConfigured.mockReturnValue(false);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(persistDecisionBundle).not.toHaveBeenCalled();
  });

  it("persists a decision bundle to Supabase when configured", async () => {
    callGroq.mockResolvedValue(fullDebate());
    isSupabaseConfigured.mockReturnValue(true);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(persistDecisionBundle).toHaveBeenCalledWith(expect.objectContaining({
      question: "Should I move to another city?",
      publicSlug: expect.any(String),
    }));
  });
});

describe("POST /api/council — Groq failure mapping", () => {
  const cases = [
    ["timeout", 504],
    ["network_error", 504],
    ["rate_limited", 429],
    ["gateway_error", 502],
    ["unparseable_response", 502],
    ["truncated_response", 502],
  ];

  for (const [kind, status] of cases) {
    it(`maps GroqError(${kind}) to HTTP ${status} without leaking upstream detail`, async () => {
      callGroq.mockRejectedValue(new GroqError(kind, "upstream secret detail org_123"));
      const res = mockRes();
      vi.spyOn(console, "error").mockImplementation(() => {});
      await handler(mockReq(), res);
      expect(res.status).toHaveBeenCalledWith(status);
      const sent = res.json.mock.calls[0][0];
      expect(JSON.stringify(sent)).not.toContain("org_123");
    });
  }

  it("rejects with 502 when Groq returns a shape missing turns/votes/verdict", async () => {
    callGroq.mockResolvedValue({ mood: "tense" }); // no turns/votes/verdict
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: "unparseable_response" });
  });

  it("re-throws non-GroqError failures instead of swallowing them", async () => {
    callGroq.mockRejectedValue(new Error("totally unexpected"));
    const res = mockRes();
    await expect(handler(mockReq(), res)).rejects.toThrow("totally unexpected");
  });
});

describe("POST /api/council — persona composition and defensive filtering", () => {
  it("strips turns/votes for personas the model invented outside the valid set", async () => {
    callGroq.mockResolvedValue(fullDebate({
      turns: [...ALL_PERSONAS.map(p => ({ p, t: "x" })), { p: "impostor", t: "not real" }],
      votes: [...ALL_PERSONAS.map(p => ({ p, v: "yes" })), { p: "impostor", v: "yes" }],
    }));
    const res = mockRes();
    await handler(mockReq(), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.turns.some(t => t.p === "impostor")).toBe(false);
    expect(payload.votes.some(v => v.p === "impostor")).toBe(false);
  });

  it("dedupes duplicate votes from the same persona, keeping only the first", async () => {
    callGroq.mockResolvedValue(fullDebate({
      votes: [{ p: "founder", v: "yes", r: "first" }, { p: "founder", v: "no", r: "duplicate" }],
    }));
    const res = mockRes();
    await handler(mockReq(), res);
    const payload = res.json.mock.calls[0][0];
    const founderVotes = payload.votes.filter(v => v.p === "founder");
    expect(founderVotes).toHaveLength(1);
    expect(founderVotes[0].r).toBe("first");
  });

  it("restricts turns/votes to only the caller's selected personaIds when >=3 are given", async () => {
    callGroq.mockResolvedValue(fullDebate());
    const res = mockRes();
    await handler(mockReq({ body: { question: "Should I move?", personaIds: ["founder", "monk", "shadow"] } }), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.turns.every(t => ["founder", "monk", "shadow"].includes(t.p))).toBe(true);
    expect(payload.votes.every(v => ["founder", "monk", "shadow"].includes(v.p))).toBe(true);
  });

  it("ignores a personaIds selection with fewer than 3 valid entries and falls back to the full council", async () => {
    callGroq.mockResolvedValue(fullDebate());
    const res = mockRes();
    await handler(mockReq({ body: { question: "Should I move?", personaIds: ["founder", "monk"] } }), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.turns.length).toBe(ALL_PERSONAS.length);
  });

  it("nulls out memoryEcho when its persona isn't in the active council", async () => {
    callGroq.mockResolvedValue(fullDebate({ memoryEcho: { persona: "romantic", line: "..." } }));
    const res = mockRes();
    await handler(mockReq({ body: { question: "Should I move?", personaIds: ["founder", "monk", "shadow"] } }), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.memoryEcho).toBeNull();
  });

  it("keeps memoryEcho when its persona is in the active council", async () => {
    callGroq.mockResolvedValue(fullDebate({ memoryEcho: { persona: "monk", line: "..." } }));
    const res = mockRes();
    await handler(mockReq({ body: { question: "Should I move?", personaIds: ["founder", "monk", "shadow"] } }), res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.memoryEcho).toEqual({ persona: "monk", line: "..." });
  });
});

describe("POST /api/council — signed-in history", () => {
  it("passes no history to the prompt for anonymous callers", async () => {
    callGroq.mockResolvedValue(fullDebate());
    getSessionFromRequest.mockReturnValue(null);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(kvGet).not.toHaveBeenCalled();
    const prompt = callGroq.mock.calls[0][0];
    expect(prompt).not.toContain("Past matters this person already brought");
  });

  it("includes up to 3 most recent past debates for a signed-in caller", async () => {
    callGroq.mockResolvedValue(fullDebate());
    getSessionFromRequest.mockReturnValue({ sub: "user-1" });
    kvStore.set("user:user-1", JSON.stringify({
      debateHistory: [
        { question: "Q1", verdict: "V1" },
        { question: "Q2", verdict: "V2" },
        { question: "Q3", verdict: "V3" },
        { question: "Q4", verdict: "V4" },
      ],
    }));
    const res = mockRes();
    await handler(mockReq(), res);
    const prompt = callGroq.mock.calls[0][0];
    expect(prompt).toContain("Q1");
    expect(prompt).toContain("Q2");
    expect(prompt).toContain("Q3");
    expect(prompt).not.toContain("Q4");
  });
});

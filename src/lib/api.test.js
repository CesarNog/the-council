import { describe, it, expect, vi, beforeEach } from "vitest";

const VALID_DEBATE = {
  id: "abc123",
  mood: "electric",
  turns: [{ p: "founder", t: "Quit." }],
  votes: [{ p: "founder", v: "yes", r: "Go." }],
  verdict: "Leave.",
  question: "Why wait?",
  realities: [],
};

function makeFetch(status, body) {
  return vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    })
  );
}

async function freshSummon(fetchImpl) {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchImpl);
  const { summonCouncil } = await import("./api.js");
  return summonCouncil;
}

describe("summonCouncil", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("returns debate on success", async () => {
    const summonCouncil = await freshSummon(makeFetch(200, VALID_DEBATE));
    const result = await summonCouncil("Should I quit?", {}, "en");
    expect(result.verdict).toBe("Leave.");
  });

  it("filters out unknown persona turns", async () => {
    const debate = {
      ...VALID_DEBATE,
      turns: [{ p: "founder", t: "Go." }, { p: "ghost", t: "Boo." }],
    };
    const summonCouncil = await freshSummon(makeFetch(200, debate));
    const result = await summonCouncil("q", {}, "en");
    expect(result.turns.every(t => t.p !== "ghost")).toBe(true);
  });

  it("throws rate_limited with retryAfter on 429", async () => {
    const summonCouncil = await freshSummon(
      makeFetch(429, { error: "rate_limited", retryAfter: 42 })
    );
    const err = await summonCouncil("q", {}, "en").catch(e => e);
    expect(err.kind).toBe("rate_limited");
    expect(err.retryAfter).toBe(42);
  });

  it("throws rate_limited without retryAfter when body has none", async () => {
    const summonCouncil = await freshSummon(
      makeFetch(429, { error: "rate_limited" })
    );
    const err = await summonCouncil("q", {}, "en").catch(e => e);
    expect(err.kind).toBe("rate_limited");
    expect(err.retryAfter).toBeUndefined();
  });

  it("throws unreachable on non-429 error", async () => {
    const summonCouncil = await freshSummon(makeFetch(502, { error: "gateway_error" }));
    const err = await summonCouncil("q", {}, "en").catch(e => e);
    expect(err.kind).toBe("unreachable");
  });

  it("throws on bad debate shape", async () => {
    const summonCouncil = await freshSummon(makeFetch(200, { verdict: "ok" }));
    await expect(summonCouncil("q", {}, "en")).rejects.toThrow();
  });

  it("handles json parse failure on error response gracefully", async () => {
    const summonCouncil = await freshSummon(
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          json: () => Promise.reject(new Error("not json")),
        })
      )
    );
    const err = await summonCouncil("q", {}, "en").catch(e => e);
    expect(err.kind).toBe("unreachable");
    expect(err.retryAfter).toBeUndefined();
  });
});

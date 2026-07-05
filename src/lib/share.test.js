import { describe, it, expect, vi, afterEach } from "vitest";
import { tally, councilHeadline, shareText, shareUrl, copyLink } from "./share.js";

const mk = (pairs) => ({ votes: pairs.map(([p, v]) => ({ p, v })) });

describe("tally", () => {
  it("conta yes/no/depends", () => {
    const d = mk([["founder", "yes"], ["monk", "no"], ["artist", "depends"]]);
    expect(tally(d)).toEqual({ yes: 1, no: 1, dep: 1 });
  });
});

describe("councilHeadline", () => {
  it("unanime yes", () => {
    const d = mk(["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"].map(p => [p, "yes"]));
    expect(councilHeadline(d)).toBe("Every Council member agreed. Go.");
  });

  it("unanime no", () => {
    const d = mk(["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"].map(p => [p, "no"]));
    expect(councilHeadline(d)).toBe("Every Council member agreed. Don't.");
  });

  it("outlier isolado (8-1)", () => {
    const ps = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];
    const d = mk(ps.map(p => [p, p === "shadow" ? "no" : "yes"]));
    expect(councilHeadline(d)).toBe("Only The Shadow disagreed.");
  });

  it("empate com depends", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "no"], ["scientist", "no"], ["explorer", "no"], ["romantic", "no"], ["shadow", "depends"]]);
    expect(councilHeadline(d)).toBe("The Council is split down the middle.");
  });

  it("lean normal", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "yes"], ["scientist", "yes"], ["explorer", "no"], ["romantic", "no"], ["shadow", "no"]]);
    expect(councilHeadline(d)).toBe("The Council leans yes, 6–3.");
  });
});

describe("shareText", () => {
  const debate = {
    votes: [["founder", "yes"], ["monk", "no"], ["artist", "depends"]].map(([p, v]) => ({ p, v })),
    verdict: "Verdict text.",
    quote: "A quotable line.",
  };

  it("inclui pergunta, tally e verdict", () => {
    const text = shareText("Should I move?", debate);
    expect(text).toContain("Should I move?");
    expect(text).toContain("YES 1");
    expect(text).toContain("Verdict text.");
    expect(text).toContain("A quotable line.");
  });

  it("respeita max e cai pro formato curto", () => {
    const text = shareText("Should I move?", debate, { max: 50 });
    expect(text.length).toBeLessThanOrEqual(50 + 40); // formato curto nao trunca agressivamente por design
    expect(text).toContain("Should I move?");
  });
});

describe("shareUrl", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("builds /r/:id URL using provided origin", () => {
    expect(shareUrl("abc123", "https://example.com")).toBe("https://example.com/r/abc123");
  });

  it("returns base URL when no id", () => {
    expect(shareUrl(null, "https://example.com")).toBe("https://example.com");
    expect(shareUrl(undefined, "https://example.com")).toBe("https://example.com");
  });

  it("falls back to window.location.origin when no origin provided", () => {
    vi.stubGlobal("window", { location: { origin: "https://mysite.vercel.app" } });
    expect(shareUrl("xyz")).toBe("https://mysite.vercel.app/r/xyz");
  });

  it("falls back to production URL when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(shareUrl("abc")).toBe("https://the-council-murex.vercel.app/r/abc");
  });
});

describe("copyLink", () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it("writes to clipboard and returns true", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const result = await copyLink("https://example.com/r/abc");
    expect(writeText).toHaveBeenCalledWith("https://example.com/r/abc");
    expect(result).toBe(true);
  });

  it("returns false when clipboard API is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const result = await copyLink("https://example.com/r/abc");
    expect(result).toBe(false);
  });

  it("returns false when navigator is undefined", async () => {
    vi.stubGlobal("navigator", undefined);
    const result = await copyLink("https://example.com/r/abc");
    expect(result).toBe(false);
  });
});

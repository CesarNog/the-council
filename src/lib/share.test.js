import { describe, it, expect, vi, afterEach } from "vitest";
import { tally, councilHeadline, shareText, shareUrl, copyLink, debateToJson } from "./share.js";

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

  it("empate 4-4 sem depends continua split_middle", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "no"], ["scientist", "no"], ["explorer", "no"], ["romantic", "no"]]);
    expect(councilHeadline(d)).toBe("The Council is split down the middle.");
  });

  it("empate 4-4 com 1 depends nomeia as tres contagens em vez de esconder o depends", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "no"], ["scientist", "no"], ["explorer", "no"], ["romantic", "no"], ["shadow", "depends"]]);
    expect(councilHeadline(d)).toBe("The Council is divided — 4 yes, 4 no, 1 depends.");
  });

  it("lean normal (sem depends)", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "yes"], ["scientist", "yes"], ["explorer", "no"], ["romantic", "no"], ["shadow", "no"]]);
    expect(councilHeadline(d)).toBe("The Council leans yes, 6–3.");
  });

  it("4 yes / 3 depends / 2 no nunca vira um placar de dois numeros (bug reportado)", () => {
    const d = mk([["founder", "yes"], ["billionaire", "yes"], ["artist", "yes"], ["athlete", "yes"],
                  ["monk", "depends"], ["scientist", "depends"], ["explorer", "depends"],
                  ["romantic", "no"], ["shadow", "no"]]);
    const headline = councilHeadline(d);
    expect(headline).toBe("The Council is divided. Yes leans ahead — 4 yes, 3 depends, 2 no.");
    expect(headline).not.toMatch(/4[–-]2/);
    expect(headline).toContain("divided");
  });

  it("no leans ahead com depends significativo", () => {
    const d = mk([["founder", "no"], ["billionaire", "no"], ["artist", "no"], ["athlete", "no"],
                  ["monk", "depends"], ["scientist", "depends"], ["explorer", "depends"],
                  ["romantic", "yes"], ["shadow", "yes"]]);
    expect(councilHeadline(d)).toBe("The Council is divided. No leans ahead — 4 no, 3 depends, 2 yes.");
  });

  it("depends e a resposta mais comum", () => {
    const d = mk([["founder", "depends"], ["billionaire", "depends"], ["artist", "depends"], ["athlete", "depends"],
                  ["monk", "yes"], ["scientist", "yes"], ["explorer", "no"], ["romantic", "no"], ["shadow", "no"]]);
    expect(councilHeadline(d)).toBe("The Council is divided. Most say it depends — 4 depends, 2 yes, 3 no.");
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

  it("coloca a frase antes do tally", () => {
    const text = shareText("Should I move?", debate);
    const quotePos = text.indexOf("A quotable line.");
    const tallyPos = text.indexOf("YES 1");
    expect(quotePos).toBeLessThan(tallyPos);
  });

  it("usa labels traduzidos em portugues", () => {
    const text = shareText("Devo me mudar?", debate, { language: "pt" });
    expect(text).toContain("SIM 1");
    expect(text).toContain("NÃO 1");
    expect(text).toContain("DEPENDE 1");
    expect(text).toContain("nove versões de mim");
  });

  it("usa labels traduzidos em espanhol", () => {
    const text = shareText("¿Debo moverme?", debate, { language: "es" });
    expect(text).toContain("SÍ 1");
    expect(text).toContain("NO 1");
    expect(text).toContain("nueve versiones de mí");
  });

  it("usa labels traduzidos em chines", () => {
    const text = shareText("我该搬家吗？", debate, { language: "zh" });
    expect(text).toContain("赞成 1");
    expect(text).toContain("反对 1");
    expect(text).toContain("待定 1");
    expect(text).toContain("九个版本的我");
  });

  it("tagline inglesa por padrao", () => {
    const text = shareText("Should I move?", debate);
    expect(text).toContain("— nine versions of me, one verdict");
  });

  it("respeita max e cai pro formato curto", () => {
    const text = shareText("Should I move?", debate, { max: 50 });
    expect(text.length).toBeLessThanOrEqual(50 + 40); // formato curto nao trunca agressivamente por design
    expect(text).toContain("Should I move?");
  });

  it("formato curto traduzido em portugues", () => {
    const text = shareText("Devo me mudar?", debate, { max: 50, language: "pt" });
    expect(text).toContain("O CONSELHO DECIDIU");
  });

  it("redact: true excludes the original private question, verdict, and quote", () => {
    const text = shareText("Should I leave my husband?", debate, { redact: true });
    expect(text).not.toContain("Should I leave my husband?");
    expect(text).not.toContain("Verdict text.");
    expect(text).not.toContain("A quotable line.");
    expect(text).toContain("A personal decision");
    // the shareable part — headline + tally — is still present
    expect(text).toContain("YES 1");
  });

  it("redact: true is respected even when a max length is also passed", () => {
    const text = shareText("Should I leave my husband?", debate, { redact: true, max: 260 });
    expect(text).not.toContain("Should I leave my husband?");
    expect(text).toContain("A personal decision");
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

describe("debateToJson", () => {
  const debate = {
    id: "abc123",
    verdict: "Verdict text.",
    quote: "A quotable line.",
    mood: "tense",
    question: "Should you move?",
    turns: [{ p: "founder", t: "Ship it." }, { p: "monk", t: "Sit with it first." }],
    votes: [{ p: "founder", v: "yes" }, { p: "monk", v: "no" }],
    realities: [{ label: "Stay", line: "Comfort, slower growth." }],
  };

  it("includes the full transcript, tally, and persona names", () => {
    const json = debateToJson("Should I move?", debate);
    expect(json.question).toBe("Should I move?");
    expect(json.verdict).toBe("Verdict text.");
    expect(json.quote).toBe("A quotable line.");
    expect(json.tally).toEqual({ yes: 1, no: 1, depends: 0 });
    expect(json.turns).toEqual([
      { persona: "founder", name: "The Founder", text: "Ship it." },
      { persona: "monk", name: "The Monk", text: "Sit with it first." },
    ]);
    expect(json.votes).toEqual([
      { persona: "founder", name: "The Founder", vote: "yes" },
      { persona: "monk", name: "The Monk", vote: "no" },
    ]);
    expect(json.realities).toEqual(debate.realities);
    expect(json.url).toBe("https://the-council-murex.vercel.app/r/abc123");
  });

  it("returns null url when the debate has no persisted id", () => {
    const json = debateToJson("Should I move?", { ...debate, id: null });
    expect(json.url).toBeNull();
  });

  it("stamps an ISO exportedAt timestamp", () => {
    const json = debateToJson("Should I move?", debate);
    expect(() => new Date(json.exportedAt).toISOString()).not.toThrow();
    expect(json.exportedAt).toBe(new Date(json.exportedAt).toISOString());
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

  it("returns false instead of throwing when writeText rejects (e.g. permission denied)", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("Permission denied", "NotAllowedError"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const result = await copyLink("https://example.com/r/abc");
    expect(result).toBe(false);
  });
});

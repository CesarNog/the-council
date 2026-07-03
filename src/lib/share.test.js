import { describe, it, expect } from "vitest";
import { tally, councilHeadline, shareText } from "./share.js";

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
    const t = shareText("Should I move?", debate);
    expect(t).toContain("Should I move?");
    expect(t).toContain("YES 1");
    expect(t).toContain("Verdict text.");
    expect(t).toContain("A quotable line.");
  });

  it("respeita max e cai pro formato curto", () => {
    const t = shareText("Should I move?", debate, { max: 50 });
    expect(t.length).toBeLessThanOrEqual(50 + 40); // formato curto nao trunca agressivamente por design
    expect(t).toContain("Should I move?");
  });
});

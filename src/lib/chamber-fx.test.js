import { describe, it, expect } from "vitest";
import {
  normalizeMood, runningTally, leadingSide, memberStats,
  localDayKey, shouldGreetToday, pickDelight, delightDelayMs, formatQuote,
} from "./chamber-fx.js";
import { PERSONAS } from "./personas.js";
import { t } from "./i18n.js";

const votes = [
  { p: "founder", v: "yes" }, { p: "monk", v: "no" },
  { p: "artist", v: "depends" }, { p: "shadow", v: "yes" },
];

describe("normalizeMood", () => {
  it("passes known moods and maps anything else to neutral", () => {
    expect(normalizeMood("somber")).toBe("somber");
    expect(normalizeMood("ecstatic")).toBe("neutral");
    expect(normalizeMood(undefined)).toBe("neutral");
  });
});

describe("runningTally", () => {
  it("counts only revealed votes", () => {
    expect(runningTally(votes, 0)).toEqual({ yes: 0, no: 0, dep: 0, total: 0 });
    expect(runningTally(votes, 2)).toEqual({ yes: 1, no: 1, dep: 0, total: 2 });
    expect(runningTally(votes, 99)).toEqual({ yes: 2, no: 1, dep: 1, total: 4 });
  });
  it("treats negative reveal as nothing", () => {
    expect(runningTally(votes, -3).total).toBe(0);
  });
});

describe("leadingSide", () => {
  it("returns the strict plurality or null on a tie", () => {
    expect(leadingSide({ yes: 2, no: 1, dep: 1 })).toBe("yes");
    expect(leadingSide({ yes: 1, no: 1, dep: 0 })).toBeNull();
    expect(leadingSide({ yes: 0, no: 0, dep: 0 })).toBeNull();
    expect(leadingSide({ yes: 0, no: 0, dep: 3 })).toBe("depends");
  });
});

describe("memberStats", () => {
  const debate = {
    turns: [{ p: "founder", t: "a" }, { p: "monk", t: "b" }, { p: "founder", t: "c" }],
    votes,
  };
  it("reflects only what has been revealed", () => {
    expect(memberStats(debate, "founder", 1, 0)).toEqual({ turns: 1, lastLine: "a", vote: null });
    expect(memberStats(debate, "founder", 3, 1)).toEqual({ turns: 2, lastLine: "c", vote: "yes" });
    expect(memberStats(debate, "explorer", 3, 4)).toEqual({ turns: 0, lastLine: null, vote: null });
  });
  it("tolerates a missing debate", () => {
    expect(memberStats(null, "founder")).toEqual({ turns: 0, lastLine: null, vote: null });
  });
});

describe("daily greeting gate", () => {
  it("greets once per local day", () => {
    const day = new Date(2026, 9, 27, 22, 0);
    expect(localDayKey(day)).toBe("2026-10-27");
    expect(shouldGreetToday(null, day)).toBe(true);
    expect(shouldGreetToday("2026-10-26", day)).toBe(true);
    expect(shouldGreetToday("2026-10-27", day)).toBe(false);
  });
});

describe("delight moments", () => {
  it("picks a real persona, honoring exclusions", () => {
    const ids = PERSONAS.map(p => p.id);
    expect(ids).toContain(pickDelight(() => 0.5));
    expect(pickDelight(() => 0, ["founder"])).not.toBe("founder");
    expect(pickDelight(() => 0.999999, ids)).toBeNull();
  });
  it("schedules within 9–16s", () => {
    expect(delightDelayMs(() => 0)).toBe(9000);
    expect(delightDelayMs(() => 0.9999)).toBeLessThan(16000);
  });
  it("has a translated gesture for every persona in every language", () => {
    for (const p of PERSONAS) {
      for (const lang of ["en", "pt", "es", "zh"]) {
        expect(t(lang, `delight_${p.id}`)).not.toBe(`delight_${p.id}`);
      }
    }
  });
});

describe("formatQuote", () => {
  it("wraps in curly quotes once and appends attribution", () => {
    expect(formatQuote('"Leap."', "— The Council")).toBe("“Leap.”\n— The Council");
    expect(formatQuote("Leap.", "— X")).toBe("“Leap.”\n— X");
    expect(formatQuote("  ", "— X")).toBe("");
  });
});

import { describe, it, expect } from "vitest";
import {
  councilBodySchema,
  authBodySchema,
  ttsBodySchema,
  profilePatchSchema,
  parseBody,
  parseResultId,
  normalizeDebate,
} from "./_validate.js";

const ALL_IDS = ["founder", "billionaire", "artist", "athlete", "monk", "scientist", "explorer", "romantic", "shadow"];

function validRaw(overrides = {}) {
  return {
    mood: "tense",
    turns: [
      { p: "founder", t: "Ship it now." },
      { p: "monk", t: "But what are you truly seeking?" },
    ],
    votes: [
      { p: "founder", v: "yes", r: "Momentum matters." },
      { p: "monk", v: "depends", r: "Depends on your peace." },
    ],
    verdict: "You lean yes, but sit with the cost first.",
    quote: "Ship it now.",
    question: "What would you regret more?",
    realities: [{ label: "The Safe Path", line: "A year on, steady but wondering." }],
    memoryEcho: null,
    ...overrides,
  };
}

describe("parseBody councilBodySchema", () => {
  it("accepts valid question", () => {
    const r = parseBody(councilBodySchema, { question: "Should I quit?" });
    expect(r.ok).toBe(true);
    expect(r.data.question).toBe("Should I quit?");
  });

  it("rejects empty question", () => {
    const r = parseBody(councilBodySchema, { question: "   " });
    expect(r.ok).toBe(false);
  });

  it("rejects question over 500 chars", () => {
    const r = parseBody(councilBodySchema, { question: "x".repeat(501) });
    expect(r.ok).toBe(false);
  });

  it("rejects invalid language", () => {
    const r = parseBody(councilBodySchema, { question: "Hi", language: "fr" });
    expect(r.ok).toBe(false);
  });
});

describe("parseBody ttsBodySchema", () => {
  it("accepts valid tts payload", () => {
    const r = parseBody(ttsBodySchema, { text: "Hello", persona: "monk" });
    expect(r.ok).toBe(true);
  });

  it("rejects unknown persona", () => {
    const r = parseBody(ttsBodySchema, { text: "Hi", persona: "ghost" });
    expect(r.ok).toBe(false);
  });
});

describe("parseBody authBodySchema", () => {
  it("requires credential string", () => {
    expect(parseBody(authBodySchema, {}).ok).toBe(false);
    expect(parseBody(authBodySchema, { credential: "x".repeat(25) }).ok).toBe(true);
  });
});

describe("parseBody profilePatchSchema", () => {
  it("rejects extra fields", () => {
    const r = parseBody(profilePatchSchema, { situation: "ok", hacker: true });
    expect(r.ok).toBe(false);
  });
});

describe("normalizeDebate", () => {
  const ids = new Set(ALL_IDS);

  it("passes a well-formed debate through", () => {
    const d = normalizeDebate(validRaw(), ids);
    expect(d).not.toBeNull();
    expect(d.turns).toHaveLength(2);
    expect(d.votes).toHaveLength(2);
    expect(d.verdict).toBeTruthy();
    expect(d.mood).toBe("tense");
  });

  it("returns null for non-object / missing core fields", () => {
    expect(normalizeDebate(null, ids)).toBeNull();
    expect(normalizeDebate("nope", ids)).toBeNull();
    expect(normalizeDebate(validRaw({ verdict: "" }), ids)).toBeNull();
    expect(normalizeDebate(validRaw({ turns: [{ p: "founder", t: "solo" }] }), ids)).toBeNull(); // < 2 turns
    expect(normalizeDebate(validRaw({ votes: [] }), ids)).toBeNull();
  });

  it("drops malformed and out-of-council turns", () => {
    const d = normalizeDebate(validRaw({
      turns: [
        { p: "founder", t: "Keep this." },
        { p: "ghost", t: "Invented persona." },
        { p: "monk", t: "   " },
        { p: "artist", t: "Also keep this." },
        { t: "no persona" },
      ],
    }), ids);
    expect(d.turns).toEqual([
      { p: "founder", t: "Keep this." },
      { p: "artist", t: "Also keep this." },
    ]);
  });

  it("dedupes votes, drops invalid vote values and invented personas", () => {
    const d = normalizeDebate(validRaw({
      votes: [
        { p: "founder", v: "yes", r: "a" },
        { p: "founder", v: "no", r: "dup" },
        { p: "monk", v: "maybe", r: "bad enum" },
        { p: "ghost", v: "yes", r: "invented" },
        { p: "artist", v: "depends", r: "b" },
      ],
    }), ids);
    expect(d.votes).toEqual([
      { p: "founder", v: "yes", r: "a" },
      { p: "artist", v: "depends", r: "b" },
    ]);
  });

  it("clamps an out-of-enum mood to tense", () => {
    expect(normalizeDebate(validRaw({ mood: "chaotic" }), ids).mood).toBe("tense");
    expect(normalizeDebate(validRaw({ mood: "warm" }), ids).mood).toBe("warm");
  });

  it("backfills an empty quote with the longest turn line", () => {
    const d = normalizeDebate(validRaw({ quote: "  ", turns: [
      { p: "founder", t: "short" },
      { p: "artist", t: "a considerably longer and more quotable line" },
    ] }), ids);
    expect(d.quote).toBe("a considerably longer and more quotable line");
  });

  it("nulls a memoryEcho with an invalid persona and keeps a valid one", () => {
    expect(normalizeDebate(validRaw({ memoryEcho: { persona: "ghost", line: "x" } }), ids).memoryEcho).toBeNull();
    expect(normalizeDebate(validRaw({ memoryEcho: { persona: "monk", line: "We spoke of this." } }), ids).memoryEcho)
      .toEqual({ persona: "monk", line: "We spoke of this." });
  });

  it("caps realities at 3 and drops malformed ones", () => {
    const d = normalizeDebate(validRaw({ realities: [
      { label: "A", line: "one" },
      { label: "", line: "no label" },
      { label: "B", line: "two" },
      { label: "C", line: "three" },
      { label: "D", line: "four" },
    ] }), ids);
    expect(d.realities).toHaveLength(3);
    expect(d.realities.map(r => r.label)).toEqual(["A", "B", "C"]);
  });

  it("honors a restricted active-persona set", () => {
    const d = normalizeDebate(validRaw({
      turns: [
        { p: "founder", t: "in" },
        { p: "monk", t: "out of this council" },
        { p: "artist", t: "in too" },
      ],
    }), new Set(["founder", "artist"]));
    expect(d.turns.map(t => t.p)).toEqual(["founder", "artist"]);
  });

  it("accepts an array for allowedIds too", () => {
    expect(normalizeDebate(validRaw(), ALL_IDS)).not.toBeNull();
  });
});

describe("parseResultId", () => {
  it("sanitizes and validates id", () => {
    expect(parseResultId("abc123")).toBe("abc123");
    expect(parseResultId("abc<script>")).toBe("abcscript");
    expect(parseResultId("")).toBe(null);
    expect(parseResultId("ab")).toBe(null);
  });
});

import { describe, it, expect } from "vitest";
import {
  councilBodySchema,
  authBodySchema,
  ttsBodySchema,
  profilePatchSchema,
  parseBody,
  parseResultId,
} from "./_validate.js";

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

describe("parseResultId", () => {
  it("sanitizes and validates id", () => {
    expect(parseResultId("abc123")).toBe("abc123");
    expect(parseResultId("abc<script>")).toBe("abcscript");
    expect(parseResultId("")).toBe(null);
    expect(parseResultId("ab")).toBe(null);
  });
});

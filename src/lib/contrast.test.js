import { describe, it, expect } from "vitest";
import { PERSONAS } from "./personas.js";
import { lightModeContrast, contrastRatio, mixSrgb, AA_NORMAL } from "./contrast.js";

describe("light-mode persona contrast", () => {
  it("every persona's blended colour clears WCAG AA on the light canvas", () => {
    for (const p of PERSONAS) {
      const ratio = lightModeContrast(p.color);
      expect(ratio, `${p.id} (${p.color}) → ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("raw dark-tuned colours would fail AA on light — proving the blend is needed", () => {
    // At least one pale seat must be under AA raw, or the blend is pointless.
    const anyRawFails = PERSONAS.some(p => contrastRatio(p.color, "#F5F3EE") < AA_NORMAL);
    expect(anyRawFails).toBe(true);
  });
});

describe("mixSrgb", () => {
  it("returns the source colour at 100%", () => {
    expect(mixSrgb("#6FD6E8", "#1C1A28", 1)).toBe("#6fd6e8");
  });
  it("returns the ink at 0%", () => {
    expect(mixSrgb("#6FD6E8", "#1C1A28", 0)).toBe("#1c1a28");
  });
  it("averages channels at 50%", () => {
    // #FFFFFF mixed 50% with #000000 → #808080 (128)
    expect(mixSrgb("#FFFFFF", "#000000", 0.5)).toBe("#808080");
  });
});

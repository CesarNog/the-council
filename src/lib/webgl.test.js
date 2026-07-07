import { describe, it, expect } from "vitest";
import { supportsWebGL, preferLandingFallback } from "./webgl.js";

describe("supportsWebGL", () => {
  it("returns false in node test env", () => {
    expect(supportsWebGL()).toBe(false);
  });
});

describe("preferLandingFallback", () => {
  it("returns true without window", () => {
    expect(preferLandingFallback()).toBe(true);
  });
});

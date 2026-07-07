import { describe, it, expect } from "vitest";
import { councilTier } from "./_upstash.js";

describe("councilTier", () => {
  it("returns anonymous without session", () => {
    expect(councilTier(null, null)).toBe("anonymous");
  });

  it("returns free for signed-in user", () => {
    expect(councilTier({ sub: "x" }, {})).toBe("free");
  });

  it("returns premium when plan set", () => {
    expect(councilTier({ sub: "x" }, { plan: "premium" })).toBe("premium");
  });
});

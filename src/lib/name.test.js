import { describe, it, expect } from "vitest";
import { firstName } from "./name.js";

describe("firstName", () => {
  it("returns first token", () => {
    expect(firstName("César Augusto Nogueira")).toBe("César");
    expect(firstName("Cesar")).toBe("Cesar");
  });

  it("handles empty input", () => {
    expect(firstName("")).toBe("");
    expect(firstName(null)).toBe("");
  });
});

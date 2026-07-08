import { describe, it, expect } from "vitest";
import { clerkDisplayName, isClerkEnabled } from "./clerk.js";

describe("clerkDisplayName", () => {
  it("prefers firstName", () => {
    expect(clerkDisplayName({ firstName: "Cesar", fullName: "Cesar Nog" })).toBe("Cesar");
  });

  it("falls back to fullName", () => {
    expect(clerkDisplayName({ fullName: "Cesar Nog" })).toBe("Cesar Nog");
  });

  it("falls back to email prefix", () => {
    expect(clerkDisplayName({
      primaryEmailAddress: { emailAddress: "cesar@example.com" },
    })).toBe("cesar");
  });
});

describe("isClerkEnabled", () => {
  it("returns false without publishable key in test env", () => {
    expect(isClerkEnabled()).toBe(false);
  });
});

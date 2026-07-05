import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getConsent, hasConsentDecision, setConsent,
  acceptAll, rejectOptional, isAnalyticsEnabled, isAdvertisingEnabled,
  CATEGORIES,
} from "./consent.js";

// Mock localStorage for all tests
const store = {};
const localStorageMock = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => Object.keys(store).forEach(k => delete store[k]),
};

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

describe("default consent state", () => {
  it("returns necessary:true, analytics:false, advertising:false when no decision stored", () => {
    const c = getConsent();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.advertising).toBe(false);
  });

  it("hasConsentDecision is false when nothing stored", () => {
    expect(hasConsentDecision()).toBe(false);
  });
});

describe("acceptAll", () => {
  it("enables analytics and advertising", () => {
    acceptAll();
    const c = getConsent();
    expect(c.analytics).toBe(true);
    expect(c.advertising).toBe(true);
    expect(c.necessary).toBe(true);
  });

  it("sets hasConsentDecision to true", () => {
    acceptAll();
    expect(hasConsentDecision()).toBe(true);
  });
});

describe("rejectOptional", () => {
  it("keeps necessary, disables analytics and advertising", () => {
    acceptAll(); // enable everything first
    rejectOptional();
    const c = getConsent();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
    expect(c.advertising).toBe(false);
  });
});

describe("setConsent", () => {
  it("persists partial preferences", () => {
    setConsent({ analytics: true });
    const c = getConsent();
    expect(c.analytics).toBe(true);
    expect(c.advertising).toBe(false);
  });

  it("never allows necessary to be disabled", () => {
    setConsent({ necessary: false });
    expect(getConsent().necessary).toBe(true);
  });

  it("returns the resulting consent state", () => {
    const result = setConsent({ analytics: true, advertising: true });
    expect(result.analytics).toBe(true);
  });
});

describe("reading stored preferences", () => {
  it("correctly reads back previously stored analytics=true", () => {
    acceptAll();
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it("correctly reads back previously stored analytics=false", () => {
    rejectOptional();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("isAdvertisingEnabled reflects stored value", () => {
    acceptAll();
    expect(isAdvertisingEnabled()).toBe(true);
    rejectOptional();
    expect(isAdvertisingEnabled()).toBe(false);
  });
});

describe("corrupted stored preferences", () => {
  it("falls back to defaults when JSON is invalid", () => {
    localStorageMock.setItem("council:consent", "not-valid-json{{");
    const c = getConsent();
    expect(c.necessary).toBe(true);
    expect(c.analytics).toBe(false);
  });

  it("falls back to defaults when stored value is not an object", () => {
    localStorageMock.setItem("council:consent", JSON.stringify(42));
    const c = getConsent();
    expect(c.analytics).toBe(false);
  });

  it("merges unknown stored keys with defaults gracefully", () => {
    localStorageMock.setItem("council:consent", JSON.stringify({ analytics: true, future_category: true }));
    const c = getConsent();
    expect(c.analytics).toBe(true);
    expect(c.necessary).toBe(true);
  });
});

describe("CATEGORIES constant", () => {
  it("is frozen and has the expected keys", () => {
    expect(Object.isFrozen(CATEGORIES)).toBe(true);
    expect(Object.keys(CATEGORIES).sort()).toEqual(["advertising", "analytics", "necessary"]);
  });
});

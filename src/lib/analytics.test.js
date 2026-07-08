import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

async function freshAnalytics(analyticsEnabled = false) {
  vi.resetModules();
  vi.doMock("./consent.js", () => ({
    isAnalyticsEnabled: vi.fn(() => analyticsEnabled),
  }));
  return import("./analytics.js");
}

function stubWindow(extra = {}) {
  vi.stubGlobal("window", extra);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent — no consent", () => {
  it("does nothing when analytics is not enabled", async () => {
    const mod = await freshAnalytics(false);
    const hj = vi.fn();
    stubWindow({ hj });
    mod.trackEvent("test_event");
    expect(hj).not.toHaveBeenCalled();
  });
});

describe("trackEvent — with consent", () => {
  it("calls window.hj when available", async () => {
    const mod = await freshAnalytics(true);
    const hj = vi.fn();
    stubWindow({ hj });
    mod.trackEvent("test_event");
    expect(hj).toHaveBeenCalledWith("event", "test_event");
  });

  it("calls window.gtag with sanitized payload", async () => {
    const mod = await freshAnalytics(true);
    const gtag = vi.fn();
    stubWindow({ gtag });
    mod.trackEvent("test_event", { score: 42, name: "alice", longStr: "x".repeat(65) });
    expect(gtag).toHaveBeenCalledWith("event", "test_event", { score: 42, name: "alice" });
  });

  it("strips strings >= 64 chars from payload", async () => {
    const mod = await freshAnalytics(true);
    const gtag = vi.fn();
    stubWindow({ gtag });
    mod.trackEvent("ev", { short: "ok", raw_question: "x".repeat(64) });
    const payload = gtag.mock.calls[0][2];
    expect(payload.short).toBe("ok");
    expect(payload.raw_question).toBeUndefined();
  });

  it("keeps boolean and numeric payload values", async () => {
    const mod = await freshAnalytics(true);
    const gtag = vi.fn();
    stubWindow({ gtag });
    mod.trackEvent("ev", { flag: true, count: 7 });
    expect(gtag.mock.calls[0][2]).toEqual({ flag: true, count: 7 });
  });

  it("does not throw when window has no hj or gtag", async () => {
    const mod = await freshAnalytics(true);
    stubWindow({});
    expect(() => mod.trackEvent("safe_event")).not.toThrow();
  });
});

describe("trackPageView", () => {
  it("fires event prefixed with page_", async () => {
    const mod = await freshAnalytics(true);
    const hj = vi.fn();
    stubWindow({ hj });
    mod.trackPageView("landing");
    expect(hj).toHaveBeenCalledWith("event", "landing_viewed");
  });
});

describe("initAnalytics + isAnalyticsReady", () => {
  it("isAnalyticsReady starts false", async () => {
    const mod = await freshAnalytics(false);
    expect(mod.isAnalyticsReady()).toBe(false);
  });

  it("remains false when consent not given", async () => {
    const mod = await freshAnalytics(false);
    stubWindow({});
    mod.initAnalytics();
    expect(mod.isAnalyticsReady()).toBe(false);
  });

  it("becomes true when consent given", async () => {
    const mod = await freshAnalytics(true);
    stubWindow({});
    mod.initAnalytics();
    expect(mod.isAnalyticsReady()).toBe(true);
  });

  it("does not reinitialise on repeated calls", async () => {
    const mod = await freshAnalytics(true);
    stubWindow({});
    mod.initAnalytics();
    mod.initAnalytics();
    expect(mod.isAnalyticsReady()).toBe(true);
  });
});

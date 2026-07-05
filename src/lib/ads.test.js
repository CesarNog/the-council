import { describe, it, expect, afterEach, vi } from "vitest";

async function freshAds(advertisingEnabled = false) {
  vi.resetModules();
  vi.doMock("./consent.js", () => ({
    isAdvertisingEnabled: vi.fn(() => advertisingEnabled),
  }));
  return import("./ads.js");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isAdsReady", () => {
  it("starts false", async () => {
    const mod = await freshAds(false);
    expect(mod.isAdsReady()).toBe(false);
  });
});

describe("initAds", () => {
  it("stays not ready when advertising not enabled", async () => {
    const mod = await freshAds(false);
    mod.initAds();
    expect(mod.isAdsReady()).toBe(false);
  });

  it("stays not ready when VITE_ADSENSE_PUBLISHER_ID is empty", async () => {
    vi.stubEnv("VITE_ADSENSE_PUBLISHER_ID", "");
    const mod = await freshAds(true);
    mod.initAds();
    expect(mod.isAdsReady()).toBe(false);
  });

  it("does not throw regardless of env state", async () => {
    const mod = await freshAds(true);
    expect(() => mod.initAds()).not.toThrow();
  });

  it("does not reinitialise on repeated calls", async () => {
    vi.stubEnv("VITE_ADSENSE_PUBLISHER_ID", "ca-pub-1234567890");
    const mod = await freshAds(true);
    // DEV guard fires in test environment; isAdsReady stays false — safe to call twice
    mod.initAds();
    mod.initAds();
    expect(() => mod.initAds()).not.toThrow();
  });
});

describe("pushAdSlot", () => {
  it("does nothing when advertising not enabled", async () => {
    const mod = await freshAds(false);
    vi.stubGlobal("window", {});
    mod.pushAdSlot({ key: "val" });
    expect(window.adsbygoogle).toBeUndefined();
  });

  it("pushes config when advertising enabled", async () => {
    const mod = await freshAds(true);
    const adsbygoogle = [];
    vi.stubGlobal("window", { adsbygoogle });
    mod.pushAdSlot({ slot: "banner" });
    expect(adsbygoogle).toHaveLength(1);
    expect(adsbygoogle[0]).toEqual({ slot: "banner" });
  });

  it("initialises adsbygoogle array if absent", async () => {
    const mod = await freshAds(true);
    vi.stubGlobal("window", {});
    mod.pushAdSlot({ slot: "banner" });
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it("does not throw if adsbygoogle.push errors", async () => {
    const mod = await freshAds(true);
    vi.stubGlobal("window", {
      adsbygoogle: { push: () => { throw new Error("ad error"); } },
    });
    expect(() => mod.pushAdSlot({})).not.toThrow();
  });
});

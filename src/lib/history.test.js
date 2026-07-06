import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadHistory, saveToHistory, clearHistory } from "./history.js";

const mockStorage = () => {
  const store = {};
  return {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; },
  };
};

describe("history", () => {
  beforeEach(() => { vi.stubGlobal("localStorage", mockStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns [] when nothing stored", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("saves and loads a debate entry", () => {
    saveToHistory({ id: "abc", question: "Should I quit?", headline: "The Council leans yes, 6–3." });
    const h = loadHistory();
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ id: "abc", question: "Should I quit?", headline: "The Council leans yes, 6–3." });
    expect(typeof h[0].timestamp).toBe("number");
  });

  it("deduplicates by question — most recent wins", () => {
    saveToHistory({ id: "old", question: "Same question", headline: "Old headline" });
    saveToHistory({ id: "new", question: "Same question", headline: "New headline" });
    const h = loadHistory();
    expect(h).toHaveLength(1);
    expect(h[0].id).toBe("new");
    expect(h[0].headline).toBe("New headline");
  });

  it("most recent entry is first", () => {
    saveToHistory({ id: "a", question: "QA", headline: "HA" });
    saveToHistory({ id: "b", question: "QB", headline: "HB" });
    const h = loadHistory();
    expect(h[0].id).toBe("b");
    expect(h[1].id).toBe("a");
  });

  it("caps at 10 entries", () => {
    for (let i = 0; i < 12; i++) saveToHistory({ id: `id${i}`, question: `Q${i}`, headline: "H" });
    expect(loadHistory()).toHaveLength(10);
  });

  it("clears history", () => {
    saveToHistory({ id: "x", question: "Clear test", headline: "H" });
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it("returns [] gracefully when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", { getItem() { throw new Error("no storage"); } });
    expect(loadHistory()).toEqual([]);
  });
});

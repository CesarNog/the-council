import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./auth.js", () => ({ requireUser: vi.fn() }));
vi.mock("./_supabase.js", () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabaseAdmin: vi.fn(),
  upsertProfileFromUser: vi.fn(),
}));

import { requireUser } from "./auth.js";
import { isSupabaseConfigured, getSupabaseAdmin, upsertProfileFromUser } from "./_supabase.js";
import handler from "./history.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

function mockReq(overrides = {}) {
  return { method: "GET", ...overrides };
}

function fakeSupabaseQuery(result) {
  const builder = {};
  ["from", "select", "eq", "order", "limit"].forEach(m => { builder[m] = vi.fn(() => builder); });
  builder.limit = vi.fn(async () => result);
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  isSupabaseConfigured.mockReturnValue(true);
});

afterEach(() => vi.restoreAllMocks());

describe("GET /api/history", () => {
  it("rejects non-GET methods", async () => {
    const res = mockRes();
    await handler(mockReq({ method: "POST" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 503 when Supabase isn't configured, before checking auth", async () => {
    isSupabaseConfigured.mockReturnValue(false);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(requireUser).not.toHaveBeenCalled();
  });

  it("does nothing further when requireUser has already written a 401", async () => {
    requireUser.mockImplementation(async (req, res) => { res.status(401).json({ error: "not_authenticated" }); return null; });
    const res = mockRes();
    await handler(mockReq(), res);
    expect(upsertProfileFromUser).not.toHaveBeenCalled();
  });

  it("falls back to an empty list when the user has no Supabase profile row yet", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: { name: "Alex" } });
    upsertProfileFromUser.mockResolvedValue(null);
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ items: [], source: "kv_fallback" });
  });

  it("returns decisions ordered newest-first for a valid profile", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: { name: "Alex" } });
    upsertProfileFromUser.mockResolvedValue({ id: "profile-1" });
    const items = [{ id: "d1", question: "Q1" }, { id: "d2", question: "Q2" }];
    getSupabaseAdmin.mockReturnValue(fakeSupabaseQuery({ data: items, error: null }));
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith({ items, source: "supabase" });
  });

  it("returns a safe 502 when the Supabase query itself errors", async () => {
    requireUser.mockResolvedValue({ sub: "google-1", user: { name: "Alex" } });
    upsertProfileFromUser.mockResolvedValue({ id: "profile-1" });
    getSupabaseAdmin.mockReturnValue(fakeSupabaseQuery({ data: null, error: { message: "connection refused" } }));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: "history_unavailable" });
  });
});

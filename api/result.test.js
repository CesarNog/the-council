import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./_kv.js", () => ({ kvGet: vi.fn() }));

import { kvGet } from "./_kv.js";
import handler from "./result.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("GET /api/result", () => {
  it("rejects non-GET methods", async () => {
    const res = mockRes();
    await handler({ method: "POST", query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("rejects a too-short id without ever touching KV", async () => {
    const res = mockRes();
    await handler({ method: "GET", query: { id: "ab" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(kvGet).not.toHaveBeenCalled();
  });

  it("sanitizes non-alphanumeric characters out of the id before using it as a KV key", async () => {
    kvGet.mockResolvedValue(null);
    const res = mockRes();
    await handler({ method: "GET", query: { id: "../../etc/passwd" } }, res);
    // path-traversal characters are stripped, leaving a plausible-looking id —
    // proves the KV key can never contain "/" or ".." regardless of input
    expect(kvGet).toHaveBeenCalledWith("result:etcpasswd");
  });

  it("returns 404 when the id is well-formed but not found in KV", async () => {
    kvGet.mockResolvedValue(null);
    const res = mockRes();
    await handler({ method: "GET", query: { id: "abc123" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "not_found" });
  });

  it("returns the persisted debate merged with its id, with a long-lived cache header", async () => {
    kvGet.mockResolvedValue(JSON.stringify({ asked: "Should I move?", verdict: "Yes." }));
    const res = mockRes();
    await handler({ method: "GET", query: { id: "abc123" } }, res);
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", expect.stringContaining("immutable"));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: "abc123", asked: "Should I move?", verdict: "Yes." });
  });

  it("returns a safe 502 (no leaked detail) when KV itself errors", async () => {
    kvGet.mockRejectedValue(new Error("kv outage: internal token xyz"));
    const res = mockRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await handler({ method: "GET", query: { id: "abc123" } }, res);
    expect(res.status).toHaveBeenCalledWith(502);
    const sent = res.json.mock.calls[0][0];
    expect(JSON.stringify(sent)).not.toContain("xyz");
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { safeError, badRequest } from "./_http.js";

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

afterEach(() => vi.restoreAllMocks());

describe("safeError", () => {
  it("never sends upstream detail to the client, regardless of NODE_ENV", () => {
    for (const env of ["production", "development", undefined]) {
      const prev = process.env.NODE_ENV;
      if (env === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = env;
      const res = mockRes();
      vi.spyOn(console, "error").mockImplementation(() => {});
      safeError(res, 502, "gateway_error", '{"error":{"message":"internal org_123 secrets"}}');
      expect(res.json).toHaveBeenCalledWith({ error: "gateway_error" });
      const sent = res.json.mock.calls[0][0];
      expect(JSON.stringify(sent)).not.toContain("org_123");
      process.env.NODE_ENV = prev;
    }
  });

  it("logs detail server-side for observability", () => {
    const res = mockRes();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    safeError(res, 429, "rate_limited", "TPM exceeded org_456");
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0].join(" ")).toContain("org_456");
  });

  it("omits log when there is no detail", () => {
    const res = mockRes();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    safeError(res, 503, "storage_unavailable");
    expect(spy).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ error: "storage_unavailable" });
  });
});

describe("badRequest", () => {
  it("keeps local validation detail — safe and useful to the client", () => {
    const res = mockRes();
    badRequest(res, "question too long");
    expect(res.json).toHaveBeenCalledWith({ error: "invalid_request", detail: "question too long" });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { kvGet, kvPut } from "./_kv.js";

const origEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...origEnv,
    CLOUDFLARE_ACCOUNT_ID: "acct-1",
    CLOUDFLARE_KV_NAMESPACE_ID: "ns-1",
    CLOUDFLARE_API_TOKEN: "cf-token",
  };
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  process.env = { ...origEnv };
});

describe("kvGet", () => {
  it("requests the correct Cloudflare KV values URL with Bearer auth", async () => {
    global.fetch.mockResolvedValue({ status: 200, ok: true, text: async () => "stored-value" });
    const result = await kvGet("result:abc123");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/acct-1/storage/kv/namespaces/ns-1/values/result%3Aabc123",
      { headers: { Authorization: "Bearer cf-token" } }
    );
    expect(result).toBe("stored-value");
  });

  it("URL-encodes special characters in the key", async () => {
    global.fetch.mockResolvedValue({ status: 200, ok: true, text: async () => "v" });
    await kvGet("user:a b/c");
    const url = global.fetch.mock.calls[0][0];
    expect(url).not.toContain(" ");
    expect(url).toContain(encodeURIComponent("user:a b/c"));
  });

  it("returns null on a 404 (key not found is expected, not an error)", async () => {
    global.fetch.mockResolvedValue({ status: 404, ok: false });
    const result = await kvGet("missing:key");
    expect(result).toBeNull();
  });

  it("throws on any other non-ok status", async () => {
    global.fetch.mockResolvedValue({ status: 500, ok: false });
    await expect(kvGet("result:abc123")).rejects.toThrow("kv get failed: 500");
  });
});

describe("kvPut", () => {
  it("PUTs the value as text/plain to the correct URL", async () => {
    global.fetch.mockResolvedValue({ ok: true });
    await kvPut("result:abc123", '{"verdict":"yes"}');
    const [url, init] = global.fetch.mock.calls[0];
    expect(url.toString()).toBe("https://api.cloudflare.com/client/v4/accounts/acct-1/storage/kv/namespaces/ns-1/values/result%3Aabc123");
    expect(init.method).toBe("PUT");
    expect(init.headers["Content-Type"]).toBe("text/plain");
    expect(init.headers.Authorization).toBe("Bearer cf-token");
    expect(init.body).toBe('{"verdict":"yes"}');
  });

  it("appends expiration_ttl as a query param when a TTL is given", async () => {
    global.fetch.mockResolvedValue({ ok: true });
    await kvPut("result:abc123", "v", 3600);
    const url = global.fetch.mock.calls[0][0];
    expect(url.searchParams.get("expiration_ttl")).toBe("3600");
  });

  it("omits expiration_ttl when no TTL is given", async () => {
    global.fetch.mockResolvedValue({ ok: true });
    await kvPut("result:abc123", "v");
    const url = global.fetch.mock.calls[0][0];
    expect(url.searchParams.has("expiration_ttl")).toBe(false);
  });

  it("throws on a non-ok response", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(kvPut("result:abc123", "v")).rejects.toThrow("kv put failed: 503");
  });
});

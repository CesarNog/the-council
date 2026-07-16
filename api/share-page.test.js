import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./_kv.js", () => ({ kvGet: vi.fn() }));

import { kvGet } from "./_kv.js";
import handler from "./share-page.js";

const SHELL = `<!doctype html><html><head>
<title>The Council</title>
<link rel="canonical" href="https://the-council-murex.vercel.app/" />
<meta name="description" content="Nine versions of you. One verdict." />
<meta property="og:title" content="The Council" />
<meta property="og:description" content="Nine versions of you. One verdict." />
<meta property="og:url" content="https://the-council-murex.vercel.app/" />
<meta name="twitter:title" content="The Council" />
<meta name="twitter:description" content="Nine versions of you. One verdict." />
</head><body></body></html>`;

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.send = vi.fn(() => res);
  res.setHeader = vi.fn();
  return res;
}

function mockReq(overrides = {}) {
  return { query: {}, headers: { host: "the-council-murex.vercel.app" }, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn(async () => ({ text: async () => SHELL }));
});

afterEach(() => vi.restoreAllMocks());

describe("GET /api/share-page", () => {
  it("returns a 502 when the index.html shell can't be fetched", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const res = mockRes();
    await handler(mockReq({ query: { id: "abc123" } }), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it("returns the unmodified shell when no id is given", async () => {
    const res = mockRes();
    await handler(mockReq({ query: {} }), res);
    expect(kvGet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(SHELL);
  });

  it("returns the unmodified shell when the id isn't found in KV", async () => {
    kvGet.mockResolvedValue(null);
    const res = mockRes();
    await handler(mockReq({ query: { id: "gone123" } }), res);
    expect(res.send).toHaveBeenCalledWith(SHELL);
  });

  it("injects OG/title/description tags for a found debate", async () => {
    kvGet.mockResolvedValue(JSON.stringify({
      asked: "Should I move?",
      quote: "Staying is just fear wearing a salary.",
      verdict: "Go for it.",
      votes: [{ v: "yes" }, { v: "yes" }, { v: "no" }],
    }));
    const res = mockRes();
    await handler(mockReq({ query: { id: "abc123" } }), res);

    const html = res.send.mock.calls[0][0];
    // esc() HTML-encodes quotes even in <title> text content — valid and safe, just not literal `"`
    expect(html).toContain('<title>&quot;Should I move?&quot; — The Council ruled 2-1, 0 undecided.</title>');
    expect(html).toContain('content="Staying is just fear wearing a salary."');
    expect(html).toContain('href="https://the-council-murex.vercel.app/r/abc123"');
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", expect.stringContaining("max-age"));
  });

  it("reports a unanimous verdict distinctly", async () => {
    kvGet.mockResolvedValue(JSON.stringify({
      asked: "Should I quit?", verdict: "Yes.",
      votes: Array.from({ length: 9 }, () => ({ v: "yes" })),
    }));
    const res = mockRes();
    await handler(mockReq({ query: { id: "abc123" } }), res);
    const html = res.send.mock.calls[0][0];
    expect(html).toContain("Every Council member agreed. Go.");
  });

  it("HTML-escapes the question to prevent injection via a crafted title", async () => {
    kvGet.mockResolvedValue(JSON.stringify({
      asked: '<script>alert(1)</script>', verdict: "V.",
      votes: [{ v: "yes" }, { v: "no" }],
    }));
    const res = mockRes();
    await handler(mockReq({ query: { id: "abc123" } }), res);
    const html = res.send.mock.calls[0][0];
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

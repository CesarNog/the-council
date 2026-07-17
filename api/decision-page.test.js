import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./decision-page.js";

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
  vi.stubGlobal("fetch", vi.fn(async () => ({ text: async () => SHELL })));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GET /api/decision-page", () => {
  it("returns 502 when the index.html shell can't be fetched", async () => {
    global.fetch.mockRejectedValue(new Error("network down"));
    const res = mockRes();
    await handler(mockReq({ query: { slug: "quit-job-start-business" } }), res);
    expect(res.status).toHaveBeenCalledWith(502);
  });

  it("returns the unmodified shell for an unknown slug", async () => {
    const res = mockRes();
    await handler(mockReq({ query: { slug: "not-a-real-slug" } }), res);
    expect(res.send).toHaveBeenCalledWith(SHELL);
  });

  it("returns the unmodified shell when no slug is given", async () => {
    const res = mockRes();
    await handler(mockReq({ query: {} }), res);
    expect(res.send).toHaveBeenCalledWith(SHELL);
  });

  it("injects title/description/OG tags and an auto-convene script for a known slug", async () => {
    const res = mockRes();
    await handler(mockReq({ query: { slug: "quit-job-start-business" } }), res);
    const html = res.send.mock.calls[0][0];
    expect(html).toContain('<title>&quot;Should I quit my job and start something of my own?&quot; — The Council</title>');
    expect(html).toContain("window.__COUNCIL_DECISION__=");
    expect(html).toContain("Should I quit my job and start something of my own?");
    expect(html).toContain('href="https://the-council-murex.vercel.app/decisions/quit-job-start-business"');
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", expect.stringContaining("max-age"));
  });

  it("injects the script before </head> so it runs before the SPA mounts", async () => {
    const res = mockRes();
    await handler(mockReq({ query: { slug: "end-relationship" } }), res);
    const html = res.send.mock.calls[0][0];
    const scriptIdx = html.indexOf("window.__COUNCIL_DECISION__");
    const headCloseIdx = html.indexOf("</head>");
    expect(scriptIdx).toBeGreaterThan(-1);
    expect(scriptIdx).toBeLessThan(headCloseIdx);
  });
});

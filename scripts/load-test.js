#!/usr/bin/env node
// Opt-in load-test tool. NEVER run this against production without explicit
// authorization — it fires real concurrent HTTP requests and, against
// /api/council or /api/tts, costs real Groq/OpenAI/Gemini usage against the
// org-shared TPM budget (see CLAUDE.md's hard constraints). Point it at a
// local `vercel dev` instance or a preview deployment you own, not
// the-council-murex.vercel.app.
//
// Usage:
//   node scripts/load-test.js --base-url http://localhost:3000 [options]
//
// Options:
//   --base-url <url>        required. No default — never accidentally hit prod.
//   --endpoint <path>       default: /api/council
//   --method <verb>         default: POST
//   --body <json>           default: a minimal valid /api/council payload
//   --concurrency <n>       default: 5   — requests fired in the same burst
//   --requests <n>          default: 10  — total requests across all bursts
//   --expected-admitted <n> optional — if set, prints PASS/FAIL against how
//                           many non-429 responses you expect a correctly
//                           enforced rate limit to admit (e.g. the tier's
//                           configured `requests` value from api/_upstash.js)
//
// What this measures that the unit tests (api/_rateLimit.test.js) can't:
// the unit tests prove the KV fallback's race exists in-process; this script
// measures actual behavior over the network against a real deployment,
// including whichever limiter (Upstash or KV) is actually configured there.

function parseArgs(argv) {
  const args = { concurrency: 5, requests: 10, method: "POST", endpoint: "/api/council" };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    args[name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    i++;
  }
  return args;
}

function percentile(sortedLatencies, p) {
  if (sortedLatencies.length === 0) return 0;
  const idx = Math.min(sortedLatencies.length - 1, Math.ceil((p / 100) * sortedLatencies.length) - 1);
  return sortedLatencies[Math.max(0, idx)];
}

const DEFAULT_COUNCIL_BODY = JSON.stringify({
  question: "Load test question — should I ship this feature?",
  language: "en",
});

async function fireOne(url, method, body) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : body,
    });
    // drain the body so the connection can be reused/closed cleanly
    await res.text().catch(() => {});
    return { status: res.status, latencyMs: performance.now() - start, ok: true };
  } catch (e) {
    return { status: 0, latencyMs: performance.now() - start, ok: false, error: e.message };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.baseUrl) {
    console.error("Missing --base-url. Refusing to guess a target — point this at a deployment you own.");
    console.error("Example: node scripts/load-test.js --base-url http://localhost:3000 --endpoint /api/council --concurrency 5 --requests 10");
    process.exit(1);
  }

  const url = `${args.baseUrl.replace(/\/$/, "")}${args.endpoint}`;
  const concurrency = parseInt(args.concurrency, 10);
  const total = parseInt(args.requests, 10);
  const body = args.body || DEFAULT_COUNCIL_BODY;

  console.log(`Load testing ${args.method} ${url}`);
  console.log(`${total} requests, ${concurrency} fired concurrently per burst\n`);

  const results = [];
  for (let sent = 0; sent < total; sent += concurrency) {
    const burstSize = Math.min(concurrency, total - sent);
    const burst = await Promise.all(
      Array.from({ length: burstSize }, () => fireOne(url, args.method, body))
    );
    results.push(...burst);
  }

  const statusCounts = {};
  for (const r of results) statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

  const latencies = results.filter(r => r.ok).map(r => r.latencyMs).sort((a, b) => a - b);
  const admitted = results.filter(r => r.status >= 200 && r.status < 300).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const errored = results.filter(r => !r.ok || r.status >= 500).length;

  console.log("Status code breakdown:");
  for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`  ${status === "0" ? "network error" : status}: ${count}`);
  }

  console.log("\nLatency (successful responses only):");
  console.log(`  min: ${latencies[0]?.toFixed(0) ?? "-"}ms`);
  console.log(`  p50: ${percentile(latencies, 50).toFixed(0)}ms`);
  console.log(`  p95: ${percentile(latencies, 95).toFixed(0)}ms`);
  console.log(`  p99: ${percentile(latencies, 99).toFixed(0)}ms`);
  console.log(`  max: ${latencies[latencies.length - 1]?.toFixed(0) ?? "-"}ms`);

  console.log(`\nAdmitted (2xx): ${admitted} / ${total}`);
  console.log(`Rate-limited (429): ${rateLimited} / ${total}`);
  console.log(`Errors (network or 5xx): ${errored} / ${total}`);

  if (args.expectedAdmitted !== undefined) {
    const expected = parseInt(args.expectedAdmitted, 10);
    if (admitted > expected) {
      console.log(`\nFAIL: rate limit admitted ${admitted} requests, expected at most ${expected}.`);
      console.log("This is the exact race documented in api/_rateLimit.test.js if the KV fallback (no Upstash) is in effect.");
      process.exitCode = 1;
    } else {
      console.log(`\nPASS: admitted ${admitted} <= expected ${expected}.`);
    }
  }
}

main();

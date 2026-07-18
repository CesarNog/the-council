# Load Testing — The Council

`scripts/load-test.js` fires a burst of concurrent HTTP requests at a chosen
endpoint and reports status-code breakdown, latency percentiles, and
(optionally) a PASS/FAIL check against how many requests a correctly
enforced rate limit should admit.

**Never point this at `the-council-murex.vercel.app` (production) without
explicit authorization.** Against `/api/council` or `/api/tts` it triggers
real Groq/OpenAI/Gemini calls billed against the org-shared budget (see
CLAUDE.md's hard constraints on Groq TPM). Use it against:

- a local `vercel dev` / `npx vercel dev` instance, or
- a preview deployment you own and are deliberately testing.

## Usage

```bash
node scripts/load-test.js --base-url http://localhost:3000 \
  --endpoint /api/council \
  --concurrency 5 \
  --requests 10 \
  --expected-admitted 3
```

| Flag | Default | Meaning |
|---|---|---|
| `--base-url` | *(required)* | Target deployment. No default — never guess a target. |
| `--endpoint` | `/api/council` | Path to hit. |
| `--method` | `POST` | HTTP method. |
| `--body` | a minimal valid `/api/council` payload | Raw JSON string sent as the request body. |
| `--concurrency` | `5` | Requests fired in the same burst — this is what actually exercises "a lot of users at the same time," not the total count. |
| `--requests` | `10` | Total requests across all bursts. |
| `--expected-admitted` | *(none)* | If set, exits non-zero when more than this many requests got a 2xx — use the target tier's `requests` value from `api/_upstash.js`'s `TIER_LIMITS`. |

## What this catches that the unit tests can't

`api/_rateLimit.test.js` proves the Cloudflare KV fallback's read-then-write
race exists *in-process*, with a mocked KV store. This script measures the
same property against a real, running deployment — including whichever
limiter (Upstash or KV) is actually configured there — over the network,
with real latency and real concurrency.

### A representative scenario

The anonymous council tier is 3 requests/day (`TIER_LIMITS.anonymous` in
`api/_upstash.js`). Firing 10 concurrent anonymous requests at `/api/council`
against a deployment with **only** the KV fallback configured (no Upstash)
is expected, per the documented and tested behavior, to admit more than 3 —
that's the gap `docs/PRODUCTION_CHECKLIST.md` calls out. The same burst
against a deployment with Upstash configured should admit exactly 3.

```bash
# Expect this to FAIL (admit >3) if Upstash isn't configured on the target
node scripts/load-test.js --base-url <your-preview-url> \
  --endpoint /api/council --concurrency 10 --requests 10 --expected-admitted 3
```

## Measured production baseline (read-only path)

The one production run that IS safe without authorization: `GET /api/result`
with an unknown id — a pure Cloudflare KV lookup returning 404. No Groq/TTS
cost, no rate limiter on that route, no side effects. Measured 2026-07-17
against `the-council-murex.vercel.app`:

| Run | Concurrency | Requests | Errors / 5xx | p50 | p95 | max |
|---|---|---|---|---|---|---|
| Cold (first burst) | 6 | 24 | 0 | 286ms | 1587ms | 1597ms |
| Warm (immediately after) | 8 | 24 | 0 | 220ms | 523ms | 647ms |

Takeaways: the serving path (Vercel function + KV read) handled 8-way
concurrent bursts with zero errors; the ~1.3s p95 gap between runs is
cold-start amortization, not contention. Re-run these two commands after
infra changes and compare against this table:

```bash
node scripts/load-test.js --base-url https://the-council-murex.vercel.app \
  --endpoint "/api/result?id=zzzzzzzzzz" --method GET --requests 24 --concurrency 8
```

## Measured production baseline (write-path function, zero-cost)

The `/api/council` function itself can also be burst-tested on production
without authorization: an invalid body (`{"question":""}`) is rejected by
zod validation with a 400 *before* the rate limiter or Groq are ever
touched (see the gating order in `api/council.js`), so the run costs no
Groq tokens, consumes nobody's rate-limit quota, and writes nothing. It
exercises function invocation, cold start, body parsing, and validation —
everything on the write path except the Groq call and the limiter, which
are covered by unit tests. Measured 2026-07-17 against
`the-council-murex.vercel.app`:

| Run | Concurrency | Requests | Errors / 5xx | p50 | p95 | max |
|---|---|---|---|---|---|---|
| Invalid-body burst (all 400 as designed) | 8 | 24 | 0 | 344ms | 837ms | 866ms |

```bash
node scripts/load-test.js --base-url https://the-council-murex.vercel.app \
  --endpoint /api/council --method POST --body '{"question":""}' --requests 24 --concurrency 8
```

What this does NOT cover: real Groq generation latency under concurrent
load and live limiter behavior on production. That run spends real tokens
from the org-shared 8000 TPM budget — get explicit authorization first,
then use the full-payload command from "Testing the rate limiter" above.

## Interpreting results

- **Rate-limited (429) count lower than expected**: the limiter isn't
  enforcing correctly, or Upstash isn't configured where you thought it was.
- **Errors (network or 5xx) > 0**: investigate before drawing conclusions
  about rate limiting — a crashed function looks similar to "admitted"
  from this script's point of view if it returns a non-429 status.
- **High p95/p99 latency**: expected for `/api/council` (Groq generation is
  the dominant cost, capped at ~9s by `_groq.js`'s `timeoutMs`); a low p50
  with a high p99 usually means a handful of requests hit Groq's slow path
  or KV/Upstash contention, not a systemic issue.

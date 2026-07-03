# Architecture

## Request flow — new debate

1. `Chamber` (`src/components.jsx`) calls `summonCouncil(question, profile)` from `src/lib/api.js`.
2. `POST /api/council` (`api/council.js`):
   - validates input (length, type)
   - checks per-IP rate limit via Cloudflare KV (`checkRateLimit`, best-effort, see `CLAUDE.md`)
   - calls Groq (`openai/gpt-oss-120b`, `reasoning_effort: low`, JSON mode) with `buildPrompt(question, profile)`
   - parses and validates the JSON shape (`turns`, `votes`, `verdict`, `mood`, `quote`, `question`)
   - persists the result under a random 10-char id in KV (`result:{id}`, 30-day TTL), fire-and-forget
   - returns `{ id, ...json }`
3. Frontend reveals `turns` sequentially (pacing per persona, see `PACE` in `lib/personas.js`), then `votes`, then the verdict panel.
4. On any failure (timeout, rate limit, malformed response), the frontend falls back to the static `FALLBACK` debate (`lib/api.js`) — the UI never shows a dead end.

## Request flow — shared result (`/r/:id`)

1. `App.jsx` matches the path client-side (`sharedIdFromPath`), no server routing beyond a Vercel rewrite (`vercel.json`) that sends `/r/:id` to `index.html`.
2. `GET /api/result?id=...` (`api/result.js`) reads `result:{id}` from KV, re-attaches the `id`, returns it.
3. `Chamber` receives it as `preloaded` and replays the same turn/vote reveal animation as a live session — no separate "static" rendering path.

## Why Cloudflare KV and not Vercel KV/Postgres

Not a strong technical reason — it was the storage already reachable with an available API token at the time. No migration is planned; revisit if KV's eventual consistency becomes a real problem (see `CLAUDE.md` on rate-limit atomicity).

## Why Groq and not the Vercel AI Gateway

The AI Gateway requires a credit card on file even for its free-credit tier. Groq's free tier doesn't. This is a cost decision, not a quality one — see `README.md` for the resulting TPM ceiling.

# Known Limitations — The Council

_Last updated: July 2026_

---

## Performance / Infrastructure

### Groq Free Tier (8000 TPM)
The entire platform shares 8000 tokens per minute with Groq's free tier. Under concurrent load, requests fail with 500/rate-limited at the Groq level, not just at the IP level. This is invisible to users and causes silent degradation.

**Mitigation:** `reasoning_effort: "low"` reduces token consumption. Monitor via Groq dashboard.

### KV Rate Limiting is Best-Effort
The IP rate limit (3 req/min) uses Cloudflare KV counters, which are eventually consistent. Under high concurrency, more than 3 requests per minute can succeed from the same IP.

**Mitigation:** None without switching to atomic KV or a dedicated rate-limit service.

### No Streaming
Groq responses are awaited fully before being returned to the client. On slow connections or large prompts, users see a loading spinner for 5–15 seconds with no intermediate feedback.

**Plan:** Implement streaming with `ReadableStream` + SSE.

---

## Data / Privacy

### Anonymous User History Lost on Browser Clear
Anonymous users' debate history lives only in `localStorage`. Clearing browser data permanently removes it.

**Note:** This is intentional for privacy. Signing in moves history server-side.

---

## UX

### Language Switch Doesn't Persist Across Hard Nav
After a hard page reload, the app briefly uses the browser's detected language before reading `localStorage`.

**Plan:** Read localStorage synchronously before first render, or use a service worker.

---

## Code Quality

### No ESLint
No linting is configured. Typos, bad patterns, and unused variables go undetected until runtime.

### No TypeScript
Type errors are silent until runtime. Props and API shapes are undocumented at the type level.

### No Playwright / E2E Tests
The happy path (onboarding → council → result → share → auth) is not automatically tested.

---

## Resolved

These were tracked here previously; fixed and verified against current code.

- **`/api/tts` not rate-limited** — `enforceEndpointLimit(req, res, "tts")` guards the endpoint (`api/tts.js`).
- **Debate results don't auto-expire** — `api/council.js` writes `result:{id}` with a 30-day KV TTL, matching the privacy policy.
- **`console.log` in production** — audited; none remain in `api/` or `src/` outside tests.
- **No `aria-live` on debate loading** — the summoning phase now has `role="status" aria-live="polite"`.
- **No focus management after debate loads** — focus moves to the debate transcript (a labeled, `tabIndex={-1}` region) once the first turn appears.
- **Google GSI script injected twice (StrictMode)** — `GoogleSignIn` now checks for an existing `<script>` tag and attaches a `load` listener instead of appending a duplicate.

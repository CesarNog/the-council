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

## Security

### No Rate Limit on `/api/auth`
The sign-in endpoint has no IP-based rate limit. A bot could submit unlimited Google token verification attempts.

**Plan:** Add 10 req/min/IP guard (same pattern as `/api/council`).

### `SESSION_SECRET` Fallback Unsecured
If `SESSION_SECRET` is not set in the Vercel environment, `createHmac('sha256', undefined)` produces a deterministic insecure key. All sessions would be trivially forgeable.

**Plan:** Add startup guard: `if (!process.env.SESSION_SECRET) throw new Error(...)`.

### No MIME Validation on Picture Upload
`PATCH /api/profile` with a `picture` field only checks byte size. A non-image data URI passes validation.

**Plan:** Validate that `picture` starts with `data:image/` before storing.

### No Content-Security-Policy
XSS is not blocked at the HTTP level. Any future injection of inline scripts would be unprotected.

**Plan:** Add CSP header to `vercel.json`.

---

## Data / Privacy

### Debate Results Don't Auto-Expire
Results are stored in Cloudflare KV without a TTL. The privacy policy states 30-day retention, but KV does not enforce it.

**Plan:** Add `kvPut(key, value, 30 * 24 * 3600)` TTL to debate results in `api/council.js`.

### Anonymous User History Lost on Browser Clear
Anonymous users' debate history lives only in `localStorage`. Clearing browser data permanently removes it.

**Note:** This is intentional for privacy. Signing in moves history server-side.

---

## UX

### Loading State Flash
On page load, there is a ~100–300ms blank white screen while `GET /api/profile` is pending.

**Plan:** Show a skeleton or spinner during session check.

### Language Switch Doesn't Persist Across Hard Nav
After a hard page reload, the app briefly uses the browser's detected language before reading `localStorage`.

**Plan:** Read localStorage synchronously before first render, or use a service worker.

### Google GSI Script Injected Twice (StrictMode)
`GoogleSignIn` component's `useEffect` runs twice in React StrictMode (dev). The GSI script tag is appended twice to `<head>`.

**Impact:** Low — browsers deduplicate scripts. But it produces a console warning.

**Plan:** Add deduplication guard: `if (document.querySelector('script[src*="accounts.google.com"]')) return`.

---

## Accessibility

### No `aria-live` on Debate Loading
Screen readers do not announce when the debate is ready. Users relying on screen readers have no feedback during the 5–15s loading period.

**Plan:** Add `aria-live="polite"` region that announces "O Conselho está debatendo..." and then "O debate está pronto".

### No Focus Management After Debate Loads
After the debate loads, focus remains on the submit button. Screen reader users must tab through to reach the content.

**Plan:** Move focus to the debate heading after result arrives.

---

## Code Quality

### No ESLint
No linting is configured. Typos, bad patterns, and unused variables go undetected until runtime.

### No TypeScript
Type errors are silent until runtime. Props and API shapes are undocumented at the type level.

### No Playwright / E2E Tests
The happy path (onboarding → council → result → share → auth) is not automatically tested.

### `console.log` in Production
Several API functions and components have `console.log` calls that leak debug information in production Vercel logs.

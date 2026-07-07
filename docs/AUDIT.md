# Codebase Audit — The Council

_Audited: July 2026_

---

## Current Architecture

```
Browser (React 19 SPA)
  └── Vite 8 build → static assets on Vercel CDN
  └── API calls → Vercel Serverless Functions (api/*.js)
        └── Groq (gpt-oss-120b, reasoning_effort: "low") — LLM inference
        └── Cloudflare KV REST API — debate persistence, rate limiting, user profiles
        └── Google JWKS — token verification for sign-in
```

**Entry point:** `src/main.jsx` → `src/App.jsx` (routing + state) → `src/components.jsx` (all major UI)

**State management:** Single `TheCouncilApp` component holds all global state. No external state manager.

**API layer:** 8 Vercel serverless functions. One file = one route, no shared express router.

**Storage:**
- Cloudflare KV: debate results (`result:<id>`), user profiles (`user:<sub>`), rate limit counters (`rl:<ip>`)
- `localStorage`: language preference, display name, session fallback, debate history, consent, theme

---

## Strengths

1. **Minimal dependencies** — only 4 runtime deps (react, react-dom, jose, impeccable). No bloat.
2. **Single-file-per-concern** architecture is easy to navigate for a small team.
3. **Security baseline is solid:** HMAC-signed session cookie with timing-safe comparison, SameSite=Lax, HttpOnly, Secure. IP-based rate limiting on `/api/council`. Input validation on all PATCH endpoints.
4. **i18n coverage** — 4 languages (en, pt, es, zh) with a clean `t(lang, key, ...args)` API.
5. **Consent-gated analytics and ads** — Hotjar and AdSense are never loaded without user consent.
6. **Offline fallback** — `FALLBACK_DEBATE` in `src/lib/api.js` means the app works without a backend.
7. **Graceful degradation on auth** — if `/api/auth` returns 503, the client extracts identity from the Google JWT locally and stores it in `localStorage`.
8. **Good test coverage for pure utilities** — `src/lib/*.test.js` covers personas, share, api, consent, history, analytics, ads.
9. **Vercel security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy configured globally.
10. **Eclipse edge case** handled gracefully (unanimous vote detection, special UI, rarity marking).

---

## Weaknesses

### Critical
- **No Content-Security-Policy header.** XSS is not blocked at the HTTP level.
- **No ESLint.** No linting configured — typos, bad patterns, dead code go undetected.
- **No Playwright / E2E tests.** The happy path (onboarding → council → result → share) is not automatically tested.
- **No rate limiting on `/api/auth`.** A bot can brute-force token submission attempts.
- **SESSION_SECRET fallback not enforced.** If `SESSION_SECRET` is missing from env, `createHmac` will silently use `undefined`, producing a deterministic but insecure key.
- **`/api/tts` not rate-limited.** Gemini TTS calls have no IP-level protection.

### High
- **No TypeScript.** Type errors are silent until runtime.
- **No CSP nonce for inline scripts.** `index.html` has no inline scripts currently but any future addition would be unprotected.
- **`console.log` calls throughout production code** — leaks debug info in production.
- **`profile.js` PATCH: picture upload has no server-side MIME verification.** Only size is checked; a disguised non-image data URI would pass.
- **KV rate limiting is best-effort, not atomic** — under high concurrency, more than 3 requests/minute can get through.
- **No structured error logging.** Errors are logged with `console.error` only; no external error tracker is wired.

### Medium
- **Debate history stored only in localStorage** for anonymous users — lost on browser clear.
- **No pagination on debate history** in the profile UI — could grow unbounded.
- **`consentBannerVisible` state** is in App.jsx but not persisted separately from consent decision, causing a flash on first load.
- **`getProfile()` is called unconditionally on every page load** even for the shared (`/r/:id`) route.
- **Footer disclaimer uses `<pre>` tag** inside privacy/terms static pages — renders with monospace font, looks unpolished.
- **Language switch does not persist across hard navigation** (falls back to `detectBrowserLanguage` on fresh load before localStorage is read).
- **`GoogleSignIn` component adds a `<script>` tag to `<head>` on each effect run** — no deduplication if effect fires twice in StrictMode dev.

### Low
- **Missing `loading` state** for the session check on initial render (currently shows blank white screen for ~100–300ms).
- **`profile-history-mobile` shows on mobile but history entries are unbounded** — could render 10+ entries with no scroll limit.
- **`CouncilLogo` SVG is rendered inline** on every component that imports it; better as a sprite.
- **`StaticPage` body uses `<pre>` tag** — not semantic HTML.
- **No `aria-live` region** for debate loading state.
- **TTS (`/api/tts`) is only mentioned in `.env.example`** — no UI toggle for voice playback in the current app.

---

## Technical Debt

| Item | Location | Effort |
|---|---|---|
| Convert to TypeScript | entire `src/` | High |
| Add ESLint + Prettier | repo root | Low |
| Add Playwright E2E suite | `e2e/` | Medium |
| Add CSP header | `vercel.json` | Low |
| Add rate limit on `/api/auth` | `api/auth.js` | Low |
| Add `SESSION_SECRET` presence guard | `api/_session.js` | Low |
| Replace `<pre>` in static pages | `src/App.jsx` | Low |
| Add server-side MIME check for picture | `api/profile.js` | Low |
| Deduplicate Google GSI script injection | `src/auth-ui.jsx` | Low |
| Add structured error logging | all `api/*.js` | Medium |
| Add `aria-live` for debate loading | `src/components.jsx` | Low |
| Paginate debate history in profile | `src/auth-ui.jsx` + `api/profile.js` | Medium |

---

## High Priority Fixes

1. Add Content-Security-Policy header to `vercel.json`.
2. Add rate limiting to `/api/auth` (10 req/min/IP).
3. Guard `SESSION_SECRET` — throw on startup if missing.
4. Add ESLint with a minimal ruleset.
5. Add Playwright happy-path test.
6. Fix blank loading state on session check.
7. Add MIME type guard on picture upload in `api/profile.js`.

---

## Medium Priority Fixes

1. Replace `<pre>` in `StaticPage` with proper semantic HTML (paragraphs, headings).
2. Add `aria-live` region for debate loading feedback.
3. Paginate profile debate history (show 5, with "view all" link).
4. Deduplicate Google GSI script injection in `GoogleSignIn`.
5. Add structured logging (Sentry or similar) to API functions.
6. Add `/api/tts` rate limiting.

---

## Future Improvements

- **Billing / subscriptions** — Stripe integration for a pro tier (premium personas, longer debate history, export PDF).
- **Admin panel** — Usage dashboard, abuse reports, KV inspection.
- **Webhook notifications** — Notify users of eclipse events via email or push.
- **Database migration** — Cloudflare KV to D1 or Postgres for relational queries (e.g., analytics by question category).
- **TypeScript migration** — Incremental: start with `src/lib/*.js`.
- **PWA** — Add service worker for offline-first experience.
- **More languages** — French, German, Japanese, Arabic.
- **Persona customization** — Allow users to swap one persona for a custom one.
- **Voice output** — Wire the existing `/api/tts` to a voice-playback UI.

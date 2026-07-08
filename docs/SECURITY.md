# Security Documentation — The Council

_Last reviewed: July 2026_

---

## Authentication

### Mechanism
Google Sign-In (OAuth 2.0 / OIDC). The browser receives a Google ID token (JWT), sends it to `/api/auth` via POST. The backend verifies the token's signature against Google's JWKS endpoint using `jose`. On success, a server-signed HMAC session cookie is issued.

### Session Cookie
- **Name:** `council_session`
- **Signing:** HMAC-SHA256 with `SESSION_SECRET` env var; format: `<base64url(payload)>.<base64url(sig)>`
- **Payload:** `{ sub, exp }` — user ID + expiry timestamp
- **Verification:** timing-safe comparison (`Buffer.timingSafeEqual`) to prevent timing attacks
- **Flags:** `HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` (30 days)
- **CSRF protection:** `SameSite=Lax` means the cookie is not sent on cross-site non-safe requests, providing adequate CSRF protection without a separate token for this threat model

### Fallback (503 — backend not configured)
If `GOOGLE_CLIENT_ID` is not set in Vercel env, `/api/auth` returns 503. The browser falls back to decoding the Google JWT client-side (no signature verification — trust is implicit from the Google-controlled delivery). User data is stored in `localStorage` under `council:localSession`. This mode is intentional for local/preview environments but **must not be used in production** with real user data.

### Known gaps
- KV rate limiting is best-effort (see Upstash migration in roadmap for atomic limits).

---

## Input Validation

All POST/PATCH bodies validated with **Zod** schemas in `api/_validate.js`. Oversized bodies rejected via `Content-Length` check (500 KB max) in `api/_http.js`.

| Endpoint | Schema | Notes |
|---|---|---|
| `POST /api/council` | `councilBodySchema` | question 1–500 chars, language enum, decisionContext |
| `PATCH /api/profile` | `profilePatchSchema` | strict — unknown fields rejected |
| `POST /api/auth` | `authBodySchema` | credential min 20 chars |
| `POST /api/tts` | `ttsBodySchema` | text 1–2000 chars, persona enum |
| `GET /api/result` | `parseResultId()` | alphanumeric 6–16 chars |

Production error responses omit internal `detail` (see `safeError()` in `api/_http.js`).

**MIME validation:** `picture` must start with `data:image/` — validated via Zod before storing.

---

## Rate Limiting

Shared helper: `api/_rateLimit.js` (Cloudflare KV counters, best-effort).

| Endpoint | Limit | Key prefix |
|---|---|---|
| `/api/council` | 3 / 60s / IP | `rl:council:` |
| `/api/auth` | 10 / 60s / IP | `rl:auth:` |
| `/api/tts` | 5 / 60s / IP | `rl:tts:` |

Returns `429` with `{ error: "rate_limited", retryAfter }` and `Retry-After` header.

**Frontend:** rate limit shows honest error UI with countdown — no silent offline fallback on 429.

---

## Secrets Management

| Secret | Where set | Notes |
|---|---|---|
| `GROQ_API_KEY` | Vercel env var | Never exposed to client; used only in `api/_groq.js` |
| `CLOUDFLARE_API_TOKEN` | Vercel env var | Never exposed to client |
| `CLOUDFLARE_ACCOUNT_ID` | Vercel env var | Never exposed to client |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Vercel env var | Never exposed to client |
| `SESSION_SECRET` | Vercel env var | Must be a cryptographically random 32+ byte value |
| `GOOGLE_CLIENT_ID` | Vercel env var + `vite.config.js` constant | **Not a secret** — baked into the frontend bundle; Google enforces allowed origins |
| `VITE_GOOGLE_CLIENT_ID` | Vercel env var (overrides build-time constant) | Same as above |
| `OPENAI_API_KEY` | Vercel env var | Primary TTS key; never exposed to client; used only in `api/tts.js` |
| `GEMINI_TTS_API_KEY` | Vercel env var | Fallback TTS key; never exposed to client |
| `VITE_HOTJAR_ID` | Vercel env var | Non-secret, public |
| `VITE_ADSENSE_PUBLISHER_ID` | Vercel env var | Non-secret, public |

**Rules:**
- Never commit `.env` or `.env.local`
- Never log secret values, even partially
- Rotate `SESSION_SECRET` and `GROQ_API_KEY` if exposed; session rotation invalidates all existing sessions

---

## HTTP Security Headers

Configured in `vercel.json`:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser APIs |
| `Cache-Control: no-store` | API routes only | Prevents caching of sensitive responses |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://accounts.google.com https://vercel.live https://static.hotjar.com https://pagead2.googlesyndication.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://pagead2.googlesyndication.com wss://vercel.live; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; frame-src https://accounts.google.com https://vercel.live; object-src 'none'; base-uri 'self';` | XSS mitigation |

Note: `'unsafe-inline'` in `style-src` is required due to inline styles in React components. Migrate to CSS Modules or CSS custom properties to remove it.

---

## XSS Protection

- All user content is rendered via React (JSX), which escapes output by default.
- No use of `dangerouslySetInnerHTML` in the current codebase.
- Debate content from the LLM is displayed as plain text (not HTML).
- The question stored in KV and echoed back to the client is not HTML-encoded server-side, relying on React's rendering layer — this is adequate for current usage but should be explicitly documented.

---

## SQL / Injection

No SQL database. Cloudflare KV keys are prefixed (`result:`, `user:`, `rl:`) with no user-controlled components in the key path (IDs are generated UUIDs or hashed sub values). No injection risk.

---

## Data Privacy

- Debate results are stored in KV and **do not expire automatically** (30-day retention is stated in privacy policy but not enforced by KV TTL — should be set with `kvPut(key, value, 30 * 24 * 3600)` for the result endpoint).
- User profiles are stored indefinitely in KV under `user:<sub>`.
- Questions are stored as submitted — users should be warned not to include PII.
- Anonymous users have no server-side data; their history lives in `localStorage` only.

---

## Vulnerability Disclosure

To report a security vulnerability: email cesarnogueira1210@gmail.com with subject "The Council — Security". We aim to respond within 72 hours.

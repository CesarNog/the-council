# Environment Variables — The Council

_Last updated: July 2026_

---

## Quick Reference

| Variable | Required | Runtime | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | Server only | Groq LLM inference |
| `CLOUDFLARE_API_TOKEN` | Yes | Server only | KV read/write |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Server only | KV REST base URL |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Yes | Server only | Storage namespace |
| `SESSION_SECRET` | Yes | Server only | HMAC session signing |
| `GOOGLE_CLIENT_ID` | Yes | Server only | JWT audience verification |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Build-time (frontend) | GSI button initialization |
| `GEMINI_TTS_API_KEY` | No | Server only | `/api/tts` voice synthesis |
| `VITE_HOTJAR_ID` | No | Build-time (frontend) | Analytics (consent-gated) |
| `VITE_ADSENSE_PUBLISHER_ID` | No | Build-time (frontend) | Ads (consent-gated) |

---

## Variable Details

### `GROQ_API_KEY`

**Required.** Groq API key for LLM inference.

- Used in: `api/_groq.js`
- Model: `openai/gpt-oss-120b`
- Free tier: 8000 TPM shared across all users
- If missing: `/api/council` returns 503

Get it from: https://console.groq.com/keys

### `CLOUDFLARE_API_TOKEN`

**Required.** Cloudflare API token with Workers KV Storage:Edit permission.

- Used in: `api/_kv.js`
- Scope: Must have read/write access to the KV namespace
- If missing: all KV operations fail silently → rate limiting disabled, results not persisted

Get it from: Cloudflare Dashboard → My Profile → API Tokens

### `CLOUDFLARE_ACCOUNT_ID`

**Required.** Cloudflare account ID (visible in the dashboard URL and sidebar).

- Used in: `api/_kv.js` to construct the KV REST URL
- If missing: KV operations fail

### `CLOUDFLARE_KV_NAMESPACE_ID`

**Required.** The KV namespace ID for the production namespace.

- Used in: `api/_kv.js`
- KV key prefixes: `result:`, `user:`, `rl:`
- If missing: KV operations fail

### `SESSION_SECRET`

**Required.** HMAC-SHA256 key for session cookie signing.

- Used in: `api/_session.js`
- Format: minimum 32 bytes, cryptographically random
- If missing: server throws on startup — deployment will fail at function invocation time
- Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Rotation: invalidates all existing sessions

**NEVER commit this value.**

### `GOOGLE_CLIENT_ID`

**Required for auth.** OAuth 2.0 Client ID from Google Cloud Console.

- Used in: `api/auth.js` to verify JWT audience
- If missing: `/api/auth` returns 503; frontend falls back to unverified local JWT decode
- This is NOT a secret — Google enforces authorized origins instead

### `VITE_GOOGLE_CLIENT_ID`

**Required for sign-in button.** Baked into the frontend build at compile time.

- Used in: `src/auth-ui.jsx` → `GoogleSignIn` component
- Should be the same value as `GOOGLE_CLIENT_ID`
- Exposed in the browser bundle (this is intentional and safe)

### `GEMINI_TTS_API_KEY`

**Optional.** Google Gemini API key for text-to-speech synthesis.

- Used in: `api/tts.js`
- If missing: `/api/tts` returns 503
- TTS UI is not currently wired to the frontend

### `VITE_HOTJAR_ID`

**Optional.** Hotjar site tracking ID.

- Used in: frontend analytics code
- Baked into the build bundle
- Only loaded if user gives consent (`council:consent` in localStorage)
- Not a secret

### `VITE_ADSENSE_PUBLISHER_ID`

**Optional.** Google AdSense publisher ID.

- Used in: frontend ad code
- Baked into the build bundle
- Only loaded if user gives consent
- Not a secret

---

## Local Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in at minimum:
- `GROQ_API_KEY`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_KV_NAMESPACE_ID`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`

Then run:

```bash
npx vercel dev   # required for /api/* routes
```

`npm run dev` (plain Vite) works for frontend-only testing but all `/api/*` calls will 404.

---

## Vercel Environment Setup

1. Go to Vercel Dashboard → Project → Settings → Environment Variables.
2. Add each variable for the `Production` environment.
3. For sensitive values (GROQ_API_KEY, SESSION_SECRET, CLOUDFLARE_API_TOKEN), select "Sensitive" to prevent them from appearing in logs.
4. Re-deploy after changing environment variables.

---

## Security Rules

- Never commit `.env`, `.env.local`, or any file containing real secrets.
- Never log secret values, even partially.
- `VITE_*` variables are baked into the browser bundle — never put secrets there.
- `SESSION_SECRET` and `GROQ_API_KEY` rotation requires a re-deploy.
- Rotate `SESSION_SECRET` if compromised — invalidates all sessions.

# Local Development — The Council

_Last updated: July 2026_

---

## Prerequisites

- Node.js ≥ 18 (`node --version`)
- npm ≥ 9 (`npm --version`)
- Vercel CLI: `npm install -g vercel` (required to run API routes locally)
- A text editor (VS Code recommended)

---

## Initial Setup

```bash
# 1. Clone the repo
git clone https://github.com/cesarnog/the-council.git
cd the-council

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Fill in .env.local (see docs/ENVIRONMENT.md)
# Minimum required:
#   GROQ_API_KEY
#   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID
#   SESSION_SECRET
#   GOOGLE_CLIENT_ID, VITE_GOOGLE_CLIENT_ID
```

---

## Running Locally

### Option A — Full Stack (recommended)

```bash
npx vercel dev
```

- Runs the Vite frontend + all `api/*.js` serverless functions.
- API routes available at `http://localhost:3000/api/*`.
- Hot reload for frontend; API functions restart on change.
- Requires Vercel CLI and a linked Vercel project.

**First run:** `vercel dev` will prompt you to link to an existing Vercel project. Follow the prompts.

### Option B — Frontend Only

```bash
npm run dev
```

- Runs Vite dev server only.
- All `/api/*` requests return 404.
- Useful for frontend-only work (styling, components, i18n).
- The offline fallback debate (`FALLBACK_DEBATE`) will be used automatically when the API is unavailable.

---

## Running Tests

```bash
npm test        # run all tests once (Vitest)
npm run test    # same
```

Tests live in:
- `src/lib/*.test.js` — pure function tests (i18n, personas, share, api, consent, history, analytics, ads)
- `api/_session.test.js` — HMAC session cookie tests

There is currently no watch mode configured. Add `"test:watch": "vitest"` to `package.json` if needed.

---

## Building

```bash
npm run build
```

Output: `dist/` directory with the compiled Vite SPA.

---

## Linting

```bash
npm run lint
```

Flat config in `eslint.config.js`. Gated in CI (`.github/workflows/ci.yml`).

---

## Common Tasks

### Test a specific API route

```bash
# Start the server first
npx vercel dev

# In another terminal:
curl -X POST http://localhost:3000/api/council \
  -H "Content-Type: application/json" \
  -d '{"question": "Should I quit my job?"}'
```

### Inspect KV data

Via the Cloudflare KV dashboard, or:

```bash
# Using the kvGet helper directly (not a CLI tool, requires code)
```

### Test auth flow

1. Ensure `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` are set.
2. Run `npx vercel dev`.
3. Open `http://localhost:3000`.
4. Click "Entrar com Google" and complete the sign-in.

**Note:** Google OAuth requires a properly configured `localhost` origin in the Google Cloud Console.

### Test rate limiting

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/council \
    -H "Content-Type: application/json" \
    -d '{"question": "test"}' \
    -w "\nStatus: %{http_code}\n"
done
```

The 4th and 5th requests should return 429.

---

## Project Structure (Quick Reference)

```
src/
  App.jsx         — routing + session management
  components.jsx  — all product UI
  auth-ui.jsx     — Google Sign-In + profile dashboard
  life-mode.jsx   — Life Mode proactive check-in
  styles.css      — all CSS
  lib/            — pure utility functions (tested)
api/
  council.js      — POST: generate debate
  result.js       — GET: fetch shared debate
  auth.js         — POST/DELETE: Google sign-in/out
  profile.js      — GET/PATCH: user profile
  share-page.js   — GET: OG HTML for /r/:id
  _kv.js          — Cloudflare KV helper
  _groq.js        — Groq API helper
  _session.js     — HMAC session cookie
```

---

## Troubleshooting

See `docs/TROUBLESHOOTING.md` for common issues and solutions.

---

## Conventions

- Pure functions in `src/lib/` — no React, no DOM (except `share.js` canvas).
- `src/lib/*.test.js` — keep tests next to the module they test.
- No new files without a clear reason — single-file-per-concern is intentional.
- `npm run lint` before committing — see the Linting section above.
- Comment the *why*, not the *what*.
- Before changing `api/council.js` prompt: measure token usage first (see CLAUDE.md hard constraints).

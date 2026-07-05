# CLAUDE.md

Context for AI assistants working in this repo.

## What this is

Vite + React SPA, Vercel serverless backend, Groq (`openai/gpt-oss-120b`) for LLM inference, Cloudflare KV for storage (debate results, rate limiting, user profiles). Single-file-per-concern architecture — not a large codebase, don't over-fragment further.

Google Sign-In (`api/auth.js`, `api/profile.js`) exists in code but is **not wired up in production** — `GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID` aren't set, so `/api/auth` returns `503` and the app runs anonymously. Don't assume "no auth" when touching `src/auth-ui.jsx`, `src/life-mode.jsx`, or `api/profile.js` — the code path is real, just unconfirmed end-to-end (see README "Known limitations").

## Commands

```bash
npm install
cp .env.example .env.local   # fill in the vars; see README.md for where each one comes from
npm run dev                  # vite only — plain frontend, /api/* routes 404
npx vercel dev                # frontend + api/*.js serverless functions (needed to exercise the backend locally)
npm test                     # vitest run — src/lib/*.test.js + api/_session.test.js
npm run build                # vite build
```

## Project Structure

```text
the-council/
├── src/
│   ├── App.jsx                  # Routing only (landing / onboarding / chamber / shared /r/:id)
│   ├── main.jsx                 # React entry point
│   ├── components.jsx           # All UI: Ring, Landing, Onboarding, Chamber, ShareBar, ErrorBoundary
│   ├── auth-ui.jsx              # Google Sign-In button + profile UI (not production-wired, see above)
│   ├── life-mode.jsx            # Proactive persona check-in UI, gated behind signed-in profile
│   ├── language-selector.jsx    # Language picker dropdown
│   ├── styles.css
│   └── lib/                     # Pure functions, no React/DOM (except share.js's canvas helper)
│       ├── api.js               # summonCouncil() + offline FALLBACK debate
│       ├── auth.js              # fetch wrappers for /api/auth and /api/profile
│       ├── i18n.js              # translation dictionary
│       ├── personas.js          # 9 personas: colors, mood palette, reveal pacing/intensity
│       ├── personas.test.js     # fails if a new persona misses PERSONAS/INTENSITY/PACE
│       ├── prompts.js           # persona voice fingerprints used in buildPrompt()
│       ├── share.js             # tally / headline / share text / canvas PNG card
│       ├── share.test.js
│       └── voice.js             # voice input helpers
├── api/                          # Vercel serverless functions (one file = one route)
│   ├── _kv.js                   # Cloudflare KV REST helper (`_`-prefixed → not a route)
│   ├── _groq.js                 # Groq chat-completions helper + GroqError
│   ├── _session.js               # HMAC-signed session cookie (sign/verify), + _session.test.js
│   ├── council.js                # POST — generates a debate via Groq, persists it, rate-limits by IP
│   ├── result.js                 # GET  — fetches a persisted debate by id, powers /r/:id share links
│   ├── auth.js                   # POST/DELETE — Google ID token verify (jose) → session cookie
│   ├── profile.js                # GET/PATCH — user profile + Life Mode teaser, requires session
│   └── share-page.js             # GET — server-rendered OG/share HTML for a debate id
├── public/                        # og-image.png, robots.txt
├── docs/
│   ├── ARCHITECTURE.md           # Request flow diagrams + "why KV"/"why Groq" rationale
│   └── CONTRIBUTING.md           # Setup, PR checklist, conventions (mirrors this file)
├── vercel.json                    # Rewrites (e.g. /r/:id → index.html), function config
└── .env.example
```

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/council` | POST | Generate a debate via Groq; validates input, rate-limits by IP, persists to KV, returns `{ id, ...json }` |
| `/api/result` | GET | Fetch a persisted debate (`?id=`) for `/r/:id` share links |
| `/api/share-page` | GET | Server-rendered HTML with OG tags for a shared debate (for link unfurling) |
| `/api/auth` | POST / DELETE | Verify Google ID token (`jose` + Google JWKS) → sets/clears signed session cookie. Not wired up in production (see above) |
| `/api/profile` | GET / PATCH | Read/update the signed-in user's profile (name, situation, values, picture); requires session |

Full request-flow diagrams (new debate, shared result) and the reasoning behind Cloudflare KV / Groq: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Hard constraints, learned from real incidents

- **Groq free tier TPM is 8000/min, shared by the whole org, not per user.** A prompt change that grows turn count or `max_tokens` can silently break production for everyone under concurrent load. Before touching `buildPrompt` in `api/council.js` or its `max_tokens`/`reasoning_effort`, measure actual token usage with a real Groq call and recompute `8000 / total_tokens` = requests/min the whole site can sustain. Don't assume — measure.
- **`gpt-oss-120b` is a reasoning model.** `reasoning_effort: "low"` is required — without it, reasoning tokens can consume the entire `max_tokens` budget before any content is generated (`finish_reason: "length"`, empty `content`).
- **Never spread `{ question: q, ...json }`** where `json` also has a `question` key — it silently overwrites the field you meant to keep. This exact bug shipped once (`api/council.js` persistence). The stored field is `asked`, not `question`, on purpose.
- **KV rate limiting is best-effort, not atomic.** Don't present it as a hard guarantee in UI copy or docs.

## Conventions actually followed here

- `src/lib/*.js` — pure functions, no React, no DOM (except `downloadShareCard`, which needs canvas). Keep it that way; it's what makes them testable.
- Persona data (colors, pacing, intensity, mood palette) lives only in `src/lib/personas.js`. Adding a 10th persona means updating `PERSONAS`, `INTENSITY`, and `PACE` in that one file — `personas.test.js` fails loudly if you miss one.
- No comments explaining what code does when names already say it. Comments exist for non-obvious *why* (see the TPM/reasoning_effort comments in `api/council.js`).
- Minimal diffs. Don't restructure unrelated code while fixing something else.

## Before changing the prompt in `api/council.js`

1. Run it against Groq directly with the real key, read `usage.total_tokens` from the response.
2. Recompute the aggregate requests/min the free tier allows.
3. Update the number in `README.md` "Known limitations" if it changed.

## Before deploying

`npm test && npm run build` locally. CI runs both on every push to `main` — don't rely on catching failures after they're live.

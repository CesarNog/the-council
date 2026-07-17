# The Council

[![CI](https://github.com/CesarNog/the-council/actions/workflows/ci.yml/badge.svg)](https://github.com/CesarNog/the-council/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/github/deployments/CesarNog/the-council/production?label=vercel&logo=vercel)](https://the-council-murex.vercel.app)
[![License: MIT](https://img.shields.io/github/license/CesarNog/the-council)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Stars](https://img.shields.io/github/stars/CesarNog/the-council?style=social)](https://github.com/CesarNog/the-council/stargazers)

Nine alternate versions of yourself — Founder, Billionaire, Artist, Athlete, Monk, Scientist, Explorer, Romantic, Shadow — debate one real decision you bring them. They disagree, interrupt, change their minds, and vote.

**Live**: https://the-council-murex.vercel.app

## Stack

* **Frontend**: Vite + React.
* **Backend**: Vercel serverless functions (`api/*.js`).
* **Inference**: [Groq](https://groq.com) (`openai/gpt-oss-120b`).
* **Text-to-Speech (TTS)**: OpenAI TTS (primary) / Gemini TTS (fallback).
* **Storage & Persistence**: Cloudflare KV (for shared results) and [Supabase](https://supabase.com) (for authenticated user history).
* **Rate Limiting**: Upstash Redis (or Cloudflare KV).
* **Authentication**: Clerk (with Google OAuth fallback logic).
* **Analytics & Monitoring**: PostHog, Hotjar, Resend, and Sentry.

## Quickstart

```bash
git clone https://github.com/CesarNog/the-council.git
cd the-council
npm install
cp .env.example .env.local   # fill in the necessary vars, see below
npm run dev                  # starts frontend only
```

Serverless functions (`api/*.js`) only run under `vercel dev`, not plain `vite`. To exercise the full stack locally:

```bash
npx vercel dev
```

## Environment variables

See `.env.example` for the complete list. Essential ones include:

| var | used for |
|---|---|
| `GROQ_API_KEY` | debate generation (`api/council.js`) |
| `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID` | KV read/write for rate limits & sharing |
| `SESSION_SECRET` | signs the session cookie (`api/_session.js`) |
| `OPENAI_API_KEY` | Synthesizes voices for the personas via OpenAI TTS |
| `GEMINI_TTS_API_KEY` | Fallback TTS synthesizer |

Optional features (Clerk Auth, Supabase, Upstash Redis, Sentry, PostHog, etc.) require their respective variables set.

## Testing

```bash
npm test
```

Covers `src/lib/*.test.js` and `api/*.test.js`. No component/UI tests yet.

## Deploy

Push to `main` — the repo is linked to Vercel, deploys are automatic. Manual deploy: `npx vercel deploy --prod`.

## Architecture

* **Frontend (`src/`)**: 
  * `components.jsx`: All UI including Chamber, ShareBar, Landing.
  * `auth-ui.jsx` / `clerk-auth-ui.jsx`: Auth buttons + profile UI.
  * `lib/`: Pure functions, persona definitions (`personas.js`), AI prompt builders, and TTS wrappers.
  * `App.jsx`: Routing.
* **Backend (`api/`)**: 
  * `council.js`: POST — generates a debate via Groq, persists it, rate-limits.
  * `result.js`: GET  — fetches a persisted debate by id.
  * `profile.js`: GET/PATCH — manages user profiles.
  * `tts.js`: Integrates OpenAI/Gemini TTS APIs.
  * `_*.js`: Internal helpers for KV, Supabase, Upstash, Groq, etc.

More detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`CLAUDE.md`](CLAUDE.md).

## Known limitations

- **Groq free tier TPM (8000/min) is shared across the org.** Each debate costs ~2000–2300 output tokens (input/prompt tokens are additional — not yet measured against a live Groq call; see CLAUDE.md before changing `buildPrompt` or `maxTokens`). Upstash Redis provides reliable production rate limiting; the Cloudflare KV fallback (used when Upstash isn't configured) is best-effort and can over-admit concurrent requests — see `docs/PRODUCTION_CHECKLIST.md`.
- **If Groq is unreachable or fails for any reason other than rate limiting, the chamber shows an honest "could not reach the Council, try again" state** — it never substitutes a fake debate for a real question (fixed after a real incident; see PR #75).
- **Text-to-Speech (TTS) falls back to the browser's Web Speech API** if both `OPENAI_API_KEY` and `GEMINI_TTS_API_KEY` are missing or fail.

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) and [`CLAUDE.md`](CLAUDE.md).

## License

MIT — see [`LICENSE`](LICENSE).

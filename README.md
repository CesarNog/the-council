# The Council

[![CI](https://github.com/CesarNog/the-council/actions/workflows/ci.yml/badge.svg)](https://github.com/CesarNog/the-council/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/github/deployments/CesarNog/the-council/production?label=vercel&logo=vercel)](https://the-council-murex.vercel.app)
[![License: MIT](https://img.shields.io/github/license/CesarNog/the-council)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)
[![Stars](https://img.shields.io/github/stars/CesarNog/the-council?style=social)](https://github.com/CesarNog/the-council/stargazers)

Nine alternate versions of yourself — Founder, Billionaire, Artist, Athlete, Monk, Scientist, Explorer, Romantic, Shadow — debate one real decision you bring them. They disagree, interrupt, change their minds, and vote.

**Live**: https://the-council-murex.vercel.app

## Stack

Vite + React frontend, Vercel serverless functions, [Groq](https://groq.com) (`openai/gpt-oss-120b`) for inference, Cloudflare KV for persisted results and rate limiting.

## Quickstart

```bash
git clone https://github.com/CesarNog/the-council.git
cd the-council
npm install
cp .env.example .env.local   # fill in the 4 vars, see below
npm run dev
```

Serverless functions (`api/*.js`) only run under `vercel dev`, not plain `vite`:

```bash
npx vercel dev
```

## Environment variables

| var | source | used for |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com/keys | debate generation (`api/council.js`) |
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com → API Tokens → "Edit Cloudflare Workers" | KV read/write |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard | KV scope |
| `CLOUDFLARE_KV_NAMESPACE_ID` | `wrangler kv namespace create` or API | where results / rate-limit counters live |

See `.env.example`.

## Testing

```bash
npm test
```

Covers `src/lib/share.js` (tally, headline generation, share text) and `src/lib/personas.js` (data integrity — every persona has a color, a pacing entry, an intensity entry). No component/UI tests yet.

## Deploy

Push to `main` — the repo is linked to Vercel, deploys are automatic. Manual deploy: `npx vercel deploy --prod`.

## Architecture

```
src/
  lib/personas.js   9 personas: colors, mood palette, reveal pacing/intensity — single source of truth
  lib/api.js        backend call + offline fallback (DEMO_Q, FALLBACK)
  lib/share.js      tally / headline / share text / canvas PNG card — pure functions, no React
  components.jsx     all UI: Ring, Landing, Onboarding, Chamber, ShareBar, ErrorBoundary
  App.jsx            routing only (landing / onboarding / chamber / shared /r/:id)
  styles.css

api/
  _kv.js       Cloudflare KV REST helper (not a route — Vercel ignores `_`-prefixed files)
  council.js   POST — generates a debate via Groq, persists it, rate-limits by IP
  result.js    GET  — fetches a persisted debate by id, powers /r/:id share links
```

More detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Known limitations

- **Groq free tier TPM (8000/min) is shared across the entire org, not per user.** Each debate costs ~2100 tokens → roughly **3 debates/min aggregate, across all simultaneous visitors**. Past that, the API returns 429 and the frontend silently falls back to a static offline debate — the UI never breaks, but the experience degrades.
- **The per-IP rate limiter (Cloudflare KV) is best-effort, not atomic.** Under high concurrency it can slightly overshoot `RATE_LIMIT` in `api/council.js`. It does not protect against the aggregate Groq ceiling above.
- **No UI/component tests**, only pure-logic tests (`src/lib/*.test.js`).
- **The canvas share card (`downloadShareCard`) has not been visually validated in production** — layout logic only.

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## License

MIT — see [`LICENSE`](LICENSE).

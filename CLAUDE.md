# CLAUDE.md

Context for AI assistants working in this repo.

## What this is

Vite + React SPA, Vercel serverless backend, Groq for LLM inference, Cloudflare KV for storage. No database, no auth, no user accounts. Single-file-per-concern architecture — not a large codebase, don't over-fragment further.

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

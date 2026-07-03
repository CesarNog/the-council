# Contributing

## Setup

```bash
npm install
cp .env.example .env.local   # see README for where each var comes from
npm run dev
```

## Before opening a PR

```bash
npm test
npm run build
```

CI runs both on every push and PR against `main` — a red check blocks review, not a formality.

## Conventions

- `src/lib/*.js` stays framework-free — pure functions only (except `resizeImageToDataUrl` and `downloadShareCard`, which need the DOM/canvas by nature). If it needs React or the DOM, it belongs in `src/components.jsx` or a dedicated UI file, not `lib/`.
- Persona data (colors, pacing, mood palette) lives only in `src/lib/personas.js`. `personas.test.js` fails if a new persona is missing from any of the three maps — keep it that way.
- Minimal diffs. A bug fix PR shouldn't also reformat unrelated code.
- No comments that restate what a well-named function already says. Comment the *why*, not the *what* — see `api/council.js` for examples (TPM budget, `reasoning_effort`).

## Reporting a bug

Open an issue with: what you expected, what happened, and — if it's backend-related — the response body from `/api/council` or `/api/result` (strip any personal data first).

## Security

Found a vulnerability? Don't open a public issue. See repository security settings for private reporting, or open an issue asking for a contact channel.

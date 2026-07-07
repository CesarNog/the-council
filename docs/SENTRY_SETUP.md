# Sentry Setup

Optional frontend error tracking with PII redaction.

## Env vars

```
VITE_SENTRY_DSN=https://...@....ingest.sentry.io/...
SENTRY_AUTH_TOKEN=     # CI source maps (optional)
SENTRY_ORG=
SENTRY_PROJECT=
```

## Behavior

- Initialized in `src/main.jsx` via `initSentry()`
- `ErrorBoundary` reports via `captureError()`
- Chamber API failures captured without question text
- Cookies/auth headers stripped in `beforeSend`

## API errors

Server-side Sentry for API routes can be added in a follow-up using `@sentry/node` in Vercel functions.

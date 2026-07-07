# PostHog Setup

Optional product analytics. Consent-gated via existing `council:consent`.

## Env vars

```
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

## Events (no raw questions)

See `Events` in `src/lib/analytics.js`:

- `landing_viewed`, `landing_cta_clicked`
- `onboarding_started`, `onboarding_completed`
- `question_submitted`, `debate_started`, `debate_completed`
- `verdict_viewed`, `share_clicked`, `share_card_downloaded`
- `rate_limit_seen`, `api_error_seen`, `fallback_used`

Payloads sanitized to strings <64 chars, numbers, booleans only.

## CSP

Add PostHog host to `connect-src` in `vercel.json` when using custom region.

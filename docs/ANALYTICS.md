# Analytics

The Council uses a consent-first analytics layer. No third-party analytics script loads until the user explicitly accepts analytics cookies.

## Architecture

```
src/lib/consent.js        isAnalyticsEnabled() / isAdvertisingEnabled()
src/lib/analytics.js      initAnalytics() / trackEvent() / trackPageView()
src/App.jsx               wires consent decisions → initAnalytics()
```

## How it works

1. On first visit the `ConsentBanner` appears (bottom bar).
2. Until the user clicks **Accept all**, `isAnalyticsEnabled()` returns `false`.
3. `initAnalytics()` calls `initHotjar()` which guards on `isAnalyticsEnabled()` — so Hotjar never loads without consent.
4. After the user accepts (either via the banner or `CookieSettings`), `initAnalytics()` is called immediately and Hotjar loads for that session.
5. On subsequent visits `initAnalytics()` runs on mount; if consent was previously stored it initialises Hotjar automatically.

## Hotjar

| Env var | Where set | Notes |
|---|---|---|
| `VITE_HOTJAR_ID` | Vercel env vars (Production) | Site ID from `hotjar.com > Settings > Tracking Code` |
| `VITE_HOTJAR_VERSION` | Vercel env vars (Production) | Defaults to `6` if unset |

Hotjar **never** loads in `import.meta.env.DEV` mode regardless of consent.

## Payload sanitisation

`trackEvent(name, payload)` strips any string value ≥ 64 characters from the payload before forwarding to GA4 (`window.gtag`). This prevents raw question text from being sent to analytics. Numbers and booleans always pass through.

## GA4 placeholder

`window.gtag` calls are gated but the GA4 `<script>` tag is not yet injected. Wire in GA4 in Loop 3/4 when the AdSense / GA script is added — the `trackEvent` calls will start firing automatically.

## Adding a new event

```js
import { trackEvent } from "./lib/analytics.js";

trackEvent("verdict_shared", { personas: 9, mood: "electric" });
```

Only call `trackEvent` from outside `src/lib/` (React components, App). Keep `src/lib/analytics.js` free of React/DOM imports.

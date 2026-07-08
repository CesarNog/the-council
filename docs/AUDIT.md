# Production Audit — The Council

_Audited: July 2026 · Branch: `cursor/audit-production-upgrade`_

Live: https://the-council-murex.vercel.app  
Repo: https://github.com/CesarNog/the-council

---

## Executive Summary

The Council is a polished Vite + React SPA with Vercel serverless APIs, Groq inference, and Cloudflare KV storage. Core product loop works: onboarding → debate → verdict → share. Security baseline is above average for a solo MVP. Gaps are in **production infrastructure** (auth, database, rate limiting, observability, monetization) and **mobile polish** (partially fixed in PR `cursor/fix-mobile-ui-footer-overflow`).

Target stack: Clerk · Supabase · Upstash · PostHog · Sentry · Resend · Stripe · Pinecone · Cloudflare DNS · Vercel.

---

## Current Architecture

```
Browser (React 19 SPA, Vite 8)
  ├── Static assets → Vercel CDN
  ├── Client state → localStorage (language, consent, theme, history, localSession)
  └── fetch() → Vercel Serverless (api/*.js)
        ├── Groq openai/gpt-oss-120b — debate generation
        ├── Cloudflare KV REST — results, profiles, rate limits
        ├── Google JWKS — OAuth token verify (custom session cookie)
        ├── OpenAI / Gemini — optional TTS
        └── Hotjar / AdSense — consent-gated (client)

Routing: client-side in App.jsx (landing | onboarding | chamber | shared /r/:id | static legal)
SEO: api/share-page.js + api/decision-page.js inject OG tags server-side
```

| Layer | Files | Notes |
|-------|-------|-------|
| Entry | `src/main.jsx` → `App.jsx` | Single root component, no router lib |
| UI | `src/components.jsx` (~900 lines) | Ring, Landing, Onboarding, Chamber, Verdict, ShareBar |
| Auth UI | `src/auth-ui.jsx` | GoogleSignIn, ProfilePanel |
| Consent | `src/consent-ui.jsx` | Banner + settings modal |
| i18n | `src/lib/i18n.js` | en, pt, es, zh — `t(lang, key)` |
| API client | `src/lib/api.js` | summonCouncil + static FALLBACK |
| Share | `src/lib/share.js` | tally, headline, canvas PNG card |
| Personas | `src/lib/personas.js` | 9 personas, pacing, colors |
| Server | `api/council.js`, `result.js`, `auth.js`, `profile.js`, `tts.js` | One file = one route |
| Storage | Cloudflare KV | `result:*`, `user:*`, `rl:*` |
| Config | `vercel.json` | Rewrites, CSP, security headers |

**Runtime deps:** react, react-dom, jose, impeccable (4 total).  
**Bundle (prod):** JS 300 KB / 96 KB gzip · CSS 43 KB / 9 KB gzip.  
**Tests:** 192 passing (9 files) — pure lib + session tests only.

---

## Audit Findings by Area

### Mobile / Responsive

| Status | Issue |
|--------|-------|
| **Fixed (PR `cursor/fix-mobile-ui-footer-overflow`)** | Footer links `flex-wrap`, disclaimer `min-width:200px` clipping, consent banner covering footer, legal pages missing footer, `100vh` without safe-area |
| **Fixed (same PR)** | Global `overflow-x:hidden`, `min-width:0` on flex children, `100dvh`, sticky stage `max-height`, chamber padding |
| **Remaining** | Consent reserve uses fixed `--consent-reserve:112px` — may drift if banner copy changes |
| **Remaining** | Google Sign-In iframe width not fully controlled |
| **Remaining** | No visual regression tests at 320–768px |

### Footer / Legal

Root cause of cutoff (now fixed on mobile branch):

1. `.footer-links` — no `flex-wrap`; single row overflow on 320–430px
2. `.footer-note` — `min-width:200px` prevented shrink inside `overflow-x:hidden` root
3. Fixed consent banner — no bottom reserve; overlapped footer on iOS Safari
4. Legal routes — early-returned without footer component

### Sticky Council Stage

- Mobile: `position:sticky; top:44px` with compact mode at scroll
- Fixed in mobile PR: `max-height:72px` compact, chamber `padding-bottom` with safe-area
- Risk: very long translated chamber titles may still need line clamp review

### i18n

| Status | Detail |
|--------|--------|
| Good | Core UI, consent, footer, onboarding, verdict labels — 4 languages |
| Hardcoded EN | Share platform labels (`WhatsApp`, `LinkedIn`, `Facebook`) in `components.jsx` |
| Hardcoded EN | `api/share-page.js` headline strings |
| Hardcoded EN | Cookie Policy body in `App.jsx` (partial — title uses i18n key) |
| Hardcoded EN | ErrorBoundary fallback text |
| Hardcoded EN | `FALLBACK` debate content (intentional offline demo) |

### Auth

| Current | Gap |
|---------|-----|
| Google OAuth via GSI + custom HMAC cookie | Not production-validated; env vars often unset → 503 |
| Client fallback: decode JWT locally without verify | **Must not ship to prod** |
| Profiles in KV `user:<sub>` | No relational queries, no cross-device sync guarantee |
| No Clerk | No SSO management, no user management dashboard |

### Database / Persistence

| Data | Location | Issue |
|------|----------|-------|
| Debate results | KV `result:<id>` | 30-day TTL set in council.js ✓ |
| User profiles | KV `user:<sub>` | No RLS, no migrations, no backup strategy |
| Anonymous history | localStorage | Lost on clear |
| Consent | localStorage | Not synced server-side for authed users |
| Rate limits | KV `rl:*` | Eventually consistent, not atomic |

### Rate Limiting

| Endpoint | Limit | Issue |
|----------|-------|-------|
| `/api/council` | 3/min/IP (KV) | Best-effort; silent allow if KV down |
| `/api/auth` | 10/min/IP | Same |
| `/api/tts` | **None** | Gemini/OpenAI quota exposed |
| Groq org TPM | 8000/min shared | Hard ceiling; frontend silently falls back |

**User-facing rate limit UX:** 429 thrown but frontend falls back to static `FALLBACK` debate — **misleading**, not premium messaging.

### API Security

| Present | Missing |
|---------|---------|
| Method checks, input length slices | Zod/schema validation |
| CSP, X-Frame-Options, nosniff | CORS explicit policy doc |
| HMAC session, timing-safe compare | Request body size limit |
| IP rate limits (best-effort) | Per-user tier limits |
| No stack traces to client | Structured error codes in all routes |
| | `/api/tts` rate limit |

### Observability

| Present | Missing |
|---------|---------|
| `console.error` in API routes | Sentry |
| Hotjar (consent-gated) | PostHog product events |
| | Structured logging |
| | Groq TPM alerting |
| | Release tagging |

### Analytics

- Hotjar only (heatmaps/recordings)
- `trackEvent()` stub — GA4 placeholder, no PostHog
- Questions stripped from payloads ✓
- Missing events: debate_started, rate_limit_seen, checkout_*, etc.

### Share / Virality

- Canvas PNG card (1080×1080) — not visually validated in prod
- Single format; no story/LinkedIn/X variants
- Share URL hardcodes fallback `the-council-murex.vercel.app` in `share.js`
- OG injection works via `share-page.js` ✓
- No QR code

### SEO / Acquisition

| Present | Missing |
|---------|---------|
| `index.html` meta, OG, Twitter | `VITE_SITE_URL` env |
| `public/sitemap.xml`, `robots.txt` | Dynamic sitemap for `/decisions/*` |
| `api/decision-page.js` for SEO slugs | Full decision landing page content audit |
| `/r/:id` OG tags | JSON-LD on share pages |
| | Localized SEO metadata |

### Accessibility

| Present | Missing |
|---------|---------|
| Focus-visible styles | `aria-live` on debate loading |
| Some aria-labels | Focus management after verdict |
| Reduced motion in CSS (partial) | Full `prefers-reduced-motion` audit |

### Performance

- Small bundle (96 KB gzip JS) — excellent
- No code splitting (single chunk) — acceptable at current size
- No streaming from Groq — 5–15s spinner
- Google Fonts loaded via `@import` — render-blocking

### Tests / Quality

| Present | Missing |
|---------|---------|
| 192 unit tests (lib, consent, ads, i18n) | ESLint |
| `api/_session.test.js` | Playwright E2E |
| | Component tests |
| | API integration tests |
| | TypeScript |

---

## Critical Issues

1. **Silent offline fallback on API failure/rate limit** — user sees wrong debate for their question
2. **Auth 503 → unverified local JWT** — security gap if deployed without Google env vars
3. **No production database** — KV unsuitable for relational history, billing, RLS
4. **KV rate limiting non-atomic** — abuse + Groq TPM exhaustion under load
5. **No error tracking** — production failures invisible
6. **Footer cutoff on mobile** — fixed in open PR, not merged to main

## Medium Issues

1. `/api/tts` unprotected
2. No Zod validation on API payloads
3. PostHog/Sentry/Stripe/Clerk/Supabase not integrated
4. Hardcoded `vercel.app` URL in share fallback
5. Share card single format; not validated visually
6. i18n gaps in share labels and server-side headlines
7. No E2E tests
8. No ESLint
9. `getProfile()` called on every load including `/r/:id`
10. Analytics events incomplete for growth funnel

## Nice-to-Have

1. TypeScript migration
2. Code splitting if bundle grows
3. Groq response streaming
4. PWA / service worker
5. Voice UI wired to `/api/tts`
6. French, German, Japanese
7. CouncilLogo SVG sprite
8. Font loading optimization (preload)

---

## Recommended Stack Migration Plan

| Current | Target | Phase | Rationale |
|---------|--------|-------|-----------|
| Google GSI + custom cookie | **Clerk** | 3 | Managed auth, Google SSO, user dashboard, webhooks |
| Cloudflare KV profiles | **Supabase** | 4 | Postgres, RLS, relational history, Stripe mirror |
| KV rate limits | **Upstash Redis** | 5 | Atomic counters, sliding window, tiered limits |
| Hotjar only | **PostHog** | 7 | Product events, funnels, feature flags |
| console.error | **Sentry** | 8 | Error tracking, release health, redaction |
| — | **Resend** | 9 | Welcome email, future weekly digest |
| — | **Stripe** | 11 | Premium tier, checkout, webhooks → Supabase |
| — | **Pinecone** | 10 | Optional vector memory (Memory Echoes) |
| Cloudflare KV results | Keep short-term | — | Migrate to Supabase `shares` + optional Redis cache |
| Groq | Keep | — | Cost-effective; monitor TPM |
| Vercel | Keep | — | Already deployed |
| Namecheap + Cloudflare DNS | Document | 12 | Custom domain readiness |

### Migration Principles

- **Graceful degradation:** every new service wrapped in env-var guards; app boots without any optional key
- **No big-bang:** Clerk + Supabase can run parallel to KV during transition
- **RLS first:** never expose Supabase service role to frontend
- **Privacy by default:** no raw questions in PostHog/Sentry/Pinecone without opt-in

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Groq free TPM shared across org | All users degraded simultaneously | Upstash limits + premium queue + user messaging |
| KV → Supabase migration data loss | User history lost | Dual-write period; export tool |
| Clerk outage | Auth broken | Anonymous flow always works |
| Stripe webhook misconfig | Wrong plan state | Verify signatures; Supabase as mirror only |
| CSP breaks new integrations | Clerk/PostHog blocked | Update `vercel.json` CSP per phase |
| i18n longer strings break layout | Clipping on mobile | `overflow-wrap`, test pt/es/zh |
| Pinecone costs | Bill surprise | Optional, opt-in, summary-only indexing |

---

## Prioritized Roadmap (15 Phases)

| # | Phase | Status | Branch | Priority |
|---|-------|--------|--------|----------|
| 1 | Full audit | **This doc** | `cursor/audit-production-upgrade` | P0 |
| 2 | Mobile/responsive polish | **Done (PR open)** | `cursor/fix-mobile-ui-footer-overflow` | P0 |
| 3 | API security hardening | Not started | — | P0 |
| 4 | Clerk auth | Not started | — | P0 |
| 5 | Supabase database | Not started | — | P0 |
| 6 | Upstash rate limiting | Not started | — | P0 |
| 7 | PostHog analytics | Not started | — | P1 |
| 8 | Sentry error tracking | Not started | — | P1 |
| 9 | Resend emails | Not started | — | P2 |
| 10 | Pinecone memory | Not started | — | P2 |
| 11 | Stripe payments | Not started | — | P1 |
| 12 | Cloudflare/domain docs | Not started | — | P2 |
| 13 | SEO/public acquisition | Not started | — | P1 |
| 14 | Share engine upgrade | Not started | — | P1 |
| 15 | Production checklist | Not started | — | P0 |

### Suggested Implementation Order

```
Audit → Mobile (merge PR) → API Security → Clerk → Supabase → Upstash
  → PostHog → Sentry → Resend → Stripe → Pinecone → Domain docs → SEO → Share → Checklist
```

### Phase 2 Acceptance (mobile PR)

- [x] Footer wraps; no cutoff
- [x] Safe-area padding
- [x] No horizontal scroll (global)
- [x] Sticky stage spacer
- [x] Legal pages include footer
- [x] 192 tests pass

### Immediate Next Actions

1. Merge `cursor/fix-mobile-ui-footer-overflow`
2. Phase 3: Zod validation, `/api/tts` rate limit, rate-limit UX (no silent fallback)
3. Phase 4: Clerk integration with anonymous-first flow
4. Update `.env.example` with all planned vars (no secrets)

---

## Environment Variables — Current vs Target

### Current (required)

`GROQ_API_KEY`, `CLOUDFLARE_*`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`

### Current (optional)

`OPENAI_API_KEY`, `GEMINI_TTS_API_KEY`, `VITE_HOTJAR_ID`, `VITE_ADSENSE_PUBLISHER_ID`

### Target additions (by phase)

| Phase | Variables |
|-------|-----------|
| 3 | — |
| 4 | `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` |
| 5 | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 6 | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| 7 | `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` |
| 8 | `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| 9 | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| 10 | `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` |
| 11 | `STRIPE_*` (4 vars) |
| 12 | `VITE_SITE_URL` |

---

## North Star Alignment

| Goal | Current | After roadmap |
|------|---------|---------------|
| Discover from shared verdict | `/r/:id` works, OG tags ✓ | Improved CTA, SEO pages |
| Understand in 5 seconds | Landing strong ✓ | Mobile polish ✓ |
| Ask own question | Works anonymous ✓ | Rate limits with clear UX |
| Cinematic debate | Core experience ✓ | Streaming (future) |
| Share result | Basic canvas + links | Multi-format cards |
| Return later | localStorage only | Supabase history + memory |

---

## References

- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
- [`docs/SECURITY.md`](SECURITY.md)
- [`docs/ENVIRONMENT.md`](ENVIRONMENT.md)
- [`docs/KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
- [`docs/ROADMAP.md`](ROADMAP.md)
- [`README.md`](../README.md)

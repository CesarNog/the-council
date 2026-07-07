# Changelog — The Council

_Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions._

---

## [Unreleased]

### Added
- `docs/AUDIT.md` — full codebase audit with strengths, weaknesses, and priority fixes
- `docs/SECURITY.md` — security analysis: auth, sessions, rate limiting, secrets, headers
- `docs/API.md` — complete API reference for all 8 serverless routes
- `docs/FLOW_GOOGLE_AUTH.md` — Google authentication flow documentation
- `docs/FLOW_COUNCIL.md` — council generation flow documentation
- `docs/FLOW_RESULTS.md` — results/Chamber display flow documentation
- `docs/FLOW_SIGNUP.md` — sign-up/onboarding flow documentation
- `docs/FLOW_LOGIN.md` — session restoration flow documentation
- `docs/FLOW_PROFILE.md` — profile management flow documentation
- `docs/FLOW_SETTINGS.md` — settings flow documentation
- `docs/FLOW_ADMIN.md` — admin capabilities documentation
- `docs/FLOW_BILLING.md` — planned billing flow documentation
- `docs/COMPONENTS.md` — component reference documentation
- `docs/DESIGN_SYSTEM.md` — design tokens, typography, motion system
- `docs/DEPLOYMENT.md` — deployment guide
- `docs/ENVIRONMENT.md` — environment variable documentation
- `docs/LOCAL_DEVELOPMENT.md` — local development setup guide
- `docs/ROADMAP.md` — product roadmap
- `docs/KNOWN_LIMITATIONS.md` — known limitations and workarounds
- `docs/TROUBLESHOOTING.md` — common issues and solutions
- `docs/CHANGELOG.md` — this file
- Profile dashboard: 3-column layout with SVG progress ring, avatar, values input, situation textarea
- i18n keys for profile dashboard (18 new keys across en/pt/es/zh)
- Mobile-responsive profile dashboard (horizontal nav tabs + single column at ≤768px)

### Changed
- Premium cinematic UI/UX pass on Chamber, Landing, and Onboarding components
- Improved typography, spacing, and visual hierarchy throughout

### Security
- Added `Content-Security-Policy` header to `vercel.json` (blocks XSS at HTTP level)
- Added rate limiting to `/api/auth` (10 req/min/IP via KV counter `rl:auth:<ip>`)
- Added `SESSION_SECRET` startup guard in `api/_session.js` — server throws on startup if env var is missing
- Added `vitest.config.js` and `vitest.setup.js` to set env vars before module imports in tests

### Fixed
- CSS unclosed `@media` bracket in `styles.css`
- Blank loading state on session check — now shows animated dots during `GET /api/profile`
- `StaticPage` body rendered with semantic `<p>` tags instead of `<pre>`

---

## [0.3.0] — 2026-06

### Added
- Google Sign-In integration (`src/auth-ui.jsx`, `api/auth.js`)
- User profile system (`api/profile.js`, Cloudflare KV `user:<sub>`)
- Life Mode feature (`src/life-mode.jsx`, proactive persona check-in)
- `VITE_GOOGLE_CLIENT_ID` baked into `vite.config.js` for all Vite/Vercel builds
- Session cookie: HMAC-SHA256, HttpOnly, Secure, SameSite=Lax, 30 days
- Local session fallback when `/api/auth` returns 503

### Changed
- `api/council.js`: persisted field changed from `question` to `asked` (prevents overwrite bug)

---

## [0.2.0] — 2026-05

### Added
- Cloudflare KV persistence for debate results
- IP rate limiting: 3 req/min via KV counter
- Share page with OG meta tags (`api/share-page.js`)
- `/r/:id` share URLs via Vercel rewrite
- Consent banner and cookie settings
- Language selector (en, pt, es, zh)
- Offline fallback debate (`FALLBACK_DEBATE`)
- 9-persona system with colors, pacing, intensity

### Changed
- Model upgraded to `openai/gpt-oss-120b`
- `reasoning_effort: "low"` required for reasoning model

---

## [0.1.0] — 2026-04

### Added
- Initial project: React 19 + Vite 8 + Vercel serverless
- `POST /api/council` — LLM debate generation via Groq
- Basic Chamber UI with turns, votes, verdict
- Basic Landing with question input
- Basic Onboarding (name, situation, values)
- 4 languages: en, pt, es, zh
- Vercel deployment

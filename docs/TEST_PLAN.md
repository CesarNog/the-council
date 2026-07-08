# Test Plan — The Council

_Last updated: July 2026_

---

## Test Levels

### 1. Unit Tests (Vitest)

**Location:** `src/lib/*.test.js`, `api/_session.test.js`

**Current coverage:**
- `personas.test.js` — validates all 9 personas have required keys in `PERSONAS`, `INTENSITY`, `PACE`
- `share.test.js` — tests `tally()`, `headline()`, `shareText()`
- `api/_session.test.js` — tests HMAC signing, verification, timing-safe comparison, tampered/expired/malformed token rejection, `clearSessionCookie` Max-Age

**To add:**
- `i18n.test.js` — all `t(lang, key)` calls return strings; no missing keys in any language
- `api.test.js` — `summonCouncil()` fallback behavior; response parsing
- `consent.test.js` — consent state persistence and retrieval
- `history.test.js` — history max-10 enforcement, deduplication
- `analytics.test.js` — event firing conditions (consent-gated)

### 2. Component Tests (planned — Vitest + Testing Library)

**To add:**
- `Landing.test.jsx` — renders, submits question, shows loading state
- `Chamber.test.jsx` — renders all sections with mock result
- `Onboarding.test.jsx` — multi-step form, skip behavior
- `ProfileSettings.test.jsx` — renders, saves situation/values, avatar
- `ShareBar.test.jsx` — all share buttons trigger correct actions
- `LanguageSelector.test.jsx` — selection persisted, text updates
- `ConsentBanner.test.jsx` — accept/decline, settings update

### 3. API Tests (planned — Vitest + node-fetch or supertest)

**To add:**
- `council.test.js` — validates input (500-char limit, single `invalid question` error), rate limits, returns expected shape
- `result.test.js` — fetches by ID, 404 for unknown IDs, 502 on KV failure
- `auth.test.js` — POST verifies token, POST 400 on missing credential, POST 429 on rate limit, DELETE clears cookie, startup failure when `SESSION_SECRET` missing
- `profile.test.js` — GET requires session, PATCH validates fields, picture MIME prefix + size check, history cap at 10 entries
- `share-page.test.js` — returns HTML with OG tags

### 4. End-to-End Tests (planned — Playwright)

**Location:** `e2e/`

**Critical paths:**
- `e2e/happy-path.spec.js` — Landing → type question → submit → Chamber → share
- `e2e/auth.spec.js` — sign-in → profile → update → sign-out
- `e2e/onboarding.spec.js` — complete onboarding → submit question with profile
- `e2e/shared-result.spec.js` — open `/r/:id` URL → Chamber renders
- `e2e/language.spec.js` — switch language → UI text changes
- `e2e/offline.spec.js` — block network → fallback debate shown
- `e2e/mobile.spec.js` — 375px viewport → all features work, no horizontal scroll
- `e2e/accessibility.spec.js` — axe-core scan on all major screens

### 5. Accessibility Tests

**Tools:** axe-core (Playwright plugin), manual screen reader testing

**Checks:**
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text
- All interactive elements keyboard-accessible
- Visible focus states
- `aria-label` on icon-only buttons
- `aria-live` for debate loading
- No keyboard traps
- Tab order matches visual order
- Reduced-motion respected

### 6. Localization Tests

**Coverage:**
- All 4 languages (en, pt, es, zh) render without broken strings
- No missing translation keys (automated check in `i18n.test.js`)
- Language switch updates all visible text
- Persona names localized correctly
- Date/time formatting locale-aware

### 7. Performance Tests

**Tools:** Lighthouse CI, WebPageTest

**Targets:**
- Performance: ≥ 95
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 8. Error State Tests

- Question too long → validation message shown
- Rate limited → 429 toast with retry countdown
- Groq unavailable → error screen with retry
- Network offline → fallback debate used
- Invalid share URL → 404 empty state
- Auth fail → error message, continue anonymously option

### 9. Loading State Tests

- Submit question → loading spinner/animation shown
- Share URL load → skeleton or spinner while fetching
- Profile load → no flash of empty content
- Session check → no blank screen

---

## Running Tests

```bash
npm test              # run all unit tests once
```

**To run specific test files:**
```bash
npx vitest run src/lib/personas.test.js
npx vitest run api/_session.test.js
```

**To run Playwright (once configured):**
```bash
npx playwright test
npx playwright test e2e/happy-path.spec.js
npx playwright test --ui  # interactive mode
```

---

## CI Integration

Current CI (GitHub Actions on push/PR to `main`):
1. `npm install`
2. `npm run lint` (ESLint)
3. `npm test` (Vitest)
4. `npm run build` (Vite build)

Planned additions:
- `npx playwright test` (once E2E suite is written)

All steps must pass before merging to `main`.

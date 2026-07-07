# Flow: Settings — The Council

_Last updated: July 2026_

---

## Purpose

Allow users to configure app preferences: language, theme, consent (analytics, ads), and account management.

---

## Current State

Settings are partially implemented. Most are accessible via UI controls directly in the app (not a dedicated settings screen). A dedicated Settings tab in the profile dashboard is planned but currently shows "coming soon".

---

## Implemented Settings

### Language

**Component:** `LanguageSelector` in `src/language-selector.jsx`

- Available: English (en), Português (pt), Español (es), 中文 (zh).
- Persisted to `localStorage` under `council:lang`.
- Applied via `t(lang, key)` calls throughout the app.
- Language switch does not persist across hard navigation (falls back to `detectBrowserLanguage()` until localStorage is read). — tracked in AUDIT.md.

### Theme

- Dark/light mode toggle.
- Persisted to `localStorage` under `council:theme`.
- Applied via CSS class on root element.

### Consent (Analytics & Ads)

**Component:** `ConsentBanner` in `src/consent-ui.jsx`

- Shown on first visit.
- User accepts or declines analytics (Hotjar) and ads (AdSense).
- Consent state persisted to `localStorage` under `council:consent`.
- Neither Hotjar nor AdSense loads without explicit consent.

### Cookie Settings

**Component:** `CookieSettings` in `src/consent-ui.jsx`

- Accessible via footer link.
- Allows granular update of consent choices after initial decision.

---

## Planned Settings (Profile Dashboard — "Coming Soon")

| Setting | Description |
|---|---|
| Notifications | Email/push notification preferences |
| Privacy | Data retention, export, and deletion |
| Billing | Subscription management (future premium tier) |
| Account | Sign-out, account deletion |

---

## API Calls

No API calls for current settings — all are localStorage-only.

Planned for future:
- `PATCH /api/profile` for server-persisted preferences (theme, language, notification opt-in).

---

## Edge Cases

- **localStorage blocked (private browsing in some browsers):** `safeStorage`-style wrapper needed; currently raw `localStorage.setItem` may throw.
- **Language not detected correctly:** `detectBrowserLanguage()` uses `navigator.language`; may default to `en` for unsupported languages.
- **Consent banner flash:** Shows briefly on each load until localStorage is read. A CSS `display:none` until JS hydrates would fix the flash.

---

## Future Improvements

- Persist language and theme preferences server-side for signed-in users.
- Add notification preferences (email digest of debate history).
- Add account deletion flow with KV cleanup.
- Add data export (JSON of debate history).
- Implement the Settings tab in the profile dashboard.

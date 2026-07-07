# Flow: Profile — The Council

_Last updated: July 2026_

---

## Purpose

Allow signed-in users to view and update their profile: name, situation, values, avatar, and debate history. Also surfaces the Life Mode feature (proactive persona check-in based on profile data).

---

## Screens / Sections

### Profile Dashboard

**Component:** `ProfileSettings` in `src/auth-ui.jsx`

Three-column layout:
- **Left nav (190px):** Navigation tabs — Profile, History, Settings (coming soon), Notifications (coming soon), Privacy (coming soon), Billing (coming soon), Help (coming soon).
- **Main content (1fr):** Active tab content.
- **Right sidebar (210px):** Account stats, quick tips.

Mobile: horizontal tab strip + no sidebar.

### Profile Tab — Identity

- **Avatar:** 88px circle; shows Google picture or initials fallback; "change photo" button.
- **Name:** Read-only (from Google). Future: allow display name override.
- **Situation:** 140-char textarea; context for the LLM (e.g. "PM, 31, restless").
- **Values:** Up to 3 tags; typed and added with Enter/comma; removable.
- **Save button:** `PATCH /api/profile` with updated fields.

### Profile Tab — Progress Ring

- SVG progress ring showing profile completion % (avatar, situation, values each contribute).
- Animated on mount.

### History Tab (planned)

- List of past debates with date, question preview, verdict direction.
- Paginated (max 20 server-side; UI pagination planned).

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| GET /api/profile | Profile page mount | `/api/profile` | Session cookie |
| PATCH /api/profile | Save button click | `/api/profile` | Session cookie |
| PATCH /api/profile | Picture upload | `/api/profile` | Session cookie |

---

## PATCH /api/profile Fields

| Field | Type | Constraint |
|---|---|---|
| `situation` | string | Max 200 chars |
| `values` | string[] | Max 3 items |
| `picture` | string | data URI, max 300,000 bytes |
| `dismissLifeMode` | boolean | Clears lifeMode from profile |
| `recordDebate` | object | Appended to history (max 20) |

---

## Validation

| Field | Client | Server |
|---|---|---|
| `situation` | Max 140 chars (char counter) | Max 200 chars; wrong type → 400 |
| `values` | Max 3 via UI | Max 3 items → 400 if exceeded |
| `picture` | File size shown | Max 300,000 bytes → 400; no MIME check (bug — see SECURITY.md) |

---

## Error Cases

| Scenario | HTTP | Behavior |
|---|---|---|
| Not signed in | 401 | Redirect to sign-in |
| Situation too long | 400 | Inline error |
| Values > 3 | 400 | UI prevents adding more |
| Picture too large | 400 | Client-side size check before upload |
| KV write fails | 500 | Error toast |

---

## Life Mode

**Component:** `LifeMode` in `src/life-mode.jsx`

- Triggered if 12+ hours have passed since `lastVisit`.
- `GET /api/profile` generates a Life Mode teaser (a persona check-in based on situation/values/history).
- Shown as a subtle panel or modal on the landing page.
- User can dismiss; dismissal is saved via `PATCH /api/profile { dismissLifeMode: true }`.

---

## Edge Cases

- **No profile data yet:** Show empty state with completion prompts.
- **Avatar upload on slow connection:** Show progress indicator (not currently implemented).
- **Picture MIME spoofing:** Server only checks byte size, not MIME type (tracked in SECURITY.md).
- **Values in multiple languages:** Values are free-text; no normalization or translation.
- **History grows beyond 20:** Server caps at 20 entries (truncates oldest).

---

## Future Improvements

- Add MIME type validation for picture upload (server-side).
- Implement History tab with pagination.
- Add display name override (separate from Google name).
- Add account deletion flow (GDPR right to erasure).
- Add export of debate history as PDF/JSON.
- Add notification preferences (push, email).
- Add billing tab for premium subscriptions.

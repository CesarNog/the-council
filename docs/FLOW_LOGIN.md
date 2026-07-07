# Flow: Login / Session Restoration — The Council

_Last updated: July 2026_

---

## Purpose

Restore the user's session on page load. If the user previously signed in with Google and has a valid session cookie, they are silently signed in without re-authentication.

---

## Screens / Steps

### Step 1 — Page Load

**File:** `src/App.jsx` → initial `useEffect`

- App mounts and calls `getProfile()` from `src/lib/auth.js`.
- This sends `GET /api/profile` with the `council_session` cookie.

### Step 2 — Session Validation

**File:** `api/profile.js` → `getSessionFromRequest(req)`

- Server reads the `council_session` cookie.
- Verifies HMAC signature with `SESSION_SECRET`.
- Checks `exp` timestamp (30-day session).
- If valid: returns the user profile from KV.
- If invalid/missing: returns 401.

### Step 3a — Valid Session

- `App.jsx` receives the profile and sets `user` state.
- User sees their profile avatar and name in the top-right.
- No sign-in prompt shown.

### Step 3b — Invalid / Expired Session

- `App.jsx` receives 401.
- `user` state remains null.
- Sign-in button is shown.
- No error is displayed (silent fail is correct UX for session restoration).

### Step 4 — Local Session Fallback

**File:** `src/lib/auth.js`

- If the user previously authenticated in 503-fallback mode (no backend), their session is in `localStorage` under `council:localSession`.
- `App.jsx` reads this and sets `user` state without an API call.
- This is the anonymous/preview environment experience.

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| GET /api/profile | Every page load | `/api/profile` | Session cookie |

---

## Session Cookie Properties

| Property | Value |
|---|---|
| Name | `council_session` |
| Algorithm | HMAC-SHA256 |
| Payload | `{ sub, exp }` |
| Max-Age | 2592000 (30 days) |
| HttpOnly | Yes |
| Secure | Yes |
| SameSite | Lax |

---

## Error Cases

| Scenario | Behavior |
|---|---|
| Cookie missing | 401; silent fail; sign-in shown |
| Cookie tampered | 401; silent fail |
| Cookie expired | 401; silent fail |
| `SESSION_SECRET` missing | Server throws on startup — function will not serve requests |
| KV unreachable | 500; user treated as signed out |
| Network failure | User treated as signed out |

---

## Loading State

An animated dots spinner is shown during the `GET /api/profile` check, preventing the blank white screen.

---

## Future Improvements

- Implement token refresh (extend session expiry on active use).
- Implement token refresh (extend session expiry on active use).
- Provide "remember me" / explicit session duration control.
- Emit analytics event on session restore vs. fresh visit.
- Store session creation timestamp for audit log.

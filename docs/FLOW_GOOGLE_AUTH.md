# Flow: Google Authentication — The Council

_Last updated: July 2026_

---

## Purpose

Allow users to sign in with their Google account to unlock profile persistence, debate history, and Life Mode features.

---

## Screens / Steps

### Step 1 — Landing page (not signed in)

**Component:** `Landing` in `src/components.jsx`
**Auth component:** `GoogleSignIn` in `src/auth-ui.jsx`

- User sees a "Entrar com Google" / "Sign in with Google" button in the top-right of the page.
- The button is rendered by the Google Identity Services (GSI) SDK injected via a `<script>` tag appended to `<head>` in `GoogleSignIn`'s `useEffect`.

### Step 2 — Google Credential Popup

- Clicking the button triggers Google's One Tap / Sign-In popup.
- Google returns a credential (an ID token JWT) via the `callback` configured in `window.google.accounts.id.initialize`.

### Step 3 — Client receives credential

**File:** `src/auth-ui.jsx` → `handleGoogleCredential(credentialResponse)`

- `credentialResponse.credential` is the raw Google ID token.
- Client calls `signIn(credential)` from `src/lib/auth.js`.

### Step 4 — Backend verification (`POST /api/auth`)

**File:** `api/auth.js`

1. Receives `{ credential }` in request body.
2. Verifies the JWT signature using Google's JWKS endpoint (`https://www.googleapis.com/oauth2/v3/certs`) via the `jose` library.
3. Validates: `iss` = `accounts.google.com`, `aud` = `GOOGLE_CLIENT_ID`, token not expired.
4. Extracts `sub`, `email`, `name`, `picture` from the payload.
5. Checks KV for existing profile (`user:<sub>`).
6. Creates or updates the profile in KV.
7. Issues a session cookie: `council_session=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
8. Returns the user profile object.

### Step 5 — Client stores session

**File:** `src/lib/auth.js` → `signIn()`

- On 200: stores user object in `App.jsx` state via `setUser()`.
- Profile dashboard becomes accessible.
- Debate history from `localStorage` is optionally migrated to the server profile.

### Step 6 — Fallback: backend not configured (503)

**File:** `src/lib/auth.js`

If `/api/auth` returns 503 (GOOGLE_CLIENT_ID not set in Vercel env):
- Client decodes the Google JWT client-side (no signature verification).
- Extracts `sub`, `email`, `name`, `picture` from the decoded payload.
- Stores the user object in `localStorage` under `council:localSession`.
- This mode is intentional for local/preview environments only.

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| POST /api/auth | User clicks Google Sign-In | `/api/auth` | None (credential in body) |
| GET /api/profile | After sign-in completes | `/api/profile` | Session cookie |

---

## Validation

| Field | Rule | Error |
|---|---|---|
| `credential` | Must be present | 400 `missing credential` |
| Token signature | Must verify against JWKS | 401 `invalid_token` |
| Token expiry | Must not be expired | 401 `invalid_token` |
| Token audience | Must match `GOOGLE_CLIENT_ID` | 401 `invalid_token` |

---

## Error Cases

| Scenario | Behavior |
|---|---|
| `GOOGLE_CLIENT_ID` missing | 503; client falls back to local JWT decode |
| Token expired / tampered | 401; sign-in fails with error message |
| Network failure | Retry prompt or offline fallback |
| Popup blocked | Google GSI falls back to redirect |
| KV write fails | 500; sign-in fails, user sees error toast |
| User previously deleted account | New profile created on KV |

---

## Edge Cases

- **StrictMode double effect:** `GoogleSignIn` injects a `<script>` tag in a `useEffect`; in React StrictMode (dev), effects run twice. No deduplication guard exists — two `<script>` tags may be added to `<head>`. Low impact (browser deduplicates same-src scripts) but should be fixed for cleanliness.
- **Tab refresh:** On page load, `App.jsx` calls `getProfile()` which validates the existing session cookie. No re-authentication needed within the 30-day window.
- **Multiple accounts:** GSI shows account picker if multiple Google accounts are signed in.
- **Sign-in while debate is in progress:** Profile state is updated; the active debate result is not affected.

---

## Session Persistence

- Session cookie: `council_session`, 30 days, HttpOnly, Secure, SameSite=Lax.
- On every page load: `GET /api/profile` validates the session. If the cookie is valid, the user is silently signed in. If expired or tampered, profile is cleared.

---

## Sign-Out

**File:** `api/auth.js` → DELETE handler

- Client calls `DELETE /api/auth`.
- Server clears the cookie: `Set-Cookie: council_session=; Max-Age=0`.
- Client clears `user` state.
- Optionally clears `localStorage` session fallback.

---

## Future Improvements

- Add rate limiting to `/api/auth` (10 req/min/IP) — see SECURITY.md.
- Add deduplication guard for GSI script injection.
- Add explicit error toast for auth failures.
- Support additional OAuth providers (Apple, GitHub).
- Migrate debate history from localStorage to server on first sign-in.

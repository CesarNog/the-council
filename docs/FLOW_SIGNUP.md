# Flow: Sign-Up / Onboarding — The Council

_Last updated: July 2026_

---

## Purpose

Introduce new users to The Council and collect optional context (name, situation, values) before their first debate. Sign-up is implicit: accounts are created automatically on first Google Sign-In.

---

## Screens / Steps

### Step 1 — Landing

**Component:** `Landing` in `src/components.jsx`

- User arrives at the root URL.
- Sees the headline, a brief description, and example questions.
- No account required to start — the question input is immediately available.
- "Entrar com Google" button is visible in the top-right for optional sign-in.

### Step 2 — Onboarding (Optional)

**Component:** `Onboarding` in `src/components.jsx`

- Triggered when the user clicks "Antes do Conselho falar…" or a contextual CTA.
- Collects:
  - **Name** — displayed to the LLM to personalize responses.
  - **Situation** — professional/personal context (e.g. "PM, 31, restless").
  - **Values** — up to 3 values (e.g. Freedom, Ambition, Security).
- All fields are optional. User can skip directly to asking a question.
- Data is stored in component state and passed as `profile` in the council request.

### Step 3 — First Question

- User types a question.
- Optionally selects `decisionContext` (category, emotional weight, main fear).
- Submits the form.

### Step 4 — Implicit Account Creation (if signed in via Google)

- If the user signs in with Google (see FLOW_GOOGLE_AUTH.md) before or during their session:
  - `POST /api/auth` creates a user profile in KV on first sign-in.
  - No separate "create account" step.
  - Profile is pre-populated with name, email, and Google picture from the ID token.

### Step 5 — Anonymous Persistence

- If the user does not sign in:
  - Debate history stored in `localStorage` under `council:history` (max 10 entries).
  - Onboarding data (name, situation, values) stored in `localStorage`.
  - No server-side profile created.

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| POST /api/auth | First Google sign-in | `/api/auth` | None (credential in body) |
| POST /api/council | First question submitted | `/api/council` | None |

---

## Validation

| Field | Rule |
|---|---|
| `name` | Optional; displayed as-is to LLM; no max enforced client-side |
| `situation` | Optional; passed to LLM; truncated server-side to 200 chars |
| `values` | Optional; max 3 items; each a string |

---

## Error Cases

| Scenario | Behavior |
|---|---|
| Google Sign-In fails | Error shown; user can continue anonymously |
| Backend not configured | 503; local JWT fallback used |
| User skips onboarding | No defaults; LLM uses anonymous context |

---

## Edge Cases

- **First visit with no localStorage:** Onboarding data is empty; clean start.
- **Browser cookies disabled:** Server-issued session cookie is not stored; user is effectively anonymous on every page load. Debate history and onboarding data in `localStorage` still persist normally.
- **Returning anonymous user:** `localStorage` data is read and pre-fills onboarding on next visit.
- **Sign-in after using the app:** Profile merges Google identity with any locally stored preferences.

---

## Future Improvements

- Guided onboarding wizard (multi-step modal) for new users.
- Onboarding completion tracking (analytics event).
- Progressive disclosure: show more context fields after first debate.
- Invite/referral flow for sharing the app.
- Email sign-in as fallback for users without Google accounts.

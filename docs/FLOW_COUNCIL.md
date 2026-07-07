# Flow: Council Generation — The Council

_Last updated: July 2026_

---

## Purpose

The core product flow: user submits a question, the Council (9 AI personas) debates it, and returns a structured result with turns, votes, verdict, quote, realities, and memory echo.

---

## Screens / Steps

### Step 1 — Landing / Question Entry

**Component:** `Landing` in `src/components.jsx`

- User sees the main headline and a text input.
- Optionally selects from quick question suggestions (`QUICK_QUESTIONS_I18N`).
- Optionally fills onboarding profile (name, situation, values) via `Onboarding` component.
- Optionally selects `decisionContext` (category, emotional weight, main fear).

### Step 2 — Form Submission

**Component:** `Landing` → submit handler

- Client calls `summonCouncil(payload)` from `src/lib/api.js`.
- Shows loading spinner / chamber animation while waiting.
- Payload includes: `question`, `profile`, `language`, `decisionContext`.

### Step 3 — API Call (`POST /api/council`)

**File:** `api/council.js`

1. Validates `question` (required, max 400 chars).
2. Rate-limits by IP (3 req/60s via KV counter `rl:<ip>`).
3. Builds the LLM prompt via `buildPrompt()` in `api/council.js`.
4. Calls Groq (`openai/gpt-oss-120b`, `reasoning_effort: "low"`, `max_tokens: 2300`).
5. Parses the JSON response (turns, votes, verdict, quote, question, realities, memoryEcho, mood).
6. Generates a UUID `id`.
7. Persists the result to KV (`result:<id>`).
8. Returns `{ id, mood, turns, votes, verdict, quote, question, realities, memoryEcho, asked }`.

**HARD CONSTRAINT:** Never change `max_tokens: 2300` or `reasoning_effort: "low"` without measuring actual token usage against Groq first.

### Step 4 — Result Display

**Component:** `Chamber` in `src/components.jsx`

- Renders the debate turns with persona icons, colors, and names.
- Renders the vote tally.
- Renders the verdict, closing quote, follow-up question.
- Renders alternate realities ("Em outra vida").
- Renders the share bar.

### Step 5 — Persistence

- If the user is signed in, the debate is appended to their history via `PATCH /api/profile` with `recordDebate`.
- If the user is anonymous, the result is stored in `localStorage` under `council:history`.

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| POST /api/council | User submits question | `/api/council` | None |
| PATCH /api/profile | Signed-in user gets result | `/api/profile` | Session cookie |

---

## Payload Structure

```json
{
  "question": "Should I quit my job and start something of my own?",
  "profile": {
    "name": "Alex",
    "situation": "Product manager, 31, restless",
    "values": ["Freedom", "Ambition"]
  },
  "language": "pt",
  "decisionContext": {
    "decisionCategory": "career",
    "emotionalWeight": "heavy",
    "mainFear": "Failing"
  }
}
```

---

## Response Structure

```json
{
  "id": "abc123",
  "mood": "tense",
  "turns": [
    { "p": "founder", "t": "Speed is a moat. Every week you wait, someone else is building." }
  ],
  "votes": [
    { "p": "founder", "v": "yes", "r": "Speed wins." }
  ],
  "verdict": "The Council sees both courage and risk in this leap...",
  "quote": "You already know. You're just afraid.",
  "question": "What exactly are you protecting by staying?",
  "realities": [
    { "label": "The Leap", "line": "In a year you're bootstrapping, anxious but alive." }
  ],
  "memoryEcho": null,
  "asked": "Should I quit my job and start something of my own?"
}
```

---

## Validation

| Field | Rule | Error |
|---|---|---|
| `question` | Required | 400 `question required` |
| `question` | Max 400 chars | 400 `question too long` |
| IP rate limit | Max 3 req/60s | 429 `rate_limited` + `retryAfter` seconds |

---

## Error Cases

| Scenario | HTTP | Response | UI Behavior |
|---|---|---|---|
| Question missing | 400 | `{ "error": "question required" }` | Inline validation message |
| Question too long | 400 | `{ "error": "question too long" }` | Inline validation message |
| Rate limited | 429 | `{ "error": "rate_limited", "retryAfter": 42 }` | Toast with retry countdown |
| Groq unavailable | 500 | `{ "error": "council_unavailable" }` | Error screen with retry |
| Groq not configured | 503 | `{ "error": "groq_not_configured" }` | Error screen |
| Network failure | N/A | N/A | Offline fallback debate (`FALLBACK_DEBATE` in `src/lib/api.js`) |

---

## Offline Fallback

If `summonCouncil()` fails (any network error), the client falls back to `FALLBACK_DEBATE` — a hardcoded complete debate response that demonstrates the product without a backend. The fallback result does not have an `id` and is not persisted.

---

## Edge Cases

- **Concurrent requests:** Rate limit is best-effort (KV is eventually consistent). Under high concurrency, slightly more than 3 req/min may get through.
- **Empty Groq response:** If `reasoning_effort: "low"` is accidentally removed, the reasoning model can consume all `max_tokens` before generating content. Guard: check `choices[0].finish_reason !== "length"`.
- **JSON parse failure:** If Groq returns malformed JSON, the request fails with 500.
- **Question with special chars:** Passed through as-is. JSX rendering escapes HTML; no XSS risk.
- **Very short question ("ok"):** Produces a valid but shallow debate — no server-side minimum length enforced.
- **Language mismatch:** Personas respond in the requested language. If language is unsupported, defaults to `en`.

---

## Persona System

9 personas, each with a distinct voice fingerprint:

| Code | Persona | Mood |
|---|---|---|
| `founder` | The Founder | aggressive, fast, decisive |
| `shadow` | The Shadow | provocative, interrupts, tests |
| `monk` | The Monk | slow, reflective, spiritual |
| `stoic` | The Stoic | calm, logical, cost-focused |
| `oracle` | The Oracle | mysterious, long-term, pattern-seeing |
| `rebel` | The Rebel | contrarian, anti-establishment |
| `guardian` | The Guardian | protective, risk-averse |
| `strategist` | The Strategist | systematic, probabilistic |
| `dreamer` | The Dreamer | idealistic, emotional, expansive |

Pacing, intensity, and mood palette are defined in `src/lib/personas.js`. Adding a persona requires updating `PERSONAS`, `INTENSITY`, and `PACE` — `personas.test.js` enforces this.

---

## Eclipse (Unanimous Vote)

When all 9 personas vote the same direction, the result is an "eclipse" — a rare event with special UI treatment. Detected in `src/lib/share.js` → `isEclipse()`. Shown with special styling in the Chamber.

---

## Token Budget

- Model: `openai/gpt-oss-120b`
- `reasoning_effort: "low"` — REQUIRED for this reasoning model
- `max_tokens: 2300` — do not change without measuring
- Groq free tier: 8000 TPM shared across all users

---

## Future Improvements

- Add minimum question length validation (e.g. 10 chars).
- Stream Groq response for progressive rendering.
- Add per-user rate limiting for signed-in users (separate from IP limit).
- Add question category auto-detection.
- Cache identical questions (hash-based KV dedup) for quota efficiency.
- Add `decisionContext` auto-population from question text via a lightweight classifier.

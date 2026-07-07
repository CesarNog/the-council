# API Reference — The Council

All API routes are Vercel Serverless Functions under `api/`. They run on the Node.js runtime.

Base URL (production): `https://the-council-murex.vercel.app`

---

## POST /api/council

Generate a debate for a given question.

### Authentication
None required. Rate-limited by IP.

### Rate limit
3 requests per 60 seconds per IP. Exceeding returns `429`.

### Request body (JSON)
```json
{
  "question": "Should I quit my job and start something of my own?",
  "profile": {
    "name": "Alex",
    "situation": "Product manager, 31, restless",
    "values": ["Freedom", "Ambition"]
  },
  "language": "en",
  "decisionContext": {
    "decisionCategory": "career",
    "emotionalWeight": "heavy",
    "mainFear": "Failing"
  }
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `question` | string | Yes | Max 500 chars |
| `profile.name` | string | No | Displayed to LLM |
| `profile.situation` | string | No | Context for LLM |
| `profile.values` | string[] | No | Up to 3 items |
| `language` | string | No | `en`, `pt`, `es`, `zh`. Defaults to `en` |
| `decisionContext` | object | No | Each field sliced to 60–200 chars |

### Response 200
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

### Error responses
| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "invalid question" }` | Missing, empty, or question > 500 chars |
| 429 | `{ "error": "rate_limited", "retryAfter": 42 }` | IP rate limit hit |
| 500 | `{ "error": "council_unavailable" }` | Groq call failed |
| 503 | `{ "error": "groq_not_configured" }` | `GROQ_API_KEY` not set |

---

## GET /api/result

Fetch a persisted debate result by ID.

### Authentication
None required.

### Query parameters
| Param | Type | Required |
|---|---|---|
| `id` | string | Yes |

### Response 200
Same shape as `/api/council` response, with `id` included at the top level of the returned object.

### Error responses
| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "invalid id" }` | Missing or invalid `id` param |
| 404 | `{ "error": "not_found" }` | ID not in KV |
| 502 | `{ "error": "store_unavailable" }` | Cloudflare KV unreachable |

---

## POST /api/auth

Sign in with a Google ID token. Issues a session cookie on success.

### Authentication
None (this is the sign-in endpoint).

### Request body (JSON)
```json
{ "credential": "<Google ID token>" }
```

### Response 200
User profile object:
```json
{
  "sub": "1234567890",
  "email": "user@example.com",
  "name": "Alex",
  "googlePicture": "https://lh3.googleusercontent.com/...",
  "customPicture": null,
  "situation": "",
  "values": [],
  "lastVisit": null,
  "lifeMode": null,
  "debateHistory": [],
  "eclipses": [],
  "createdAt": 1720000000000
}
```

Sets `Set-Cookie: council_session=<signed-token>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`

### Error responses
| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "missing credential" }` | No credential in body |
| 401 | `{ "error": "invalid_token" }` | Token fails JWKS verification |
| 503 | `{ "error": "auth_not_configured" }` | `GOOGLE_CLIENT_ID` not set |

---

## DELETE /api/auth

Sign out. Clears the session cookie.

### Authentication
None required (but session cookie is cleared regardless).

### Response 204
Empty body. Cookie cleared via `Set-Cookie: council_session=; Max-Age=0`.

---

## GET /api/profile

Get the signed-in user's profile. May trigger Life Mode generation if 12+ hours since last visit.

### Authentication
Requires `council_session` cookie.

### Response 200
Same shape as `POST /api/auth` response, with `lifeMode` potentially populated:
```json
{
  "lifeMode": {
    "persona": "monk",
    "teaser": "Something's been on my mind about you.",
    "turns": [{ "p": "monk", "t": "..." }],
    "generatedAt": 1720000000000
  }
}
```

### Error responses
| Status | Body | Cause |
|---|---|---|
| 401 | `{ "error": "not_authenticated" }` | No valid session cookie |

---

## PATCH /api/profile

Update the signed-in user's profile.

### Authentication
Requires `council_session` cookie.

### Request body (JSON) — all fields optional
```json
{
  "situation": "Product manager, 31, now less restless",
  "values": ["Freedom", "Love"],
  "picture": "data:image/jpeg;base64,...",
  "dismissLifeMode": true,
  "recordDebate": {
    "id": "abc123",
    "question": "Should I quit?",
    "verdict": "yes",
    "unanimousVote": false
  }
}
```

| Field | Type | Constraints |
|---|---|---|
| `situation` | string | Max 200 chars |
| `values` | string[] | Max 3 items, each a string |
| `picture` | string | Max 300,000 bytes (data URI) |
| `dismissLifeMode` | boolean | Clears `lifeMode` from profile |
| `recordDebate` | object | Appends to `debateHistory` (max 10 entries) |

### Response 200
Updated user profile object (same shape as GET /api/profile).

### Error responses
| Status | Body | Cause |
|---|---|---|
| 400 | `{ "error": "invalid situation" }` | Situation > 200 chars or wrong type |
| 400 | `{ "error": "invalid values" }` | Values > 3 items or wrong type |
| 400 | `{ "error": "picture too large" }` | Picture > 300,000 bytes |
| 401 | `{ "error": "not_authenticated" }` | No valid session cookie |

---

## GET /api/share-page

Server-rendered HTML for link unfurling (OG tags). Served at `/r/:id` via Vercel rewrite.

### Query parameters
| Param | Type |
|---|---|
| `id` | string |

### Response 200
Full HTML page with OG/Twitter meta tags. Not a JSON API.

---

## GET /api/decision-page

Server-rendered HTML for SEO decision pages. Served at `/decisions/:slug` via Vercel rewrite.

### Query parameters
| Param | Type |
|---|---|
| `slug` | string |

### Response 200
Full HTML page with structured data and decision-specific content.

---

## POST /api/tts

Text-to-speech synthesis via Gemini.

### Authentication
None required.

### Request body (JSON)
```json
{ "text": "You already know. You're just afraid.", "lang": "en" }
```

### Response 200
`audio/mpeg` binary stream.

### Error responses
| Status | Cause |
|---|---|
| 503 | `GEMINI_TTS_API_KEY` not configured |
| 500 | Gemini API error |

---

## Internal Helpers (not routes)

| File | Purpose |
|---|---|
| `api/_kv.js` | Cloudflare KV REST wrapper: `kvGet(key)`, `kvPut(key, value, ttlSeconds?)` |
| `api/_groq.js` | Groq chat completions wrapper: `callGroq(prompt, opts)`, `GroqError` class |
| `api/_session.js` | HMAC session cookie: `makeSessionCookie(sub)`, `clearSessionCookie()`, `verifySessionToken(token)`, `getSessionFromRequest(req)` |

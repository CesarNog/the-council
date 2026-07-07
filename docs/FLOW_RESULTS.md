# Flow: Results / Chamber — The Council

_Last updated: July 2026_

---

## Purpose

Display the Council's debate in a structured, cinematic way. The Chamber is the core product experience: 9 personas argue, vote, and deliver a verdict on the user's question.

---

## Screens / Sections

### Section I — A Questão (The Question)

- Displays the user's question prominently.
- Shows the session `mood` badge (tense / contemplative / divided / resolute / electric).
- Shows the question as the emotional center of the page.

### Section II — O Debate (The Debate)

**Component:** debate turns renderer

- Renders each `turn` as a card: persona icon, persona name, turn text.
- Each card shows:
  - Persona avatar with color glow
  - Persona name (localized via `PERSONA_NAMES[lang]`)
  - Turn text
  - Persona tag/archetype label
- Active speaker highlighted during scroll (proposed; see AUDIT.md improvements).
- Long answers expandable/collapsible.

### Section III — A Votação (The Votes)

**Component:** vote tally renderer

- Renders the `votes` array: persona, vote direction (yes/no/abstain), reason.
- Shows visual tally with yes/no/abstain counts.
- Eclipse detection: if all 9 vote the same → special eclipse UI.

### Section IV — O Veredito (The Verdict)

**Component:** verdict renderer

- Renders the `verdict` paragraph.
- Renders the closing `quote`.
- Renders the follow-up `question` (a challenge posed back to the user).
- Strong visual treatment — this is the emotional payoff.

### Section V — Em Outra Vida (Alternate Realities)

**Component:** realities renderer

- Renders 2–3 `realities` objects: label + cinematic line.
- Each reality imagines a different path and its consequence.

### Section VI — Compartilhar (Share)

**Component:** `ShareBar` in `src/components.jsx`

- Share to WhatsApp, X, LinkedIn, Facebook.
- Copy link (generates `/r/:id` URL).
- Copy text (verdict + quote).
- Download share card (PNG via canvas in `src/lib/share.js`).

---

## API Calls

| Call | Trigger | Endpoint | Auth |
|---|---|---|---|
| POST /api/council | Before Chamber mounts | `/api/council` | None |
| GET /api/result | When loading `/r/:id` | `/api/result?id=` | None |
| PATCH /api/profile | After result received (signed-in) | `/api/profile` | Session cookie |

---

## State Machine

```
landing → [loading] → chamber (with result data)
    ↑__________________________|  (resetAll / "Nova pergunta")
```

---

## Share URLs

Results are persisted to KV (`result:<id>`). Sharing generates a URL `/r/:id` which:
1. On Vercel, is rewritten to `index.html` (SPA).
2. The SPA reads `id` from the URL, calls `GET /api/result?id=`.
3. Renders the Chamber with the fetched result.
4. OG/Twitter meta tags are served by `GET /api/share-page?id=` for link unfurling.

---

## Error Cases

| Scenario | Behavior |
|---|---|
| Shared result not found | 404 from `/api/result`; empty state with "não encontrado" |
| KV unreachable | 500 from `/api/result`; retry prompt |
| Result ID malformed | No further validation; KV returns 404 naturally |
| Network loss while reading | Offline state shown; retry button |

---

## Localization

All UI strings use `t(lang, key)` from `src/lib/i18n.js`. Persona names are localized via `PERSONA_NAMES[lang]`. The debate `turns` text is in the requested language (from the Groq response).

---

## Share Card Generation

**File:** `src/lib/share.js` → `downloadShareCard(result, lang)`

- Uses `canvas` API to render a PNG card with verdict, quote, and The Council branding.
- Canvas is created off-screen, drawn, and converted to a data URL for download.
- This is the only file in `src/lib/` that touches DOM APIs.

---

## Keyboard Navigation

- Tab order follows visual order of sections.
- Share buttons are keyboard-accessible.
- No trap focus issues (no modals in Chamber).

---

## Future Improvements

- Streaming render: show turns as they arrive from Groq.
- Active speaker ring animation (IntersectionObserver on debate cards).
- Scroll progress indicator showing current chapter.
- Expandable/collapsible long debate turns on mobile.
- Horizontal scroll for alternate realities on mobile.
- `aria-live` region for loading state.
- Feedback confirmation toasts ("Link copiado", "Card salvo").

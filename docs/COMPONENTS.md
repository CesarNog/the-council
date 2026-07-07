# Component Reference — The Council

_Last updated: July 2026_

All UI components live in one of five files. The codebase deliberately avoids fragmentation — don't split into more files without strong justification.

---

## `src/components.jsx`

Main UI file. Contains all core product components.

### `CouncilRing`

The animated ring of 9 persona icons arranged in a circle.

**Props:** `personas`, `activeSpeaker?`, `mood?`

- Renders 9 persona avatar icons evenly spaced around a circle.
- Active speaker gets a colored glow (persona color from `src/lib/personas.js`).
- Idle animation: subtle breathing scale.
- Reduced-motion: no animation.
- Used in: Chamber, Landing (preview).

### `Landing`

The home screen / question entry.

**Props:** `onSubmit(question, profile, lang, decisionContext)`, `lang`, `user?`

- Headline, subheadline, question input.
- Quick question suggestions (localized via `QUICK_QUESTIONS_I18N`).
- Optional onboarding trigger (name, situation, values).
- Google Sign-In button (top-right).
- Example questions as clickable chips.

### `Onboarding`

Multi-step form collecting user context before the first debate.

**Props:** `onComplete(profile)`, `lang`

- Fields: name, situation (textarea), values (tag input, max 3).
- All optional — user can skip.
- Transitions between steps with fade animations.
- Mobile: full-screen with large touch targets.

### `Chamber`

The result display — the core product experience.

**Props:** `result`, `lang`, `user?`, `onReset()`

Contains:
- **Section I — A Questão:** Question display with mood badge.
- **Section II — O Debate:** Turn-by-turn debate transcript.
- **Section III — A Votação:** Vote tally with persona cards.
- **Section IV — O Veredito:** Verdict, quote, follow-up question.
- **Section V — Em Outra Vida:** Alternate realities.
- **Section VI — Compartilhar:** Share actions.

### `DebateTurn`

A single persona turn in the debate.

**Props:** `turn`, `lang`, `isActive?`

- Persona avatar, name (localized), archetype tag.
- Turn text with good line-height and spacing.
- Active state: stronger border, glow, deeper background.
- Long text: expandable/collapsible (planned).

### `VoteCard`

A single persona vote.

**Props:** `vote`, `lang`

- Persona name, vote direction (yes/no/abstain), reason text.
- Color-coded border by vote direction.

### `VoteTally`

Summary of all votes.

**Props:** `votes`, `lang`

- Yes/No/Abstain counts with visual bars.
- Eclipse detection display (all 9 voting the same).

### `VerdictSection`

The emotional payoff of the debate.

**Props:** `verdict`, `quote`, `question`, `lang`

- Large serif verdict paragraph.
- Closing quote in gold color.
- Follow-up question posed to the user.

### `RealitiesSection`

Alternate timeline cards.

**Props:** `realities`, `lang`

- 2–3 cards each with a label and cinematic sentence.
- Mobile: horizontal scroll or compact stacked.

### `ShareBar`

Share and export actions.

**Props:** `result`, `lang`

- WhatsApp, X, LinkedIn, Facebook share links.
- Copy link, copy text, download share card.
- Feedback states: "Link copiado", "Texto copiado", "Card salvo".

### `ErrorBoundary`

React error boundary.

**Props:** `children`, `fallback?`

- Catches render errors and shows a friendly error screen.
- Retry button that reloads the page.

### `LoadingSpinner` / `CouncilLoading`

Loading state during debate generation.

- Animated Council ring or spinner.
- Chamber animation while awaiting Groq response.
- `aria-live` region (planned — see AUDIT.md).

---

## `src/auth-ui.jsx`

Authentication and profile UI.

### `GoogleSignIn`

Google Identity Services sign-in button.

**Props:** `onCredential(credential)`, `lang`

- Injects the GSI script tag into `<head>` on mount.
- Initializes `window.google.accounts.id` with the client ID and callback.
- Renders the Google Sign-In button div.
- **Known issue:** No deduplication guard for StrictMode double-effect. See AUDIT.md.

### `ProfileSettings`

Full profile dashboard.

**Props:** `user`, `onUpdate(updatedUser)`, `onSignOut()`, `lang`

- 3-column layout: nav (190px) | main (1fr) | sidebar (210px).
- Mobile: horizontal tab strip + single column.
- Active tab: Profile (others: coming soon).
- Left nav items: Profile, History, Settings, Notifications, Privacy, Billing, Help.

### Profile sub-components (internal to `ProfileSettings`)

| Component | Purpose |
|---|---|
| `ProfileAvatar` | 88px avatar with change photo action |
| `SituationField` | Textarea with 140-char counter |
| `ValuesField` | Tag input with max-3 enforcement |
| `ProgressRing` | SVG completion ring (r=34, animated) |
| `ProfileStats` | Right sidebar: debate count, streak |

---

## `src/life-mode.jsx`

Life Mode proactive check-in UI.

### `LifeModeCard`

**Props:** `lifeMode`, `onDismiss()`, `lang`

- Shows a persona teaser based on the user's situation/values/history.
- Expandable to full debate turns.
- Dismiss button triggers `PATCH /api/profile { dismissLifeMode: true }`.

---

## `src/language-selector.jsx`

### `LanguageSelector`

**Props:** `lang`, `onChange(lang)`, `className?`

- Dropdown or button group showing available languages.
- Available: en, pt, es, zh.
- Selection persisted to `localStorage` under `council:lang`.

---

## `src/consent-ui.jsx`

### `ConsentBanner`

**Props:** `onAccept(consent)`, `onDecline()`, `lang`

- Cookie/analytics consent banner.
- Shown on first visit.
- Persisted to `localStorage` under `council:consent`.

### `CookieSettings`

**Props:** `consent`, `onChange(consent)`, `lang`

- Granular consent toggles (analytics, ads).
- Accessible from footer.

---

## Design Tokens (from `src/styles.css`)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0A12` | App background |
| `--surface` | `#13111E` | Card/panel backgrounds |
| `--gold` | `#C9A96E` | Accent, CTA, highlights |
| `--text` | `#E8E0D0` | Primary text |
| `--muted` | `#7A7690` | Secondary text |
| `--serif` | `'Fraunces'` | Headlines, verdict, quotes |
| `--sans` | `'Inter'` | Body text, UI |
| `--mono` | `'JetBrains Mono'` | Persona tags, codes |

See `docs/DESIGN_SYSTEM.md` for full design system documentation.

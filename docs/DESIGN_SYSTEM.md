# Design System — The Council

_Last updated: July 2026_

The Council's visual identity is cinematic, dark, and premium. It should feel like a ritual, not a web app.

---

## Typography

### Typefaces

| Role | Font | Weight | Source |
|---|---|---|---|
| Headlines, verdict, quotes | Fraunces | 400, 700 | Google Fonts |
| Body text, UI | Inter | 400, 500, 600 | Google Fonts |
| Persona tags, codes | JetBrains Mono | 400 | Google Fonts |

### Scale

| Label | Size | Line Height | Usage |
|---|---|---|---|
| Display | 3rem–4rem | 1.1 | Hero headline |
| Headline | 2rem | 1.2 | Section titles |
| Title | 1.375rem | 1.3 | Card titles |
| Body | 1rem | 1.7 | Debate text, descriptions |
| Caption | 0.8125rem | 1.5 | Persona tags, metadata |
| Micro | 0.6875rem | 1.4 | Labels, badges |

### Rules

- Minimum 16px body text on mobile.
- Debate turns: 1.7 line-height for readability.
- Headings in Fraunces (serif); body in Inter (sans).
- Code/tags in JetBrains Mono.
- Avoid tiny labels < 11px.

---

## Color Palette

### Background

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0A12` | App background |
| `--surface` | `#13111E` | Cards, panels |
| `--surface-raised` | `#1A1828` | Elevated cards, modals |
| `--border` | `rgba(255,255,255,0.08)` | Card borders |
| `--border-active` | `rgba(201,169,110,0.4)` | Active card borders |

### Text

| Token | Value | Usage |
|---|---|---|
| `--text` | `#E8E0D0` | Primary text |
| `--muted` | `#7A7690` | Secondary text, placeholders |
| `--subtle` | `#4A465A` | Tertiary text, disabled |

### Accent

| Token | Value | Usage |
|---|---|---|
| `--gold` | `#C9A96E` | Primary accent, CTAs, highlights |
| `--gold-light` | `#E8C98A` | Hover state for gold |
| `--gold-glow` | `rgba(201,169,110,0.15)` | Glow effect |

### Persona Colors

Each persona has a unique color used for their icon glow and card border.

| Persona | Color |
|---|---|
| founder | `#E84855` |
| shadow | `#6B4C8B` |
| monk | `#4A9B8E` |
| stoic | `#7A8B9A` |
| oracle | `#9B7A4A` |
| rebel | `#D4524A` |
| guardian | `#4A7A9B` |
| strategist | `#5A8B6A` |
| dreamer | `#8B6A9B` |

Source of truth: `src/lib/personas.js` → `PERSONAS[p].color`.

### Status Colors

| State | Color | Usage |
|---|---|---|
| Success | `#4A9B6A` | Eclipse, positive votes |
| Warning | `#9B8A4A` | Divided verdict |
| Error | `#9B4A4A` | Error states |
| Info | `#4A6A9B` | Info toasts |

---

## Spacing Scale

| Token | Value |
|---|---|
| `--space-xs` | `0.25rem` (4px) |
| `--space-sm` | `0.5rem` (8px) |
| `--space-md` | `1rem` (16px) |
| `--space-lg` | `1.5rem` (24px) |
| `--space-xl` | `2rem` (32px) |
| `--space-2xl` | `3rem` (48px) |
| `--space-3xl` | `4rem` (64px) |

Section gaps use `--space-2xl` to `--space-3xl` for cinematic chapter rhythm.

---

## Border Radius

| Component | Radius |
|---|---|
| Cards | `0.75rem` (12px) |
| Buttons | `0.5rem` (8px) |
| Tags/badges | `0.25rem` (4px) |
| Avatars | `50%` |
| Inputs | `0.5rem` (8px) |

---

## Elevation / Shadows

| Level | Value | Usage |
|---|---|---|
| 1 (card) | `0 2px 8px rgba(0,0,0,0.3)` | Default cards |
| 2 (raised) | `0 4px 16px rgba(0,0,0,0.4)` | Active cards, dropdowns |
| 3 (modal) | `0 8px 32px rgba(0,0,0,0.6)` | Modals, overlays |
| Glow (gold) | `0 0 20px rgba(201,169,110,0.2)` | CTA focus |
| Glow (persona) | `0 0 16px <persona-color-40%>` | Active speaker |

---

## Motion System

### Principles

- Slow, intentional fades — no bouncy SaaS animation.
- All transitions: `ease-in-out` or `cubic-bezier(0.4, 0, 0.2, 1)`.
- No scale transforms that cause layout shift.
- Respect `prefers-reduced-motion`.

### Durations

| Type | Duration | Usage |
|---|---|---|
| Micro | 150ms | Button hover, toggle |
| Short | 250ms | Fade in/out |
| Medium | 400ms | Panel slide, card reveal |
| Long | 600ms | Page transitions, chamber entry |
| Ambient | Infinite | Ring idle animation |

### Standard Transitions

```css
/* Button hover */
transition: background-color 150ms ease, box-shadow 150ms ease;

/* Card reveal */
transition: opacity 400ms ease, transform 400ms ease;

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

---

## Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| Base | 0 | Normal content |
| Card | 10 | Elevated cards |
| Sticky | 20 | Sticky header/stage |
| Dropdown | 30 | Dropdowns, popovers |
| Modal | 50 | Modals, overlays |
| Toast | 60 | Notifications |
| Max | 9999 | Emergency override |

---

## Persona Ring Layout

The Council Ring arranges 9 personas in a circle.

- Circle radius: 100px (desktop), 80px (mobile).
- Each icon: 44px × 44px (minimum touch target).
- Spacing calculated as `360° / 9 = 40°` per persona.
- Active speaker: glow ring with persona color, scale 1.1.
- Idle animation: subtle breathing (scale 1.0 → 1.02, 3s loop).

---

## Chapter Rhythm

Sections of the Chamber are marked as chapters:

```
I · A QUESTÃO
II · O DEBATE
III · A VOTAÇÃO
IV · O VEREDITO
V · EM OUTRA VIDA
VI · COMPARTILHAR
```

Each chapter separator uses:
- Small roman numeral in JetBrains Mono (`--muted` color)
- Thin gold divider line
- `--space-3xl` margin above

---

## Accessibility

- Text contrast: minimum 4.5:1 for body text, 3:1 for large text.
- Focus rings: `outline: 2px solid var(--gold); outline-offset: 2px`.
- All interactive elements: minimum 44×44px touch target.
- No color-only state indicators (always + icon or text).
- `aria-label` on all icon-only buttons.
- `prefers-reduced-motion` respected.

---

## Component States

Every interactive component must have all states designed:

| State | Visual Treatment |
|---|---|
| Default | Base design |
| Hover | Subtle background lightening or border highlight |
| Focus | Gold outline ring |
| Active/Pressed | Scale 0.98 or darker background |
| Disabled | `--subtle` text, `cursor:not-allowed`, no hover |
| Loading | Skeleton or spinner |
| Error | Red border + error text below |
| Success | Checkmark or green flash |

---

## Mobile-Specific Rules

- Body text: minimum 16px.
- Inputs: minimum 44px height (no zoom trigger).
- Touch targets: minimum 44×44px.
- Horizontal scroll: never on the body; only within designated scroll containers.
- Council ring: 80px radius; icons 40px.
- Verdict typography: slightly smaller than desktop.
- Sticky stage: collapses to compact on scroll (Council name + mood + progress bar).

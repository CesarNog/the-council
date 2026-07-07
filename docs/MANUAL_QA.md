# Manual QA Checklist — The Council

_Last updated: July 2026_

Run this checklist before every production release.

---

## Environment

| Check | Result |
|---|---|
| `npm test` passes | |
| `npm run build` passes | |
| Vercel preview deployment accessible | |
| All env vars set in Vercel dashboard | |

---

## Landing Page

| Check | Result |
|---|---|
| Page loads without errors in Chrome | |
| Page loads without errors in Firefox | |
| Page loads without errors in Safari | |
| Page loads without horizontal scroll on 375px | |
| Headline text is readable on mobile | |
| Question input is focused or accessible | |
| Language selector shows correct languages | |
| Google Sign-In button renders | |
| Example questions are clickable | |
| Console shows no errors | |

---

## Question Submission

| Check | Result |
|---|---|
| Empty question shows validation message | |
| Question > 400 chars shows validation message | |
| Valid question shows loading state | |
| Loading state has accessible text | |
| Debate result appears after loading | |
| All 9 persona turns render | |
| Vote tally renders | |
| Verdict renders | |
| Closing quote renders | |
| Follow-up question renders | |
| Alternate realities render | |
| Share bar renders | |

---

## Chamber / Results

| Check | Result |
|---|---|
| All persona names are localized | |
| Long debate turns are readable | |
| Mood badge displays | |
| "Nova pergunta" resets to landing | |
| Back button works (if applicable) | |
| No layout overflow on 375px | |
| No layout overflow on 768px | |

---

## Share

| Check | Result |
|---|---|
| "Copiar link" copies correct URL | |
| "Link copiado" feedback appears | |
| Copied URL opens Chamber with same result | |
| WhatsApp share link opens correctly | |
| X (Twitter) share link opens correctly | |
| Share card downloads as PNG | |
| OG tags visible when URL shared in iMessage/Slack | |

---

## Auth / Profile

| Check | Result |
|---|---|
| "Entrar com Google" button is visible | |
| Sign-in popup opens | |
| After sign-in, avatar appears in header | |
| Profile dashboard opens | |
| Situation field saves | |
| Values field adds up to 3 tags | |
| Values field blocks 4th tag | |
| Save button shows success state | |
| Sign-out clears avatar | |
| Signed-out page shows sign-in button | |
| Session persists across page reload | |

---

## Language

| Check | Result |
|---|---|
| Switch to Português → all text in Portuguese | |
| Switch to Español → all text in Spanish | |
| Switch to 中文 → all text in Chinese | |
| Debate turns in selected language | |
| Persona names in selected language | |
| Language persists across page reload | |

---

## Accessibility

| Check | Result |
|---|---|
| Tab navigation reaches all interactive elements | |
| Focus rings visible on all focused elements | |
| Question input has accessible label | |
| Share buttons have aria-labels | |
| Color contrast sufficient for primary text | |
| Color contrast sufficient for muted text | |
| Page works without mouse (keyboard only) | |
| Screen reader announces page title on load | |

---

## Error States

| Check | Result |
|---|---|
| Block network → offline fallback debate shown | |
| Rate limit (4th request in 60s) → 429 toast | |
| Invalid share URL `/r/doesnotexist` → empty/error state | |

---

## Performance

| Check | Result |
|---|---|
| Lighthouse Performance ≥ 90 (target: 95) | |
| Lighthouse Accessibility = 100 | |
| Lighthouse Best Practices = 100 | |
| Lighthouse SEO = 100 | |
| No layout shifts on load | |
| No horizontal scroll at any breakpoint | |

---

## Mobile (375px iPhone SE)

| Check | Result |
|---|---|
| Landing fits without horizontal scroll | |
| Question input keyboard doesn't zoom page | |
| Chamber sections readable | |
| Vote cards readable | |
| Share bar buttons have sufficient tap target size | |
| Profile dashboard accessible (horizontal nav) | |

---

## Sign-Off

| Item | Status |
|---|---|
| QA tester | |
| Date | |
| Environments tested | |
| Known issues accepted | |

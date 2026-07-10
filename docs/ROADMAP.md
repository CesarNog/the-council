# Roadmap — The Council

_Last updated: July 2026_

---

## Vision

The Council is a premium AI deliberation product. The long-term goal is a platform where anyone can bring their toughest decisions and receive a structured, emotionally resonant, AI-powered debate — as a ritual, not a chat.

---

## Now (Q3 2026) — Stabilization

### Security
- [x] Add Content-Security-Policy header
- [x] Rate limit `/api/auth` (10 req/min/IP)
- [x] Guard `SESSION_SECRET` startup check
- [x] Server-side MIME validation for picture upload
- [x] Add KV TTL (30 days) to debate results

### Quality
- [x] Add ESLint with minimal ruleset
- [x] Add Playwright E2E tests (happy path) — auth/onboarding/shared-result/language/mobile/a11y still open, see `docs/TEST_PLAN.md`
- [x] Fix loading state flash during session check
- [x] Fix StaticPage `<pre>` → semantic HTML
- [x] Deduplicate Google GSI script injection

### UX
- [x] `aria-live` region for debate loading
- [x] Feedback toasts for share actions (inline button-label feedback, not a toast component)
- [x] Sticky Council stage on mobile (scroll collapse)
- [x] Active speaker highlighting in ring
- [x] Expandable debate turns on mobile

---

## Next (Q4 2026) — Growth

### Features
- [x] Voice input for question (wired to `/api/tts`)
- [x] Debate history tab in profile — linked to saved verdicts via `/r/:id`
- [x] Debate export (JSON)
- [ ] Debate export (PDF)
- [x] Life Mode expanded (daily check-in, all 9 personas)
- [ ] Question categories with smart defaults

### Infrastructure
- [ ] Structured logging (Sentry or Axiom)
- [ ] Admin panel (usage dashboard, debate inspector)
- [ ] Separate KV namespaces for prod/preview environments
- [ ] Groq TPM monitor / alert

### Localization
- [ ] French (fr) language support
- [ ] German (de) language support
- [ ] Japanese (ja) language support

---

## Later (2027) — Monetization

### Billing
- [ ] Stripe integration for Pro tier ($5–9/month)
- [ ] Premium features: custom persona, unlimited history, export, voice
- [ ] Team/group plans

### Platform
- [ ] iOS/Android native app (React Native or PWA)
- [ ] API for third-party integrations
- [ ] Webhook notifications (eclipse events via email/push)

### Database
- [ ] Migrate from Cloudflare KV to D1 or Postgres for relational queries
- [ ] Analytics by question category, language, verdict direction
- [ ] User cohort and retention dashboard

---

## Future Ideas (Backlog)

- Custom persona: let users swap one Council seat with a person they trust.
- Persona packs: domain-specific councils (startup, relationships, health, finance).
- Collaborative debates: two users share the same Council session.
- Recurring questions: schedule a question to be re-asked after 30 days.
- Decision journal: long-form reflection space after a debate.
- Integration with calendars (decide + schedule).
- API access for developers (debate-as-a-service).

---

## Not Planned

- SQL database migration (KV is sufficient at current scale).
- Real-time collaborative editing.
- Self-hosted version.
- Desktop app.

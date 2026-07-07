# Production Checklist — The Council

## Environment variables

### Required (core)
- [ ] `GROQ_API_KEY`
- [ ] `CLOUDFLARE_*` (KV)
- [ ] `SESSION_SECRET`

### Auth
- [ ] `CLERK_SECRET_KEY` + `VITE_CLERK_PUBLISHABLE_KEY` (recommended)
- [ ] OR `GOOGLE_CLIENT_ID` + `VITE_GOOGLE_CLIENT_ID` (legacy)

### Database
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (optional client)

### Rate limiting
- [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Observability
- [ ] `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`
- [ ] `VITE_SENTRY_DSN`

### Email
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

### Payments (future)
- [ ] `STRIPE_*`

### Memory (future)
- [ ] `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`

### Site
- [ ] `VITE_SITE_URL`

---

## Manual tests

- [ ] Landing (320px, 390px, 768px)
- [ ] Onboarding flow
- [ ] Anonymous debate
- [ ] Authenticated debate (Clerk)
- [ ] Rate limit UI (no silent fallback)
- [ ] Public `/r/:id`
- [ ] Share card download (square/story)
- [ ] Privacy / terms / cookies pages + footer
- [ ] Consent banner + cookie settings
- [ ] Sign out
- [ ] `/api/history` when Supabase configured
- [ ] Missing env vars — app still loads

---

## Commands

```bash
npm test        # 208+ tests
npm run build   # must pass
```

---

## Security

- [ ] No secrets in git
- [ ] Service role keys server-only
- [ ] CSP includes Clerk/PostHog if enabled
- [ ] Production auth not using local JWT fallback

---

## PR merge order

1. `cursor/audit-production-upgrade`
2. `cursor/api-security-hardening`
3. `cursor/clerk-auth`
4. `cursor/supabase-database`
5. `cursor/upstash-rate-limiting`
6. `cursor/production-integrations`

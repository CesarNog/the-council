# Release Checklist — The Council

Use this before every production deployment.

---

## Pre-Release

### Code
- [ ] All changes committed and pushed to `main` (or feature branch merged)
- [ ] `npm install` succeeds
- [ ] `npm test` passes (all Vitest tests green)
- [ ] `npm run build` succeeds (no Vite errors)
- [ ] No `console.log` calls in API functions
- [ ] No dead/commented-out code blocks

### Environment
- [ ] All required env vars set in Vercel dashboard (Production)
  - [ ] `GROQ_API_KEY`
  - [ ] `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_KV_NAMESPACE_ID`
  - [ ] `SESSION_SECRET` (32+ byte random hex)
  - [ ] `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`
- [ ] `SESSION_SECRET` is cryptographically random (not guessable)
- [ ] `GOOGLE_CLIENT_ID` has production domain in authorized origins

### Security
- [ ] No secrets in source code or committed `.env` files
- [ ] Vercel security headers present (curl -I and check)
- [ ] Rate limiting functional (3 req/min test)
- [ ] Auth flow tested (sign-in → profile → sign-out)

### Manual QA
- [ ] Manual QA checklist completed (see `docs/MANUAL_QA.md`)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Tested on 375px mobile viewport
- [ ] Tested on 768px tablet viewport
- [ ] Tested on 1440px desktop viewport
- [ ] Offline fallback verified
- [ ] Share URLs work (`/r/:id`)
- [ ] OG tags verified with og-debugger or Twitter Card Validator

### Performance
- [ ] Lighthouse Performance ≥ 90 (target: 95)
- [ ] Lighthouse Accessibility = 100
- [ ] No layout shifts on load

---

## Deploy

1. **Merge to `main`** (or use Vercel CLI: `vercel --prod`)
2. **Monitor Vercel deployment logs** for build errors
3. **Verify production URL** loads correctly
4. **Test one live debate** on production
5. **Test auth flow** on production

---

## Post-Release

- [ ] Verify Groq quota not exceeded (Groq dashboard)
- [ ] Verify KV writes working (create a debate, fetch by ID)
- [ ] Monitor Vercel logs for errors in first 15 minutes
- [ ] Update `docs/CHANGELOG.md` with release notes
- [ ] Tag the release in git: `git tag -a v<version> -m "Release v<version>"`

---

## Rollback

If something breaks:
1. Go to Vercel Dashboard → Deployments.
2. Find the previous successful deployment.
3. Click "Promote to Production".
4. Investigate root cause before re-deploying.

---

## Emergency Contacts

- **Groq quota / LLM issues:** Groq dashboard + billing
- **Cloudflare KV issues:** Cloudflare dashboard status page
- **Vercel issues:** Vercel status page + support
- **Google OAuth issues:** Google Cloud Console

**Security incidents:** See `docs/SECURITY.md` — email cesarnogueira1210@gmail.com.

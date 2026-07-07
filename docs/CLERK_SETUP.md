# Clerk Setup — The Council

Clerk is **optional**. Without env vars, the app falls back to legacy Google Sign-In (GSI).

---

## 1. Create Clerk application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create application → enable **Google** social connection
3. Copy **Publishable key** and **Secret key**

## 2. Environment variables

| Variable | Where | Notes |
|----------|-------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Vercel + `.env.local` | Frontend (not secret) |
| `CLERK_SECRET_KEY` | Vercel only | Server — never expose to client |

Add to `.env.local` for local dev with `vercel dev`.

## 3. Allowed origins

In Clerk Dashboard → **Configure → Domains**, add:

- `http://localhost:3000` (vercel dev default)
- `https://the-council-murex.vercel.app`
- Your custom domain when ready

## 4. How it works

```
User clicks Sign in
  → Clerk modal (Google SSO)
  → ClerkSessionSync calls POST /api/clerk-auth with Bearer token
  → Server verifies JWT via @clerk/backend
  → Profile stored in KV user:clerk:<id>
  → HMAC session cookie issued (same as legacy auth)
```

Display name priority: `firstName` → `fullName` → email prefix.

## 5. Sign out

Clears Council session cookie, Clerk session, and local fallback storage.

## 6. CSP

`vercel.json` includes Clerk domains in CSP. If using a custom Clerk frontend API domain, add it to `script-src`, `connect-src`, and `frame-src`.

## 7. Production checklist

- [ ] `CLERK_SECRET_KEY` set in Vercel (Sensitive)
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` set for Production + Preview
- [ ] Google OAuth enabled in Clerk
- [ ] Production domain whitelisted in Clerk
- [ ] Remove reliance on unverified local JWT fallback in production

---

See also: [`docs/ENVIRONMENT.md`](ENVIRONMENT.md)

# Deployment Guide — The Council

_Last updated: July 2026_

---

## Architecture Overview

```
Browser (React 19 SPA)
  └── Vite 8 build → Vercel CDN (static assets)
  └── /api/* → Vercel Serverless Functions (Node.js)
        └── Groq API (LLM inference)
        └── Cloudflare KV REST API (storage)
        └── Google JWKS (token verification)
```

---

## Prerequisites

- Node.js ≥ 18
- Vercel account with the project connected to this repo
- Cloudflare account with KV namespace created
- Groq API key
- Google Cloud project with OAuth 2.0 client ID

---

## Environment Variables

All secrets are set in the Vercel dashboard under **Settings → Environment Variables**.

| Variable | Required | Notes |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key |
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API token with KV write access |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `CLOUDFLARE_KV_NAMESPACE_ID` | Yes | KV namespace ID for debate/user/rate-limit storage |
| `SESSION_SECRET` | Yes | Random 32+ byte hex string |
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 client ID from Google Cloud Console |
| `GEMINI_TTS_API_KEY` | No | Google Gemini API key for TTS |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Same as GOOGLE_CLIENT_ID; baked into the frontend build |
| `VITE_HOTJAR_ID` | No | Hotjar site ID (non-secret) |
| `VITE_ADSENSE_PUBLISHER_ID` | No | AdSense publisher ID (non-secret) |

See `.env.example` for the full template.

**Generate `SESSION_SECRET`:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Cloudflare KV Setup

1. Go to Cloudflare Dashboard → Workers & Pages → KV.
2. Create a namespace (e.g. `the-council-prod`).
3. Copy the namespace ID to `CLOUDFLARE_KV_NAMESPACE_ID`.
4. Create an API token with "Workers KV Storage:Edit" permissions.
5. Copy to `CLOUDFLARE_API_TOKEN`.
6. Copy your Account ID from the dashboard to `CLOUDFLARE_ACCOUNT_ID`.

---

## Google OAuth Setup

1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add Authorized JavaScript origins: `https://the-council-murex.vercel.app` (and your custom domain if any).
4. Add Authorized redirect URIs if needed.
5. Copy the Client ID to both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.

---

## Deploy to Vercel

### Initial Setup

```bash
npm install -g vercel
vercel login
vercel --prod   # first deploy; follow prompts to link project
```

### Subsequent Deploys

Deploys are automatic on push to `main` (configured in Vercel project settings).

Manual deploy:
```bash
vercel --prod
```

### Preview Deployments

Every branch push creates a preview deployment at a unique URL. Preview deployments share the same KV namespace unless separate namespaces are configured per environment.

---

## Vercel Configuration (`vercel.json`)

Key settings:
- Rewrites: `/r/:id` → `index.html` (SPA), `/decisions/:slug` → `index.html`
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy
- Function config: Node.js runtime for all `api/*.js`

---

## Build

```bash
npm run build   # Vite build → dist/
```

Build output: `dist/` (static assets). Vercel deploys this to CDN.

---

## CI/CD

Vercel handles CI/CD automatically. On every push:
1. Vercel builds the project (`npm run build`).
2. Deploys to CDN if build succeeds.
3. Creates a preview URL for branch pushes.
4. Promotes to production on `main` push.

To add pre-deploy tests:
1. Add a `vercel-build` script to `package.json`: `"vercel-build": "npm test && npm run build"`.
2. Or use GitHub Actions to run tests before allowing merge to `main`.

---

## Rollback

Via Vercel dashboard:
1. Go to Deployments.
2. Find the previous successful deployment.
3. Click "Promote to Production".

---

## Monitoring

- **Logs:** Vercel dashboard → Logs → filter by function.
- **Errors:** `console.error` in API functions appears in Vercel logs.
- **KV health:** Monitor KV usage in Cloudflare dashboard.
- **Groq usage:** Monitor in Groq dashboard; free tier is 8000 TPM shared.

---

## Custom Domain

1. Go to Vercel dashboard → Domains.
2. Add your domain.
3. Follow DNS configuration instructions.
4. Update Google OAuth authorized origins.

---

## Production Checklist

Before going live:
- [ ] All env vars set in Vercel dashboard
- [ ] `SESSION_SECRET` is a cryptographically random 32+ byte value
- [ ] `GOOGLE_CLIENT_ID` matches the OAuth client with correct origins
- [ ] KV namespace created and IDs correct
- [ ] `npm test && npm run build` passes locally
- [ ] Preview deployment tested manually
- [ ] Rate limits tested (3 req/min/IP)
- [ ] Auth flow tested (sign-in, profile, sign-out)
- [ ] Share links tested (`/r/:id`)
- [ ] OG tags checked via og-debugger or Twitter Card Validator
- [ ] Vercel headers verified (`curl -I <url>`)

# Domain + Cloudflare Setup

## 1. Buy domain (Namecheap)

Register apex domain e.g. `thecouncil.app`.

## 2. Cloudflare DNS

1. Add site to Cloudflare
2. Point Namecheap nameservers to Cloudflare
3. SSL/TLS → **Full (strict)**

## 3. Vercel custom domain

1. Vercel Project → Settings → Domains → Add
2. In Cloudflare DNS:
   - `A` / `CNAME` to Vercel as instructed
   - Proxy (orange cloud) optional — Vercel recommends DNS-only for apex in some setups

## 4. Redirects

- Pick canonical: `www` → apex or apex → `www`
- Cloudflare Redirect Rule or Vercel redirect in `vercel.json`

## 5. App config

Set in Vercel:

```
VITE_SITE_URL=https://yourdomain.com
```

Used by `shareUrl()`, OG tags, sitemap.

## 6. Security

- Enable Cloudflare WAF managed rules
- Bot Fight Mode for `/api/council`
- Cache static assets; bypass cache for `/api/*`

## 7. Clerk / Google OAuth

Add production domain to Clerk allowed origins and Google OAuth authorized JavaScript origins.

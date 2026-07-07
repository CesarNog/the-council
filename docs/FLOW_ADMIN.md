# Flow: Admin — The Council

_Last updated: July 2026_

---

## Purpose

Admin capabilities for the operator to monitor usage, inspect debates, manage users, and configure the platform.

---

## Current State

**No admin panel exists.** There is no web UI, no admin API, and no admin role distinction. All admin operations are performed directly via:

- Cloudflare KV dashboard (inspect/delete keys)
- Vercel dashboard (logs, environment variables, deployments)
- Groq dashboard (API usage, quota)
- GitHub repository (code, PRs, CI)

---

## Current Admin Capabilities (Manual)

### Inspect a Debate

Via Cloudflare KV dashboard:
1. Go to Workers & Pages → KV → select namespace.
2. Search for key `result:<id>`.
3. View or delete the stored JSON.

### Inspect a User Profile

Via Cloudflare KV dashboard:
1. Search for key `user:<sub>` (where `sub` is the Google user ID).
2. View or delete the stored profile JSON.

### View Rate Limit Counters

Via Cloudflare KV dashboard:
1. Search for keys prefixed with `rl:`.
2. Delete to manually reset a rate limit for an IP.

### View Logs

Via Vercel dashboard:
1. Go to the project → Logs.
2. Filter by function (`/api/council`, `/api/auth`, etc.).
3. Errors are logged via `console.error`.

### Rotate Secrets

Via Vercel dashboard → Settings → Environment Variables:
- `GROQ_API_KEY` — rotate if compromised; all LLM calls break until updated.
- `SESSION_SECRET` — rotate to invalidate all existing sessions.
- `CLOUDFLARE_API_TOKEN` — rotate if compromised; all KV operations break.

---

## Planned Admin Panel

A future admin panel would include:

| Feature | Priority |
|---|---|
| Usage dashboard (debates/day, users/day) | High |
| Debate inspector (search, view, delete) | High |
| User management (list, ban, delete) | High |
| Rate limit management (reset IP) | Medium |
| KV health check | Medium |
| Groq quota monitor | Medium |
| Abuse reports | Low |
| Error log viewer | Low |

### Access Control

Admin panel would be gated on a hardcoded admin `sub` list or a separate admin role in the user KV profile.

---

## Security Notes

- No admin API routes exist; all admin access requires Cloudflare/Vercel dashboard credentials.
- The operator account has no special in-app privileges — access control is entirely at the Cloudflare/Vercel level.
- All debate and user data is stored in Cloudflare KV under the account associated with `CLOUDFLARE_API_TOKEN`.

---

## Future Improvements

- Build a `/admin` route protected by admin session check.
- Add structured logging to an external service (Sentry, Axiom, Datadog).
- Add webhook or email alert on abuse patterns (IP hitting rate limit repeatedly).
- Add Groq TPM monitor to alert when approaching 8000/min.
- Add user analytics (cohort, retention, debate frequency).

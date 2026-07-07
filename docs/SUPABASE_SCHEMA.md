# Supabase Schema — The Council

Optional production database. Without env vars, app uses Cloudflare KV + localStorage.

---

## Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Copy URL, anon key, service role key to Vercel

## Environment variables

| Variable | Runtime | Notes |
|----------|---------|-------|
| `SUPABASE_URL` | Server | Project URL |
| `SUPABASE_ANON_KEY` | Server (optional) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Never expose to frontend** |
| `VITE_SUPABASE_URL` | Build | Browser client (optional) |
| `VITE_SUPABASE_ANON_KEY` | Build | Browser client (optional) |

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Clerk user mirror, display name, plan |
| `decisions` | User questions + metadata |
| `debates` | Full LLM JSON response |
| `verdicts` | Vote tallies + summary |
| `shares` | Public slug → decision |
| `user_preferences` | Theme, motion, memory opt-in |

## Data flow

```
POST /api/council (success)
  → KV result:{id} (existing)
  → Supabase decisions + debates + verdicts + shares (fire-and-forget)

POST /api/clerk-auth
  → KV user:* (existing)
  → Supabase profiles upsert

GET /api/history (authenticated)
  → Supabase decisions for profile
```

## RLS

RLS enabled on all tables. Server uses **service role** to bypass RLS. Tighten policies when wiring Clerk JWT to Supabase Auth.

## Anonymous users

Decisions can have `user_id = null` + optional `anonymous_session_id` (future). Public shares readable via slug through existing `/api/result` + KV; Supabase mirrors for analytics.

---

See: [`supabase/schema.sql`](../supabase/schema.sql)

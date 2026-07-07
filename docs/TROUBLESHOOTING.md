# Troubleshooting — The Council

_Last updated: July 2026_

---

## Local Development

### `/api/*` routes return 404

**Cause:** Running `npm run dev` (Vite only) instead of `npx vercel dev`.

**Fix:**
```bash
npx vercel dev
```

`npm run dev` only starts the Vite frontend. API routes require the Vercel CLI.

---

### Google Sign-In fails locally

**Cause:** `localhost` not in the Google OAuth authorized origins.

**Fix:**
1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Select your OAuth 2.0 Client ID.
3. Under "Authorized JavaScript origins", add `http://localhost:3000`.
4. Save. May take a few minutes to propagate.

---

### Sign-in works but profile page is empty

**Cause:** `GOOGLE_CLIENT_ID` is set in Vercel env but the backend returns 503, causing the client-side JWT fallback to be used. The local session is stored in `localStorage` without a server profile.

**Fix:**
1. Verify `GOOGLE_CLIENT_ID` matches the Client ID in Google Cloud Console.
2. Verify `CLOUDFLARE_*` vars are correct so KV writes succeed.
3. Check Vercel logs for errors in `api/auth.js`.

---

### Debates always return the fallback debate

**Cause:** `GROQ_API_KEY` not set, or Groq API is rate-limited.

**Fix:**
1. Check that `GROQ_API_KEY` is set in `.env.local`.
2. Check Groq dashboard for usage — free tier is 8000 TPM.
3. Wait 60 seconds and retry.

---

### `npm test` fails with "Cannot find module"

**Cause:** Dependencies not installed.

**Fix:**
```bash
npm install
npm test
```

---

### Vite build fails

**Cause:** Usually a syntax error or missing import.

**Fix:**
1. Run `npm run build` to see the error.
2. Fix the reported file and line.
3. Re-run `npm run build`.

---

## Production (Vercel)

### `/api/council` returns 503

**Cause:** `GROQ_API_KEY` not set in Vercel environment.

**Fix:** Go to Vercel Dashboard → Settings → Environment Variables → add `GROQ_API_KEY`.

---

### `/api/auth` returns 503

**Cause:** `GOOGLE_CLIENT_ID` not set in Vercel environment.

**Fix:** Add `GOOGLE_CLIENT_ID` to Vercel env vars.

**Note:** The app falls back to client-side JWT decode in this case. Sign-in appears to work but profiles are stored in localStorage only.

---

### All KV operations fail (rate limiting broken, results not saved)

**Cause:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, or `CLOUDFLARE_KV_NAMESPACE_ID` not set or incorrect.

**Fix:**
1. Verify the KV namespace ID in Cloudflare Dashboard → Workers & Pages → KV.
2. Verify the API token has "Workers KV Storage:Edit" permissions.
3. Update Vercel env vars and re-deploy.

---

### Sessions not persisting (users signed out on every page load)

**Cause:** `SESSION_SECRET` changed, rotated, or missing.

**Fix:**
1. Ensure `SESSION_SECRET` is set in Vercel env vars.
2. If recently rotated, all sessions are invalidated — users must re-sign-in.
3. If missing, the server refuses to start — check Vercel function logs for a startup error.

---

### Rate limit not working (users can make unlimited requests)

**Cause:** Cloudflare KV is down or API token lacks write permissions.

**Behavior:** The app degrades gracefully — debates are still generated but rate limiting is disabled.

**Fix:** Check KV connectivity (Cloudflare dashboard → KV → namespace → verify recent writes).

---

### OG / share card shows wrong content

**Cause:** `/api/share-page` is returning cached or incorrect data.

**Fix:**
1. Check that the debate `id` is valid via `GET /api/result?id=<id>`.
2. If the result is correct, the issue may be with Twitter/Facebook's cache — use their respective cache-clearing tools.
3. Check the share-page HTML via `curl https://the-council-murex.vercel.app/api/share-page?id=<id>`.

---

### Groq returns empty content (`finish_reason: "length"`)

**Cause:** `reasoning_effort: "low"` was accidentally removed or `max_tokens` was increased beyond what Groq can return before hitting the limit.

**Fix:**
1. Verify `reasoning_effort: "low"` is set in `api/council.js`.
2. Verify `max_tokens: 2300` is unchanged.
3. Do NOT increase `max_tokens` without measuring actual token usage.

---

## Build / CI

### Build fails in Vercel but passes locally

**Cause:** Missing env var, or a dependency that works in Node 18 locally but not in Vercel's runtime.

**Fix:**
1. Check Vercel build logs for the specific error.
2. Ensure all env vars are set for the "Production" environment in Vercel.
3. Verify `node` version compatibility (`engines` field in `package.json`).

---

## Debugging Tips

### Check Vercel function logs

```bash
vercel logs --since=5m
```

Or via the Vercel dashboard → Deployments → Functions → select function → Logs.

### Inspect KV data

Via Cloudflare dashboard → Workers & Pages → KV → select namespace → search for key.

### Test an API route directly

```bash
curl -X POST https://the-council-murex.vercel.app/api/council \
  -H "Content-Type: application/json" \
  -d '{"question": "Should I test this?"}' \
  -v
```

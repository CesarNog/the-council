import { kvGet, kvPut } from "./_kv.js";
import { checkUpstashLimit, councilTier, isUpstashConfigured } from "./_upstash.js";

/**
 * Best-effort IP rate limit via Cloudflare KV (eventually consistent).
 * Used when Upstash is not configured.
 */
export async function checkRateLimit(keyPrefix, ip, { limit, windowMs, ttlSec = 120 }) {
  const key = `${keyPrefix}:${ip}`;
  const raw = await kvGet(key).catch(() => null);
  const now = Date.now();
  let state = raw ? JSON.parse(raw) : { c: 0, t: now };
  if (now - state.t > windowMs) state = { c: 0, t: now };
  if (state.c >= limit) {
    return { allowed: false, retryAfter: Math.ceil((state.t + windowMs - now) / 1000) };
  }
  state.c += 1;
  await kvPut(key, JSON.stringify(state), ttlSec).catch(() => {});
  return { allowed: true };
}

export function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

export async function enforceRateLimit(req, res, keyPrefix, opts) {
  const ip = clientIp(req);
  const { allowed, retryAfter } = await checkRateLimit(keyPrefix, ip, opts).catch(() => ({ allowed: true }));
  if (!allowed) {
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ error: "rate_limited", detail: "too many requests", retryAfter });
    return false;
  }
  return true;
}

/** Council debate limits — Upstash tiered when configured, else KV per-IP. */
export async function enforceCouncilLimit(req, res, session, user) {
  const ip = clientIp(req);
  const tier = councilTier(session, user);
  const id = session?.sub ? `user:${session.sub}` : `ip:${ip}`;

  if (isUpstashConfigured()) {
    const { allowed, retryAfter } = await checkUpstashLimit(id, tier).catch(() => ({ allowed: true }));
    if (!allowed) {
      res.setHeader("Retry-After", String(retryAfter || 3600));
      res.status(429).json({
        error: "rate_limited",
        detail: "chamber_full",
        retryAfter: retryAfter || 3600,
        tier,
        message: tier === "anonymous" ? "sign_in_for_more" : "upgrade_for_more",
      });
      return false;
    }
    return true;
  }

  return enforceRateLimit(req, res, "rl:council", { limit: 3, windowMs: 60_000 });
}

/** TTS / auth — prefer Upstash minute windows when configured. */
export async function enforceEndpointLimit(req, res, tierKey) {
  const ip = clientIp(req);
  if (isUpstashConfigured()) {
    const { allowed, retryAfter } = await checkUpstashLimit(`ip:${ip}`, tierKey).catch(() => ({ allowed: true }));
    if (!allowed) {
      res.setHeader("Retry-After", String(retryAfter || 60));
      res.status(429).json({ error: "rate_limited", retryAfter: retryAfter || 60 });
      return false;
    }
    return true;
  }
  const kvOpts = tierKey === "tts"
    ? { limit: 5, windowMs: 60_000 }
    : { limit: 10, windowMs: 60_000 };
  const prefix = tierKey === "tts" ? "rl:tts" : "rl:auth";
  return enforceRateLimit(req, res, prefix, kvOpts);
}

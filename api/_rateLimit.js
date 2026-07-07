import { kvGet, kvPut } from "./_kv.js";

/**
 * Best-effort IP rate limit via Cloudflare KV (eventually consistent).
 * @param {string} keyPrefix - e.g. "rl", "rl:auth", "rl:tts"
 * @param {string} ip
 * @param {{ limit: number, windowMs: number, ttlSec?: number }} opts
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

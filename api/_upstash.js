import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis = null;
const _limiters = new Map();

export function isUpstashConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  if (_redis) return _redis;
  if (!isUpstashConfigured()) return null;
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
}

/** @param {string} name @param {number} requests @param {string} window e.g. '1 d', '1 m' */
export function getLimiter(name, requests, window) {
  const key = `${name}:${requests}:${window}`;
  if (_limiters.has(key)) return _limiters.get(key);
  const redis = getRedis();
  if (!redis) return null;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `council:${name}`,
    analytics: true,
  });
  _limiters.set(key, limiter);
  return limiter;
}

export const TIER_LIMITS = {
  anonymous: { requests: 3, window: "1 d", name: "council_anon" },
  free: { requests: 10, window: "1 d", name: "council_free" },
  premium: { requests: 200, window: "1 d", name: "council_premium" },
  tts: { requests: 5, window: "1 m", name: "tts" },
  auth: { requests: 10, window: "1 m", name: "auth" },
};

/**
 * @returns {{ allowed: boolean, retryAfter?: number, tier?: string }}
 */
export async function checkUpstashLimit(identifier, tierKey) {
  const tier = TIER_LIMITS[tierKey];
  if (!tier) return { allowed: true };
  const limiter = getLimiter(tier.name, tier.requests, tier.window);
  if (!limiter) return { allowed: true };
  const result = await limiter.limit(identifier);
  return {
    allowed: result.success,
    retryAfter: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1000),
    tier: tierKey,
    remaining: result.remaining,
  };
}

export function councilTier(session, user) {
  if (!session) return "anonymous";
  if (user?.plan === "premium") return "premium";
  return "free";
}

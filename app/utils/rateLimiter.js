// Lightweight in-memory rate limiter with IP and optional user ID keys.
// OWASP: Implement abuse prevention and resource rate limiting.

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_PER_IP = 60; // sensible default: 60 req/min/IP
const RATE_LIMIT_MAX_PER_USER = 120; // if userId present, allow higher burst

// Store: { key: { ts: [timestamps] } } grouped by composite key
const buckets = new Map();

function makeKey({ key, ip, userId }) {
  // Composite key reduces collision; user-based takes precedence if provided
  return userId ? `${key}:user:${userId}` : `${key}:ip:${ip || 'unknown'}`;
}

export function getClientIp(headers) {
  // Try standard proxy headers safely
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0].trim();
    return ip;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '0.0.0.0';
}

export function checkRateLimit({ key, ip, userId }) {
  const compositeKey = makeKey({ key, ip, userId });
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const isUser = Boolean(userId);
  const limit = isUser ? RATE_LIMIT_MAX_PER_USER : RATE_LIMIT_MAX_PER_IP;

  let bucket = buckets.get(compositeKey);
  if (!bucket) {
    bucket = { ts: [] };
    buckets.set(compositeKey, bucket);
  }

  // Evict old timestamps outside the window
  bucket.ts = bucket.ts.filter((t) => t >= windowStart);

  if (bucket.ts.length >= limit) {
    const oldest = bucket.ts[0];
    const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  bucket.ts.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimiter() {
  buckets.clear();
}

export const __rateLimiterDebug = { buckets };
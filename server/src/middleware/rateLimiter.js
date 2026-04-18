import { Redis } from '@upstash/redis';

let redis = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('Upstash Redis credentials not found. Rate limiting is disabled.');
  }
} catch (e) {
  console.warn('Could not initialize Redis for rate limiting:', e.message);
}

const WINDOW_SECONDS = 60;      // 1-minute sliding window
const MAX_REQUESTS   = 60;      // max requests per window per user

/**
 * Express middleware: sliding-window rate limiter via Upstash Redis.
 * Key = "ratelimit:<userId>" — incremented on each request, expires after WINDOW_SECONDS.
 * If Redis is unavailable the middleware simply passes through (fail-open).
 */
export async function rateLimiter(req, res, next) {
  if (!redis) return next(); // fail-open when Redis is not configured

  const userId = req.user?.userId || req.ip;
  const key    = `ratelimit:${userId}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      // First request in this window — set the expiry
      await redis.expire(key, WINDOW_SECONDS);
    }

    res.setHeader('X-RateLimit-Limit',     MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - current));

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        error:   true,
        message: 'Too many requests. Please wait before trying again.',
        code:    'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err.message);
    next(); // fail-open on Redis errors
  }
}

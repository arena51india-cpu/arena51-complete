/**
 * Simple fixed-window rate limiter backed by an in-memory Map.
 *
 * This works correctly on a single long-running server, but Vercel's
 * serverless functions are stateless and can run as multiple concurrent
 * instances — each instance gets its own Map, so this only provides a
 * soft, best-effort limit in that environment, not a hard guarantee.
 *
 * For production-grade rate limiting across instances, swap this for
 * Upstash Redis + @upstash/ratelimit (a few lines: create a Redis-backed
 * Ratelimit instance and call `.limit(key)` instead of `checkRateLimit`).
 * This implementation is intentionally dependency-free so the project
 * runs out of the box without provisioning Redis first.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so the Map doesn't grow unbounded
// on a long-running instance.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60_000).unref?.();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Extracts a best-effort client IP from a Next.js request for rate-limit keys. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

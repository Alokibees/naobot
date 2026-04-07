// Simple in-memory rate limiter — 20 requests per IP per minute
const store = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string, limit = 20, windowMs = 60_000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) return { allowed: false, remaining: 0 };

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

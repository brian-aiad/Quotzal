const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  ip: string,
  endpoint: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number } {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

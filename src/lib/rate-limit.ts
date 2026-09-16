// In-Memory Rate Limiter for Login and API Protection
// Tracks attempts per key/namespace (e.g. client IP or identifier)

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_LOGIN_ATTEMPTS = 5; // Max 5 failed login attempts
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  return checkGenericRateLimit("login", key, MAX_LOGIN_ATTEMPTS);
}

export function recordFailedAttempt(key: string) {
  recordGenericAttempt("login", key, LOGIN_WINDOW_MS);
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(`login:${key}`);
}

export function checkGenericRateLimit(
  namespace: string,
  key: string,
  maxAttempts: number
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const compositeKey = `${namespace}:${key}`;
  const now = Date.now();
  const record = rateLimitStore.get(compositeKey);

  if (!record || now > record.resetTime) {
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  return { allowed: true, remainingAttempts: maxAttempts - record.count, retryAfterSeconds: 0 };
}

export function recordGenericAttempt(namespace: string, key: string, windowMs: number) {
  const compositeKey = `${namespace}:${key}`;
  const now = Date.now();
  const record = rateLimitStore.get(compositeKey);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(compositeKey, { count: 1, resetTime: now + windowMs });
  } else {
    record.count += 1;
  }
}

export function getClientIdentifier(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "global_client";
}


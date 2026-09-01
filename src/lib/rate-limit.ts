import { headers } from "next/headers";

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

// In-memory store mapping IP addresses to attempt counts & expiration timestamp
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Clean up expired rate limit records periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Retrieves the client's IP address from incoming request headers
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks and updates rate limit for an IP address.
 * Defaults: Max 5 attempts per 15-minute window.
 */
export function checkRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number; retryAfterMinutes: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // If no record exists or window expired, initialize a new window
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      retryAfterMinutes: 0,
    };
  }

  // If limit exceeded, deny request
  if (record.count >= maxAttempts) {
    const retryAfterMinutes = Math.ceil((record.resetTime - now) / (60 * 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMinutes,
    };
  }

  // Increment attempt count
  record.count += 1;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.count,
    retryAfterMinutes: 0,
  };
}

/**
 * Resets the rate limit counter upon a successful login
 */
export function resetRateLimit(ip: string) {
  rateLimitStore.delete(ip);
}

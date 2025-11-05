import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting utility
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired records periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    cleanupExpiredRecords();
  }

  // No record exists or record has expired
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.max - 1, resetTime };
  }

  // Record exists and is still valid
  if (record.count < config.max) {
    record.count++;
    return { allowed: true, remaining: config.max - record.count, resetTime: record.resetTime };
  }

  // Rate limit exceeded
  return { allowed: false, remaining: 0, resetTime: record.resetTime };
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },
  SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 signups per IP
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset requests
  },
  OTP_RESEND: {
    windowMs: 60 * 1000, // 1 minute
    max: 1, // 1 resend per minute
  },

  // General API
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
  },

  // User actions
  CONNECTION_REQUESTS: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 requests per day
  },
  FLAG_REPORTS: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // 5 reports per day
  },
} as const;

/**
 * Apply rate limiting to a request
 * Returns null if allowed, or NextResponse if rate limited
 */
export function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
) {
  const identifier = getIdentifier(request, userId);
  const result = rateLimit(identifier, config);

  return {
    ...result,
    identifier,
  };
}

import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed rate limiting (e.g., express-rate-limit with Redis store)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Rate limiting middleware
 *
 * @param options Configuration options
 * @param options.windowMs Time window in milliseconds
 * @param options.maxRequests Maximum number of requests per window
 * @param options.message Custom error message
 * @param options.keyGenerator Function to generate unique key per user/IP
 */
export function rateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => {
      // Default: use user ID if authenticated, otherwise IP
      const userId = (req as any).user?.id;
      return userId || req.ip || req.socket.remoteAddress || 'unknown';
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key] || store[key].resetAt < now) {
      // Create new window
      store[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', new Date(store[key].resetAt).toISOString());
      next();
      return;
    }

    store[key].count += 1;

    const remaining = Math.max(0, maxRequests - store[key].count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetAt).toISOString());

    if (store[key].count > maxRequests) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil((store[key].resetAt - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

// General API rate limit: 100 requests per minute
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'API rate limit exceeded. Please try again in a minute.',
});

// Strict rate limit for expensive operations: 10 requests per minute
export const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Rate limit exceeded for this operation. Please try again later.',
});

// Auth rate limit: 5 attempts per minute
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
});

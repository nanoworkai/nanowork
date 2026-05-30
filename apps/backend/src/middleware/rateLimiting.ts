import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getSupabase } from '../services/supabase';

/**
 * Rate limiting for AI operations per user
 * Tracks limits in Supabase to work across server restarts
 */

interface RateLimitEntry {
  user_id: string;
  operation_type: string;
  count: number;
  window_start: Date;
  last_request: Date;
}

/**
 * Check if user has exceeded rate limit for a specific operation
 */
export async function checkRateLimit(
  userId: string,
  operationType: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = getSupabase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

  // Get or create rate limit entry
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('operation_type', operationType)
    .single();

  let entry: RateLimitEntry;

  if (existing) {
    const entryWindowStart = new Date(existing.window_start);

    // Check if we're in a new window
    if (entryWindowStart < windowStart) {
      // Reset counter for new window
      entry = {
        user_id: userId,
        operation_type: operationType,
        count: 1,
        window_start: now,
        last_request: now,
      };

      await supabase
        .from('rate_limits')
        .update({
          count: 1,
          window_start: now.toISOString(),
          last_request: now.toISOString(),
        })
        .eq('user_id', userId)
        .eq('operation_type', operationType);

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
      };
    } else {
      // Still in current window
      entry = {
        user_id: userId,
        operation_type: operationType,
        count: existing.count,
        window_start: entryWindowStart,
        last_request: new Date(existing.last_request),
      };

      if (entry.count >= maxRequests) {
        const resetAt = new Date(entry.window_start.getTime() + windowMinutes * 60 * 1000);
        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Increment counter
      await supabase
        .from('rate_limits')
        .update({
          count: entry.count + 1,
          last_request: now.toISOString(),
        })
        .eq('user_id', userId)
        .eq('operation_type', operationType);

      return {
        allowed: true,
        remaining: maxRequests - entry.count - 1,
        resetAt: new Date(entry.window_start.getTime() + windowMinutes * 60 * 1000),
      };
    }
  } else {
    // Create new entry
    await supabase.from('rate_limits').insert({
      user_id: userId,
      operation_type: operationType,
      count: 1,
      window_start: now.toISOString(),
      last_request: now.toISOString(),
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
    };
  }
}

/**
 * Rate limiter for build creation - 5 builds per hour per user
 */
export async function rateLimitBuildCreation(req: any, res: Response, next: Function) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const result = await checkRateLimit(req.user.id, 'build_creation', 5, 60);

  res.setHeader('X-RateLimit-Limit', '5');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You can create a maximum of 5 builds per hour. Please try again later.',
      retryAfter: result.resetAt.toISOString(),
    });
    return;
  }

  next();
}

/**
 * Rate limiter for AI conversations - 20 messages per hour per user
 */
export async function rateLimitConversations(req: any, res: Response, next: Function) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const result = await checkRateLimit(req.user.id, 'conversation', 20, 60);

  res.setHeader('X-RateLimit-Limit', '20');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You can send a maximum of 20 messages per hour. Please try again later.',
      retryAfter: result.resetAt.toISOString(),
    });
    return;
  }

  next();
}

/**
 * Rate limiter for AI name generation - 10 per hour per user
 */
export async function rateLimitAIGeneration(req: any, res: Response, next: Function) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const result = await checkRateLimit(req.user.id, 'ai_generation', 10, 60);

  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You can generate a maximum of 10 AI responses per hour. Please try again later.',
      retryAfter: result.resetAt.toISOString(),
    });
    return;
  }

  next();
}

/**
 * Rate limiter for agent orchestrator - 3 builds per hour per user
 * This is more expensive, so lower limit
 */
export async function rateLimitAgentOrchestrator(req: any, res: Response, next: Function) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const result = await checkRateLimit(req.user.id, 'agent_orchestrator', 3, 60);

  res.setHeader('X-RateLimit-Limit', '3');
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'You can start a maximum of 3 agent builds per hour. Please try again later.',
      retryAfter: result.resetAt.toISOString(),
    });
    return;
  }

  next();
}

/**
 * General API rate limiter (fallback for all routes)
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

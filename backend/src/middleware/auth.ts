import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../services/supabase';
import { getAgentByUserId } from '../services/supabase';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware to require user authentication via Supabase JWT
 */
export async function requireUserAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Fetch the agent for this user
    const agent = await getAgentByUserId(user.id);

    if (!agent) {
      res.status(403).json({ error: 'No agent found for this user' });
      return;
    }

    // Attach user and agent to request
    (req as AuthenticatedRequest).user = { id: user.id, email: user.email || '' };
    (req as AuthenticatedRequest).agent = agent;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to require internal token for internal endpoints
 */
export function requireInternalToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.INTERNAL_TOKEN;

  if (!expectedToken) {
    console.error('INTERNAL_TOKEN not configured');
    res.status(500).json({ error: 'Internal authentication not configured' });
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  if (token !== expectedToken) {
    res.status(401).json({ error: 'Invalid internal token' });
    return;
  }

  next();
}

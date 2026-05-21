import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { getSupabase } from '../services/supabase';
import { getAgentByUserId, createAgent } from '../services/supabase';
import { AuthenticatedRequest } from '../types';

function agentEmailAddress(slug: string): string {
  const domain = process.env.AGENT_EMAIL_DOMAIN;

  if (!domain) {
    throw new Error('AGENT_EMAIL_DOMAIN must be configured');
  }

  return `a-${slug}@${domain}`;
}

/**
 * Middleware to require user authentication via Supabase JWT
 * Auto-provisions an agent if the user doesn't have one yet
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
    let agent = await getAgentByUserId(user.id);

    // Auto-provision agent if it doesn't exist
    if (!agent) {
      console.log(`Auto-provisioning agent for new user ${user.id}`);

      try {
        // Generate unique slug (8 chars, lowercase alphanumeric)
        const slug = nanoid(8).toLowerCase().replace(/[^a-z0-9]/g, '');

        // Generate email address
        const email = agentEmailAddress(slug);

        // Create agent (without Stripe account for now - can be added later)
        agent = await createAgent({
          user_id: user.id,
          slug,
          email,
          name: `Agent ${slug}`,
          stripe_account_id: null,
          stripe_onboarding_complete: false,
          system_prompt: null,
          status: 'active',
          metadata: {},
        });

        console.log(`Successfully auto-provisioned agent ${agent.id} for user ${user.id}`);
      } catch (provisionError) {
        console.error('Failed to auto-provision agent:', provisionError);
        res.status(500).json({
          error: 'Failed to create agent account',
          message: provisionError instanceof Error ? provisionError.message : 'unknown error',
        });
        return;
      }
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

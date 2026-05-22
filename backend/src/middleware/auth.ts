import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { getSupabase } from '../services/supabase';
import { getAgentByUserId, createAgent } from '../services/supabase';
import { AuthenticatedRequest } from '../types';

function agentEmailAddress(slug: string): string {
  const domain = process.env.AGENT_EMAIL_DOMAIN;

  if (!domain) {
    // Fallback for when agent email functionality is not yet enabled
    return `agent-${slug}@placeholder.local`;
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
        // Generate unique slug - guarantee exactly 8 alphanumeric characters
        // Keep generating until we get 8 chars after filtering
        let slug = '';
        while (slug.length < 8) {
          const candidate = nanoid(12).toLowerCase();
          slug += candidate.replace(/[^a-z0-9]/g, '');
        }
        slug = slug.substring(0, 8);

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
        // Check if this is a unique constraint violation on user_id
        // This can happen if multiple requests race to create the agent
        const errorMessage = provisionError instanceof Error ? provisionError.message : '';
        if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          console.log(`Agent already exists for user ${user.id} (race condition), fetching existing agent`);

          // Try to fetch the existing agent that was created by the racing request
          agent = await getAgentByUserId(user.id);

          if (!agent) {
            // This shouldn't happen, but if it does, it's a real error
            console.error('Failed to fetch existing agent after unique constraint violation');
            res.status(500).json({
              error: 'Failed to provision or fetch agent account',
              message: 'Agent creation race condition could not be resolved',
            });
            return;
          }

          console.log(`Successfully recovered from race condition, using existing agent ${agent.id}`);
        } else {
          // This is a different error - propagate it
          console.error('Failed to auto-provision agent:', provisionError);
          res.status(500).json({
            error: 'Failed to create agent account',
            message: errorMessage || 'unknown error',
            details: provisionError instanceof Error ? provisionError.stack : undefined,
          });
          return;
        }
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

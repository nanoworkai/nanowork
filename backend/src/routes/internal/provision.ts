import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { requireInternalToken } from '../../middleware/auth';
import { getAgentByUserId, createAgent } from '../../services/supabase';
import { createConnectAccount } from '../../services/stripe';

const router = Router();

function agentEmailAddress(slug: string): string {
  const domain = process.env.AGENT_EMAIL_DOMAIN;

  if (!domain) {
    throw new Error('AGENT_EMAIL_DOMAIN must be configured');
  }

  return `a-${slug}@${domain}`;
}

/**
 * POST /internal/provision-agent
 * Provision a new agent for a user (idempotent)
 */
router.post('/provision-agent', requireInternalToken, async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'user_id is required' });
      return;
    }

    // Check if agent already exists (idempotent)
    const existingAgent = await getAgentByUserId(user_id);

    if (existingAgent) {
      res.json({ agent: existingAgent, created: false });
      return;
    }

    // Generate unique slug (8 chars, lowercase alphanumeric)
    const slug = nanoid(8).toLowerCase().replace(/[^a-z0-9]/g, '');

    // Generate email address
    const email = agentEmailAddress(slug);

    // Attempt to create Stripe Connect account (non-blocking)
    let stripeAccountId: string | null = null;
    let stripeOnboardingComplete = false;

    try {
      const { accountId } = await createConnectAccount();
      stripeAccountId = accountId;
    } catch (error) {
      console.error('Failed to create Stripe account (non-blocking):', error);
    }

    // Create agent
    const agent = await createAgent({
      user_id,
      slug,
      email,
      name: `Agent ${slug}`,
      stripe_account_id: stripeAccountId,
      stripe_onboarding_complete: stripeOnboardingComplete,
      system_prompt: null,
      status: 'active',
      metadata: {},
    });

    res.json({ agent, created: true });
  } catch (error) {
    console.error('Provision agent error:', error);
    res.status(500).json({
      error: 'Failed to provision agent',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;

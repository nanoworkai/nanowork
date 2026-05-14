import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';
import { getStripeInstance } from '../services/stripe';

const router = Router();

/**
 * POST /billing/portal
 * Create a Stripe Customer Portal session
 */
router.post('/portal', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabase();
    const stripe = getStripeInstance();

    if (!stripe) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    // Get user profile with stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    let stripeCustomerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      if (!profile.email) {
        res.status(400).json({ error: 'User email is required to create billing account' });
        return;
      }

      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name || undefined,
        metadata: {
          userId,
        },
      });

      stripeCustomerId = customer.id;

      // Save customer ID to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to save Stripe customer ID:', updateError);
        // Continue anyway - customer is created in Stripe
      }
    }

    // Create billing portal session
    const returnUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/dashboard/settings`
      : 'http://localhost:5173/dashboard/settings';

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({
      error: 'Failed to create billing portal session',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /billing/info
 * Get current billing information for the user
 */
router.get('/info', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabase();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan, subscription_status, trial_ends_at, subscription_ends_at')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const stripe = getStripeInstance();

    // Get subscription details from Stripe if customer exists
    let subscriptionInfo = null;
    if (stripe && profile.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0] as any;
          subscriptionInfo = {
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            cancelAt: sub.cancel_at,
          };
        }
      } catch (err) {
        console.error('Failed to fetch subscription from Stripe:', err);
      }
    }

    res.json({
      plan: profile.plan || 'free',
      subscriptionStatus: profile.subscription_status || null,
      trialEndsAt: profile.trial_ends_at || null,
      subscriptionEndsAt: profile.subscription_ends_at || null,
      hasStripeCustomer: !!profile.stripe_customer_id,
      subscription: subscriptionInfo,
    });
  } catch (error) {
    console.error('Get billing info error:', error);
    res.status(500).json({
      error: 'Failed to fetch billing information',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;

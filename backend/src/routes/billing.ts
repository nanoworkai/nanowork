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

/**
 * POST /billing/subscriptions
 * Create a new subscription for a plan upgrade
 */
router.post('/subscriptions', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { priceId, plan } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!priceId || !plan) {
      res.status(400).json({ error: 'Missing required fields: priceId and plan' });
      return;
    }

    const supabase = getSupabase();
    const stripe = getStripeInstance();

    if (!stripe) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    // Get user profile
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
        res.status(400).json({ error: 'User email is required to create subscription' });
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
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // Check for existing active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      res.status(400).json({
        error: 'User already has an active subscription. Please cancel or modify existing subscription first.'
      });
      return;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        plan,
      },
    });

    // Get client secret for payment confirmation
    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret = latestInvoice?.payment_intent?.client_secret || null;

    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /billing/subscriptions/:id
 * Modify or cancel an existing subscription
 */
router.patch('/subscriptions/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const subscriptionId = req.params.id;
    const { action, newPriceId, newPlan } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!action || !['cancel', 'upgrade', 'downgrade'].includes(action)) {
      res.status(400).json({ error: 'Invalid action. Must be: cancel, upgrade, or downgrade' });
      return;
    }

    const stripe = getStripeInstance();

    if (!stripe) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    // Verify subscription belongs to user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const supabase = getSupabase();

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile || subscription.customer !== profile.stripe_customer_id) {
      res.status(403).json({ error: 'Subscription does not belong to user' });
      return;
    }

    // Handle different actions
    if (action === 'cancel') {
      // Cancel at period end (don't immediately cancel)
      const updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      res.json({
        success: true,
        message: 'Subscription will be canceled at period end',
        cancelAt: updated.cancel_at,
      });
    } else if (action === 'upgrade' || action === 'downgrade') {
      if (!newPriceId || !newPlan) {
        res.status(400).json({ error: 'newPriceId and newPlan are required for upgrade/downgrade' });
        return;
      }

      // Update subscription with new price
      const updated = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          ...subscription.metadata,
          plan: newPlan,
        },
      });

      res.json({
        success: true,
        message: `Subscription ${action}d successfully`,
        subscription: {
          id: updated.id,
          status: updated.status,
        },
      });
    }
  } catch (error) {
    console.error('Modify subscription error:', error);
    res.status(500).json({
      error: 'Failed to modify subscription',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;

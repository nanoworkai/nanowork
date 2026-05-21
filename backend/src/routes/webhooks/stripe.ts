import { Router, Request, Response } from 'express';
import { getStripeInstance } from '../../services/stripe';
import { getSupabase } from '../../services/supabase';
import { addCredits } from '../../services/creditService';

const router = Router();

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 */
router.post('/', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).json({ error: 'Missing signature or webhook secret' });
    return;
  }

  const stripe = getStripeInstance();
  if (!stripe) {
    res.status(500).json({ error: 'Stripe not configured' });
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * Handle payment_intent.succeeded event
 * - Add credits to user's balance for credit top-ups
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const metadata = paymentIntent.metadata;
  const userId = metadata?.userId;
  const creditAmount = metadata?.creditAmount;

  if (!userId || !creditAmount) {
    console.log('Payment intent without credit metadata (not a credit top-up)');
    return;
  }

  console.log('Credit top-up payment succeeded:', paymentIntent.id, 'user:', userId, 'credits:', creditAmount);

  // Idempotency check: verify this payment intent hasn't been processed already
  // This prevents duplicate credit additions if Stripe retries the webhook
  const supabase = getSupabase();
  const { data: existingTransaction, error: checkError } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existingTransaction) {
    console.log('Webhook already processed for payment intent:', paymentIntent.id);
    return;
  }

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected when payment is new)
    // Any other error should be logged
    console.error('Error checking for existing transaction:', checkError);
  }

  // NOTE: Consider adding a UNIQUE constraint on stripe_payment_intent_id column
  // in credit_transactions table to enforce idempotency at the database level:
  // ALTER TABLE credit_transactions ADD CONSTRAINT unique_stripe_payment_intent
  // UNIQUE (stripe_payment_intent_id);

  try {
    const newBalance = await addCredits(
      userId,
      parseInt(creditAmount, 10),
      paymentIntent.id
    );

    console.log('Added credits to user:', userId, 'new balance:', newBalance);
  } catch (error) {
    console.error('Failed to add credits:', error);
    throw error;
  }
}

/**
 * Handle subscription.deleted event
 * - Reset deployment domain fields if custom domain subscription
 * - Reset user plan to free
 */
async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const metadata = subscription.metadata;

  console.log('Subscription deleted:', subscriptionId, 'customer:', customerId, metadata);

  const supabase = getSupabase();

  // Find and reset user profile plan
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profile && !profileError) {
    await supabase
      .from('profiles')
      .update({
        plan: 'free',
        subscription_status: null,
        subscription_id: null,
        subscription_ends_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    console.log('Reset user plan to free:', profile.email);
  }

  // Find deployment by subscription ID (domain subscription)
  const { data: deployment, error: findError } = await supabase
    .from('deployments')
    .select('id, custom_domain')
    .eq('domain_subscription_id', subscriptionId)
    .single();

  if (findError || !deployment) {
    console.log('No deployment found for subscription (may be user subscription)');
    return;
  }

  // Reset deployment domain fields
  const { error: updateError } = await supabase
    .from('deployments')
    .update({
      custom_domain: null,
      domain_status: null,
      domain_verified: false,
      domain_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deployment.id);

  if (updateError) {
    console.error('Failed to update deployment:', updateError);
  } else {
    console.log('Reset deployment domain fields:', deployment.id);
  }
}

/**
 * Handle subscription.updated event
 * - Update deployment status based on subscription status
 * - Sync user plan and subscription status
 */
async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const status = subscription.status;
  const items = subscription.items?.data || [];

  console.log('Subscription updated:', subscriptionId, 'status:', status);

  const supabase = getSupabase();

  // Update user profile subscription status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profile && !profileError) {
    // Determine plan from subscription items (first price ID)
    let newPlan = profile.plan;
    if (items.length > 0) {
      const priceId = items[0].price.id;
      // Map Stripe price IDs to plan names
      const planMapping: Record<string, string> = {
        [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
        [process.env.STRIPE_PRICE_GROWTH || '']: 'growth',
        [process.env.STRIPE_PRICE_SCALE || '']: 'scale',
        [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
      };
      newPlan = planMapping[priceId] || profile.plan;
    }

    // Update profile with subscription info
    await supabase
      .from('profiles')
      .update({
        plan: status === 'active' || status === 'trialing' ? newPlan : 'free',
        subscription_status: status,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    console.log('Updated user subscription:', profile.id, 'plan:', newPlan, 'status:', status);
  }

  // Find deployment (for domain subscriptions)
  const { data: deployment, error: findError } = await supabase
    .from('deployments')
    .select('id, domain_status')
    .eq('domain_subscription_id', subscriptionId)
    .single();

  if (findError || !deployment) {
    console.log('No deployment found for subscription (may be user subscription)');
    return;
  }

  // Update domain status based on subscription status
  let newDomainStatus = deployment.domain_status;

  if (status === 'active' && deployment.domain_status === 'pending_payment') {
    newDomainStatus = 'pending_configuration';
  } else if (status === 'past_due' || status === 'canceled' || status === 'unpaid') {
    newDomainStatus = 'payment_failed';
  }

  if (newDomainStatus !== deployment.domain_status) {
    await supabase
      .from('deployments')
      .update({
        domain_status: newDomainStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deployment.id);

    console.log('Updated deployment status:', deployment.id, newDomainStatus);
  }
}

export default router;

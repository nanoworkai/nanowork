import { Router, Request, Response } from 'express';
import { getStripeInstance } from '../../services/stripe';
import { getSupabase } from '../../services/supabase';
import { removeCustomDomain } from '../../services/cloudflare';
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

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
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
 * - Remove custom domain from Cloudflare and reset deployment
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
    .select('id, custom_domain, cloudflare_project_name')
    .eq('domain_subscription_id', subscriptionId)
    .single();

  if (findError || !deployment) {
    console.log('No deployment found for subscription (may be user subscription)');
    return;
  }

  const customDomain = deployment.custom_domain;
  const projectName = deployment.cloudflare_project_name || 'nanowork-app';

  // Remove domain from Cloudflare
  if (customDomain) {
    const removeResult = await removeCustomDomain(projectName, customDomain);
    if (!removeResult.success) {
      console.error('Failed to remove domain from Cloudflare:', removeResult.error);
    } else {
      console.log('Removed domain from Cloudflare:', customDomain);
    }
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
 * Helper: Map Stripe price ID to plan name
 */
function getPlanFromPriceId(priceId: string): string {
  const planMapping: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
    [process.env.STRIPE_PRICE_GROWTH || '']: 'growth',
    [process.env.STRIPE_PRICE_SCALE || '']: 'scale',
    [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
  };
  return planMapping[priceId] || 'free';
}

/**
 * Handle subscription.created event
 * - Sync new subscription to database
 */
async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);
  await syncSubscriptionToDatabase(subscription);
}

/**
 * Helper: Sync subscription data from Stripe to database
 */
async function syncSubscriptionToDatabase(subscription: any): Promise<void> {
  const supabase = getSupabase();
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const status = subscription.status;
  const items = subscription.items?.data || [];
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  if (items.length === 0) {
    console.warn('Subscription has no items:', subscriptionId);
    return;
  }

  const priceId = items[0].price.id;
  const plan = getPlanFromPriceId(priceId);

  // Find user by stripe_customer_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile || profileError) {
    console.error(`No profile found for Stripe customer ${customerId}`);
    return;
  }

  // Update profile with subscription info
  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_id: subscriptionId,
      subscription_ends_at: currentPeriodEnd,
      plan: status === 'active' || status === 'trialing' ? plan : 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  // Create/update record in subscriptions table
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  const subscriptionData = {
    user_id: profile.id,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    plan,
    status,
    billing_cycle: items[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
    amount: (items[0].price.unit_amount || 0) / 100,
    currency: subscription.currency.toUpperCase(),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: currentPeriodEnd,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    metadata: subscription.metadata,
    updated_at: new Date().toISOString(),
  };

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSub.id);
  } else {
    await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString(),
      });
  }

  console.log(`✅ Synced subscription ${subscriptionId} for user ${profile.id} (plan: ${plan}, status: ${status})`);
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

  // Sync subscription data to database
  await syncSubscriptionToDatabase(subscription);

  const supabase = getSupabase();

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

/**
 * Handle invoice.payment_succeeded event
 * - Record successful payment
 * - Add credits if credit purchase
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  const customerId = invoice.customer;
  const metadata = invoice.metadata || {};

  console.log('Invoice payment succeeded:', invoice.id);

  const supabase = getSupabase();

  // Find user by stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, credits_balance')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error(`No profile found for Stripe customer ${customerId}`);
    return;
  }

  // If this is a credit top-up (has metadata.creditAmount), add credits
  if (metadata.creditAmount) {
    const creditAmount = parseInt(metadata.creditAmount, 10);

    try {
      await addCredits(profile.id, creditAmount, invoice.id);
      console.log(`✅ Added ${creditAmount} credits for user ${profile.id}`);
    } catch (error) {
      console.error('Failed to add credits:', error);
    }
  }

  // For subscription payments, just log
  if (invoice.subscription) {
    console.log(`✅ Successful subscription payment for ${invoice.subscription}`);
  }
}

/**
 * Handle invoice.payment_failed event
 * - Mark subscription as past_due
 * - Send notification (TODO)
 */
async function handleInvoicePaymentFailed(invoice: any) {
  const customerId = invoice.customer;

  console.log('Invoice payment failed:', invoice.id);

  const supabase = getSupabase();

  // Find user by stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error(`No profile found for Stripe customer ${customerId}`);
    return;
  }

  // Update subscription status to past_due if applicable
  if (invoice.subscription) {
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    console.log(`⚠️ Payment failed for subscription ${invoice.subscription}, user ${profile.id} marked as past_due`);
  }

  // TODO: Send notification email to user about failed payment
}

export default router;

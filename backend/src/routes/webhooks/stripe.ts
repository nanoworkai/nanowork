import { Router, Request, Response } from 'express';
import { getStripeInstance } from '../../services/stripe';
import { getSupabase } from '../../services/supabase';
import { removeCustomDomain } from '../../services/cloudflare';

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
 * Handle subscription.deleted event
 * Remove custom domain from Cloudflare and reset deployment
 */
async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionId = subscription.id;
  const metadata = subscription.metadata;

  console.log('Subscription deleted:', subscriptionId, metadata);

  const supabase = getSupabase();

  // Find deployment by subscription ID
  const { data: deployment, error: findError } = await supabase
    .from('deployments')
    .select('id, custom_domain, cloudflare_project_name')
    .eq('domain_subscription_id', subscriptionId)
    .single();

  if (findError || !deployment) {
    console.warn('No deployment found for subscription:', subscriptionId);
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
 * Handle subscription.updated event
 * Update deployment status based on subscription status
 */
async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log('Subscription updated:', subscriptionId, 'status:', status);

  const supabase = getSupabase();

  // Find deployment
  const { data: deployment, error: findError } = await supabase
    .from('deployments')
    .select('id, domain_status')
    .eq('domain_subscription_id', subscriptionId)
    .single();

  if (findError || !deployment) {
    console.warn('No deployment found for subscription:', subscriptionId);
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

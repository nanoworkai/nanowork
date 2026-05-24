import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';
import { createStripeSubscription, cancelStripeSubscription } from '../services/stripe';
import {
  addCustomDomain,
  verifyCustomDomain,
  removeCustomDomain,
  getDNSInstructions,
} from '../services/cloudflare';

const router = Router();

/**
 * POST /domains/subscribe
 * Create a Stripe subscription for a custom domain
 */
router.post('/subscribe', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deploymentId, customDomain } = req.body;
    const userId = req.user?.id;

    if (!deploymentId || !customDomain || !userId) {
      res.status(400).json({ error: 'deploymentId, customDomain, and userId are required' });
      return;
    }

    // Validate domain format (basic check)
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      res.status(400).json({ error: 'Invalid domain format' });
      return;
    }

    const supabase = getSupabase();

    // Check if deployment exists and belongs to user
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select('id, business_id, businesses!inner(user_id)')
      .eq('id', deploymentId)
      .single();

    if (deploymentError || !deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Verify user owns this deployment
    const businessUserId = (deployment as any).businesses?.user_id;
    if (businessUserId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      res.status(400).json({ error: 'User does not have a Stripe customer ID' });
      return;
    }

    // Create Stripe subscription
    const priceId = process.env.CUSTOM_DOMAIN_PRICE_ID || 'price_1234567890'; // Configure in .env
    const subscription = await createStripeSubscription(
      profile.stripe_customer_id,
      priceId,
      {
        deploymentId,
        customDomain,
        userId,
      }
    );

    if (!subscription) {
      res.status(500).json({ error: 'Failed to create Stripe subscription' });
      return;
    }

    // Update deployment with subscription info
    const { error: updateError } = await supabase
      .from('deployments')
      .update({
        custom_domain: customDomain,
        domain_status: 'pending_payment',
        domain_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deploymentId);

    if (updateError) {
      console.error('Failed to update deployment:', updateError);
      // Don't fail the request - subscription was created
    }

    // Extract client secret from latest invoice
    let clientSecret: string | undefined;
    if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string') {
      const invoice = subscription.latest_invoice;
      if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
        clientSecret = invoice.payment_intent.client_secret || undefined;
      }
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (error) {
    console.error('Domain subscription error:', error);
    res.status(500).json({
      error: 'Failed to create domain subscription',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /domains/configure
 * Configure the custom domain with Cloudflare after payment
 */
router.post('/configure', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deploymentId } = req.body;
    const userId = req.user?.id;

    if (!deploymentId || !userId) {
      res.status(400).json({ error: 'deploymentId is required' });
      return;
    }

    const supabase = getSupabase();

    // Get deployment with custom domain
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select('id, custom_domain, cloudflare_project_name, business_id, businesses!inner(user_id)')
      .eq('id', deploymentId)
      .single();

    if (deploymentError || !deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Verify user owns this deployment
    const businessUserId = (deployment as any).businesses?.user_id;
    if (businessUserId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const customDomain = deployment.custom_domain;
    const projectName = deployment.cloudflare_project_name || 'nanowork-app'; // fallback

    if (!customDomain) {
      res.status(400).json({ error: 'No custom domain configured for this deployment' });
      return;
    }

    // Add domain to Cloudflare
    const cfResult = await addCustomDomain(projectName, customDomain);

    if (!cfResult.success) {
      res.status(500).json({ error: cfResult.error || 'Failed to add domain to Cloudflare' });
      return;
    }

    // Update deployment status
    await supabase
      .from('deployments')
      .update({
        domain_status: 'pending_dns',
        domain_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deploymentId);

    // Get DNS instructions
    const dnsInstructions = getDNSInstructions(customDomain, projectName);

    res.json({
      success: true,
      domain: customDomain,
      status: 'pending_dns',
      dnsInstructions,
      message: 'Domain added to Cloudflare. Please configure DNS records.',
    });
  } catch (error) {
    console.error('Domain configuration error:', error);
    res.status(500).json({
      error: 'Failed to configure domain',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /domains/verify/:deploymentId
 * Check DNS verification status
 */
router.get('/verify/:deploymentId', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabase();

    // Get deployment
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select('id, custom_domain, cloudflare_project_name, domain_status, businesses!inner(user_id)')
      .eq('id', deploymentId)
      .single();

    if (deploymentError || !deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Verify user owns this deployment
    const businessUserId = (deployment as any).businesses?.user_id;
    if (businessUserId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const customDomain = deployment.custom_domain;
    const projectName = deployment.cloudflare_project_name || 'nanowork-app';

    if (!customDomain) {
      res.status(400).json({ error: 'No custom domain configured' });
      return;
    }

    // Check verification with Cloudflare
    const verifyResult = await verifyCustomDomain(projectName, customDomain);

    if (verifyResult.error) {
      res.json({
        verified: false,
        status: deployment.domain_status,
        error: verifyResult.error,
      });
      return;
    }

    // Update deployment if verified
    if (verifyResult.verified) {
      await supabase
        .from('deployments')
        .update({
          domain_verified: true,
          domain_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', deploymentId);
    }

    res.json({
      verified: verifyResult.verified,
      status: verifyResult.verified ? 'active' : deployment.domain_status,
      cloudflareStatus: verifyResult.status,
    });
  } catch (error) {
    console.error('Domain verification error:', error);
    res.status(500).json({
      error: 'Failed to verify domain',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * DELETE /domains/cancel/:deploymentId
 * Cancel domain subscription and remove from Cloudflare
 */
router.delete('/cancel/:deploymentId', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deploymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabase();

    // Get deployment
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select('id, custom_domain, cloudflare_project_name, domain_subscription_id, businesses!inner(user_id)')
      .eq('id', deploymentId)
      .single();

    if (deploymentError || !deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Verify user owns this deployment
    const businessUserId = (deployment as any).businesses?.user_id;
    if (businessUserId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const customDomain = deployment.custom_domain;
    const projectName = deployment.cloudflare_project_name || 'nanowork-app';
    const subscriptionId = deployment.domain_subscription_id;

    // Cancel Stripe subscription if exists
    if (subscriptionId) {
      const cancelResult = await cancelStripeSubscription(subscriptionId);
      if (!cancelResult) {
        console.warn('Failed to cancel Stripe subscription:', subscriptionId);
      }
    }

    // Remove from Cloudflare if domain exists
    if (customDomain) {
      const removeResult = await removeCustomDomain(projectName, customDomain);
      if (!removeResult.success) {
        console.warn('Failed to remove domain from Cloudflare:', removeResult.error);
      }
    }

    // Reset deployment domain fields
    await supabase
      .from('deployments')
      .update({
        custom_domain: null,
        domain_status: null,
        domain_verified: false,
        domain_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deploymentId);

    res.json({
      success: true,
      message: 'Domain subscription cancelled and domain removed',
    });
  } catch (error) {
    console.error('Domain cancellation error:', error);
    res.status(500).json({
      error: 'Failed to cancel domain',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;

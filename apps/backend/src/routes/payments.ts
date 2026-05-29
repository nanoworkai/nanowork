import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getBusiness, createPaymentLink, getTransactions } from '../services/supabase';
import { createPaymentLink as createStripePaymentLink } from '../services/stripe';

const router = Router();

/**
 * POST /payments/links
 * Create a payment link
 */
router.post('/links', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id, title, amount_cents, currency } = req.body;

    if (!business_id || !title || !amount_cents) {
      res.status(400).json({ error: 'business_id, title, and amount_cents are required' });
      return;
    }

    // Verify business ownership
    const business = await getBusiness(business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if agent has Stripe account
    if (!req.agent!.stripe_account_id) {
      res.status(400).json({
        error: 'No Stripe account configured. Please complete Stripe onboarding first.',
      });
      return;
    }

    // Create payment link via Stripe
    const { id: stripePaymentLinkId, url } = await createStripePaymentLink(
      req.agent!.stripe_account_id,
      title,
      amount_cents,
      currency || 'usd'
    );

    // Store in database
    const paymentLink = await createPaymentLink({
      agent_id: req.agent!.id,
      business_id,
      stripe_payment_link_id: stripePaymentLinkId,
      title,
      amount_cents,
      currency: currency || 'usd',
      url,
      status: 'active',
      metadata: {},
    });

    res.json({ url: paymentLink.url, id: paymentLink.id });
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({
      error: 'Failed to create payment link',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

/**
 * GET /payments/transactions
 * List transactions for the agent
 */
router.get('/transactions', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id } = req.query;

    const transactions = await getTransactions(
      req.agent!.id,
      business_id as string | undefined
    );

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;

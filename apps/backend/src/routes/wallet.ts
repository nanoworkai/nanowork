import { Router, Response } from 'express';
import Stripe from 'stripe';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getBalance, getTransactionHistory } from '../services/creditService';

const router = Router();

// Credit bundle pricing
const CREDIT_BUNDLES = {
  starter: { credits: 100, priceUsd: 5 },
  popular: { credits: 500, priceUsd: 20 },
  pro: { credits: 1000, priceUsd: 35 },
} as const;

/**
 * GET /wallet/balance
 * Get the user's current credit balance
 */
router.get('/balance', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const balance = await getBalance(req.user.id);
    res.json({ balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      error: 'Failed to get balance',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /wallet/transactions
 * Get the user's transaction history
 */
router.get('/transactions', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await getTransactionHistory(req.user.id, limit);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to get transactions',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /wallet/topup
 * Create a Stripe Payment Intent for credit top-up
 */
router.post('/topup', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { bundle } = req.body;

    if (!bundle || !(bundle in CREDIT_BUNDLES)) {
      res.status(400).json({
        error: 'Invalid bundle',
        message: 'Bundle must be one of: starter, popular, pro',
      });
      return;
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    });

    const selectedBundle = CREDIT_BUNDLES[bundle as keyof typeof CREDIT_BUNDLES];

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedBundle.priceUsd * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        creditAmount: selectedBundle.credits.toString(),
        bundle,
      },
      description: `Nanowork Credits - ${selectedBundle.credits} credits`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: selectedBundle.priceUsd,
      credits: selectedBundle.credits,
    });
  } catch (error) {
    console.error('Create topup payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /wallet/bundles
 * Get available credit bundles
 */
router.get('/bundles', (req, res) => {
  res.json({
    bundles: [
      { id: 'starter', credits: 100, priceUsd: 5, label: 'Starter' },
      { id: 'popular', credits: 500, priceUsd: 20, label: 'Popular' },
      { id: 'pro', credits: 1000, priceUsd: 35, label: 'Pro' },
    ],
  });
});

export default router;

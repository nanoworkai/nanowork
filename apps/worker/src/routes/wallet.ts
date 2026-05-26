import { Hono } from 'hono';
import type { Env } from '../index';
import Stripe from 'stripe';
import { getSupabase } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// Credit bundle pricing
const CREDIT_BUNDLES = {
  starter: { credits: 100, priceUsd: 5 },
  popular: { credits: 500, priceUsd: 20 },
  pro: { credits: 1000, priceUsd: 35 },
} as const;

/**
 * GET /api/wallet/balance
 * Get the user's current credit balance
 */
app.get('/balance', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase(c.env);

    // Verify the user's token and get their ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get user balance
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return c.json({ error: 'Failed to get balance' }, 500);
    }

    return c.json({ balance: data.credits || 0 });
  } catch (error) {
    console.error('Get balance error:', error);
    return c.json({
      error: 'Failed to get balance',
      message: error instanceof Error ? error.message : 'unknown error',
    }, 500);
  }
});

/**
 * GET /api/wallet/transactions
 * Get the user's transaction history
 */
app.get('/transactions', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase(c.env);

    // Verify the user's token and get their ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const limit = parseInt(c.req.query('limit') || '50');

    // Get transaction history
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return c.json({ error: 'Failed to get transactions' }, 500);
    }

    return c.json({ transactions: data || [] });
  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({
      error: 'Failed to get transactions',
      message: error instanceof Error ? error.message : 'unknown error',
    }, 500);
  }
});

/**
 * POST /api/wallet/topup
 * Create a Stripe Payment Intent for credit top-up
 */
app.post('/topup', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase(c.env);

    // Verify the user's token and get their ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const body = await c.req.json<{ bundle: string }>();
    const { bundle } = body;

    if (!bundle || !(bundle in CREDIT_BUNDLES)) {
      return c.json({
        error: 'Invalid bundle',
        message: 'Bundle must be one of: starter, popular, pro',
      }, 400);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });

    const selectedBundle = CREDIT_BUNDLES[bundle as keyof typeof CREDIT_BUNDLES];

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedBundle.priceUsd * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId: user.id,
        creditAmount: selectedBundle.credits.toString(),
        bundle,
      },
      description: `Nanowork Credits - ${selectedBundle.credits} credits`,
    });

    return c.json({
      clientSecret: paymentIntent.client_secret,
      amount: selectedBundle.priceUsd,
      credits: selectedBundle.credits,
    });
  } catch (error) {
    console.error('Create topup payment intent error:', error);
    return c.json({
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'unknown error',
    }, 500);
  }
});

/**
 * GET /api/wallet/bundles
 * Get available credit bundles
 */
app.get('/bundles', (c) => {
  return c.json({
    bundles: [
      { id: 'starter', credits: 100, priceUsd: 5, label: 'Starter' },
      { id: 'popular', credits: 500, priceUsd: 20, label: 'Popular' },
      { id: 'pro', credits: 1000, priceUsd: 35, label: 'Pro' },
    ],
  });
});

export default app;

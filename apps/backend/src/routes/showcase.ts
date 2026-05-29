import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';
import { getStripeInstance } from '../services/stripe';

const router = Router();

/**
 * GET /showcase/companies
 * Get all available showcase companies
 */
router.get('/companies', async (req, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('showcase_companies')
      .select('*')
      .in('status', ['available', 'claimed'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get showcase companies error:', error);
    res.status(500).json({
      error: 'Failed to fetch showcase companies',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /showcase/companies/:id
 * Get single showcase company details
 */
router.get('/companies/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('showcase_companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Get showcase company error:', error);
    res.status(500).json({
      error: 'Failed to fetch company',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /showcase/companies/:id/view
 * Track view count for analytics
 */
router.post('/companies/:id/view', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Increment view count
    const { error } = await supabase.rpc('increment_showcase_views', {
      company_id: id,
    });

    if (error) {
      console.warn('Failed to track view:', error);
      // Don't fail the request if view tracking fails
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    // Don't fail - view tracking is non-critical
    res.json({ success: false });
  }
});

/**
 * POST /showcase/checkout
 * Create Stripe checkout session for claiming a company
 */
router.post('/checkout', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId, successUrl, cancelUrl } = req.body;
    const userId = req.user!.id;

    if (!companyId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const supabase = getSupabase();
    const stripe = getStripeInstance();

    if (!stripe) {
      res.status(500).json({ error: 'Payment system not configured' });
      return;
    }

    // Get showcase company
    const { data: company, error: companyError } = await supabase
      .from('showcase_companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Check if already claimed
    if (company.status !== 'available') {
      res.status(400).json({ error: 'Company is no longer available' });
      return;
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: company.name,
              description: `Claim ${company.name} - ${company.tier} tier business`,
              images: company.logo_url ? [company.logo_url] : [],
            },
            unit_amount: company.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'showcase_claim',
        user_id: userId,
        showcase_company_id: companyId,
      },
    });

    // Create pending claim record
    await supabase.from('showcase_claims').insert({
      showcase_company_id: companyId,
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_paid_cents: company.price_cents,
      status: 'pending',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create showcase checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;

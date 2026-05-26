import { Hono } from 'hono'
import type { Env } from '../index'
import Stripe from 'stripe'

const app = new Hono<{ Bindings: Env }>()

// Create checkout session
app.post('/create-checkout', async (c) => {
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const body = await c.req.json<{
      priceId: string
      userId: string
      successUrl: string
      cancelUrl: string
      mode: 'subscription' | 'payment'
      metadata?: Record<string, string>
    }>()

    const { priceId, userId, successUrl, cancelUrl, mode, metadata } = body

    if (!priceId || !userId || !successUrl || !cancelUrl) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Create or get Stripe customer
    // TODO: Check if user already has stripe_customer_id in database
    const customer = await stripe.customers.create({
      metadata: {
        user_id: userId,
      },
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: {
            user_id: userId,
          },
        },
      }),
    })

    return c.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      500
    )
  }
})

// Create customer portal session
app.post('/create-portal', async (c) => {
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const body = await c.req.json<{
      customerId: string
      returnUrl: string
    }>()

    const { customerId, returnUrl } = body

    if (!customerId || !returnUrl) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return c.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      500
    )
  }
})

// Get subscription details
app.get('/subscription/:subscriptionId', async (c) => {
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const subscriptionId = c.req.param('subscriptionId')

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    return c.json({
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subscription' },
      500
    )
  }
})

// Cancel subscription
app.post('/subscription/:subscriptionId/cancel', async (c) => {
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const subscriptionId = c.req.param('subscriptionId')

    // Cancel at period end (don't cancel immediately)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return c.json({
      success: true,
      cancel_at: subscription.current_period_end,
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      500
    )
  }
})

// Resume subscription
app.post('/subscription/:subscriptionId/resume', async (c) => {
  try {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const subscriptionId = c.req.param('subscriptionId')

    // Remove cancel_at_period_end flag
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return c.json({ success: true })
  } catch (error) {
    console.error('Error resuming subscription:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to resume subscription' },
      500
    )
  }
})

export default app

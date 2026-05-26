import { Hono } from 'hono'
import type { Env } from '../index'
import { getSupabase } from '../lib/supabase'
import Stripe from 'stripe'

const app = new Hono<{ Bindings: Env }>()

// Verify Stripe webhook signature
async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<Stripe.Event | null> {
  try {
    const _stripe = new Stripe(secret, { apiVersion: '2025-02-24.acacia' })
    // Note: Stripe's constructEvent needs the webhook secret, not the API key
    // In production, use stripe.webhooks.constructEvent
    // For now, we'll parse the event directly and verify manually
    const event = JSON.parse(payload) as Stripe.Event
    // TODO: Add proper signature verification
    return event
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return null
  }
}

// Handle subscription created
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  env: Env
) {
  const sb = getSupabase(env)

  const customerId = subscription.customer as string

  // Get user by stripe_customer_id
  const { data: profile } = await sb
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)

  // Get plan limits
  const limits = getPlanLimits(plan)

  // Insert subscription record
  await sb.from('subscriptions').insert({
    user_id: profile.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    plan,
    status: subscription.status,
    billing_cycle: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
    amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
    currency: subscription.currency.toUpperCase(),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    features: {},
    limits,
    cancel_at_period_end: subscription.cancel_at_period_end,
  })

  // Update profile
  await sb
    .from('profiles')
    .update({
      plan,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      monthly_company_limit: limits.companies,
    })
    .eq('id', profile.id)

  console.log('Subscription created:', subscription.id)
}

// Handle subscription updated
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  env: Env
) {
  const sb = getSupabase(env)

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)
  const limits = getPlanLimits(plan)

  // Update subscription record
  await sb
    .from('subscriptions')
    .update({
      status: subscription.status,
      plan,
      amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      limits,
    })
    .eq('stripe_subscription_id', subscription.id)

  // Update profile
  const { data: sub } = await sb
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (sub) {
    await sb
      .from('profiles')
      .update({
        plan,
        subscription_status: subscription.status,
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        monthly_company_limit: limits.companies,
      })
      .eq('id', sub.user_id)
  }

  console.log('Subscription updated:', subscription.id)
}

// Handle subscription deleted/canceled
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  env: Env
) {
  const sb = getSupabase(env)

  // Update subscription record
  await sb
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Update profile - revert to free plan
  const { data: sub } = await sb
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (sub) {
    await sb
      .from('profiles')
      .update({
        plan: 'free',
        subscription_status: null,
        subscription_id: null,
        subscription_ends_at: null,
        monthly_company_limit: 1,
      })
      .eq('id', sub.user_id)
  }

  console.log('Subscription deleted:', subscription.id)
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  env: Env
) {
  const sb = getSupabase(env)

  const customerId = invoice.customer as string

  // Get user
  const { data: profile } = await sb
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Get subscription ID
  let subscriptionId: string | null = null
  if (invoice.subscription) {
    const { data: sub } = await sb
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', invoice.subscription as string)
      .single()
    subscriptionId = sub?.id || null
  }

  // Insert/update invoice record
  await sb.from('invoices').upsert({
    user_id: profile.id,
    subscription_id: subscriptionId,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: customerId,
    invoice_number: invoice.number || null,
    amount_due: (invoice.amount_due || 0) / 100,
    amount_paid: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    status: invoice.status || 'draft',
    payment_intent_id: invoice.payment_intent as string || null,
    charge_id: invoice.charge as string || null,
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
    invoice_date: new Date(invoice.created * 1000).toISOString(),
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
    period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
    period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    invoice_pdf_url: invoice.invoice_pdf || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    line_items: invoice.lines.data.map(line => ({
      description: line.description,
      amount: line.amount / 100,
      quantity: line.quantity,
      period: line.period ? {
        start: new Date(line.period.start * 1000).toISOString(),
        end: new Date(line.period.end * 1000).toISOString(),
      } : null,
    })),
  }, {
    onConflict: 'stripe_invoice_id',
  })

  // If this is a subscription payment, add bonus credits
  if (subscriptionId) {
    const { data: sub } = await sb
      .from('subscriptions')
      .select('plan, limits')
      .eq('id', subscriptionId)
      .single()

    if (sub) {
      const limits = sub.limits as any
      const monthlyCredits = limits?.credits_per_month || 0

      if (monthlyCredits > 0) {
        // Get current balance
        const { data: currentProfile } = await sb
          .from('profiles')
          .select('credits_balance')
          .eq('id', profile.id)
          .single()

        const currentBalance = currentProfile?.credits_balance || 0
        const newBalance = currentBalance + monthlyCredits

        // Add credits transaction (DB trigger will update balance)
        await sb.from('credits_transactions').insert({
          user_id: profile.id,
          type: 'bonus',
          amount: monthlyCredits,
          balance_after: newBalance,
          description: `Monthly credits for ${sub.plan} plan`,
          stripe_payment_intent_id: invoice.payment_intent as string || null,
        })
      }
    }
  }

  console.log('Invoice payment succeeded:', invoice.id)
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  env: Env
) {
  const sb = getSupabase(env)

  const customerId = invoice.customer as string

  // Get user
  const { data: profile } = await sb
    .from('profiles')
    .select('id, email, name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Profile not found for customer:', customerId)
    return
  }

  // Update subscription status to past_due
  if (invoice.subscription) {
    await sb
      .from('profiles')
      .update({ subscription_status: 'past_due' })
      .eq('id', profile.id)
  }

  // TODO: Send email notification to user about failed payment
  console.log('Invoice payment failed:', invoice.id, 'for user:', profile.email)
}

// Handle payment intent succeeded (for wallet top-ups)
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  env: Env
) {
  const sb = getSupabase(env)

  const metadata = paymentIntent.metadata
  const userId = metadata?.userId
  const creditAmount = metadata?.creditAmount

  if (!userId || !creditAmount) {
    console.log('Payment intent without credit metadata (not a credit top-up)')
    return
  }

  console.log('Credit top-up payment succeeded:', paymentIntent.id, 'user:', userId, 'credits:', creditAmount)

  try {
    // Get current balance
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Failed to get user profile:', profileError)
      throw new Error(`Failed to get user profile: ${profileError?.message || 'user not found'}`)
    }

    const currentBalance = profile.credits || 0
    const creditsToAdd = parseInt(creditAmount, 10)
    const newBalance = currentBalance + creditsToAdd

    // Update balance
    const { error: updateError } = await sb
      .from('profiles')
      .update({ credits: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      throw new Error(`Failed to add credits: ${updateError.message}`)
    }

    // Log the transaction
    await sb.from('credit_transactions').insert({
      user_id: userId,
      amount: creditsToAdd,
      balance_after: newBalance,
      type: 'topup',
      description: 'Credit top-up via Stripe',
      stripe_payment_intent_id: paymentIntent.id,
    })

    console.log('Added credits to user:', userId, 'new balance:', newBalance)
  } catch (error) {
    console.error('Failed to add credits:', error)
    throw error
  }
}

// Handle checkout session completed
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  env: Env
) {
  const sb = getSupabase(env)

  // Check if this is a credits purchase
  if (session.metadata?.type === 'credits_purchase') {
    const userId = session.metadata.user_id
    const creditsAmount = parseInt(session.metadata.credits_amount || '0')
    const pricePaid = (session.amount_total || 0) / 100

    if (!userId || !creditsAmount) {
      console.error('Invalid credits purchase metadata')
      return
    }

    // Get current balance
    const { data: profile } = await sb
      .from('profiles')
      .select('credits_balance')
      .eq('id', userId)
      .single()

    if (!profile) {
      console.error('Profile not found:', userId)
      return
    }

    const newBalance = profile.credits_balance + creditsAmount

    // Add credits transaction
    await sb.from('credits_transactions').insert({
      user_id: userId,
      type: 'purchase',
      amount: creditsAmount,
      balance_after: newBalance,
      description: `Purchased ${creditsAmount} credits`,
      stripe_payment_intent_id: session.payment_intent as string || null,
      price_paid: pricePaid,
    })

    console.log('Credits purchased:', creditsAmount, 'for user:', userId)
  }
}

// Map Stripe price IDs to plans
function getPlanFromPriceId(priceId: string): 'starter' | 'growth' | 'scale' | 'enterprise' {
  // TODO: Update these with your actual Stripe price IDs
  const priceMap: Record<string, 'starter' | 'growth' | 'scale' | 'enterprise'> = {
    'price_starter_monthly': 'starter',
    'price_starter_yearly': 'starter',
    'price_growth_monthly': 'growth',
    'price_growth_yearly': 'growth',
    'price_scale_monthly': 'scale',
    'price_scale_yearly': 'scale',
    'price_enterprise': 'enterprise',
  }
  return priceMap[priceId] || 'starter'
}

// Get plan limits
function getPlanLimits(plan: string) {
  const limitsMap: Record<string, any> = {
    free: {
      companies: 1,
      team_members: 0,
      agents: 7,
      credits_per_month: 100,
      custom_domains: 0,
      api_access: false,
    },
    starter: {
      companies: 3,
      team_members: 1,
      agents: 21,
      credits_per_month: 1000,
      custom_domains: 1,
      api_access: true,
    },
    growth: {
      companies: 10,
      team_members: 5,
      agents: 70,
      credits_per_month: 5000,
      custom_domains: 5,
      api_access: true,
    },
    scale: {
      companies: 50,
      team_members: 20,
      agents: 350,
      credits_per_month: 20000,
      custom_domains: 25,
      api_access: true,
    },
    enterprise: {
      companies: -1, // unlimited
      team_members: -1,
      agents: -1,
      credits_per_month: 100000,
      custom_domains: -1,
      api_access: true,
    },
  }
  return limitsMap[plan] || limitsMap.free
}

// Main webhook handler
app.post('/', async (c) => {
  const signature = c.req.header('stripe-signature')
  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400)
  }

  const payload = await c.req.text()

  const event = await verifyStripeWebhook(
    payload,
    signature,
    c.env.STRIPE_WEBHOOK_SECRET
  )

  if (!event) {
    return c.json({ error: 'Invalid signature' }, 400)
  }

  console.log('Stripe webhook received:', event.type)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, c.env)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, c.env)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, c.env)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, c.env)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, c.env)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, c.env)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, c.env)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

export default app

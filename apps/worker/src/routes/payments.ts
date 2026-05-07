import { Hono } from 'hono'
import Stripe from 'stripe'
import type { Env } from '../index'
import { getPhone } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

function stripe(env: Env): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe not configured')
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })
}

const SUBSCRIPTION_PLAN_MAP: Record<string, string> = {
  nanowork_starter: 'starter',
  nanowork_growth: 'growth',
  nanowork_scale: 'scale',
}

function resolvePlan(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0]
  if (!item) return 'free'
  const price = item.price as Stripe.Price
  const metaPlan = (price.metadata as Record<string, string>)?.plan_tier
  if (metaPlan) return metaPlan
  const nickname = (price.nickname ?? '').toLowerCase()
  for (const [key, tier] of Object.entries(SUBSCRIPTION_PLAN_MAP)) {
    if (nickname.includes(key)) return tier
  }
  return 'starter'
}

app.post('/portal', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const { return_url = 'https://nanowork.app/dashboard/settings' } = await c.req.json<{ return_url?: string }>()
  const sb = getSupabase(c.env)
  const { data } = await sb.from('profiles').select('stripe_customer_id').eq('phone', phone).maybeSingle()
  if (!data?.stripe_customer_id) return c.json({ error: 'No Stripe customer found — subscribe first' }, 404)
  const s = stripe(c.env)
  const session = await s.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url })
  return c.json({ url: session.url })
})

app.post('/checkout', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const {
    price_id,
    success_url = 'https://nanowork.app/dashboard?subscribed=1',
    cancel_url = 'https://nanowork.app/dashboard/plan',
  } = await c.req.json<{ price_id: string; success_url?: string; cancel_url?: string }>()
  const sb = getSupabase(c.env)
  const { data: profile } = await sb.from('profiles').select('stripe_customer_id,email').eq('phone', phone).maybeSingle()
  const s = stripe(c.env)
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: price_id, quantity: 1 }],
    success_url, cancel_url,
    metadata: { user_phone: phone },
  }
  if (profile?.stripe_customer_id) params.customer = profile.stripe_customer_id
  else if (profile?.email) params.customer_email = profile.email
  const session = await s.checkout.sessions.create(params)
  return c.json({ checkout_url: session.url })
})

app.post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature') ?? ''
  const rawBody = await c.req.arrayBuffer()
  const s = stripe(c.env)
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET?.trim()

  let event: Stripe.Event
  if (webhookSecret) {
    try {
      event = await s.webhooks.constructEventAsync(Buffer.from(rawBody), sig, webhookSecret)
    } catch {
      return c.json({ error: 'Invalid signature' }, 400)
    }
  } else {
    event = JSON.parse(new TextDecoder().decode(rawBody)) as Stripe.Event
  }

  const sb = getSupabase(c.env)
  const data = event.data.object as unknown as Record<string, unknown>

  if (event.type === 'checkout.session.completed') {
    const phone = (data.metadata as Record<string, string>)?.user_phone
    const customerId = data.customer as string
    if (customerId && phone) {
      await sb.from('profiles').update({ stripe_customer_id: customerId }).eq('phone', phone)
    }
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const plan = sub.status === 'active' ? resolvePlan(sub) : 'free'
    if (sub.customer) {
      await sb.from('profiles').update({ plan }).eq('stripe_customer_id', sub.customer)
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    if (sub.customer) {
      await sb.from('profiles').update({ plan: 'free' }).eq('stripe_customer_id', sub.customer)
    }
  }

  return c.json({ received: true })
})

app.get('/invoices', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data } = await sb.from('profiles').select('stripe_customer_id').eq('phone', phone).maybeSingle()
  if (!data?.stripe_customer_id) return c.json({ data: [] })
  const s = stripe(c.env)
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 100)
  const invoices = await s.invoices.list({ customer: data.stripe_customer_id, limit })
  return c.json({
    data: invoices.data.map(inv => ({
      id: inv.id, amount_paid: inv.amount_paid, currency: inv.currency,
      status: inv.status, created: inv.created, invoice_pdf: inv.invoice_pdf,
    })),
  })
})

app.get('/balance', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data } = await sb.from('profiles').select('plan').eq('phone', phone).maybeSingle()
  if (!data) return c.json({ error: 'Profile not found' }, 404)
  return c.json({ plan: data.plan ?? 'free' })
})

export default app

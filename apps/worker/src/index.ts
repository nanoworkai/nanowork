import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'
import ai from './routes/ai'
import build from './routes/build'
import builds from './routes/builds'
import analytics from './routes/analytics'
import customers from './routes/customers'
import keys from './routes/keys'
import payments from './routes/payments'
import phone from './routes/phone'
import tenant from './routes/tenant'
import webhooks from './routes/webhooks'
import rent from './routes/rent'
import stripe from './routes/stripe'
import stripeWebhooks from './routes/stripe-webhooks'
import scraper from './routes/scraper'
import user from './routes/user'

export type Env = {
  ENVIRONMENT: string
  ANTHROPIC_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', timing())

app.use('*', cors({
  origin: [
    'https://nanowork.ai',
    'https://www.nanowork.ai',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  allowHeaders: ['Authorization', 'Content-Type', 'stripe-signature'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

app.route('/api/ai', ai)
app.route('/api/build', build)
app.route('/api/builds', builds)
app.route('/api/analytics', analytics)
app.route('/api/customers', customers)
app.route('/api/keys', keys)
app.route('/api/payments', payments)
app.route('/api/phone', phone)
app.route('/api/tenant', tenant)
app.route('/api/user', user)
app.route('/api/webhooks', webhooks)
app.route('/api/rent', rent)
app.route('/api/stripe', stripe)
app.route('/api/stripe/webhooks', stripeWebhooks)
app.route('/api/scraper', scraper)

app.get('/health', (c) => c.json({
  status: 'ok',
  environment: c.env.ENVIRONMENT,
  supabase_configured: !!c.env.SUPABASE_URL,
  anthropic_configured: !!c.env.ANTHROPIC_API_KEY,
  stripe_configured: !!c.env.STRIPE_SECRET_KEY,
}))

export default app

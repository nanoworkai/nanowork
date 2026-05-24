import { Hono } from 'hono'
import type { Env } from '../index'
import { getPhone, getUser } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data } = await sb.from('nano_tenants').select('*').eq('owner_phone', user.phone_number).maybeSingle()
  if (!data) return c.json({ error: 'Tenant not found' }, 404)
  return c.json(data)
})

app.patch('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const body = await c.req.json<{ name?: string; slug?: string }>()
  const updates = Object.fromEntries(Object.entries(body).filter(([, v]) => v != null))
  if (!Object.keys(updates).length) return c.json({ error: 'No fields to update' }, 400)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_tenants').update(updates).eq('owner_phone', user.phone_number).select().single()
  if (error) return c.json({ error: error.message }, 503)
  if (!data) return c.json({ error: 'Tenant not found' }, 404)
  return c.json(data)
})

app.get('/usage', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const now = new Date()
  const periods = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const { data } = await sb.from('linq_usage').select('*').eq('user_phone', phone).in('billing_period', periods).order('billing_period', { ascending: false })
  return c.json(data ?? [])
})

app.get('/plan', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data: tenant } = await sb.from('nano_tenants').select('linq_plan').eq('owner_phone', phone).maybeSingle()
  if (!tenant) return c.json({ error: 'Tenant not found' }, 404)
  const planName = tenant.linq_plan ?? 'free'
  const { data: limits } = await sb.from('linq_plan_limits').select('*').eq('plan', planName).maybeSingle()
  return c.json({ plan: planName, limits })
})

export default app

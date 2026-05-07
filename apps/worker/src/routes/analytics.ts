import { Hono } from 'hono'
import type { Env } from '../index'
import { getPhone, getUser } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

app.get('/builds', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await sb.from('linq_jobs').select('status,duration_ms').eq('user_phone', phone).gte('created_at', since)
  const jobs = data ?? []
  const total = jobs.length
  const complete = jobs.filter(j => j.status === 'complete').length
  const failed = jobs.filter(j => j.status === 'failed').length
  const durations = jobs.map(j => j.duration_ms).filter(Boolean) as number[]
  const avg_duration_ms = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null
  return c.json({ total, complete, failed, avg_duration_ms })
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

app.get('/revenue', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const phone = user.phone_number as string
  const { data: tenant } = await sb.from('nano_tenants').select('id,current_balance_cents').eq('owner_phone', phone).maybeSingle()
  if (!tenant) return c.json({ error: 'Tenant not found' }, 404)
  const { data: rows } = await sb.from('nano_ledger').select('type,amount_cents').eq('tenant_id', tenant.id)
  const ledger = rows ?? []
  const earned = ledger.filter(r => r.type === 'credit').reduce((a, r) => a + r.amount_cents, 0)
  const paid_out = ledger.filter(r => r.type === 'debit').reduce((a, r) => a + r.amount_cents, 0)
  return c.json({ total_earned: earned, total_paid_out: paid_out, current_balance: tenant.current_balance_cents ?? 0 })
})

export default app

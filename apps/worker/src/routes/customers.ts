import { Hono } from 'hono'
import type { Env } from '../index'
import { getUser } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

async function tenantId(user: Record<string, unknown>, env: Env): Promise<string | null> {
  const sb = getSupabase(env)
  const { data } = await sb.from('nano_tenants').select('id').eq('owner_phone', user.phone_number).maybeSingle()
  return data?.id ?? null
}

app.get('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 100)
  const offset = parseInt(c.req.query('offset') ?? '0')
  const sb = getSupabase(c.env)
  const { data } = await sb.from('nano_customers').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  return c.json({ data: data ?? [], limit, offset })
})

app.post('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const body = await c.req.json<Record<string, unknown>>()
  const payload = Object.fromEntries(Object.entries(body).filter(([, v]) => v != null))
  payload.tenant_id = tid
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_customers').insert(payload).select().single()
  if (error) return c.json({ error: error.message }, 503)
  return c.json(data)
})

app.get('/:id', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const sb = getSupabase(c.env)
  const { data } = await sb.from('nano_customers').select('*').eq('id', c.req.param('id')).eq('tenant_id', tid).maybeSingle()
  if (!data) return c.json({ error: 'Customer not found' }, 404)
  return c.json(data)
})

app.patch('/:id', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const body = await c.req.json<Record<string, unknown>>()
  const updates = Object.fromEntries(Object.entries(body).filter(([, v]) => v != null))
  if (!Object.keys(updates).length) return c.json({ error: 'No fields to update' }, 400)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_customers').update(updates).eq('id', c.req.param('id')).eq('tenant_id', tid).select().single()
  if (error) return c.json({ error: error.message }, 503)
  if (!data) return c.json({ error: 'Customer not found' }, 404)
  return c.json(data)
})

app.delete('/:id', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_customers').delete().eq('id', c.req.param('id')).eq('tenant_id', tid).select()
  if (error) return c.json({ error: error.message }, 503)
  if (!data?.length) return c.json({ error: 'Customer not found' }, 404)
  return c.json({ deleted: true })
})

export default app

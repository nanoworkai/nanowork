import { Hono } from 'hono'
import type { Env } from '../index'
import { getPhone } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const { prompt, phone_number } = await c.req.json<{ prompt: string; phone_number?: string }>()
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('linq_jobs').insert({
    user_phone: phone,
    prompt,
    ...(phone_number ? { phone_number } : {}),
    status: 'queued',
  }).select().single()
  if (error) return c.json({ error: error.message }, 503)
  return c.json({ build_id: data.id, status: data.status })
})

app.get('/', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 100)
  const offset = parseInt(c.req.query('offset') ?? '0')
  const sb = getSupabase(c.env)
  const { data, error } = await sb
    .from('linq_jobs')
    .select('*')
    .eq('user_phone', phone)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) return c.json({ error: error.message }, 503)
  return c.json(data)
})

app.get('/:id', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data, error } = await sb
    .from('linq_jobs')
    .select('*')
    .eq('id', c.req.param('id'))
    .eq('user_phone', phone)
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 503)
  if (!data) return c.json({ error: 'Build not found' }, 404)
  return c.json(data)
})

export default app

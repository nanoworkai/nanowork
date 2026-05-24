import { Hono } from 'hono'
import type { Env } from '../index'
import { getPhone } from '../middleware/auth'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

app.post('/', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const { name, scopes = [] } = await c.req.json<{ name: string; scopes?: string[] }>()
  const raw = `nw_live_${randomToken()}`
  const key_hash = await sha256hex(raw)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_api_keys').insert({
    user_phone: phone, name, key_hash, key_prefix: raw.slice(0, 12), scopes,
  }).select().single()
  if (error) return c.json({ error: error.message }, 503)
  return c.json({ ...data, key: raw })
})

app.get('/', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data } = await sb
    .from('nano_api_keys')
    .select('id,name,key_prefix,scopes,last_used_at,expires_at,is_active,created_at')
    .eq('user_phone', phone)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return c.json(data ?? [])
})

app.delete('/:id', async (c) => {
  let phone: string
  try { phone = await getPhone(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const sb = getSupabase(c.env)
  const { data, error } = await sb
    .from('nano_api_keys')
    .update({ is_active: false })
    .eq('id', c.req.param('id'))
    .eq('user_phone', phone)
    .select()
  if (error) return c.json({ error: error.message }, 503)
  if (!data?.length) return c.json({ error: 'Key not found' }, 404)
  return c.json({ revoked: true })
})

export default app

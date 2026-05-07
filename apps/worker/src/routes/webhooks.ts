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

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c))
}

app.get('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const sb = getSupabase(c.env)
  const { data } = await sb.from('nano_webhooks').select('id,url,events,is_active,last_fired_at,created_at').eq('tenant_id', tid)
  return c.json(data ?? [])
})

app.post('/', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const { url, events } = await c.req.json<{ url: string; events: string[] }>()
  const secret = randomSecret()
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_webhooks').insert({ tenant_id: tid, url, events, secret }).select().single()
  if (error) return c.json({ error: error.message }, 503)
  return c.json({ ...data, secret })
})

app.delete('/:id', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.from('nano_webhooks').delete().eq('id', c.req.param('id')).eq('tenant_id', tid).select()
  if (error) return c.json({ error: error.message }, 503)
  if (!data?.length) return c.json({ error: 'Webhook not found' }, 404)
  return c.json({ deleted: true })
})

app.post('/:id/test', async (c) => {
  let user: Record<string, unknown>
  try { user = await getUser(c) } catch (e) { return c.json({ error: String(e) }, 401) }
  const tid = await tenantId(user, c.env)
  if (!tid) return c.json({ error: 'Tenant not found' }, 404)
  const sb = getSupabase(c.env)
  const { data: wh } = await sb.from('nano_webhooks').select('*').eq('id', c.req.param('id')).eq('tenant_id', tid).maybeSingle()
  if (!wh) return c.json({ error: 'Webhook not found' }, 404)
  const payload = JSON.stringify({ event: 'test', data: { message: 'Test webhook from Nanowork' } })
  const sig = await hmacHex(wh.secret, payload)
  try {
    const resp = await fetch(wh.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Nanowork-Signature': sig },
      body: payload,
    })
    await sb.from('nano_webhooks').update({ last_fired_at: new Date().toISOString() }).eq('id', wh.id)
    return c.json({ delivered: resp.status < 400, status_code: resp.status })
  } catch (e) {
    return c.json({ delivered: false, error: String(e) })
  }
})

export default app

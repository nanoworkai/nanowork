import type { Context, Next } from 'hono'
import type { Env } from '../index'
import { getSupabase } from '../lib/supabase'

export async function getPhone(c: Context<{ Bindings: Env }>): Promise<string> {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) throw new Error('Missing token')
  const token = auth.slice(7)
  const sb = getSupabase(c.env)
  const { data, error } = await sb.auth.getUser(token)
  if (error || !data.user?.phone) throw new Error(error?.message ?? 'Invalid token')
  return data.user.phone
}

export async function getUser(c: Context<{ Bindings: Env }>): Promise<Record<string, unknown>> {
  const phone = await getPhone(c)
  const sb = getSupabase(c.env)
  const { data } = await sb.from('users').select('*').eq('phone_number', phone).single()
  if (!data) throw new Error('User not found')
  return data as Record<string, unknown>
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    const auth = c.req.header('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const token = auth.slice(7)
    const sb = getSupabase(c.env)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data.user) {
      return c.json({ error: 'Invalid token' }, 401)
    }
    await next()
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

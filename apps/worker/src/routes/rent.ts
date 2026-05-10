import { Hono } from 'hono'
import type { Env } from '../index'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

/**
 * Generate URL-safe slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * GET /api/rent
 * List all approved marketplace items with optional filtering
 */
app.get('/', async (c) => {
  const sb = getSupabase(c.env)

  const category = c.req.query('category')
  const status = c.req.query('status')
  const featured = c.req.query('featured')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100)
  const offset = parseInt(c.req.query('offset') ?? '0')

  let query = sb
    .from('rent_items')
    .select('*')
    .eq('approved', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (featured === 'true') {
    query = query.eq('featured', true)
  }

  const { data, error } = await query

  if (error) {
    return c.json({ error: error.message }, 503)
  }

  return c.json({
    data: data ?? [],
    limit,
    offset,
    total: data?.length ?? 0
  })
})

/**
 * GET /api/rent/:slug
 * Get single marketplace item by slug
 */
app.get('/:slug', async (c) => {
  const sb = getSupabase(c.env)
  const slug = c.req.param('slug')

  const { data, error } = await sb
    .from('rent_items')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .maybeSingle()

  if (error) {
    return c.json({ error: error.message }, 503)
  }

  if (!data) {
    return c.json({ error: 'Item not found' }, 404)
  }

  // Increment view count
  await sb
    .from('rent_items')
    .update({ view_count: data.view_count + 1 })
    .eq('id', data.id)

  return c.json(data)
})

/**
 * POST /api/rent
 * Create new marketplace item (authenticated users only)
 */
app.post('/', async (c) => {
  const sb = getSupabase(c.env)

  // Require authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization token' }, 401)
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await sb.auth.getUser(token)

  if (authError || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  try {
    const body = await c.req.json<{
      name: string
      tagline: string
      description: string
      category: string
      status?: string
      icon_emoji?: string
      price_preview?: string
      location?: string
      contact_email?: string
      contact_url?: string
    }>()

    // Validate required fields
    if (!body.name || !body.tagline || !body.description || !body.category) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Generate slug
    const slug = generateSlug(body.name)

    // Check for slug collision
    const { data: existing } = await sb
      .from('rent_items')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return c.json({ error: 'Item with this name already exists' }, 400)
    }

    // Create item
    const { data, error } = await sb
      .from('rent_items')
      .insert({
        user_id: user.id,
        name: body.name,
        slug,
        tagline: body.tagline,
        description: body.description,
        category: body.category,
        status: body.status ?? 'coming_soon',
        icon_emoji: body.icon_emoji,
        price_preview: body.price_preview,
        location: body.location,
        contact_email: body.contact_email,
        contact_url: body.contact_url,
        approved: false, // Requires admin approval
      })
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 503)
    }

    return c.json(data, 201)
  } catch (err) {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

/**
 * PATCH /api/rent/:id
 * Update marketplace item (owner only)
 */
app.patch('/:id', async (c) => {
  const sb = getSupabase(c.env)

  // Require authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization token' }, 401)
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await sb.auth.getUser(token)

  if (authError || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const id = c.req.param('id')

  // Check ownership
  const { data: item } = await sb
    .from('rent_items')
    .select('user_id')
    .eq('id', id)
    .maybeSingle()

  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  if (item.user_id !== user.id) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  try {
    const body = await c.req.json()

    // Filter out null/undefined values
    const updates = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v != null)
    )

    // If name is updated, regenerate slug
    if (updates.name) {
      updates.slug = generateSlug(updates.name as string)
    }

    // Don't allow users to approve their own items
    delete updates.approved
    delete updates.featured
    delete updates.user_id
    delete updates.id

    const { data, error } = await sb
      .from('rent_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 503)
    }

    return c.json(data)
  } catch (err) {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

/**
 * DELETE /api/rent/:id
 * Delete marketplace item (owner only)
 */
app.delete('/:id', async (c) => {
  const sb = getSupabase(c.env)

  // Require authentication
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization token' }, 401)
  }

  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await sb.auth.getUser(token)

  if (authError || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const id = c.req.param('id')

  // Check ownership
  const { data: item } = await sb
    .from('rent_items')
    .select('user_id')
    .eq('id', id)
    .maybeSingle()

  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  if (item.user_id !== user.id) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const { error } = await sb
    .from('rent_items')
    .delete()
    .eq('id', id)

  if (error) {
    return c.json({ error: error.message }, 503)
  }

  return c.json({ success: true })
})

/**
 * POST /api/rent/waitlist
 * Join the marketplace waitlist
 */
app.post('/waitlist', async (c) => {
  const sb = getSupabase(c.env)

  try {
    const body = await c.req.json<{
      email: string
      item_id?: string
      referrer?: string
    }>()

    // Validate email
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return c.json({ error: 'Valid email is required' }, 400)
    }

    // Optional: Check if item_id exists
    if (body.item_id) {
      const { data: item } = await sb
        .from('rent_items')
        .select('id')
        .eq('id', body.item_id)
        .maybeSingle()

      if (!item) {
        return c.json({ error: 'Invalid item_id' }, 400)
      }
    }

    // Attempt to get authenticated user (optional)
    const authHeader = c.req.header('Authorization')
    let userId = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await sb.auth.getUser(token)
      userId = user?.id ?? null
    }

    // Get user agent for tracking
    const userAgent = c.req.header('User-Agent') ?? null

    // Insert waitlist entry
    const { data, error } = await sb
      .from('rent_waitlist')
      .insert({
        email: body.email.toLowerCase().trim(),
        item_id: body.item_id ?? null,
        user_id: userId,
        referrer: body.referrer ?? null,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate entry gracefully
      if (error.code === '23505') {
        return c.json({
          message: 'You are already on the waitlist!',
          already_subscribed: true
        }, 200)
      }
      return c.json({ error: error.message }, 503)
    }

    return c.json({
      message: 'Successfully joined the waitlist!',
      data
    }, 201)

  } catch (err) {
    return c.json({
      error: 'Invalid request body'
    }, 400)
  }
})

/**
 * GET /api/rent/waitlist/check/:email
 * Check if email is on waitlist
 */
app.get('/waitlist/check/:email', async (c) => {
  const sb = getSupabase(c.env)
  const email = c.req.param('email').toLowerCase().trim()

  const { data } = await sb
    .from('rent_waitlist')
    .select('id, item_id, created_at')
    .eq('email', email)
    .limit(10)

  return c.json({
    on_waitlist: (data?.length ?? 0) > 0,
    entries: data ?? []
  })
})

export default app

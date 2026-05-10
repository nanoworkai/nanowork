import { Hono } from 'hono'
import type { Env } from '../index'
import { getSupabase } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

/**
 * GET /api/rent/:id/availability
 * Check availability for a resource
 */
app.get('/:id/availability', async (c) => {
  const sb = getSupabase(c.env)
  const itemId = c.req.param('id')
  const start = c.req.query('start') // ISO timestamp
  const durationHours = parseInt(c.req.query('duration_hours') ?? '1')

  if (!start) {
    return c.json({ error: 'start time is required' }, 400)
  }

  const startTime = new Date(start)
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)

  // Check for conflicts
  const { data: conflicts } = await sb
    .from('rent_bookings')
    .select('id')
    .eq('item_id', itemId)
    .in('status', ['confirmed', 'active'])
    .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`)

  const available = !conflicts || conflicts.length === 0

  return c.json({
    available,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_hours: durationHours,
    conflicts: conflicts?.length ?? 0
  })
})

/**
 * POST /api/rent/:id/book
 * Create a new booking
 */
app.post('/:id/book', async (c) => {
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
    const itemId = c.req.param('id')
    const body = await c.req.json<{
      date: string
      time: string
      duration_hours: number
      payment_method_id?: string
      notes?: string
    }>()

    // Parse start time
    const startTime = new Date(`${body.date}T${body.time}:00`)
    const endTime = new Date(startTime.getTime() + body.duration_hours * 60 * 60 * 1000)

    // Validate future booking
    if (startTime < new Date()) {
      return c.json({ error: 'Cannot book in the past' }, 400)
    }

    // Check availability
    const { data: conflicts } = await sb
      .from('rent_bookings')
      .select('id')
      .eq('item_id', itemId)
      .in('status', ['confirmed', 'active'])
      .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()}),and(start_time.gte.${startTime.toISOString()},end_time.lte.${endTime.toISOString()})`)

    if (conflicts && conflicts.length > 0) {
      return c.json({ error: 'Time slot not available' }, 409)
    }

    // Get item details for pricing
    const { data: item } = await sb
      .from('rent_items')
      .select('name, price_preview')
      .eq('id', itemId)
      .single()

    if (!item) {
      return c.json({ error: 'Item not found' }, 404)
    }

    // Calculate price (for now, placeholder - will integrate Stripe later)
    // Parse price_preview like "$2.50/hour" -> 250 cents/hour
    let amountCents = 5000 // Default $50
    if (item.price_preview) {
      const match = item.price_preview.match(/\$?([\d.]+)/);
      if (match) {
        const pricePerHour = parseFloat(match[1])
        amountCents = Math.round(pricePerHour * 100 * body.duration_hours)
      }
    }

    // Create Stripe Payment Intent (if configured)
    let paymentIntentId: string | null = null
    if (c.env.STRIPE_SECRET_KEY) {
      // TODO: Create Stripe Payment Intent
      // For now, we'll just create the booking in pending state
    }

    // Create booking
    const { data: booking, error } = await sb
      .from('rent_bookings')
      .insert({
        item_id: itemId,
        user_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_hours: body.duration_hours,
        amount_cents: amountCents,
        currency: 'usd',
        status: paymentIntentId ? 'pending' : 'confirmed',
        payment_status: paymentIntentId ? 'pending' : 'succeeded',
        stripe_payment_intent_id: paymentIntentId,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 503)
    }

    return c.json({
      ...booking,
      message: 'Booking created successfully'
    }, 201)

  } catch (err) {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

/**
 * GET /api/rent/bookings/:booking_id
 * Get booking details
 */
app.get('/bookings/:booking_id', async (c) => {
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

  const bookingId = c.req.param('booking_id')

  const { data: booking, error } = await sb
    .from('rent_bookings')
    .select(`
      *,
      item:rent_items(*)
    `)
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.json(booking)
})

/**
 * GET /api/rent/bookings/:booking_id/credentials
 * Get access credentials for active booking
 */
app.get('/bookings/:booking_id/credentials', async (c) => {
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

  const bookingId = c.req.param('booking_id')

  const { data: booking, error } = await sb
    .from('rent_bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  // Only provide credentials for confirmed or active bookings
  if (!['confirmed', 'active'].includes(booking.status)) {
    return c.json({ error: 'Booking not active' }, 403)
  }

  // Check if booking has started (within 15 minutes of start time)
  const now = new Date()
  const startTime = new Date(booking.start_time)
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000)

  if (now < fifteenMinutesBefore) {
    return c.json({
      error: 'Access not available yet',
      available_at: fifteenMinutesBefore.toISOString()
    }, 403)
  }

  // Generate or retrieve credentials
  // For now, return mock credentials - in production, generate real access tokens
  const credentials = booking.access_credentials || {
    username: `user-${booking.user_id.slice(0, 8)}`,
    password: `temp-${booking.id.slice(0, 8)}`,
    api_key: `nw_${booking.id}`,
    host: 'resource.nanowork.app',
    expires_at: booking.end_time
  }

  return c.json({
    booking_id: booking.id,
    credentials,
    access_url: booking.access_url,
    valid_until: booking.end_time
  })
})

/**
 * DELETE /api/rent/bookings/:booking_id
 * Cancel a booking
 */
app.delete('/bookings/:booking_id', async (c) => {
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

  const bookingId = c.req.param('booking_id')

  const { data: booking } = await sb
    .from('rent_bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  // Can only cancel pending or confirmed bookings
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return c.json({ error: 'Cannot cancel this booking' }, 400)
  }

  // Check cancellation policy (e.g., must cancel 24 hours before)
  const now = new Date()
  const startTime = new Date(booking.start_time)
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilStart < 24) {
    return c.json({
      error: 'Must cancel at least 24 hours before start time',
      refund_amount: 0
    }, 400)
  }

  // Update booking status
  const { error } = await sb
    .from('rent_bookings')
    .update({
      status: 'cancelled',
      cancelled_at: now.toISOString(),
      payment_status: 'refunded' // In production, process actual refund
    })
    .eq('id', bookingId)

  if (error) {
    return c.json({ error: error.message }, 503)
  }

  return c.json({
    success: true,
    message: 'Booking cancelled successfully',
    refund_amount_cents: booking.amount_cents
  })
})

/**
 * PATCH /api/rent/bookings/:booking_id/extend
 * Extend an active booking
 */
app.patch('/bookings/:booking_id/extend', async (c) => {
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
    const bookingId = c.req.param('booking_id')
    const body = await c.req.json<{ additional_hours: number }>()

    const { data: booking } = await sb
      .from('rent_bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    if (booking.status !== 'active') {
      return c.json({ error: 'Can only extend active bookings' }, 400)
    }

    const newEndTime = new Date(
      new Date(booking.end_time).getTime() + body.additional_hours * 60 * 60 * 1000
    )

    // Check for conflicts with extended time
    const { data: conflicts } = await sb
      .from('rent_bookings')
      .select('id')
      .eq('item_id', booking.item_id)
      .neq('id', bookingId)
      .in('status', ['confirmed', 'active'])
      .lte('start_time', newEndTime.toISOString())
      .gte('end_time', booking.end_time)

    if (conflicts && conflicts.length > 0) {
      return c.json({ error: 'Cannot extend - time slot not available' }, 409)
    }

    // Calculate additional cost
    const hourlyRate = booking.amount_cents / booking.duration_hours
    const additionalCost = Math.round(hourlyRate * body.additional_hours)

    // Update booking
    const { data: updated, error } = await sb
      .from('rent_bookings')
      .update({
        end_time: newEndTime.toISOString(),
        duration_hours: booking.duration_hours + body.additional_hours,
        amount_cents: booking.amount_cents + additionalCost
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 503)
    }

    return c.json({
      ...updated,
      additional_cost_cents: additionalCost,
      message: `Booking extended by ${body.additional_hours} hours`
    })

  } catch (err) {
    return c.json({ error: 'Invalid request body' }, 400)
  }
})

/**
 * GET /api/rent/bookings
 * List user's bookings
 */
app.get('/bookings', async (c) => {
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

  const status = c.req.query('status')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20'), 100)
  const offset = parseInt(c.req.query('offset') ?? '0')

  let query = sb
    .from('rent_bookings')
    .select(`
      *,
      item:rent_items(id, name, slug, icon_emoji, category)
    `)
    .eq('user_id', user.id)
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: bookings, error } = await query

  if (error) {
    return c.json({ error: error.message }, 503)
  }

  return c.json({
    data: bookings ?? [],
    limit,
    offset,
    total: bookings?.length ?? 0
  })
})

export default app

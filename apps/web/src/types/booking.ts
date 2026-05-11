export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'

export interface Booking {
  id: string
  item_id: string
  user_id: string
  start_time: string
  end_time: string
  duration_hours: number
  status: BookingStatus
  stripe_payment_intent_id?: string
  amount_cents: number
  currency: string
  payment_status: PaymentStatus
  access_credentials?: Record<string, any>
  access_url?: string
  notes?: string
  special_requests?: string
  created_at: string
  updated_at: string
  confirmed_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
}

export interface BookingWithItem extends Booking {
  item: {
    id: string
    name: string
    slug: string
    icon_emoji?: string
    category: string
  }
}

export interface BookingCredentials {
  booking_id: string
  credentials: {
    username?: string
    password?: string
    api_key?: string
    host?: string
    expires_at?: string
    [key: string]: any
  }
  access_url?: string
  valid_until: string
}

export interface AvailabilityResponse {
  available: boolean
  start_time: string
  end_time: string
  duration_hours: number
  conflicts: number
}

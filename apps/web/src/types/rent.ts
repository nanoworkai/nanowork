export type RentCategory =
  | 'lab_equipment'
  | 'compute'
  | 'stores'
  | 'human_services'

export type RentStatus =
  | 'coming_soon'
  | 'preview'
  | 'available'
  | 'waitlist_only'
  | 'unavailable'

export interface RentItem {
  id: string
  user_id: string
  name: string
  slug: string
  tagline: string
  description: string
  category: RentCategory
  status: RentStatus
  image_url?: string
  icon_emoji?: string
  mcp_config?: Record<string, any>
  price_preview?: string
  location?: string
  contact_email?: string
  contact_url?: string
  featured: boolean
  approved: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface WaitlistEntry {
  email: string
  item_id?: string
  referrer?: string
}

export interface WaitlistResponse {
  message: string
  already_subscribed?: boolean
  data?: {
    id: string
    email: string
    created_at: string
  }
}

import { createClient } from '@supabase/supabase-js'

const url     = import.meta.env.VITE_SUPABASE_URL     ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Debug: verify env vars are loading
console.log('[supabase] VITE_SUPABASE_URL:', url)
console.log('[supabase] Key configured:', !!anonKey)

export const isSupabaseConfigured = !!(url && anonKey)

export const supabase = createClient(
  url     || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  }
)

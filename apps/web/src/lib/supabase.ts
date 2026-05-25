import { createClient } from '@supabase/supabase-js'

// Use environment variables with safe fallbacks for development
const url     = import.meta.env?.VITE_SUPABASE_URL     || 'https://placeholder.supabase.co'
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Check if Supabase is properly configured (not using placeholders)
export const isSupabaseConfigured = !!(
  url &&
  anonKey &&
  url !== 'https://placeholder.supabase.co' &&
  anonKey !== 'placeholder-anon-key'
)

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn('[supabase] Not configured - using placeholder values. Authentication will not work.')
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
})

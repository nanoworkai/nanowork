import { supabase } from './supabase'

export interface UserApp {
  slug:           string
  app_name:       string | null
  storage_url:    string | null
  github_repo_url:string | null
  is_paid:        boolean
  deployed_at:    string | null
  iterations:     number
}

export async function fetchUserApps(): Promise<UserApp[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Find phone numbers linked to this auth user
  const { data: waitlist } = await supabase
    .from('nano_waitlist')
    .select('build_id')
    .eq('auth_id', user.id)

  if (!waitlist?.length) return []

  // Get project IDs from builds
  const buildIds = waitlist.map(w => w.build_id).filter(Boolean)

  // Fetch app schemas
  const { data: apps } = await supabase
    .from('nano_app_schemas')
    .select('slug, app_name, storage_url, github_repo_url, is_paid, deployed_at, iterations')
    .in('project_id', buildIds)
    .order('deployed_at', { ascending: false })

  return apps || []
}

export async function fetchAppBySlug(slug: string): Promise<UserApp | null> {
  const { data } = await supabase
    .from('nano_app_schemas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

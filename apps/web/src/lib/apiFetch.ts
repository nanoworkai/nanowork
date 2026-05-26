import { supabase } from './supabase';

/**
 * Authenticated API fetch utility
 * Automatically attaches Supabase auth token to all requests
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  // Build full URL - empty VITE_API_URL means use proxy/same origin
  const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = apiBase ? `${apiBase}${fullPath}` : fullPath;

  // Merge headers with auth token
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

import { supabase } from './supabase'

const API = import.meta.env.VITE_API_URL || ''

export interface ScrapeResult {
  url:           string
  title:         string
  description:   string
  headings:      string[]
  copy:          string
  color_palette: string[]
  tech_stack:    string[]
  scraped_at:    string
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${API}/scraper/scrape`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error(`Scrape failed: ${res.statusText}`)
  return res.json()
}

export async function scrapeCompetitors(industry: string): Promise<ScrapeResult[]> {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${API}/scraper/competitors`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify({ industry }),
  })
  if (!res.ok) throw new Error(`Competitor scrape failed: ${res.statusText}`)
  return res.json()
}

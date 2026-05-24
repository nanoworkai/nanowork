import { Hono } from 'hono'
import type { Env } from '../index'
import { createClient } from '@supabase/supabase-js'

const app = new Hono<{ Bindings: Env }>()

interface ScrapeResult {
  url: string
  title: string
  description: string
  headings: string[]
  copy: string
  color_palette: string[]
  tech_stack: string[]
  scraped_at: string
}

// POST /api/scraper/scrape - Scrape a single URL
app.post('/scrape', async (c) => {
  const { url } = await c.req.json<{ url: string }>()

  if (!url) {
    return c.json({ error: 'URL is required' }, 400)
  }

  try {
    // Basic scraping logic - in production, you'd call a scraper service
    // For now, return mock data structure
    const result: ScrapeResult = {
      url,
      title: 'Site Title',
      description: 'Site description extracted from meta tags',
      headings: ['Main Heading', 'Sub Heading'],
      copy: 'Body text extracted from the page',
      color_palette: ['#000000', '#FFFFFF', '#FF0000'],
      tech_stack: ['React', 'Next.js'],
      scraped_at: new Date().toISOString(),
    }

    // Save to cache table
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('linq_url_cache').upsert({
      url,
      scraped_data: result,
      scraped_at: result.scraped_at,
    })

    return c.json(result)
  } catch (error: any) {
    console.error('Scrape failed:', error)
    return c.json({ error: error.message }, 500)
  }
})

// POST /api/scraper/competitors - Get cached competitor scrapes
app.post('/competitors', async (c) => {
  const { industry } = await c.req.json<{ industry: string }>()

  if (!industry) {
    return c.json({ error: 'Industry is required' }, 400)
  }

  try {
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('linq_url_cache')
      .select('url, scraped_data, scraped_at')
      .ilike('scraped_data->>title', `%${industry}%`)
      .limit(5)

    if (error) throw error

    const results = data?.map(row => ({
      ...row.scraped_data,
      url: row.url,
      scraped_at: row.scraped_at,
    })) || []

    return c.json(results)
  } catch (error: any) {
    console.error('Competitor scrape failed:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default app

import { Hono } from 'hono'
import type { Env } from '../index'

type RegionCode = 'us' | 'ca' | 'uk' | 'au' | 'eu'

interface Region {
  code: RegionCode
  label: string
  allowed_countries: string[]
  line: { e164: string; display: string } | null
}

const REGIONS: Record<RegionCode, Region> = {
  us: { code: 'us', label: 'United States', allowed_countries: ['US'], line: { e164: '+16506740193', display: '(650) 674-0193' } },
  ca: { code: 'ca', label: 'Canada', allowed_countries: ['CA'], line: null },
  uk: { code: 'uk', label: 'United Kingdom', allowed_countries: ['GB'], line: null },
  au: { code: 'au', label: 'Australia', allowed_countries: ['AU'], line: null },
  eu: {
    code: 'eu', label: 'European Union',
    allowed_countries: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'],
    line: null,
  },
}

const VALID_CODES = new Set(Object.keys(REGIONS))

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
  const regions = Object.values(REGIONS).map(r => ({ code: r.code, label: r.label, available: r.line !== null }))
  return c.json({ regions })
})

app.post('/', async (c) => {
  const { region: regionCode } = await c.req.json<{ region?: string }>()
  const regions = Object.values(REGIONS).map(r => ({ code: r.code, label: r.label, available: r.line !== null }))

  if (!regionCode || !VALID_CODES.has(regionCode)) {
    return c.json({ status: 'invalid_region', regions }, 400)
  }

  const region = REGIONS[regionCode as RegionCode]
  // Cloudflare provides CF-IPCountry header
  const detected = c.req.header('CF-IPCountry')?.toUpperCase() ?? null
  const isDev = c.env.ENVIRONMENT === 'development'

  if (!region.line) {
    return c.json({ status: 'coming_soon', region: { code: region.code, label: region.label }, detectedCountry: detected })
  }

  const ipAllowed = detected == null ? isDev : region.allowed_countries.includes(detected)
  if (!ipAllowed) {
    return c.json({ status: 'region_mismatch', region: { code: region.code, label: region.label }, detectedCountry: detected })
  }

  return c.json({
    status: 'revealed',
    region: { code: region.code, label: region.label },
    detectedCountry: detected,
    number: { e164: region.line.e164, display: region.line.display, href: `sms:${region.line.e164}` },
  })
})

export default app

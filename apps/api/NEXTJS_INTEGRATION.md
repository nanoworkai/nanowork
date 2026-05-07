# Next.js Integration Guide

Base URL: `https://api.nanowork.app/api`  
All authenticated routes require either a Supabase session bearer token or an `X-API-Key` header.

---

## Auth: Supabase session token

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## Builds

```typescript
const API = 'https://api.nanowork.app/api'

// Trigger a build
const res = await fetch(`${API}/builds`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: 'Build a todo app' }),
})
const { build_id, status } = await res.json()

// Poll build status
const build = await fetch(`${API}/builds/${build_id}`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// List builds (paginated)
const { data } = await fetch(`${API}/builds?limit=20&offset=0`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())
```

---

## API Keys

```typescript
// Create a key — store the returned `key` field immediately, it is never shown again
const { key, id, key_prefix } = await fetch(`${API}/keys`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Production key', scopes: ['builds:write'] }),
}).then(r => r.json())

// List keys (prefix only, no hash)
const keys = await fetch(`${API}/keys`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Revoke a key
await fetch(`${API}/keys/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
})
```

---

## Using an API key directly (no session required)

```typescript
const customers = await fetch(`${API}/customers`, {
  headers: { 'X-API-Key': 'nw_live_xxxxx' },
}).then(r => r.json())
```

---

## Tenant

```typescript
// Get tenant
const tenant = await fetch(`${API}/tenant`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Update tenant
await fetch(`${API}/tenant`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Acme Corp', slug: 'acme' }),
})

// Usage (last 3 billing periods)
const usage = await fetch(`${API}/tenant/usage`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Plan + limits
const { plan, limits } = await fetch(`${API}/tenant/plan`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())
```

---

## Customers

```typescript
// List
const { data } = await fetch(`${API}/customers`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Create
const customer = await fetch(`${API}/customers`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Smith', email: 'jane@example.com' }),
}).then(r => r.json())

// Get / Update / Delete
await fetch(`${API}/customers/${customer.id}`, { method: 'GET',    headers: { 'Authorization': `Bearer ${token}` } })
await fetch(`${API}/customers/${customer.id}`, { method: 'PATCH',  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'new@example.com' }) })
await fetch(`${API}/customers/${customer.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
```

---

## Analytics

```typescript
// Build stats — last 30 days
const { total, complete, failed, avg_duration_ms } = await fetch(`${API}/analytics/builds`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Usage — last 3 billing periods
const usageRows = await fetch(`${API}/analytics/usage`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Revenue
const { total_earned, total_paid_out, current_balance } = await fetch(`${API}/analytics/revenue`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())
```

---

## Payments

```typescript
// Create Stripe checkout session
const { checkout_url } = await fetch(`${API}/payments/checkout`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price_id: 'price_xxx',
    success_url: 'https://nanowork.app/dashboard?upgraded=1',
    cancel_url: 'https://nanowork.app/pricing',
  }),
}).then(r => r.json())
window.location.href = checkout_url

// Invoices
const { data: invoices } = await fetch(`${API}/payments/invoices`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())

// Balance
const { current_balance_cents } = await fetch(`${API}/payments/balance`, {
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())
```

---

## Webhooks

```typescript
// Create — store the returned `secret` immediately, it is never shown again
const { id, secret } = await fetch(`${API}/webhooks`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://yourapp.com/hooks/nanowork', events: ['build.complete', 'build.failed'] }),
}).then(r => r.json())

// List / Delete
const hooks = await fetch(`${API}/webhooks`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
await fetch(`${API}/webhooks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })

// Test (sends a signed sample payload)
const { delivered, status_code } = await fetch(`${API}/webhooks/${id}/test`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
}).then(r => r.json())
```

### Verifying webhook signatures (receiver side)

```typescript
import crypto from 'crypto'

export function verifyNanoworkSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

// In your Next.js API route:
export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get('x-nanowork-signature') ?? ''
  if (!verifyNanoworkSignature(payload, sig, process.env.WEBHOOK_SECRET!)) {
    return new Response('Unauthorized', { status: 401 })
  }
  const event = JSON.parse(payload)
  // handle event.event ...
}
```

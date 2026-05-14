# Custom Domain API

This document describes the custom domain management API for Nanowork deployments.

## Overview

The domain API allows users to attach custom domains to their Cloudflare Pages deployments with:
- Stripe subscription billing
- Cloudflare domain configuration
- DNS verification
- Automatic cleanup on subscription cancellation

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  Cloudflare │
│             │      │   Express   │      │   Pages API │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Stripe    │
                     │   Payments  │
                     └─────────────┘
                            │
                            ▼ (webhooks)
                     ┌─────────────┐
                     │  Supabase   │
                     │  Database   │
                     └─────────────┘
```

## Environment Variables

Required in `.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CUSTOM_DOMAIN_PRICE_ID=price_...  # Stripe Price ID for custom domains

# Cloudflare
CF_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=...
```

## API Endpoints

### 1. Subscribe to Custom Domain

**POST** `/domains/subscribe`

Creates a Stripe subscription and reserves the custom domain.

**Request:**
```json
{
  "deploymentId": "uuid",
  "customDomain": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_xxx",
  "clientSecret": "pi_xxx_secret_yyy"
}
```

**Process:**
1. Validates domain format
2. Checks user owns the deployment
3. Creates Stripe subscription
4. Updates deployment with `domain_status: 'pending_payment'`
5. Returns client secret for frontend payment confirmation

---

### 2. Configure Domain with Cloudflare

**POST** `/domains/configure`

Adds the custom domain to Cloudflare Pages after payment confirmation.

**Request:**
```json
{
  "deploymentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "domain": "example.com",
  "status": "pending_dns",
  "dnsInstructions": {
    "type": "CNAME",
    "name": "example.com",
    "value": "nanowork-app.pages.dev",
    "ttl": 3600
  }
}
```

**Process:**
1. Calls Cloudflare API to add custom hostname
2. Updates deployment with `domain_status: 'pending_dns'`
3. Returns DNS instructions for the user

---

### 3. Verify DNS Configuration

**GET** `/domains/verify/:deploymentId`

Checks if DNS has been configured correctly and domain is active.

**Response:**
```json
{
  "verified": true,
  "status": "active",
  "cloudflareStatus": "active"
}
```

**Process:**
1. Queries Cloudflare API for domain status
2. If verified, updates deployment with `domain_verified: true` and `domain_status: 'active'`
3. Returns current verification state

---

### 4. Cancel Domain Subscription

**DELETE** `/domains/cancel/:deploymentId`

Cancels the Stripe subscription and removes the domain from Cloudflare.

**Response:**
```json
{
  "success": true,
  "message": "Domain subscription cancelled and domain removed"
}
```

**Process:**
1. Cancels Stripe subscription
2. Removes custom hostname from Cloudflare
3. Resets domain fields in deployment record

---

## Stripe Webhook Handler

**POST** `/webhooks/stripe`

Handles Stripe subscription lifecycle events.

### Supported Events

#### `customer.subscription.deleted`
- Removes custom domain from Cloudflare
- Resets deployment domain fields
- Ensures cleanup when subscription lapses

#### `customer.subscription.updated`
- Updates domain status based on subscription state
- Maps Stripe status to domain_status:
  - `active` → `pending_configuration` (if was pending_payment)
  - `past_due`, `canceled`, `unpaid` → `payment_failed`

**Setup:**
```bash
# Register webhook endpoint in Stripe Dashboard:
https://api.nanowork.com/webhooks/stripe

# Events to subscribe to:
- customer.subscription.deleted
- customer.subscription.updated
```

---

## Database Schema

### Deployments Table (Extended)

```sql
ALTER TABLE deployments ADD COLUMN
  custom_domain TEXT,
  domain_status TEXT CHECK (domain_status IN (
    'pending_payment',
    'pending_configuration',
    'pending_dns',
    'active',
    'payment_failed'
  )),
  domain_verified BOOLEAN DEFAULT FALSE,
  domain_subscription_id TEXT,
  cloudflare_project_name TEXT;
```

**Domain Status Flow:**
```
pending_payment → pending_configuration → pending_dns → active
                                                    ↓
                                            payment_failed
```

---

## Frontend Integration Example

```typescript
// 1. Subscribe to custom domain
const subscribeResult = await fetch('/api/domains/subscribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deploymentId: 'deployment-uuid',
    customDomain: 'example.com',
  }),
});

const { subscriptionId, clientSecret } = await subscribeResult.json();

// 2. Confirm payment with Stripe.js
const stripe = Stripe('pk_...');
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: 'https://app.nanowork.com/dashboard/domains',
  },
});

// 3. After payment confirmation, configure domain
const configureResult = await fetch('/api/domains/configure', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ deploymentId: 'deployment-uuid' }),
});

const { dnsInstructions } = await configureResult.json();

// 4. Show DNS instructions to user
// User adds CNAME record at their DNS provider

// 5. Poll verification status
const verifyResult = await fetch(`/api/domains/verify/${deploymentId}`, {
  headers: { 'Authorization': `Bearer ${userToken}` },
});

const { verified, status } = await verifyResult.json();
```

---

## Cloudflare API Reference

### Add Custom Hostname
```
POST /accounts/{account_id}/pages/projects/{project_name}/domains
{
  "name": "example.com"
}
```

### Check Domain Status
```
GET /accounts/{account_id}/pages/projects/{project_name}/domains/{domain}
```

### Remove Custom Hostname
```
DELETE /accounts/{account_id}/pages/projects/{project_name}/domains/{domain}
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message (development only)"
}
```

**Common Status Codes:**
- `400` - Bad request (invalid domain format, missing parameters)
- `401` - Unauthorized (missing/invalid auth token)
- `403` - Forbidden (user doesn't own deployment)
- `404` - Not found (deployment doesn't exist)
- `500` - Internal server error

---

## Testing

### Local Development
1. Use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```

2. Set webhook secret from CLI output:
   ```bash
   export STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. Test subscription creation:
   ```bash
   curl -X POST http://localhost:3000/domains/subscribe \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "deploymentId": "uuid",
       "customDomain": "test.com"
     }'
   ```

---

## Security Considerations

1. **Authentication**: All endpoints require valid Supabase JWT
2. **Authorization**: Deployment ownership verified before any operation
3. **Domain Validation**: Basic domain format validation to prevent invalid entries
4. **Webhook Verification**: Stripe signature verification for webhook authenticity
5. **RLS Policies**: Database-level security via Row Level Security

---

## Monitoring & Logs

Key log messages:
- `Subscription deleted:` - Track subscription cancellations
- `Removed domain from Cloudflare:` - Verify domain cleanup
- `Updated deployment status:` - Monitor status transitions
- `Cloudflare API error:` - Alert on infrastructure issues

---

## Future Enhancements

- [ ] Support for apex domains (A records)
- [ ] Automatic SSL certificate management
- [ ] Multi-domain support per deployment
- [ ] Domain transfer/migration tools
- [ ] Email notifications for DNS verification
- [ ] Automatic DNS verification retries
- [ ] Domain analytics and monitoring

# Stripe Billing Portal Setup Guide

Complete guide for implementing and configuring the Stripe Customer Billing Portal for subscription and payment management.

## Overview

Users can manage their billing, subscriptions, and payment methods through Stripe's hosted Customer Portal. This provides a secure, PCI-compliant way to handle sensitive payment information without building custom forms.

## Features

- ✅ Update payment method (credit card)
- ✅ View invoice history and download PDFs
- ✅ Change subscription plan
- ✅ Cancel subscription
- ✅ Automatic Stripe customer creation
- ✅ Webhook-driven plan synchronization
- ✅ No sensitive payment data handling on our servers

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Dashboard  │─────▶│   Backend   │─────▶│   Stripe    │
│  Settings   │      │     API     │      │   Portal    │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Supabase   │
                     │   Database  │
                     └─────────────┘
                            ▲
                            │ (webhooks)
                     ┌─────────────┐
                     │   Stripe    │
                     │  Webhooks   │
                     └─────────────┘
```

## Implementation

### Backend API

#### Endpoint: `POST /api/billing/portal`

Creates a Stripe Customer Portal session and returns the portal URL.

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "userId": "uuid" // Optional, will use authenticated user
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxx"
}
```

**Flow:**
1. Authenticates user via JWT
2. Looks up user's `stripe_customer_id` from `profiles` table
3. If no customer ID exists:
   - Creates new Stripe customer
   - Saves `stripe_customer_id` to profile
4. Creates Stripe billing portal session
5. Returns portal URL
6. Frontend redirects user to portal

**Error Handling:**
- `401` - Unauthorized (no valid token)
- `404` - User profile not found
- `400` - Missing required email for customer creation
- `500` - Stripe API error

---

#### Endpoint: `GET /api/billing/info`

Returns current billing information for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "plan": "starter",
  "subscriptionStatus": "active",
  "trialEndsAt": "2026-06-13T00:00:00Z",
  "subscriptionEndsAt": null,
  "hasStripeCustomer": true,
  "subscription": {
    "status": "active",
    "currentPeriodEnd": 1718236800,
    "cancelAtPeriodEnd": false,
    "cancelAt": null
  }
}
```

---

### Frontend Integration

**Location:** `/apps/web/src/dashboard/Settings.tsx`

**BillingSection Component Features:**
- Displays current plan name
- Shows subscription status
- "Manage Billing" button
- Loading state during portal creation
- Error handling with user-friendly messages
- List of portal features

**User Flow:**
1. User clicks "Manage Billing" button
2. Loading spinner shows
3. API call to `/api/billing/portal`
4. User redirected to Stripe portal
5. User updates payment method / views invoices
6. User clicks "Return to dashboard"
7. User lands back on `/dashboard/settings`

---

### Webhook Synchronization

**Location:** `/backend/src/routes/webhooks/stripe.ts`

#### Event: `customer.subscription.updated`

**Handles:**
- Plan changes (starter → growth, etc.)
- Status changes (active → past_due, etc.)
- Subscription renewals

**Updates:**
```typescript
profiles {
  plan: 'starter' | 'growth' | 'scale' | 'enterprise' | 'free',
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled',
  subscription_id: 'sub_xxx',
  updated_at: timestamp
}
```

#### Event: `customer.subscription.deleted`

**Handles:**
- Subscription cancellations
- Expired subscriptions

**Updates:**
```typescript
profiles {
  plan: 'free',
  subscription_status: null,
  subscription_id: null,
  subscription_ends_at: timestamp,
  updated_at: timestamp
}
```

---

## Stripe Dashboard Configuration

### Step 1: Enable Customer Portal

1. Go to **Stripe Dashboard → Settings → Billing → Customer Portal**
2. Click **"Activate test link"** (for test mode)
3. Click **"Activate live link"** (for production)

### Step 2: Configure Portal Settings

Navigate to **Settings → Billing → Customer Portal → Configuration**

#### Business Information
- **Business name:** Nanowork
- **Privacy policy:** https://nanowork.app/privacy
- **Terms of service:** https://nanowork.app/terms

#### Branding
- **Primary color:** Match your brand (e.g., `#FFFFFF`)
- **Logo:** Upload company logo
- **Icon:** Upload favicon

#### Customer Information
- ✅ Allow customers to update: **Email address**
- ✅ Show: **Billing address**
- ✅ Show: **Shipping address** (if needed)

#### Payment Method Updates
- ✅ Enable: **Update payment method**
- Default payment method: **Card**
- Additional methods: **Bank account** (optional)

#### Invoice History
- ✅ Enable: **View invoice history**
- ✅ Allow download: **Yes**

#### Subscriptions
- ✅ Enable: **Cancel subscriptions**
- Cancellation behavior: **Cancel at period end** (recommended)
- ✅ Show: **Pause subscription** (optional)
- ✅ Allow: **Switch plans** (if you have multiple)

#### Return URL
**Production:**
```
https://nanowork.app/dashboard/settings
```

**Development:**
```
http://localhost:5173/dashboard/settings
```

⚠️ **Important:** Must match exactly (including protocol)

---

### Step 3: Configure Webhooks

Navigate to **Developers → Webhooks → Add endpoint**

#### Production Endpoint
```
https://api.nanowork.app/api/webhooks/stripe
```

#### Events to Listen For
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.updated`

#### Webhook Signing Secret
Copy the signing secret and add to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Database Schema

### profiles Table

```sql
-- Stripe billing fields
stripe_customer_id TEXT,
plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise')),
subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),
subscription_id TEXT,
trial_ends_at TIMESTAMPTZ,
subscription_ends_at TIMESTAMPTZ,

-- Index for fast lookups
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
```

---

## Environment Variables

### Backend `.env`

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for development
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs (for plan mapping)
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_GROWTH=price_xxx
STRIPE_PRICE_SCALE=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx

# Frontend URL for return
FRONTEND_URL=https://nanowork.app  # or http://localhost:5173
```

### Frontend `.env`

```bash
VITE_API_URL=https://api.nanowork.app  # or http://localhost:3000
```

---

## Testing Checklist

### Manual Testing

- [ ] **Create new user**
  - User has no `stripe_customer_id` initially
  
- [ ] **Open billing portal (new customer)**
  - Click "Manage Billing" in settings
  - Verify loading state shows
  - Verify Stripe customer created automatically
  - Verify redirected to Stripe portal
  - Verify portal loads successfully
  
- [ ] **Update payment method**
  - Add test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - Verify card saves successfully
  
- [ ] **View invoice history**
  - Navigate to invoices tab
  - Verify invoices display
  - Download an invoice PDF
  
- [ ] **Return to dashboard**
  - Click "Return to [App Name]"
  - Verify redirected to `/dashboard/settings`
  
- [ ] **Subscription changes**
  - Cancel subscription in portal
  - Verify webhook updates plan to 'free'
  - Check database: `plan` should be 'free'
  
- [ ] **Error handling**
  - Test with expired/invalid token
  - Test with network error
  - Verify error messages display

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Expired: 4000 0000 0000 0069
```

### Webhook Testing

Use Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events:
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

---

## Security Considerations

### PCI Compliance

✅ **No sensitive payment data handled by our servers**
- Stripe portal handles all payment forms
- Card numbers never touch our database
- PCI compliance handled by Stripe

### Authentication

✅ **Portal session scoped to authenticated user**
- JWT validation required
- Cannot access another user's billing
- Portal sessions expire after 1 hour

### Webhook Security

✅ **Webhook signature verification**
- All webhooks verified with signing secret
- Protects against replay attacks
- Rejects unsigned requests

---

## Troubleshooting

### Portal not opening

1. **Check Stripe keys**
   - Verify `STRIPE_SECRET_KEY` is set
   - Test vs. live keys must match environment
   
2. **Check return URL**
   - Must be in Stripe portal configuration
   - Must match exactly (https vs http)
   
3. **Check browser console**
   - Look for JavaScript errors
   - Check network tab for API errors

### Customer not created

1. **Check user has email**
   - Email required for Stripe customer creation
   - Verify `profiles.email` is populated
   
2. **Check Stripe dashboard**
   - Look for customer in Customers section
   - Check API logs for errors

### Webhooks not working

1. **Check webhook endpoint is live**
   - Test with `curl` or Postman
   - Verify returns 200 OK
   
2. **Check signing secret**
   - Must match secret from Stripe dashboard
   - Different secrets for test/live mode
   
3. **Check Stripe webhook logs**
   - Dashboard → Developers → Webhooks
   - Click on webhook endpoint
   - View "Recent deliveries"

### Plan not syncing

1. **Check webhook handler**
   - Verify `customer.subscription.updated` is handled
   - Check server logs for errors
   
2. **Check price ID mapping**
   - Verify `STRIPE_PRICE_*` env vars are set
   - Price IDs must match Stripe products
   
3. **Manually trigger sync**
   - Use Stripe CLI: `stripe trigger customer.subscription.updated`
   - Check database after trigger

---

## Plan Name Mapping

Configure in `.env`:

```bash
# Map Stripe Price IDs to plan names
STRIPE_PRICE_STARTER=price_1ABC123...
STRIPE_PRICE_GROWTH=price_1DEF456...
STRIPE_PRICE_SCALE=price_1GHI789...
STRIPE_PRICE_ENTERPRISE=price_1JKL012...
```

Webhook handler uses these to determine which plan the user is on.

---

## Future Enhancements

- [ ] **Usage-based billing** - Track API usage, credit consumption
- [ ] **Proration handling** - Custom proration logic for plan changes
- [ ] **Multiple subscriptions** - Support multiple active subscriptions per user
- [ ] **Seat-based billing** - Team plans with per-seat pricing
- [ ] **Metered billing** - Bill based on actual usage metrics
- [ ] **Tax calculation** - Automatic tax calculation via Stripe Tax
- [ ] **Localized pricing** - Different pricing by country
- [ ] **Annual billing discount** - Offer discount for annual commitment
- [ ] **Referral credits** - Billing credits for referrals
- [ ] **Custom billing intervals** - Quarterly, semi-annual billing

---

## Support

For issues:
- Check Stripe Dashboard logs (Developers → Events)
- Review webhook delivery attempts
- Check server logs for errors
- Test with Stripe CLI locally

**Stripe Support:**
- Documentation: https://stripe.com/docs/billing/subscriptions/customer-portal
- Support: https://support.stripe.com

---

**Last Updated:** 2026-05-13  
**Version:** 1.0  
**Author:** Nanowork Team

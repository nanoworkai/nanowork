# Stripe Billing Integration Setup Guide

This guide explains how the Stripe subscription billing system works and how to set it up.

## Overview

The billing system integrates Stripe subscriptions with the Nanowork platform to handle:
- Plan upgrades/downgrades (Free → Starter → Growth → Scale)
- Subscription lifecycle management
- Payment processing
- Webhook synchronization

## Architecture

```
User clicks "Upgrade" → Frontend creates subscription → Stripe processes payment
                                                        ↓
Database ← Webhook sync ← Stripe sends events ← Payment confirmed
```

### Components

1. **Backend API** (`/backend/src/routes/billing.ts`):
   - `POST /billing/subscriptions` - Create new subscription
   - `PATCH /billing/subscriptions/:id` - Modify/cancel subscription
   - `GET /billing/info` - Get billing information
   - `POST /billing/portal` - Open Stripe customer portal

2. **Webhook Handler** (`/backend/src/routes/wallet.ts`):
   - `POST /wallet/webhook` - Receives events from Stripe
   - Syncs subscription status to database
   - Handles payment success/failure

3. **Frontend** (`/apps/web/src/dashboard/Settings.tsx`):
   - Plan selection UI
   - Payment form (Stripe Elements)
   - Subscription management

4. **Database**:
   - `profiles` table - User subscription status
   - `subscriptions` table - Detailed subscription records

## Database Schema

### profiles table
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
```

### subscriptions table
Already exists via migration `005_subscriptions.sql`.

## Setup Instructions

### 1. Stripe Dashboard Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Create account and verify email
   - Switch to "Test Mode" (toggle in top right)

2. **Get API Keys**
   - Navigate to: Developers → API keys
   - Copy both keys:
     - Publishable key: `pk_test_...`
     - Secret key: `sk_test_...`

3. **Create Products**
   
   Navigate to: Products → Add Product
   
   Create these 4 products with **recurring** pricing:

   **Starter Plan**
   - Name: `Starter`
   - Price: `$99.00 USD` per `month`
   - Billing period: `Monthly`
   - Copy the price ID: `price_...`

   **Growth Plan**
   - Name: `Growth`
   - Price: `$249.00 USD` per `month`
   - Copy the price ID: `price_...`

   **Scale Plan**
   - Name: `Scale`
   - Price: `$499.00 USD` per `month`
   - Copy the price ID: `price_...`

   **Enterprise Plan**
   - Name: `Enterprise`
   - Price: Custom (or `$999.00 USD` per `month`)
   - Copy the price ID: `price_...`

4. **Setup Webhooks**

   Navigate to: Developers → Webhooks → Add endpoint

   - **Endpoint URL**: `https://your-domain.com/api/wallet/webhook`
   - **Events to listen to**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   
   After creating the endpoint:
   - Copy the **Signing secret**: `whsec_...`

### 2. Environment Variables

Add these to your `.env` file (see `.env.example`):

```bash
# Backend
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_STARTER=price_...
VITE_STRIPE_PRICE_GROWTH=price_...
VITE_STRIPE_PRICE_SCALE=price_...
VITE_STRIPE_PRICE_ENTERPRISE=price_...
```

### 3. Local Testing with Stripe CLI (Optional)

For local development, use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Linux:
# Download from https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:3000/api/wallet/webhook

# This will output a webhook signing secret (whsec_...)
# Use this secret for STRIPE_WEBHOOK_SECRET in local development
```

## User Flow

### Upgrade Flow

1. User navigates to Settings → Plan tab
2. User clicks "Switch to Starter" (or other plan)
3. Confirmation modal appears
4. User clicks "Confirm"
5. Frontend calls `POST /billing/subscriptions`:
   - Creates Stripe customer (if not exists)
   - Creates subscription with price ID
   - Returns `clientSecret` for payment
6. Payment modal appears with Stripe Elements
7. User enters card details
8. Frontend confirms payment with Stripe
9. Stripe sends webhook to backend
10. Backend syncs subscription to database
11. User profile updated with new plan

### Downgrade Flow

1. User clicks "Switch to Free"
2. Confirmation modal warns about cancellation
3. User confirms
4. Frontend calls `PATCH /billing/subscriptions/:id`:
   - Sets `cancel_at_period_end: true`
   - User keeps access until period ends
5. At period end, Stripe sends `customer.subscription.deleted`
6. Backend downgrades user to free plan

## Testing

### Test Cards

Use these test cards in Test Mode:

| Card Number         | Description                    |
|---------------------|--------------------------------|
| 4242 4242 4242 4242 | Successful payment            |
| 4000 0000 0000 0002 | Card declined                 |
| 4000 0000 0000 9995 | Insufficient funds            |
| 4000 0025 0000 3155 | Requires authentication (3DS) |

Any future expiry (e.g., `12/34`), any CVC (e.g., `123`), any ZIP.

### Test Webhooks

Use Stripe CLI to trigger test webhooks:

```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test subscription canceled
stripe trigger customer.subscription.deleted
```

### Manual Testing Checklist

- [ ] Create new user account
- [ ] Verify user starts on Free plan
- [ ] Upgrade to Starter plan
  - [ ] Payment modal appears
  - [ ] Enter test card
  - [ ] Payment succeeds
  - [ ] Profile updated to Starter
  - [ ] Database shows subscription record
- [ ] Upgrade to Growth plan
  - [ ] Proration calculated correctly
  - [ ] Subscription updated
- [ ] Downgrade to Free
  - [ ] Subscription marked for cancellation
  - [ ] Access continues until period end
- [ ] Failed payment
  - [ ] User marked as `past_due`
  - [ ] Retry logic works

## Webhook Events

The system handles these Stripe events:

### `customer.subscription.created`
- New subscription started
- Updates user plan in database
- Creates record in `subscriptions` table

### `customer.subscription.updated`
- Plan changed
- Payment method updated
- Updates subscription status

### `customer.subscription.deleted`
- Subscription canceled or expired
- Downgrades user to free plan
- Marks subscription as ended

### `invoice.payment_succeeded`
- Payment completed successfully
- For credit purchases: adds credits
- For subscriptions: logs successful payment

### `invoice.payment_failed`
- Payment failed or declined
- Marks subscription as `past_due`
- Triggers retry logic (handled by Stripe)

## Production Deployment

### 1. Switch to Live Mode

- In Stripe Dashboard, toggle from "Test Mode" to "Live Mode"
- Create live products/prices (same as test)
- Get live API keys
- Create live webhook endpoint

### 2. Update Environment Variables

```bash
# Use live keys (start with sk_live_ and pk_live_)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Use live webhook secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Use live price IDs
STRIPE_PRICE_STARTER=price_live_...
# ... etc
```

### 3. Webhook Endpoint

Make sure your webhook endpoint is:
- Accessible over HTTPS
- Has fast response time (<5 seconds)
- Returns 200 status code
- Validates webhook signature

### 4. Monitoring

Monitor these in Stripe Dashboard:

- **Dashboard > Payments**: Track successful payments
- **Dashboard > Subscriptions**: Track active subs
- **Developers > Webhooks**: Monitor webhook delivery
- **Developers > Logs**: Debug API errors

### 5. Security

- [ ] Webhook signature validation enabled
- [ ] API keys stored in environment variables
- [ ] Frontend validates subscription status
- [ ] Backend verifies user owns subscription
- [ ] Rate limiting on API endpoints

## Troubleshooting

### Webhook not receiving events

1. Check webhook endpoint is accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard > Webhooks for delivery attempts
4. Use Stripe CLI to test locally

### Payment fails but user upgraded

- Check webhook delivery
- Verify `syncSubscriptionToDatabase` is working
- Check database logs

### User can switch plans without payment

- **THIS IS THE BUG WE'RE FIXING!**
- Old Settings.tsx directly updated profile
- Now it creates Stripe subscription first
- User must complete payment before upgrade

### Subscription status not syncing

1. Check webhook events are enabled
2. Verify webhook signature validation
3. Check backend logs for errors
4. Manually trigger webhook with Stripe CLI

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Discord: #billing-help

## Migration Notes

If you have existing users on paid plans without Stripe subscriptions:

1. Create Stripe customers for them
2. Create subscriptions with `billing_cycle_anchor` to match their current period
3. Set `trial_end` to their next billing date to avoid immediate charge
4. Update `stripe_customer_id` and `subscription_id` in profiles table

Example migration script:

```typescript
// Migrate existing paid users to Stripe
for (const user of paidUsers) {
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id }
  });
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceIds[user.plan] }],
    trial_end: Math.floor(user.next_billing_date.getTime() / 1000),
  });
  
  await updateUserStripeIds(user.id, customer.id, subscription.id);
}
```

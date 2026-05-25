# Stripe Subscription Integration - Testing Checklist

## Pre-Testing Setup

### 1. Stripe Configuration
- [ ] Stripe account created
- [ ] Test mode enabled
- [ ] Products created (Starter, Growth, Scale, Enterprise)
- [ ] Price IDs copied
- [ ] Webhook endpoint created at `/api/webhooks/stripe`
- [ ] Webhook events configured:
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Webhook signing secret copied

### 2. Environment Variables
- [ ] Backend `.env` configured:
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] STRIPE_PRICE_STARTER
  - [ ] STRIPE_PRICE_GROWTH
  - [ ] STRIPE_PRICE_SCALE
  - [ ] STRIPE_PRICE_ENTERPRISE
- [ ] Frontend `.env` configured:
  - [ ] VITE_STRIPE_PUBLISHABLE_KEY
  - [ ] VITE_STRIPE_PRICE_STARTER
  - [ ] VITE_STRIPE_PRICE_GROWTH
  - [ ] VITE_STRIPE_PRICE_SCALE
  - [ ] VITE_STRIPE_PRICE_ENTERPRISE

### 3. Database Schema
- [ ] Migration `001_profiles_v2.sql` applied
- [ ] Migration `005_subscriptions.sql` applied
- [ ] Profiles table has subscription columns
- [ ] Subscriptions table exists

### 4. Local Testing Setup
- [ ] Stripe CLI installed (optional)
- [ ] Webhook forwarding configured (if using CLI)
- [ ] Backend server running on port 3000
- [ ] Frontend dev server running on port 5173

## Functional Tests

### Test 1: Free Plan (Initial State)
**Steps:**
1. Create new user account
2. Navigate to Settings → Plan tab
3. Verify current plan shows "Free"

**Expected:**
- [ ] User starts on Free plan
- [ ] Current plan badge shows "Current"
- [ ] Other plans show "Switch to [Plan]" button
- [ ] No Stripe customer ID in database yet

### Test 2: Upgrade to Starter (Success)
**Steps:**
1. As Free user, click "Switch to Starter"
2. Confirm in modal
3. Payment modal appears
4. Enter test card: `4242 4242 4242 4242`
5. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
6. Click "Pay $99"

**Expected:**
- [ ] Confirmation modal shows correct plan and price
- [ ] Payment modal displays Stripe Elements card form
- [ ] "Processing..." state shows during payment
- [ ] Payment succeeds
- [ ] Success message appears
- [ ] Profile updates to Starter plan
- [ ] Settings page shows Starter as current plan
- [ ] Stripe Dashboard shows new subscription
- [ ] Database `profiles.plan` = 'starter'
- [ ] Database `profiles.subscription_id` set
- [ ] Database `profiles.stripe_customer_id` set
- [ ] Database `subscriptions` table has new row
- [ ] Webhook delivered successfully in Stripe

### Test 3: Upgrade to Growth (Proration)
**Steps:**
1. As Starter user, click "Switch to Growth"
2. Confirm upgrade
3. Enter test card (if needed)

**Expected:**
- [ ] Proration calculated correctly
- [ ] Subscription upgraded immediately
- [ ] Profile updates to Growth plan
- [ ] Stripe Dashboard shows updated subscription
- [ ] Invoice created with proration credit/charge
- [ ] Database updated to Growth plan

### Test 4: Payment Declined
**Steps:**
1. As Free user, click "Switch to Starter"
2. Enter declined card: `4000 0000 0000 0002`
3. Try to complete payment

**Expected:**
- [ ] Payment fails with error message
- [ ] User stays on Free plan
- [ ] No subscription created in Stripe
- [ ] No database updates
- [ ] User can retry with different card

### Test 5: Payment Requires Authentication (3DS)
**Steps:**
1. As Free user, click "Switch to Starter"
2. Enter 3DS test card: `4000 0025 0000 3155`
3. Complete authentication challenge

**Expected:**
- [ ] 3D Secure modal appears
- [ ] Authentication flow works
- [ ] Payment succeeds after auth
- [ ] Subscription created
- [ ] User upgraded to Starter

### Test 6: Downgrade to Free
**Steps:**
1. As paid user, click "Switch to Free"
2. Read cancellation warning
3. Confirm downgrade

**Expected:**
- [ ] Warning explains cancellation at period end
- [ ] Subscription marked for cancellation
- [ ] User keeps access until period end
- [ ] Stripe shows `cancel_at_period_end: true`
- [ ] At period end (simulate or wait):
  - [ ] Webhook fires
  - [ ] User downgraded to Free
  - [ ] Database updated

### Test 7: Existing Subscription Error
**Steps:**
1. As user with active Starter subscription
2. Try to create new subscription via API

**Expected:**
- [ ] Error returned: "User already has active subscription"
- [ ] No duplicate subscription created
- [ ] Must modify or cancel existing first

### Test 8: Webhook Signature Validation
**Steps:**
1. Send POST to `/api/webhooks/stripe` without signature
2. Send POST with invalid signature

**Expected:**
- [ ] Request rejected with 400 error
- [ ] "Missing signature" or "Invalid signature" error
- [ ] No database updates occur

### Test 9: Webhook Event Processing
**Steps:**
1. Use Stripe CLI to trigger events:
   ```bash
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_succeeded
   stripe trigger customer.subscription.deleted
   ```

**Expected:**
- [ ] Each event processed successfully
- [ ] Database synced correctly
- [ ] Console logs show event handling
- [ ] Webhook returns 200 status

### Test 10: Failed Payment Retry
**Steps:**
1. Simulate failed payment for active subscription
2. Update payment method in Stripe
3. Retry payment

**Expected:**
- [ ] Subscription marked as `past_due`
- [ ] Database `subscription_status` = 'past_due'
- [ ] After successful retry:
  - [ ] Status back to 'active'
  - [ ] Database updated

## API Endpoint Tests

### POST /api/billing/subscriptions
**Test: Create subscription**
```bash
curl -X POST http://localhost:3000/api/billing/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_...",
    "plan": "starter"
  }'
```

**Expected:**
- [ ] 200 status code
- [ ] Returns `subscriptionId` and `clientSecret`
- [ ] Stripe customer created if not exists
- [ ] Subscription created in Stripe

**Test: Missing fields**
```bash
curl -X POST http://localhost:3000/api/billing/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:**
- [ ] 400 status code
- [ ] Error: "Missing required fields"

**Test: No authentication**
```bash
curl -X POST http://localhost:3000/api/billing/subscriptions \
  -H "Content-Type: application/json"
```

**Expected:**
- [ ] 401 status code
- [ ] Error: "Unauthorized"

### PATCH /api/billing/subscriptions/:id
**Test: Cancel subscription**
```bash
curl -X PATCH http://localhost:3000/api/billing/subscriptions/sub_... \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cancel"
  }'
```

**Expected:**
- [ ] 200 status code
- [ ] Subscription marked for cancellation
- [ ] Returns `cancelAt` timestamp

**Test: Upgrade subscription**
```bash
curl -X PATCH http://localhost:3000/api/billing/subscriptions/sub_... \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upgrade",
    "newPriceId": "price_...",
    "newPlan": "growth"
  }'
```

**Expected:**
- [ ] 200 status code
- [ ] Subscription updated with new price
- [ ] Proration invoice created

**Test: Wrong subscription owner**
```bash
# Try to modify another user's subscription
```

**Expected:**
- [ ] 403 status code
- [ ] Error: "Subscription does not belong to user"

### GET /api/billing/info
**Test: Get billing info**
```bash
curl http://localhost:3000/api/billing/info \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- [ ] 200 status code
- [ ] Returns user plan and subscription status
- [ ] Shows trial/subscription end dates
- [ ] Shows Stripe subscription details

## Edge Cases

### Edge Case 1: User Deletes Account with Active Subscription
**Test:**
1. User has active Starter subscription
2. User deletes account

**Expected:**
- [ ] Account deletion endpoint cancels subscription
- [ ] Stripe customer deleted or subscription canceled
- [ ] No orphaned subscriptions

### Edge Case 2: Multiple Concurrent Upgrade Requests
**Test:**
1. User clicks upgrade multiple times rapidly
2. Check for duplicate subscriptions

**Expected:**
- [ ] Only one subscription created
- [ ] Duplicate requests return error or idempotent result
- [ ] No double charges

### Edge Case 3: Webhook Delivery Failure
**Test:**
1. Webhook endpoint temporarily down
2. Stripe retries webhook delivery

**Expected:**
- [ ] Stripe retries with exponential backoff
- [ ] Eventually succeeds
- [ ] Database synced once webhook processed
- [ ] No data loss

### Edge Case 4: Plan Change During Trial
**Test:**
1. User on trial subscription
2. User changes plan

**Expected:**
- [ ] Plan change allowed
- [ ] Trial preserved or adjusted
- [ ] Correct billing at trial end

## Performance Tests

### Load Test: Concurrent Subscriptions
**Test:** Simulate 10 concurrent users upgrading

**Expected:**
- [ ] All subscriptions created successfully
- [ ] No race conditions
- [ ] Database consistency maintained

### Load Test: Webhook Burst
**Test:** Send 100 webhook events rapidly

**Expected:**
- [ ] All events processed
- [ ] No events lost
- [ ] Response times < 5 seconds
- [ ] Database handles concurrent updates

## Security Tests

### Security Test 1: Unauthorized Access
**Test:** Try to access endpoints without auth token

**Expected:**
- [ ] All endpoints return 401 Unauthorized
- [ ] No data exposed

### Security Test 2: Webhook Replay Attack
**Test:** Replay valid webhook event

**Expected:**
- [ ] Stripe signature validation prevents replay
- [ ] Or idempotent processing prevents duplicate effects

### Security Test 3: Price Manipulation
**Test:** Try to modify price in request payload

**Expected:**
- [ ] Price comes from backend config, not client
- [ ] User charged correct amount
- [ ] No price manipulation possible

## Production Readiness

- [ ] All functional tests passing
- [ ] All API tests passing
- [ ] All edge cases handled
- [ ] Security tests passing
- [ ] Documentation complete
- [ ] Error handling robust
- [ ] Logging comprehensive
- [ ] Monitoring configured
- [ ] Alerting set up for failed webhooks
- [ ] Stripe live mode configured
- [ ] Production webhook endpoint secured with HTTPS
- [ ] Rate limiting enabled

## Rollback Plan

If critical issues found:
1. [ ] Disable subscription creation endpoint
2. [ ] Keep webhook processing active (for existing subs)
3. [ ] Revert frontend changes (hide upgrade buttons)
4. [ ] Investigate and fix issues
5. [ ] Re-test thoroughly before re-enabling

## Sign-off

- [ ] Developer tested
- [ ] QA tested
- [ ] Product owner approved
- [ ] Security reviewed
- [ ] Ready for production deployment

---

**Notes:**
- Use Stripe test mode for all testing
- Never commit real API keys
- Test thoroughly before going live
- Monitor Stripe Dashboard during testing
- Keep webhook logs for debugging

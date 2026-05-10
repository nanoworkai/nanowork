# Nanowork Implementation TODO

## 🔴 Critical - Do First

- [ ] **Apply database schema to Supabase**
  - Open Supabase SQL Editor
  - Copy SQL from `supabase/TABLES_v2.md`
  - Paste and run
  - Verify all 18 tables created

- [ ] **Configure Stripe**
  - Create products in Stripe Dashboard
    - [ ] Starter Plan (monthly/yearly)
    - [ ] Growth Plan (monthly/yearly)
    - [ ] Scale Plan (monthly/yearly)
    - [ ] Credits packages (1K, 5K, 20K)
  - Copy price IDs to `apps/web/src/lib/stripe.ts`
  - Add webhook endpoint: `https://api.nanowork.app/api/stripe/webhooks`
  - Copy webhook signing secret

- [ ] **Set environment variables**
  ```bash
  # Web app (.env.local)
  VITE_STRIPE_PUBLISHABLE_KEY=pk_...
  VITE_API_URL=https://api.nanowork.app
  
  # Worker (Cloudflare)
  npx wrangler secret put STRIPE_SECRET_KEY
  npx wrangler secret put STRIPE_WEBHOOK_SECRET
  ```

- [ ] **Install dependencies**
  ```bash
  cd apps/worker
  npm install stripe
  ```

- [ ] **Deploy worker**
  ```bash
  cd apps/worker
  npx wrangler deploy
  ```

---

## 🟡 High Priority - UI Components

### Company Management
- [ ] Company switcher dropdown in navbar
  - Show company list
  - Display active company
  - Switch between companies
  - "Create New" button

- [ ] Create company flow
  - Check `canCreateCompany()` limit
  - Check credits balance (100 credits required)
  - Deduct credits on creation
  - Redirect to new company dashboard

### Credits & Billing
- [ ] Credits display widget
  - Show current balance
  - Format with `formatCredits()`
  - "Buy More" button

- [ ] Credits purchase modal
  - Display 3 packages (Starter, Pro, Scale)
  - Highlight "Most Popular"
  - Trigger Stripe Checkout

- [ ] Plan upgrade flow
  - Display plan comparison table
  - Show current plan
  - "Upgrade" buttons
  - Trial period messaging

- [ ] Billing page
  - Current plan card
  - Usage stats
  - Invoice history
  - "Manage Billing" → Stripe portal

### Team Collaboration
- [ ] Team members list
  - Display members with roles
  - Show pending invitations
  - "Invite Member" button

- [ ] Invite member modal
  - Email input
  - Role selector (admin/member/viewer)
  - Permissions checkboxes
  - Send invitation

- [ ] Accept invitation page
  - `/invite/:token` route
  - Display company name
  - Accept/Decline buttons
  - Update invitation status

### Custom Domains
- [ ] Domain list page
  - Show all domains
  - Status badges (pending/verified/failed)
  - SSL status
  - "Add Domain" button

- [ ] Add domain flow
  - Domain input
  - Display DNS records to configure
  - Verification status
  - Retry verification button

---

## 🟢 Medium Priority - Backend

### Webhook Improvements
- [ ] Implement full Stripe signature verification
  - Use `stripe.webhooks.constructEvent()`
  - Handle verification errors properly

- [ ] Add email notifications
  - Payment failed → email user
  - Credits low (< 50) → email user
  - Trial ending soon → email user
  - Invoice generated → email with PDF

- [ ] Add webhook retry logic
  - Log failed webhook processing
  - Retry mechanism for transient errors

### Credits System
- [ ] Create credits deduction middleware
  - Check balance before action
  - Automatic deduction
  - Return insufficient credits error

- [ ] Add credits expiration
  - Mark credits as expiring after 12 months
  - Cron job to expire old credits

- [ ] Credits usage analytics
  - Track usage per company
  - Usage by action type
  - Daily/weekly/monthly reports

### API Routes
- [ ] Company CRUD endpoints
  - Create company (check limits + deduct credits)
  - Update company
  - Delete/archive company
  - List user companies

- [ ] Team member endpoints
  - Invite member
  - Accept/decline invitation
  - Update member role
  - Remove member

- [ ] Custom domain endpoints
  - Add domain
  - Verify domain (check DNS)
  - Remove domain
  - Check SSL status

---

## 🔵 Low Priority - Nice to Have

### Analytics Dashboard
- [ ] Usage metrics
  - Companies created
  - Credits used
  - Agent activities
  - Emails sent

- [ ] Revenue metrics
  - MRR per company
  - Total revenue
  - Revenue growth chart

- [ ] Plan distribution chart
  - Users per plan
  - Conversion rates

### Admin Tools
- [ ] Admin dashboard
  - User list
  - Subscription list
  - Failed payments
  - Support tickets

- [ ] Impersonation mode
  - View as user
  - Debug user issues

### Notifications
- [ ] In-app notifications
  - Team member invited you
  - Credits running low
  - Payment failed
  - Domain verified

- [ ] Email templates
  - Welcome email
  - Invoice email
  - Payment failed email
  - Credits low warning

### Account Management
- [ ] Account deletion flow
  - Request deletion button
  - Confirmation modal
  - 30-day grace period
  - Data export download
  - Cancel deletion option

- [ ] Data export
  - Export all user data
  - JSON format
  - Include companies, transactions, etc.

---

## 🧪 Testing

- [ ] Test Stripe webhooks locally
  ```bash
  stripe listen --forward-to localhost:8787/api/stripe/webhooks
  stripe trigger customer.subscription.created
  ```

- [ ] Test subscription flow
  - [ ] Create subscription
  - [ ] Verify database records
  - [ ] Check credits added
  - [ ] Test plan limits

- [ ] Test credits purchase
  - [ ] Buy credits
  - [ ] Verify balance updated
  - [ ] Check transaction record

- [ ] Test team invitations
  - [ ] Send invitation
  - [ ] Accept invitation
  - [ ] Verify member can view company
  - [ ] Test role permissions

- [ ] Test custom domains
  - [ ] Add domain
  - [ ] Verify DNS records
  - [ ] Check SSL provisioning

- [ ] Test account deletion
  - [ ] Request deletion
  - [ ] Verify grace period
  - [ ] Cancel deletion
  - [ ] Complete deletion

---

## 📝 Documentation

- [ ] Update API documentation
  - Document all new endpoints
  - Request/response examples
  - Error codes

- [ ] User guides
  - How to invite team members
  - How to add custom domain
  - How to manage billing
  - How to purchase credits

- [ ] Developer docs
  - Database schema reference
  - Webhook event types
  - Credits system explanation

---

## 🚀 Deployment

- [ ] Frontend deployment
  ```bash
  cd apps/web
  npm run build
  # Deploy to Cloudflare Pages
  ```

- [ ] Worker deployment
  ```bash
  cd apps/worker
  npx wrangler deploy
  ```

- [ ] Set up monitoring
  - Stripe webhook delivery logs
  - Database query performance
  - API error rates
  - Credits balance alerts

---

## ⚠️ Known Issues / Technical Debt

- [ ] Stripe webhook signature verification needs full implementation
- [ ] Need to handle existing users with `user_id` → `owner_id` migration
- [ ] Credits expiration cron job not implemented
- [ ] Email notification system not set up
- [ ] Need to add rate limiting on API routes
- [ ] Missing integration tests for webhook handlers

---

## 💰 Stripe Configuration Checklist

### Products to Create in Stripe Dashboard

**Subscriptions:**
1. Starter Plan
   - Monthly: $29/mo
   - Yearly: $290/yr (~$24/mo)
   
2. Growth Plan
   - Monthly: $99/mo
   - Yearly: $990/yr (~$82/mo)
   
3. Scale Plan
   - Monthly: $299/mo
   - Yearly: $2,990/yr (~$249/mo)

**One-time Payments:**
1. Credits - Starter Pack
   - 1,000 credits
   - $10

2. Credits - Pro Pack
   - 5,000 credits
   - $45

3. Credits - Scale Pack
   - 20,000 credits
   - $160

### After Creating Products
- [ ] Copy all price IDs
- [ ] Update `PRICE_IDS` in `apps/web/src/lib/stripe.ts`
- [ ] Update `getPlanFromPriceId()` mapping in `apps/worker/src/routes/stripe-webhooks.ts`

---

## 📊 Current Status

**Completed:**
- ✅ Database schema v2 designed
- ✅ TypeScript types generated
- ✅ AuthContext updated
- ✅ Stripe webhook handlers created
- ✅ Stripe API routes created
- ✅ Stripe client library created
- ✅ Documentation written

**In Progress:**
- 🟡 Applying database schema to Supabase
- 🟡 Configuring Stripe products

**Not Started:**
- 🔴 UI components
- 🔴 Team collaboration UI
- 🔴 Custom domain UI
- 🔴 Email notifications

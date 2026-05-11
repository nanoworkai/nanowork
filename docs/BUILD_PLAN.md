# 🏗️ Nanowork V2 Build Plan

## Build Order (Approval Required for Each)

### Phase 1: Database Foundation ✅
**Status:** Ready for approval
**Time:** 5 minutes

1. **Update Profiles Table** - Add v2 columns (credits, subscription, etc.)
2. **Create Companies Table** - Multi-company support
3. **Create Credits Transactions** - Credits system with auto-balance
4. **Create Company Members** - Team collaboration
5. **Create Subscriptions Table** - Stripe subscription tracking
6. **Create Invoices Table** - Billing history
7. **Create Payment Methods** - Stored payment methods
8. **Create Custom Domains** - Domain verification
9. **Create Agent Emails** - Email infrastructure

**Files:**
- `supabase/migrations/001_profiles_v2.sql`
- `supabase/migrations/002_companies.sql`
- `supabase/migrations/003_credits.sql`
- `supabase/migrations/004_company_members.sql`
- `supabase/migrations/005_subscriptions.sql`
- `supabase/migrations/006_invoices.sql`
- `supabase/migrations/007_payment_methods.sql`
- `supabase/migrations/008_custom_domains.sql`
- `supabase/migrations/009_agent_emails.sql`

---

### Phase 2: TypeScript Types & Context ✅
**Status:** Ready for approval
**Time:** 2 minutes

1. **Update Database Types** - Complete TypeScript definitions
2. **Update AuthContext** - Add v2 features, keep phone auth
3. **Create Stripe Utils** - Client-side Stripe helpers

**Files:**
- `apps/web/src/types/database.ts` (update)
- `apps/web/src/context/AuthContext.tsx` (replace)
- `apps/web/src/lib/stripe.ts` (create)

---

### Phase 3: Worker/API Backend ✅
**Status:** Ready for approval
**Time:** 3 minutes

1. **Stripe Webhooks** - Handle subscription events
2. **Stripe API Routes** - Checkout, portal, subscriptions
3. **Add Routes to Index** - Wire up new endpoints

**Files:**
- `apps/worker/src/routes/stripe-webhooks.ts` (create)
- `apps/worker/src/routes/stripe.ts` (create)
- `apps/worker/src/index.ts` (update)
- `apps/worker/package.json` (add stripe dependency)

---

### Phase 4: UI Components 🔨
**Status:** Ready to build
**Time:** 20 minutes

1. **Company Switcher** - Dropdown to switch companies
2. **Credits Display** - Show balance with buy button
3. **Credits Purchase Modal** - Buy credits flow
4. **Plan Upgrade Modal** - Upgrade subscription
5. **Billing Page** - Invoices, usage, portal access
6. **Team Invitation Modal** - Invite team members
7. **Custom Domain Form** - Add/verify domains

**Files:**
- `apps/web/src/components/CompanySwitcher.tsx`
- `apps/web/src/components/CreditsDisplay.tsx`
- `apps/web/src/components/CreditsPurchaseModal.tsx`
- `apps/web/src/components/PlanUpgradeModal.tsx`
- `apps/web/src/pages/Billing.tsx`
- `apps/web/src/components/TeamInviteModal.tsx`
- `apps/web/src/components/CustomDomainForm.tsx`

---

### Phase 5: Integration & Testing 🧪
**Status:** Ready after Phase 4
**Time:** 10 minutes

1. **Add Components to Dashboard**
2. **Test Credits Flow**
3. **Test Company Creation**
4. **Test Stripe Integration**
5. **Create Demo Data Script**

**Files:**
- `apps/web/src/pages/Dashboard.tsx` (update)
- `supabase/seed.sql` (create)
- `TESTING.md` (create)

---

## Total Estimated Time: 40 minutes

## Diff Approval Process

For each phase, I will:
1. Show you the COMPLETE diff of changes
2. Explain what each change does
3. Wait for your approval
4. Apply changes only after approval
5. Move to next phase

---

## Phase Details

### Phase 1: Database (9 migrations)

#### Migration 001: Profiles V2
```
Adds to profiles table:
- avatar_url, status, phone_verified
- subscription_status, subscription_id
- trial_ends_at, subscription_ends_at
- credits_balance (default 100)
- monthly_company_limit (default 1)
- total_companies_created
- timezone, notification_preferences
- last_login_at, deleted_at, updated_at
```

#### Migration 002: Companies
```
Creates companies table with:
- owner_id (FK to profiles)
- name, description, slug, industry
- logo_url, subdomain, custom_domain_id
- status, total_revenue, mrr, total_spend
- RLS policies for owner access
- Trigger to enforce company creation limits
```

#### Migration 003: Credits
```
Creates credits_transactions with:
- user_id (FK to profiles)
- type (purchase/usage/refund/bonus)
- amount, balance_after
- company_id, description, usage_type
- Trigger to auto-update profile.credits_balance
```

#### Migration 004: Company Members
```
Creates company_members for teams:
- company_id, user_id, role
- permissions JSON
- invitation_token, status, dates
- RLS for team access
- Updates companies RLS to include team members
```

#### Migration 005: Subscriptions
```
Creates subscriptions table:
- user_id, stripe IDs
- plan, status, billing_cycle
- amount, currency
- current_period dates
- trial dates, cancel dates
- features, limits JSON
```

#### Migration 006: Invoices
```
Creates invoices table:
- user_id, subscription_id
- stripe_invoice_id
- amount_due, amount_paid
- status, payment_intent_id
- dates, URLs
- line_items JSON
```

#### Migration 007: Payment Methods
```
Creates payment_methods:
- user_id, stripe IDs
- type (card/bank)
- card details (brand, last4, exp)
- bank details
- is_default, status
```

#### Migration 008: Custom Domains
```
Creates custom_domains:
- company_id, domain
- verification_status, token
- ssl_status, provider
- dns_records JSON
- is_primary, status
```

#### Migration 009: Agent Emails
```
Creates agent_emails:
- agent_id, company_id
- email_address (unique)
- provider (resend/sendgrid/ses)
- status, stats (sent/received/bounced)
- forwarding, auto_reply settings
```

---

### Phase 2: Types & Context (3 files)

#### Database Types
```
Complete TypeScript types for:
- All 18+ tables
- Insert/Update/Row operations
- Helper type exports
- JSON type safety
```

#### AuthContext V2
```
Enhanced with:
- companies[] array
- activeCompany tracking
- setActiveCompany(id)
- refreshCompanies()
- canCreateCompany()
- deductCredits()
- Keeps phone OTP auth
- Backward compatible
```

#### Stripe Utils
```
Client functions:
- createSubscriptionCheckout()
- createCreditsCheckout()
- createCustomerPortalSession()
- getPlanFeatures()
- canAccessFeature()
- formatCredits()
- calculateCreditsCost()
- Price IDs and packages
```

---

### Phase 3: Worker Backend (3 files + deps)

#### Stripe Webhooks
```
Handles events:
- customer.subscription.created/updated/deleted
- invoice.payment_succeeded/failed
- checkout.session.completed
- Syncs to database
- Adds bonus credits
- Updates profiles
```

#### Stripe API Routes
```
Endpoints:
- POST /api/stripe/create-checkout
- POST /api/stripe/create-portal
- GET /api/stripe/subscription/:id
- POST /api/stripe/subscription/:id/cancel
- POST /api/stripe/subscription/:id/resume
```

#### Index Updates
```
- Import stripe routes
- Import webhook routes
- Add to app routing
```

---

### Phase 4: UI Components (7 components)

#### CompanySwitcher
```
Dropdown showing:
- List of user's companies
- Current active company
- Switch between companies
- "Create New" button
```

#### CreditsDisplay
```
Shows:
- Current balance (formatted)
- "Buy More" button
- Low credits warning
- Opens purchase modal
```

#### CreditsPurchaseModal
```
3 packages:
- Starter: 1K credits ($10)
- Pro: 5K credits ($45) - Most Popular
- Scale: 20K credits ($160)
- Stripe checkout integration
```

#### PlanUpgradeModal
```
Plan comparison:
- Free, Starter, Growth, Scale
- Feature lists
- Monthly/Yearly toggle
- Current plan highlighted
- Upgrade buttons
```

#### Billing Page
```
Sections:
- Current plan card
- Usage statistics
- Invoice history table
- "Manage Billing" button
- Payment methods list
```

#### TeamInviteModal
```
Form:
- Email input
- Role selector
- Permissions checkboxes
- Send invitation
- Pending invites list
```

#### CustomDomainForm
```
Flow:
- Domain input
- DNS records display
- Verification status
- Retry verification
- SSL status
```

---

### Phase 5: Integration (4 tasks)

#### Dashboard Integration
```
Add to dashboard:
- CompanySwitcher in navbar
- CreditsDisplay in header
- Link to billing page
```

#### Testing
```
Test flows:
- Sign up → 100 credits
- Create company → deduct 100
- Purchase credits
- Upgrade plan
```

#### Demo Data
```
Seed script with:
- Test users
- Test companies
- Test transactions
- Test subscriptions
```

---

## Ready to Start?

Please review this plan and let me know:
1. Do you approve the overall structure?
2. Should I start with Phase 1 (Database)?
3. Any changes to the build order?

Once approved, I'll show you the diff for the first migration file and wait for your approval before applying.

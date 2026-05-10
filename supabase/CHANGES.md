# Database Schema Changes - v1 to v2

## Summary

Added **8 new tables** and enhanced **2 existing tables** to support:
- Multiple companies per user
- Team collaboration with invitations
- Custom domain management
- Agent email infrastructure
- Credits & billing system
- Stripe subscription integration
- Account deletion workflow

---

## New Tables Added

### 1. `company_members` (Team Collaboration)
**Purpose:** Allow users to invite team members to collaborate on companies

**Key Fields:**
- `role`: owner, admin, member, viewer
- `permissions`: JSON object with granular permissions
- `invitation_token`: Unique token for accepting invites
- `invitation_status`: pending, accepted, declined, expired

**Use Cases:**
- Invite co-founders or team members
- Grant view-only access to investors
- Allow admins to manage company settings
- Track invitation history

---

### 2. `custom_domains` (Domain Management)
**Purpose:** Enable companies to use their own domains

**Key Fields:**
- `domain`: The custom domain (e.g., "mycompany.com")
- `verification_status`: pending, verified, failed
- `verification_token`: DNS TXT record value
- `ssl_status`: pending, active, failed, expired
- `dns_records`: Required DNS configuration (JSONB)

**Use Cases:**
- User adds "mycompany.com" as custom domain
- System provides DNS records to configure
- Verify domain ownership via DNS TXT record
- Automatic SSL certificate provisioning
- Support multiple domains per company

---

### 3. `agent_emails` (Email Infrastructure)
**Purpose:** Dedicated email addresses for each agent

**Key Fields:**
- `email_address`: finance@company.nanowork.ai (unique)
- `provider`: resend, sendgrid, ses, postmark
- `emails_sent_total`: Counter for analytics
- `bounce_count`: Email deliverability tracking
- `forwarding_enabled`: Forward to user's email
- `auto_reply_template`: Automated responses

**Use Cases:**
- Each agent gets professional email (finance@, sales@, marketing@)
- Track email volume per agent
- Handle bounces and complaints
- Auto-reply when agent is offline
- Forward important emails to human owner

---

### 4. `credits_transactions` (Credits System)
**Purpose:** Track credit purchases, usage, and balances

**Key Fields:**
- `type`: purchase, usage, refund, bonus, expiration
- `amount`: Positive (add) or negative (deduct)
- `balance_after`: Running balance
- `usage_type`: company_creation, agent_action, email_sent, api_call
- `stripe_payment_intent_id`: Link to Stripe payment

**Use Cases:**
- User buys 1000 credits for $10
- Creating company deducts 100 credits
- Agent sending email deducts 1 credit
- Monthly bonus credits for paid users
- Credits expire after 12 months

---

### 5. `subscriptions` (Subscription Management)
**Purpose:** Track Stripe subscriptions and plan limits

**Key Fields:**
- `stripe_subscription_id`: Link to Stripe
- `plan`: starter, growth, scale, enterprise
- `status`: active, trialing, past_due, canceled
- `current_period_start/end`: Billing cycle dates
- `limits`: {"companies": 10, "agents": 70, "credits_per_month": 10000}
- `cancel_at_period_end`: User canceled but still active

**Use Cases:**
- User subscribes to Growth plan ($49/mo)
- Automatic renewal each month
- Handle failed payments (past_due)
- Pause subscription (keep data)
- Cancel subscription (data retained until period end)
- Enforce plan limits

---

### 6. `invoices` (Billing Invoices)
**Purpose:** Store all billing invoices from Stripe

**Key Fields:**
- `stripe_invoice_id`: Link to Stripe invoice
- `amount_due/paid`: Invoice totals
- `status`: draft, open, paid, void, uncollectible
- `invoice_pdf_url`: Download link
- `line_items`: Itemized charges (JSONB)

**Use Cases:**
- View billing history
- Download PDF invoices
- Track payment status
- Display in "Billing" dashboard
- Support tax/accounting needs

---

### 7. `payment_methods` (Stored Payment Methods)
**Purpose:** User's saved payment methods for billing

**Key Fields:**
- `stripe_payment_method_id`: Link to Stripe
- `type`: card, bank_account, sepa_debit
- `card_brand/last4/exp`: Card details (never full number)
- `is_default`: Primary payment method
- `billing_details`: Name, address (JSONB)

**Use Cases:**
- User adds credit card for auto-billing
- Display "Visa ending in 4242"
- Allow changing default payment method
- Remove expired cards
- Support multiple payment methods

---

### 8. `account_deletions` (GDPR Compliance)
**Purpose:** Handle account deletion requests with grace period

**Key Fields:**
- `status`: pending, in_progress, completed, canceled
- `deletion_type`: soft (data retained) or hard (complete removal)
- `scheduled_for`: When deletion will execute (30 days)
- `data_export_url`: User can download their data
- `feedback`: Why user is leaving

**Use Cases:**
- User requests account deletion
- 30-day grace period to change mind
- Export all user data (GDPR compliance)
- Soft delete keeps data for legal retention
- Hard delete completely removes data
- User can cancel deletion request

---

## Enhanced Existing Tables

### `profiles` (Updated)
**New Fields:**
- `avatar_url`: Profile picture
- `status`: active, suspended, deleted
- `email_verified`: Email verification status
- `plan`: Added 'enterprise' option
- `subscription_status`: active, trialing, past_due, canceled, paused
- `subscription_id`: Link to subscriptions table
- `trial_ends_at`: Free trial expiration
- `subscription_ends_at`: Subscription expiration
- `credits_balance`: Current credits balance
- `monthly_company_limit`: Max companies based on plan
- `total_companies_created`: Lifetime counter
- `timezone`: User's timezone
- `notification_preferences`: Email/activity/billing notifications (JSONB)
- `last_login_at`: Track user engagement
- `deleted_at`: Soft delete timestamp

**Why:** Support billing, credits, multiple companies, and account management

---

### `companies` (Updated)
**New Fields:**
- `owner_id`: Renamed from `user_id` (clearer for team collaboration)
- `slug`: URL-safe identifier (e.g., "acme-corp")
- `logo_url`: Company logo
- `subdomain`: company.nanowork.app (unique)
- `custom_domain_id`: Link to custom_domains table
- `total_spend`: Track agent spending per company
- `settings`: Company-specific settings (JSONB)
- `deleted_at`: Soft delete timestamp

**Updated Status Values:**
- Added: `deleted` (soft delete)

**Why:** Support multiple companies, custom domains, team collaboration, and better organization

---

## Updated RLS Policies

### Old Policies (v1):
```sql
-- Only owner can view
USING (auth.uid() = user_id)
```

### New Policies (v2):
```sql
-- Owner OR team members can view
USING (
  auth.uid() = owner_id
  OR
  company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  )
)
```

**Impact:** All company-related tables now support team member access based on their role in `company_members`.

---

## New Helper Functions

### 1. `check_company_creation_limit()`
**Purpose:** Prevent users from exceeding their plan's company limit

**Behavior:**
- Triggered before inserting into `companies`
- Checks user's `monthly_company_limit` from `profiles`
- Counts active companies (excludes archived/deleted)
- Raises error if limit exceeded

**Example:**
- Free plan: 1 company
- Starter plan: 3 companies
- Growth plan: 10 companies
- Scale plan: 50 companies

---

### 2. `update_credits_balance()`
**Purpose:** Automatically update user's credits when transaction is recorded

**Behavior:**
- Triggered after inserting into `credits_transactions`
- Updates `profiles.credits_balance`
- Keeps running balance accurate

**Example:**
- User has 500 credits
- Creates company (costs 100 credits)
- Insert into `credits_transactions`: `{type: 'usage', amount: -100}`
- Trigger updates `profiles.credits_balance` to 400

---

## Migration Path

### If you already ran v1:

**Option A: Fresh Start (Recommended for dev)**
1. Drop all existing tables
2. Run v2 schema

**Option B: Migration Script (For production)**
Run these ALTER statements to upgrade v1 → v2:

```sql
-- Update profiles table
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));
ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ALTER COLUMN plan TYPE TEXT;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'starter', 'growth', 'scale', 'enterprise'));
ALTER TABLE profiles ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'paused'));
ALTER TABLE profiles ADD COLUMN subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN subscription_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN credits_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN monthly_company_limit INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN total_companies_created INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "activity": true, "billing": true}'::jsonb;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update companies table
ALTER TABLE companies RENAME COLUMN user_id TO owner_id;
ALTER TABLE companies ADD COLUMN slug TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN logo_url TEXT;
ALTER TABLE companies ADD COLUMN subdomain TEXT UNIQUE;
ALTER TABLE companies ADD COLUMN custom_domain_id UUID;
ALTER TABLE companies ADD COLUMN total_spend DECIMAL(12,2) DEFAULT 0;
ALTER TABLE companies ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE companies ADD COLUMN deleted_at TIMESTAMPTZ;

-- Then create all new tables from v2 schema
-- (company_members, custom_domains, agent_emails, etc.)
```

---

## Plan Limits Reference

| Feature | Free | Starter | Growth | Scale | Enterprise |
|---------|------|---------|--------|-------|------------|
| **Monthly Price** | $0 | $29 | $99 | $299 | Custom |
| **Companies** | 1 | 3 | 10 | 50 | Unlimited |
| **Team Members** | 0 | 1 | 5 | 20 | Unlimited |
| **Credits/Month** | 100 | 1,000 | 5,000 | 20,000 | Custom |
| **Custom Domains** | 0 | 1 | 5 | 25 | Unlimited |
| **Agent Emails** | 7 | 21 | 70 | 350 | Unlimited |
| **API Access** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Credits Pricing

- **Starter Pack:** 1,000 credits = $10
- **Pro Pack:** 5,000 credits = $45 (10% discount)
- **Scale Pack:** 20,000 credits = $160 (20% discount)

### Credits Usage:
- Create company: 100 credits
- Agent action: 1-10 credits (based on complexity)
- Email sent: 1 credit
- API call: 1 credit
- Custom domain setup: 50 credits

---

## Breaking Changes

⚠️ **Important:**

1. **`companies.user_id` → `companies.owner_id`**
   - Update all queries to use `owner_id`
   - Update AuthContext to use `owner_id`

2. **`profiles.plan` enum updated**
   - Added 'enterprise' option
   - Update plan checking logic

3. **RLS policies updated**
   - All company queries now check team membership
   - Test thoroughly after migration

---

## Next Steps After Migration

1. **Update TypeScript types**
   ```bash
   npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
   ```

2. **Update AuthContext.tsx**
   - Change `user_id` to `owner_id` in queries
   - Add credits balance tracking
   - Add subscription status

3. **Create billing integration**
   - Stripe webhook handlers
   - Subscription creation flow
   - Credits purchase flow

4. **Build team invitation flow**
   - Invitation email templates
   - Accept/decline invitation pages
   - Role management UI

5. **Implement custom domains**
   - DNS verification flow
   - SSL provisioning
   - Domain status dashboard

6. **Add account deletion**
   - Deletion request form
   - Grace period countdown
   - Data export functionality

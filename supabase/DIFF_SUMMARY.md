# Schema Upgrade: v1 → v2 Visual Summary

## 📊 What Changed

### Tables Count
- **v1:** 10 tables
- **v2:** 18 tables (+8 new)

### New Features
✅ Multiple companies per user
✅ Team collaboration with invitations
✅ Custom domain management with DNS verification
✅ Dedicated agent email infrastructure
✅ Credits system (purchase, usage, refunds)
✅ Full Stripe billing integration
✅ GDPR-compliant account deletion
✅ Company creation limits per plan

---

## 🆕 New Tables (8)

### 1. **company_members** - Team Collaboration
```
company_id  ──→  companies.id
user_id     ──→  profiles.id
role        ──→  owner | admin | member | viewer
permissions ──→  {view, edit, invite, billing}
invitation_token  (unique)
invitation_status (pending/accepted/declined)
```

### 2. **custom_domains** - Domain Management
```
company_id  ──→  companies.id
domain      ──→  "mycompany.com" (unique)
verification_status  (pending/verified/failed)
verification_token   (DNS TXT record)
ssl_status  (pending/active/failed)
dns_records (JSONB)
```

### 3. **agent_emails** - Email Infrastructure
```
agent_id     ──→  agents.id
company_id   ──→  companies.id
email_address  ──→  finance@company.nanowork.ai (unique)
provider     ──→  resend | sendgrid | ses | postmark
emails_sent_total
bounce_count
forwarding_enabled
```

### 4. **credits_transactions** - Credits System
```
user_id  ──→  profiles.id
type     ──→  purchase | usage | refund | bonus | expiration
amount   ──→  +/- integer
balance_after
stripe_payment_intent_id
usage_type  (company_creation, agent_action, email_sent, api_call)
```

### 5. **subscriptions** - Stripe Subscriptions
```
user_id  ──→  profiles.id
stripe_subscription_id (unique)
plan     ──→  starter | growth | scale | enterprise
status   ──→  active | trialing | past_due | canceled
current_period_start/end
limits   ──→  {companies, agents, credits_per_month}
```

### 6. **invoices** - Billing Invoices
```
user_id  ──→  profiles.id
subscription_id  ──→  subscriptions.id
stripe_invoice_id (unique)
amount_due/paid
status  (draft/open/paid/void)
invoice_pdf_url
line_items (JSONB)
```

### 7. **payment_methods** - Stored Payment Methods
```
user_id  ──→  profiles.id
stripe_payment_method_id (unique)
type     ──→  card | bank_account | sepa_debit
card_brand/last4/exp
is_default
billing_details (JSONB)
```

### 8. **account_deletions** - GDPR Deletion Workflow
```
user_id  ──→  profiles.id
status   ──→  pending | in_progress | completed | canceled
deletion_type  (soft/hard)
scheduled_for  (30-day grace period)
data_export_url
feedback
```

---

## 🔄 Enhanced Tables (2)

### **profiles** (11 → 22 fields)

**Added:**
```diff
+ avatar_url
+ status (active/suspended/deleted)
+ email_verified
+ plan (added 'enterprise')
+ subscription_status
+ subscription_id
+ trial_ends_at
+ subscription_ends_at
+ credits_balance
+ monthly_company_limit
+ total_companies_created
+ timezone
+ notification_preferences (JSONB)
+ last_login_at
+ deleted_at
```

### **companies** (16 → 22 fields)

**Changed:**
```diff
- user_id
+ owner_id (renamed for clarity)
```

**Added:**
```diff
+ slug (URL-safe identifier)
+ logo_url
+ subdomain (company.nanowork.app)
+ custom_domain_id → custom_domains.id
+ total_spend
+ settings (JSONB)
+ deleted_at
```

---

## 🔒 RLS Policy Updates

### Before (v1):
```sql
-- Only owner
USING (auth.uid() = user_id)
```

### After (v2):
```sql
-- Owner OR team member
USING (
  auth.uid() = owner_id
  OR
  company_id IN (
    SELECT company_id FROM company_members 
    WHERE user_id = auth.uid()
  )
)
```

**Impact:** All 10 existing tables now support team collaboration!

---

## ⚙️ New Functions & Triggers

### 1. **check_company_creation_limit()**
- Prevents exceeding plan limits
- Triggered BEFORE INSERT on companies
- Raises error if limit reached

### 2. **update_credits_balance()**
- Auto-updates user credits
- Triggered AFTER INSERT on credits_transactions
- Keeps balance synchronized

### 3. **Updated Triggers**
Added `updated_at` triggers for new tables:
- company_members
- custom_domains
- agent_emails
- subscriptions
- invoices
- payment_methods

---

## 📈 Database Relationships (Updated)

```
profiles (user)
  ├─> subscriptions (1:many)
  ├─> invoices (1:many)
  ├─> payment_methods (1:many)
  ├─> credits_transactions (1:many)
  ├─> account_deletions (1:many)
  └─> companies (1:many) as owner
       ├─> company_members (1:many) ───> profiles (invited users)
       ├─> custom_domains (1:many)
       ├─> agents (1:7)
       │    ├─> agent_emails (1:1)
       │    ├─> agent_activities (1:many)
       │    ├─> financial_infrastructure (1:many)
       │    └─> transactions (1:many)
       ├─> prospects (1:many)
       ├─> communications (1:many)
       ├─> assets (1:many)
       └─> metrics (1:many)
```

---

## 💡 Key Benefits

### For Users:
- ✅ Create multiple AI companies
- ✅ Invite team members to collaborate
- ✅ Use custom domains (mycompany.com)
- ✅ Track spending with credits system
- ✅ Flexible billing (subscriptions + pay-as-you-go)
- ✅ Professional agent emails (finance@, sales@)
- ✅ GDPR-compliant data deletion

### For Development:
- ✅ Clean separation of concerns
- ✅ Scalable team collaboration model
- ✅ Stripe webhook-ready
- ✅ Audit trail for all transactions
- ✅ Flexible metadata (JSONB fields)
- ✅ Proper indexes for performance

---

## 🚨 Breaking Changes

1. **companies.user_id → companies.owner_id**
   - Update all application queries
   - Update TypeScript types

2. **profiles.plan enum expanded**
   - Now includes 'enterprise'
   - Update plan checks

3. **RLS policies changed**
   - Test team member access
   - Verify permissions work correctly

---

## 📝 Next Steps

1. ✅ Review TABLES_v2.md (complete schema)
2. ✅ Review CHANGES.md (detailed migration guide)
3. ⬜ Approve and apply to Supabase
4. ⬜ Update TypeScript types
5. ⬜ Update AuthContext queries
6. ⬜ Build Stripe webhook handlers
7. ⬜ Create team invitation flow
8. ⬜ Build custom domain UI
9. ⬜ Implement credits purchase flow
10. ⬜ Add account deletion UI

---

## 📦 Files Created

1. **TABLES_v2.md** - Complete v2 schema (ready to paste into Supabase)
2. **CHANGES.md** - Detailed change log and migration guide
3. **DIFF_SUMMARY.md** - This visual overview (you are here)
4. **TABLES.md** - Original v1 schema (archived)

**Total SQL Lines:** ~1,200 lines
**Total Tables:** 18
**Total Indexes:** 70+
**Total Policies:** 50+

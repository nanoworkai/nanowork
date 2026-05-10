# Nanowork Supabase Database Schema

Complete database schema for the Nanowork AI company builder platform.

## Overview

This schema supports the core Nanowork concept: **real AI agents with real infrastructure** (virtual cards, emails, bank accounts) building and running autonomous companies.

## Tables

### Core Tables

#### `profiles`
User accounts with subscription plans.
- Primary key: `id` (UUID, references auth.users)
- Fields: email, name, business_name, plan, subdomain, stripe_customer_id
- Plans: free, starter, growth, scale

#### `companies`
AI companies created from user prompts.
- Each company represents a full business entity built by agents
- Tracks: entity formation, branding, website, financial metrics
- Status: initializing → active → paused/archived

#### `agents`
The 7 department agents per company.
- Departments: legal, brand, web, marketing, sales, finance, operations
- Each agent has: email address, virtual card, bank account
- Spending limits and performance tracking

### Activity & Operations

#### `agent_activities`
Real-time activity feed showing what agents are doing.
- Types: research, communication, financial, content_creation, outreach, analysis, automation
- Statuses: pending → in_progress → completed/failed
- Powers the live activity feed on dashboards

#### `financial_infrastructure`
Virtual cards, bank accounts, and payment methods per agent.
- Types: virtual_card, bank_account, payment_method
- Includes card details (last4, expiry, status)
- Balance and spending limit tracking

#### `transactions`
All financial transactions by agents.
- Types: charge, payment, refund, transfer, fee
- Merchant details, amounts, Stripe IDs
- Full audit trail of agent spending

### Sales & Marketing

#### `prospects`
Sales leads discovered and managed by agents.
- Lead details: name, email, company, title, score
- Pipeline stages: new → contacted → qualified → demo → proposal → won/lost
- Engagement tracking: emails sent/received, next followup date

#### `communications`
Emails and messages sent/received by agents.
- Types: email, sms, call
- Direction: inbound, outbound
- Status tracking: sent → delivered → opened → clicked → replied
- Thread management for conversations

### Content & Assets

#### `assets`
Websites, brands, legal docs, and marketing materials.
- Types: website, logo, brand_guide, legal_document, contract, invoice, marketing_material
- File storage URLs
- Version tracking and approval workflow

#### `metrics`
Performance tracking and analytics.
- Metric types: revenue, leads, emails_sent, website_visitors, conversion_rate
- Time periods: daily, weekly, monthly, quarterly, yearly, all_time
- Used for dashboard charts and reporting

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Note your project URL and anon key

### 2. Run the Migration

**Option A: Using Supabase CLI** (recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option B: Using Supabase Dashboard**

1. Open your Supabase project dashboard
2. Go to "SQL Editor"
3. Click "New query"
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste and run

### 3. Configure Environment Variables

Update your `apps/web/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Verify Setup

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- agents
- agent_activities
- assets
- communications
- companies
- financial_infrastructure
- metrics
- profiles
- prospects
- transactions

## Security (Row Level Security)

All tables have RLS enabled with policies that ensure:
- Users can only see their own profile
- Users can only see companies they created
- Users can only see agents, activities, transactions, etc. for their companies

This is enforced at the database level, so no API can bypass these rules.

## Key Relationships

```
profiles (user)
  └─> companies (1:many)
       ├─> agents (1:7, one per department)
       │    ├─> agent_activities
       │    ├─> financial_infrastructure
       │    └─> transactions
       ├─> prospects
       ├─> communications
       ├─> assets
       └─> metrics
```

## Indexes

All foreign keys and frequently queried columns are indexed for performance:
- User lookups (email, subdomain)
- Company queries (status, created_at)
- Activity feeds (created_at DESC)
- Financial queries (transaction_date, status)
- Sales pipeline (prospect status, score)

## Triggers

Auto-update `updated_at` timestamps on:
- profiles
- companies
- agents
- financial_infrastructure
- prospects
- assets

## Next Steps

### For Development

1. **Create seed data**: Uncomment the seed section in the migration to create test companies
2. **Test auth flow**: Sign up with an email to create a profile automatically
3. **Create a company**: Use the prompt input to generate your first AI company

### For Production

1. **Set up Stripe**: Configure Stripe Issuing for virtual cards
2. **Email service**: Set up email infrastructure (e.g., SendGrid, Resend)
3. **Banking**: Integrate with banking APIs (e.g., Plaid, Synapse)
4. **Monitoring**: Set up alerts for failed transactions or agent errors

## TypeScript Types

The TypeScript types in `src/context/AuthContext.tsx` should be updated to match this schema. Consider generating types from the database:

```bash
npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)

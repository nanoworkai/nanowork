# Claim Business Flow - Implementation Guide

## Quick Start

This guide helps you implement the "claim business" flow step-by-step.

---

## 1. Database Setup

Run the migration to create tables:

```bash
# Apply the migration
cd /Users/jordan/Dev/nanowork-web
supabase db push

# Or if using psql directly:
psql $DATABASE_URL < supabase/migrations/010_showcase_companies.sql
```

This creates:
- `showcase_companies` table
- `showcase_claims` table
- Helper functions and RLS policies

---

## 2. Backend Integration

### 2.1 Register the Route

In `backend/src/index.ts` (or wherever routes are registered):

```typescript
import showcaseRoutes from './routes/showcase';

// Add with other routes
app.use('/api/showcase', showcaseRoutes);
```

### 2.2 Update Stripe Webhook Handler

In `backend/src/routes/webhooks/stripe.ts`, add to the switch statement:

```typescript
// Add this case to the event type switch
case 'checkout.session.completed':
  await handleCheckoutSessionCompleted(event.data.object);
  break;
```

Then add this handler function at the bottom of the file:

```typescript
/**
 * Handle checkout.session.completed event
 * - For showcase claims, create the company and mark as claimed
 */
async function handleCheckoutSessionCompleted(session: any) {
  const metadata = session.metadata;

  if (metadata.type !== 'showcase_claim') {
    console.log('Not a showcase claim checkout');
    return;
  }

  const userId = metadata.user_id;
  const showcaseCompanyId = metadata.showcase_company_id;

  console.log('Showcase claim completed:', showcaseCompanyId, 'user:', userId);

  const supabase = getSupabase();

  try {
    // Get showcase company data
    const { data: showcaseCompany, error: showcaseError } = await supabase
      .from('showcase_companies')
      .select('*')
      .eq('id', showcaseCompanyId)
      .single();

    if (showcaseError || !showcaseCompany) {
      console.error('Showcase company not found:', showcaseCompanyId);
      return;
    }

    // Create the actual company from the showcase data
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        owner_id: userId,
        name: showcaseCompany.name,
        description: showcaseCompany.description,
        industry: showcaseCompany.industry,
        logo_url: showcaseCompany.logo_url,
        status: 'active',
        settings: showcaseCompany.company_data,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Failed to create company:', companyError);
      throw companyError;
    }

    // Mark showcase company as claimed
    await supabase
      .from('showcase_companies')
      .update({
        status: 'claimed',
        claimed_by: userId,
        claimed_at: new Date().toISOString(),
        claim_count: showcaseCompany.claim_count + 1,
      })
      .eq('id', showcaseCompanyId);

    // Update claim record
    await supabase
      .from('showcase_claims')
      .update({
        status: 'completed',
        company_id: newCompany.id,
        completed_at: new Date().toISOString(),
      })
      .eq('showcase_company_id', showcaseCompanyId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    console.log('Successfully claimed showcase company:', showcaseCompanyId, '-> company:', newCompany.id);
  } catch (error) {
    console.error('Failed to process showcase claim:', error);
    throw error;
  }
}
```

---

## 3. Frontend Integration

### 3.1 Add ShowcaseSection to Homepage

In `apps/web/src/pages/Home.tsx`, import and add the component:

```tsx
// Add to imports
import { ShowcaseSection } from "../components/ShowcaseSection";

// Add after the Department Grid section (around line 380)
<DepartmentGrid />

{/* Showcase Section - NEW */}
<ShowcaseSection />

{/* Enterprise Section */}
<section className="py-8 sm:py-12 lg:py-16">
```

### 3.2 Handle Success State in Dashboard

In `apps/web/src/dashboard/Create.tsx` or `DashboardLayout.tsx`, add success handling:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function Create() {
  const [searchParams] = useSearchParams();
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('claim_success') === 'true') {
      const companyId = searchParams.get('company_id');
      setShowClaimSuccess(true);

      // Clean URL
      window.history.replaceState({}, '', '/dashboard');

      // Optional: Auto-redirect after 3 seconds
      setTimeout(() => {
        if (companyId) {
          navigate(`/dashboard/builds/${companyId}`);
        }
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div>
      {/* Success Banner */}
      {showClaimSuccess && (
        <div className="mb-6 card bg-surface-1 border border-green-400/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-mono font-bold text-white mb-2">
                Business Claimed Successfully!
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Your new business has been added to your dashboard. All agents are configured and ready to work.
              </p>
              <button
                onClick={() => {
                  const companyId = searchParams.get('company_id');
                  if (companyId) navigate(`/dashboard/builds/${companyId}`);
                }}
                className="px-4 py-2 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                View Business
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your dashboard content */}
    </div>
  );
}
```

---

## 4. Testing

### 4.1 Add Sample Data

Sample data is included in the migration. You can add more via SQL:

```sql
INSERT INTO showcase_companies (
  name,
  description,
  tagline,
  industry,
  tier,
  price_cents,
  estimated_arr_min,
  estimated_arr_max,
  features,
  company_data,
  status
) VALUES (
  'Your Company Name',
  'Full description here',
  'Short tagline',
  'Industry',
  'growth',
  79900, -- $799
  50000,
  200000,
  ARRAY['Feature 1', 'Feature 2', 'Feature 3'],
  '{"agents_configured": true, "website_ready": true}'::jsonb,
  'available'
);
```

### 4.2 Test Flow

1. Start your dev environment:
   ```bash
   npm run dev
   ```

2. Visit homepage - you should see the "Claim a Pre-Built Business" section

3. Click on a company card - modal should open with details

4. Click "Claim for $X" - should redirect to login if not authenticated

5. After login, should redirect to Stripe Checkout

6. Use Stripe test card: `4242 4242 4242 4242`

7. After payment, redirected to dashboard with success message

8. Check database - company should be created and showcase marked as claimed

### 4.3 Stripe Test Mode

Make sure you're using Stripe test keys:

```env
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Test webhook locally with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 5. Customization

### 5.1 Pricing Tiers

Modify tier definitions in the migration or add directly to database:

```sql
UPDATE showcase_companies
SET tier = 'premium',
    price_cents = 299900
WHERE id = 'your-company-id';
```

### 5.2 Features List

Update features for a company:

```sql
UPDATE showcase_companies
SET features = ARRAY[
  'Complete branding package',
  'Full website with CMS',
  'Email marketing setup',
  'Sales automation',
  'Custom integrations'
]
WHERE id = 'your-company-id';
```

### 5.3 Company Data

The `company_data` JSONB field can store any structured data about the company:

```sql
UPDATE showcase_companies
SET company_data = '{
  "agents_configured": true,
  "website_ready": true,
  "marketing_setup": true,
  "integrations": ["stripe", "sendgrid", "twilio"],
  "custom_configs": {
    "primary_color": "#4F46E5",
    "font": "Inter"
  }
}'::jsonb
WHERE id = 'your-company-id';
```

---

## 6. Production Checklist

Before going live:

- [ ] Set Stripe to live mode (update keys in env)
- [ ] Configure Stripe webhook endpoint in dashboard
- [ ] Test webhook with real Stripe account
- [ ] Add real company images/logos
- [ ] Review pricing tiers
- [ ] Set up monitoring for claim completions
- [ ] Add analytics tracking (view_count usage)
- [ ] Test mobile responsive design
- [ ] Add error handling for failed payments
- [ ] Set up customer support flow for claims
- [ ] Test with real user accounts
- [ ] Verify RLS policies work correctly

---

## 7. Monitoring

### Key Metrics to Track

```sql
-- Total claims
SELECT COUNT(*) FROM showcase_claims WHERE status = 'completed';

-- Revenue from claims
SELECT SUM(amount_paid_cents) / 100 as total_revenue_usd
FROM showcase_claims
WHERE status = 'completed';

-- Popular tier
SELECT tier, COUNT(*) as claims
FROM showcase_companies
WHERE status = 'claimed'
GROUP BY tier
ORDER BY claims DESC;

-- Conversion rate
SELECT
  (SELECT COUNT(*) FROM showcase_claims WHERE status = 'completed') * 100.0 /
  NULLIF((SELECT SUM(view_count) FROM showcase_companies), 0) as conversion_rate;
```

---

## 8. Troubleshooting

### Webhook Not Firing

1. Check webhook secret is correct
2. Verify endpoint is accessible (use ngrok for local)
3. Check Stripe dashboard > Webhooks for delivery logs
4. Enable `checkout.session.completed` event

### Company Not Creating

1. Check backend logs for errors
2. Verify user has proper permissions
3. Check `companies` table constraints
4. Verify `company_data` is valid JSON

### Payment Succeeded but Company Not Claimed

1. Check webhook handler logs
2. Verify `showcase_claims` has pending record
3. Check Stripe metadata includes correct IDs
4. Manually run webhook handler with test data

---

## 9. Future Enhancements

Once basic flow is working, consider:

1. **Analytics Dashboard** - Track views, conversions, revenue
2. **A/B Testing** - Test different prices, descriptions
3. **Recommendations** - Suggest companies based on user interests
4. **Favorites** - Let users save companies they're interested in
5. **Bulk Discounts** - Offer deals for claiming multiple companies
6. **Referral Program** - Give credits for referring others
7. **Preview Mode** - Let users interact with demo before claiming
8. **Auto-Generation** - AI creates new showcase companies automatically

---

## Support

If you encounter issues:

1. Check backend logs: `npm run dev` in `backend/`
2. Check browser console for frontend errors
3. Verify database has all required tables
4. Test Stripe webhook with CLI
5. Review Stripe dashboard for payment issues

For production support, set up proper error tracking (Sentry, etc.)

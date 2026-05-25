# Claim Business Flow - Design Summary

## Overview
Complete "claim business" feature allowing users to purchase pre-built AI companies from a showcase on the homepage.

---

## What Was Created

### 📁 Documentation
1. **claim-business-flow-design.md** - Complete technical specification
2. **claim-business-implementation.md** - Step-by-step implementation guide
3. **CLAIM_BUSINESS_SUMMARY.md** - This file

### 🗄️ Database
1. **010_showcase_companies.sql** - Migration creating:
   - `showcase_companies` table (stores pre-built businesses for sale)
   - `showcase_claims` table (tracks purchases)
   - Helper functions and RLS policies
   - Sample data (3 example businesses)

### 🎨 Frontend Components
1. **ShowcaseSection.tsx** - Main section for homepage, fetches and displays companies
2. **ShowcaseCard.tsx** - Individual company card with pricing and features
3. **ClaimBusinessModal.tsx** - Detailed modal with purchase flow
4. **showcase.ts** (types) - TypeScript interfaces and tier configurations

### 🔧 Backend API
1. **routes/showcase.ts** - Complete API routes:
   - `GET /api/showcase/companies` - List all available companies
   - `GET /api/showcase/companies/:id` - Get single company details
   - `POST /api/showcase/companies/:id/view` - Track view count
   - `POST /api/showcase/checkout` - Create Stripe checkout session
2. **Webhook handler additions** - Process completed purchases

---

## Pricing Structure

### Tiers
- **Basic**: $99-$299 (ARR potential: $0-$10K)
- **Growth**: $499-$999 (ARR potential: $10K-$100K)
- **Premium**: $1,500-$5,000 (ARR potential: $100K-$1M)

### Model
- **One-time payment** (not subscription)
- **Full ownership** after purchase
- **Instant delivery** to user dashboard
- Processed via Stripe Checkout

---

## User Flow

1. **Discovery** → User visits homepage, sees "Claim a Pre-Built Business" section
2. **Browse** → Grid of company cards showing name, price, features, tier
3. **Details** → Click "Claim" opens modal with full information
4. **Purchase** → Click "Claim for $X" → Redirect to Stripe Checkout
5. **Payment** → User completes payment with Stripe
6. **Webhook** → Stripe webhook fires, backend creates company in user's account
7. **Success** → User redirected to dashboard with success message
8. **Access** → Company appears in dashboard, fully configured with 7 AI agents

---

## Technical Integration Points

### Existing Systems Used
- **Supabase**: Database, RLS policies, user authentication
- **Stripe**: Payment processing, checkout sessions, webhooks
- **React Router**: Navigation and URL parameters
- **Auth Context**: User authentication state

### New Tables
```
showcase_companies (stores pre-built businesses)
  ├── Pricing and tier info
  ├── Generated company data (JSONB)
  ├── Features list
  ├── Status (available/claimed/hidden)
  └── View count, claim count

showcase_claims (tracks purchases)
  ├── Links to showcase_company and user
  ├── Stripe payment details
  ├── Created company_id after completion
  └── Status (pending/completed/failed)
```

---

## Key Features

### Display
✅ Terminal/Bloomberg aesthetic matching homepage  
✅ Responsive grid layout (1-3 columns)  
✅ Tier badges (Basic/Growth/Premium)  
✅ Price display with ARR estimates  
✅ Feature lists for each business  
✅ View count tracking  

### Modal/Details
✅ Full company description  
✅ Complete feature list with checkmarks  
✅ Value proposition section  
✅ Trust signals (Stripe secure, instant access, guarantee)  
✅ Loading states during checkout  

### Purchase Flow
✅ Authentication check (redirect to login if needed)  
✅ Stripe Checkout integration  
✅ Metadata tracking (user_id, company_id)  
✅ Webhook handling for completion  
✅ Automatic company creation  
✅ Success redirect and messaging  

### Backend
✅ RESTful API endpoints  
✅ Proper error handling  
✅ Stripe customer creation/lookup  
✅ Atomic view count incrementing  
✅ Double-claim prevention  
✅ RLS policies for security  

---

## Implementation Steps

1. **Run Migration**
   ```bash
   supabase db push
   # or
   psql $DATABASE_URL < supabase/migrations/010_showcase_companies.sql
   ```

2. **Register Backend Route**
   ```typescript
   // backend/src/index.ts
   import showcaseRoutes from './routes/showcase';
   app.use('/api/showcase', showcaseRoutes);
   ```

3. **Update Webhook Handler**
   - Add `checkout.session.completed` case
   - Add `handleCheckoutSessionCompleted()` function
   - See implementation guide for full code

4. **Add to Homepage**
   ```tsx
   // apps/web/src/pages/Home.tsx
   import { ShowcaseSection } from "../components/ShowcaseSection";
   
   // Add after DepartmentGrid
   <ShowcaseSection />
   ```

5. **Add Success Handling**
   - Check for `?claim_success=true` in dashboard
   - Display success banner
   - Optional auto-redirect to claimed company

6. **Test**
   - View showcase on homepage
   - Click through to modal
   - Complete test purchase (Stripe test mode)
   - Verify company created in dashboard
   - Check webhook fired and data synced

---

## Future Enhancements

### Short Term
- [ ] Add company logos/images
- [ ] Implement view tracking analytics
- [ ] Add "Recently Claimed" badges
- [ ] Filter by tier/industry
- [ ] Search functionality

### Medium Term
- [ ] Live preview of company website
- [ ] "X people viewing" realtime counter
- [ ] Favorites/wishlist
- [ ] Share company links
- [ ] Admin dashboard for managing showcase

### Long Term
- [ ] AI auto-generation of new showcase companies
- [ ] Multiple claims per company (non-exclusive)
- [ ] Subscription model option
- [ ] Bulk discounts
- [ ] Referral program
- [ ] Resale marketplace

---

## Testing Checklist

### Functional
- [ ] Showcase section appears on homepage
- [ ] Company cards display correctly
- [ ] Modal opens with full details
- [ ] Unauthenticated users redirect to login
- [ ] Login preserves return URL
- [ ] Stripe checkout opens correctly
- [ ] Test payment completes
- [ ] Webhook fires and processes
- [ ] Company created in database
- [ ] User redirected to dashboard
- [ ] Success message displays
- [ ] Claimed company accessible
- [ ] Showcase marked as "CLAIMED"

### Edge Cases
- [ ] Double-claim attempt blocked
- [ ] Invalid company ID handled
- [ ] Webhook retry works
- [ ] Failed payment handled gracefully
- [ ] Canceled checkout returns properly
- [ ] Mobile responsive design
- [ ] Slow network handling
- [ ] Empty showcase (no companies)

### Security
- [ ] RLS policies prevent unauthorized access
- [ ] Webhook signature verified
- [ ] User can only see own claims
- [ ] No SQL injection vulnerabilities
- [ ] Payment metadata validated

---

## Files Modified/Created

### Created (New Files)
```
docs/
  ├── claim-business-flow-design.md
  ├── claim-business-implementation.md
  └── CLAIM_BUSINESS_SUMMARY.md

apps/web/src/
  ├── components/
  │   ├── ShowcaseSection.tsx
  │   ├── ShowcaseCard.tsx
  │   └── ClaimBusinessModal.tsx
  └── types/
      └── showcase.ts

backend/src/routes/
  └── showcase.ts

supabase/migrations/
  └── 010_showcase_companies.sql
```

### Modified (Existing Files)
```
apps/web/src/pages/Home.tsx
  └── Add <ShowcaseSection /> import and usage

apps/web/src/dashboard/Create.tsx (or DashboardLayout.tsx)
  └── Add success banner for ?claim_success=true

backend/src/index.ts
  └── Register /api/showcase routes

backend/src/routes/webhooks/stripe.ts
  └── Add checkout.session.completed handler
```

---

## Pricing Examples

### Sample Showcase Companies

**EcoBox** - Growth Tier - $799
- Sustainable subscription box service
- E-commerce with recurring billing
- Email marketing automation
- Estimated ARR: $50K-$200K

**LocalLaunch** - Premium Tier - $2,499
- Hyperlocal delivery platform
- Customer + merchant + driver apps
- Automated dispatch system
- Estimated ARR: $100K-$500K

**SkillSwap** - Basic Tier - $149
- Community skill exchange platform
- User matching algorithm
- Scheduling and video conferencing
- Estimated ARR: $10K-$50K

---

## Support & Troubleshooting

### Common Issues

**Companies not showing on homepage**
- Check API endpoint is registered
- Verify database has companies with `status='available'`
- Check browser console for fetch errors

**Checkout not opening**
- Verify Stripe keys are set in .env
- Check user has stripe_customer_id or can create one
- Check backend logs for errors

**Webhook not firing**
- Verify webhook secret in .env
- Check Stripe dashboard > Webhooks for delivery logs
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Company not created after payment**
- Check webhook handler logs
- Verify showcase_claims has pending record
- Check Stripe metadata is correct
- Try manually triggering webhook with test event

---

## Metrics to Track

```sql
-- Total revenue from claims
SELECT SUM(amount_paid_cents) / 100.0 as revenue_usd
FROM showcase_claims
WHERE status = 'completed';

-- Average price by tier
SELECT tier, AVG(price_cents / 100.0) as avg_price_usd
FROM showcase_companies
WHERE status = 'claimed'
GROUP BY tier;

-- Conversion rate
SELECT
  ROUND(
    (SELECT COUNT(*) FROM showcase_claims WHERE status = 'completed')::numeric * 100 /
    NULLIF((SELECT SUM(view_count) FROM showcase_companies), 0),
    2
  ) as conversion_pct;

-- Top performing companies
SELECT name, tier, claim_count, view_count,
  ROUND(claim_count::numeric * 100 / NULLIF(view_count, 0), 2) as cvr_pct
FROM showcase_companies
WHERE view_count > 0
ORDER BY claim_count DESC
LIMIT 10;
```

---

## Next Steps

1. **Immediate**: Run migration and test basic flow
2. **Week 1**: Add real company data and images
3. **Week 2**: Implement analytics and monitoring
4. **Month 1**: Add filtering, search, and enhanced UX
5. **Month 2**: Begin A/B testing prices and descriptions
6. **Month 3**: Launch auto-generation of new companies

---

## Contact

For questions or issues with this implementation:
- Check the implementation guide first
- Review backend logs for errors
- Test with Stripe CLI webhook forwarding
- Verify database schema matches migration

---

**Status**: ✅ Design Complete, Ready for Implementation
**Last Updated**: 2026-05-24

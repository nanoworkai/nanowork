# Claim Business - Implementation Checklist

Use this checklist to track your implementation progress.

## Phase 1: Database & Backend (30 minutes)

### Database Setup
- [ ] Navigate to project root: `cd /Users/jordan/Dev/nanowork-web`
- [ ] Run migration: `supabase db push` or `psql $DATABASE_URL < supabase/migrations/010_showcase_companies.sql`
- [ ] Verify tables created:
  ```sql
  SELECT * FROM showcase_companies;
  SELECT * FROM showcase_claims;
  ```
- [ ] Confirm sample data exists (3 companies)
- [ ] Test RLS policies work

### Backend API Routes
- [ ] Open `backend/src/index.ts`
- [ ] Add import: `import showcaseRoutes from './routes/showcase';`
- [ ] Register route: `app.use('/api/showcase', showcaseRoutes);`
- [ ] Save file
- [ ] Restart backend: `npm run dev` in backend folder
- [ ] Test endpoint: `curl http://localhost:3000/api/showcase/companies`
- [ ] Verify returns JSON array of companies

### Stripe Webhook Handler
- [ ] Open `backend/src/routes/webhooks/stripe.ts`
- [ ] Find the `switch (event.type)` statement (around line 40)
- [ ] Add case: `case 'checkout.session.completed':`
- [ ] Add handler call: `await handleCheckoutSessionCompleted(event.data.object);`
- [ ] Add break: `break;`
- [ ] Scroll to bottom of file (after other handler functions)
- [ ] Copy `handleCheckoutSessionCompleted` function from implementation guide
- [ ] Paste at end of file (before `export default router;`)
- [ ] Save file
- [ ] Restart backend
- [ ] Test webhook locally with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

## Phase 2: Frontend Components (45 minutes)

### Component Files (Already Created)
- [x] `apps/web/src/components/ShowcaseSection.tsx` ✓
- [x] `apps/web/src/components/ShowcaseCard.tsx` ✓
- [x] `apps/web/src/components/ClaimBusinessModal.tsx` ✓
- [x] `apps/web/src/types/showcase.ts` ✓

### Homepage Integration
- [ ] Open `apps/web/src/pages/Home.tsx`
- [ ] Add import at top:
  ```tsx
  import { ShowcaseSection } from "../components/ShowcaseSection";
  ```
- [ ] Find the `<DepartmentGrid />` component (around line 378)
- [ ] Add after it (before Enterprise Section):
  ```tsx
  {/* Showcase Section */}
  <ShowcaseSection />
  ```
- [ ] Save file
- [ ] Check browser - section should appear on homepage

### Dashboard Success Handling
- [ ] Open `apps/web/src/dashboard/Create.tsx` (or `DashboardLayout.tsx`)
- [ ] Add imports:
  ```tsx
  import { useSearchParams } from 'react-router-dom';
  import { Check } from 'lucide-react';
  ```
- [ ] Add state: `const [showClaimSuccess, setShowClaimSuccess] = useState(false);`
- [ ] Add effect:
  ```tsx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('claim_success') === 'true') {
      setShowClaimSuccess(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);
  ```
- [ ] Add success banner JSX (see implementation guide)
- [ ] Save file

## Phase 3: Testing (30 minutes)

### Visual Tests
- [ ] Visit homepage: `http://localhost:5173`
- [ ] Verify showcase section appears
- [ ] Check 3 sample companies display
- [ ] Verify prices show correctly
- [ ] Verify features lists display
- [ ] Check responsive design on mobile

### Interaction Tests
- [ ] Click "Claim" button on a company
- [ ] Verify modal opens with full details
- [ ] Check "Claim for $X" button shows correct price
- [ ] Close modal (X button)
- [ ] Reopen modal
- [ ] Check modal scrolls correctly on small screens

### Authentication Flow
- [ ] Click "Claim for $X" while logged out
- [ ] Verify redirects to login page
- [ ] Log in
- [ ] Verify redirects back to homepage
- [ ] Click "Claim" again
- [ ] Should proceed to checkout without login prompt

### Stripe Checkout Flow
- [ ] Ensure Stripe test keys are in `.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
- [ ] Click "Claim for $X" while logged in
- [ ] Verify redirects to Stripe Checkout page
- [ ] Check correct company name appears
- [ ] Check correct price appears
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Use any future expiry date
- [ ] Use any CVC (e.g., 123)
- [ ] Complete checkout
- [ ] Verify redirects to dashboard

### Success Flow
- [ ] After checkout success, verify on dashboard page
- [ ] Check `?claim_success=true` appears in URL briefly
- [ ] Verify success banner displays
- [ ] Check company name mentioned in banner
- [ ] Click "View Business" button
- [ ] Verify navigates to company detail page
- [ ] Verify company appears in companies list

### Webhook Processing
- [ ] Open terminal with Stripe webhook listener:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```
- [ ] Complete a test purchase
- [ ] Watch webhook listener output
- [ ] Verify `checkout.session.completed` event received
- [ ] Check backend logs for processing
- [ ] Query database:
  ```sql
  SELECT * FROM showcase_claims ORDER BY created_at DESC LIMIT 1;
  SELECT * FROM companies ORDER BY created_at DESC LIMIT 1;
  SELECT * FROM showcase_companies WHERE status = 'claimed';
  ```
- [ ] Verify claim status is 'completed'
- [ ] Verify new company created with correct data
- [ ] Verify showcase company marked as 'claimed'

## Phase 4: Error Handling (15 minutes)

### Error Cases to Test
- [ ] Try claiming already-claimed company (should show "SOLD")
- [ ] Cancel Stripe checkout (should return to homepage)
- [ ] Try accessing API with invalid company ID (should 404)
- [ ] Test with network offline (should show error)
- [ ] Test with Stripe keys missing (should show config error)

## Phase 5: Polish & Refinement (30 minutes)

### Visual Polish
- [ ] Add company logos/images to sample data
- [ ] Verify all text is readable
- [ ] Check spacing and alignment
- [ ] Test dark/light mode if applicable
- [ ] Verify all icons display correctly
- [ ] Check loading states work

### Copy & Messaging
- [ ] Review all button text
- [ ] Check error messages are helpful
- [ ] Verify success message is clear
- [ ] Review value proposition text
- [ ] Check all pricing displays correctly

### Performance
- [ ] Check page load time with showcase section
- [ ] Verify images load efficiently
- [ ] Check no console errors
- [ ] Verify no memory leaks (leave page open for 5 min)

## Phase 6: Production Preparation (1 hour)

### Stripe Production Setup
- [ ] Create Stripe live mode products/prices
- [ ] Update `.env.production` with live keys:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Point to: `https://api.yourdomain.com/api/webhooks/stripe`
- [ ] Enable `checkout.session.completed` event
- [ ] Test webhook delivery in Stripe dashboard

### Real Company Data
- [ ] Create/generate real company offerings
- [ ] Add professional logos and images
- [ ] Write compelling descriptions
- [ ] Set realistic pricing
- [ ] Add accurate feature lists
- [ ] Insert into production database:
  ```sql
  INSERT INTO showcase_companies (...) VALUES (...);
  ```

### Monitoring & Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add analytics events:
  - Showcase viewed
  - Company card clicked
  - Modal opened
  - Claim initiated
  - Purchase completed
- [ ] Create dashboard for metrics:
  - Total claims
  - Revenue
  - Conversion rate
  - Popular tiers
- [ ] Set up alerts for:
  - Webhook failures
  - Payment failures
  - High error rates

### Documentation
- [ ] Update API documentation
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Write customer support FAQ
- [ ] Document admin procedures for adding companies

## Phase 7: Launch (30 minutes)

### Pre-Launch Checks
- [ ] All tests passing
- [ ] No console errors
- [ ] Stripe live mode active
- [ ] Webhooks configured and tested
- [ ] Real company data populated
- [ ] Analytics tracking works
- [ ] Error monitoring active
- [ ] Database backups configured

### Deploy
- [ ] Deploy backend with new routes
- [ ] Deploy frontend with new components
- [ ] Run database migration on production
- [ ] Verify showcase section appears
- [ ] Complete one real test purchase
- [ ] Verify webhook processes correctly
- [ ] Check company appears in dashboard
- [ ] Monitor for any errors

### Post-Launch Monitoring
- [ ] Watch error logs (first 24 hours)
- [ ] Monitor webhook delivery rate
- [ ] Check conversion rate
- [ ] Review customer feedback
- [ ] Track first successful claims
- [ ] Monitor payment success rate

## Ongoing Maintenance

### Weekly
- [ ] Review claim analytics
- [ ] Check webhook success rate
- [ ] Monitor conversion rates
- [ ] Update company inventory if needed
- [ ] Review customer feedback

### Monthly
- [ ] Analyze top-performing companies
- [ ] Test pricing adjustments
- [ ] Add new company offerings
- [ ] Review and optimize copy
- [ ] Analyze drop-off points

---

## Quick Commands Reference

### Database
```bash
# Run migration
supabase db push

# Connect to database
psql $DATABASE_URL

# Check tables
\dt showcase*

# View data
SELECT * FROM showcase_companies;
```

### Backend
```bash
# Start backend
cd backend && npm run dev

# Test API
curl http://localhost:3000/api/showcase/companies

# Watch logs
tail -f logs/backend.log
```

### Frontend
```bash
# Start frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Stripe
```bash
# Listen to webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed

# View webhook logs
stripe webhook-endpoints list
```

---

## Progress Tracker

**Started**: ___________  
**Phase 1 Completed**: ___________  
**Phase 2 Completed**: ___________  
**Phase 3 Completed**: ___________  
**Phase 4 Completed**: ___________  
**Phase 5 Completed**: ___________  
**Phase 6 Completed**: ___________  
**Launched**: ___________  

**Total Time**: ________ hours

---

## Notes & Issues

Use this space to track any issues or notes during implementation:

```
Issue: 
Solution:

Issue:
Solution:

Issue:
Solution:
```

---

**Status**: Ready to Implement  
**Estimated Total Time**: 3-4 hours

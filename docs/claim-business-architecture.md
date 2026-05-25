# Claim Business Flow - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    [1] Homepage Visit
         │
         ▼
    ┌─────────────────┐
    │ ShowcaseSection │  ◄── Fetches from /api/showcase/companies
    │   (Component)   │
    └─────────────────┘
         │
         ├── Shows grid of companies
         │   - Basic: $99-$299
         │   - Growth: $499-$999
         │   - Premium: $1,500+
         │
         ▼
    [2] User clicks "Claim"
         │
         ▼
    ┌────────────────────┐
    │ ClaimBusinessModal │
    │    (Component)     │
    └────────────────────┘
         │
         ├── Shows full details
         ├── Features list
         ├── Value proposition
         │
         ▼
    [3] User clicks "Claim for $X"
         │
         ├─[Not Authenticated]──► Redirect to /login?redirect=...
         │
         └─[Authenticated]─────┐
                               ▼
    [4] POST /api/showcase/checkout
         │
         ├── Verify company available
         ├── Get/Create Stripe customer
         ├── Create checkout session
         ├── Insert showcase_claims (pending)
         │
         ▼
    [5] Redirect to Stripe Checkout
         │
         ├── User enters payment info
         ├── Stripe processes payment
         │
         ▼
    [6] Payment Success
         │
         ▼
    ┌──────────────────────────────┐
    │ Stripe Webhook               │
    │ checkout.session.completed   │
    └──────────────────────────────┘
         │
         ├── Get showcase company data
         ├── Create new company in user's account
         ├── Mark showcase as "claimed"
         ├── Update showcase_claims status
         │
         ▼
    [7] Redirect to /dashboard?claim_success=true
         │
         ▼
    ┌────────────────────┐
    │ Success Banner     │
    │ "Business Claimed" │
    └────────────────────┘
         │
         ▼
    [8] User can access new company
         │
         └── Company in companies table
             └── All 7 AI agents configured
                 └── Ready to use


┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    showcase_companies                   showcase_claims
    ┌─────────────────────┐             ┌────────────────────────┐
    │ id (PK)             │             │ id (PK)                │
    │ name                │             │ showcase_company_id FK │
    │ description         │             │ user_id FK             │
    │ tagline             │             │ company_id FK          │
    │ industry            │             │ stripe_payment_intent  │
    │ logo_url            │             │ amount_paid_cents      │
    │ tier                │             │ status                 │
    │ price_cents         │             │ claimed_at             │
    │ estimated_arr_*     │             │ completed_at           │
    │ company_data (JSON) │             └────────────────────────┘
    │ features (Array)    │                      │
    │ status              │                      │ Links to
    │ claimed_by FK       │                      ▼
    │ view_count          │             ┌────────────────────────┐
    │ claim_count         │             │ companies              │
    └─────────────────────┘             │ (User's owned company) │
              │                         └────────────────────────┘
              │
              └── RLS: Public can view
                  status = 'available' or 'claimed'


┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    GET /api/showcase/companies
    ├── Returns: Array of showcase companies
    ├── Filter: status IN ('available', 'claimed')
    ├── Auth: None (public)
    └── Used by: ShowcaseSection component

    GET /api/showcase/companies/:id
    ├── Returns: Single showcase company
    ├── Auth: None (public)
    └── Used by: Detail views (future)

    POST /api/showcase/companies/:id/view
    ├── Action: Increment view_count
    ├── Auth: None (public)
    └── Used by: Analytics tracking

    POST /api/showcase/checkout
    ├── Body: { companyId, successUrl, cancelUrl }
    ├── Returns: { url } (Stripe Checkout URL)
    ├── Auth: Required (requireUserAuth)
    ├── Creates: Stripe checkout session
    ├── Creates: showcase_claims (pending)
    └── Used by: ClaimBusinessModal


┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRIPE INTEGRATION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                     Stripe
    ────────                    ───────                     ──────

    [Click Claim]
         │
         ├───POST /checkout────►[Create Session]
         │                            │
         │                            ├─── Get company ───┐
         │                            │                    │
         │                            ├─── Get/Create  ───┤
         │                            │    customer        │
         │                            │                    │
         │                            ├─── Create      ───┼──► Stripe API
         │                            │    checkout        │    - Session
         │                            │    session         │    - Metadata
         │                            │                    │
         │◄──{ url: "stripe..." }────┤                    │
         │                            │                    │
    [Redirect to]                     │                    │
    [Stripe Checkout]─────────────────────────────────────►│
         │                                                  │
         │◄─────────[Payment UI]──────────────────────────►│
         │                                                  │
         │                                            [Payment]
         │                                            [Succeeds]
         │                                                  │
         │                            ┌────Webhook─────────┤
         │                            │ checkout.session   │
         │                            │ .completed         │
         │                            ▼                    │
         │                      [Handle Webhook]           │
         │                            │                    │
         │                            ├─ Parse metadata    │
         │                            ├─ Get showcase co   │
         │                            ├─ Create company    │
         │                            ├─ Mark claimed      │
         │                            └─ Update claim      │
         │                                                  │
         │◄──Redirect success_url────────────────────────►│
         │
    [Dashboard]
    [Success Banner]


┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Home.tsx
    └── ShowcaseSection
        ├── ShowcaseCard (×N companies)
        │   ├── Image/Logo
        │   ├── Tier Badge
        │   ├── Title & Tagline
        │   ├── Metrics (views, ARR)
        │   ├── Features List
        │   └── [Claim Button]
        │           │
        │           └─onClick─┐
        │                     │
        └── ClaimBusinessModal
            ├── Header (Company name)
            ├── Company Details
            │   ├── Metrics (ARR, Agents)
            │   ├── Features Grid
            │   └── Description
            ├── Value Proposition
            ├── Price & CTA
            │   └── [Claim for $X]
            │           │
            │           └─onClick─► handleClaim()
            │                       ├─ Check auth
            │                       ├─ POST /checkout
            │                       └─ Redirect Stripe
            └── Trust Signals


┌─────────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ShowcaseSection
    ├── showcaseCompanies: ShowcaseCompany[]  ← from API
    ├── loading: boolean                       ← fetch state
    └── selectedCompany: ShowcaseCompany|null  ← modal state

    ClaimBusinessModal
    ├── loading: boolean                       ← checkout state
    └── company: ShowcaseCompany               ← passed as prop

    Auth Context (existing)
    ├── user                                   ← current user
    ├── isAuthenticated                        ← auth status
    └── profile                                ← user profile


┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUCCESS FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    Stripe Checkout Success
         │
         ├─── success_url with params:
         │    ?claim_success=true
         │    &company_id={company_id}
         │
         ▼
    Dashboard/Create.tsx
         │
         ├─── useEffect detects params
         │
         ├─── Shows success banner
         │    ┌────────────────────────────┐
         │    │ ✅ Business Claimed!       │
         │    │ Your company is ready.     │
         │    │ [View Business] button     │
         │    └────────────────────────────┘
         │
         ├─── Cleans URL (replaceState)
         │
         └─── Optional: Auto-redirect after 3s
                      │
                      ▼
              /dashboard/builds/{company_id}


┌─────────────────────────────────────────────────────────────────────────────┐
│                      SECURITY & PERMISSIONS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Row Level Security (RLS)

    showcase_companies
    ├── SELECT: Public (status IN 'available', 'claimed')
    └── ALL: Service role (for webhooks)

    showcase_claims
    ├── SELECT: Own records only (auth.uid() = user_id)
    └── ALL: Service role (for webhooks)

    Endpoint Protection

    GET /showcase/companies      → Public ✓
    GET /showcase/companies/:id  → Public ✓
    POST /showcase/.../view      → Public ✓
    POST /showcase/checkout      → Auth Required ✓

    Webhook Security

    POST /webhooks/stripe
    ├── Verify signature
    ├── Check webhook secret
    └── Process only if valid


┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend
    ├── Company not found      → Show error message
    ├── Already claimed        → Disable button, show "SOLD"
    ├── Not authenticated      → Redirect to login
    ├── Stripe error           → Alert with error message
    └── Network error          → Show "Please try again"

    Backend
    ├── Invalid company ID     → 404 Not Found
    ├── Company unavailable    → 400 Bad Request
    ├── Stripe not configured  → 500 Internal Error
    ├── Webhook signature fail → 400 Bad Request
    └── Database error         → 500 Internal Error
                                   + Log for debugging


┌─────────────────────────────────────────────────────────────────────────────┐
│                       TESTING STRATEGY                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Unit Tests
    ├── ShowcaseCard renders correctly
    ├── ClaimBusinessModal opens/closes
    ├── Price formatting works
    └── Feature list displays

    Integration Tests
    ├── Fetch companies from API
    ├── Create checkout session
    ├── Webhook processes correctly
    └── Company created in database

    E2E Tests
    ├── User sees showcase on homepage
    ├── User clicks through to modal
    ├── User completes purchase
    ├── User sees success message
    └── User accesses claimed company

    Manual Testing
    ├── Mobile responsive design
    ├── Slow network conditions
    ├── Multiple simultaneous claims
    ├── Stripe test cards (4242...)
    └── Webhook retry scenarios

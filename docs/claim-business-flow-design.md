# Claim Business Flow - Design Specification

## Overview
This document outlines the complete "claim business" flow for the AI-generated company showcase on the Nanowork homepage. Users can browse pre-built AI companies, view details, and purchase/claim them to add to their dashboard.

---

## 1. Database Schema

### New Table: `showcase_companies`

```sql
CREATE TABLE showcase_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company details
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tagline VARCHAR(255),
  industry VARCHAR(100),
  logo_url TEXT,
  
  -- Pricing tier
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('basic', 'growth', 'premium')),
  price_cents INTEGER NOT NULL,
  estimated_arr_min INTEGER,
  estimated_arr_max INTEGER,
  
  -- Generated company data
  company_data JSONB NOT NULL, -- Full company JSON including agents, branding, etc.
  preview_images TEXT[], -- Screenshots/preview images
  features TEXT[], -- Key features list
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'reserved', 'hidden')),
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics (optional social proof)
  view_count INTEGER DEFAULT 0,
  claim_count INTEGER DEFAULT 0, -- Total times claimed (if we allow multiple)
  
  -- Stripe integration
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_showcase_companies_status ON showcase_companies(status);
CREATE INDEX idx_showcase_companies_tier ON showcase_companies(tier);
CREATE INDEX idx_showcase_companies_industry ON showcase_companies(industry);
CREATE INDEX idx_showcase_companies_claimed_by ON showcase_companies(claimed_by);
```

### New Table: `showcase_claims`

```sql
CREATE TABLE showcase_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  showcase_company_id UUID NOT NULL REFERENCES showcase_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Created company after claim
  
  -- Payment
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  amount_paid_cents INTEGER NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Timestamps
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_showcase_claims_user_id ON showcase_claims(user_id);
CREATE INDEX idx_showcase_claims_showcase_company_id ON showcase_claims(showcase_company_id);
CREATE INDEX idx_showcase_claims_status ON showcase_claims(status);
```

---

## 2. Pricing Tiers

### Tier Structure

```typescript
// apps/web/src/lib/showcase-pricing.ts

export const SHOWCASE_TIERS = {
  basic: {
    name: 'Basic Business',
    priceRange: [99, 299],
    arrRange: [0, 10000],
    description: 'Simple business ideas with solid fundamentals',
    features: [
      'Complete branding & logo',
      'Landing page ready to deploy',
      'Email sequences setup',
      'Basic automation',
      '7 AI agents configured',
    ],
  },
  growth: {
    name: 'Growth Business',
    priceRange: [499, 999],
    arrRange: [10000, 100000],
    description: 'Validated concepts with growth potential',
    features: [
      'Complete branding & logo',
      'Full website with e-commerce',
      'Marketing automation',
      'Sales pipeline setup',
      'Advanced agent workflows',
      'Social media presence',
    ],
  },
  premium: {
    name: 'Premium Business',
    priceRange: [1500, 5000],
    arrRange: [100000, 1000000],
    description: 'High-potential ventures ready for scale',
    features: [
      'Complete branding & logo',
      'Full-featured web platform',
      'Advanced marketing automation',
      'Sales & CRM integration',
      'AI agent team fully trained',
      'Content library included',
      'Partnership opportunities',
    ],
  },
} as const;

export type ShowcaseTier = keyof typeof SHOWCASE_TIERS;
```

---

## 3. Frontend Components

### 3.1 ShowcaseSection (Homepage Addition)

Add to Home.tsx after the Department Grid section:

```tsx
// apps/web/src/components/ShowcaseSection.tsx

import { useState, useEffect } from 'react';
import { Building2, TrendingUp } from 'lucide-react';
import { ShowcaseCard } from './ShowcaseCard';
import { ClaimBusinessModal } from './ClaimBusinessModal';

export function ShowcaseSection() {
  const [showcaseCompanies, setShowcaseCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    fetchShowcaseCompanies();
  }, []);

  async function fetchShowcaseCompanies() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/showcase/companies`);
      const data = await response.json();
      setShowcaseCompanies(data);
    } catch (error) {
      console.error('Failed to fetch showcase companies:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      {/* Section Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-white/60" />
          <span className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
            Claim a Pre-Built Business
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-white uppercase tracking-tight mb-3">
          Skip the Build. Buy a Business Ready to Launch.
        </h2>
        <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
          Our AI has already built these companies. Full branding, websites, agents, and automation. 
          Claim one now and start generating revenue immediately.
        </p>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="text-center py-12 text-white/40 font-mono text-sm">
          LOADING BUSINESSES...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseCompanies.map((company) => (
            <ShowcaseCard
              key={company.id}
              company={company}
              onClaim={() => setSelectedCompany(company)}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedCompany && (
        <ClaimBusinessModal
          isOpen={!!selectedCompany}
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </section>
  );
}
```

### 3.2 ShowcaseCard Component

```tsx
// apps/web/src/components/ShowcaseCard.tsx

import { Building2, TrendingUp, Eye } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface ShowcaseCardProps {
  company: any; // Type from database
  onClaim: () => void;
}

export function ShowcaseCard({ company, onClaim }: ShowcaseCardProps) {
  const price = company.price_cents / 100;
  const isAvailable = company.status === 'available';

  return (
    <div className="card rounded-none border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      {/* Image/Preview */}
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-white/20" />
          </div>
        )}
        
        {/* Tier Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            {company.tier}
          </span>
        </div>

        {/* Status Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider px-3 py-1 border border-white/20">
              CLAIMED
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-mono font-bold text-white mb-2">
          {company.name}
        </h3>

        {/* Tagline */}
        {company.tagline && (
          <p className="text-xs text-white/60 mb-3 line-clamp-2">
            {company.tagline}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-white/40">
          {company.view_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{company.view_count}</span>
            </div>
          )}
          {company.estimated_arr_max && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>${(company.estimated_arr_max / 1000).toFixed(0)}K ARR</span>
            </div>
          )}
        </div>

        {/* Features */}
        {company.features && company.features.length > 0 && (
          <div className="mb-4 space-y-1">
            {company.features.slice(0, 3).map((feature: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-white/60">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              ${price.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-white/40 uppercase">
              One-time
            </div>
          </div>

          <button
            onClick={onClaim}
            disabled={!isAvailable}
            className="px-4 py-2 rounded-none bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {isAvailable ? 'Claim' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 ClaimBusinessModal Component

```tsx
// apps/web/src/components/ClaimBusinessModal.tsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, Building2, TrendingUp, Zap } from 'lucide-react';
import { createShowcaseCheckout } from '../lib/showcase';

interface ClaimBusinessModalProps {
  isOpen: boolean;
  company: any;
  onClose: () => void;
}

export function ClaimBusinessModal({ isOpen, company, onClose }: ClaimBusinessModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const price = company.price_cents / 100;

  async function handleClaim() {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/login?redirect=${encodeURIComponent(
        `/showcase/${company.id}/claim`
      )}`;
      return;
    }

    setLoading(true);

    try {
      const { url, error } = await createShowcaseCheckout(
        company.id,
        user!.id,
        `${window.location.origin}/dashboard?claim_success=true&company_id=${company.id}`,
        `${window.location.origin}/?claim_canceled=true`
      );

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Claim error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface-0 border border-white/10 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-surface-1 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-white/60" />
              <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                Claim Business
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-none hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Company Preview */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <h3 className="text-2xl font-mono font-bold text-white mb-2">
                {company.name}
              </h3>
              {company.tagline && (
                <p className="text-sm text-white/70 mb-4">{company.tagline}</p>
              )}
              
              {/* Metrics Bar */}
              <div className="flex items-center gap-6 text-xs font-mono text-white/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {company.estimated_arr_min && company.estimated_arr_max
                      ? `$${(company.estimated_arr_min / 1000).toFixed(0)}K - $${(
                          company.estimated_arr_max / 1000
                        ).toFixed(0)}K ARR`
                      : 'High Potential'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>7 AI Agents Included</span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-6">
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                What You Get
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {company.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div className="mb-6">
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                  About This Business
                </h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}

            {/* Value Props */}
            <div className="card bg-surface-1 border border-white/10 p-5 mb-6">
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Why Claim This?
              </h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Instantly own a complete, ready-to-launch business</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>All 7 AI departments already configured and working</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Start generating revenue from day one</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Customize and scale as you grow</span>
                </li>
              </ul>
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div>
                <div className="text-3xl font-mono font-bold text-white">
                  ${price.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-white/40 uppercase mt-1">
                  One-time payment • Full ownership
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 rounded-none bg-white hover:bg-white/90 disabled:opacity-50 text-black font-mono text-sm font-bold uppercase tracking-wider transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Claim for $${price.toLocaleString()}`
                )}
              </button>
            </div>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-6 text-[10px] font-mono text-white/40">
              <span>SECURE PAYMENT VIA STRIPE</span>
              <span>•</span>
              <span>INSTANT ACCESS</span>
              <span>•</span>
              <span>30-DAY GUARANTEE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 3.4 Showcase Utilities

```typescript
// apps/web/src/lib/showcase.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.nanowork.app';

export interface ShowcaseCompany {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  industry?: string;
  logo_url?: string;
  tier: 'basic' | 'growth' | 'premium';
  price_cents: number;
  estimated_arr_min?: number;
  estimated_arr_max?: number;
  company_data: any;
  preview_images?: string[];
  features?: string[];
  status: 'available' | 'claimed' | 'reserved' | 'hidden';
  view_count: number;
  created_at: string;
}

/**
 * Fetch all available showcase companies
 */
export async function fetchShowcaseCompanies(): Promise<ShowcaseCompany[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/showcase/companies`);
    if (!response.ok) {
      throw new Error('Failed to fetch showcase companies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching showcase companies:', error);
    return [];
  }
}

/**
 * Track view for a showcase company
 */
export async function trackShowcaseView(companyId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/showcase/companies/${companyId}/view`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

/**
 * Create Stripe checkout session for claiming a showcase company
 */
export async function createShowcaseCheckout(
  companyId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/showcase/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        userId,
        successUrl,
        cancelUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create checkout session' };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error creating showcase checkout:', error);
    return { url: null, error: 'Network error' };
  }
}
```

---

## 4. Backend API Endpoints

### 4.1 Routes: /api/showcase

```typescript
// backend/src/routes/showcase.ts

import { Router, Response } from 'express';
import { requireUserAuth, optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';
import { getStripeInstance } from '../services/stripe';

const router = Router();

/**
 * GET /showcase/companies
 * Get all available showcase companies
 */
router.get('/companies', async (req, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('showcase_companies')
      .select('*')
      .in('status', ['available', 'claimed'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get showcase companies error:', error);
    res.status(500).json({
      error: 'Failed to fetch showcase companies',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /showcase/companies/:id
 * Get single showcase company details
 */
router.get('/companies/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('showcase_companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Get showcase company error:', error);
    res.status(500).json({
      error: 'Failed to fetch company',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /showcase/companies/:id/view
 * Track view count for analytics
 */
router.post('/companies/:id/view', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    // Increment view count
    const { error } = await supabase.rpc('increment_showcase_views', {
      company_id: id,
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      error: 'Failed to track view',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /showcase/checkout
 * Create Stripe checkout session for claiming a company
 */
router.post('/checkout', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId, successUrl, cancelUrl } = req.body;
    const userId = req.user!.id;

    if (!companyId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const supabase = getSupabase();
    const stripe = getStripeInstance();

    if (!stripe) {
      res.status(500).json({ error: 'Payment system not configured' });
      return;
    }

    // Get showcase company
    const { data: company, error: companyError } = await supabase
      .from('showcase_companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Check if already claimed
    if (company.status !== 'available') {
      res.status(400).json({ error: 'Company is no longer available' });
      return;
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: company.name,
              description: `Claim ${company.name} - ${company.tier} tier business`,
              images: company.logo_url ? [company.logo_url] : [],
            },
            unit_amount: company.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'showcase_claim',
        user_id: userId,
        showcase_company_id: companyId,
      },
    });

    // Create pending claim record
    await supabase.from('showcase_claims').insert({
      showcase_company_id: companyId,
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_paid_cents: company.price_cents,
      status: 'pending',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create showcase checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
```

### 4.2 Webhook Handler Updates

Add to `backend/src/routes/webhooks/stripe.ts`:

```typescript
// Add to the switch statement in the webhook handler

case 'checkout.session.completed':
  await handleCheckoutSessionCompleted(event.data.object);
  break;

// ... then add the handler function:

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

## 5. Success Flow & User Experience

### 5.1 Post-Purchase Redirect

When user completes payment, they're redirected to:
```
/dashboard?claim_success=true&company_id={company_id}
```

Add success banner to Dashboard:

```tsx
// In apps/web/src/dashboard/Create.tsx or DashboardLayout.tsx

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('claim_success') === 'true') {
    const companyId = params.get('company_id');
    // Show success message/modal
    setShowClaimSuccessModal(true);
    // Clean URL
    window.history.replaceState({}, '', '/dashboard');
  }
}, []);
```

### 5.2 Success Modal

```tsx
<div className="card bg-surface-1 border border-green-400/20 p-6">
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
        onClick={() => navigate(`/dashboard/builds/${companyId}`)}
        className="px-4 py-2 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
      >
        View Business
      </button>
    </div>
  </div>
</div>
```

---

## 6. Admin/Seeding: Creating Showcase Companies

```typescript
// backend/src/routes/internal/showcase-admin.ts

import { Router, Response } from 'express';
import { requireAdminAuth } from '../../middleware/auth';
import { getSupabase } from '../../services/supabase';
import { getStripeInstance } from '../../services/stripe';

const router = Router();

/**
 * POST /internal/showcase/create
 * Create a new showcase company (admin only)
 */
router.post('/create', requireAdminAuth, async (req, res: Response) => {
  try {
    const {
      name,
      description,
      tagline,
      industry,
      tier,
      price_cents,
      estimated_arr_min,
      estimated_arr_max,
      company_data,
      features,
    } = req.body;

    const supabase = getSupabase();
    const stripe = getStripeInstance();

    // Create Stripe product (optional - for tracking)
    let stripeProductId = null;
    let stripePriceId = null;

    if (stripe) {
      const product = await stripe.products.create({
        name: `${name} (${tier})`,
        description,
        metadata: {
          type: 'showcase_company',
          tier,
        },
      });
      stripeProductId = product.id;

      const price = await stripe.prices.create({
        product: stripeProductId,
        currency: 'usd',
        unit_amount: price_cents,
      });
      stripePriceId = price.id;
    }

    // Insert showcase company
    const { data, error } = await supabase
      .from('showcase_companies')
      .insert({
        name,
        description,
        tagline,
        industry,
        tier,
        price_cents,
        estimated_arr_min,
        estimated_arr_max,
        company_data,
        features,
        status: 'available',
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Create showcase company error:', error);
    res.status(500).json({
      error: 'Failed to create showcase company',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
```

---

## 7. Database Functions

```sql
-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION increment_showcase_views(company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE showcase_companies
  SET view_count = view_count + 1
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Testing Checklist

- [ ] Showcase companies display on homepage
- [ ] Click "Claim" opens modal with full details
- [ ] Pricing displays correctly for all tiers
- [ ] Unauthenticated users redirected to login
- [ ] Stripe checkout session created successfully
- [ ] Payment completes and webhook fires
- [ ] Company created in user's dashboard
- [ ] Showcase company marked as "claimed"
- [ ] Success message shown to user
- [ ] User can access claimed company
- [ ] View tracking increments correctly
- [ ] Claimed companies show "SOLD" badge
- [ ] Mobile responsive design works

---

## 9. Future Enhancements

1. **Urgency/Scarcity Elements**
   - Live viewer count ("X people viewing")
   - Recently claimed timestamp
   - Limited quantity badges
   - Countdown timers for special prices

2. **Filtering & Search**
   - Filter by tier, industry, price range
   - Search by keywords
   - Sort by price, ARR potential, newest

3. **Preview Mode**
   - Live preview of the website
   - View sample agent outputs
   - See branding guidelines

4. **Multiple Claims**
   - Allow same showcase to be claimed multiple times
   - Each claim gets unique copy
   - Track claim count for popularity

5. **Subscription Model Option**
   - Monthly licensing instead of one-time
   - Different pricing for subscription
   - Recurring revenue for platform

---

## Summary

This design provides a complete "claim business" flow that:

1. **Displays** pre-built AI companies in an attractive showcase on the homepage
2. **Presents** detailed information in a modal with clear value proposition
3. **Processes** payments securely through Stripe
4. **Delivers** the purchased company instantly to the user's dashboard
5. **Prevents** double-claiming and tracks engagement metrics

All components follow the existing Nanowork terminal/Bloomberg aesthetic and integrate seamlessly with the current Stripe and Supabase infrastructure.

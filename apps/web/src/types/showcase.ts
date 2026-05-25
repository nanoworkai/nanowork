// Types for Showcase Companies feature

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
  company_data: Record<string, any>;
  preview_images?: string[];
  features?: string[];
  status: 'available' | 'claimed' | 'reserved' | 'hidden';
  claimed_by?: string;
  claimed_at?: string;
  view_count: number;
  claim_count: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseClaim {
  id: string;
  showcase_company_id: string;
  user_id: string;
  company_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount_paid_cents: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  claimed_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseTierConfig {
  name: string;
  priceRange: [number, number];
  arrRange: [number, number];
  description: string;
  features: string[];
}

export const SHOWCASE_TIERS: Record<string, ShowcaseTierConfig> = {
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
};

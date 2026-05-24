// Stripe client-side utilities for Nanowork

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.nanowork.app';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('[stripe] VITE_STRIPE_PUBLISHABLE_KEY not set');
}

// Price IDs (update these with your actual Stripe price IDs)
export const PRICE_IDS = {
  starter_monthly: 'price_starter_monthly',
  starter_yearly: 'price_starter_yearly',
  growth_monthly: 'price_growth_monthly',
  growth_yearly: 'price_growth_yearly',
  scale_monthly: 'price_scale_monthly',
  scale_yearly: 'price_scale_yearly',
  credits_1k: 'price_credits_1k',
  credits_5k: 'price_credits_5k',
  credits_20k: 'price_credits_20k',
} as const;

// Plan prices
export const PLAN_PRICES = {
  starter: {
    monthly: 29,
    yearly: 290, // ~$24/mo
  },
  growth: {
    monthly: 99,
    yearly: 990, // ~$82/mo
  },
  scale: {
    monthly: 299,
    yearly: 2990, // ~$249/mo
  },
} as const;

// Credits packages
export const CREDITS_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 1000,
    price: 10,
    priceId: PRICE_IDS.credits_1k,
    popular: false,
    savings: undefined,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 5000,
    price: 45,
    priceId: PRICE_IDS.credits_5k,
    savings: '10%',
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale Pack',
    credits: 20000,
    price: 160,
    priceId: PRICE_IDS.credits_20k,
    savings: '20%',
    popular: false,
  },
] as const;

export type CreditsPackage = typeof CREDITS_PACKAGES[number];

// Create Stripe checkout session for subscription
export async function createSubscriptionCheckout(
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl,
        cancelUrl,
        mode: 'subscription',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create checkout session' };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    return { url: null, error: 'Network error' };
  }
}

// Create Stripe checkout session for credits purchase
export async function createCreditsCheckout(
  priceId: string,
  userId: string,
  creditsAmount: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl,
        cancelUrl,
        mode: 'payment',
        metadata: {
          type: 'credits_purchase',
          user_id: userId,
          credits_amount: creditsAmount.toString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create checkout session' };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error creating credits checkout:', error);
    return { url: null, error: 'Network error' };
  }
}

// Create Stripe customer portal session
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create portal session' };
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return { url: null, error: 'Network error' };
  }
}

// Get plan features
export function getPlanFeatures(plan: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise') {
  const features = {
    free: [
      '1 AI company',
      '7 agents (1 per department)',
      '100 credits/month',
      'Basic support',
    ],
    starter: [
      '3 AI companies',
      '21 agents',
      '1,000 credits/month',
      '1 team member',
      '1 custom domain',
      'API access',
      'Email support',
    ],
    growth: [
      '10 AI companies',
      '70 agents',
      '5,000 credits/month',
      '5 team members',
      '5 custom domains',
      'API access',
      'Priority support',
      'Advanced analytics',
    ],
    scale: [
      '50 AI companies',
      '350 agents',
      '20,000 credits/month',
      '20 team members',
      '25 custom domains',
      'API access',
      'Priority support',
      'Advanced analytics',
      'Dedicated account manager',
    ],
    enterprise: [
      'Unlimited companies',
      'Unlimited agents',
      '100,000+ credits/month',
      'Unlimited team members',
      'Unlimited custom domains',
      'API access',
      '24/7 priority support',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
    ],
  };

  return features[plan] || features.free;
}

// Check if user can access feature based on plan
export function canAccessFeature(
  plan: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise',
  feature: string
): boolean {
  const planHierarchy = ['free', 'starter', 'growth', 'scale', 'enterprise'];
  const featureMinPlan: Record<string, number> = {
    api_access: 1, // starter
    team_members: 1, // starter
    custom_domains: 1, // starter
    priority_support: 2, // growth
    advanced_analytics: 2, // growth
    account_manager: 3, // scale
    sla: 4, // enterprise
  };

  const userPlanIndex = planHierarchy.indexOf(plan);
  const requiredPlanIndex = featureMinPlan[feature] ?? 0;

  return userPlanIndex >= requiredPlanIndex;
}

// Format credits amount
export function formatCredits(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

// Calculate credits cost
export function calculateCreditsCost(actionType: string): number {
  const costs: Record<string, number> = {
    company_creation: 100,
    agent_action_simple: 1,
    agent_action_medium: 5,
    agent_action_complex: 10,
    email_sent: 1,
    api_call: 1,
    domain_setup: 50,
  };

  return costs[actionType] || 1;
}

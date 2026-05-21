import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Shield, Check, Lock, Building2, CreditCard, AlertCircle } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  description?: string;
}

// Lazy load Stripe only when needed to avoid HTTP warnings on localhost
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    } else {
      stripePromise = Promise.resolve(null);
    }
  }
  return stripePromise;
};

export default function ClaimPayment() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  async function loadCompanyData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/companies/${companyId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Company not found");
      }

      const data = await response.json();
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    setProcessingPayment(true);
    setError(null);

    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to load. Please check your payment configuration.");
      }

      // Create checkout session for company claim
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/checkout/claim-company`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            company_id: companyId,
            success_url: `${window.location.origin}/claimed/${companyId}?payment=success`,
            cancel_url: `${window.location.origin}/claim/${companyId}/payment`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create checkout session");
      }

      const { session_id } = await response.json();

      // Redirect to Stripe Checkout
      // @ts-expect-error - redirectToCheckout exists in Stripe v9 runtime but not in types
      const result = await stripe.redirectToCheckout({ sessionId: session_id });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setProcessingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-background-DEFAULT min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="bg-background-DEFAULT min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-accent-red mx-auto mb-4" />
          <h1 className="text-xl font-mono font-bold text-content-DEFAULT mb-2">
            Company Not Found
          </h1>
          <p className="text-sm font-mono text-content-subtle mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-accent-blue text-white font-mono text-sm rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-DEFAULT min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-blue mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-mono font-bold text-content-DEFAULT mb-2">
            Claim Your Company
          </h1>
          <p className="text-lg font-mono text-content-subtle">
            {company?.name}
          </p>
        </div>

        {/* Main Card */}
        <div className="border border-border-DEFAULT bg-background-elevated rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Badge */}
          <div className="bg-background-hover border-b border-border-DEFAULT px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 text-accent-blue" />
              <span className="text-xs font-mono font-bold text-content-DEFAULT uppercase tracking-wider">
                Company Claim Package
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* What's Included */}
            <div className="mb-8 pb-8 border-b border-border-DEFAULT">
              <p className="text-sm font-mono text-content-muted leading-relaxed mb-4">
                Claim this company and unlock full access to manage and grow your business. Here's what you get:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Full Company Control</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Complete access to manage all aspects of your company profile and operations
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Dashboard Access</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Advanced analytics, lead management, and business intelligence tools
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">API Integration</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Connect your existing tools and automate workflows with full API access
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Priority Support</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Direct access to our support team to help you get started
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Exclusive Features</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Access to premium tools and features not available to unclaimed companies
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="mb-8 text-center">
              <div className="text-xs font-mono text-content-subtle uppercase tracking-wider mb-2">
                One-Time Claim Fee
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl font-mono font-bold text-content-DEFAULT">$100</span>
              </div>
              <p className="text-xs font-mono text-content-subtle">
                Secure your company ownership permanently
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={processingPayment}
              className="w-full px-8 py-4 bg-accent-blue text-white font-mono text-sm font-bold rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            >
              {processingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  PROCEED TO SECURE PAYMENT
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-accent-red">{error}</p>
              </div>
            )}

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-border-DEFAULT">
              <div className="grid grid-cols-3 gap-4 text-xs font-mono text-content-subtle">
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-5 h-5 text-accent-green" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-blue" />
                  <span>Stripe Secure</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Check className="w-5 h-5 text-accent-green" />
                  <span>Money Back</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-content-subtle leading-relaxed max-w-lg mx-auto">
            Your payment is processed securely through Stripe. You'll receive immediate access to your company dashboard after successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}

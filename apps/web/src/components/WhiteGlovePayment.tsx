import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Shield, Check, Sparkles, Lock } from "lucide-react";

interface WhiteGlovePaymentProps {
  buildId: string;
  companyName: string;
  onSuccess?: () => void; // eslint-disable-line @typescript-eslint/no-unused-vars
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function WhiteGlovePayment({ buildId, companyName }: WhiteGlovePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // Create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/checkout/create-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            build_id: buildId,
            success_url: `${window.location.origin}/preview/${buildId}?unlocked=true`,
            cancel_url: `${window.location.origin}/preview/${buildId}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create checkout session");
      }

      const { session_id } = await response.json();

      // Redirect to Stripe Checkout (using newer API method)
      // @ts-expect-error - redirectToCheckout exists in Stripe v9 runtime but not in types
      const result = await stripe.redirectToCheckout({ sessionId: session_id });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <div className="bg-background-DEFAULT min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-blue mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-mono font-bold text-content-DEFAULT mb-2">
            Your Company Is Ready
          </h1>
          <p className="text-sm font-mono text-content-subtle">
            {companyName}
          </p>
        </div>

        {/* Main Card */}
        <div className="border border-border-DEFAULT bg-background-elevated rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Badge */}
          <div className="bg-background-hover border-b border-border-DEFAULT px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              <span className="text-xs font-mono font-bold text-content-DEFAULT uppercase tracking-wider">
                Complete Setup Package
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* What's Included */}
            <div className="mb-8 pb-8 border-b border-border-DEFAULT">
              <p className="text-sm font-mono text-content-muted leading-relaxed mb-4">
                Get everything you need to launch your company with personalized support. Here's what's included:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Complete Company Setup</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Full access to your 7-department AI workforce with everything configured
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">1-on-1 Kickoff Call</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      30-minute session to customize your setup and answer any questions
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
                      Direct access to our team for the first 30 days
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-bold text-content-DEFAULT">Production-Ready Assets</div>
                    <div className="text-xs font-mono text-content-subtle mt-1">
                      Website, legal docs, brand kit, and operational workflows ready to deploy
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="mb-8 text-center">
              <div className="text-xs font-mono text-content-subtle uppercase tracking-wider mb-2">
                One-Time Setup Fee
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl font-mono font-bold text-content-DEFAULT">$497</span>
              </div>
              <p className="text-xs font-mono text-content-subtle">
                Then $99/month for ongoing support and updates
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full px-8 py-4 bg-accent-blue text-white font-mono text-sm font-bold rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  UNLOCK YOUR COMPANY
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                <p className="text-xs font-mono text-accent-red">{error}</p>
              </div>
            )}

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t border-border-DEFAULT">
              <div className="flex items-center justify-center gap-6 text-xs font-mono text-content-subtle">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span>Secure Payment</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-content-subtle leading-relaxed max-w-lg mx-auto">
            Questions? Reach out anytime—we're here to help you get started.
          </p>
        </div>
      </div>
    </div>
  );
}

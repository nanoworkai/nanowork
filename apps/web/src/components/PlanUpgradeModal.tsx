/**
 * Plan Upgrade Modal
 *
 * Modal for upgrading subscription plan.
 * Shows plan comparison with features and pricing.
 * Supports monthly/yearly billing toggle.
 *
 * @component
 * @example
 * ```tsx
 * <PlanUpgradeModal isOpen={show} onClose={() => setShow(false)} />
 * ```
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PLAN_PRICES, PRICE_IDS, getPlanFeatures, createSubscriptionCheckout } from "../lib/stripe";

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BillingCycle = "monthly" | "yearly";
type Plan = "free" | "starter" | "growth" | "scale";

const PLANS: { id: Plan; name: string; description: string }[] = [
  { id: "free", name: "Free", description: "Get started" },
  { id: "starter", name: "Starter", description: "For individuals" },
  { id: "growth", name: "Growth", description: "For small teams" },
  { id: "scale", name: "Scale", description: "For companies" },
];

export function PlanUpgradeModal({ isOpen, onClose }: PlanUpgradeModalProps) {
  const { user, profile } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  if (!isOpen) return null;

  /**
   * Handle plan upgrade
   * Redirects to Stripe Checkout
   */
  const handleUpgrade = async (plan: Plan) => {
    if (!user || plan === "free") return;

    setSelectedPlan(plan);
    setLoading(true);

    try {
      // Get price ID based on plan and billing cycle
      const priceId =
        billingCycle === "yearly"
          ? PRICE_IDS[`${plan}_yearly`]
          : PRICE_IDS[`${plan}_monthly`];

      const { url, error } = await createSubscriptionCheckout(
        priceId,
        user.id,
        `${window.location.origin}/dashboard?subscription_success=true`,
        `${window.location.origin}/dashboard?subscription_canceled=true`
      );

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  /**
   * Get price for plan
   */
  const getPrice = (plan: Plan) => {
    if (plan === "free") return 0;
    return PLAN_PRICES[plan][billingCycle];
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface-1 rounded-2xl border border-white/10 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-surface-1 border-b border-white/10 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Upgrade Your Plan
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Choose the plan that's right for you
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-sm ${billingCycle === "monthly" ? "text-white font-medium" : "text-zinc-500"}`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative w-14 h-7 rounded-full bg-surface-2 border border-white/10"
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-brand-600 transition-transform ${
                    billingCycle === "yearly" ? "translate-x-7" : ""
                  }`}
                />
              </button>
              <span
                className={`text-sm ${billingCycle === "yearly" ? "text-white font-medium" : "text-zinc-500"}`}
              >
                Yearly
                <span className="ml-1 text-brand-400 text-xs">Save 17%</span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="p-8 grid md:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const price = getPrice(plan.id);
              const features = getPlanFeatures(plan.id);
              const isCurrent = profile?.plan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-6 ${
                    plan.id === "growth"
                      ? "border-brand-500 bg-brand-500/5"
                      : "border-white/10"
                  }`}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-4">
                      {price === 0 ? (
                        <div className="text-3xl font-bold text-white">Free</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-white">
                            ${price}
                          </div>
                          <div className="text-xs text-zinc-500">
                            per {billingCycle === "yearly" ? "year" : "month"}
                          </div>
                          {billingCycle === "yearly" && (
                            <div className="text-xs text-brand-400 mt-1">
                              ${Math.round(price / 12)}/month billed yearly
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-lg bg-white/10 text-white text-center font-semibold mb-6">
                      Current Plan
                    </div>
                  ) : plan.id === "free" ? (
                    <div className="w-full py-3 rounded-lg bg-white/5 text-zinc-500 text-center font-semibold mb-6">
                      Downgrade in settings
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 disabled:opacity-50 ${
                        plan.id === "growth"
                          ? "bg-brand-600 hover:bg-brand-500 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {loading && selectedPlan === plan.id
                        ? "Loading..."
                        : "Upgrade"}
                    </button>
                  )}

                  {/* Features List */}
                  <div className="space-y-3">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

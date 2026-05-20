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
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background-elevated rounded-2xl shadow-2xl border border-border-DEFAULT max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background-elevated border-b border-border-DEFAULT px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-content-DEFAULT">
                  Upgrade Your Plan
                </h2>
                <p className="text-sm text-content-subtle mt-1">
                  Choose the plan that's right for you
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-background-hover flex items-center justify-center text-content-subtle hover:text-content-DEFAULT transition-colors"
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
                className={`text-sm ${billingCycle === "monthly" ? "text-content-DEFAULT font-medium" : "text-content-subtle"}`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative w-14 h-7 rounded-full bg-background-hover border border-border-DEFAULT"
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-accent-blue transition-transform ${
                    billingCycle === "yearly" ? "translate-x-7" : ""
                  }`}
                />
              </button>
              <span
                className={`text-sm ${billingCycle === "yearly" ? "text-content-DEFAULT font-medium" : "text-content-subtle"}`}
              >
                Yearly
                <span className="ml-1 text-accent-green text-xs">Save 17%</span>
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
                      ? "border-accent-blue bg-accent-blue/5"
                      : "border-border-DEFAULT"
                  }`}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-content-DEFAULT">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-content-subtle mt-1">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-4">
                      {price === 0 ? (
                        <div className="text-3xl font-bold text-content-DEFAULT">Free</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-content-DEFAULT">
                            ${price}
                          </div>
                          <div className="text-xs text-content-subtle">
                            per {billingCycle === "yearly" ? "year" : "month"}
                          </div>
                          {billingCycle === "yearly" && (
                            <div className="text-xs text-accent-green mt-1">
                              ${Math.round(price / 12)}/month billed yearly
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-lg bg-background-hover text-content-DEFAULT text-center font-semibold mb-6">
                      Current Plan
                    </div>
                  ) : plan.id === "free" ? (
                    <div className="w-full py-3 rounded-lg bg-background-hover text-content-subtle text-center font-semibold mb-6">
                      Downgrade in settings
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 disabled:opacity-50 ${
                        plan.id === "growth"
                          ? "bg-accent-blue hover:bg-accent-blue/90 text-white"
                          : "bg-background-hover hover:bg-background-press text-content-DEFAULT"
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
                          className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5"
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
                        <span className="text-sm text-content-muted">{feature}</span>
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

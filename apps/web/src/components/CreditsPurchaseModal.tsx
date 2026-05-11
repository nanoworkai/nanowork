/**
 * Credits Purchase Modal
 *
 * Modal for purchasing credits packages via Stripe Checkout.
 * Shows 3 packages: Starter (1K), Pro (5K - most popular), Scale (20K).
 *
 * @component
 * @example
 * ```tsx
 * <CreditsPurchaseModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CREDITS_PACKAGES, createCreditsCheckout } from "../lib/stripe";

interface CreditsPurchaseModalProps {
  /** Control modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
}

export function CreditsPurchaseModal({
  isOpen,
  onClose,
}: CreditsPurchaseModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * Handle package purchase
   * Redirects to Stripe Checkout
   */
  const handlePurchase = async (packageId: string) => {
    if (!user || !profile) return;

    const pkg = CREDITS_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return;

    setSelectedPackage(packageId);
    setLoading(true);

    try {
      const { url, error } = await createCreditsCheckout(
        pkg.priceId,
        user.id,
        pkg.credits,
        `${window.location.origin}/dashboard?credits_success=true`,
        `${window.location.origin}/dashboard?credits_canceled=true`
      );

      if (error) {
        alert(`Error: ${error}`);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
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
        <div className="bg-surface-1 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-surface-1 border-b border-white/10 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Buy Credits</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Choose a package to power your AI companies
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

          {/* Packages Grid */}
          <div className="p-8 grid md:grid-cols-3 gap-6">
            {CREDITS_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  pkg.popular
                    ? "border-white/20 bg-white/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-white text-white text-xs font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Package Details */}
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {pkg.name}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-zinc-400 mb-4">credits</div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white">
                      ${pkg.price}
                    </div>
                    {'savings' in pkg && pkg.savings && (
                      <div className="text-xs text-white font-medium mt-1">
                        Save {pkg.savings}
                      </div>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      pkg.popular
                        ? "bg-white hover:bg-white text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <div className="flex items-center justify-center gap-2">
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
                        Loading...
                      </div>
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="mt-6 space-y-2">
                  <div className="text-xs text-zinc-500 font-medium">
                    INCLUDES:
                  </div>
                  <div className="text-sm text-zinc-400">
                    • Company creation
                  </div>
                  <div className="text-sm text-zinc-400">
                    • Agent actions
                  </div>
                  <div className="text-sm text-zinc-400">
                    • Email sending
                  </div>
                  <div className="text-sm text-zinc-400">
                    • API calls
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="border-t border-white/10 px-8 py-4 text-center">
            <p className="text-xs text-zinc-500">
              Credits never expire. Secure payment via Stripe.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check, Building2, TrendingUp, Zap } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

interface ClaimBusinessModalProps {
  isOpen: boolean;
  company: {
    id: string;
    name: string;
    tagline?: string;
    description: string;
    tier: string;
    price_cents: number;
    estimated_arr_min?: number;
    estimated_arr_max?: number;
    features?: string[];
  };
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
        `/?claim=${company.id}`
      )}`;
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/showcase/checkout', {
        method: 'POST',
        body: JSON.stringify({
          companyId: company.id,
          userId: user!.id,
          successUrl: `${window.location.origin}/dashboard?claim_success=true&company_id=${company.id}`,
          cancelUrl: `${window.location.origin}/?claim_canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to start checkout'}`);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
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
            {company.features && company.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                  What You Get
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {company.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

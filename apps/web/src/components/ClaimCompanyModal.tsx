import { X, CheckCircle2, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AICompany } from "./CompanyShowcase";

/**
 * CLAIM COMPANY MODAL
 *
 * Modal flow for claiming an AI-generated company.
 * Shows company details, pricing breakdown, and claim confirmation.
 *
 * Design: Bloomberg terminal aesthetic with dense data display
 */

interface ClaimCompanyModalProps {
  company: AICompany;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimCompanyModal({ company, isOpen, onClose }: ClaimCompanyModalProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleClaim = async () => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Navigate to dashboard or payment
    navigate(`/dashboard?claimed=${company.id}`);
  };

  // Calculate value metrics
  const roiMonths = Math.ceil((company.claimPrice / (company.arrPotential / 12)) * 100) / 100;
  const monthlyARR = Math.floor(company.arrPotential / 12);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="card-xl rounded-none border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4 bg-surface-1 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{company.icon}</div>
                <div>
                  <h2 className="text-lg font-mono font-bold text-white">{company.name}</h2>
                  <p className="text-xs font-mono text-white/50 uppercase tracking-wider">
                    {company.industry}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-3 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Tagline */}
            <div>
              <p className="text-sm font-mono text-white/70 leading-relaxed">
                {company.tagline}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card rounded-none border border-white/10 p-4 bg-surface-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-mono text-white/50 uppercase">ARR</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tabular-nums">
                  ${(company.arrPotential / 1000).toFixed(0)}K
                </div>
                <div className="text-xs font-mono text-white/40 mt-1 tabular-nums">
                  ${(monthlyARR / 1000).toFixed(1)}K/mo
                </div>
              </div>

              <div className="card rounded-none border border-white/10 p-4 bg-surface-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-white/50" />
                  <span className="text-xs font-mono text-white/50 uppercase">Price</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white tabular-nums">
                  ${(company.claimPrice / 1000).toFixed(1)}K
                </div>
                <div className="text-xs font-mono text-white/40 mt-1">
                  One-time fee
                </div>
              </div>

              <div className="card rounded-none border border-white/10 p-4 bg-surface-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="text-xs font-mono text-white/50 uppercase">ROI</span>
                </div>
                <div className="text-2xl font-mono font-bold text-green-400 tabular-nums">
                  {roiMonths}mo
                </div>
                <div className="text-xs font-mono text-white/40 mt-1">
                  Breakeven
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div>
              <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider mb-3">
                What's Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Legal entity formation",
                  "Brand identity & guidelines",
                  "Production website",
                  "Marketing automation",
                  "Payment processing",
                  "Customer dashboard",
                  "Email sequences",
                  "Analytics setup",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-mono text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider mb-3">
                Core Features
              </h3>
              <div className="space-y-2">
                {company.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                    <span className="text-xs font-mono text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Model */}
            <div className="card rounded-none border border-white/10 p-4 bg-surface-1">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
                Revenue Model
              </h3>
              <div className="space-y-2 text-xs font-mono text-white/60 leading-relaxed">
                <p>
                  <span className="text-white font-bold">Subscription:</span> ${(monthlyARR / 2 / 100).toFixed(0)}/mo per customer
                </p>
                <p>
                  <span className="text-white font-bold">Target:</span> {Math.ceil(company.arrPotential / 12 / (monthlyARR / 2 / 100))} customers
                </p>
                <p>
                  <span className="text-white font-bold">Market:</span> ${(company.arrPotential * 100 / 1000000).toFixed(1)}M addressable
                </p>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="border border-yellow-400/20 bg-yellow-400/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                <div className="text-xs font-mono text-yellow-200/80 leading-relaxed">
                  <span className="font-bold text-yellow-400">Notice:</span> This is a pre-built business
                  with estimated revenue potential. Actual performance depends on your execution, market
                  conditions, and go-to-market strategy. All infrastructure is production-ready.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4 bg-surface-1 sticky bottom-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-white/60">
                <span className="text-white font-bold">{company.name}</span> will be transferred to
                your account
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-none bg-surface-3 hover:bg-surface-4 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : `Claim for $${(company.claimPrice / 1000).toFixed(1)}K`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

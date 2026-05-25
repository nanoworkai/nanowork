import { useState } from "react";
import {
  X,
  TrendingUp,
  CheckCircle2,
  Package,
  Code,
  Zap,
  Shield,
  Clock,
  Users,
  BarChart3,
  Rocket,
  Share2,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import type { Business } from "../data/businesses";
import { formatPrice } from "../data/businesses";
import { BusinessPreviewRenderer } from "./BusinessPreviewRenderer";

interface BusinessDetailViewProps {
  business: Business;
  onClose: () => void;
  onClaim: () => void;
  isOpen: boolean;
}

/**
 * Comprehensive Business Detail View
 * Shows complete business information before purchase
 * Can be used as a modal overlay or dedicated page
 */
export function BusinessDetailView({
  business,
  onClose,
  onClaim,
  isOpen,
}: BusinessDetailViewProps) {
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "financial">("overview");

  if (!isOpen) return null;

  const isAvailable = business.status === "available";
  const isPending = business.status === "pending";

  // Calculate ARR from MRR
  const getARRData = () => {
    if (!business.mrr) return null;
    const monthly = parseFloat(business.mrr.replace(/[^0-9.]/g, ""));
    const annual = monthly * 12;
    return {
      monthly,
      annual,
      formatted: `$${(annual / 1000).toFixed(0)}K`,
    };
  };

  const arrData = getARRData();

  // Calculate ROI estimate (simple 2x multiple)
  const getROIEstimate = () => {
    if (!arrData) return null;
    const roi = ((arrData.annual * 2 - business.price) / business.price) * 100;
    return Math.round(roi);
  };

  const roiEstimate = getROIEstimate();

  const handleBookmark = () => {
    setSavedBookmark(!savedBookmark);
    // TODO: Integrate with actual bookmark API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.tagline,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 flex items-start justify-center pt-8 pb-20">
          <div
            className="bg-surface-0 border border-white/10 shadow-2xl w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface-1 border-b border-white/10 z-10">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  {isAvailable ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-mono text-green-400 uppercase">Available</span>
                    </div>
                  ) : isPending ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-mono text-amber-400 uppercase">Pending</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 border border-white/20">
                      <CheckCircle2 className="w-3 h-3 text-white/60" />
                      <span className="text-xs font-mono text-white/60 uppercase">Sold</span>
                    </div>
                  )}

                  <div className="h-4 w-px bg-white/10" />

                  <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                    {business.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action Buttons */}
                  <button
                    onClick={handleShare}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors ${
                      savedBookmark ? "text-amber-400" : "text-white/60 hover:text-white"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${savedBookmark ? "fill-current" : ""}`} />
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-2" />

                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-[1fr,400px] gap-8 p-6 sm:p-8">
              {/* Left Column - Main Content */}
              <div className="space-y-8">
                {/* Hero Section */}
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-3 leading-tight">
                    {business.name}
                  </h1>
                  <p className="text-base sm:text-lg font-mono text-white/70 mb-6">
                    {business.tagline}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/40">
                    {arrData && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{arrData.formatted} ARR potential</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      <span>{business.stack.length} technologies</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{business.includes.length} items included</span>
                    </div>
                  </div>
                </div>

                {/* Preview/Screenshot Section */}
                <div className="border border-white/10 overflow-hidden">
                  <BusinessPreviewRenderer
                    preview={business.preview}
                    theme={business.theme}
                  />
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-white/10">
                  <div className="flex gap-6">
                    {[
                      { id: "overview", label: "Overview", icon: Package },
                      { id: "technical", label: "Tech Stack", icon: Code },
                      { id: "financial", label: "Financials", icon: BarChart3 },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 pb-3 border-b-2 transition-colors font-mono text-sm ${
                          activeTab === tab.id
                            ? "border-white text-white"
                            : "border-transparent text-white/40 hover:text-white/60"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === "overview" && (
                    <>
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                          About This Business
                        </h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                          {business.description}
                        </p>
                      </div>

                      {/* What's Included */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          What's Included
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {business.includes.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-surface-1 border border-white/5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-white/80">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Features */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Key Features
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            "Complete source code access",
                            "Production-ready deployment",
                            "Documentation included",
                            "Design assets & brand guide",
                            "Database schema & migrations",
                            "API integrations configured",
                          ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "technical" && (
                    <>
                      {/* Tech Stack */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Technology Stack
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {business.stack.map((tech, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-surface-1 border border-white/10"
                            >
                              <span className="font-mono text-sm text-white">{tech}</span>
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                          Technical Details
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start justify-between p-3 bg-surface-1 border border-white/5">
                            <span className="text-white/60">Architecture</span>
                            <span className="text-white text-right">Modern full-stack application</span>
                          </div>
                          <div className="flex items-start justify-between p-3 bg-surface-1 border border-white/5">
                            <span className="text-white/60">Deployment</span>
                            <span className="text-white text-right">Cloud-ready, scalable infrastructure</span>
                          </div>
                          <div className="flex items-start justify-between p-3 bg-surface-1 border border-white/5">
                            <span className="text-white/60">Code Quality</span>
                            <span className="text-white text-right">TypeScript, tested, documented</span>
                          </div>
                          <div className="flex items-start justify-between p-3 bg-surface-1 border border-white/5">
                            <span className="text-white/60">Maintenance</span>
                            <span className="text-white text-right">Easy to update and customize</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "financial" && (
                    <>
                      {/* Revenue Metrics */}
                      {arrData && (
                        <div>
                          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Revenue Potential
                          </h3>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-surface-1 border border-white/10">
                              <div className="text-xs font-mono text-white/40 uppercase mb-2">
                                Monthly Recurring
                              </div>
                              <div className="text-2xl font-mono font-bold text-green-400 tabular-nums">
                                ${arrData.monthly.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-4 bg-surface-1 border border-white/10">
                              <div className="text-xs font-mono text-white/40 uppercase mb-2">
                                Annual Potential
                              </div>
                              <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                                ${arrData.annual.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-4 bg-surface-1 border border-white/10">
                              <div className="text-xs font-mono text-white/40 uppercase mb-2">
                                Est. ROI (24mo)
                              </div>
                              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                                {roiEstimate}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing Breakdown */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                          Investment Breakdown
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-surface-1 border border-white/10">
                            <span className="text-sm text-white/70">Business Package</span>
                            <span className="text-lg font-mono font-bold text-white">
                              {formatPrice(business.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20">
                            <span className="text-sm text-white/70">Processing Fee</span>
                            <span className="text-lg font-mono font-bold text-green-400">$0</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-surface-1 border border-white/20">
                            <span className="text-sm font-mono font-bold text-white uppercase">
                              Total Today
                            </span>
                            <span className="text-2xl font-mono font-bold text-white">
                              {formatPrice(business.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Business Model */}
                      <div>
                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
                          Business Model
                        </h3>
                        <div className="p-4 bg-surface-1 border border-white/10 space-y-3 text-sm text-white/70">
                          <p>
                            This business operates on a subscription/transaction model with proven
                            revenue potential. All payment processing, customer management, and core
                            features are already configured.
                          </p>
                          <p>
                            After purchase, you'll have complete ownership and control. Customize
                            pricing, add features, and scale at your own pace.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Getting Started */}
                <div className="p-6 bg-surface-1 border border-white/10">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    What Happens After Purchase
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        step: "1",
                        title: "Instant Access",
                        desc: "Get immediate access to the complete codebase, assets, and documentation",
                      },
                      {
                        step: "2",
                        title: "Setup Support",
                        desc: "30-day support window to help you deploy and customize",
                      },
                      {
                        step: "3",
                        title: "Start Earning",
                        desc: "Launch your business and start generating revenue immediately",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white text-black font-mono font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-white font-bold mb-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-white/60">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Sticky Sidebar */}
              <div className="lg:sticky lg:top-24 h-fit space-y-6">
                {/* Pricing Card */}
                <div className="border border-white/10 bg-surface-1 p-6">
                  <div className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                    One-Time Investment
                  </div>
                  <div className="text-4xl font-mono font-bold text-white mb-6 tabular-nums">
                    {formatPrice(business.price)}
                  </div>

                  {/* CTA Button */}
                  {isAvailable ? (
                    <button
                      onClick={onClaim}
                      className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-mono font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group"
                    >
                      Claim This Business
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-white/10 text-white/40 font-mono font-bold text-sm uppercase tracking-wider cursor-not-allowed"
                    >
                      {isPending ? "Pending Transfer" : "Already Sold"}
                    </button>
                  )}

                  {isAvailable && (
                    <button className="w-full mt-3 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-mono text-sm uppercase tracking-wider transition-colors">
                      Contact Sales
                    </button>
                  )}
                </div>

                {/* Key Details */}
                <div className="border border-white/10 bg-surface-1 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white uppercase mb-1">
                        Secure Purchase
                      </div>
                      <div className="text-xs text-white/60">
                        Payment processed via Stripe. 30-day money-back guarantee.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white uppercase mb-1">
                        Launch Support
                      </div>
                      <div className="text-xs text-white/60">
                        30 days of post-purchase support included with every business.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Rocket className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-mono font-bold text-white uppercase mb-1">
                        Ready to Launch
                      </div>
                      <div className="text-xs text-white/60">
                        95% complete. Deploy and start earning within days.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="text-center text-xs font-mono text-white/30 space-y-1">
                  <div>SECURE PAYMENT • INSTANT ACCESS</div>
                  <div>30-DAY GUARANTEE • FULL OWNERSHIP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

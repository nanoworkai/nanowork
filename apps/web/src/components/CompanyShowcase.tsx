import { useState } from "react";
import { ArrowRight, TrendingUp, Building2, Zap, Globe, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * AI-GENERATED COMPANY SHOWCASE
 *
 * Displays pre-built AI companies as a marketplace of ready-to-claim businesses.
 * Each company card shows key metrics: ARR potential, claim price, industry, and features.
 *
 * Design: Bloomberg terminal aesthetic - dense data, monospace typography, dark surfaces
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

export interface AICompany {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  category: "saas" | "marketplace" | "ecommerce" | "fintech" | "ai" | "social";
  arrPotential: number; // Annual Recurring Revenue estimate
  claimPrice: number; // One-time price to claim
  features: string[];
  status: "available" | "claimed" | "building";
  icon: string; // Emoji or icon identifier
  color: string; // Accent color for visual differentiation
  buildProgress?: number; // 0-100 if status is "building"
}

// ──────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - AI-Generated Company Catalog
// ──────────────────────────────────────────────────────────────────────────────

const SAMPLE_COMPANIES: AICompany[] = [
  {
    id: "comp_001",
    name: "FlowFinance",
    tagline: "Invoice automation for B2B companies",
    industry: "FinTech",
    category: "fintech",
    arrPotential: 250000,
    claimPrice: 4999,
    features: ["Automated invoicing", "Payment tracking", "Stripe integration", "Client portal"],
    status: "available",
    icon: "💳",
    color: "#10b981",
  },
  {
    id: "comp_002",
    name: "CreatorStack",
    tagline: "Content monetization platform for creators",
    industry: "SaaS",
    category: "saas",
    arrPotential: 500000,
    claimPrice: 7999,
    features: ["Subscription management", "Digital products", "Member dashboard", "Analytics"],
    status: "available",
    icon: "🎨",
    color: "#8b5cf6",
  },
  {
    id: "comp_003",
    name: "LocalEats",
    tagline: "Delivery marketplace for regional restaurants",
    industry: "Marketplace",
    category: "marketplace",
    arrPotential: 1200000,
    claimPrice: 12999,
    features: ["Restaurant admin", "Order management", "Delivery tracking", "Customer app"],
    status: "building",
    icon: "🍕",
    color: "#f59e0b",
    buildProgress: 68,
  },
  {
    id: "comp_004",
    name: "CodeMentor AI",
    tagline: "AI-powered code review and mentorship",
    industry: "AI/ML",
    category: "ai",
    arrPotential: 800000,
    claimPrice: 9999,
    features: ["Real-time code review", "Learning paths", "Team analytics", "IDE integration"],
    status: "available",
    icon: "🤖",
    color: "#06b6d4",
  },
  {
    id: "comp_005",
    name: "FitTrack Pro",
    tagline: "Personal training app with AI coach",
    industry: "Health & Fitness",
    category: "saas",
    arrPotential: 350000,
    claimPrice: 5999,
    features: ["Workout plans", "Progress tracking", "Nutrition logging", "Video library"],
    status: "available",
    icon: "💪",
    color: "#ef4444",
  },
  {
    id: "comp_006",
    name: "PropConnect",
    tagline: "B2B property management platform",
    industry: "Real Estate",
    category: "saas",
    arrPotential: 600000,
    claimPrice: 8999,
    features: ["Tenant portal", "Maintenance requests", "Payment processing", "Lease management"],
    status: "claimed",
    icon: "🏢",
    color: "#3b82f6",
  },
  {
    id: "comp_007",
    name: "SustainShop",
    tagline: "Eco-friendly products marketplace",
    industry: "E-commerce",
    category: "ecommerce",
    arrPotential: 450000,
    claimPrice: 6999,
    features: ["Vendor onboarding", "Carbon tracking", "Subscription boxes", "Mobile app"],
    status: "available",
    icon: "🌱",
    color: "#22c55e",
  },
  {
    id: "comp_008",
    name: "TeamSync",
    tagline: "Async collaboration for remote teams",
    industry: "Productivity",
    category: "saas",
    arrPotential: 900000,
    claimPrice: 11999,
    features: ["Video messages", "Screen recording", "Team spaces", "Integrations"],
    status: "available",
    icon: "🎯",
    color: "#a855f7",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// COMPANY CARD COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface CompanyCardProps {
  company: AICompany;
  onClaim: (companyId: string) => void;
}

function CompanyCard({ company, onClaim }: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = company.status === "available";
  const isBuilding = company.status === "building";

  return (
    <div
      className={`card rounded-none border border-white/10 transition-all duration-200 ${
        isAvailable ? "hover:bg-surface-3 hover:border-white/20 cursor-pointer" : ""
      } ${!isAvailable ? "opacity-60" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header: Icon + Status */}
      <div className="border-b border-white/10 px-4 py-3 bg-surface-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{company.icon}</div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white">{company.name}</h3>
            <p className="text-xs font-mono text-white/50 uppercase tracking-wider">{company.industry}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          {isBuilding ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-mono text-yellow-400">BUILDING</span>
            </>
          ) : company.status === "claimed" ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="text-xs font-mono text-white/40">CLAIMED</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-green-400">AVAILABLE</span>
            </>
          )}
        </div>
      </div>

      {/* Body: Content */}
      <div className="p-4 space-y-4">
        {/* Tagline */}
        <p className="text-xs text-white/70 leading-relaxed">{company.tagline}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* ARR Potential */}
          <div className="border border-white/5 bg-surface-1 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs font-mono text-white/50 uppercase">ARR Potential</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              ${(company.arrPotential / 1000).toFixed(0)}K
            </div>
          </div>

          {/* Claim Price */}
          <div className="border border-white/5 bg-surface-1 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3 h-3 text-white/50" />
              <span className="text-xs font-mono text-white/50 uppercase">Claim Price</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              ${(company.claimPrice / 1000).toFixed(1)}K
            </div>
          </div>
        </div>

        {/* Building Progress */}
        {isBuilding && company.buildProgress !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">Build Progress</span>
              <span className="text-white font-bold tabular-nums">{company.buildProgress}%</span>
            </div>
            <div className="h-1 bg-surface-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${company.buildProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Key Features</span>
          <ul className="space-y-1">
            {company.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                <span className="text-xs font-mono text-white/60">{feature}</span>
              </li>
            ))}
            {company.features.length > 3 && (
              <li className="text-xs font-mono text-white/40 ml-3">
                +{company.features.length - 3} more
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer: CTA */}
      <div className="border-t border-white/10 p-4">
        {isAvailable ? (
          <button
            onClick={() => onClaim(company.id)}
            className="w-full px-4 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 group"
          >
            Claim This Business
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isHovered ? "translate-x-0.5" : ""}`} />
          </button>
        ) : isBuilding ? (
          <div className="w-full px-4 py-2.5 rounded-none bg-surface-3 text-white/40 font-mono text-xs font-bold uppercase tracking-wider text-center cursor-not-allowed">
            Building in Progress
          </div>
        ) : (
          <div className="w-full px-4 py-2.5 rounded-none bg-surface-3 text-white/40 font-mono text-xs font-bold uppercase tracking-wider text-center cursor-not-allowed">
            Already Claimed
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FILTER BAR COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function FilterBar({ selectedCategory, onCategoryChange }: FilterBarProps) {
  const categories = [
    { id: "all", label: "All Companies" },
    { id: "saas", label: "SaaS" },
    { id: "marketplace", label: "Marketplace" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "fintech", label: "FinTech" },
    { id: "ai", label: "AI/ML" },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`px-4 py-2 rounded-none font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
            selectedCategory === cat.id
              ? "bg-white text-black"
              : "bg-surface-2 text-white/60 hover:text-white hover:bg-surface-3 border border-white/10"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN SHOWCASE COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function CompanyShowcase() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter companies by category
  const filteredCompanies = selectedCategory === "all"
    ? SAMPLE_COMPANIES
    : SAMPLE_COMPANIES.filter(c => c.category === selectedCategory);

  // Stats
  const availableCount = SAMPLE_COMPANIES.filter(c => c.status === "available").length;
  const totalARR = SAMPLE_COMPANIES.reduce((sum, c) => sum + c.arrPotential, 0);

  const handleClaim = (companyId: string) => {
    // Navigate to claim flow or open modal
    navigate(`/claim/${companyId}`);
  };

  return (
    <section className="py-8 sm:py-12">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-white/60" />
              <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
                AI-Generated Companies
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-tight mb-2">
              Ready-Made Businesses
            </h2>
            <p className="text-xs sm:text-sm font-mono text-white/60 leading-relaxed max-w-2xl">
              Pre-built companies ready to claim. Each includes legal setup, brand design, live website,
              and operational infrastructure. Start generating revenue from day one.
            </p>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white tabular-nums">{availableCount}</div>
              <div className="text-xs font-mono text-white/40 uppercase">Available</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-green-400 tabular-nums">
                ${(totalARR / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs font-mono text-white/40 uppercase">Total ARR</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.id} company={company} onClaim={handleClaim} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="card-lg rounded-none border border-white/10 p-12 text-center">
          <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">
            No companies available in this category.
          </p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-8 card rounded-none border border-white/10 p-6 bg-surface-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-mono font-bold text-white mb-1">
              Want a Custom Company Built?
            </h3>
            <p className="text-xs font-mono text-white/60">
              Describe your idea and our AI departments will build it from scratch.
            </p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            Build Custom
          </button>
        </div>
      </div>
    </section>
  );
}

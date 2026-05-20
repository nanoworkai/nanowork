import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Calendar, Zap } from "lucide-react";

/**
 * COMPANY LIBRARY - AI-GENERATED BUSINESS CATALOG
 *
 * Professional, data-dense catalog of AI-generated business opportunities.
 * Terminal/Bloomberg aesthetic - serious, minimal, no fluff.
 * Weekly refresh cycle clearly communicated.
 */

// ──────────────────────────────────────────────────────────────────────────────
// MOCK COMPANY DATA
// ──────────────────────────────────────────────────────────────────────────────

export interface CompanyIdea {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  features: string[];
  tags: string[];
  revenue_potential: string;
  target_market: string;
  complexity: "Simple" | "Moderate" | "Advanced";
}

const COMPANY_IDEAS: CompanyIdea[] = [
  {
    id: "eco-fashion-hub",
    name: "EcoThreads Marketplace",
    tagline: "Sustainable fashion marketplace connecting conscious consumers with verified eco-brands",
    category: "E-Commerce",
    price: 100,
    features: [
      "Curated sustainable brand directory",
      "Carbon footprint calculator per purchase",
      "Supply chain transparency dashboard",
      "Email marketing automation",
    ],
    tags: ["sustainability", "fashion", "marketplace"],
    revenue_potential: "$5-15k MRR",
    target_market: "Millennials & Gen Z eco-conscious shoppers",
    complexity: "Moderate",
  },
  {
    id: "ai-fitness-coach",
    name: "FitForm AI",
    tagline: "AI-powered fitness coach that creates personalized workout plans and tracks form in real-time",
    category: "Health & Fitness",
    price: 100,
    features: [
      "Personalized workout generation",
      "Progress tracking dashboard",
      "Stripe subscription billing ($29/mo)",
      "Mobile-responsive web app",
    ],
    tags: ["ai", "fitness", "saas", "subscription"],
    revenue_potential: "$10-30k MRR",
    target_market: "Busy professionals 25-45",
    complexity: "Advanced",
  },
  {
    id: "creator-collab",
    name: "CreatorMatch",
    tagline: "Platform matching content creators with brands for authentic sponsored collaborations",
    category: "Creator Economy",
    price: 100,
    features: [
      "Creator profile marketplace",
      "Brand campaign management",
      "Contract generation & e-signatures",
      "Payment escrow system",
    ],
    tags: ["creators", "marketing", "marketplace"],
    revenue_potential: "$8-20k MRR",
    target_market: "Micro-influencers & small brands",
    complexity: "Moderate",
  },
  {
    id: "local-service-hub",
    name: "NeighborHelp",
    tagline: "Local services marketplace connecting homeowners with vetted contractors and handymen",
    category: "Services",
    price: 100,
    features: [
      "Service provider directory",
      "Booking & scheduling system",
      "Review & rating system",
      "Lead generation for providers",
    ],
    tags: ["local", "services", "marketplace"],
    revenue_potential: "$5-12k MRR",
    target_market: "Homeowners in suburban areas",
    complexity: "Simple",
  },
  {
    id: "newsletter-growth",
    name: "NewsletterBoost",
    tagline: "Growth toolkit for newsletter creators with subscriber acquisition and monetization tools",
    category: "SaaS",
    price: 100,
    features: [
      "Subscriber growth analytics",
      "Cross-promotion network",
      "Sponsor matching service",
      "Email template library",
    ],
    tags: ["newsletter", "creators", "saas"],
    revenue_potential: "$15-40k MRR",
    target_market: "Newsletter writers & publishers",
    complexity: "Moderate",
  },
  {
    id: "remote-team-perks",
    name: "RemotePerksCo",
    tagline: "Curated benefits platform for remote-first companies to offer location-independent perks",
    category: "HR Tech",
    price: 100,
    features: [
      "Vendor partnership network",
      "Employee perk portal",
      "Usage analytics dashboard",
      "Automated billing & invoicing",
    ],
    tags: ["remote work", "hr", "b2b"],
    revenue_potential: "$10-25k MRR",
    target_market: "Remote-first startups 10-100 employees",
    complexity: "Moderate",
  },
  {
    id: "study-abroad-prep",
    name: "StudyPath Global",
    tagline: "End-to-end study abroad platform helping students navigate applications, visas, and housing",
    category: "Education",
    price: 100,
    features: [
      "University matching algorithm",
      "Application tracking system",
      "Visa guidance resources",
      "Student community forum",
    ],
    tags: ["education", "international", "marketplace"],
    revenue_potential: "$8-18k MRR",
    target_market: "International students 18-25",
    complexity: "Advanced",
  },
  {
    id: "pet-sitting-network",
    name: "PawsAndHome",
    tagline: "Trusted pet-sitting network connecting traveling pet owners with vetted local sitters",
    category: "Services",
    price: 100,
    features: [
      "Sitter profile & verification",
      "Booking & payment system",
      "Real-time pet photo updates",
      "Insurance integration",
    ],
    tags: ["pets", "services", "marketplace"],
    revenue_potential: "$6-15k MRR",
    target_market: "Urban pet owners who travel",
    complexity: "Simple",
  },
  {
    id: "micro-saas-invoicing",
    name: "InvoiceSwift",
    tagline: "Beautiful, lightning-fast invoicing for freelancers who hate accounting software",
    category: "Fintech",
    price: 100,
    features: [
      "One-click invoice generation",
      "Payment tracking & reminders",
      "Stripe & PayPal integration",
      "Expense tracking",
    ],
    tags: ["fintech", "freelance", "saas"],
    revenue_potential: "$12-35k MRR",
    target_market: "Freelancers & solopreneurs",
    complexity: "Simple",
  },
  {
    id: "course-creator-tools",
    name: "CourseCraft Studio",
    tagline: "All-in-one platform for creators to build, market, and sell online courses",
    category: "Education",
    price: 100,
    features: [
      "Course builder with video hosting",
      "Student management portal",
      "Email marketing automation",
      "Analytics & completion tracking",
    ],
    tags: ["education", "creators", "saas"],
    revenue_potential: "$15-45k MRR",
    target_market: "Expert creators & coaches",
    complexity: "Advanced",
  },
  {
    id: "wedding-vendor-hub",
    name: "WeddingVendorHub",
    tagline: "Local wedding vendor marketplace helping couples find and book trusted wedding pros",
    category: "Events",
    price: 100,
    features: [
      "Vendor directory & portfolios",
      "Availability calendar sync",
      "Quote request system",
      "Review & rating platform",
    ],
    tags: ["weddings", "local", "marketplace"],
    revenue_potential: "$7-16k MRR",
    target_market: "Engaged couples planning weddings",
    complexity: "Moderate",
  },
  {
    id: "therapy-booking",
    name: "MindfulMatch",
    tagline: "Mental health platform matching clients with therapists based on specialty, insurance, and style",
    category: "Healthcare",
    price: 100,
    features: [
      "Therapist matching algorithm",
      "Insurance verification system",
      "Secure booking platform",
      "Telehealth video integration",
    ],
    tags: ["mental health", "healthcare", "saas"],
    revenue_potential: "$20-50k MRR",
    target_market: "Adults seeking therapy 25-55",
    complexity: "Advanced",
  },
];

const CATEGORIES = ["All", "E-Commerce", "SaaS", "Services", "Education", "Health & Fitness", "Creator Economy", "Fintech", "Events", "Healthcare", "HR Tech"];

// Current batch info (in production, this would come from API)
const CURRENT_BATCH = {
  number: 47,
  generated: "2026-05-13",
  nextRefresh: "2026-05-27",
};

// ──────────────────────────────────────────────────────────────────────────────
// COMPANY CARD COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface CompanyCardProps {
  company: CompanyIdea;
  onClaim: (company: CompanyIdea) => void;
}

function CompanyCard({ company, onClaim }: CompanyCardProps) {
  return (
    <div className="border border-border-DEFAULT hover:border-content-tertiary transition-colors bg-background-elevated">
      {/* Header - Company Info */}
      <div className="border-b border-border-DEFAULT p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-content-tertiary uppercase tracking-wider">
                {company.category}
              </span>
            </div>
            <h3 className="text-base font-semibold text-content-primary mb-1 truncate">
              {company.name}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-content-primary">
              ${company.price}
            </div>
          </div>
        </div>
        <p className="text-sm text-content-secondary leading-snug line-clamp-2">
          {company.tagline}
        </p>
      </div>

      {/* Data Section */}
      <div className="p-4 space-y-3 border-b border-border-DEFAULT bg-background-DEFAULT">
        {/* Revenue */}
        <div>
          <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-0.5">
            Revenue Potential
          </div>
          <div className="font-mono text-xs text-content-primary">
            {company.revenue_potential}
          </div>
        </div>

        {/* Target Market */}
        <div>
          <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-0.5">
            Target Market
          </div>
          <div className="text-xs text-content-secondary">
            {company.target_market}
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-1">
            Included Infrastructure
          </div>
          <ul className="space-y-0.5">
            {company.features.map((feature, i) => (
              <li key={i} className="text-xs text-content-secondary leading-snug flex">
                <span className="text-content-tertiary mr-2">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action */}
      <div className="p-4">
        <button
          onClick={() => onClaim(company)}
          className="w-full px-4 py-2.5 bg-content-primary hover:bg-content-primary/90 text-white font-mono text-xs uppercase tracking-wider transition-colors border border-content-primary"
        >
          Claim Company for ${company.price}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN LIBRARY COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function CompanyLibrary() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCompanies = COMPANY_IDEAS.filter((company) => {
    return selectedCategory === "All" || company.category === selectedCategory;
  });

  const handleClaim = (company: CompanyIdea) => {
    // Navigate to claim preview page
    navigate(`/claim/${company.id}/preview`);
  };

  // Calculate days until next refresh
  const today = new Date();
  const nextRefresh = new Date(CURRENT_BATCH.nextRefresh);
  const daysUntilRefresh = Math.ceil((nextRefresh.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <section className="py-12 sm:py-16">
      {/* Header with AI-Generated Context */}
      <div className="mb-8 border-b border-border-DEFAULT pb-8">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                AI-Generated Companies
              </h2>
            </div>
            <p className="text-base text-content-primary mb-2 max-w-3xl">
              Fresh batch generated weekly. Claim any company for $100.
            </p>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Each company includes complete operational infrastructure: branding, website, marketing automation, sales pipeline, and all 7 core departments ready to run.
            </p>
          </div>

          {/* Batch Info Card */}
          <div className="hidden lg:block border border-border-DEFAULT bg-background-elevated p-4 min-w-[200px]">
            <div className="space-y-2">
              <div>
                <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-0.5">
                  Current Batch
                </div>
                <div className="font-mono text-xl font-bold text-content-primary">
                  #{CURRENT_BATCH.number}
                </div>
              </div>
              <div className="border-t border-border-DEFAULT pt-2">
                <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-0.5">
                  Generated
                </div>
                <div className="font-mono text-xs text-content-secondary">
                  {CURRENT_BATCH.generated}
                </div>
              </div>
              <div className="border-t border-border-DEFAULT pt-2">
                <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-0.5">
                  Next Refresh
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-content-tertiary" />
                  <span className="font-mono text-xs text-content-primary">
                    {daysUntilRefresh}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Batch Info */}
        <div className="lg:hidden border border-border-DEFAULT bg-background-elevated p-3">
          <div className="flex items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-mono text-content-tertiary uppercase tracking-wider">Batch</span>
              <span className="font-mono font-bold text-content-primary ml-2">#{CURRENT_BATCH.number}</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="font-mono text-content-tertiary">Generated</span>
                <span className="font-mono text-content-secondary ml-2">{CURRENT_BATCH.generated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-content-tertiary" />
                <span className="font-mono text-content-primary">{daysUntilRefresh}d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Filter */}
      <div className="mb-6">
        <div className="font-mono text-[10px] text-content-tertiary uppercase tracking-wider mb-3">
          Filter by Industry
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border ${
                selectedCategory === category
                  ? "bg-content-primary text-white border-content-primary"
                  : "bg-background-elevated text-content-secondary border-border-DEFAULT hover:border-content-tertiary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-3 border-t border-border-DEFAULT">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-content-tertiary">
              <span className="text-content-primary font-bold">{filteredCompanies.length}</span> available
            </span>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="font-mono text-xs text-content-primary hover:text-content-secondary uppercase tracking-wider transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.id} company={company} onClaim={handleClaim} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-16 border border-border-DEFAULT bg-background-elevated">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-border-DEFAULT bg-background-DEFAULT mb-4">
            <Building2 className="w-7 h-7 text-content-tertiary" />
          </div>
          <h3 className="font-mono text-sm font-bold text-content-primary uppercase tracking-wider mb-2">
            No Companies Found
          </h3>
          <p className="text-sm text-content-secondary mb-4">
            No companies match the selected filter
          </p>
          <button
            onClick={() => setSelectedCategory("All")}
            className="font-mono text-xs text-content-primary hover:text-content-secondary uppercase tracking-wider transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </section>
  );
}

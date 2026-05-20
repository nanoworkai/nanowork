import { useState } from "react";
import { Building2, Tag, Sparkles, ArrowRight, Filter } from "lucide-react";

/**
 * COMPANY LIBRARY DESIGN PRINCIPLES:
 *
 * 1. GALLERY AESTHETIC: Clean grid showcasing pre-built companies like art pieces
 * 2. DISCOVERY-FOCUSED: Browse, filter, and explore rather than build from scratch
 * 3. LIGHT & INVITING: Friendly cards with soft shadows and hover interactions
 * 4. CLEAR VALUE: $100 price point prominent but not aggressive
 * 5. CATEGORY ORGANIZATION: Industries clearly labeled for easy browsing
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
const COMPLEXITY_LEVELS = ["All", "Simple", "Moderate", "Advanced"];

// ──────────────────────────────────────────────────────────────────────────────
// COMPANY CARD COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

interface CompanyCardProps {
  company: CompanyIdea;
  onClaim: (company: CompanyIdea) => void;
}

function CompanyCard({ company, onClaim }: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-background-elevated rounded-xl border border-border-DEFAULT hover:border-border-medium hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Top Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="px-2.5 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20">
          <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">
            ${company.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-content-tertiary" />
            <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">
              {company.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-content-primary mb-1.5">
            {company.name}
          </h3>
          <p className="text-sm text-content-secondary leading-relaxed line-clamp-2">
            {company.tagline}
          </p>
        </div>

        {/* Features - Always visible */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider mb-2">
            Key Features
          </div>
          <ul className="space-y-1.5">
            {company.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-content-secondary">
                <span className="text-accent-primary mt-0.5">•</span>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hover Details */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isHovered ? "max-h-32 opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="space-y-2 pt-2 border-t border-border-DEFAULT">
            <div>
              <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">
                Revenue Potential
              </span>
              <p className="text-xs text-content-primary font-medium">{company.revenue_potential}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">
                Target Market
              </span>
              <p className="text-xs text-content-secondary">{company.target_market}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {company.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background-subtle text-[10px] text-content-tertiary"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Complexity Badge */}
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
              company.complexity === "Simple"
                ? "bg-accent-success/10 text-accent-success"
                : company.complexity === "Moderate"
                ? "bg-accent-warning/10 text-accent-warning"
                : "bg-accent-secondary/10 text-accent-secondary"
            }`}
          >
            {company.complexity}
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onClaim(company)}
          className="w-full mt-4 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
        >
          Claim This Company
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN LIBRARY COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function CompanyLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedComplexity, setSelectedComplexity] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCompanies = COMPANY_IDEAS.filter((company) => {
    const matchesCategory = selectedCategory === "All" || company.category === selectedCategory;
    const matchesComplexity = selectedComplexity === "All" || company.complexity === selectedComplexity;
    return matchesCategory && matchesComplexity;
  });

  const handleClaim = (company: CompanyIdea) => {
    console.log("Claiming company:", company);
    // TODO: Implement claim flow (payment, company creation)
    alert(`Ready to claim ${company.name} for $${company.price}!\n\nThis will:\n1. Process payment\n2. Set up your company\n3. Deploy all 7 departments\n4. Give you full access`);
  };

  return (
    <section className="py-12 sm:py-16">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-accent-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary uppercase tracking-tight">
            Company Library
          </h2>
        </div>
        <p className="text-sm text-content-secondary max-w-3xl leading-relaxed mb-2">
          Browse pre-built companies ready to launch. Each includes branding, website, marketing, sales automation, and full operational infrastructure.
        </p>
        <p className="text-sm text-content-primary font-medium">
          Claim any company for just $100 and start running it immediately.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-DEFAULT hover:bg-background-subtle transition-colors mb-4 sm:hidden"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium text-content-primary">
            {showFilters ? "Hide" : "Show"} Filters
          </span>
        </button>

        <div className={`${showFilters ? "block" : "hidden"} sm:block space-y-4`}>
          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-content-tertiary uppercase tracking-wider mb-2 block">
              Industry
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-accent-primary text-white shadow-sm"
                      : "bg-background-subtle text-content-secondary hover:bg-background-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Filter */}
          <div>
            <label className="text-xs font-bold text-content-tertiary uppercase tracking-wider mb-2 block">
              Complexity
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPLEXITY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedComplexity(level)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedComplexity === level
                      ? "bg-accent-primary text-white shadow-sm"
                      : "bg-background-subtle text-content-secondary hover:bg-background-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t border-border-DEFAULT">
            <span className="text-xs font-mono text-content-tertiary">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"} available
            </span>
            {(selectedCategory !== "All" || selectedComplexity !== "All") && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedComplexity("All");
                }}
                className="text-xs text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
              >
                Clear filters
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
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background-subtle border border-border-DEFAULT mb-4">
            <Building2 className="w-7 h-7 text-content-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-content-primary mb-2">No companies found</h3>
          <p className="text-sm text-content-secondary mb-4">
            Try adjusting your filters to see more options
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedComplexity("All");
            }}
            className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}

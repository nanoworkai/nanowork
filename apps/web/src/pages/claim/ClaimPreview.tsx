import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Terminal,
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Palette,
  Mail,
  TrendingUp,
  Code,
  Zap,
  CheckCircle2,
  DollarSign,
  Users,
  Layout,
  Package,
} from "lucide-react";
import type { CompanyIdea } from "../../components/CompanyLibrary";

/**
 * CLAIM PREVIEW PAGE
 *
 * Professional, terminal-aesthetic preview showing users exactly what they're getting
 * before they commit to payment. Comprehensive value display with mockups and details.
 *
 * Route: /claim/:companyId/preview
 */

// Company data - imported from CompanyLibrary
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

// Function to get company data by ID
function getCompanyById(id: string): CompanyIdea | null {
  return COMPANY_IDEAS.find((company) => company.id === id) || null;
}

// What's included in the package
const INCLUDED_DELIVERABLES = [
  {
    icon: Globe,
    title: "Production Website",
    description: "Fully deployed, mobile-responsive landing page with custom domain setup",
    items: ["Modern UI/UX design", "SEO optimized", "Analytics integrated", "Contact forms"],
  },
  {
    icon: Palette,
    title: "Brand Identity Kit",
    description: "Complete visual identity package ready for all marketing channels",
    items: ["Logo suite (primary, secondary, icon)", "Color palette", "Typography system", "Brand guidelines"],
  },
  {
    icon: Mail,
    title: "Email Marketing Setup",
    description: "Automated email sequences and newsletter infrastructure",
    items: ["Welcome email series", "Newsletter template", "Lead magnet landing page", "Email automation"],
  },
  {
    icon: Code,
    title: "Tech Stack & Infrastructure",
    description: "Production-ready technical foundation with best practices",
    items: ["React/Next.js codebase", "Database schema", "API endpoints", "Hosting configured"],
  },
  {
    icon: Package,
    title: "Marketing Materials",
    description: "Launch-ready assets for social media and advertising",
    items: ["Social media templates", "Ad copy variations", "Press kit", "Pitch deck outline"],
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description: "Actionable roadmap for customer acquisition and revenue growth",
    items: ["Go-to-market plan", "Pricing strategy", "Customer acquisition channels", "Success metrics"],
  },
];

// Tech stack preview
const TECH_STACK = [
  { category: "Frontend", tools: ["React", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", tools: ["Supabase", "PostgreSQL", "RESTful API"] },
  { category: "Hosting", tools: ["Cloudflare Pages", "Edge Functions"] },
  { category: "Marketing", tools: ["Mailchimp", "Google Analytics", "Plausible"] },
];

export default function ClaimPreview() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyIdea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      // Simulate API call
      setTimeout(() => {
        const data = getCompanyById(companyId);
        setCompany(data);
        setLoading(false);
      }, 300);
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border-DEFAULT border-t-accent-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-content-secondary">LOADING PREVIEW...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Building2 className="w-12 h-12 text-content-tertiary mx-auto mb-4" />
          <p className="text-sm font-mono text-accent-danger mb-4">COMPANY NOT FOUND</p>
          <Link
            to="/"
            className="text-xs font-mono text-content-secondary hover:text-content-primary transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            BACK TO LIBRARY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-content-primary">
      {/* Header - Terminal Style */}
      <header className="sticky top-0 z-50 bg-background-elevated/80 backdrop-blur-lg border-b border-border-DEFAULT">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-content-primary hover:opacity-70 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <Link
            to="/"
            className="px-3 py-1.5 font-mono text-xs text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            LIBRARY
          </Link>
        </div>
      </header>

      {/* Hero Section - Company Overview */}
      <section className="border-b border-border-DEFAULT bg-background-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left: Company Details */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-background-subtle border border-border-DEFAULT mb-4">
                <span className="font-mono text-[10px] text-content-tertiary uppercase tracking-wider">
                  {company.category}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-content-primary mb-4">
                {company.name}
              </h1>

              <p className="text-base sm:text-lg text-content-secondary leading-relaxed mb-6">
                {company.tagline}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border border-border-DEFAULT bg-background-DEFAULT p-4">
                  <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-1">
                    Revenue Potential
                  </div>
                  <div className="font-mono text-xl font-bold text-content-primary">
                    {company.revenue_potential}
                  </div>
                </div>

                <div className="border border-border-DEFAULT bg-background-DEFAULT p-4">
                  <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-1">
                    Complexity Level
                  </div>
                  <div className="font-mono text-xl font-bold text-content-primary">
                    {company.complexity}
                  </div>
                </div>

                <div className="border border-border-DEFAULT bg-background-DEFAULT p-4 col-span-2">
                  <div className="font-mono text-[9px] text-content-tertiary uppercase tracking-wider mb-1">
                    Target Market
                  </div>
                  <div className="text-sm text-content-primary">{company.target_market}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-background-subtle border border-border-DEFAULT font-mono text-[10px] text-content-secondary uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Pricing Card */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="border-2 border-content-primary bg-background-elevated p-6 sticky top-20">
                <div className="mb-6 pb-6 border-b border-border-DEFAULT">
                  <div className="font-mono text-sm text-content-tertiary uppercase tracking-wider mb-2">
                    One-Time Setup
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mono text-5xl font-bold text-content-primary">
                      ${company.price}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-content-secondary">
                    Complete company infrastructure, ready to launch
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content-primary">Full source code access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content-primary">Production deployment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content-primary">Brand assets & marketing kit</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-content-primary">30-day support included</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/claim/${companyId}/payment`)}
                  className="w-full px-6 py-4 bg-content-primary hover:bg-content-secondary text-background-DEFAULT font-mono text-sm uppercase tracking-wider transition-colors border-2 border-content-primary flex items-center justify-center gap-2 mb-3"
                >
                  PROCEED TO PAYMENT
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] font-mono text-content-tertiary text-center">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="border-b border-border-DEFAULT py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                What's Included
              </h2>
            </div>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Everything you need to launch and grow your business. No hidden fees, no recurring charges—just a complete, production-ready company.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INCLUDED_DELIVERABLES.map((deliverable) => {
              const Icon = deliverable.icon;
              return (
                <div
                  key={deliverable.title}
                  className="border border-border-DEFAULT bg-background-elevated hover:border-content-tertiary transition-colors"
                >
                  <div className="border-b border-border-DEFAULT p-4 bg-background-subtle">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-content-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-background-DEFAULT" />
                      </div>
                      <h3 className="text-sm font-bold text-content-primary">{deliverable.title}</h3>
                    </div>
                    <p className="text-xs text-content-secondary leading-snug">
                      {deliverable.description}
                    </p>
                  </div>

                  <div className="p-4">
                    <ul className="space-y-2">
                      {deliverable.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-accent-success mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-content-secondary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Landing Page Preview Mockup */}
      <section className="border-b border-border-DEFAULT py-12 sm:py-16 bg-background-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Layout className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                Landing Page Preview
              </h2>
            </div>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Professional, conversion-optimized design tailored to your industry. Mobile-responsive and ready to deploy.
            </p>
          </div>

          {/* Mockup - Browser Window */}
          <div className="border border-border-DEFAULT bg-background-elevated rounded-lg overflow-hidden shadow-xl">
            {/* Browser Chrome */}
            <div className="border-b border-border-DEFAULT bg-background-subtle px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-success" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-4 py-1 bg-background-DEFAULT border border-border-DEFAULT rounded-md max-w-md w-full">
                  <span className="text-[10px] font-mono text-content-tertiary">
                    https://{company.name.toLowerCase().replace(/\s+/g, '')}.com
                  </span>
                </div>
              </div>
            </div>

            {/* Page Content Preview */}
            <div className="bg-white p-8 sm:p-12">
              <div className="max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded-full mb-4">
                    <span className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                      {company.category}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    {company.tagline}
                  </h1>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join thousands of {company.target_market.toLowerCase()} who are already transforming their experience.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <div className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                      Get Started Free
                    </div>
                    <div className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700">
                      Learn More
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {company.features.map((feature, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature}</h3>
                      <p className="text-sm text-gray-600">
                        Professional implementation with best practices built in.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-b border-border-DEFAULT py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Code className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                Tech Stack
              </h2>
            </div>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Modern, production-grade technology stack. Fully documented, maintainable, and scalable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH_STACK.map((stack) => (
              <div key={stack.category} className="border border-border-DEFAULT bg-background-elevated p-4">
                <div className="font-mono text-[10px] text-content-tertiary uppercase tracking-wider mb-3 pb-2 border-b border-border-DEFAULT">
                  {stack.category}
                </div>
                <ul className="space-y-2">
                  {stack.tools.map((tool) => (
                    <li key={tool} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent-primary rounded-full flex-shrink-0" />
                      <span className="text-sm text-content-primary">{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Highlight */}
      <section className="border-b border-border-DEFAULT py-12 sm:py-16 bg-background-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                Core Features
              </h2>
            </div>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Specialized functionality tailored to your business model and target market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.features.map((feature, i) => (
              <div
                key={i}
                className="border border-border-DEFAULT bg-background-elevated p-6 hover:border-content-tertiary transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-content-primary mb-2">{feature}</h3>
                    <p className="text-sm text-content-secondary leading-relaxed">
                      Fully implemented and ready to use. Complete with user documentation and admin controls.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Model & Growth */}
      <section className="border-b border-border-DEFAULT py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-content-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-content-primary font-mono uppercase tracking-tight">
                Revenue Model & Growth Strategy
              </h2>
            </div>
            <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
              Proven monetization strategies and actionable growth roadmap included with your company.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Potential */}
            <div className="border border-border-DEFAULT bg-background-elevated p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-DEFAULT">
                <DollarSign className="w-6 h-6 text-accent-success" />
                <h3 className="text-lg font-bold text-content-primary">Revenue Potential</h3>
              </div>
              <div className="mb-6">
                <div className="font-mono text-3xl font-bold text-content-primary mb-2">
                  {company.revenue_potential}
                </div>
                <p className="text-sm text-content-secondary">
                  Projected monthly recurring revenue based on market analysis and comparable businesses.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Multiple Revenue Streams</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      Subscription, marketplace fees, and premium features
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Scalable Business Model</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      Low marginal costs with high growth potential
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Payment Processing Ready</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      Stripe integration configured and tested
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Market */}
            <div className="border border-border-DEFAULT bg-background-elevated p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-DEFAULT">
                <Users className="w-6 h-6 text-accent-primary" />
                <h3 className="text-lg font-bold text-content-primary">Target Market</h3>
              </div>
              <div className="mb-6">
                <div className="font-semibold text-lg text-content-primary mb-2">
                  {company.target_market}
                </div>
                <p className="text-sm text-content-secondary">
                  Well-defined audience with clear acquisition channels and proven demand.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Market Research Included</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      Demographics, pain points, and buying behavior analysis
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Acquisition Channels Mapped</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      SEO, social media, content marketing, and paid ads strategy
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-content-primary">Competitor Analysis</div>
                    <div className="text-xs text-content-secondary mt-0.5">
                      Market positioning and differentiation strategy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-content-primary mb-4">
            Ready to Launch Your Business?
          </h2>
          <p className="text-base text-content-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Complete company infrastructure for just ${company.price}. No hidden fees, no recurring charges. Everything you need to start making money.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={() => navigate(`/claim/${companyId}/payment`)}
              className="px-8 py-4 bg-content-primary hover:bg-content-secondary text-background-DEFAULT font-mono text-base uppercase tracking-wider transition-colors border-2 border-content-primary inline-flex items-center justify-center gap-2"
            >
              PROCEED TO PAYMENT
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/"
              className="px-8 py-4 bg-background-elevated hover:bg-background-subtle text-content-primary font-mono text-base uppercase tracking-wider transition-colors border-2 border-border-DEFAULT inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO LIBRARY
            </Link>
          </div>

          <div className="inline-flex items-center gap-6 text-xs font-mono text-content-tertiary">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-accent-success" />
              <span>SECURE CHECKOUT</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-accent-success" />
              <span>INSTANT ACCESS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-accent-success" />
              <span>30-DAY SUPPORT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-DEFAULT bg-background-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-xs font-mono text-content-muted text-center">
            © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}

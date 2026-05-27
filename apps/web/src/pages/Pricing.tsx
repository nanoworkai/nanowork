import { Link } from "react-router-dom";
import { Terminal, Check, ArrowRight, Building2, Zap, Shield } from "lucide-react";
import Footer from "../components/Footer";

/**
 * PRICING PAGE - Enterprise fintech aesthetic
 * Three tiers: Starter (individual), Pro (growing companies), Enterprise (large orgs)
 */

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlight?: boolean;
  icon: React.ReactNode;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "For solo founders and early-stage startups building their first company.",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "1 active company",
      "All 7 AI departments",
      "Unlimited builds & iterations",
      "Custom domain",
      "Email support",
      "Community access",
    ],
    cta: "Start Building",
    ctaLink: "/login",
  },
  {
    name: "Pro",
    price: "$499",
    period: "/month",
    description: "For growing companies that need multiple projects and priority execution.",
    icon: <Terminal className="w-5 h-5" />,
    features: [
      "5 active companies",
      "All 7 AI departments",
      "Priority execution queue",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Priority support (24h SLA)",
      "Dedicated success manager",
    ],
    cta: "Go Pro",
    ctaLink: "/login",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations deploying AI departments at scale across business units.",
    icon: <Building2 className="w-5 h-5" />,
    features: [
      "Unlimited companies",
      "White-label deployments",
      "SSO & SAML authentication",
      "Role-based access control",
      "Advanced security features",
      "Audit logs & activity tracking",
      "Custom SLAs & uptime guarantees",
      "Dedicated infrastructure",
      "Custom AI department training",
      "Dedicated support team",
      "Quarterly business reviews",
    ],
    cta: "Contact Sales",
    ctaLink: "#contact",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-xl border-b border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-fintech-navy hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-fintech-navy flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/login"
              className="px-5 py-2 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold text-fintech-navy tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg sm:text-xl text-fintech-slate max-w-2xl mx-auto leading-relaxed">
            From solo founders to Fortune 500 enterprises. AI departments that scale with your business.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`border bg-surface-1 p-8 flex flex-col ${
                tier.highlight
                  ? "border-fintech-navy shadow-card-lg relative"
                  : "border-fintech-border"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-fintech-navy text-white text-xs font-medium">
                  Most popular
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-fintech-slate">{tier.icon}</div>
                  <h2 className="text-xl font-semibold text-fintech-navy">
                    {tier.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-semibold text-fintech-navy">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-fintech-slate">{tier.period}</span>
                  )}
                </div>

                <p className="text-sm text-fintech-slate leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-fintech-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-fintech-slate">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.ctaLink}
                className={`w-full py-3 text-sm font-medium text-center transition-colors ${
                  tier.highlight
                    ? "bg-fintech-navy text-white hover:bg-fintech-navy/90"
                    : "border border-fintech-border text-fintech-navy hover:border-fintech-navy"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Benefits */}
        <section className="mb-20">
          <div className="border border-fintech-border bg-surface-1 p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-fintech-navy mb-4">
                Enterprise-grade infrastructure
              </h2>
              <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
                Deploy AI departments across your organization with enterprise security and centralized control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">Portfolio management</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  VCs and holding companies can deploy Nanowork for portfolio companies. Centralized billing, unified dashboard, cross-company analytics.
                </p>
              </div>

              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">White-label deployment</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  Your branding, your domain. Deploy Nanowork under your own brand for internal teams or external clients. Custom UI and workflows.
                </p>
              </div>

              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">Security & controls</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  Enterprise-grade security with audit logs, data residency controls, role-based access, and encryption at rest and in transit.
                </p>
              </div>

              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">Custom AI training</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  Train AI departments on your processes, brand voice, and business rules. Departments learn from your data and improve over time.
                </p>
              </div>

              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">Dedicated infrastructure</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  Isolated compute, dedicated capacity, guaranteed uptime SLAs. On-premise deployment options for maximum data control and security.
                </p>
              </div>

              <div className="border border-fintech-divider bg-surface-0 p-6">
                <h3 className="text-base font-semibold text-fintech-navy mb-3">Support & success</h3>
                <p className="text-sm text-fintech-slate leading-relaxed">
                  Dedicated support team, technical account manager, quarterly business reviews. We ensure your teams get maximum value from AI departments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-base font-semibold text-fintech-navy mb-3">What counts as an "active company"?</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                An active company is a business you're currently building with Nanowork. You can archive old companies and start new ones anytime.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-base font-semibold text-fintech-navy mb-3">Can I upgrade or downgrade anytime?</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Yes. Upgrade instantly for immediate access to new features. Downgrade at the end of your billing cycle with no penalties.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-base font-semibold text-fintech-navy mb-3">What's included in "priority execution"?</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Pro and Enterprise users get priority in the build queue. Your AI departments execute faster during peak usage times.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-base font-semibold text-fintech-navy mb-3">How does Enterprise pricing work?</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Enterprise pricing is based on seats, usage, and features. Contact us for a custom quote that fits your organization's needs.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact">
          <div className="border border-fintech-border bg-surface-1 p-12 text-center">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-fintech-slate mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with Starter, grow into Pro, or go Enterprise. Every plan includes all seven AI departments working 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
              >
                Start building
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:sales@nanowork.com"
                className="inline-flex items-center gap-2 px-6 py-3 border border-fintech-border text-fintech-navy text-sm font-medium hover:border-fintech-navy transition-colors"
              >
                Contact sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

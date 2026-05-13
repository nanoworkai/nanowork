import { Link } from "react-router-dom";
import { Terminal, Check, ArrowRight, Building2, Zap, Shield } from "lucide-react";

/**
 * PRICING PAGE - Bloomberg Terminal aesthetic
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
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/login"
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-none bg-white text-black text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
            >
              Start
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white uppercase tracking-tight mb-4">
            Scale at Your Speed
          </h1>
          <p className="text-sm sm:text-base font-mono text-white/70 max-w-2xl mx-auto leading-relaxed">
            From solo founders to Fortune 500 enterprises. AI departments that scale with your ambition.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`card rounded-none border p-6 sm:p-8 flex flex-col ${
                tier.highlight
                  ? "border-white/30 bg-surface-2 scale-105 lg:scale-110 relative z-10"
                  : "border-white/10 bg-surface-1"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-white/60">{tier.icon}</div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                    {tier.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm font-mono text-white/40">{tier.period}</span>
                  )}
                </div>

                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-mono text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.ctaLink}
                className={`w-full py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider text-center transition-colors ${
                  tier.highlight
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-surface-3 text-white border border-white/10 hover:bg-surface-4"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Benefits */}
        <section className="mb-16">
          <div className="card-lg rounded-none border border-white/10 p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-white/60" />
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-tight">
                  Built for Enterprise Scale
                </h2>
              </div>
              <p className="text-sm font-mono text-white/60 max-w-2xl mx-auto">
                Deploy AI departments across your entire organization with enterprise security features and centralized control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">Portfolio Management</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  VCs and holding companies can deploy Nanowork for portfolio companies. Centralized billing, unified dashboard, cross-company analytics.
                </p>
              </div>

              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">White-Label Deployment</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Your branding, your domain. Deploy Nanowork under your own brand for internal teams or external clients. Custom UI and workflows.
                </p>
              </div>

              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">Security & Controls</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Enterprise-grade security with audit logs, data residency controls, role-based access, and encryption at rest and in transit.
                </p>
              </div>

              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">Custom AI Training</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Train AI departments on your processes, brand voice, and business rules. Departments learn from your data and improve over time.
                </p>
              </div>

              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">Dedicated Infrastructure</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Isolated compute, dedicated capacity, guaranteed uptime SLAs. On-premise deployment options for maximum data control and security.
                </p>
              </div>

              <div className="card rounded-none border border-white/10 p-6">
                <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">Support & Success</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Dedicated support team, technical account manager, quarterly business reviews. We ensure your teams get maximum value from AI departments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="card rounded-none border border-white/10 p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-2">What counts as an "active company"?</h3>
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                An active company is a business you're currently building with Nanowork. You can archive old companies and start new ones anytime.
              </p>
            </div>

            <div className="card rounded-none border border-white/10 p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                Yes. Upgrade instantly for immediate access to new features. Downgrade at the end of your billing cycle with no penalties.
              </p>
            </div>

            <div className="card rounded-none border border-white/10 p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-2">What's included in "priority execution"?</h3>
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                Pro and Enterprise users get priority in the build queue. Your AI departments execute faster during peak usage times.
              </p>
            </div>

            <div className="card rounded-none border border-white/10 p-6">
              <h3 className="text-sm font-mono font-bold text-white mb-2">How does Enterprise pricing work?</h3>
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                Enterprise pricing is based on seats, usage, and features. Contact us for a custom quote that fits your organization's needs.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact">
          <div className="card-lg rounded-none border border-white/10 p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white uppercase mb-4 tracking-tight">
              Ready to Scale with AI?
            </h2>
            <p className="text-sm font-mono text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with Starter, grow into Pro, or go Enterprise. Every plan includes all seven AI departments working 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-none bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:enterprise@nanowork.app"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-none bg-surface-2 border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-surface-3 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-white/30">
              © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-white/40">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>·</span>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <span>·</span>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <span>·</span>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

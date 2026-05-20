import { Link } from "react-router-dom";
import { Terminal, Check, ArrowRight, Zap } from "lucide-react";

/**
 * PRICING PAGE - Light modern aesthetic
 * Two tiers: Starter (individual), Pro (growing companies)
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
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-content hover:opacity-70 transition-opacity">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Nanowork</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/login"
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-md bg-accent-primary text-white text-[10px] sm:text-xs font-semibold hover:bg-accent-primary/90 transition-colors"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-accent-primary/20 bg-accent-primary/10 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
            <span className="text-xs text-content-secondary uppercase tracking-wider">PRICING</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-content tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm sm:text-base text-content-secondary max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. All plans include full access to AI departments.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`card rounded-2xl border p-6 sm:p-8 flex flex-col ${
                tier.highlight
                  ? "border-2 border-accent-primary shadow-2xl scale-105 lg:scale-110 relative z-10 bg-background-elevated"
                  : "border-border bg-background-elevated"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-primary text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                  MOST POPULAR
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-content-tertiary">{tier.icon}</div>
                  <h2 className="text-lg font-semibold text-content tracking-tight">
                    {tier.name}
                  </h2>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-content">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-content-tertiary">{tier.period}</span>
                  )}
                </div>

                <p className="text-xs text-content-secondary leading-relaxed">
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-content-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.ctaLink}
                className={`w-full py-3 rounded-md text-xs font-semibold text-center transition-colors ${
                  tier.highlight
                    ? "bg-accent-primary text-white hover:bg-accent-primary/90"
                    : "bg-background-subtle text-content border border-border hover:bg-background-muted"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>


        {/* FAQ */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="card rounded-xl border border-border bg-background-elevated p-6">
              <h3 className="text-sm font-semibold text-content mb-2">What counts as an "active company"?</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                An active company is a business you're currently building with Nanowork. You can archive old companies and start new ones anytime.
              </p>
            </div>

            <div className="card rounded-xl border border-border bg-background-elevated p-6">
              <h3 className="text-sm font-semibold text-content mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Yes. Upgrade instantly for immediate access to new features. Downgrade at the end of your billing cycle with no penalties.
              </p>
            </div>

            <div className="card rounded-xl border border-border bg-background-elevated p-6">
              <h3 className="text-sm font-semibold text-content mb-2">What's included in "priority execution"?</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Pro and Enterprise users get priority in the build queue. Your AI departments execute faster during peak usage times.
              </p>
            </div>

            <div className="card rounded-xl border border-border bg-background-elevated p-6">
              <h3 className="text-sm font-semibold text-content mb-2">Do you offer refunds?</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Yes. If you're not satisfied within the first 30 days, we'll refund your subscription—no questions asked.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact">
          <div className="card-lg rounded-2xl border border-border bg-background-elevated p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-content mb-4 tracking-tight">
              Ready to Build with AI?
            </h2>
            <p className="text-sm text-content-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with Starter or go Pro. Every plan includes all seven AI departments working 24/7.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-md bg-accent-primary text-white text-xs font-semibold hover:bg-accent-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-content-tertiary">
              © {new Date().getFullYear()} NANOWORK INC · ALL RIGHTS RESERVED
            </div>
            <div className="flex items-center gap-4 text-xs text-content-tertiary">
              <Link to="/" className="hover:text-content transition-colors">Home</Link>
              <span>·</span>
              <Link to="/pricing" className="hover:text-content transition-colors">Pricing</Link>
              <span>·</span>
              <a href="#privacy" className="hover:text-content transition-colors">Privacy</a>
              <span>·</span>
              <a href="#terms" className="hover:text-content transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

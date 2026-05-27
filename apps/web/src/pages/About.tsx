import { Link } from "react-router-dom";
import { Terminal, Target, Zap, Users } from "lucide-react";

export default function About() {
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

          <nav className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium text-fintech-slate hover:text-fintech-navy transition-colors">
              Pricing
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-fintech-navy mb-6 leading-tight">
            Building the future of automated business creation
          </h1>
          <p className="text-lg sm:text-xl text-fintech-slate leading-relaxed">
            Nanowork makes it possible for anyone to build and launch a complete business in days, not months.
            Our AI-powered platform handles everything from brand identity to production deployment.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-surface-1 border-y border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-6">Our mission</h2>
            <p className="text-lg text-fintech-slate leading-relaxed mb-6">
              We believe entrepreneurship should be accessible to everyone. Traditional business creation is expensive,
              time-consuming, and requires expertise across dozens of domains. We're changing that.
            </p>
            <p className="text-lg text-fintech-slate leading-relaxed">
              Nanowork provides AI departments that work 24/7 to build, launch, and scale your business. From legal
              entity formation to payment processing to marketing automation, we handle the complexity so you can focus
              on your vision.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">Our values</h2>
            <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
              The principles that guide how we build and operate Nanowork
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-fintech-border bg-surface-1 p-8">
              <div className="w-12 h-12 bg-fintech-navy flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-fintech-navy mb-3">Execution over ideas</h3>
              <p className="text-fintech-slate leading-relaxed">
                Ideas are abundant. Execution is rare. We focus on shipping working products that solve real problems,
                not building perfect systems that never launch.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-1 p-8">
              <div className="w-12 h-12 bg-fintech-navy flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-fintech-navy mb-3">Speed as competitive advantage</h3>
              <p className="text-fintech-slate leading-relaxed">
                In a world where AI can build businesses in days, speed becomes the ultimate moat. We prioritize
                velocity and iteration over perfection.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-1 p-8">
              <div className="w-12 h-12 bg-fintech-navy flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-fintech-navy mb-3">Democratize entrepreneurship</h3>
              <p className="text-fintech-slate leading-relaxed">
                Building a business shouldn't require a technical background, legal expertise, or a large budget. We make
                entrepreneurship accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-surface-1 border-y border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">Built in San Francisco</h2>
            <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
              We're a small team building AI infrastructure for the next generation of entrepreneurs.
              Backed by top-tier investors and shipping fast.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-fintech-border bg-surface-1 p-12 text-center">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">
              Ready to build your business?
            </h2>
            <p className="text-lg text-fintech-slate mb-8 max-w-2xl mx-auto">
              Join hundreds of founders using Nanowork to launch and scale their businesses.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-fintech-navy text-white text-sm font-medium hover:bg-fintech-navy/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-fintech-border bg-surface-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between text-sm text-fintech-slate">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4" />
              <span className="font-semibold text-fintech-navy">Nanowork</span>
            </div>
            <div>© {new Date().getFullYear()} Nanowork Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

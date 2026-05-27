import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function Terms() {
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
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-semibold text-fintech-navy mb-4">Terms of Service</h1>
        <p className="text-lg text-fintech-slate mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">1. Acceptance of Terms</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              By accessing and using Nanowork's services, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">2. Service Description</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              Nanowork provides AI-powered business building and automation services. We generate complete
              business solutions including brand identity, technical infrastructure, and deployment capabilities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">3. User Accounts</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">4. Payment Terms</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              Fees for our services are billed as specified at the time of purchase. All payments are
              non-refundable unless otherwise stated in writing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">5. Intellectual Property</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              All businesses and assets created through Nanowork are owned by you. Nanowork retains ownership
              of its platform, tools, and underlying technology.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">6. Limitation of Liability</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              Nanowork shall not be liable for any indirect, incidental, special, or consequential damages
              arising from your use of our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">7. Contact</h2>
            <p className="text-fintech-slate leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@nanowork.com" className="text-fintech-navy hover:underline">
                legal@nanowork.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-fintech-border bg-surface-0 mt-16">
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

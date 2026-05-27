import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function Privacy() {
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
        <h1 className="text-4xl font-semibold text-fintech-navy mb-4">Privacy Policy</h1>
        <p className="text-lg text-fintech-slate mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-zinc max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">1. Information We Collect</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We collect information you provide directly to us, including your name, email address, payment information,
              and any business data you input into our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">2. How We Use Your Information</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions,
              send you technical notices and support messages, and respond to your comments and questions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">3. Data Security</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information. All data is
              encrypted in transit and at rest. We use enterprise-grade infrastructure provided by Cloudflare and Supabase.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">4. Data Sharing</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with service providers who assist
              in operating our platform, conducting our business, or serving our users.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">5. Your Rights</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              You have the right to access, update, or delete your personal information. You can do this through your
              account settings or by contacting us directly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">6. Cookies</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">7. Changes to This Policy</h2>
            <p className="text-fintech-slate leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">8. Contact Us</h2>
            <p className="text-fintech-slate leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@nanowork.com" className="text-fintech-navy hover:underline">
                privacy@nanowork.com
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

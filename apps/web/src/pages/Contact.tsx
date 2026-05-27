import { Link } from "react-router-dom";
import { Terminal, Mail, MessageSquare, Building2 } from "lucide-react";
import Footer from "../components/Footer";

export default function Contact() {
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

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-fintech-navy mb-6">
            Get in touch
          </h1>
          <p className="text-lg sm:text-xl text-fintech-slate leading-relaxed">
            Have questions about Nanowork? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-fintech-border bg-surface-1 p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-fintech-navy mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">General inquiries</h3>
              <p className="text-sm text-fintech-slate mb-4">
                Questions about our product or service
              </p>
              <a
                href="mailto:hello@nanowork.com"
                className="text-sm font-medium text-fintech-navy hover:underline"
              >
                hello@nanowork.com
              </a>
            </div>

            <div className="border border-fintech-border bg-surface-1 p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-fintech-navy mb-6">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Enterprise sales</h3>
              <p className="text-sm text-fintech-slate mb-4">
                Custom solutions for large organizations
              </p>
              <a
                href="mailto:sales@nanowork.com"
                className="text-sm font-medium text-fintech-navy hover:underline"
              >
                sales@nanowork.com
              </a>
            </div>

            <div className="border border-fintech-border bg-surface-1 p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-fintech-navy mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Customer support</h3>
              <p className="text-sm text-fintech-slate mb-4">
                Technical support for existing customers
              </p>
              <a
                href="mailto:support@nanowork.com"
                className="text-sm font-medium text-fintech-navy hover:underline"
              >
                support@nanowork.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Office */}
      <section className="py-16 bg-surface-1 border-y border-fintech-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-fintech-navy mb-6">Our office</h2>
          <div className="border border-fintech-border bg-surface-0 p-8">
            <p className="text-lg font-semibold text-fintech-navy mb-2">Nanowork Inc.</p>
            <p className="text-fintech-slate">San Francisco, California</p>
            <p className="text-fintech-slate">United States</p>
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-fintech-border bg-surface-1 p-8">
            <h2 className="text-2xl font-semibold text-fintech-navy mb-4">Response times</h2>
            <div className="space-y-4 text-sm text-fintech-slate">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-fintech-green mt-2" />
                <div>
                  <p className="font-medium text-fintech-navy">General inquiries:</p>
                  <p>We respond within 24 hours during business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-fintech-green mt-2" />
                <div>
                  <p className="font-medium text-fintech-navy">Enterprise sales:</p>
                  <p>Priority response within 4 business hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-fintech-green mt-2" />
                <div>
                  <p className="font-medium text-fintech-navy">Customer support:</p>
                  <p>Pro and Enterprise customers receive priority 24/7 support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Terminal, Shield, Lock, Eye, Server, FileCheck, AlertTriangle } from "lucide-react";

export default function Security() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fintech-navy mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-fintech-navy mb-6">
            Enterprise-grade security
          </h1>
          <p className="text-lg sm:text-xl text-fintech-slate leading-relaxed">
            Your data security is our highest priority. We employ industry-leading security practices to protect
            your business information.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-surface-1 border-y border-fintech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border border-fintech-border bg-surface-0 p-6">
              <Lock className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Encryption at rest and in transit</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                All data is encrypted using AES-256 encryption at rest and TLS 1.3 in transit. Your business data
                is never stored or transmitted in plain text.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-0 p-6">
              <Server className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">SOC 2 Type II compliant infrastructure</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Our infrastructure is built on SOC 2 Type II certified platforms. We undergo regular third-party
                security audits and penetration testing.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-0 p-6">
              <Eye className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Role-based access control</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Granular permissions and role-based access control ensure team members only access data they need.
                Full audit logging tracks all access.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-0 p-6">
              <FileCheck className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Regular security audits</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Independent security firms conduct regular penetration testing and security audits. We maintain
                detailed documentation of all findings and remediation.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-0 p-6">
              <Shield className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Data residency options</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Enterprise customers can choose where their data is stored and processed. We support US, EU, and
                custom region requirements.
              </p>
            </div>

            <div className="border border-fintech-border bg-surface-0 p-6">
              <AlertTriangle className="w-8 h-8 text-fintech-navy mb-4" />
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">Incident response</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                24/7 security monitoring with automated threat detection. Defined incident response procedures with
                immediate customer notification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-fintech-navy mb-4">Compliance & certifications</h2>
            <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
              We maintain compliance with industry standards and regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">GDPR Compliant</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Full compliance with EU General Data Protection Regulation. Data processing agreements available
                for all customers.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">CCPA Compliant</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Compliant with California Consumer Privacy Act. Users can request data deletion and download
                at any time.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">SOC 2 Type II</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Infrastructure hosted on SOC 2 Type II certified platforms with regular compliance audits.
              </p>
            </div>

            <div className="border-t border-fintech-divider pt-6">
              <h3 className="text-lg font-semibold text-fintech-navy mb-3">PCI DSS</h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Payment processing through PCI DSS Level 1 certified providers. We never store payment card data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 bg-surface-1 border-y border-fintech-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-fintech-navy mb-6">Responsible disclosure</h2>
          <p className="text-lg text-fintech-slate mb-6 leading-relaxed">
            We take security vulnerabilities seriously. If you discover a security issue, please report it to our
            security team immediately.
          </p>
          <div className="border border-fintech-border bg-surface-0 p-6">
            <p className="text-sm text-fintech-slate mb-4">
              Email security reports to:{" "}
              <a href="mailto:security@nanowork.com" className="text-fintech-navy font-medium hover:underline">
                security@nanowork.com
              </a>
            </p>
            <p className="text-sm text-fintech-slate">
              We commit to responding to all security reports within 24 hours and will work with researchers to
              validate and address issues promptly.
            </p>
          </div>
        </div>
      </section>

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

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Building2,
  FileText,
  Clock,
  CreditCard,
  Mail,
  Landmark,
  TrendingUp,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// ── Types & Data ──────────────────────────────────────────────────────────────

const TYPING_EXAMPLES = [
  "Enterprise SaaS platform for logistics",
  "Fintech infrastructure for payments",
  "Healthcare AI diagnostic platform",
  "Climate tech carbon marketplace",
  "Web3 decentralized exchange",
  "Biotech pharmaceutical research",
];

interface InfrastructureFeature {
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  compliance: string[];
  visual: React.ReactNode;
}

// ── Live Metrics Component ────────────────────────────────────────────────────

function LiveMetrics() {
  const [metrics] = useState({
    companies: 2847,
    revenue: 847000000,
    transactions: 12847293,
    countries: 67
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-16 border-y border-slate-200">
      <div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {metrics.companies.toLocaleString()}+
        </div>
        <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          Companies Built
        </div>
      </div>
      <div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          ${(metrics.revenue / 1000000).toFixed(0)}M
        </div>
        <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          Revenue Generated
        </div>
      </div>
      <div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {(metrics.transactions / 1000000).toFixed(1)}M
        </div>
        <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          Transactions
        </div>
      </div>
      <div>
        <div className="text-4xl font-bold text-slate-900 mb-2">
          {metrics.countries}
        </div>
        <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          Countries
        </div>
      </div>
    </div>
  );
}

// ── Infrastructure Carousel ───────────────────────────────────────────────────

function InfrastructureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features: InfrastructureFeature[] = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      category: "Financial Infrastructure",
      title: "Virtual Payment Cards",
      description: "FDIC-insured virtual cards with granular spending controls, real-time transaction monitoring, and complete audit trails.",
      compliance: ["PCI DSS Level 1", "FDIC Insured", "SOC 2 Type II"],
      visual: (
        <div className="relative w-full h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg" />
              <div>
                <div className="text-xs font-bold text-white">NANOWORK</div>
                <div className="text-[10px] text-slate-400">CORPORATE CARD</div>
              </div>
            </div>
            <div className="text-lg font-mono text-white tracking-wider mb-6">
              •••• •••• •••• 4892
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-slate-500 mb-1">DEPARTMENT</div>
                <div className="text-sm font-bold text-white">FINANCE</div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500" />
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500 -ml-4" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Mail className="w-6 h-6" />,
      category: "Communication Layer",
      title: "Dedicated Email Infrastructure",
      description: "Professional email addresses with enterprise-grade security, automated inbox management, and encrypted storage.",
      compliance: ["GDPR Compliant", "HIPAA Ready", "ISO 27001"],
      visual: (
        <div className="w-full h-48 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
              F
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">finance@company.ai</div>
              <div className="text-xs text-slate-500">Department Agent</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="space-y-3">
            {[
              { subject: "Invoice #2847 Processed", time: "2m ago", unread: true },
              { subject: "Vendor Payment Confirmed", time: "1h ago", unread: false },
              { subject: "Monthly Report Ready", time: "3h ago", unread: false },
            ].map((email, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${email.unread ? 'bg-blue-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs ${email.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'} truncate`}>
                    {email.subject}
                  </div>
                  <div className="text-[10px] text-slate-400">{email.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: <Landmark className="w-6 h-6" />,
      category: "Banking Operations",
      title: "Department Bank Accounts",
      description: "Separate FDIC-insured accounts with real-time balance tracking, automated reconciliation, and institutional-grade security.",
      compliance: ["FDIC Insured $250K", "SOC 2 Type II", "AML/KYC"],
      visual: (
        <div className="relative w-full h-48 bg-slate-50 border-2 border-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nanowork Finance
              </div>
              <div className="text-xs font-bold text-slate-900">Operating Account</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mb-6">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Available Balance
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">
              $234,567
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Routing
              </div>
              <div className="text-xs font-mono font-semibold text-slate-900">021000021</div>
            </div>
            <div>
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Account
              </div>
              <div className="text-xs font-mono font-semibold text-slate-900">•••• 4892</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = features[currentIndex];

  return (
    <div className="relative">
      <div className="relative bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  {current.icon}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {current.category}
                </div>
              </div>

              <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                {current.title}
              </h3>

              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                {current.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {current.compliance.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="flex items-center justify-center">
              {current.visual}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
          <div className="flex gap-2">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Prompt Input ──────────────────────────────────────────────────────────────

function PromptInput() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focused || value) return;
    const currentExample = TYPING_EXAMPLES[exampleIndex];

    if (!isDeleting && charIndex < currentExample.length) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 60);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && charIndex === currentExample.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setPlaceholder(currentExample.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setExampleIndex((exampleIndex + 1) % TYPING_EXAMPLES.length);
    }
  }, [charIndex, isDeleting, exampleIndex, focused, value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text) return;
    setLoading(true);
    setTimeout(() => {
      if (isAuthenticated) navigate(`/dashboard?p=${encodeURIComponent(text)}`);
      else navigate(`/login?redirect=/dashboard&p=${encodeURIComponent(text)}`);
    }, 200);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`relative border-2 rounded-3xl bg-slate-900 transition-all duration-300 ${
        focused ? 'border-slate-700 shadow-2xl' : 'border-slate-800 shadow-xl'
      }`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={loading}
          className="w-full min-h-[160px] max-h-[400px] p-8 pr-24 text-lg text-white bg-transparent border-none outline-none resize-none placeholder-slate-500 font-medium"
          style={{ fontFamily: 'inherit' }}
        />
        {!value && !focused && (
          <div className="absolute top-8 left-8 text-lg text-slate-500 pointer-events-none flex items-center font-medium">
            {placeholder}
            <span className="inline-block w-0.5 h-6 bg-slate-400 ml-1 animate-pulse" />
          </div>
        )}
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="absolute right-6 bottom-6 w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-6 h-6" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-8 mt-8 text-sm font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Bank-grade security
        </div>
        <div className="w-px h-4 bg-slate-300" />
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          FDIC insured
        </div>
        <div className="w-px h-4 bg-slate-300" />
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          SOC 2 compliant
        </div>
      </div>
    </div>
  );
}

// ── Trust Badges ──────────────────────────────────────────────────────────────

function TrustBadges() {
  const badges = [
    { icon: <Shield />, title: "Bank-Grade Security", description: "256-bit encryption, SOC 2 Type II certified" },
    { icon: <Building2 />, title: "FDIC Insured", description: "All funds protected up to $250,000" },
    { icon: <FileText />, title: "Full Compliance", description: "GDPR, PCI DSS, and SOX compliant" },
    { icon: <Clock />, title: "24/7 Monitoring", description: "Real-time fraud detection and alerts" },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {badges.map((badge, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
            {badge.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{badge.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-slate-900 hover:opacity-70 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Nanowork</span>
          </Link>
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <Link to="/dashboard" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero */}
        <section className="py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-semibold text-slate-900 mb-8">
            <TrendingUp className="w-4 h-4" />
            IPO-ready infrastructure from day one
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Enterprise AI <br/>Company Builder
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Not bots. Real autonomous agents with their own cards, emails, and bank accounts.
            Building venture-scale companies with institutional-grade infrastructure.
          </p>

          <PromptInput />
        </section>

        {/* Live Metrics */}
        <LiveMetrics />

        {/* Infrastructure Carousel */}
        <section className="py-24">
          <div className="text-center mb-16">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Enterprise Infrastructure
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Real agents. Real infrastructure.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Bank-grade security meets autonomous execution. Every agent operates with dedicated financial
              instruments, complete audit trails, and institutional compliance.
            </p>
          </div>

          <InfrastructureCarousel />
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-slate-50 -mx-6 lg:-mx-8 px-6 lg:px-8 rounded-3xl">
          <TrustBadges />
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Start building today
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            From zero to revenue in days. From revenue to IPO with agents that never stop working.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Nanowork</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI agents that build and run your entire business. Enterprise infrastructure from day one.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><Link to="/revenue" className="hover:text-slate-900">Revenue</Link></li>
                <li><Link to="/swipe" className="hover:text-slate-900">Swipe</Link></li>
                <li><Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#about" className="hover:text-slate-900">About</a></li>
                <li><a href="#blog" className="hover:text-slate-900">Blog</a></li>
                <li><a href="#careers" className="hover:text-slate-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#privacy" className="hover:text-slate-900">Privacy</a></li>
                <li><a href="#terms" className="hover:text-slate-900">Terms</a></li>
                <li><a href="#security" className="hover:text-slate-900">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-600">
            © {new Date().getFullYear()} Nanowork, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

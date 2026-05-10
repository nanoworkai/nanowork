import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export default function Revenue() {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(2400000);
  const [clients, setClients] = useState(847);
  const [responseRate, setResponseRate] = useState(94);
  const [companyUrl, setCompanyUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animate counters on mount
  useEffect(() => {
    const revenueInterval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 1000));
    }, 3000);

    const clientsInterval = setInterval(() => {
      setClients(prev => prev + 1);
    }, 5000);

    return () => {
      clearInterval(revenueInterval);
      clearInterval(clientsInterval);
    };
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyUrl.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis then redirect
    setTimeout(() => {
      navigate(`/login?redirect=/dashboard&url=${encodeURIComponent(companyUrl)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-white font-semibold hover:opacity-70 transition-opacity text-[15px]">
            Revenue
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Animated Data Stream Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} />

          {/* Flowing data lines */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
              style={{
                top: `${15 + i * 12}%`,
                width: '200%',
                animation: `flowRight ${8 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

          <h1 className="text-[96px] md:text-[120px] font-black tracking-[-0.04em] leading-[0.9] mb-8">
            From link to revenue
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              in 48 hours
            </span>
          </h1>

          <p className="text-[24px] text-zinc-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
            AI finds customers. AI researches. AI sends outreach.
            <br />
            You close deals.
          </p>

          {/* Try It Now Input */}
          <div className="max-w-3xl mx-auto mb-20">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 focus-within:border-white/30 transition-all">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="Paste your company URL to get started"
                  className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-lg px-6 py-3 outline-none"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !companyUrl.trim()}
                  className="group px-8 py-3 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-full flex items-center gap-2 transition-all flex-shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Start
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-zinc-600 text-sm mt-4">
                Free analysis • No credit card required
              </p>
            </form>
          </div>

          {/* Live Metrics Strip */}
          <div className="flex items-center justify-center gap-16 pt-12 border-t border-white/5">
            <div className="text-center">
              <div className="text-[36px] font-bold mb-1 tabular-nums">
                ${(revenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-[13px] text-zinc-600 uppercase tracking-wider">
                Revenue Generated
              </div>
            </div>

            <div className="w-px h-16 bg-white/10" />

            <div className="text-center">
              <div className="text-[36px] font-bold mb-1 tabular-nums">
                {clients.toLocaleString()}
              </div>
              <div className="text-[13px] text-zinc-600 uppercase tracking-wider">
                Active Clients
              </div>
            </div>

            <div className="w-px h-16 bg-white/10" />

            <div className="text-center">
              <div className="text-[36px] font-bold mb-1 tabular-nums">
                {responseRate}%
              </div>
              <div className="text-[13px] text-zinc-600 uppercase tracking-wider">
                Response Rate
              </div>
            </div>

            <div className="w-px h-16 bg-white/10" />

            <div className="text-center">
              <div className="text-[36px] font-bold mb-1">
                &lt; 12h
              </div>
              <div className="text-[13px] text-zinc-600 uppercase tracking-wider">
                First Lead
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Timeline */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-24">
            <h2 className="text-[64px] font-bold tracking-tight leading-[1.1] mb-6">
              How it works
            </h2>
            <p className="text-[20px] text-zinc-500 max-w-3xl mx-auto leading-relaxed font-light">
              Three steps. Fully automated. Results in days.
            </p>
          </div>

          <div className="space-y-0">

            {/* Step 1 */}
            <div className="group relative flex items-start gap-12 py-16 border-b border-white/5 hover:border-emerald-500/20 transition-all">
              <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors flex-shrink-0">
                01
              </div>
              <div className="flex-1 pt-8">
                <h3 className="text-[40px] font-bold tracking-tight mb-6">
                  Paste your link
                </h3>
                <p className="text-zinc-400 text-[20px] leading-relaxed max-w-2xl">
                  Drop in your company URL. Our AI analyzes your product, market, and ideal customer profile in minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative flex items-start gap-12 py-16 border-b border-white/5 hover:border-emerald-500/20 transition-all">
              <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors flex-shrink-0">
                02
              </div>
              <div className="flex-1 pt-8">
                <h3 className="text-[40px] font-bold tracking-tight mb-6">
                  AI research begins
                </h3>
                <p className="text-zinc-400 text-[20px] leading-relaxed max-w-2xl">
                  Seven research agents scan millions of companies, filter for perfect fit, and deep-dive on needs and pain points.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative flex items-start gap-12 py-16 hover:border-emerald-500/20 transition-all">
              <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors flex-shrink-0">
                03
              </div>
              <div className="flex-1 pt-8">
                <h3 className="text-[40px] font-bold tracking-tight mb-6">
                  Personalized outreach at scale
                </h3>
                <p className="text-zinc-400 text-[20px] leading-relaxed max-w-2xl">
                  Custom emails written per prospect. Sent from your domain. Replies forwarded to you instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Results Ticker */}
      <section className="relative py-20 border-y border-white/5 bg-white/[0.01] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-center text-[32px] font-bold mb-8">
            Companies are closing deals right now
          </h3>

          {/* Scrolling ticker */}
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-scroll-left">
              {[
                "TechCorp closed $24k deal • 2m ago",
                "StartupXYZ got 47 replies • 14m ago",
                "SaaSCo booked 12 demos • 31m ago",
                "DataFlow landed enterprise client • 1h ago",
                "CloudSync hit $100k ARR • 3h ago",
                "APIFirst got 89 qualified leads • 5h ago",
                // Duplicate for seamless loop
                "TechCorp closed $24k deal • 2m ago",
                "StartupXYZ got 47 replies • 14m ago",
                "SaaSCo booked 12 demos • 31m ago",
              ].map((text, i) => (
                <div key={i} className="flex-shrink-0 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm whitespace-nowrap">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem - Bold Statement */}
      <section className="relative py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-[64px] md:text-[80px] font-bold tracking-tight leading-[1.1] mb-12">
            Most companies waste 6 months
            <br />
            finding their first 10 customers
          </h2>

          <h3 className="text-[64px] md:text-[80px] font-bold tracking-tight leading-[1.1] mb-20">
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              We do it in 2 days.
            </span>
          </h3>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto pt-12 border-t border-white/5">
            <div className="text-left space-y-4">
              <div className="text-zinc-600 text-sm uppercase tracking-wider mb-2">Traditional</div>
              <div className="text-[48px] font-bold text-zinc-700">180 days</div>
              <div className="text-zinc-500 text-lg">to 10 customers</div>
            </div>
            <div className="text-left space-y-4">
              <div className="text-emerald-400 text-sm uppercase tracking-wider mb-2">Revenue</div>
              <div className="text-[48px] font-bold">2 days</div>
              <div className="text-zinc-400 text-lg">to 10 customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Transparent Single Tier */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <div className="text-[96px] font-black mb-6">
            $997<span className="text-zinc-700">/month</span>
          </div>

          <p className="text-[24px] text-zinc-400 mb-16 leading-relaxed">
            Unlimited outreach. Unlimited leads. Cancel anytime.
            <br />
            <span className="text-white font-medium">Results guaranteed.</span>
          </p>

          {/* Value Props */}
          <div className="space-y-4 max-w-2xl mx-auto mb-16 text-left">
            {[
              "Unlimited AI research agents",
              "Unlimited emails sent",
              "Your domain, your brand",
              "CRM integration included",
              "Dedicated success manager",
              "White-glove onboarding",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-[18px]">
                <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span className="text-zinc-300">{item}</span>
              </div>
            ))}
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-12 py-6 bg-white hover:bg-zinc-100 text-black font-semibold rounded-full transition-all text-[18px]"
          >
            Start free trial
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-zinc-600 text-sm mt-6">
            14 days free
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-[72px] md:text-[96px] font-bold tracking-tight leading-[1.1] mb-16">
            Ready to start?
          </h2>

          {/* Try It Now Input - Bottom */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 focus-within:border-white/30 transition-all">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="Enter your company URL"
                  className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-lg px-6 py-3 outline-none"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !companyUrl.trim()}
                  className="group px-8 py-3 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-full flex items-center gap-2 transition-all flex-shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-zinc-600 text-sm mt-4">
                Free • No signup required
              </p>
            </form>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-zinc-600">
          <div>© 2026 Nanowork</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes flowRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

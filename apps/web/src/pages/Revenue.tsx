import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, DollarSign } from "lucide-react";

export default function Revenue() {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(2400000);
  const [clients, setClients] = useState(847);
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

    setTimeout(() => {
      navigate(`/login?redirect=/dashboard&url=${encodeURIComponent(companyUrl)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a1f0f] text-white relative overflow-hidden">

      {/* Dollar Bill Texture & Patterns */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)
        `,
        backgroundSize: '100px 100px'
      }} />

      {/* Guilloche Pattern Background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="guilloche" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>
      </div>

      {/* Watermark - Large "REVENUE" */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-serif font-bold text-emerald-950/20 select-none pointer-events-none tracking-wider">
        REVENUE
      </div>

      {/* Nav with Serial Number Style */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-900/30 backdrop-blur-xl bg-[#0a1f0f]/90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-950/50">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-emerald-400 font-serif font-bold text-lg tracking-wider">REVENUE</div>
                <div className="text-[10px] text-emerald-700 font-mono tracking-widest">SERIES 2026</div>
              </div>
            </div>
            <Link
              to="/"
              className="text-sm text-emerald-600 hover:text-emerald-400 transition-colors font-mono tracking-wider"
            >
              RETURN
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Dollar Bill Style */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">

        {/* Ornate Corner Decorations */}
        <div className="absolute top-32 left-8 w-24 h-24 border-t-2 border-l-2 border-emerald-800/40 rounded-tl-3xl" />
        <div className="absolute top-32 right-8 w-24 h-24 border-t-2 border-r-2 border-emerald-800/40 rounded-tr-3xl" />
        <div className="absolute bottom-32 left-8 w-24 h-24 border-b-2 border-l-2 border-emerald-800/40 rounded-bl-3xl" />
        <div className="absolute bottom-32 right-8 w-24 h-24 border-b-2 border-r-2 border-emerald-800/40 rounded-br-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10">

          {/* Serial Number Top */}
          <div className="font-mono text-emerald-600/50 text-sm tracking-[0.3em] mb-8">
            NO. R2026847293
          </div>

          {/* Official Seal Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-emerald-600/30 bg-emerald-950/30 text-emerald-400 text-sm font-serif mb-8 backdrop-blur-sm">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            CERTIFIED REVENUE SYSTEM
          </div>

          {/* Main Headline - Dollar Bill Style */}
          <h1 className="text-[80px] md:text-[110px] font-serif font-bold tracking-tight leading-[0.9] mb-8 text-emerald-50">
            IN REVENUE
            <br />
            <span className="text-transparent bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text">
              WE TRUST
            </span>
          </h1>

          <p className="text-[20px] text-emerald-200/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Backed by artificial intelligence. Redeemable for real customers.
            <br />
            Legal tender for building your business.
          </p>

          {/* Try It Input - Premium Currency Style */}
          <div className="max-w-3xl mx-auto mb-16">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-full blur opacity-20" />
              <div className="relative flex items-center gap-3 p-2 bg-emerald-950/50 backdrop-blur-xl rounded-full border-2 border-emerald-600/30">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="Deposit your company URL"
                  className="flex-1 bg-transparent text-emerald-100 placeholder:text-emerald-700 text-lg px-6 py-4 outline-none font-light"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !companyUrl.trim()}
                  className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a1f0f] font-semibold rounded-full flex items-center gap-2 transition-all flex-shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0a1f0f]/20 border-t-[#0a1f0f] rounded-full animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Redeem
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="text-center text-emerald-700 text-xs mt-4 font-mono tracking-wider uppercase">
              Backed by AI • Full faith and credit
            </p>
          </div>

          {/* Stats - Currency Note Style */}
          <div className="grid grid-cols-4 gap-8 pt-12 border-t-2 border-emerald-900/30">
            <div className="text-center">
              <div className="font-serif text-[32px] font-bold text-emerald-400 mb-1 tabular-nums">
                ${(revenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-[11px] text-emerald-700 uppercase tracking-widest font-mono">
                Issued
              </div>
            </div>

            <div className="text-center">
              <div className="font-serif text-[32px] font-bold text-emerald-400 mb-1 tabular-nums">
                {clients.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 uppercase tracking-widest font-mono">
                Holders
              </div>
            </div>

            <div className="text-center">
              <div className="font-serif text-[32px] font-bold text-emerald-400 mb-1">
                48H
              </div>
              <div className="text-[11px] text-emerald-700 uppercase tracking-widest font-mono">
                Maturity
              </div>
            </div>

            <div className="text-center">
              <div className="font-serif text-[32px] font-bold text-emerald-400 mb-1">
                AAA
              </div>
              <div className="text-[11px] text-emerald-700 uppercase tracking-widest font-mono">
                Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Official Certificate Style */}
      <section className="relative py-32 border-t-2 border-emerald-900/30">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-24">
            <div className="inline-block px-6 py-2 border-2 border-emerald-600/30 rounded-full mb-6 bg-emerald-950/30">
              <span className="text-emerald-400 text-sm font-mono tracking-widest uppercase">Specification</span>
            </div>
            <h2 className="text-[56px] font-serif font-bold tracking-tight leading-[1.1] text-emerald-50">
              Denomination Details
            </h2>
          </div>

          <div className="space-y-0">

            {/* Step 1 */}
            <div className="group relative border-b-2 border-emerald-900/20 pb-12 mb-12">
              <div className="flex items-start gap-12">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-600/30 bg-emerald-950/50 flex items-center justify-center">
                    <span className="text-[32px] font-serif font-bold text-emerald-400">1</span>
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-[36px] font-serif font-bold text-emerald-100 mb-4 tracking-tight">
                    Initial Deposit
                  </h3>
                  <p className="text-emerald-300/70 text-[18px] leading-relaxed max-w-2xl">
                    Provide your company URL. Our AI treasury analyzes your market position, product value, and ideal customer portfolio.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative border-b-2 border-emerald-900/20 pb-12 mb-12">
              <div className="flex items-start gap-12">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-600/30 bg-emerald-950/50 flex items-center justify-center">
                    <span className="text-[32px] font-serif font-bold text-emerald-400">2</span>
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-[36px] font-serif font-bold text-emerald-100 mb-4 tracking-tight">
                    Asset Verification
                  </h3>
                  <p className="text-emerald-300/70 text-[18px] leading-relaxed max-w-2xl">
                    Seven research agents audit millions of prospects, verify market fit, and authenticate needs against your offering.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative pb-12">
              <div className="flex items-start gap-12">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-600/30 bg-emerald-950/50 flex items-center justify-center">
                    <span className="text-[32px] font-serif font-bold text-emerald-400">3</span>
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-[36px] font-serif font-bold text-emerald-100 mb-4 tracking-tight">
                    Revenue Distribution
                  </h3>
                  <p className="text-emerald-300/70 text-[18px] leading-relaxed max-w-2xl">
                    Personalized outreach issued at scale. Custom notes per prospect. Delivered from your domain. Replies forwarded instantly.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Value Proposition - Visual Chart */}
      <section className="relative py-32 border-y-2 border-emerald-900/30 bg-emerald-950/20">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-[56px] font-serif font-bold tracking-tight leading-[1.1] text-emerald-50 mb-4">
              Time to 10 customers
            </h2>
          </div>

          {/* Visual Bar Chart */}
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Traditional - Long Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-600 font-mono text-sm tracking-wider uppercase">Traditional</span>
                <span className="text-emerald-900 text-[36px] font-serif font-bold">180 days</span>
              </div>
              <div className="h-16 bg-emerald-950/50 border-2 border-emerald-900/30 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 w-full flex items-center justify-end px-6">
                  <span className="text-emerald-700 font-mono text-xs tracking-wider">6 MONTHS</span>
                </div>
              </div>
            </div>

            {/* Revenue - Short Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase">Revenue</span>
                <span className="text-emerald-400 text-[36px] font-serif font-bold">2 days</span>
              </div>
              <div className="h-16 bg-emerald-950/50 border-2 border-emerald-600/50 rounded-lg overflow-hidden shadow-lg shadow-emerald-500/10">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-end px-6" style={{ width: '1.1%' }}>
                  <span className="text-[#0a1f0f] font-mono text-xs font-bold tracking-wider whitespace-nowrap">48H</span>
                </div>
              </div>
            </div>

            {/* Stat */}
            <div className="text-center pt-8 border-t-2 border-emerald-900/30">
              <div className="text-[64px] font-serif font-bold text-emerald-400 mb-2">
                90×
              </div>
              <div className="text-emerald-600 text-lg font-mono tracking-wider uppercase">
                Faster customer acquisition
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing - Treasury Bond Style */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <div className="inline-block px-6 py-2 border-2 border-emerald-600/30 rounded-full mb-12 bg-emerald-950/30">
            <span className="text-emerald-400 text-sm font-mono tracking-widest uppercase">Face Value</span>
          </div>

          <div className="text-[96px] font-serif font-black text-emerald-400 mb-4">
            $997
          </div>
          <div className="text-[20px] text-emerald-600 mb-12 font-mono tracking-wider">
            PER MONTH • UNLIMITED ISSUANCE
          </div>

          {/* Benefits */}
          <div className="space-y-3 max-w-2xl mx-auto mb-16">
            {[
              "Unlimited AI research capacity",
              "Unlimited outreach distribution",
              "Your domain, your brand equity",
              "Full CRM integration",
              "Dedicated account manager",
              "White-glove onboarding service",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-[17px] p-4 border-l-2 border-emerald-600/30 bg-emerald-950/20">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-emerald-200">{item}</span>
              </div>
            ))}
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#0a1f0f] font-bold rounded-full transition-all text-[18px] shadow-lg shadow-emerald-500/20"
          >
            Issue Your First Note
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-emerald-700 text-sm mt-6 font-mono tracking-wider">
            14 DAY TRIAL PERIOD
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 border-t-2 border-emerald-900/30">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-[72px] md:text-[96px] font-serif font-bold tracking-tight leading-[1.1] mb-16 text-emerald-50">
            Redeem today
          </h2>

          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-full blur opacity-20" />
              <div className="relative flex items-center gap-3 p-2 bg-emerald-950/50 backdrop-blur-xl rounded-full border-2 border-emerald-600/30">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="Enter your company URL"
                  className="flex-1 bg-transparent text-emerald-100 placeholder:text-emerald-700 text-lg px-6 py-4 outline-none"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !companyUrl.trim()}
                  className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0a1f0f] font-semibold rounded-full flex items-center gap-2 transition-all flex-shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0a1f0f]/20 border-t-[#0a1f0f] rounded-full animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Start
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="text-center text-emerald-700 text-xs mt-4 font-mono tracking-wider uppercase">
              No cost • Immediate settlement
            </p>
          </div>

          {/* Serial Number Bottom */}
          <div className="font-mono text-emerald-600/50 text-sm tracking-[0.3em] mt-16">
            R2026847293 • SERIES 2026
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-emerald-900/30 py-12 bg-emerald-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-emerald-700 font-mono tracking-wider">
              © 2026 NANOWORK REVENUE SYSTEM
            </div>
            <div className="flex gap-8 font-mono tracking-wider">
              <a href="#" className="text-emerald-700 hover:text-emerald-400 transition-colors">TERMS</a>
              <a href="#" className="text-emerald-700 hover:text-emerald-400 transition-colors">PRIVACY</a>
              <a href="#" className="text-emerald-700 hover:text-emerald-400 transition-colors">DOCS</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Cpu, Coins, Globe } from "lucide-react";

export default function Swipe() {
  const [isCardSwiping, setIsCardSwiping] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    // Auto-trigger swipe animation every 6 seconds
    const interval = setInterval(() => {
      setIsCardSwiping(true);
      setApproved(false);

      setTimeout(() => {
        setIsCardSwiping(false);
        setApproved(true);
      }, 1500);

      setTimeout(() => {
        setApproved(false);
      }, 4000);
    }, 6000);

    // Trigger immediately on mount
    setTimeout(() => {
      setIsCardSwiping(true);
      setTimeout(() => {
        setIsCardSwiping(false);
        setApproved(true);
      }, 1500);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-[15px] tracking-tight">Swipe</div>
              <div className="text-blue-400 text-[11px] font-medium">by Nanowork</div>
            </div>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: POS Terminal with Card Swipe */}
          <div className="relative flex items-center justify-center perspective-1000">

            {/* POS Terminal */}
            <div className="relative w-[420px] h-[580px]">

              {/* Terminal Body */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-3xl shadow-2xl border-2 border-slate-700/50 overflow-hidden">

                {/* Screen */}
                <div className="absolute top-8 left-8 right-8 h-[280px] bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border-2 border-slate-700 shadow-inner overflow-hidden">

                  {/* Screen Content */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6">

                    {!isCardSwiping && !approved && (
                      <div className="text-center animate-fade-in">
                        <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                        <div className="text-white text-xl font-bold mb-2">Ready</div>
                        <div className="text-slate-400 text-sm">Swipe or tap card</div>
                      </div>
                    )}

                    {isCardSwiping && (
                      <div className="text-center animate-fade-in">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="text-white text-xl font-bold mb-2">Processing</div>
                        <div className="text-slate-400 text-sm">Computing tokens...</div>
                      </div>
                    )}

                    {approved && !isCardSwiping && (
                      <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="text-green-400 text-xl font-bold mb-2">Approved</div>
                        <div className="text-slate-400 text-sm">847 compute tokens</div>
                      </div>
                    )}

                    {/* Transaction Details on Screen */}
                    {approved && (
                      <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span className="font-mono">$42.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens</span>
                          <span className="font-mono text-blue-400">847 CT</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Screen Glare */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card Slot */}
                <div className="absolute bottom-32 left-8 right-8 h-2 bg-slate-950 rounded-full shadow-inner border-t border-slate-700" />

                {/* Keypad */}
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "•", 0, "←"].map((key, i) => (
                    <button
                      key={i}
                      className="h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold text-sm transition-colors"
                      disabled
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Status Light */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${approved ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-slate-600"} transition-all`} />
                  <div className="text-slate-500 text-[10px] font-medium uppercase">Online</div>
                </div>

                {/* Branding */}
                <div className="absolute top-4 left-4 text-slate-600 text-[10px] font-bold tracking-wider">
                  NANOWORK POS
                </div>
              </div>

              {/* Swiping Card */}
              <div
                className={`absolute top-32 -right-12 w-[340px] h-[215px] transition-all duration-1000 ${
                  isCardSwiping
                    ? "-right-12 opacity-100"
                    : "right-[500px] opacity-0"
                }`}
                style={{
                  transform: isCardSwiping ? "rotate(-8deg)" : "rotate(-8deg) translateX(600px)",
                }}
              >
                {/* Card Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 rounded-2xl opacity-40 blur-xl" />

                {/* Card */}
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden border border-blue-400/30">

                  {/* Holographic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-60" />

                  {/* Chip */}
                  <div className="absolute top-12 left-8 w-12 h-10 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 shadow-lg">
                    <div className="grid grid-cols-3 grid-rows-3 h-full p-1 gap-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-yellow-500/30 rounded-sm" />
                      ))}
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="absolute top-8 right-8">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="absolute top-28 left-8 right-8">
                    <div className="text-white text-xl font-mono tracking-[0.3em] drop-shadow-lg">
                      •••• •••• •••• 8472
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                    <div>
                      <div className="text-white/70 text-[9px] font-semibold uppercase tracking-wider mb-1">
                        Agent
                      </div>
                      <div className="text-white font-semibold tracking-wide text-xs">
                        COMPUTE AGENT
                      </div>
                    </div>

                    <div>
                      <div className="text-white/70 text-[9px] font-semibold uppercase tracking-wider mb-1">
                        Balance
                      </div>
                      <div className="text-white font-semibold tracking-wide text-xs font-mono">
                        12.4K CT
                      </div>
                    </div>

                    {/* Network Logos */}
                    <div className="flex -space-x-1.5">
                      <div className="w-7 h-7 rounded-full bg-white/90" />
                      <div className="w-7 h-7 rounded-full bg-cyan-400/90" />
                    </div>
                  </div>

                  {/* Magnetic Stripe */}
                  <div className="absolute top-6 left-0 right-0 h-10 bg-slate-900/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
              <Coins className="w-4 h-4" />
              Token-Based Payments
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Pay with compute,
                <br />
                not just
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}cash
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-zinc-300 leading-relaxed">
                AI agents make payments across the web using compute tokens.
                No traditional banking. No credit limits. Just raw computational power as currency.
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="text-sm text-zinc-500">
                ⚡ Instant settlement • No fees
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-blue-500/20">
                <div className="text-blue-400 font-bold text-2xl mb-1">1.2M</div>
                <div className="text-sm text-zinc-400">Transactions/day</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-blue-500/20">
                <div className="text-blue-400 font-bold text-2xl mb-1">$847M</div>
                <div className="text-sm text-zinc-400">Volume (compute)</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-blue-500/20">
                <div className="text-blue-400 font-bold text-2xl mb-1">0.3s</div>
                <div className="text-sm text-zinc-400">Avg settlement</div>
              </div>
            </div>
          </div>

        </div>

        {/* Compute as Currency Section */}
        <section className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-300 mb-6">
              <Cpu className="w-4 h-4" />
              The Future of Value
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Compute as a currency
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Money represents stored value. Compute represents stored work.
              Why not use the thing that actually powers the digital economy?
            </p>
          </div>

          {/* Explanation Cards */}
          <div className="space-y-6">

            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Universal Value</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Compute is universally valuable. Every API call, every AI inference, every database query—
                    they all require computational resources. Instead of converting between currencies and
                    payment rails, agents transact directly in the unit of value they actually need.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 hover:border-cyan-500/30 transition-all backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Instant Settlement</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    No waiting for bank transfers or credit card processing. Compute tokens settle instantly
                    because they're already in the digital realm. Your agent swipes, the transaction verifies
                    in milliseconds, and work continues immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">No Borders, No Banks</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Traditional payment systems require accounts, credit checks, and geographic compliance.
                    Compute tokens work everywhere instantly. An agent in Tokyo pays an API in São Paulo
                    without touching a bank or worrying about exchange rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 hover:border-cyan-500/30 transition-all backdrop-blur-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Backed by Work, Not Promises</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Fiat currency is backed by government promise. Crypto is backed by consensus.
                    Compute tokens are backed by actual computational capacity—real servers, real GPUs,
                    real work that can be done right now. It's the most honest form of digital value.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center p-12 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start paying with compute today
            </h3>
            <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
              Every Nanowork agent gets a Swipe card automatically. No setup, no applications, no credit checks.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Create Your Agent
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

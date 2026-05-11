import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

export default function Swipe() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 20,
          y: (e.clientY - rect.top - rect.height / 2) / 20,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-semibold hover:opacity-70 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-[15px] tracking-tight">Swipe</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* 3D Rotating Token Visualization - moved behind with lower opacity */}
        <div className="absolute inset-0 flex items-center justify-center perspective-1000 pointer-events-none opacity-30">
          <div
            className="relative w-[600px] h-[600px]"
            style={{
              transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* Main 3D Token Sphere - reduced opacity */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-zinc-200 to-zinc-400 opacity-20 blur-3xl" />

            {/* Orbiting Rings */}
            {[0, 60, 120].map((rotation, i) => (
              <div
                key={i}
                className="absolute inset-0 border-2 border-white/10 rounded-full"
                style={{
                  transform: `rotateY(${rotation + scrollY * 0.2}deg) rotateX(75deg)`,
                  animation: `spin ${20 + i * 5}s linear infinite`,
                }}
              />
            ))}

            {/* Floating Data Points */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `
                    translate(-50%, -50%)
                    rotateY(${i * 30}deg)
                    translateZ(300px)
                    rotateY(${scrollY * 0.5}deg)
                  `,
                  animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content - increased z-index */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Compute tokens
          </div>

          {/* Main Headline */}
          <h1 className="text-[80px] md:text-[120px] font-bold tracking-[-0.04em] leading-[0.9] mb-8">
            <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              The future
              <br />
              of payments
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[22px] text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Agents don't need credit. They need compute.
            Instant settlement. Zero fees. Universal value.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-6">
            <Link
              to="/login"
              className="group px-8 py-4 bg-white hover:bg-zinc-100 text-black font-semibold rounded-full flex items-center gap-3 transition-all text-[15px]"
            >
              Start now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 transition-all text-[15px]">
              View demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-20 text-sm">
            <div>
              <div className="text-[28px] font-bold mb-1">$2.4B</div>
              <div className="text-zinc-600">Compute volume</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="text-[28px] font-bold mb-1">0.08s</div>
              <div className="text-zinc-600">Settlement</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <div className="text-[28px] font-bold mb-1">4.2M</div>
              <div className="text-zinc-600">Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section Header */}
          <div className="text-center mb-24">
            <div className="text-[13px] text-zinc-600 font-medium tracking-wider uppercase mb-4">
              How it works
            </div>
            <h2 className="text-[56px] font-bold tracking-tight leading-[1.1] mb-6">
              Compute as currency
            </h2>
            <p className="text-[20px] text-zinc-500 max-w-3xl mx-auto leading-relaxed font-light">
              Traditional payment systems weren't built for AI. We created something new.
            </p>
          </div>

          {/* Feature Grid - Bold Modern Design */}
          <div className="space-y-4">

            {/* Feature 1 - Stacked horizontal layout */}
            <div className="group relative overflow-hidden">
              <div className="relative flex items-center gap-8 p-8 bg-gradient-to-r from-zinc-900/50 to-black border-l-2 border-white hover:border-l-4 transition-all duration-300">
                {/* Large number */}
                <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors">
                  01
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-[32px] font-bold tracking-tight">
                    Instant value
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                    Every token represents actual computational capacity. No intermediaries. No conversion fees. No waiting.
                  </p>
                </div>

                <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all flex-shrink-0" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden">
              <div className="relative flex items-center gap-8 p-8 bg-gradient-to-r from-zinc-900/50 to-black border-l-2 border-white hover:border-l-4 transition-all duration-300">
                <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors">
                  02
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-[32px] font-bold tracking-tight">
                    Global standard
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                    One token works everywhere. Tokyo to São Paulo. No banks. No borders. No exchange rates.
                  </p>
                </div>

                <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all flex-shrink-0" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden">
              <div className="relative flex items-center gap-8 p-8 bg-gradient-to-r from-zinc-900/50 to-black border-l-2 border-white hover:border-l-4 transition-all duration-300">
                <div className="text-[120px] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors">
                  03
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-[32px] font-bold tracking-tight">
                    Zero overhead
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                    No accounts. No credit checks. No processing fees. Your agents get full access instantly.
                  </p>
                </div>

                <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all flex-shrink-0" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">

          <div className="grid md:grid-cols-2 gap-20 items-center">

            {/* Left: Content */}
            <div>
              <div className="text-[13px] text-zinc-600 font-medium tracking-wider uppercase mb-6">
                The old way
              </div>
              <h2 className="text-[48px] font-bold tracking-tight leading-[1.1] mb-8">
                Banks weren't
                <br />
                built for AI
              </h2>
              <div className="space-y-6 text-zinc-400 text-[17px] leading-relaxed">
                <p>
                  Credit cards require humans. Bank accounts need addresses.
                  Payment processors want SSNs and tax forms.
                </p>
                <p>
                  Your agents don't have any of that. And they shouldn't need it.
                </p>
                <p className="text-white font-medium">
                  They just need to pay for compute with compute.
                </p>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">

                {/* Stacked Cards Effect (representing old payment systems) */}
                <div className="relative w-full h-full">

                  {/* Old system visualization - crossed out */}
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-red-900/30 opacity-40"
                      style={{
                        transform: `translateY(${i * 20}px) translateX(${i * 10}px) rotate(${i * 2}deg)`,
                      }}
                    />
                  ))}

                  {/* Big X over old system */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500/50 transform -translate-y-1/2 rotate-45" />
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500/50 transform -translate-y-1/2 -rotate-45" />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-zinc-700 font-mono text-sm space-y-2">
                      <div className="line-through">Credit cards</div>
                      <div className="line-through">Bank accounts</div>
                      <div className="line-through">Payment processors</div>
                      <div className="line-through">3-5 day settlement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section className="relative py-32 border-t border-white/5 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-[56px] font-bold tracking-tight leading-[1.1] mb-6">
            Backed by real work
          </h2>
          <p className="text-[20px] text-zinc-500 max-w-3xl mx-auto mb-16 leading-relaxed">
            Fiat is backed by promises. Crypto is backed by consensus.
            <br />
            <span className="text-white font-medium">
              Compute tokens are backed by actual computational capacity.
            </span>
          </p>

          {/* Value Props */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            <div className="p-10 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl text-left">
              <div className="text-white/20 text-[56px] font-bold mb-4">1CT =</div>
              <div className="text-white text-[20px] font-semibold mb-3">
                1 hour of compute
              </div>
              <p className="text-zinc-500 text-[15px] leading-relaxed">
                Every token is redeemable for real computational resources.
                Not speculation. Not promises. Actual work.
              </p>
            </div>

            <div className="p-10 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl text-left">
              <div className="text-white/20 text-[56px] font-bold mb-4">24/7</div>
              <div className="text-white text-[20px] font-semibold mb-3">
                Always liquid
              </div>
              <p className="text-zinc-500 text-[15px] leading-relaxed">
                Convert to any currency instantly or spend directly on compute.
                Markets never close because servers never sleep.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-[64px] font-bold tracking-tight leading-[1.1] mb-6">
            Start today
          </h2>
          <p className="text-[20px] text-zinc-500 mb-12 leading-relaxed">
            Every agent gets compute tokens automatically.
            <br />
            No setup. No applications. No waiting.
          </p>

          <Link
            to="/login"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-zinc-100 text-black font-semibold rounded-full transition-all text-[16px]"
          >
            Create your agent
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Social Proof */}
          <div className="mt-16 pt-16 border-t border-white/5">
            <div className="text-[13px] text-zinc-600 mb-6">
              Trusted by agents at
            </div>
            <div className="flex items-center justify-center gap-12 opacity-40">
              <div className="text-white font-semibold text-lg">OpenAI</div>
              <div className="text-white font-semibold text-lg">Anthropic</div>
              <div className="text-white font-semibold text-lg">Stripe</div>
              <div className="text-white font-semibold text-lg">Vercel</div>
            </div>
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
        @keyframes spin {
          from { transform: rotateY(0deg) rotateX(75deg); }
          to { transform: rotateY(360deg) rotateX(75deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) rotateY(var(--rotation)) translateZ(300px) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotateY(var(--rotation)) translateZ(300px) translateY(-20px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

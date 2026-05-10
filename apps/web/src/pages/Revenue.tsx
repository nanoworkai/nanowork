import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Sparkles, ArrowRight, Zap } from "lucide-react";

export default function Revenue() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyUrl.trim()) return;

    setIsProcessing(true);
    // TODO: Integrate with backend
    setTimeout(() => {
      console.log("Processing:", companyUrl);
      setIsProcessing(false);
    }, 2000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cardRef.current) {
      setIsDragging(true);
      const rect = cardRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && cardRef.current) {
      const container = cardRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newX = e.clientX - containerRect.left - dragOffset.current.x;
        const newY = e.clientY - containerRect.top - dragOffset.current.y;
        setCardPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleCardLeave = () => {
    if (!isDragging) {
      setRotation({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 relative overflow-hidden">
      {/* Money-inspired animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-500" />

        {/* Dollar sign watermarks */}
        <div className="absolute top-1/4 right-1/4 text-emerald-500/5 text-[200px] font-bold select-none">$</div>
        <div className="absolute bottom-1/3 left-1/4 text-green-500/5 text-[150px] font-bold select-none">$</div>
      </div>

      {/* Nav */}
      <header className="relative border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-[15px] tracking-tight">Revenue</div>
              <div className="text-emerald-400 text-[11px] font-medium">by Nanowork</div>
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
      <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Interactive Credit Card */}
          <div className="relative h-[600px] flex items-center justify-center perspective-1000">
            <div
              ref={cardRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleCardHover}
              onMouseLeave={handleCardLeave}
              style={{
                transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              className="relative w-[420px] h-[260px] rounded-2xl preserve-3d select-none"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 rounded-3xl opacity-40 blur-2xl" />

              {/* Credit card */}
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-2xl shadow-2xl overflow-hidden">

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-50" />

                {/* Metallic chip */}
                <div className="absolute top-16 left-8 w-14 h-11 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 shadow-lg overflow-hidden">
                  <div className="grid grid-cols-3 grid-rows-3 h-full p-1 gap-0.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-yellow-500/30 rounded-sm" />
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div className="absolute top-8 right-8 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-bold text-sm">
                    <div className="tracking-wider">REVENUE</div>
                    <div className="text-[10px] opacity-80">NANOWORK</div>
                  </div>
                </div>

                {/* Card number */}
                <div className="absolute top-32 left-8 right-8">
                  <div className="text-white text-2xl font-mono tracking-[0.25em] mb-6 drop-shadow-lg">
                    •••• •••• •••• 7849
                  </div>
                </div>

                {/* Card details */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div>
                    <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      Cardholder
                    </div>
                    <div className="text-white font-semibold tracking-wide text-sm">
                      AI REVENUE AGENT
                    </div>
                  </div>

                  <div>
                    <div className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      Expires
                    </div>
                    <div className="text-white font-semibold tracking-wide text-sm font-mono">
                      12/29
                    </div>
                  </div>

                  {/* Card network */}
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/90" />
                    <div className="w-8 h-8 rounded-full bg-white/70" />
                  </div>
                </div>

                {/* Contactless symbol */}
                <div className="absolute top-16 right-8">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 border-2 border-white/40 rounded-full" />
                    <div className="absolute inset-0.5 border-2 border-white/30 rounded-full" />
                    <div className="absolute inset-1 border-2 border-white/20 rounded-full" />
                    <div className="absolute inset-1.5 border-2 border-white/10 rounded-full" />
                  </div>
                </div>

                {/* Holographic pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
              <Sparkles className="w-4 h-4" />
              AI-Powered Customer Acquisition
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Turn your link into
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                  revenue
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-zinc-300 leading-relaxed">
                Already have a company? Bring your link. Our AI finds your ideal customers,
                researches their needs, and sends personalized outreach—automatically.
              </p>
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl opacity-20 blur transition-opacity" />
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="relative w-full bg-zinc-900/90 backdrop-blur-xl text-white placeholder:text-zinc-500 px-6 py-4 rounded-xl border border-emerald-500/20 focus:border-emerald-500/50 focus:outline-none text-lg transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Start
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-zinc-500">
                💵 No credit card required • Free analysis • Results in minutes
              </p>
            </form>

            {/* Key features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20">
                <div className="text-emerald-400 font-bold text-2xl mb-1">24/7</div>
                <div className="text-sm text-zinc-400">Always finding customers</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20">
                <div className="text-emerald-400 font-bold text-2xl mb-1">&lt; 48h</div>
                <div className="text-sm text-zinc-400">To first customer</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div className="text-emerald-400 font-bold text-xl">AI Agents</div>
                </div>
                <div className="text-sm text-zinc-400">Research & outreach</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/20">
                <div className="text-emerald-400 font-bold text-2xl mb-1">+143%</div>
                <div className="text-sm text-zinc-400">Avg revenue increase</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

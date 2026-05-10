import { useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Users, Mail, Search } from "lucide-react";
import MoneyMakerDashboard from "./MoneyMakerDashboard";

export default function MoneyMaker() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyUrl.trim()) return;

    setIsProcessing(true);
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
  };

  if (sessionId) {
    return <MoneyMakerDashboard companyUrl={companyUrl} sessionId={sessionId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-violet-950/20 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative">
        <nav className="border-b border-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold tracking-tight">Nanowork Money Maker</span>
            </div>
            <a
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Back to Home
            </a>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              AI-Powered Revenue Optimization
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              Find customers.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Grow revenue.
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Drop your company URL and watch our AI agents research your market,
              identify prospects, and send outreach—all in real-time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-16 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />

              <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex items-center gap-2">
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="flex-1 bg-transparent text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none text-lg"
                  required
                />

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                >
                  {isProcessing ? "Starting..." : "Start Analysis"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-zinc-500 mt-4">
              No credit card required • Free analysis • Results in minutes
            </p>
          </form>

          <div className="grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Market Research"
              description="AI agents analyze your industry, competitors, and ideal customer profile"
              color="from-violet-500/20 to-purple-500/20"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Lead Discovery"
              description="Identify high-value prospects matching your product's positioning"
              color="from-purple-500/20 to-indigo-500/20"
            />
            <FeatureCard
              icon={<Mail className="w-6 h-6" />}
              title="Smart Outreach"
              description="Personalized emails sent to decision-makers with clear value propositions"
              color="from-indigo-500/20 to-blue-500/20"
            />
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Revenue Intelligence</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Watch as 7 specialized AI departments work together: Research analyzes your market,
                  Marketing crafts positioning, Sales identifies prospects, and Operations coordinates
                  outreach. Every action is visible in your live dashboard.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative">
      <div className={`absolute -inset-px bg-gradient-to-br ${color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur`} />

      <div className="relative p-6 rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-violet-400 mb-4">
          {icon}
        </div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

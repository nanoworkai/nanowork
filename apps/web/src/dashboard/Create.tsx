import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, Building2, Sparkles, Settings2, Users, Package, Gauge } from "lucide-react";
import WelcomeBanner from "./components/WelcomeBanner";
import QuickStart from "./components/QuickStart";
import IndustrialSlider from "./components/IndustrialSlider";
import { apiFetch } from "../lib/apiFetch";

export default function Create() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [hasBuilds, setHasBuilds] = useState(false);

  // Configuration sliders for industrial design
  const [complexity, setComplexity] = useState(50);
  const [userCount, setUserCount] = useState(3);
  const [features, setFeatures] = useState(5);

  // Check if user has any builds to determine first-time user status
  useEffect(() => {
    const checkBuilds = async () => {
      if (!session?.access_token) return;

      try {
        const res = await apiFetch('/api/builds');

        if (res.ok) {
          const { builds } = await res.json();
          setHasBuilds(builds && builds.length > 0);
        }
      } catch (err) {
        console.error('Failed to check builds:', err);
      }
    };

    checkBuilds();
  }, [session]);

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !session?.access_token) return;

    setCreating(true);

    try {
      // Generate AI name for the build
      const nameRes = await apiFetch('/api/builds/generate-name', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      let buildName = 'New Build';
      if (nameRes.ok) {
        const { name } = await nameRes.json();
        buildName = name;
      }

      // Create the build
      const res = await apiFetch('/api/builds', {
        method: 'POST',
        body: JSON.stringify({
          name: buildName,
          prompt: prompt.trim(),
        }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setPrompt('');

        // Navigate to the builder view
        navigate(`/dashboard/builder/${build.id}`);
      }
    } catch (err) {
      console.error('Failed to create build:', err);
    } finally {
      setCreating(false);
    }
  };

  const examples = [
    {
      title: "SaaS Platform",
      description: "Customer portal with subscription management, analytics dashboard, and API integrations"
    },
    {
      title: "Booking System",
      description: "Appointment scheduling with calendar sync, automated reminders, and payment processing"
    },
    {
      title: "Internal Tool",
      description: "Team workflow management with real-time collaboration, task tracking, and reporting"
    }
  ];

  // Check if profile has business name for completion status
  const profileComplete = !!(profile?.businessName && profile?.name);

  // Get complexity label
  const getComplexityLabel = (val: number) => {
    if (val < 33) return "Simple";
    if (val < 66) return "Standard";
    return "Enterprise";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Banner - Only shows for first-time users */}
      <WelcomeBanner
        userName={profile?.name || profile?.businessName}
      />

      {/* Quick Start Guide - Shows until user has builds and profile is complete */}
      <QuickStart
        hasBuilds={hasBuilds}
        profileComplete={profileComplete}
      />

      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Configure Build
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Precision-engineered application generation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono text-white/70">AI-POWERED</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Start Templates - Moved above form */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10">
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">
            Quick Start Templates
          </h3>
          <div className="grid md:grid-cols-3 gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example.description)}
                disabled={creating}
                className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <p className="text-xs font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                  {example.title}
                </p>
                <p className="text-[10px] text-white/40 leading-tight mt-0.5 line-clamp-2">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Configuration Form */}
        <form onSubmit={handleCreateBuild} className="space-y-6">
            {/* Application Brief - Compact */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-white/70" />
                <label htmlFor="business-description" className="text-xs font-bold text-white uppercase tracking-wider">
                  Application Brief
                </label>
              </div>
              <textarea
                id="business-description"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your application in technical detail: architecture, user workflows, integrations, compliance requirements..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 text-sm leading-relaxed outline-none resize-none transition-all font-mono"
                disabled={creating}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Spec Document</span>
                <span className="text-[10px] font-mono text-white/40">{prompt.length} chars</span>
              </div>
            </div>

            {/* Configuration Matrix - Industrial Sliders */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-white/70" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Build Parameters
                </h3>
              </div>

              <div className="space-y-5">
                <IndustrialSlider
                  label="Complexity"
                  value={complexity}
                  min={0}
                  max={100}
                  onChange={setComplexity}
                  disabled={creating}
                  icon={Gauge}
                  color="emerald"
                  displayValue={getComplexityLabel(complexity)}
                  minLabel="Simple"
                  maxLabel="Enterprise"
                />

                <IndustrialSlider
                  label="User Roles"
                  value={userCount}
                  min={1}
                  max={10}
                  onChange={setUserCount}
                  disabled={creating}
                  icon={Users}
                  color="blue"
                  displayValue={`${userCount} ${userCount === 1 ? 'Role' : 'Roles'}`}
                  minLabel="Solo"
                  maxLabel="Multi-Tenant"
                />

                <IndustrialSlider
                  label="Core Features"
                  value={features}
                  min={1}
                  max={15}
                  onChange={setFeatures}
                  disabled={creating}
                  icon={Package}
                  color="purple"
                  displayValue={`${features} Modules`}
                  minLabel="Minimal"
                  maxLabel="Full Suite"
                />
              </div>
            </div>

            {/* Launch Button - Industrial */}
            <button
              type="submit"
              disabled={!prompt.trim() || creating}
              className="group relative w-full px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed text-white disabled:text-white/30 font-bold text-sm tracking-wide transition-all shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <span className="relative flex items-center justify-center gap-2.5">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="uppercase text-xs tracking-widest">Initializing Build...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase text-xs tracking-widest">Deploy Build</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
      </div>
    </div>
  );
}

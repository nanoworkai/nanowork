import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, Building2, CheckCircle2, Zap, Code } from "lucide-react";
import WelcomeBanner from "./components/WelcomeBanner";
import QuickStart from "./components/QuickStart";

export default function Create() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [hasBuilds, setHasBuilds] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Check if user has any builds to determine first-time user status
  useEffect(() => {
    const checkBuilds = async () => {
      if (!session?.access_token) return;

      try {
        const res = await fetch(`${apiUrl}/api/builds`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const { builds } = await res.json();
          setHasBuilds(builds && builds.length > 0);
        }
      } catch (err) {
        console.error('Failed to check builds:', err);
      }
    };

    checkBuilds();
  }, [session, apiUrl]);

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !session?.access_token) return;

    setCreating(true);

    try {
      // Generate AI name for the build
      const nameRes = await fetch(`${apiUrl}/api/builds/generate-name`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      let buildName = 'New Build';
      if (nameRes.ok) {
        const { name } = await nameRes.json();
        buildName = name;
      }

      // Create the build
      const res = await fetch(`${apiUrl}/api/builds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildName,
          prompt: prompt.trim(),
        }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setPrompt('');

        // Navigate to the build detail page
        navigate(`/dashboard/builds/${build.id}`);
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome Banner - Only shows for first-time users */}
      <WelcomeBanner
        userName={profile?.name || profile?.businessName}
      />

      {/* Quick Start Guide - Shows until user has builds and profile is complete */}
      <QuickStart
        hasBuilds={hasBuilds}
        profileComplete={profileComplete}
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Start Your Business
          </h1>
        </div>
        <p className="text-white/60 text-base">
          Describe your business application and we'll build it for you. Be specific about your requirements, target users, and key features.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCreateBuild} className="space-y-6">
            {/* Business Description */}
            <div className="space-y-3">
              <label htmlFor="business-description" className="block text-sm font-semibold text-white">
                Describe your application
              </label>
              <div className="relative">
                <textarea
                  id="business-description"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: I'm building a property management platform for real estate companies. Need landlord and tenant portals, lease management, maintenance request tracking, automated rent collection, and financial reporting. The system should handle multiple properties and support role-based access for property managers, landlords, and tenants."
                  className="w-full h-56 px-5 py-4 rounded-xl bg-surface-2 border border-white/10 focus:border-white/30 text-white placeholder-white/40 text-base leading-relaxed outline-none resize-none transition-all"
                  disabled={creating}
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 text-xs text-white/30">
                  {prompt.length} characters
                </div>
              </div>
              <p className="text-sm text-white/50">
                Include your target users, core features, integrations, and any compliance requirements.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || creating}
              className="group w-full px-6 py-4 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-semibold text-base transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <span className="flex items-center justify-center gap-2.5">
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your application...
                  </>
                ) : (
                  <>
                    Start Building
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Sidebar - Information & Examples */}
        <div className="space-y-6">
          {/* What Happens Next */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              What happens next
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white/60">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">AI Architecture</p>
                  <p className="text-xs text-white/50 mt-0.5">System design and data model</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white/60">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Code Generation</p>
                  <p className="text-xs text-white/50 mt-0.5">Full-stack application build</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white/60">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Deploy & Launch</p>
                  <p className="text-xs text-white/50 mt-0.5">Production-ready in minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Example applications
            </h3>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example.description)}
                  disabled={creating}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <p className="text-sm font-medium text-white/90 mb-1 group-hover:text-white">
                    {example.title}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {example.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4">
              Included with every build
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/70">Production-ready code</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/70">Database & authentication</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/70">Responsive design</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/70">Deployment configuration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

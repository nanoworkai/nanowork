import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../lib/apiFetch";

export default function Create() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [showClaimedToast, setShowClaimedToast] = useState(false);

  // Check for claimed business success
  useEffect(() => {
    if (searchParams.get('claim_pending') === 'true') {
      const timer = setTimeout(() => {
        setShowClaimedToast(true);
        window.history.replaceState({}, '', '/dashboard');
      }, 1000);

      const hideTimer = setTimeout(() => setShowClaimedToast(false), 6000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [searchParams]);

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !session?.access_token) return;

    setCreating(true);

    try {
      const nameRes = await apiFetch('/api/builds/generate-name', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      let buildName = 'New Build';
      if (nameRes.ok) {
        const { name } = await nameRes.json();
        buildName = name;
      }

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
        navigate(`/dashboard/builder/${build.id}`);
      }
    } catch (err) {
      console.error('Failed to create build:', err);
    } finally {
      setCreating(false);
    }
  };

  const examples = [
    "Customer portal with subscription billing",
    "Appointment scheduling with calendar sync",
    "Team workflow with task tracking"
  ];

  return (
    <div className="space-y-8">
      {/* Success Toast */}
      {showClaimedToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md border border-fintech-green/20 bg-fintech-green/5 p-4 shadow-card">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-fintech-green flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-fintech-navy mb-1">
                Business claimed successfully
              </p>
              <p className="text-xs text-fintech-slate">
                Your business has been added to your dashboard.
              </p>
            </div>
            <button
              onClick={() => setShowClaimedToast(false)}
              className="text-fintech-slate hover:text-fintech-navy transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-semibold text-fintech-navy mb-2">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-fintech-slate">
          Describe what you'd like to build and we'll get started.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleCreateBuild} className="max-w-3xl space-y-6">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-fintech-navy mb-3">
            What would you like to build?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your application..."
            className="w-full h-32 px-4 py-3 bg-surface-1 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm resize-none transition-colors"
            disabled={creating}
            autoFocus
          />
          <p className="text-xs text-fintech-slate mt-2">
            Be specific about features, user workflows, and integrations you need.
          </p>
        </div>

        {/* Quick Examples */}
        <div>
          <p className="text-xs font-medium text-fintech-slate mb-3">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                disabled={creating}
                className="px-3 py-2 text-xs bg-surface-0 hover:bg-surface-1 border border-fintech-border hover:border-fintech-navy text-fintech-slate hover:text-fintech-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-button transition-colors"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating build...
            </>
          ) : (
            <>
              Create build
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

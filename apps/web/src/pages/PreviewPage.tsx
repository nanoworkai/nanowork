import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Sparkles, CreditCard, ArrowRight } from "lucide-react";

interface BuildData {
  id: string;
  prompt: string;
  company_name: string;
  tagline: string;
  status: "preview" | "unlocked";
  credits_cost: number;
  build_data: {
    company_name: string;
    tagline: string;
    departments: Record<string, { tasks: string[]; first_output: string }>;
  };
  preview_url?: string;
  full_url?: string;
}

export default function PreviewPage() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [build, setBuild] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    loadBuild();
    if (isAuthenticated) {
      loadCredits();
    }
  }, [buildId, isAuthenticated]);

  async function loadBuild() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/build/${buildId}`
      );

      if (!response.ok) {
        throw new Error("Build not found");
      }

      const data = await response.json();
      setBuild(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load build");
    } finally {
      setLoading(false);
    }
  }

  async function loadCredits() {
    // TODO: Implement credits fetching from API
    setUserCredits(250); // Mock for now
  }

  async function handleUnlock() {
    if (!isAuthenticated) {
      // Redirect to signup with return URL
      navigate(`/login?redirect=/preview/${buildId}`);
      return;
    }

    if (userCredits < (build?.credits_cost || 0)) {
      // Redirect to buy credits
      navigate(`/dashboard/plan?from=preview&buildId=${buildId}`);
      return;
    }

    setUnlocking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/build/${buildId}/unlock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to unlock build");
      }

      const data = await response.json();

      // Redirect to full build
      navigate(data.full_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock");
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING BUILD...</p>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-sm font-mono text-red-400 mb-4">{error || "BUILD NOT FOUND"}</p>
          <button
            onClick={() => navigate("/")}
            className="text-xs font-mono text-white/60 hover:text-white"
          >
            ← BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  const isUnlocked = build.status === "unlocked";
  const depts = build.build_data?.departments || {};
  const deptNames = Object.keys(depts);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-surface-1">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold">{build.company_name}</h1>
              <p className="text-sm font-mono text-white/60 mt-1">{build.tagline}</p>
            </div>

            {!isUnlocked && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-mono text-white/40 uppercase">Preview Mode</div>
                  <div className="text-lg font-mono font-bold text-amber-400">
                    {build.credits_cost} Credits to Unlock
                  </div>
                </div>

                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="px-6 py-3 bg-white text-black font-mono text-sm font-bold rounded-none hover:bg-white/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {unlocking ? (
                    "UNLOCKING..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      UNLOCK FULL BUILD
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isUnlocked && (
          <div className="mb-8 p-6 border border-amber-400/20 bg-amber-400/5 rounded-none">
            <div className="flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-mono font-bold text-amber-400 mb-2">
                  🎉 YOUR COMPANY IS READY
                </h3>
                <p className="text-sm font-mono text-white/80 mb-4">
                  You're viewing a limited preview. Unlock the full build to get:
                </p>
                <ul className="space-y-2 text-sm font-mono text-white/60">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Complete website with all pages and sections
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Downloadable assets (logos, PDFs, templates)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Full department outputs and action plans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Editable company dashboard
                  </li>
                </ul>

                {!isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-mono text-white/40 mb-3">
                      Don't have an account? Sign up to get 500 free credits.
                    </p>
                    <button
                      onClick={() => navigate(`/login?redirect=/preview/${buildId}`)}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-2"
                    >
                      CREATE FREE ACCOUNT <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {isAuthenticated && userCredits < build.credits_cost && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-mono text-white/40 mb-3">
                      You have {userCredits} credits. Need {build.credits_cost - userCredits} more.
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/plan?from=preview&buildId=${buildId}`)}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-2"
                    >
                      <CreditCard className="w-3 h-3" />
                      BUY CREDITS
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Department Grid - Limited Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deptNames.slice(0, isUnlocked ? deptNames.length : 3).map((deptName) => {
            const dept = depts[deptName];
            return (
              <div
                key={deptName}
                className="border border-white/10 bg-surface-1 rounded-none p-6"
              >
                <h3 className="font-mono font-bold text-white mb-2">{deptName}</h3>
                <p className="text-xs font-mono text-white/60 mb-4">{dept.first_output}</p>

                <div className="space-y-2">
                  {dept.tasks.slice(0, isUnlocked ? dept.tasks.length : 2).map((task, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <span className="text-xs font-mono text-white/80">{task}</span>
                    </div>
                  ))}
                  {!isUnlocked && dept.tasks.length > 2 && (
                    <div className="text-xs font-mono text-white/40 italic">
                      + {dept.tasks.length - 2} more tasks (unlock to see)
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Locked Department Cards */}
          {!isUnlocked &&
            deptNames.slice(3).map((deptName) => (
              <div
                key={deptName}
                className="border border-white/10 bg-surface-1/50 rounded-none p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-xs font-mono text-white/60 font-bold">
                      UNLOCK TO VIEW
                    </p>
                  </div>
                </div>

                <h3 className="font-mono font-bold text-white mb-2">{deptName}</h3>
                <div className="h-20 bg-white/5 rounded-none" />
              </div>
            ))}
        </div>

        {/* CTA Footer */}
        {!isUnlocked && (
          <div className="mt-12 text-center">
            <button
              onClick={handleUnlock}
              disabled={unlocking}
              className="px-8 py-4 bg-white text-black font-mono text-base font-bold rounded-none hover:bg-white/90 disabled:opacity-50 inline-flex items-center gap-3"
            >
              <Lock className="w-5 h-5" />
              {unlocking ? "UNLOCKING..." : `UNLOCK FOR ${build.credits_cost} CREDITS`}
            </button>

            <p className="text-xs font-mono text-white/40 mt-4">
              One-time unlock • Instant access • Full company dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

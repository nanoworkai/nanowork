import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Sparkles, Crown, ArrowRight, Terminal } from "lucide-react";
import WhiteGlovePayment from "../components/WhiteGlovePayment";

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
  const [searchParams] = useSearchParams();

  const [build, setBuild] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user just unlocked via Stripe
  const justUnlocked = searchParams.get("unlocked") === "true";

  useEffect(() => {
    loadBuild();
  }, [buildId]);

  async function loadBuild() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/build/${buildId}`
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

  function handleUnlock() {
    if (!isAuthenticated) {
      // Redirect to signup with return URL
      navigate(`/login?redirect=/preview/${buildId}`);
      return;
    }

    // Show payment modal
    setShowPayment(true);
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

  const isUnlocked = build.status === "unlocked" || justUnlocked;
  const depts = build.build_data?.departments || {};
  const deptNames = Object.keys(depts);

  // Show payment modal
  if (showPayment) {
    return (
      <WhiteGlovePayment
        buildId={buildId!}
        companyName={build.company_name}
        onSuccess={() => {
          setShowPayment(false);
          navigate(`/preview/${buildId}?unlocked=true`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-mono font-bold">{build.company_name}</h1>
                <p className="text-xs sm:text-sm font-mono text-white/60 mt-1">{build.tagline}</p>
              </div>
            </div>

            {!isUnlocked && (
              <button
                onClick={handleUnlock}
                className="px-4 sm:px-6 py-3 bg-white text-black font-mono text-xs sm:text-sm font-bold rounded-none hover:bg-white/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                UNLOCK FULL BUILD
              </button>
            )}

            {isUnlocked && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-none">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-xs font-mono text-green-400 font-bold uppercase">Unlocked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!isUnlocked && (
          <div className="mb-8 p-6 sm:p-8 border border-white/10 bg-surface-1 rounded-none">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Sparkles className="w-8 h-8 text-white/60 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-mono font-bold text-white mb-2">
                  Your Company Is Ready to Launch
                </h3>
                <p className="text-sm font-mono text-white/80 mb-6 leading-relaxed">
                  We've built your complete company infrastructure—7 AI departments working in parallel. Unlock everything to get full access plus personalized onboarding support.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-mono font-bold text-white">Production Website</div>
                      <div className="text-xs font-mono text-white/60 mt-0.5">
                        Deployed and ready to go live
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-mono font-bold text-white">1-on-1 Kickoff Call</div>
                      <div className="text-xs font-mono text-white/60 mt-0.5">
                        Personalized onboarding session
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-mono font-bold text-white">All 7 Departments</div>
                      <div className="text-xs font-mono text-white/60 mt-0.5">
                        Legal, brand, web, marketing, sales, finance, ops
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-mono font-bold text-white">Priority Support</div>
                      <div className="text-xs font-mono text-white/60 mt-0.5">
                        Direct access for 30 days
                      </div>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs font-mono text-white/60 mb-3">
                      Create an account to unlock your build and get started.
                    </p>
                    <button
                      onClick={() => navigate(`/login?redirect=/preview/${buildId}`)}
                      className="text-xs font-mono text-white hover:text-white/80 flex items-center gap-2 font-bold"
                    >
                      CREATE ACCOUNT <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isUnlocked && (
          <div className="mb-8 p-6 border border-green-400/20 bg-green-400/5 rounded-none">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="font-mono font-bold text-green-400 mb-1">
                  Welcome to Nanowork!
                </h3>
                <p className="text-sm font-mono text-white/80">
                  Check your email for your onboarding schedule. We'll be in touch within 24 hours to set up your kickoff call.
                </p>
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
              className="px-8 py-4 bg-white text-black font-mono text-base font-bold rounded-none hover:bg-white/90 transition-colors inline-flex items-center gap-3"
            >
              <Lock className="w-5 h-5" />
              UNLOCK FULL BUILD
            </button>

            <p className="text-xs font-mono text-white/60 mt-4 max-w-md mx-auto leading-relaxed">
              $497 one-time setup • Then $99/month • Includes 1-on-1 kickoff call and 30 days priority support
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Building2,
  CreditCard,
  Zap,
  ArrowRight,
  Check,
  Play,
  X,
  Pause,
  SkipForward
} from "lucide-react";

/**
 * Interactive Demo Flow Component
 *
 * Showcases the entire Nanowork experience:
 * 1. Create a build with AI
 * 2. Watch agents work in parallel
 * 3. Create a second build simultaneously
 * 4. View credit usage
 * 5. Upgrade plan for more capacity
 */

type DemoStep =
  | "welcome"
  | "create-first"
  | "generating-first"
  | "view-progress"
  | "create-second"
  | "parallel-builds"
  | "credits-warning"
  | "upgrade-plan"
  | "complete";

interface MockBuild {
  id: string;
  name: string;
  prompt: string;
  status: "generating" | "completed" | "failed";
  progress: number;
  agents: {
    type: string;
    name: string;
    status: "pending" | "working" | "completed";
    progress: number;
  }[];
  creditsUsed: number;
}

const DEMO_BUILDS: { [key: string]: Partial<MockBuild> } = {
  first: {
    name: "Fitness Coaching Platform",
    prompt: "A fitness coaching app with workout tracking, meal planning, and progress analytics",
  },
  second: {
    name: "Property Management System",
    prompt: "Property management software for landlords with tenant portal, rent collection, and maintenance tracking",
  },
};

const AGENT_TYPES = [
  { type: "business_analyst", name: "Business Analyst", icon: "📊" },
  { type: "product_designer", name: "Product Designer", icon: "🎨" },
  { type: "technical_architect", name: "Technical Architect", icon: "⚙️" },
  { type: "marketing", name: "Marketing Strategist", icon: "📢" },
  { type: "financial_planner", name: "Financial Planner", icon: "💰" },
  { type: "legal", name: "Legal Advisor", icon: "⚖️" },
  { type: "pitch", name: "Pitch Strategist", icon: "🎯" },
];

export default function DemoFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<DemoStep>("welcome");
  const [isPaused, setIsPaused] = useState(false);
  const [builds, setBuilds] = useState<MockBuild[]>([]);
  const [credits, setCredits] = useState(100);
  const [plan, setPlan] = useState<"free" | "starter" | "growth">("free");

  // Auto-advance through steps
  useEffect(() => {
    if (isPaused) return;

    const timers: NodeJS.Timeout[] = [];

    switch (step) {
      case "welcome":
        timers.push(setTimeout(() => setStep("create-first"), 3000));
        break;
      case "create-first":
        timers.push(setTimeout(() => {
          createBuild(DEMO_BUILDS.first);
          setStep("generating-first");
        }, 2000));
        break;
      case "generating-first":
        timers.push(setTimeout(() => setStep("view-progress"), 5000));
        break;
      case "view-progress":
        timers.push(setTimeout(() => setStep("create-second"), 4000));
        break;
      case "create-second":
        timers.push(setTimeout(() => {
          createBuild(DEMO_BUILDS.second);
          setStep("parallel-builds");
        }, 2000));
        break;
      case "parallel-builds":
        timers.push(setTimeout(() => setStep("credits-warning"), 6000));
        break;
      case "credits-warning":
        timers.push(setTimeout(() => setStep("upgrade-plan"), 3000));
        break;
      case "upgrade-plan":
        timers.push(setTimeout(() => {
          setPlan("starter");
          setCredits(1000);
          setStep("complete");
        }, 2000));
        break;
    }

    return () => timers.forEach(clearTimeout);
  }, [step, isPaused]);

  // Simulate build progress
  useEffect(() => {
    if (isPaused || builds.length === 0) return;

    const interval = setInterval(() => {
      setBuilds((prev) =>
        prev.map((build) => {
          if (build.status === "completed") return build;

          const newAgents = build.agents.map((agent) => {
            if (agent.status === "completed") return agent;
            if (agent.status === "pending" && Math.random() > 0.7) {
              return { ...agent, status: "working" as const, progress: 10 };
            }
            if (agent.status === "working") {
              const newProgress = Math.min(agent.progress + Math.random() * 15, 100);
              return {
                ...agent,
                progress: newProgress,
                status: newProgress >= 100 ? ("completed" as const) : agent.status,
              };
            }
            return agent;
          });

          const overallProgress = newAgents.reduce((sum, a) => sum + a.progress, 0) / newAgents.length;
          const allComplete = newAgents.every((a) => a.status === "completed");

          return {
            ...build,
            agents: newAgents,
            progress: overallProgress,
            status: allComplete ? ("completed" as const) : build.status,
          };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [isPaused, builds.length]);

  // Deduct credits
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setBuilds((prev) =>
        prev.map((build) => {
          if (build.status === "generating") {
            const cost = Math.random() * 2;
            setCredits((c) => Math.max(0, c - cost));
            return { ...build, creditsUsed: build.creditsUsed + cost };
          }
          return build;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const createBuild = (buildTemplate: Partial<MockBuild>) => {
    const newBuild: MockBuild = {
      id: Math.random().toString(36).substr(2, 9),
      name: buildTemplate.name || "New Build",
      prompt: buildTemplate.prompt || "",
      status: "generating",
      progress: 0,
      creditsUsed: 0,
      agents: AGENT_TYPES.map((agent) => ({
        ...agent,
        status: "pending",
        progress: 0,
      })),
    };
    setBuilds((prev) => [...prev, newBuild]);
  };

  const resetDemo = () => {
    setStep("welcome");
    setBuilds([]);
    setCredits(100);
    setPlan("free");
    setIsPaused(false);
  };

  const skipToEnd = () => {
    setStep("complete");
    setBuilds([]);
    setCredits(1000);
    setPlan("starter");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Demo Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={skipToEnd}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
        <button
          onClick={resetDemo}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          Exit Demo
        </button>
      </div>

      {/* Status Bar */}
      <div className="fixed top-4 left-4 z-50 px-4 py-2 bg-black/40 backdrop-blur-lg border border-white/20 rounded-lg">
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-white/60">PLAN:</span>{" "}
            <span className="text-emerald-400 font-bold uppercase">{plan}</span>
          </div>
          <div>
            <span className="text-white/60">CREDITS:</span>{" "}
            <span className={`font-bold ${credits < 20 ? "text-red-400" : "text-white"}`}>
              {credits.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-white/60">BUILDS:</span>{" "}
            <span className="text-white font-bold">{builds.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Step Content */}
          {step === "welcome" && <WelcomeStep />}
          {step === "create-first" && <CreateFirstStep />}
          {(step === "generating-first" || step === "view-progress") && (
            <BuildProgressStep builds={builds} />
          )}
          {step === "create-second" && <CreateSecondStep />}
          {step === "parallel-builds" && <ParallelBuildsStep builds={builds} />}
          {step === "credits-warning" && <CreditsWarningStep credits={credits} />}
          {step === "upgrade-plan" && <UpgradePlanStep />}
          {step === "complete" && <CompleteStep onReset={resetDemo} />}
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep() {
  return (
    <div className="text-center animate-in fade-in duration-1000">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6">
        <Sparkles className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Welcome to Nanowork
      </h1>
      <p className="text-xl text-white/60 max-w-2xl mx-auto">
        Watch as we build complete applications with AI agents working in parallel
      </p>
    </div>
  );
}

function CreateFirstStep() {
  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-400" />
          Creating Your First Build
        </h2>
        <p className="text-white/60 mb-6">
          Let's start by building a fitness coaching platform...
        </p>
        <div className="bg-black/20 rounded-lg p-4 border border-white/10 font-mono text-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-white/80">
              A fitness coaching app with workout tracking, meal planning, and progress analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildProgressStep({ builds }: { builds: MockBuild[] }) {
  const build = builds[0];
  if (!build) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-right duration-500">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{build.name}</h2>
            <p className="text-white/60 text-sm">{build.prompt}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">{Math.round(build.progress)}%</div>
            <div className="text-xs text-white/60 mt-1">
              {build.creditsUsed.toFixed(1)} credits used
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${build.progress}%` }}
            />
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {build.agents.map((agent, idx) => (
            <div
              key={agent.type}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-2xl mb-2">{agent.icon}</div>
              <div className="text-xs font-medium text-white/80 mb-2">{agent.name}</div>
              <div className="flex items-center gap-2 text-xs">
                {agent.status === "completed" && (
                  <Check className="w-3 h-3 text-emerald-400" />
                )}
                {agent.status === "working" && (
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
                {agent.status === "pending" && (
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                )}
                <span className={agent.status === "completed" ? "text-emerald-400" : "text-white/60"}>
                  {agent.status === "completed" && "Complete"}
                  {agent.status === "working" && `${Math.round(agent.progress)}%`}
                  {agent.status === "pending" && "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateSecondStep() {
  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-400" />
          Creating a Second Build
        </h2>
        <p className="text-white/60 mb-6">
          Nanowork can handle multiple builds simultaneously...
        </p>
        <div className="bg-black/20 rounded-lg p-4 border border-white/10 font-mono text-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-white/80">
              Property management software for landlords with tenant portal and rent collection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParallelBuildsStep({ builds }: { builds: MockBuild[] }) {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Multiple Builds Running</h2>
        <p className="text-white/60">AI agents working in parallel across both projects</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {builds.map((build, idx) => (
          <div
            key={build.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-in slide-in-from-left"
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{build.name}</h3>
              <div className="text-xl font-bold text-blue-400">{Math.round(build.progress)}%</div>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${build.progress}%` }}
              />
            </div>
            <div className="text-xs text-white/60">
              {build.creditsUsed.toFixed(1)} credits • {build.agents.filter((a) => a.status === "working").length}{" "}
              agents active
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreditsWarningStep({ credits }: { credits: number }) {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-orange-400">Low Credits Warning</h2>
        <p className="text-white/80 mb-4">
          You have <span className="font-bold text-orange-400">{credits.toFixed(0)}</span> credits remaining
        </p>
        <p className="text-sm text-white/60">
          Upgrade your plan to continue building without interruption
        </p>
      </div>
    </div>
  );
}

function UpgradePlanStep() {
  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Upgrading to Starter Plan</h2>
        <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-white/60 mb-1">NEW PLAN</div>
              <div className="text-2xl font-bold text-emerald-400">Starter</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">CREDITS</div>
              <div className="text-2xl font-bold">1,000</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80">Unlimited concurrent builds</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80">Priority agent queue</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80">Advanced analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="text-center animate-in fade-in zoom-in duration-1000">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl mb-6">
        <Check className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
        Demo Complete
      </h1>
      <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
        You've seen the full Nanowork experience from build creation to parallel execution to plan upgrades
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-all"
        >
          Watch Again
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-medium transition-all flex items-center gap-2"
        >
          Start Building
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

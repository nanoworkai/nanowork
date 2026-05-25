import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles, History, Settings, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  action: string;
  actionLink?: string;
  icon: typeof Sparkles;
  completed: boolean;
}

interface QuickStartProps {
  hasBuilds?: boolean;
  profileComplete?: boolean;
  onDismiss?: () => void;
}

export default function QuickStart({ hasBuilds = false, profileComplete = false, onDismiss }: QuickStartProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Check if quick start was dismissed
    const isDismissed = localStorage.getItem("nanowork_quickstart_dismissed");

    // Show if not dismissed and user hasn't completed all steps
    if (!isDismissed && (!hasBuilds || !profileComplete)) {
      setIsVisible(true);
    }
  }, [hasBuilds, profileComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nanowork_quickstart_dismissed", "true");
    onDismiss?.();
  };

  const steps: QuickStartStep[] = [
    {
      id: "create-build",
      title: "Create your first build",
      description: "Describe your application and let AI generate it for you",
      action: "Create Build",
      actionLink: "/dashboard",
      icon: Sparkles,
      completed: hasBuilds,
    },
    {
      id: "view-history",
      title: "Explore your dashboard",
      description: "Learn how to track and manage your builds",
      action: "View History",
      actionLink: "/dashboard/history",
      icon: History,
      completed: false,
    },
    {
      id: "complete-profile",
      title: "Complete your profile",
      description: "Add business details for better AI-generated results",
      action: "Go to Settings",
      actionLink: "/dashboard/settings",
      icon: Settings,
      completed: profileComplete,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  if (!isVisible) return null;

  return (
    <div className="bg-surface-2 border border-white/10 rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Quick Start Guide</h3>
                <p className="text-sm text-white/60">
                  {completedSteps} of {totalSteps} completed
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Steps */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    step.completed
                      ? "bg-white/5 border-white/10 opacity-60"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-white/40" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-white/60" />
                      <h4 className="font-semibold text-white">
                        {index + 1}. {step.title}
                      </h4>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{step.description}</p>

                    {!step.completed && step.actionLink && (
                      <button
                        onClick={() => navigate(step.actionLink!)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-black text-sm font-semibold transition-colors"
                      >
                        {step.action}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {step.completed && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedSteps === totalSteps && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Congratulations! You've completed the quick start guide.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Activity,
  Mail,
  Search,
  Users,
  TrendingUp,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  DollarSign
} from "lucide-react";

interface AgentActivity {
  id: string;
  department: string;
  action: string;
  status: "active" | "complete" | "pending";
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

interface Metric {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
}

export default function MoneyMakerDashboard({
  companyUrl,
  sessionId
}: {
  companyUrl: string;
  sessionId: string;
}) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Prospects Found", value: 0, icon: <Users className="w-5 h-5" /> },
    { label: "Emails Sent", value: 0, icon: <Mail className="w-5 h-5" /> },
    { label: "Est. Revenue", value: "$0", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Analysis Progress", value: "0%", icon: <TrendingUp className="w-5 h-5" /> },
  ]);

  useEffect(() => {
    const simulateAgentActivity = () => {
      const agentSteps: Omit<AgentActivity, "id" | "timestamp" | "status">[] = [
        {
          department: "Research",
          action: "Analyzing company website and value proposition",
          icon: <Search className="w-4 h-4" />,
          color: "from-violet-500 to-purple-600"
        },
        {
          department: "Research",
          action: "Identifying target market and industry verticals",
          icon: <Search className="w-4 h-4" />,
          color: "from-violet-500 to-purple-600"
        },
        {
          department: "Marketing",
          action: "Crafting positioning and messaging framework",
          icon: <Activity className="w-4 h-4" />,
          color: "from-purple-500 to-indigo-600"
        },
        {
          department: "Sales",
          action: "Discovering decision-makers in target companies",
          icon: <Users className="w-4 h-4" />,
          color: "from-indigo-500 to-blue-600"
        },
        {
          department: "Sales",
          action: "Qualifying leads based on fit and intent",
          icon: <Users className="w-4 h-4" />,
          color: "from-indigo-500 to-blue-600"
        },
        {
          department: "Marketing",
          action: "Personalizing outreach templates per prospect",
          icon: <Mail className="w-4 h-4" />,
          color: "from-blue-500 to-cyan-600"
        },
        {
          department: "Operations",
          action: "Sending initial outreach emails",
          icon: <Mail className="w-4 h-4" />,
          color: "from-cyan-500 to-teal-600"
        },
        {
          department: "Finance",
          action: "Calculating revenue projections and ROI",
          icon: <DollarSign className="w-4 h-4" />,
          color: "from-teal-500 to-emerald-600"
        },
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep >= agentSteps.length) {
          clearInterval(interval);
          return;
        }

        const step = agentSteps[currentStep];
        const newActivity: AgentActivity = {
          id: `activity_${Date.now()}_${currentStep}`,
          ...step,
          status: "active",
          timestamp: new Date(),
        };

        setActivities(prev => {
          const updated = [newActivity, ...prev];
          if (prev.length > 0) {
            updated[1] = { ...updated[1], status: "complete" };
          }
          return updated;
        });

        setMetrics(prev => prev.map(metric => {
          const progress = Math.floor(((currentStep + 1) / agentSteps.length) * 100);

          if (metric.label === "Analysis Progress") {
            return { ...metric, value: `${progress}%` };
          }
          if (metric.label === "Prospects Found" && currentStep >= 3) {
            return { ...metric, value: Math.min(45 + (currentStep - 3) * 12, 93) };
          }
          if (metric.label === "Emails Sent" && currentStep >= 6) {
            return { ...metric, value: Math.min(12 + (currentStep - 6) * 8, 28) };
          }
          if (metric.label === "Est. Revenue" && currentStep >= 7) {
            return { ...metric, value: `$${(142000 + (currentStep - 7) * 23000).toLocaleString()}` };
          }
          return metric;
        }));

        currentStep++;
      }, 2500);

      return () => clearInterval(interval);
    };

    const cleanup = simulateAgentActivity();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-violet-950/20 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.1),transparent_50%)]" />

      <div className="relative">
        <nav className="border-b border-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/money-maker"
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">New Analysis</span>
              </a>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-sm font-medium">Analyzing:</span>
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  {new URL(companyUrl).hostname}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Session: {sessionId}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, idx) => (
              <MetricCard key={metric.label} metric={metric} delay={idx * 50} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-400" />
                    Agent Activity Feed
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </div>
                </div>

                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-500" />
                      Initializing AI agents...
                    </div>
                  ) : (
                    activities.map((activity, idx) => (
                      <ActivityRow
                        key={activity.id}
                        activity={activity}
                        delay={idx * 50}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <InsightCard
                title="Market Opportunity"
                content="Identified 93 high-fit prospects in B2B SaaS vertical with active hiring signals and recent funding rounds."
                color="from-violet-500/20 to-purple-500/20"
              />
              <InsightCard
                title="Messaging Strategy"
                content="Value proposition centered on cost reduction and workflow automation resonates with target persona: VP of Operations."
                color="from-indigo-500/20 to-blue-500/20"
              />
              <InsightCard
                title="Revenue Forecast"
                content="Conservative 3% conversion on 28 outreach emails yields 2-3 qualified demos, est. $165K pipeline."
                color="from-cyan-500/20 to-teal-500/20"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ metric, delay }: { metric: Metric; delay: number }) {
  return (
    <div
      className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-400">{metric.label}</span>
        <div className="text-violet-400">{metric.icon}</div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">
        {metric.value}
      </div>
      {metric.trend && (
        <div className="text-xs text-emerald-400 mt-1">{metric.trend}</div>
      )}
    </div>
  );
}

function ActivityRow({ activity, delay }: { activity: AgentActivity; delay: number }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all animate-row-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-white flex-shrink-0`}>
        {activity.status === "complete" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : activity.status === "active" ? (
          <div className="relative">
            {activity.icon}
            <div className="absolute inset-0 animate-ping opacity-75">
              {activity.icon}
            </div>
          </div>
        ) : (
          activity.icon
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{activity.department}</span>
          {activity.status === "active" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              Active
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{activity.action}</p>
        <div className="text-xs text-zinc-600 mt-1">
          {activity.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  content,
  color
}: {
  title: string;
  content: string;
  color: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute -inset-px bg-gradient-to-br ${color} rounded-xl opacity-50 group-hover:opacity-75 transition-opacity blur`} />

      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

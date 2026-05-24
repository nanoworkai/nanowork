import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { fetchUserApps, type UserApp } from "../lib/apps";
import { ExternalLink, Code, Crown } from "lucide-react";

/**
 * DASHBOARD DESIGN PRINCIPLES:
 *
 * 1. DATA DENSITY: Show real information immediately - no empty states
 * 2. GRID SYSTEM: Precise 8px grid for alignment
 * 3. STATUS INDICATORS: Minimal dots and labels, no animations
 * 4. MONOCHROME: Only white/gray shades, no color
 * 5. CARD HIERARCHY: Subtle shadows and borders create depth
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface TaskEntry {
  dept: string;
  task: string;
  ts: number;
}

interface DeptState {
  icon: string;
  taskCount: number;
  tasks: string[];
  output: string;
  status: "queued" | "running" | "done";
}

interface BuildMeta {
  companyName: string;
  tagline: string;
}

const DEPT_ORDER = ["Legal", "Brand", "Web", "Marketing", "Sales", "Finance", "Ops"];

// ── SSE hook ──────────────────────────────────────────────────────────────────

function useAgentStream(prompt: string | null, enabled: boolean) {
  const [meta, setMeta] = useState<BuildMeta | null>(null);
  const [depts, setDepts] = useState<Record<string, DeptState>>({});
  const [feed, setFeed] = useState<TaskEntry[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const maxRetries = 3;

  const connect = (promptToUse: string) => {
    // Close existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnecting(true);
    setError(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
    const url = `${apiBase}/api/build/stream?prompt=${encodeURIComponent(promptToUse)}`;
    const es = new EventSource(url);
    esRef.current = es;

    const on = (type: string, handler: (d: unknown) => void) => {
      es.addEventListener(type, (e: MessageEvent) => {
        try { handler(JSON.parse(e.data)); } catch { /* ignore */ }
      });
    };

    es.onopen = () => {
      setConnecting(false);
      retryCountRef.current = 0; // Reset retry count on successful connection
    };

    on("meta", (d: unknown) => {
      const data = d as { company_name: string; tagline: string };
      setMeta({ companyName: data.company_name, tagline: data.tagline });
    });

    on("dept_start", (d: unknown) => {
      const data = d as { dept: string; icon: string; task_count: number };
      setDepts((prev) => ({
        ...prev,
        [data.dept]: { icon: data.icon, taskCount: data.task_count, tasks: [], output: "", status: "running" },
      }));
    });

    on("task", (d: unknown) => {
      const data = d as { dept: string; task: string };
      setDepts((prev) => ({
        ...prev,
        [data.dept]: prev[data.dept]
          ? { ...prev[data.dept], tasks: [...prev[data.dept].tasks, data.task] }
          : prev[data.dept],
      }));
      setFeed((prev) => [{ dept: data.dept, task: data.task, ts: Date.now() }, ...prev.slice(0, 29)]);
    });

    on("dept_done", (d: unknown) => {
      const data = d as { dept: string; output: string };
      setDepts((prev) => ({
        ...prev,
        [data.dept]: prev[data.dept]
          ? { ...prev[data.dept], output: data.output, status: "done" }
          : prev[data.dept],
      }));
    });

    on("done", () => {
      setDone(true);
      setConnecting(false);
      es.close();
    });

    es.onerror = () => {
      setConnecting(false);
      es.close();

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setError(`Connection lost — retrying (${retryCountRef.current}/${maxRetries})...`);

        // Auto-reconnect after 2 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect(promptToUse);
        }, 2000);
      } else {
        setError("Unable to connect to the server. Please check your connection and refresh.");
      }
    };
  };

  useEffect(() => {
    if (!enabled || !prompt) return;

    connect(prompt);

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [prompt, enabled]);

  const retry = () => {
    if (prompt) {
      retryCountRef.current = 0; // Reset retry count for manual retry
      connect(prompt);
    }
  };

  return { meta, depts, feed, done, error, connecting, retry };
}

// ── Department Card ───────────────────────────────────────────────────────────

function DeptCard({ name, state }: { name: string; state: DeptState | undefined }) {
  if (!state) {
    return (
      <div className="card rounded-xl p-5 opacity-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⋯</span>
            <span className="text-sm font-semibold text-white/60">{name}</span>
          </div>
          <span className="text-xs font-mono text-white/30">QUEUED</span>
        </div>
      </div>
    );
  }

  const { icon, tasks, output, status, taskCount } = state;
  const progress = tasks.length / Math.max(taskCount, 1);

  return (
    <div className={`card rounded-xl p-5 transition-all duration-150 ${
      status === "done" ? "bg-surface-3" : ""
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-white">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "running" && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          )}
          <span className={`text-xs font-mono ${
            status === "done" ? "text-white/60" : "text-white/40"
          }`}>
            {status === "done" ? "DONE" : `${tasks.length}/${taskCount}`}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5 mb-3">
        {tasks.slice(-3).map((task, i) => (
          <div key={i} className="text-xs text-white/50 leading-relaxed">
            {task}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {status === "running" && (
        <div className="h-px bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/30 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Output */}
      {output && status === "done" && (
        <div className="mt-3 pt-3 text-xs text-white/40 leading-relaxed" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {output}
        </div>
      )}
    </div>
  );
}

// ── Live Feed ─────────────────────────────────────────────────────────────────

function LiveFeed({ entries }: { entries: TaskEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [entries]);

  if (!entries.length) return null;

  return (
    <div className="card-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Live Output</span>
      </div>

      {/* Feed */}
      <div className="max-h-64 overflow-y-auto">
        {entries.slice().reverse().map((e, i) => (
          <div key={i} className="px-5 py-2.5 hover:bg-white/3 transition-colors" style={{ borderBottom: i < entries.length - 1 ? '1px solid rgba(255, 255, 255, 0.02)' : 'none' }}>
            <div className="flex items-start gap-3">
              <span className="text-xs text-white/30 font-mono w-20 flex-shrink-0">[{e.dept}]</span>
              <span className="text-xs text-white/60 leading-relaxed">{e.task}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Prompt Form ───────────────────────────────────────────────────────────────

function PromptForm({ onStart, loading }: { onStart: (p: string) => void; loading: boolean }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onStart(value.trim());
      setValue(""); // Clear input after submit
    }
  };

  return (
    <div className="card-lg rounded-2xl p-5 sm:p-8">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">What are you building?</h2>
      <p className="text-xs sm:text-sm text-white/50 mb-4 sm:mb-6">
        One prompt launches all seven departments in parallel.
      </p>
      <textarea
        className="w-full bg-surface-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-white/30 resize-none outline-none mb-4"
        style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
        rows={3}
        placeholder="Premium dog gear DTC, $45 AOV, ship US — I want real revenue in 30 days."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim()) handleSubmit(); }}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || loading}
        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-xs sm:text-sm transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          "Launch Build"
        )}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Overview() {
  const { profile, user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const promptFromUrl = searchParams.get("p");

  const [activePrompt, setActivePrompt] = useState<string | null>(
    promptFromUrl ?? profile?.businessPrompt ?? null
  );
  const [buildEnabled, setBuildEnabled] = useState(
    !!(promptFromUrl || profile?.businessPrompt)
  );
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  const { meta, depts, feed, done, error, connecting, retry } = useAgentStream(activePrompt, buildEnabled);

  // Load user's apps
  useEffect(() => {
    fetchUserApps()
      .then(setUserApps)
      .catch(err => console.error("Failed to load apps:", err))
      .finally(() => setAppsLoading(false));
  }, []);

  // Persist prompt to profile
  useEffect(() => {
    if (promptFromUrl && !profile?.businessPrompt) {
      updateProfile({ businessPrompt: promptFromUrl });
    }
  }, [promptFromUrl, profile?.businessPrompt, updateProfile]);

  // Save company name to profile
  useEffect(() => {
    if (meta?.companyName && !profile?.businessName) {
      updateProfile({ businessName: meta.companyName });
    }
  }, [meta?.companyName, profile?.businessName, updateProfile]);

  // Save build to database
  useEffect(() => {
    if (!done || !user || !activePrompt) return;
    supabase.from("linq_jobs").insert({
      user_id: user.id,
      prompt: activePrompt,
      status: "done",
      result: { company_name: meta?.companyName, tagline: meta?.tagline },
    }).then(() => {});
  }, [done, user, activePrompt, meta]);

  function handleStart(prompt: string) {
    setActivePrompt(prompt);
    setBuildEnabled(true);
    updateProfile({ businessPrompt: prompt });
  }

  const totalDone = Object.values(depts).filter((d) => d.status === "done").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {meta?.companyName ?? profile?.businessName ?? "Your Build"}
            </h1>
            {buildEnabled && (
              <div className="flex items-center gap-3 mt-2">
                {done ? (
                  <span className="text-xs sm:text-sm text-white/50 font-semibold">All departments live</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-xs sm:text-sm text-white/50 font-semibold">{totalDone} of 7 complete</span>
                  </div>
                )}
                {done && (
                  <button
                    onClick={() => { setBuildEnabled(false); setActivePrompt(null); }}
                    className="text-xs text-white/40 hover:text-white/60 underline transition-colors"
                  >
                    New build
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Credits Display */}
          <div className="card rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Credits</span>
                <span className="text-2xl font-bold text-white tabular-nums">{profile?.creditsBalance ?? 0}</span>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Builds</span>
                <span className="text-lg font-bold text-white/60 tabular-nums">
                  {profile?.totalCompaniesCreated ?? 0} / {profile?.monthlyCompanyLimit ?? 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {meta?.tagline && (
          <p className="text-sm text-white/40 italic">"{meta.tagline}"</p>
        )}

        {activePrompt && (
          <div className="mt-4 card rounded-xl px-4 py-3">
            <div className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Prompt</div>
            <div className="text-sm text-white/60">"{activePrompt}"</div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 card rounded-xl px-5 py-4" style={{ border: '1px solid rgba(255, 100, 100, 0.2)', background: 'rgba(255, 100, 100, 0.05)' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-white/80">{error}</div>
            {!error.includes("refresh") && (
              <button
                onClick={retry}
                disabled={connecting}
                className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {connecting ? "Connecting..." : "Try again"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Prompt entry */}
      {!buildEnabled && (
        <div className="mb-8">
          {/* Welcome message for new users */}
          {!profile?.businessPrompt && userApps.length === 0 && (
            <div className="mb-6 card rounded-2xl p-6 border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👋</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">Welcome to Nanowork</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">
                    Build a complete AI-powered business in minutes. Enter your idea below, and our 7 departments
                    (Legal, Brand, Web, Marketing, Sales, Finance, Ops) will work in parallel to launch your company.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-xs bg-surface-3 px-3 py-1.5 rounded-lg text-white/50 border border-white/5">
                      ✓ No coding required
                    </div>
                    <div className="text-xs bg-surface-3 px-3 py-1.5 rounded-lg text-white/50 border border-white/5">
                      ✓ Live in 30 days
                    </div>
                    <div className="text-xs bg-surface-3 px-3 py-1.5 rounded-lg text-white/50 border border-white/5">
                      ✓ Real revenue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <PromptForm onStart={handleStart} loading={connecting} />
        </div>
      )}

      {/* Department grid */}
      {buildEnabled && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
            {DEPT_ORDER.map((name) => (
              <DeptCard key={name} name={name} state={depts[name]} />
            ))}
          </div>

          {/* Live feed */}
          <div className="mb-8">
            <LiveFeed entries={feed} />
          </div>
        </>
      )}

      {/* User Apps */}
      {!appsLoading && userApps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Your Apps</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userApps.map((app) => (
              <div key={app.slug} className="card rounded-xl p-5 hover:bg-surface-3 transition-all duration-150">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {app.app_name || app.slug}
                    </h3>
                    {app.is_paid && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-semibold">Pro</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-white/40 font-mono">v{app.iterations}</span>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <a
                    href={`https://${app.slug}.nanowork.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                  {app.github_repo_url && (
                    <a
                      href={app.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-surface-3 hover:bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {app.deployed_at && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-white/30">
                      Deployed {new Date(app.deployed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

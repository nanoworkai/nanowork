import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !prompt) return;
    if (esRef.current) esRef.current.close();

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
    const url = `${apiBase}/api/build/stream?prompt=${encodeURIComponent(prompt)}`;
    const es = new EventSource(url);
    esRef.current = es;

    const on = (type: string, handler: (d: unknown) => void) => {
      es.addEventListener(type, (e: MessageEvent) => {
        try { handler(JSON.parse(e.data)); } catch { /* ignore */ }
      });
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
      es.close();
    });

    es.onerror = () => {
      setError("Connection lost — the build may still be running in the background.");
      es.close();
    };

    return () => es.close();
  }, [prompt, enabled]);

  return { meta, depts, feed, done, error };
}

// ── Department card ───────────────────────────────────────────────────────────

function DeptCard({ name, state }: { name: string; state: DeptState | undefined }) {
  if (!state) {
    return (
      <div className="p-4 rounded-xl bg-surface-2 border border-white/5 opacity-40">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⋯</span>
          <span className="text-sm font-semibold text-zinc-500">{name}</span>
        </div>
        <p className="text-xs text-zinc-600">Queued</p>
      </div>
    );
  }

  const { icon, tasks, output, status, taskCount } = state;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-500 ${
      status === "done"
        ? "bg-green-500/5 border-green-500/20"
        : status === "running"
        ? "bg-brand-600/5 border-brand-500/30"
        : "bg-surface-2 border-white/5"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-semibold text-white">{name}</span>
        </div>
        <span className={`text-xs font-mono font-semibold ${
          status === "done" ? "text-green-400" : "text-brand-400"
        }`}>
          {status === "done" ? "✓ Done" : status === "running" ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse inline-block" />
              {tasks.length}/{taskCount}
            </span>
          ) : "Queued"}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {DEPT_ORDER.slice(0, taskCount).map((_, i) => {
          const task = tasks[i];
          const isDone = !!task;
          return (
            <div key={i} className={`flex items-start gap-2 text-xs ${isDone ? "text-zinc-300" : "text-zinc-700"}`}>
              <span className={`mt-0.5 flex-shrink-0 ${isDone ? "text-green-400" : "text-zinc-700"}`}>
                {isDone ? "✓" : "◌"}
              </span>
              <span className={isDone ? "" : "italic"}>{task ?? "Pending…"}</span>
            </div>
          );
        })}
      </div>

      {output && (
        <p className="text-xs text-zinc-400 border-t border-white/5 pt-2 mt-2 leading-relaxed">
          {output}
        </p>
      )}

      {status === "running" && (
        <div className="mt-2 h-1 rounded-full bg-surface-4 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${(tasks.length / Math.max(taskCount, 1)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Live task feed ────────────────────────────────────────────────────────────

function LiveFeed({ entries }: { entries: TaskEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [entries]);

  if (!entries.length) return null;

  return (
    <div className="rounded-xl bg-surface-1 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live agent output</span>
      </div>
      <div className="max-h-56 overflow-y-auto p-2 flex flex-col gap-1 font-mono">
        {entries.slice().reverse().map((e, i) => (
          <div key={i} className="flex items-start gap-2 px-2 py-1 rounded-lg hover:bg-white/3 transition-colors">
            <span className="text-zinc-600 text-xs mt-0.5 flex-shrink-0 w-20 truncate">[{e.dept}]</span>
            <span className="text-xs text-zinc-300 leading-snug">{e.task}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Prompt form ───────────────────────────────────────────────────────────────

function PromptForm({ onStart, loading }: { onStart: (p: string) => void; loading: boolean }) {
  const [value, setValue] = useState("");

  return (
    <div className="p-6 rounded-2xl bg-surface-1 border border-white/10 animate-slide-up">
      <h2 className="text-lg font-semibold text-white mb-1">What are you building?</h2>
      <p className="text-sm text-zinc-500 mb-4">
        One prompt — all 7 agent departments launch in parallel.
      </p>
      <textarea
        className="w-full bg-surface-2 border border-white/10 focus:border-brand-500/50 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 text-sm leading-relaxed resize-none outline-none transition-colors mb-4"
        rows={3}
        placeholder="Premium dog gear DTC, $45 AOV, ship US — I want real revenue in 30 days."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim()) onStart(value.trim()); }}
        disabled={loading}
      />
      <button
        onClick={() => value.trim() && onStart(value.trim())}
        disabled={!value.trim() || loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Building…
          </>
        ) : (
          <>
            Launch all 7 agents
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
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

  const { meta, depts, feed, done, error } = useAgentStream(activePrompt, buildEnabled);

  // Persist prompt to profile
  useEffect(() => {
    if (promptFromUrl && !profile?.businessPrompt) {
      updateProfile({ businessPrompt: promptFromUrl });
    }
  }, [promptFromUrl, profile?.businessPrompt, updateProfile]);

  // Save company name to profile once we get it
  useEffect(() => {
    if (meta?.companyName && !profile?.businessName) {
      updateProfile({ businessName: meta.companyName });
    }
  }, [meta?.companyName, profile?.businessName, updateProfile]);

  // Also save build to Supabase builds table if user is authenticated
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
  const totalStarted = Object.values(depts).filter((d) => d.status !== undefined).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {meta?.companyName ?? profile?.businessName ?? "Your Build"}
            </h1>
            {meta?.tagline && (
              <p className="text-zinc-400 text-sm mt-0.5 italic">"{meta.tagline}"</p>
            )}
          </div>

          {buildEnabled && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {done ? (
                  <span className="text-green-400 font-semibold">✓ All 7 departments live</span>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    {totalDone} of 7 done · {totalStarted} running
                  </>
                )}
              </div>
              {done && (
                <button
                  onClick={() => { setBuildEnabled(false); setActivePrompt(null); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors"
                >
                  Start new build
                </button>
              )}
            </div>
          )}
        </div>

        {activePrompt && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-surface-2 border border-white/5 text-sm text-zinc-500 italic">
            "{activePrompt}"
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Prompt entry */}
      {!buildEnabled && (
        <div className="mb-8">
          <PromptForm onStart={handleStart} loading={false} />
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
          <div className="mb-6">
            <LiveFeed entries={feed} />
          </div>
        </>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: "/dashboard/domains", label: "Manage domains", icon: "🌐" },
          { to: "/dashboard/plan", label: "Upgrade plan", icon: "⚡" },
          { to: "/dashboard/settings", label: "Settings", icon: "⚙️" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-1 border border-white/5 hover:border-white/10 hover:bg-surface-2 transition-all text-sm text-zinc-400 hover:text-zinc-200"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

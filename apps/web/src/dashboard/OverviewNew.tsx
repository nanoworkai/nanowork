import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plus, MoreVertical, Trash2, Edit2 } from "lucide-react";

/**
 * Multi-build dashboard with sidebar (Claude/ChatGPT style)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface Build {
  id: string;
  name: string;
  prompt: string;
  status: string;
  last_activity_at: string;
  created_at: string;
}

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

function useAgentStream(buildId: string | null, prompt: string | null, enabled: boolean) {
  const [meta, setMeta] = useState<BuildMeta | null>(null);
  const [depts, setDepts] = useState<Record<string, DeptState>>({});
  const [feed, setFeed] = useState<TaskEntry[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !prompt || !buildId) return;
    if (esRef.current) esRef.current.close();

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
    const url = `${apiBase}/api/build/stream?buildId=${buildId}&prompt=${encodeURIComponent(prompt)}`;
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
      setError("Connection lost");
      es.close();
    };

    return () => es.close();
  }, [buildId, prompt, enabled]);

  return { meta, depts, feed, done, error };
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

      <div className="space-y-1.5 mb-3">
        {tasks.slice(-3).map((task, i) => (
          <div key={i} className="text-xs text-white/50 leading-relaxed">
            {task}
          </div>
        ))}
      </div>

      {status === "running" && (
        <div className="h-px bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/30 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {output && status === "done" && (
        <div className="mt-3 pt-3 text-xs text-white/40 leading-relaxed border-t border-white/5">
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
      <div className="px-5 py-3 flex items-center gap-2 border-b border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Live Output</span>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {entries.slice().reverse().map((e, i) => (
          <div key={i} className="px-5 py-2.5 hover:bg-white/3 transition-colors border-b border-white/2">
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus when form appears
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="card-lg rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-2 tracking-tight">What are you building?</h2>
      <p className="text-sm text-white/50 mb-6">
        One prompt launches all seven departments in parallel.
      </p>
      <textarea
        ref={textareaRef}
        className="w-full bg-surface-3 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none outline-none mb-4 border border-white/8"
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
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Building...
          </span>
        ) : (
          "Launch Build"
        )}
      </button>
    </div>
  );
}

// ── Builds Sidebar ────────────────────────────────────────────────────────────

interface BuildsSidebarProps {
  builds: Build[];
  activeBuildId: string | null;
  onSelectBuild: (id: string) => void;
  onNewBuild: () => void;
  onRenameBuild: (id: string, name: string) => void;
  onDeleteBuild: (id: string) => void;
}

function BuildsSidebar({
  builds,
  activeBuildId,
  onSelectBuild,
  onNewBuild,
  onRenameBuild,
  onDeleteBuild,
}: BuildsSidebarProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const startRename = (build: Build) => {
    setRenamingId(build.id);
    setRenameValue(build.name);
    setMenuOpenId(null);
  };

  const saveRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameBuild(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <div className="w-64 bg-surface-1 border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNewBuild}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-100 text-black font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Build
        </button>
      </div>

      {/* Builds List */}
      <div className="flex-1 overflow-y-auto p-2">
        {builds.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-white/40 mb-2">No builds yet</p>
            <p className="text-xs text-white/30">Start your first one</p>
          </div>
        ) : (
          <div className="space-y-1">
            {builds.map((build) => (
              <div
                key={build.id}
                className={`group relative rounded-lg transition-colors ${
                  activeBuildId === build.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                {renamingId === build.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      onBlur={saveRename}
                      autoFocus
                      className="w-full px-2 py-1 text-sm bg-surface-3 border border-white/20 rounded text-white outline-none"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => onSelectBuild(build.id)}
                    className="flex items-start gap-2 p-2 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {build.name}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {formatRelativeTime(build.last_activity_at)}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === build.id ? null : build.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === build.id && (
                        <div className="absolute right-2 top-8 w-40 bg-surface-2 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(build);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(build.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="w-full max-w-sm bg-surface-1 border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete build?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteBuild(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Overview() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { buildId } = useParams<{ buildId?: string }>();

  const [builds, setBuilds] = useState<Build[]>([]);
  const [activeBuild, setActiveBuild] = useState<Build | null>(null);
  const [buildEnabled, setBuildEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const { meta, depts, feed, done, error } = useAgentStream(
    activeBuild?.id || null,
    activeBuild?.prompt || null,
    buildEnabled
  );

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Load builds
  const loadBuilds = async () => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiUrl}/api/builds`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const { builds: loadedBuilds } = await res.json();
        setBuilds(loadedBuilds);

        // If no buildId in URL but we have builds, navigate to most recent
        if (!buildId && loadedBuilds.length > 0) {
          navigate(`/dashboard/builds/${loadedBuilds[0].id}`, { replace: true });
        } else if (buildId) {
          const build = loadedBuilds.find((b: Build) => b.id === buildId);
          if (build) {
            setActiveBuild(build);
            if (build.prompt && build.status === 'generating') {
              setBuildEnabled(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load builds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, [buildId, session]);

  // Create new build
  const handleNewBuild = async () => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiUrl}/api/builds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Build' }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setBuilds((prev) => [build, ...prev]);
        navigate(`/dashboard/builds/${build.id}`);
      }
    } catch (err) {
      console.error('Failed to create build:', err);
    }
  };

  // Start build with prompt
  const handleStartBuild = async (prompt: string) => {
    if (!activeBuild || !session?.access_token) return;

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

      // Update build with name and prompt
      await fetch(`${apiUrl}/api/builds/${activeBuild.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildName,
          last_activity_at: new Date().toISOString(),
        }),
      });

      // Update local state
      setActiveBuild((prev) => prev ? { ...prev, name: buildName, prompt } : null);
      setBuilds((prev) =>
        prev.map((b) => (b.id === activeBuild.id ? { ...b, name: buildName, prompt, last_activity_at: new Date().toISOString() } : b))
      );

      setBuildEnabled(true);
    } catch (err) {
      console.error('Failed to start build:', err);
    }
  };

  // Select build
  const handleSelectBuild = (id: string) => {
    navigate(`/dashboard/builds/${id}`);
  };

  // Rename build
  const handleRenameBuild = async (id: string, name: string) => {
    if (!session?.access_token) return;

    try {
      await fetch(`${apiUrl}/api/builds/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      setBuilds((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
      if (activeBuild?.id === id) {
        setActiveBuild((prev) => prev ? { ...prev, name } : null);
      }
    } catch (err) {
      console.error('Failed to rename build:', err);
    }
  };

  // Delete build
  const handleDeleteBuild = async (id: string) => {
    if (!session?.access_token) return;

    try {
      await fetch(`${apiUrl}/api/builds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const remainingBuilds = builds.filter((b) => b.id !== id);
      setBuilds(remainingBuilds);

      // Navigate to next build or create new one
      if (activeBuild?.id === id) {
        if (remainingBuilds.length > 0) {
          navigate(`/dashboard/builds/${remainingBuilds[0].id}`, { replace: true });
        } else {
          handleNewBuild();
        }
      }
    } catch (err) {
      console.error('Failed to delete build:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const totalDone = Object.values(depts).filter((d) => d.status === "done").length;

  return (
    <div className="flex h-screen bg-surface-0">
      {/* Sidebar */}
      <BuildsSidebar
        builds={builds}
        activeBuildId={activeBuild?.id || null}
        onSelectBuild={handleSelectBuild}
        onNewBuild={handleNewBuild}
        onRenameBuild={handleRenameBuild}
        onDeleteBuild={handleDeleteBuild}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeBuild ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {meta?.companyName || activeBuild.name}
                </h1>
                {buildEnabled && (
                  <div className="flex items-center gap-3 mt-2">
                    {done ? (
                      <span className="text-sm text-white/50 font-semibold">All departments live</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-sm text-white/50 font-semibold">{totalDone} of 7 complete</span>
                      </div>
                    )}
                  </div>
                )}

                {meta?.tagline && (
                  <p className="text-sm text-white/40 italic mt-2">"{meta.tagline}"</p>
                )}

                {activeBuild.prompt && (
                  <div className="mt-4 card rounded-xl px-4 py-3">
                    <div className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Prompt</div>
                    <div className="text-sm text-white/60">"{activeBuild.prompt}"</div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 card rounded-xl px-5 py-4 border border-red-500/20 bg-red-500/5">
                  <div className="text-sm text-white/80">{error}</div>
                </div>
              )}

              {/* Prompt entry */}
              {!buildEnabled && !activeBuild.prompt && (
                <div className="mb-8">
                  <PromptForm onStart={handleStartBuild} loading={false} />
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg text-white/60 mb-4">No build selected</p>
                <button
                  onClick={handleNewBuild}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-sm transition-colors"
                >
                  Create your first build
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

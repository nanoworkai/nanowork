import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/apiFetch";
import { Terminal, ChevronDown, Edit2, Trash2, FileText, Table, Presentation } from "lucide-react";

/**
 * Terminal-style dashboard matching homepage aesthetic
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
      <div className="card rounded-none border border-white/10 p-4 opacity-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⋯</span>
            <span className="text-sm font-mono font-bold text-white/60">{name}</span>
          </div>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Queued</span>
        </div>
      </div>
    );
  }

  const { icon, tasks, output, status, taskCount } = state;
  const progress = tasks.length / Math.max(taskCount, 1);

  return (
    <div
      className={`card rounded-none border transition-all duration-150 p-4 ${
        status === "done"
          ? "border-green-400/30 bg-surface-1"
          : status === "running"
          ? "border-white/20 bg-surface-1"
          : "border-white/10 bg-surface-1"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-mono font-bold text-white">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          {status === "done" && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              status === "done" ? "text-green-400" : status === "running" ? "text-white/60" : "text-white/40"
            }`}
          >
            {status === "done" ? "Done" : `${tasks.length}/${taskCount}`}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {tasks.slice(-3).map((task, i) => (
          <div key={i} className="text-xs font-mono text-white/50 leading-relaxed">
            {task}
          </div>
        ))}
      </div>

      {status === "running" && (
        <div className="h-px bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white/30 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {output && status === "done" && (
        <div className="mt-3 pt-3 text-xs font-mono text-white/40 leading-relaxed border-t border-white/10">
          {output}
        </div>
      )}
    </div>
  );
}

// ── Live Feed ─────────────────────────────────────────────────────────────────

function LiveFeed({ entries }: { entries: TaskEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  if (!entries.length) return null;

  return (
    <div className="card-lg rounded-none border border-white/10 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-2 border-b border-white/10 bg-surface-1">
        <Terminal className="w-3.5 h-3.5 text-white/60" />
        <span className="text-[10px] sm:text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
          Live Output
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-mono text-white/40 uppercase">Streaming</span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto bg-surface-2">
        {entries
          .slice()
          .reverse()
          .map((e, i) => (
            <div key={i} className="px-4 sm:px-6 py-2.5 hover:bg-white/3 transition-colors border-b border-white/5">
              <div className="flex items-start gap-3">
                <span className="text-[10px] sm:text-xs text-white/30 font-mono w-16 sm:w-20 flex-shrink-0 uppercase">
                  [{e.dept}]
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-white/60 leading-relaxed">{e.task}</span>
              </div>
            </div>
          ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Terminal Prompt ───────────────────────────────────────────────────────────

interface TerminalPromptProps {
  buildName: string;
  onStart: (p: string) => void;
  loading: boolean;
  status: "ready" | "building" | "complete" | "error";
  hasPrompt: boolean;
  onBuildMenuClick: () => void;
}

function TerminalPrompt({
  buildName,
  onStart,
  loading,
  status,
  hasPrompt,
  onBuildMenuClick,
}: TerminalPromptProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!hasPrompt) {
      textareaRef.current?.focus();
    }
  }, [hasPrompt]);

  const statusConfig = {
    ready: { dot: "bg-green-400", text: "READY", pulse: true },
    building: { dot: "bg-amber-400", text: "BUILDING", pulse: true },
    complete: { dot: "bg-green-400", text: "COMPLETE", pulse: false },
    error: { dot: "bg-red-400", text: "ERROR", pulse: false },
  };

  const { dot, text, pulse } = statusConfig[status];

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    onStart(text);
    setValue("");
  };

  return (
    <div className="card-lg rounded-none border border-white/10">
      {/* Header Bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-3 bg-surface-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
          <button
            onClick={onBuildMenuClick}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-white/60 uppercase tracking-wider hover:text-white transition-colors"
          >
            <span>&gt;_</span>
            <span>{buildName}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dot} ${pulse ? "animate-pulse" : ""}`} />
            <span className="text-[10px] sm:text-xs font-mono text-white/40">{text}</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6">
        <div className="relative mb-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-white/60 font-mono text-sm mt-1 select-none">$</span>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={loading}
                placeholder="Build a social network where creators own their content..."
                className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none outline-none resize-none text-white placeholder-white/30 font-mono text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-mono text-white/40 flex-wrap">
            <span>7 DEPARTMENTS</span>
            <span className="hidden sm:inline">|</span>
            <span>PARALLEL EXECUTION</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden md:inline">AUTONOMOUS AGENTS</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-none bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {loading ? "EXECUTING..." : "EXECUTE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Builds Dropdown Menu ──────────────────────────────────────────────────────

interface BuildsDropdownProps {
  builds: Build[];
  activeBuildId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBuild: (id: string) => void;
  onNewBuild: () => void;
  onRenameBuild: (id: string, name: string) => void;
  onDeleteBuild: (id: string) => void;
}

function BuildsDropdown({
  builds,
  activeBuildId,
  isOpen,
  onClose,
  onSelectBuild,
  onNewBuild,
  onRenameBuild,
  onDeleteBuild,
}: BuildsDropdownProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const startRename = (build: Build) => {
    setRenamingId(build.id);
    setRenameValue(build.name);
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
    <>
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-1 border border-white/10 rounded-none shadow-xl z-50"
      >
        {/* Builds List */}
        <div className="p-2">
          {builds.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs font-mono text-white/40 mb-2">No builds yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {builds.map((build) => (
                <div
                  key={build.id}
                  className={`group relative rounded-none transition-colors ${
                    activeBuildId === build.id ? "bg-white/10" : "hover:bg-white/5"
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
                        className="w-full px-2 py-1 text-xs font-mono bg-surface-3 border border-white/20 rounded-none text-white outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        onSelectBuild(build.id);
                        onClose();
                      }}
                      className="flex items-start gap-2 p-2 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-white font-medium truncate">
                          {build.name}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 mt-0.5">
                          {formatRelativeTime(build.last_activity_at)}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(build);
                          }}
                          className="p-1 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(build.id);
                          }}
                          className="p-1 rounded-none hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Build Button */}
        <div className="border-t border-white/10 p-2">
          <button
            onClick={() => {
              onNewBuild();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>+</span>
            <span>New Build</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-1 border border-white/10 rounded-none p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-mono font-bold text-white mb-2">Delete build?</h3>
            <p className="text-sm font-mono text-white/60 mb-6">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-none bg-surface-2 hover:bg-surface-3 border border-white/10 text-xs font-mono text-white/60 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteBuild(deleteConfirmId);
                  setDeleteConfirmId(null);
                  onClose();
                }}
                className="flex-1 py-2 rounded-none bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { meta, depts, feed, done, error } = useAgentStream(
    activeBuild?.id || null,
    activeBuild?.prompt || null,
    buildEnabled
  );

  // Load builds
  const loadBuilds = async () => {
    if (!session?.access_token) return;

    try {
      const res = await apiFetch('/api/builds');

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
      const res = await apiFetch('/api/builds', {
        method: 'POST',
        headers: {
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
      const nameRes = await apiFetch('/api/builds/generate-name', {
        method: 'POST',
        headers: {
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
      await apiFetch(`/api/builds/${activeBuild.id}`, {
        method: 'PATCH',
        headers: {
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
      await apiFetch(`/api/builds/${id}`, {
        method: 'PATCH',
        headers: {
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
      await apiFetch(`/api/builds/${id}`, {
        method: 'DELETE',
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
      <div className="flex h-screen items-center justify-center bg-surface-0">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING...</p>
        </div>
      </div>
    );
  }

  const totalDone = Object.values(depts).filter((d) => d.status === "done").length;

  // Determine terminal status
  let terminalStatus: "ready" | "building" | "complete" | "error" = "ready";
  if (error) terminalStatus = "error";
  else if (done) terminalStatus = "complete";
  else if (buildEnabled) terminalStatus = "building";

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Main Content - Full width, no sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeBuild ? (
          <>
            {/* Terminal Prompt - with dropdown */}
            <div className="mb-8 relative">
              <TerminalPrompt
                buildName={activeBuild.name}
                onStart={handleStartBuild}
                loading={buildEnabled && !done}
                status={terminalStatus}
                hasPrompt={!!activeBuild.prompt}
                onBuildMenuClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {/* Builds Dropdown */}
              <BuildsDropdown
                builds={builds}
                activeBuildId={activeBuild.id}
                isOpen={dropdownOpen}
                onClose={() => setDropdownOpen(false)}
                onSelectBuild={handleSelectBuild}
                onNewBuild={handleNewBuild}
                onRenameBuild={handleRenameBuild}
                onDeleteBuild={handleDeleteBuild}
              />
            </div>

            {/* Build metadata */}
            {buildEnabled && (
              <div className="mb-8">
                {meta?.companyName && meta.companyName !== activeBuild.name && (
                  <h2 className="text-xl sm:text-2xl font-mono font-bold text-white mb-2">
                    {meta.companyName}
                  </h2>
                )}
                {meta?.tagline && (
                  <p className="text-sm font-mono text-white/60 mb-3">"{meta.tagline}"</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {done ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs font-mono text-green-400 uppercase">All departments complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-mono text-white/60 uppercase">
                          {totalDone} of 7 departments complete
                        </span>
                      </div>
                    )}
                  </div>

                  {done && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/dashboard/builds/${activeBuild.id}/documents`)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        DOCUMENTS
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/builds/${activeBuild.id}/spreadsheet`)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Table className="w-4 h-4" />
                        SPREADSHEETS
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/builds/${activeBuild.id}/pitch-deck`)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Presentation className="w-4 h-4" />
                        PITCH DECK
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/builder/${activeBuild.id}`)}
                        className="px-4 py-2 bg-white hover:bg-white/90 text-black font-mono text-xs rounded-lg flex items-center gap-2 transition-colors font-bold"
                      >
                        VIEW FULL RESULTS
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-8 border border-red-500/30 bg-red-500/5 rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs font-mono text-red-400 uppercase">Error</span>
                </div>
                <p className="text-sm font-mono text-white/80">{error}</p>
              </div>
            )}

            {/* Department grid */}
            {buildEnabled && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {DEPT_ORDER.map((name) => (
                    <DeptCard key={name} name={name} state={depts[name]} />
                  ))}
                </div>

                {/* Live feed */}
                <LiveFeed entries={feed} />
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-sm font-mono text-white/60 mb-4">No build selected</p>
              <button
                onClick={handleNewBuild}
                className="px-6 py-3 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Create your first build
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

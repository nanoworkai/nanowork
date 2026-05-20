import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, ChevronDown, Edit2, Trash2 } from "lucide-react";

/**
 * Light redesign dashboard with soft colors and rounded corners
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

    const apiBase = import.meta.env.VITE_API_URL || '';
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

    es.onerror = (err) => {
      console.error('SSE connection error:', err);
      setError("Connection lost. The build may still be processing in the background.");
      es.close();
    };

    return () => {
      if (es.readyState !== EventSource.CLOSED) {
        es.close();
      }
    };
  }, [buildId, prompt, enabled]);

  return { meta, depts, feed, done, error };
}

// ── Department Card ───────────────────────────────────────────────────────────

function DeptCard({ name, state }: { name: string; state: DeptState | undefined }) {
  if (!state) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 opacity-40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⋯</span>
            <span className="text-sm font-semibold text-gray-600">{name}</span>
          </div>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">Queued</span>
        </div>
      </div>
    );
  }

  const { icon, tasks, output, status, taskCount } = state;
  const progress = tasks.length / Math.max(taskCount, 1);

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-150 p-4 shadow-sm ${
        status === "done"
          ? "border-accent-success/30 bg-accent-success/5"
          : status === "running"
          ? "border-accent-primary/30 bg-accent-primary/5"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-gray-900">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "running" && (
            <span className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded-full">
              {tasks.length}/{taskCount}
            </span>
          )}
          {status === "done" && (
            <span className="px-2 py-1 text-xs bg-accent-success/10 text-accent-success rounded-full">
              Done
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {tasks.slice(-3).map((task, i) => (
          <div key={i} className="text-xs text-gray-600 leading-relaxed">
            {task}
          </div>
        ))}
      </div>

      {status === "running" && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {output && status === "done" && (
        <div className="mt-3 pt-3 text-xs text-gray-500 leading-relaxed border-t border-gray-200">
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-2 border-b border-gray-200 bg-gray-50">
        <Terminal className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
          Live Output
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
          <span className="text-[10px] text-gray-500">Streaming</span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto bg-white">
        {entries
          .slice()
          .reverse()
          .map((e, i) => (
            <div key={i} className="px-4 sm:px-6 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
              <div className="flex items-start gap-3">
                <span className="text-[10px] sm:text-xs text-gray-500 w-16 sm:w-20 flex-shrink-0">
                  [{e.dept}]
                </span>
                <span className="text-[10px] sm:text-xs text-gray-700 leading-relaxed">{e.task}</span>
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
    ready: { dot: "bg-accent-success", text: "Ready", pulse: true },
    building: { dot: "bg-accent-primary", text: "Building", pulse: true },
    complete: { dot: "bg-accent-success", text: "Complete", pulse: false },
    error: { dot: "bg-accent-error", text: "Error", pulse: false },
  };

  const { dot, text, pulse } = statusConfig[status];

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    onStart(text);
    setValue("");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header Bar */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          <button
            onClick={onBuildMenuClick}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>&gt;_</span>
            <span>{buildName}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dot} ${pulse ? "animate-pulse" : ""}`} />
            <span className="text-[10px] sm:text-xs text-gray-600">{text}</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6">
        <div className="relative mb-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-gray-600 text-sm mt-1 select-none">$</span>
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
                className="w-full min-h-[80px] max-h-[200px] bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-400 text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 sm:gap-6 text-[10px] sm:text-xs text-gray-500 flex-wrap">
            <span>7 departments</span>
            <span className="hidden sm:inline">|</span>
            <span>Parallel execution</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden md:inline">Autonomous agents</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-md bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
          >
            {loading ? "Executing..." : "Execute"}
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
        className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50"
      >
        {/* Builds List */}
        <div className="p-2">
          {builds.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">No builds yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {builds.map((build) => (
                <div
                  key={build.id}
                  className={`group relative rounded-lg transition-colors ${
                    activeBuildId === build.id ? "bg-gray-100" : "hover:bg-gray-50"
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
                        className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded-md text-gray-900 outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
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
                        <p className="text-xs text-gray-900 font-medium truncate">
                          {build.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {formatRelativeTime(build.last_activity_at)}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(build);
                          }}
                          className="p-1 rounded-md hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(build.id);
                          }}
                          className="p-1 rounded-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
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
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => {
              onNewBuild();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold transition-colors"
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
            className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete build?</h3>
            <p className="text-sm text-gray-600 mb-6">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-md bg-background-subtle hover:bg-gray-100 border border-gray-200 text-xs text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteBuild(deleteConfirmId);
                  setDeleteConfirmId(null);
                  onClose();
                }}
                className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
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
      <div className="flex items-center justify-center min-h-[60vh] bg-background-subtle">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-accent-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading your builds...</p>
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
    <div className="min-h-screen bg-background-subtle">
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {meta.companyName}
                  </h2>
                )}
                {meta?.tagline && (
                  <p className="text-sm text-gray-600 mb-3 italic">"{meta.tagline}"</p>
                )}

                <div className="flex items-center gap-3">
                  {done ? (
                    <span className="px-2 py-1 text-xs bg-accent-success/10 text-accent-success rounded-full font-semibold">
                      All departments complete
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded-full font-semibold">
                      {totalDone} of 7 departments complete
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-8 border border-red-200 bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-600 font-semibold">Error</span>
                </div>
                <p className="text-sm text-red-800">{error}</p>
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
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Terminal className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Nanowork</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Get started by creating your first build. Our AI agents will work across 7 departments to bring your vision to life.
              </p>
              <button
                onClick={handleNewBuild}
                className="px-6 py-3 rounded-md bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Create your first build
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Free plan includes 1 business build with full agent access
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

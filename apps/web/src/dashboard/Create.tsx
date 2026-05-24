import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, Sparkles, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Build {
  id: string;
  name: string;
  prompt: string;
  status: string;
  last_activity_at: string;
  created_at: string;
}

export default function Create() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Load builds
  useEffect(() => {
    loadBuilds();
  }, [session]);

  const loadBuilds = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/builds`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const { builds: loadedBuilds } = await res.json();
        setBuilds(loadedBuilds);
      }
    } catch (err) {
      console.error('Failed to load builds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !session?.access_token) return;

    setCreating(true);

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

      // Create the build
      const res = await fetch(`${apiUrl}/api/builds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildName,
          prompt: prompt.trim(),
        }),
      });

      if (res.ok) {
        const { build } = await res.json();
        setBuilds((prev) => [build, ...prev]);
        setPrompt('');

        // Navigate to the build detail page
        navigate(`/dashboard/builds/${build.id}`);
      }
    } catch (err) {
      console.error('Failed to create build:', err);
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row max-w-[1800px] mx-auto px-6 py-6 gap-6">
      {/* Left Side - Create Prompt */}
      <div className="lg:w-[60%] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Terminal className="w-8 h-8" />
            Create New Build
          </h1>
          <p className="text-white/60 text-sm">
            Describe what you want to build and let AI generate it for you
          </p>
        </div>

        {/* Prompt Input */}
        <form onSubmit={handleCreateBuild} className="flex-1 flex flex-col">
          <div className="flex-1 rounded-xl border border-white/10 bg-surface-2 p-6 flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your project in detail...&#10;&#10;Example: Build a booking system for my dog grooming business. I need customers to be able to book appointments, see available time slots, and receive confirmation emails. Include a dashboard where I can manage appointments and customer information."
              className="flex-1 w-full bg-transparent text-white placeholder-white/30 text-base leading-relaxed outline-none resize-none"
              disabled={creating}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!prompt.trim() || creating}
              className="flex items-center gap-2 px-8 py-4 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-white/20 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all disabled:text-white/40"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Build...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Build
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Build History */}
      <div className="lg:w-[40%] flex flex-col rounded-xl border border-white/10 bg-surface-2 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Build History
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {builds.length} {builds.length === 1 ? 'build' : 'builds'}
          </p>
        </div>

        {/* Build List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/60">Loading builds...</p>
              </div>
            </div>
          ) : builds.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6">
                <Terminal className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-base text-white/60 mb-2">No builds yet</p>
                <p className="text-sm text-white/40">
                  Create your first build using the prompt on the left
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {builds.map((build) => (
                <button
                  key={build.id}
                  onClick={() => navigate(`/dashboard/builds/${build.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-white/90 truncate flex-1">
                      {build.name}
                    </h3>
                    {getStatusIcon(build.status)}
                  </div>

                  {build.prompt && (
                    <p className="text-xs text-white/50 line-clamp-2 mb-3 leading-relaxed">
                      {build.prompt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {formatDate(build.last_activity_at || build.created_at)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      build.status === 'generating'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : build.status === 'completed'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : build.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {build.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

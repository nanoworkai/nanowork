import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Clock, CheckCircle2, AlertCircle, Loader2, History as HistoryIcon } from "lucide-react";

interface Build {
  id: string;
  name: string;
  prompt: string;
  status: string;
  last_activity_at: string;
  created_at: string;
}

export default function History() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-white/40" />;
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
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8" />
          Build History
        </h1>
        <p className="text-white/60 text-sm">
          View and manage all your builds
        </p>
      </div>

      {/* Build Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white/40 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading builds...</p>
          </div>
        </div>
      ) : builds.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="max-w-md text-center">
            {/* Empty State Illustration */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <HistoryIcon className="w-12 h-12 text-white/40" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white/60" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-white mb-3">
              Your Build History Will Appear Here
            </h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Once you create your first build, you'll be able to track its progress,
              access deployment details, and manage all your applications from this dashboard.
            </p>

            {/* Action Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-base transition-all shadow-lg hover:shadow-xl group"
            >
              <CheckCircle2 className="w-5 h-5" />
              Create Your First Build
              <Clock className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* What to Expect */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-sm font-semibold text-white/80 mb-4">
                What you'll see here:
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">Build status & progress</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">Deployment details</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">Activity timeline</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">Quick actions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {builds.map((build) => (
            <button
              key={build.id}
              onClick={() => navigate(`/dashboard/builds/${build.id}`)}
              className="text-left p-6 rounded-xl border border-white/10 bg-surface-2 hover:bg-surface-3 hover:border-white/20 transition-all group"
            >
              {/* Status Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(build.status)}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  build.status === 'generating'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : build.status === 'completed'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : build.status === 'failed'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-white/10 text-white/60 border border-white/10'
                }`}>
                  {build.status}
                </span>
              </div>

              {/* Build Name */}
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white/90 line-clamp-2">
                {build.name}
              </h3>

              {/* Prompt Preview */}
              {build.prompt && (
                <p className="text-sm text-white/50 line-clamp-3 mb-4 leading-relaxed">
                  {build.prompt}
                </p>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(build.last_activity_at || build.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

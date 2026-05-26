import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plus } from "lucide-react";

interface Build {
  id: string;
  company_name: string;
  tagline?: string;
  created_at: string;
  status: string;
}

export default function SimpleOverview() {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuilds();
  }, [session]);

  const loadBuilds = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/builds`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds || []);
      }
    } catch (err) {
      console.error('Failed to load builds:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Welcome */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
        </h1>
      </div>

      {/* Create New Build CTA */}
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full bg-white text-black font-bold py-6 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 mb-12"
      >
        <Plus className="w-6 h-6" />
        CREATE NEW BUILD
      </button>

      {/* Your Builds */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">YOUR BUILDS</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : builds.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
            <p className="text-zinc-400">No builds yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {builds.map((build) => (
              <button
                key={build.id}
                onClick={() => navigate(`/dashboard/builds/${build.id}`)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-white/20 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {build.company_name}
                    </h3>
                    {build.tagline && (
                      <p className="text-sm text-zinc-400">{build.tagline}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(build.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

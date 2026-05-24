import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Code } from "lucide-react";
import { fetchAppBySlug, type UserApp } from "../lib/apps";

interface BuildData {
  id: string;
  company_name: string;
  tagline: string;
  status: string;
  build_data: {
    company_name: string;
    tagline: string;
    departments: Record<string, { tasks: string[]; first_output: string }>;
  };
}

export default function BuildView() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [build, setBuild] = useState<BuildData | null>(null);
  const [app, setApp] = useState<UserApp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuild();
  }, [buildId]);

  async function loadBuild() {
    try {
      // Try loading from nano_app_schemas first
      if (buildId) {
        const appData = await fetchAppBySlug(buildId);
        if (appData) {
          setApp(appData);
          setLoading(false);
          return;
        }
      }

      // Fallback to legacy API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/build/${buildId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Build not found");

      const data = await response.json();
      setBuild(data);
    } catch (err) {
      console.error("Failed to load build:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING BUILD...</p>
        </div>
      </div>
    );
  }

  if (!build && !app) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-mono text-white/60 mb-4">Build not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs font-mono text-white/60 hover:text-white"
        >
          ← BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  // If we have app data from nano_app_schemas, render that
  if (app) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-3"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO OVERVIEW
            </button>

            <h1 className="text-3xl font-mono font-bold">{app.app_name || app.slug}</h1>
            <p className="text-sm font-mono text-white/60 mt-1">Version {app.iterations}</p>
          </div>

          <div className="flex items-center gap-3">
            {app.github_repo_url && (
              <a
                href={app.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-white/10 bg-surface-1 hover:bg-surface-2 text-white font-mono text-xs rounded-none flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                VIEW CODE
              </a>
            )}

            <a
              href={`https://${app.slug}.nanowork.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-black hover:bg-white/90 font-mono text-xs font-bold rounded-none flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              LAUNCH SITE
            </a>
          </div>
        </div>

        {/* App Details */}
        <div className="grid gap-6">
          <div className="border border-white/10 bg-surface-1 rounded-xl p-6">
            <h3 className="font-mono font-bold text-white mb-4">App Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Slug</span>
                <span className="text-white font-mono">{app.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Status</span>
                <span className="text-white">{app.deployed_at ? 'Deployed' : 'In Progress'}</span>
              </div>
              {app.deployed_at && (
                <div className="flex justify-between">
                  <span className="text-white/40">Deployed</span>
                  <span className="text-white">{new Date(app.deployed_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Plan</span>
                <span className="text-white">{app.is_paid ? 'Pro' : 'Free'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Legacy build rendering
  const depts = build!.build_data?.departments || {};

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            BACK TO OVERVIEW
          </button>

          <h1 className="text-3xl font-mono font-bold">{build!.company_name}</h1>
          <p className="text-sm font-mono text-white/60 mt-1">{build!.tagline}</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-white/10 bg-surface-1 hover:bg-surface-2 text-white font-mono text-xs rounded-none flex items-center gap-2">
            <Download className="w-4 h-4" />
            EXPORT
          </button>

          <button className="px-4 py-2 bg-white text-black hover:bg-white/90 font-mono text-xs font-bold rounded-none flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            LAUNCH SITE
          </button>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(depts).map(([deptName, dept]) => (
          <div
            key={deptName}
            className="border border-white/10 bg-surface-1 rounded-none p-6 hover:border-white/20 transition-colors"
          >
            <h3 className="font-mono font-bold text-white mb-3">{deptName}</h3>

            <div className="mb-4 p-3 bg-surface-2 rounded-none">
              <p className="text-xs font-mono text-white/80 leading-relaxed">
                {dept.first_output}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-white/40 uppercase mb-2">Tasks Completed</div>
              {dept.tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span className="text-xs font-mono text-white/80">{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

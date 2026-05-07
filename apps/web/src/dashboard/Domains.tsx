import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

const PLATFORM_HOST = "nanowork.app";

function normalizeSubdomain(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/, "").slice(0, 40);
}

export default function Domains() {
  const { profile, updateProfile } = useAuth();
  const [subdomain, setSubdomain] = useState(profile?.subdomain ?? "");
  const [subSaved, setSubSaved] = useState(false);
  const [subError, setSubError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fullUrl = `https://${subdomain || "your-app"}.${PLATFORM_HOST}`;

  const handleSubdomainSave = async (e: FormEvent) => {
    e.preventDefault();
    const next = normalizeSubdomain(subdomain);
    if (next.length < 2) { setSubError("At least 2 characters required."); return; }
    setSubError("");
    await updateProfile({ subdomain: next });
    setSubDomain(next);
    setSubSaved(true);
    setTimeout(() => setSubSaved(false), 2500);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    await updateProfile({ customDomain: newDomain.trim() });
    setNewDomain("");
    setShowAdd(false);
  };

  function setSubDomain(v: string) { setSubdomain(v); }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Domains</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform subdomain and custom domains for your business.</p>
      </div>

      {/* Subdomain */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 mb-4">
        <h2 className="text-base font-semibold text-white mb-1">Platform subdomain</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Your business is served at <span className="font-mono text-zinc-400">*.{PLATFORM_HOST}</span>
        </p>
        <form onSubmit={handleSubdomainSave} className="flex flex-col gap-3">
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-2 border border-white/10 focus-within:border-brand-500/60 transition-colors">
            <span className="text-xs text-zinc-600">https://</span>
            <input
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 outline-none min-w-0"
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(normalizeSubdomain(e.target.value))}
              placeholder="your-app"
            />
            <span className="text-xs text-zinc-600 whitespace-nowrap">.{PLATFORM_HOST}</span>
          </div>
          {subError && <p className="text-xs text-red-400">{subError}</p>}
          <p className="text-xs text-zinc-600">
            Live URL: <a href={fullUrl} className="text-brand-400 hover:text-brand-300 transition-colors" target="_blank" rel="noreferrer">{fullUrl}</a>
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                subSaved ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-brand-600 hover:bg-brand-500 text-white"
              }`}
            >
              {subSaved ? "✓ Saved" : "Save subdomain"}
            </button>
          </div>
        </form>
      </div>

      {/* Custom domain */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Custom domain</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Connect your own domain.</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
          >
            {showAdd ? "Cancel" : "+ Add domain"}
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 p-4 rounded-xl bg-surface-2 border border-white/5">
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-surface-3 border border-white/10 focus:border-brand-500/60 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
                type="text"
                placeholder="yourbrand.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                autoFocus
              />
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.trim()}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            {newDomain && (
              <div className="text-xs text-zinc-500 space-y-1">
                <p className="font-medium text-zinc-400">DNS configuration</p>
                <p>Add a CNAME record:</p>
                <p className="font-mono text-zinc-300 bg-surface-3 px-2 py-1 rounded">
                  {newDomain} → nanowork.app
                </p>
              </div>
            )}
          </div>
        )}

        {profile?.customDomain ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-white/5">
            <div>
              <p className="text-sm text-zinc-200 font-medium">{profile.customDomain}</p>
              <p className="text-xs text-zinc-600 mt-0.5">Custom domain</p>
            </div>
            <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-600 text-sm">
            No custom domain connected yet.
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Check, Copy, ExternalLink, AlertCircle, Globe } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://${subdomain || "your-app"}.${PLATFORM_HOST}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-2 border border-white/10 focus-within:border-white/20/60 transition-colors">
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
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              <span>{fullUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                subSaved ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-white hover:bg-white text-white"
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
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-white text-white text-xs font-semibold transition-colors"
          >
            {showAdd ? "Cancel" : "+ Add domain"}
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 p-5 rounded-xl bg-surface-2 border border-white/5">
            <label className="block text-xs font-medium text-zinc-400 mb-2">Domain name</label>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-surface-3 border border-white/10 focus:border-white/20 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors"
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
                className="px-4 py-2 rounded-lg bg-white hover:bg-white/90 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
              >
                Add domain
              </button>
            </div>
            {newDomain && (
              <div className="rounded-lg bg-surface-3 border border-white/5 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-400 mb-1">DNS Configuration Required</p>
                    <p className="text-xs text-zinc-500">Add this CNAME record at your DNS provider:</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 rounded bg-surface-0/50 border border-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 mb-0.5">Type</p>
                      <p className="text-sm font-mono text-zinc-200">CNAME</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 mb-0.5">Name</p>
                      <p className="text-sm font-mono text-zinc-200 truncate">{newDomain}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 mb-0.5">Value</p>
                      <p className="text-sm font-mono text-zinc-200">nanowork.app</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${newDomain} CNAME nanowork.app`)}
                      className="p-2 hover:bg-white/5 rounded transition-colors"
                      title="Copy DNS record"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {profile?.customDomain ? (
          <div className="rounded-xl bg-surface-2 border border-white/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-zinc-200 font-medium">{profile.customDomain}</p>
                  <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">Your custom domain is connected and live</p>
                <a
                  href={`https://${profile.customDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mt-2"
                >
                  <span>Visit site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this custom domain?")) {
                    updateProfile({ customDomain: undefined });
                  }
                }}
                className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                title="Remove domain"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-600">
            <Globe className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No custom domain connected yet.</p>
            <p className="text-xs text-zinc-700 mt-1">Click "Add domain" above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

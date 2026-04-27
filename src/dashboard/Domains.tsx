import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PLATFORM_HOST = "nanowork.app";

function normalizeSubdomain(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function Domains() {
  const { agent, updateAgent } = useAuth();
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState(() => agent?.subdomain || "");
  const [subdomainSaved, setSubdomainSaved] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    if (agent?.subdomain) setSubdomainInput(agent.subdomain);
  }, [agent?.subdomain]);

  if (!agent) return null;

  const fullSubUrl = `https://${subdomainInput || "your-app"}.${PLATFORM_HOST}`;

  const saveSubdomain = (e: FormEvent) => {
    e.preventDefault();
    setSubError(null);
    const next = normalizeSubdomain(subdomainInput);
    if (next.length < 2) {
      setSubError("Use at least 2 characters (letters, numbers, hyphens).");
      return;
    }
    updateAgent({ subdomain: next });
    setSubdomainInput(next);
    setSubdomainSaved(true);
    setTimeout(() => setSubdomainSaved(false), 2000);
  };

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 800));
    updateAgent({
      domains: [
        ...agent.domains,
        { domain: newDomain.trim(), status: "pending", addedAt: new Date().toISOString() },
      ],
    });
    setNewDomain("");
    setAdding(false);
    setShowAdd(false);
  };

  const handleRemove = (domain: string) => {
    if (!confirm(`Remove ${domain}?`)) return;
    updateAgent({
      domains: agent.domains.filter((d) => d.domain !== domain),
    });
  };

  const handleSetPrimary = (domain: string) => {
    updateAgent({ domain });
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Domains</h1>
          <p className="dash-page__subtitle">Subdomain and custom domains for your app</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ Add domain"}
        </button>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Platform subdomain</h2>
          <p className="dash-section__desc">
            Your app is served at <span className="mono">{`*.${PLATFORM_HOST}`}</span>. Choose
            a unique slug. Custom domains below can be primary for branding.
          </p>
        </div>
        <form className="dash-settings-form dash-settings-form--stack" onSubmit={saveSubdomain}>
          <div className="dash-subdomain-field">
            <span className="dash-subdomain-field__https">https://</span>
            <input
              className="dash-input dash-subdomain-field__input"
              type="text"
              name="subdomain"
              autoComplete="off"
              value={subdomainInput}
              onChange={(e) => setSubdomainInput(normalizeSubdomain(e.target.value))}
              placeholder="your-app"
              aria-invalid={!!subError}
            />
            <span className="dash-subdomain-field__host mono">.{PLATFORM_HOST}</span>
          </div>
          {subError && <p className="login-error" role="alert">{subError}</p>}
          <p className="dash-section__desc dash-subdomain-hint">
            Live URL: <a href={fullSubUrl} className="dash-link" target="_blank" rel="noreferrer">{fullSubUrl}</a>
          </p>
          <div className="dash-inline-form">
            <button className="btn btn--primary btn--sm" type="submit">
              {subdomainSaved ? "Saved!" : "Save subdomain"}
            </button>
            <Link to="/dashboard/plan" className="btn btn--ghost btn--sm">
              Increase limits &amp; plan
            </Link>
          </div>
        </form>
      </div>

      {showAdd && (
        <div className="dash-add-card">
          <h3 className="dash-add-card__title">Add a new domain</h3>
          <p className="dash-add-card__desc">
            Enter the domain you want to connect. We'll verify ownership via DNS.
          </p>
          <div className="dash-inline-form">
            <input
              className="dash-input dash-input--full"
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <button className="btn btn--primary btn--sm" onClick={handleAdd} disabled={adding || !newDomain.trim()}>
              {adding ? "Adding…" : "Add domain"}
            </button>
          </div>
          <div className="dash-dns-hint">
            <span className="dash-dns-hint__title">DNS Configuration</span>
            <div className="dash-dns-hint__row">
              <span className="mono">CNAME</span>
              <span className="mono">cname.nanowork.ai</span>
            </div>
            <div className="dash-dns-hint__row">
              <span className="mono">TXT</span>
              <span className="mono">nanowork-verify={agent.id}</span>
            </div>
          </div>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Status</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {agent.domains.map((d) => (
              <tr key={d.domain}>
                <td>
                  <div className="dash-domain-cell">
                    <span className="dash-domain-name">{d.domain}</span>
                    {d.domain === agent.domain && (
                      <span className="dash-domain-primary">Primary</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`dash-status dash-status--${d.status}`}>
                    <span className="dash-status__dot" />
                    {d.status}
                  </span>
                </td>
                <td className="dash-table__muted">
                  {new Date(d.addedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <div className="dash-table__actions">
                    {d.domain !== agent.domain && d.status === "active" && (
                      <button
                        className="dash-table__action"
                        onClick={() => handleSetPrimary(d.domain)}
                        title="Set as primary"
                      >
                        Set primary
                      </button>
                    )}
                    <button
                      className="dash-table__action dash-table__action--danger"
                      onClick={() => handleRemove(d.domain)}
                      title="Remove domain"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {agent.domains.length === 0 && (
        <div className="dash-empty">
          <p>No domains connected yet.</p>
          <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
            Add your first domain
          </button>
        </div>
      )}
    </div>
  );
}

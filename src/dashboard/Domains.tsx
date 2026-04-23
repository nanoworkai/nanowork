import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Domains() {
  const { agent, updateAgent } = useAuth();
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  if (!agent) return null;

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
          <p className="dash-page__subtitle">Manage domains connected to your agent</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ Add domain"}
        </button>
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

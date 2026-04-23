import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { agent, updateAgent, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(agent?.email || "");
  const [emailSaved, setEmailSaved] = useState(false);
  const [agentName, setAgentName] = useState(agent?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!agent) return null;

  const handleEmailSave = (e: FormEvent) => {
    e.preventDefault();
    updateAgent({ email });
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
  };

  const handleNameSave = (e: FormEvent) => {
    e.preventDefault();
    updateAgent({ name: agentName });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== agent.id) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 1500));
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Settings</h1>
          <p className="dash-page__subtitle">Manage your agent and account</p>
        </div>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Agent name</h2>
          <p className="dash-section__desc">The display name for your AI agent.</p>
        </div>
        <form className="dash-settings-form" onSubmit={handleNameSave}>
          <input
            className="dash-input"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="My AI Agent"
          />
          <button className="btn btn--primary btn--sm" type="submit">
            {nameSaved ? "Saved!" : "Save"}
          </button>
        </form>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Email address</h2>
          <p className="dash-section__desc">
            The email associated with your agent. Used for notifications and billing receipts.
          </p>
        </div>
        <form className="dash-settings-form" onSubmit={handleEmailSave}>
          <input
            className="dash-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button className="btn btn--primary btn--sm" type="submit">
            {emailSaved ? "Saved!" : "Update email"}
          </button>
        </form>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Agent ID</h2>
          <p className="dash-section__desc">Your unique agent identifier. Use this in API calls.</p>
        </div>
        <div className="dash-settings-form">
          <div className="dash-copyable">
            <span className="mono">{agent.id}</span>
            <button
              className="dash-copyable__btn"
              onClick={() => navigator.clipboard?.writeText(agent.id)}
              title="Copy to clipboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Phone number</h2>
          <p className="dash-section__desc">The phone number connected to your account.</p>
        </div>
        <div className="dash-settings-form">
          <span className="dash-settings-value">{agent.phone}</span>
        </div>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Agent status</h2>
          <p className="dash-section__desc">Pause or resume your agent.</p>
        </div>
        <div className="dash-settings-form">
          <div className="dash-toggle-row">
            <span className={`dash-status dash-status--${agent.status}`}>
              <span className="dash-status__dot" />
              {agent.status}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() =>
                updateAgent({ status: agent.status === "active" ? "paused" : "active" })
              }
            >
              {agent.status === "active" ? "Pause agent" : "Resume agent"}
            </button>
          </div>
        </div>
      </div>

      <div className="dash-settings-section dash-settings-section--danger">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title dash-section__title--danger">Delete account</h2>
          <p className="dash-section__desc">
            Permanently delete your agent and all associated data. This action cannot be undone.
          </p>
        </div>
        {!showDelete ? (
          <button
            className="btn btn--danger btn--sm"
            onClick={() => setShowDelete(true)}
          >
            Delete account
          </button>
        ) : (
          <div className="dash-delete-confirm">
            <p className="dash-delete-confirm__msg">
              Type <strong className="mono">{agent.id}</strong> to confirm deletion:
            </p>
            <div className="dash-inline-form">
              <input
                className="dash-input dash-input--danger"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={agent.id}
                autoFocus
              />
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDelete}
                disabled={deleteConfirm !== agent.id || deleting}
              >
                {deleting ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
            <button
              className="dash-delete-confirm__cancel"
              onClick={() => {
                setShowDelete(false);
                setDeleteConfirm("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

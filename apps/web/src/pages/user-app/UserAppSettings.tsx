import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useBuiltApp } from "../../built-app/BuiltAppContext";
import { clearBuiltApp } from "../../built-app/derive";

export default function UserAppSettings() {
  const { app, updateName } = useBuiltApp();
  const navigate = useNavigate();
  const [name, setName] = useState(app.name);
  const [tagline, setTagline] = useState(app.tagline);
  const [saved, setSaved] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [clearType, setClearType] = useState("");

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    updateName(name, tagline);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onClear = () => {
    if (clearType !== "delete") return;
    clearBuiltApp();
    navigate("/", { replace: true });
  };

  return (
    <div className="user-app-page">
      <h2 className="user-app-page__h">App settings</h2>
      <p className="user-app-page__sub">Metadata for this build (stored with your preview data).</p>

      <form className="user-app-form" onSubmit={onSave}>
        <label className="user-app-label" htmlFor="a-name">
          App name
        </label>
        <input
          id="a-name"
          className="user-app-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="user-app-label" htmlFor="a-tagline">
          Tagline / description
        </label>
        <textarea
          id="a-tagline"
          className="user-app-textarea"
          rows={3}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <button type="submit" className="user-app-btn user-app-btn--primary">
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>

      <div className="user-app-danger">
        <h3 className="user-app-danger__h">Delete preview</h3>
        <p className="user-app-danger__p">
          Remove this build from the browser. You can run a new prompt from the Nanowork
          home page.
        </p>
        {!showClear ? (
          <button type="button" className="user-app-btn user-app-btn--danger" onClick={() => setShowClear(true)}>
            Delete this app
          </button>
        ) : (
          <div className="user-app-danger__confirm">
            <p>
              Type <code className="mono">delete</code> to confirm.
            </p>
            <input
              className="user-app-input"
              value={clearType}
              onChange={(e) => setClearType(e.target.value)}
              autoFocus
            />
            <div className="user-app-danger__row">
              <button type="button" className="user-app-btn user-app-btn--ghost" onClick={() => { setShowClear(false); setClearType(""); }}>
                Cancel
              </button>
              <button
                type="button"
                className="user-app-btn user-app-btn--danger"
                disabled={clearType !== "delete"}
                onClick={onClear}
              >
                Permanently delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <h1 className="user-app-page__title">App settings</h1>
      <p className="user-app-page__description">Customize your app's name and description. These changes are saved with your preview data.</p>

      <form className="user-app-form" onSubmit={onSave}>
        <label className="user-app-label" htmlFor="a-name">
          App name
        </label>
        <input
          id="a-name"
          className="user-app-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby="a-name-hint"
        />
        <p id="a-name-hint" className="user-app-field-hint">The display name for your app</p>

        <label className="user-app-label" htmlFor="a-tagline">
          Tagline or description
        </label>
        <textarea
          id="a-tagline"
          className="user-app-textarea"
          rows={3}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          aria-describedby="a-tagline-hint"
        />
        <p id="a-tagline-hint" className="user-app-field-hint">A brief description of what your app does</p>

        <button type="submit" className="user-app-btn user-app-btn--primary">
          {saved ? "Saved successfully!" : "Save changes"}
        </button>
      </form>

      <div className="user-app-danger-zone">
        <h2 className="user-app-danger-zone__title">Delete preview</h2>
        <p className="user-app-danger-zone__description">
          Remove this preview from your browser. Don't worry - you can always create a new app from the Nanowork home page.
        </p>
        {!showClear ? (
          <button type="button" className="user-app-btn user-app-btn--danger" onClick={() => setShowClear(true)}>
            Delete this preview
          </button>
        ) : (
          <div className="user-app-danger-zone__confirm">
            <p className="user-app-danger-zone__confirm-text">
              Type <code>delete</code> to confirm deletion.
            </p>
            <input
              className="user-app-input"
              value={clearType}
              onChange={(e) => setClearType(e.target.value)}
              autoFocus
              aria-label="Type delete to confirm"
              placeholder="delete"
            />
            <div className="user-app-danger-zone__actions">
              <button type="button" className="user-app-btn user-app-btn--secondary" onClick={() => { setShowClear(false); setClearType(""); }}>
                Cancel
              </button>
              <button
                type="button"
                className="user-app-btn user-app-btn--danger"
                disabled={clearType !== "delete"}
                onClick={onClear}
                aria-disabled={clearType !== "delete"}
              >
                Delete permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

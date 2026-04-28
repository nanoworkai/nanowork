import { useState } from "react";
import { useBuiltApp } from "../../built-app/BuiltAppContext";

function copy(text: string) {
  void navigator.clipboard?.writeText(text);
}

export default function UserAppAPI() {
  const { app } = useBuiltApp();
  const [done, setDone] = useState<string | null>(null);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const root = `${base}/api/sandbox/${app.slug}`;
  const list = `GET ${root}/v1/leads`;
  const create = `POST ${root}/v1/leads`;

  const onCopy = (label: string, text: string) => {
    copy(text);
    setDone(label);
    setTimeout(() => setDone(null), 2000);
  };

  const curlList = `curl -sS "${root}/v1/leads" \\
  -H "Authorization: Bearer $NW_TOKEN"`;

  const curlCreate = `curl -sS -X POST "${root}/v1/leads" \\
  -H "Authorization: Bearer $NW_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"dev@acme.com","source":"api"}'`;

  return (
    <div className="user-app-page">
      <h2 className="user-app-page__h">API</h2>
      <p className="user-app-page__sub">
        HTTP surface provisioned for this build. In preview, your browser and this UI share
        the same logical database.
      </p>

      <div className="user-app-api-block">
        <h3 className="user-app-api-block__h">Base URL</h3>
        <pre className="user-app-code" tabIndex={0}>
          <code>{root}</code>
        </pre>
        <button
          type="button"
          className="user-app-btn user-app-btn--ghost"
          onClick={() => onCopy("base", root)}
        >
          {done === "base" ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="user-app-api-block">
        <h3 className="user-app-api-block__h">List signups</h3>
        <p className="user-app-api-p mono">{list}</p>
        <pre className="user-app-code" tabIndex={0}>
          <code>{curlList}</code>
        </pre>
        <button
          type="button"
          className="user-app-btn user-app-btn--ghost"
          onClick={() => onCopy("list", curlList)}
        >
          {done === "list" ? "Copied" : "Copy curl"}
        </button>
      </div>

      <div className="user-app-api-block">
        <h3 className="user-app-api-block__h">Create signup</h3>
        <p className="user-app-api-p mono">{create}</p>
        <pre className="user-app-code" tabIndex={0}>
          <code>{curlCreate}</code>
        </pre>
        <button
          type="button"
          className="user-app-btn user-app-btn--ghost"
          onClick={() => onCopy("create", curlCreate)}
        >
          {done === "create" ? "Copied" : "Copy curl"}
        </button>
      </div>
    </div>
  );
}

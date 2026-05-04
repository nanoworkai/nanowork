import { useMemo, useState } from "react";
import type { WaitlistEntry } from "../../built-app/types";
import { useBuiltApp } from "../../built-app/BuiltAppContext";

function exportCsv(app: { signups: { email: string; createdAt: string; id: string; source?: string }[] }) {
  const header = "email,created_at,source,id";
  const lines = app.signups.map(
    (s) => `"${s.email.replace(/"/g, '""')}",${s.createdAt},${s.source || ""},${s.id}`,
  );
  const blob = new Blob([`${header}\n${lines.join("\n")}\n`], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leads-export.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function UserAppLeads() {
  const { app, addEmail } = useBuiltApp();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return app.signups;
    return app.signups.filter(
      (r: WaitlistEntry) =>
        r.email.toLowerCase().includes(s) || (r.id && r.id.includes(s)),
    );
  }, [app.signups, q]);

  return (
    <div className="user-app-page">
      <div className="user-app-toolbar">
        <h2 className="user-app-page__h">Leads</h2>
        <p className="user-app-page__sub">
          Stored in your preview workspace (same data the API returns).
        </p>
        <div className="user-app-toolbar__row">
          <input
            className="user-app-input user-app-input--search"
            type="search"
            placeholder="Filter by email or id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Filter leads"
          />
          <button
            type="button"
            className="user-app-btn user-app-btn--ghost"
            onClick={() => {
              const email = window.prompt("Add lead email");
              if (email) addEmail(email);
            }}
          >
            Add row
          </button>
          <button
            type="button"
            className="user-app-btn user-app-btn--primary"
            onClick={() => exportCsv(app)}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="user-app-table-wrap">
        <table className="user-app-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Created</th>
              <th>Source</th>
              <th className="mono">id</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: WaitlistEntry) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>
                  {new Date(r.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td>{r.source || "—"}</td>
                <td className="mono user-app-table__id">{r.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="user-app-empty">No leads match this filter.</p>}
      </div>
    </div>
  );
}

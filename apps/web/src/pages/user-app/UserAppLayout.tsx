import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBuiltApp } from "../../built-app/BuiltAppContext";

const NAV = [
  { to: "/app", label: "Overview", end: true },
  { to: "/app/leads", label: "Leads" },
  { to: "/app/api", label: "API" },
  { to: "/app/settings", label: "App settings" },
] as const;

export default function UserAppLayout() {
  const { app } = useBuiltApp();
  const { isAuthenticated } = useAuth();

  return (
    <div className="user-app">
      <aside className="user-app__sidebar" aria-label="App navigation">
        <div className="user-app__brand">
          <span className="user-app__brand-mark" aria-hidden="true" />
          <div>
            <p className="user-app__brand-name">{app.name}</p>
            <p className="user-app__brand-sub">{app.slug}.app.run</p>
          </div>
        </div>
        <nav className="user-app__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item && item.end === true}
              className={({ isActive }) =>
                `user-app__nav-item${isActive ? " user-app__nav-item--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-app__sidebar-footer">
          <Link to="/app/redeem" className="user-app__footer-link user-app__footer-link--primary">
            Redeem and deploy
          </Link>
          <Link to={isAuthenticated ? "/dashboard" : "/login?next=%2Fdashboard"} className="user-app__footer-link">
            {isAuthenticated ? "Your Nanowork account" : "Sign in to Nanowork"}
          </Link>
          <a href="https://nanowork.ai" className="user-app__footer-link" target="_blank" rel="noreferrer">
            Learn more about Nanowork
          </a>
        </div>
      </aside>
      <div className="user-app__main">
        <header className="user-app__header">
          <span className="user-app__badge user-app__badge--preview">Preview</span>
        </header>
        <main className="user-app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

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
          <span className="user-app__brand-mark" aria-hidden />
          <div>
            <p className="user-app__brand-name">{app.name}</p>
            <p className="user-app__brand-sub mono">{app.slug}.app.run</p>
          </div>
        </div>
        <nav className="user-app__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item && item.end === true}
              className={({ isActive }) =>
                `user-app__nav-item${isActive ? " is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-app__sidebar-foot">
          <Link to="/app/redeem" className="user-app__redeem-link">
            Redeem &amp; deploy
          </Link>
          <Link to={isAuthenticated ? "/dashboard" : "/login?next=%2Fdashboard"} className="user-app__nw-link">
            {isAuthenticated ? "Nanowork account" : "Log in to Nanowork"}
          </Link>
          <a href="https://nanowork.ai" className="user-app__nw-link" target="_blank" rel="noreferrer">
            nanowork.ai
          </a>
        </div>
      </aside>
      <div className="user-app__main">
        <header className="user-app__top">
          <span className="user-app__env">Preview</span>
        </header>
        <main className="user-app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

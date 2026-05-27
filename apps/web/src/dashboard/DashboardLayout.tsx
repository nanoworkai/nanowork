import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Terminal, LogOut, Menu, Settings, CreditCard, HelpCircle, ChevronDown } from "lucide-react";
import AppSwitcher from "../components/AppSwitcher";

const NAV_ITEMS = [
  { to: "/dashboard", label: "CREATE", end: true, code: "00" },
  { to: "/dashboard/history", label: "HISTORY", end: false, code: "01" },
  { to: "/dashboard/inbox", label: "INBOX", end: false, code: "02" },
  { to: "/dashboard/wallet", label: "WALLET", end: false, code: "03" },
  { to: "/dashboard/spreadsheets", label: "SPREADSHEETS", end: false, code: "04" },
  { to: "/dashboard/pitch-deck", label: "PITCH DECK", end: false, code: "05" },
  { to: "/dashboard/settings", label: "SETTINGS", end: false, code: "06" },
];

export default function DashboardLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const initials = profile?.businessName
    ? profile.businessName.slice(0, 2).toUpperCase()
    : "NW";

  return (
    <div className="flex h-screen bg-surface-0 text-fintech-navy overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modern fintech style */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-surface-1 border-r border-black/8 transition-transform duration-200 shadow-card-lg ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-black/8 p-4 bg-accent-light/30">
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-accent flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono font-bold text-fintech-navy text-sm uppercase tracking-wider">
                Nanowork
              </span>
            </div>
            <AppSwitcher />
          </div>

          {/* Live clock */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-accent-muted">UTC</span>
            <span className="text-sm font-mono font-bold text-fintech-navy tabular-nums">
              {time.toUTCString().slice(17, 25)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, end, code }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded border border-transparent font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "text-accent-muted hover:text-fintech-navy hover:bg-surface-3 hover:border-black/5"
                }`
              }
            >
              <span className="text-accent-muted">{code}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* System Info */}
        <div className="border-t border-black/8 p-3 space-y-2 bg-surface-3/50">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-accent-muted">CREDITS</span>
            <span className="text-fintech-navy font-bold tabular-nums">{profile?.creditsBalance ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-accent-muted">PLAN</span>
            <span className="text-fintech-navy uppercase">{profile?.plan ?? "FREE"}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-accent-muted">STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-fintech-green animate-pulse" />
              <span className="text-fintech-green">LIVE</span>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-black/8 p-3 bg-surface-1 relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded hover:bg-surface-3 transition-colors"
          >
            <div className="w-9 h-9 rounded bg-accent-light border border-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-mono font-bold text-accent">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-mono font-bold text-fintech-navy truncate uppercase">
                {profile?.businessName ?? "SYSTEM"}
              </p>
              <p className="text-xs font-mono text-accent-muted truncate">
                {profile?.email?.slice(0, 20) ?? "user@system"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-accent-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface-1 border border-black/8 rounded-lg overflow-hidden shadow-card-xl">
              <div className="p-2 border-b border-black/5 bg-surface-3/50">
                <p className="text-xs font-mono text-accent-muted">SIGNED IN AS</p>
                <p className="text-xs font-mono text-fintech-navy truncate mt-0.5">{profile?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-accent-muted hover:text-fintech-navy hover:bg-surface-3 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  SETTINGS
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-accent-muted hover:text-fintech-navy hover:bg-surface-3 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  BILLING
                </button>
                <a
                  href="#" // TODO: Configure docs URL
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-accent-muted hover:text-fintech-navy hover:bg-surface-3 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  HELP
                </a>
              </div>
              <div className="p-1 border-t border-black/5">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-fintech-red hover:text-fintech-red/80 hover:bg-fintech-red/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  SIGN OUT
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (Mobile) */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-black/8 lg:hidden bg-surface-1 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded text-accent-muted hover:text-fintech-navy hover:bg-surface-3 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="font-mono font-bold text-fintech-navy text-sm uppercase tracking-wider">
              Nanowork
            </span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

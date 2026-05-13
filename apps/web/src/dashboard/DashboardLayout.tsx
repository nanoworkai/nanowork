import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Terminal, LogOut, Menu, Settings, CreditCard, HelpCircle, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "OVERVIEW", end: true, code: "00" },
  { to: "/dashboard/bookings", label: "BOOKINGS", end: false, code: "01" },
  { to: "/dashboard/domains", label: "DOMAINS", end: false, code: "02" },
  { to: "/dashboard/plan", label: "PLAN", end: false, code: "03" },
  { to: "/dashboard/settings", label: "SETTINGS", end: false, code: "04" },
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
    navigate("/");
  };

  const initials = profile?.businessName
    ? profile.businessName.slice(0, 2).toUpperCase()
    : "NW";

  return (
    <div className="flex h-screen bg-surface-0 text-zinc-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Terminal style */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-surface-1 border-r border-white/10 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-4 bg-surface-0">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-4 h-4 text-black" />
            </div>
            <span className="font-mono font-bold text-white text-sm uppercase tracking-wider">
              Nanowork
            </span>
          </div>

          {/* Live clock */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-white/40">UTC</span>
            <span className="text-sm font-mono font-bold text-white tabular-nums">
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
                `flex items-center gap-3 px-3 py-3 rounded-none border border-transparent font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "text-white/60 hover:text-white hover:bg-white/5 hover:border-white/10"
                }`
              }
            >
              <span className="text-white/40">{code}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* System Info */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/40">CREDITS</span>
            <span className="text-white font-bold tabular-nums">{profile?.creditsBalance ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/40">PLAN</span>
            <span className="text-white uppercase">{profile?.plan ?? "FREE"}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/40">STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400">LIVE</span>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-white/10 p-3 bg-surface-0 relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-none hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-none bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-mono font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-mono font-bold text-white truncate uppercase">
                {profile?.businessName ?? "SYSTEM"}
              </p>
              <p className="text-xs font-mono text-white/40 truncate">
                {profile?.email?.slice(0, 20) ?? "user@system"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface-1 border border-white/10 rounded-none overflow-hidden shadow-xl">
              <div className="p-2 border-b border-white/5 bg-surface-0">
                <p className="text-xs font-mono text-white/40">SIGNED IN AS</p>
                <p className="text-xs font-mono text-white truncate mt-0.5">{profile?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  SETTINGS
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  BILLING
                </button>
                <a
                  href="https://docs.nanowork.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  HELP
                </a>
              </div>
              <div className="p-1 border-t border-white/5">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
        <header className="flex items-center justify-between px-4 h-14 border-b border-white/10 lg:hidden bg-surface-1 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-none text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white/60" />
            <span className="font-mono font-bold text-white text-sm uppercase tracking-wider">
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

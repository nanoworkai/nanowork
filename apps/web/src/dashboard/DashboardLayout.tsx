import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Terminal, LogOut, Menu, Settings, CreditCard, HelpCircle, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", end: true, code: "00" },
  { to: "/dashboard/bookings", label: "Bookings", end: false, code: "01" },
  { to: "/dashboard/inbox", label: "Inbox", end: false, code: "02" },
  { to: "/dashboard/wallet", label: "Wallet", end: false, code: "03" },
  { to: "/dashboard/settings", label: "Settings", end: false, code: "04" },
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
    <div className="flex h-screen bg-background text-content-primary overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-background-elevated border-r border-border-DEFAULT transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-border-DEFAULT p-4 bg-background-elevated">
          <div className="flex items-center gap-2.5 mb-4">
            <Terminal className="w-7 h-7 text-accent-primary stroke-[2.5]" />
            <span className="font-bold text-content-primary text-sm">
              Nanowork
            </span>
          </div>

          {/* Live clock */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-content-tertiary">UTC</span>
            <span className="text-sm font-mono font-bold text-content-primary tabular-nums">
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
                `flex items-center gap-3 px-3 py-3 rounded-md border border-transparent text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-primary text-white"
                    : "text-content-secondary hover:text-content-primary hover:bg-background-subtle"
                }`
              }
            >
              <span className="text-content-tertiary">{code}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* System Info */}
        <div className="border-t border-border-DEFAULT p-3 space-y-2 bg-background-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">Credits</span>
            <span className="text-content-primary font-bold tabular-nums">{profile?.creditsBalance ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">Plan</span>
            <span className="text-content-primary uppercase">{profile?.plan ?? "FREE"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 uppercase">LIVE</span>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-border-DEFAULT p-3 bg-background-elevated relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-background-subtle transition-colors"
          >
            <div className="w-9 h-9 bg-background-subtle border border-border-DEFAULT flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-content-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-content-primary truncate">
                {profile?.businessName ?? "System"}
              </p>
              <p className="text-xs text-content-secondary truncate">
                {profile?.email?.slice(0, 20) ?? "user@system"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-content-tertiary transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-background-elevated border border-border-DEFAULT rounded-md overflow-hidden shadow-xl">
              <div className="p-2 border-b border-border-subtle bg-background-subtle">
                <p className="text-xs text-content-tertiary">Signed in as</p>
                <p className="text-xs text-content-primary truncate mt-0.5">{profile?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-content-secondary hover:text-content-primary hover:bg-background-subtle transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-content-secondary hover:text-content-primary hover:bg-background-subtle transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Billing
                </button>
                <a
                  href="https://docs.nanowork.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-content-secondary hover:text-content-primary hover:bg-background-subtle transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Help
                </a>
              </div>
              <div className="p-1 border-t border-border-subtle">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (Mobile) */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-border-DEFAULT lg:hidden bg-background-elevated flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-content-secondary hover:text-content-primary hover:bg-background-subtle transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-content-secondary" />
            <span className="font-bold text-content-primary text-sm">
              Nanowork
            </span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

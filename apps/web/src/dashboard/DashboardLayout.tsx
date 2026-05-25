import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import {
  LogOut,
  Menu,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Clock,
  Inbox,
  Wallet,
  BarChart3
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Create", end: true, icon: Sparkles },
  { to: "/dashboard/history", label: "History", end: false, icon: Clock },
  { to: "/dashboard/inbox", label: "Inbox", end: false, icon: Inbox },
  { to: "/dashboard/wallet", label: "Wallet", end: false, icon: Wallet },
  { to: "/dashboard/settings", label: "Settings", end: false, icon: Settings },
];

export default function DashboardLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Professional style */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-surface-1 border-r border-white/[0.08] transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-white/[0.08] px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-white/80 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white text-base tracking-tight">
              Nanowork
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Account Metrics */}
        <div className="border-t border-white/[0.08] px-4 py-4 space-y-3">
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-400">Available Credits</span>
              <span className="text-lg font-semibold text-white tabular-nums">{profile?.creditsBalance ?? 0}</span>
            </div>
            <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          <div className="flex items-center justify-between px-3">
            <div>
              <p className="text-xs font-medium text-zinc-400">Current Plan</p>
              <p className="text-sm font-semibold text-white mt-0.5 capitalize">{profile?.plan ?? "Free"}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/plan")}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-white/[0.08] p-4 relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {profile?.businessName ?? "Account"}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {profile?.email?.slice(0, 24) ?? "user@example.com"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface-2 border border-white/[0.12] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-medium text-zinc-400">Signed in as</p>
                <p className="text-sm text-white truncate mt-1">{profile?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard/plan");
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  <CreditCard className="w-4 h-4" strokeWidth={2} />
                  Billing
                </button>
                <a
                  href="https://docs.nanowork.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  <HelpCircle className="w-4 h-4" strokeWidth={2} />
                  Documentation
                </a>
              </div>
              <div className="p-2 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
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
        <header className="flex items-center justify-between px-4 h-16 border-b border-white/[0.08] lg:hidden bg-surface-1 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-white/80 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white text-base tracking-tight">
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

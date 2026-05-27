import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Terminal, LogOut, Plus, LayoutGrid, History, Inbox, Wallet, Settings as SettingsIcon, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/dashboard/history", label: "History", icon: History, end: false },
  { to: "/dashboard/inbox", label: "Inbox", icon: Inbox, end: false },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet, end: false },
  { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon, end: false },
];

export default function DashboardLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-surface-1/95 backdrop-blur-xl border-b border-fintech-border">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-fintech-navy flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-fintech-navy tracking-tight">Nanowork</span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-fintech-navy bg-surface-0"
                      : "text-fintech-slate hover:text-fintech-navy hover:bg-surface-0"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* New Build Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-fintech-navy hover:bg-fintech-navy/90 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Build
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-fintech-border hover:border-fintech-navy bg-surface-1 transition-colors"
              >
                <div className="w-6 h-6 bg-fintech-navy flex items-center justify-center text-xs font-semibold text-white">
                  {profile?.businessName?.slice(0, 2).toUpperCase() || "NW"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-fintech-navy">
                  {profile?.businessName || "Account"}
                </span>
                <ChevronDown className="w-4 h-4 text-fintech-slate" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-1 border border-fintech-border shadow-card-lg">
                  <div className="p-4 border-b border-fintech-divider">
                    <p className="text-sm font-semibold text-fintech-navy">
                      {profile?.businessName || "Account"}
                    </p>
                    <p className="text-xs text-fintech-slate mt-0.5">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fintech-slate hover:text-fintech-navy hover:bg-surface-0 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fintech-red hover:bg-fintech-red/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-fintech-divider">
          <nav className="flex overflow-x-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-fintech-navy border-b-2 border-fintech-navy"
                      : "text-fintech-slate hover:text-fintech-navy"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

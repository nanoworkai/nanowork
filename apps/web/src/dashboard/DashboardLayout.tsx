import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Terminal, LogOut, Menu } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/financials", label: "Financials", end: false },
  { to: "/dashboard/settings", label: "Settings", end: false },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

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
        <div className="border-b border-[#2a2a2a] p-6">
          <span className="font-bold text-white text-lg tracking-tight">
            NANOWORK
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-white text-black font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-[#2a2a2a] p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors text-left flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* User Menu Dropdown */}
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

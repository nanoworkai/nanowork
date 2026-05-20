/**
 * Company Switcher Component
 *
 * Dropdown selector for switching between user's companies.
 * Shows list of owned and member companies with create new option.
 *
 * @component
 * @example
 * ```tsx
 * <CompanySwitcher />
 * ```
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompany, canCreateCompany, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle company selection
   * @param companyId - UUID of selected company
   */
  const handleSelect = (companyId: string) => {
    setActiveCompany(companyId);
    setIsOpen(false);
  };

  /**
   * Navigate to company creation flow
   * Checks if user can create more companies based on plan limit
   */
  const handleCreateNew = () => {
    if (!canCreateCompany()) {
      alert(`You've reached your company limit (${profile?.monthlyCompanyLimit}). Upgrade your plan to create more companies.`);
      navigate("/billing");
      return;
    }
    navigate("/companies/new");
    setIsOpen(false);
  };

  // Don't render if no companies
  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all text-sm text-white"
      >
        <div className="flex items-center gap-2">
          {/* Company Icon */}
          {activeCompany?.logo_url ? (
            <img
              src={activeCompany.logo_url}
              alt={activeCompany.name}
              className="w-5 h-5 rounded-md"
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-white/90 flex items-center justify-center text-xs font-bold text-zinc-900">
              {activeCompany?.name?.charAt(0) || "C"}
            </div>
          )}

          {/* Company Name */}
          <span className="font-medium text-white">
            {activeCompany?.name || "Select Company"}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
            {/* Companies List */}
            <div className="max-h-64 overflow-y-auto py-1">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company.id)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/8 transition-all text-left ${
                    activeCompany?.id === company.id ? "bg-white/5" : ""
                  }`}
                >
                  {/* Company Icon */}
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-8 h-8 rounded-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-white/90 flex items-center justify-center text-sm font-bold text-zinc-900">
                      {company.name.charAt(0)}
                    </div>
                  )}

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {company.name}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">
                      {company.industry || "No industry set"}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {activeCompany?.id === company.id && (
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Create New Button */}
            <button
              onClick={handleCreateNew}
              className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/8 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-md bg-white/5 border-2 border-white/10 border-dashed flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-white">
                Create New Company
              </div>
            </button>

            {/* Company Limit Info */}
            {profile && (
              <div className="px-3 py-2 border-t border-white/10">
                <div className="text-xs text-zinc-500">
                  {companies.length} of {profile.monthlyCompanyLimit} companies
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

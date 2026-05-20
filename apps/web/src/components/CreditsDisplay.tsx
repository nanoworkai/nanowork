/**
 * Credits Display Component
 *
 * Shows user's current credit balance with formatted display.
 * Includes buy more button and low balance warning.
 *
 * @component
 * @example
 * ```tsx
 * <CreditsDisplay onBuyClick={() => setShowModal(true)} />
 * ```
 */

import { useAuth } from "../context/AuthContext";
import { formatCredits } from "../lib/stripe";

interface CreditsDisplayProps {
  /** Callback when buy more button is clicked */
  onBuyClick: () => void;
  /** Show compact version without buy button */
  compact?: boolean;
}

export function CreditsDisplay({ onBuyClick, compact = false }: CreditsDisplayProps) {
  const { profile } = useAuth();

  if (!profile) return null;

  const balance = profile.creditsBalance;
  const isLow = balance < 50;
  const isCritical = balance < 10;

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm"}`}>
      {/* Credits Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${isCritical ? "bg-red-50" : isLow ? "bg-amber-50" : "bg-blue-50"} flex items-center justify-center`}>
        <svg
          className={`w-5 h-5 ${isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-blue-600"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Balance Display */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-xl font-semibold tabular-nums ${isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"}`}>
            {formatCredits(balance)}
          </span>
          <span className="text-sm text-gray-500 font-medium">credits</span>
        </div>

        {/* Warning Messages */}
        {isCritical && !compact && (
          <div className="text-sm text-red-600 mt-0.5 font-medium">
            Critical - buy more to continue
          </div>
        )}
        {isLow && !isCritical && !compact && (
          <div className="text-sm text-amber-600 mt-0.5 font-medium">
            Running low - consider buying more
          </div>
        )}
      </div>

      {/* Buy More Button */}
      {!compact && (
        <button
          onClick={onBuyClick}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow whitespace-nowrap"
        >
          Buy More
        </button>
      )}
    </div>
  );
}

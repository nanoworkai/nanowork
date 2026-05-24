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
    <div className={`flex items-center gap-3 ${compact ? "" : "px-4 py-2.5 rounded-lg bg-surface-2 border border-white/10"}`}>
      {/* Credits Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${isCritical ? "bg-red-500/20" : isLow ? "bg-yellow-500/20" : "bg-white/20"} flex items-center justify-center`}>
        <svg
          className={`w-4 h-4 ${isCritical ? "text-red-400" : isLow ? "text-yellow-400" : "text-white"}`}
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
          <span className={`text-lg font-bold tabular-nums ${isCritical ? "text-red-400" : isLow ? "text-yellow-400" : "text-white"}`}>
            {formatCredits(balance)}
          </span>
          <span className="text-xs text-zinc-500">credits</span>
        </div>

        {/* Warning Messages */}
        {isCritical && !compact && (
          <div className="text-xs text-red-400 mt-0.5">
            Critical - buy more to continue
          </div>
        )}
        {isLow && !isCritical && !compact && (
          <div className="text-xs text-yellow-400 mt-0.5">
            Running low - consider buying more
          </div>
        )}
      </div>

      {/* Buy More Button */}
      {!compact && (
        <button
          onClick={onBuyClick}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-white text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          Buy More
        </button>
      )}
    </div>
  );
}

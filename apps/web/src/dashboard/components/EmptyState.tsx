import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  features?: string[];
  secondaryIcon?: LucideIcon;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  features,
  secondaryIcon: SecondaryIcon,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="max-w-md text-center">
        {/* Icon Illustration */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-12 h-12 text-white/40" />
          </div>
          {SecondaryIcon && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
              <SecondaryIcon className="w-4 h-4 text-white/60" />
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/60 leading-relaxed mb-8">{description}</p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-base transition-all shadow-lg hover:shadow-xl group"
          >
            {ActionIcon && <ActionIcon className="w-5 h-5" />}
            {actionLabel}
            {ActionIcon && <ActionIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        )}

        {/* Features List */}
        {features && features.length > 0 && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-sm font-semibold text-white/80 mb-4">What you'll see here:</p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

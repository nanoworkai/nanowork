import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface DevModeBannerProps {
  message?: string;
}

export default function DevModeBanner({ message = 'Using mock data - backend unavailable' }: DevModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !import.meta.env.DEV) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 border-b border-amber-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-amber-900 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-xs sm:text-sm font-semibold text-amber-900">
                Development Mode
              </span>
              <span className="text-xs text-amber-800">{message}</span>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-amber-600/20 text-amber-900 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

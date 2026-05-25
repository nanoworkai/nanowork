/**
 * StatusBar - Bottom status bar for Office apps (Excel, Word, PowerPoint)
 */

import { ZoomIn, ZoomOut } from 'lucide-react';

interface StatusBarProps {
  leftItems?: React.ReactNode;
  rightItems?: React.ReactNode;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

export default function StatusBar({
  leftItems,
  rightItems,
  zoom = 100,
  onZoomChange,
  className = '',
}: StatusBarProps) {
  const handleZoomIn = () => {
    if (onZoomChange && zoom < 200) {
      onZoomChange(Math.min(200, zoom + 10));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange && zoom > 50) {
      onZoomChange(Math.max(50, zoom - 10));
    }
  };

  return (
    <div className={`bg-surface-1 border-t border-white/10 px-4 py-2 flex items-center justify-between ${className}`}>
      {/* Left Side */}
      <div className="flex items-center gap-4 text-xs font-mono text-white/60">
        {leftItems}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {rightItems}

        {/* Zoom Controls */}
        {onZoomChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono text-white/60 tabular-nums min-w-[3rem] text-center">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import type { BusinessPreview, BusinessTheme } from "../data/businesses";

interface BusinessPreviewRendererProps {
  preview: BusinessPreview;
  theme: BusinessTheme;
  className?: string;
}

/**
 * Renders the business preview based on its type
 * Supports: SaaS, Commerce, Newsletter, Local, Directory
 */
export function BusinessPreviewRenderer({
  preview,
  theme,
  className = "",
}: BusinessPreviewRendererProps) {
  const baseStyle = {
    backgroundColor: theme.bg,
    color: theme.text,
  };

  const accentStyle = {
    color: theme.accent,
  };

  const mutedStyle = {
    color: theme.muted,
  };

  // SaaS Preview
  if (preview.kind === "saas") {
    return (
      <div
        className={`relative overflow-hidden border border-white/10 ${className}`}
        style={baseStyle}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${theme.accent2} 1px, transparent 1px), linear-gradient(90deg, ${theme.accent2} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative p-8 sm:p-12 flex flex-col min-h-[400px]">
          {/* Brand */}
          <div className="mb-auto">
            <div
              className="inline-block px-3 py-1 mb-6 text-xs font-mono font-bold uppercase tracking-wider border"
              style={{ borderColor: theme.accent2, color: theme.accent }}
            >
              {preview.brand}
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-3 leading-tight">
              {preview.headline}
            </h2>
            <p className="text-base sm:text-lg font-mono" style={mutedStyle}>
              {preview.sub}
            </p>
          </div>

          {/* Metric Card */}
          <div
            className="border p-6 mt-8"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.accent2,
            }}
          >
            <div className="text-xs font-mono uppercase tracking-wider mb-2" style={mutedStyle}>
              {preview.metricLabel}
            </div>
            <div className="text-4xl font-mono font-bold tabular-nums" style={accentStyle}>
              {preview.metric}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Commerce Preview
  if (preview.kind === "commerce") {
    return (
      <div
        className={`relative overflow-hidden border border-white/10 ${className}`}
        style={baseStyle}
      >
        {/* Texture Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, ${theme.accent2} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative p-8 sm:p-12 flex flex-col min-h-[400px]">
          {/* Brand Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 self-start border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.accent2,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              {preview.brand}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-8 leading-tight">
              {preview.headline}
            </h2>

            {/* Product Card */}
            <div
              className="border p-6"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.accent2,
              }}
            >
              <div className="flex items-end justify-between">
                <div>
                  <div
                    className="text-sm font-mono mb-2"
                    style={{ color: theme.muted }}
                  >
                    {preview.product}
                  </div>
                  <div
                    className="text-3xl font-mono font-bold tabular-nums"
                    style={{ color: theme.accent }}
                  >
                    {preview.price}
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.bg,
                  }}
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Newsletter Preview
  if (preview.kind === "newsletter") {
    return (
      <div
        className={`relative overflow-hidden border border-white/10 ${className}`}
        style={baseStyle}
      >
        {/* Subtle Lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${theme.accent2} 0px, ${theme.accent2} 1px, transparent 1px, transparent 30px)`,
          }}
        />

        <div className="relative p-8 sm:p-12 flex flex-col min-h-[400px]">
          {/* Masthead */}
          <div className="mb-8 pb-6 border-b" style={{ borderColor: theme.accent2 }}>
            <div className="text-2xl font-mono font-bold tracking-tight" style={accentStyle}>
              {preview.brand}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest mt-2" style={mutedStyle}>
              {preview.subs}
            </div>
          </div>

          {/* Article Preview */}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-mono font-bold mb-4 leading-tight">
              {preview.headline}
            </h2>
            <div
              className="text-sm font-mono mb-6"
              style={{ color: theme.muted }}
            >
              {preview.issue}
            </div>

            {/* Fake content lines */}
            <div className="space-y-2">
              {[100, 95, 88, 92, 78].map((width, i) => (
                <div
                  key={i}
                  className="h-2 rounded-none"
                  style={{
                    width: `${width}%`,
                    backgroundColor: theme.accent2,
                    opacity: 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            className="mt-8 px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-colors self-start"
            style={{
              backgroundColor: theme.accent,
              color: theme.bg,
            }}
          >
            Subscribe
          </button>
        </div>
      </div>
    );
  }

  // Local Business Preview
  if (preview.kind === "local") {
    return (
      <div
        className={`relative overflow-hidden border border-white/10 ${className}`}
        style={baseStyle}
      >
        <div className="relative p-8 sm:p-12 flex flex-col min-h-[400px]">
          {/* Header */}
          <div className="mb-auto">
            <div
              className="text-sm font-mono uppercase tracking-wider mb-6"
              style={mutedStyle}
            >
              {preview.brand}
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold mb-4 leading-tight">
              {preview.headline}
            </h2>
            <p className="text-lg font-mono" style={mutedStyle}>
              {preview.sub}
            </p>
          </div>

          {/* CTA Card */}
          <div
            className="border p-6 mt-8"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.accent2,
            }}
          >
            <button
              className="w-full py-4 font-mono text-base font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              {preview.cta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Directory Preview
  if (preview.kind === "directory") {
    return (
      <div
        className={`relative overflow-hidden border border-white/10 ${className}`}
        style={baseStyle}
      >
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${theme.accent2} 1px, transparent 1px), linear-gradient(90deg, ${theme.accent2} 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative p-8 sm:p-12 flex flex-col justify-center min-h-[400px]">
          {/* Brand */}
          <div
            className="text-xs font-mono uppercase tracking-widest mb-8"
            style={mutedStyle}
          >
            {preview.brand}
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold mb-12 leading-tight">
            {preview.headline}
          </h2>

          {/* Stat */}
          <div
            className="inline-block border px-6 py-4 self-start"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.accent2,
            }}
          >
            <div
              className="text-2xl sm:text-3xl font-mono font-bold tabular-nums"
              style={accentStyle}
            >
              {preview.count}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

import { Building2, TrendingUp, Eye } from 'lucide-react';

interface ShowcaseCardProps {
  company: {
    id: string;
    name: string;
    tagline?: string;
    tier: string;
    price_cents: number;
    status: string;
    logo_url?: string;
    view_count: number;
    estimated_arr_max?: number;
    features?: string[];
  };
  onClaim: () => void;
}

export function ShowcaseCard({ company, onClaim }: ShowcaseCardProps) {
  const price = company.price_cents / 100;
  const isAvailable = company.status === 'available';

  return (
    <div className="card rounded-none border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      {/* Image/Preview */}
      <div className="aspect-video bg-surface-2 relative overflow-hidden">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-white/20" />
          </div>
        )}

        {/* Tier Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            {company.tier}
          </span>
        </div>

        {/* Status Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider px-3 py-1 border border-white/20">
              CLAIMED
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-mono font-bold text-white mb-2">
          {company.name}
        </h3>

        {/* Tagline */}
        {company.tagline && (
          <p className="text-xs text-white/60 mb-3 line-clamp-2">
            {company.tagline}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-white/40">
          {company.view_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{company.view_count}</span>
            </div>
          )}
          {company.estimated_arr_max && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>${(company.estimated_arr_max / 1000).toFixed(0)}K ARR</span>
            </div>
          )}
        </div>

        {/* Features */}
        {company.features && company.features.length > 0 && (
          <div className="mb-4 space-y-1">
            {company.features.slice(0, 3).map((feature: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-white/60">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              ${price.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-white/40 uppercase">
              One-time
            </div>
          </div>

          <button
            onClick={onClaim}
            disabled={!isAvailable}
            className="px-4 py-2 rounded-none bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {isAvailable ? 'Claim' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
}

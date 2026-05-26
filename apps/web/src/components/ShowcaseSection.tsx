import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { ShowcaseCard } from './ShowcaseCard';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import { apiFetch } from '../lib/apiFetch';

interface ShowcaseCompany {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  industry?: string;
  logo_url?: string;
  tier: string;
  price_cents: number;
  estimated_arr_min?: number;
  estimated_arr_max?: number;
  features?: string[];
  status: string;
  view_count: number;
}

export function ShowcaseSection() {
  const [showcaseCompanies, setShowcaseCompanies] = useState<ShowcaseCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<ShowcaseCompany | null>(null);

  useEffect(() => {
    fetchShowcaseCompanies();
  }, []);

  async function fetchShowcaseCompanies() {
    try {
      const response = await apiFetch('/api/showcase/companies');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setShowcaseCompanies(data);
    } catch (error) {
      console.error('Failed to fetch showcase companies:', error);
    } finally {
      setLoading(false);
    }
  }

  // Don't show section if no companies available
  if (!loading && showcaseCompanies.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      {/* Section Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-white/60" />
          <span className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
            Claim a Pre-Built Business
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-white uppercase tracking-tight mb-3">
          Skip the Build. Buy a Business Ready to Launch.
        </h2>
        <p className="text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
          Our AI has already built these companies. Full branding, websites, agents, and automation.
          Claim one now and start generating revenue immediately.
        </p>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="text-center py-12 text-white/40 font-mono text-sm">
          LOADING BUSINESSES...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseCompanies.map((company) => (
            <ShowcaseCard
              key={company.id}
              company={company}
              onClaim={() => setSelectedCompany(company)}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedCompany && (
        <ClaimBusinessModal
          isOpen={!!selectedCompany}
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </section>
  );
}

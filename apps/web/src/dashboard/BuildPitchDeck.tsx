import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Presentation, ChevronLeft, ChevronRight } from "lucide-react";

interface PitchDeck {
  id: string;
  deck_data: {
    pitch_outline?: any;
    business_analysis?: any;
    product_design?: any;
    marketing_strategy?: any;
    financial_projections?: any;
    technical_overview?: any;
  };
  created_at: string;
}

interface Slide {
  title: string;
  content: any;
}

export default function BuildPitchDeck() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadPitchDeck();
  }, [buildId]);

  async function loadPitchDeck() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/pitch-deck`, {
        credentials: 'include',
      });

      if (res.ok) {
        const { pitchDeck: data } = await res.json();
        setPitchDeck(data);

        if (data?.deck_data) {
          const generatedSlides = generateSlides(data.deck_data);
          setSlides(generatedSlides);
        }
      }
    } catch (err) {
      console.error('Failed to load pitch deck:', err);
    } finally {
      setLoading(false);
    }
  }

  function generateSlides(deckData: PitchDeck['deck_data']): Slide[] {
    const slides: Slide[] = [];

    // Cover slide
    slides.push({
      title: 'Company Pitch',
      content: {
        subtitle: 'Building the Future',
        tagline: 'Investment Opportunity',
      },
    });

    // Problem
    if (deckData.business_analysis?.problem) {
      slides.push({
        title: 'The Problem',
        content: deckData.business_analysis.problem,
      });
    }

    // Solution
    if (deckData.product_design?.solution || deckData.pitch_outline?.solution) {
      slides.push({
        title: 'Our Solution',
        content: deckData.product_design?.solution || deckData.pitch_outline?.solution,
      });
    }

    // Market Opportunity
    if (deckData.business_analysis?.market_opportunity) {
      slides.push({
        title: 'Market Opportunity',
        content: deckData.business_analysis.market_opportunity,
      });
    }

    // Product
    if (deckData.product_design?.features) {
      slides.push({
        title: 'Product',
        content: deckData.product_design.features,
      });
    }

    // Business Model
    if (deckData.business_analysis?.business_model) {
      slides.push({
        title: 'Business Model',
        content: deckData.business_analysis.business_model,
      });
    }

    // Go-to-Market
    if (deckData.marketing_strategy?.gtm_strategy) {
      slides.push({
        title: 'Go-to-Market Strategy',
        content: deckData.marketing_strategy.gtm_strategy,
      });
    }

    // Competition
    if (deckData.business_analysis?.competitive_landscape) {
      slides.push({
        title: 'Competitive Landscape',
        content: deckData.business_analysis.competitive_landscape,
      });
    }

    // Financials
    if (deckData.financial_projections) {
      slides.push({
        title: 'Financial Projections',
        content: deckData.financial_projections,
      });
    }

    // Technology
    if (deckData.technical_overview?.architecture) {
      slides.push({
        title: 'Technology',
        content: deckData.technical_overview.architecture,
      });
    }

    // Ask
    if (deckData.pitch_outline?.funding_ask) {
      slides.push({
        title: 'The Ask',
        content: deckData.pitch_outline.funding_ask,
      });
    }

    return slides;
  }

  function downloadPDF() {
    if (!pitchDeck) return;
    // TODO: Implement PDF generation
    alert('PDF export coming soon!');
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING PITCH DECK...</p>
        </div>
      </div>
    );
  }

  if (!pitchDeck || slides.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(`/dashboard/builder/${buildId}`)}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO BUILDER
        </button>
        <div className="text-center py-12">
          <Presentation className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/60">Pitch deck not available yet</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/dashboard/builder/${buildId}`)}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO BUILDER
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-white mb-2">Investor Pitch Deck</h1>
            <p className="text-sm text-white/60">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            EXPORT PDF
          </button>
        </div>
      </div>

      {/* Slide Viewer */}
      <div className="border border-white/10 bg-surface-2 rounded-xl overflow-hidden mb-6">
        <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-mono font-bold text-white mb-6">{slide.title}</h2>
          <div className="text-white/80">{renderSlideContent(slide.content)}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          PREVIOUS
        </button>

        {/* Slide Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-2xl">
          {slides.map((s, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`flex-shrink-0 w-20 h-12 rounded border transition-all ${
                index === currentSlide
                  ? 'bg-white/20 border-white/40'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="text-xs text-white/60 font-mono">{index + 1}</div>
            </button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          NEXT
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function renderSlideContent(content: any): React.ReactNode {
  if (typeof content === 'string') {
    return <p className="text-lg leading-relaxed">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-3">
        {content.map((item, index) => (
          <li key={index} className="text-lg flex items-start gap-3">
            <span className="text-white/40 mt-1">•</span>
            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <h3 className="text-xl font-semibold text-white mb-2 capitalize">
              {key.replace(/_/g, ' ')}
            </h3>
            <div className="ml-4">{renderSlideContent(value)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-lg">{String(content)}</p>;
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Presentation, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

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
  layout?: 'title' | 'content' | 'two-column' | 'bullets' | 'data';
}

export default function BuildPitchDeck() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);

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
    const pitch = deckData.pitch_outline || {};
    const business = deckData.business_analysis || {};
    const product = deckData.product_design || {};
    const marketing = deckData.marketing_strategy || {};
    const financials = deckData.financial_projections || {};
    const tech = deckData.technical_overview || {};

    // 1. Cover slide
    slides.push({
      title: pitch.elevator_pitch || 'Company Pitch',
      content: {
        subtitle: pitch.solution_overview || 'Building the Future',
        tagline: 'Investment Opportunity',
      },
      layout: 'title',
    });

    // 2. Problem
    if (pitch.problem_statement || business.problem) {
      slides.push({
        title: 'The Problem',
        content: pitch.problem_statement || business.problem,
        layout: 'content',
      });
    }

    // 3. Solution
    if (pitch.solution_overview || product.solution) {
      slides.push({
        title: 'Our Solution',
        content: pitch.solution_overview || product.solution,
        layout: 'content',
      });
    }

    // 4. Market Opportunity
    if (pitch.market_opportunity || business.market_size_and_opportunity) {
      slides.push({
        title: 'Market Opportunity',
        content: pitch.market_opportunity || business.market_size_and_opportunity,
        layout: 'bullets',
      });
    }

    // 5. Product/Features
    if (product.core_features_list || product.features) {
      slides.push({
        title: 'Product',
        content: product.core_features_list || product.features,
        layout: 'bullets',
      });
    }

    // 6. Business Model
    if (pitch.business_model_summary || business.business_model_recommendations) {
      slides.push({
        title: 'Business Model',
        content: pitch.business_model_summary || business.business_model_recommendations,
        layout: 'content',
      });
    }

    // 7. Traction/Milestones
    if (pitch.traction_and_milestones) {
      slides.push({
        title: 'Traction & Milestones',
        content: pitch.traction_and_milestones,
        layout: 'bullets',
      });
    }

    // 8. Competition
    if (pitch.competition_and_differentiation || business.competitive_landscape) {
      slides.push({
        title: 'Competitive Advantage',
        content: pitch.competition_and_differentiation || business.competitive_landscape,
        layout: 'bullets',
      });
    }

    // 9. Go-to-Market
    if (marketing.gtm_strategy || marketing.customer_acquisition_channels) {
      slides.push({
        title: 'Go-to-Market Strategy',
        content: marketing.gtm_strategy || marketing.customer_acquisition_channels,
        layout: 'bullets',
      });
    }

    // 10. Financial Highlights
    if (pitch.financial_highlights || financials.revenue_model_and_pricing_strategy) {
      slides.push({
        title: 'Financial Highlights',
        content: pitch.financial_highlights || {
          revenue: financials.revenue_model_and_pricing_strategy,
          projections: financials.three_year_financial_projections,
        },
        layout: 'data',
      });
    }

    // 11. Technology (optional)
    if (tech.system_architecture_overview || tech.tech_stack_recommendations) {
      slides.push({
        title: 'Technology',
        content: {
          architecture: tech.system_architecture_overview,
          stack: tech.tech_stack_recommendations,
        },
        layout: 'two-column',
      });
    }

    // 12. Team Requirements
    if (pitch.team_requirements) {
      slides.push({
        title: 'Team',
        content: pitch.team_requirements,
        layout: 'bullets',
      });
    }

    // 13. The Ask
    if (pitch.funding_ask || financials.funding_requirements_and_use_of_funds) {
      slides.push({
        title: 'The Ask',
        content: pitch.funding_ask || financials.funding_requirements_and_use_of_funds,
        layout: 'content',
      });
    }

    return slides;
  }

  function downloadPDF() {
    if (!pitchDeck) return;
    window.print();
  }

  function toggleFullScreen() {
    setFullScreen(!fullScreen);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
      if (e.key === 'Escape' && fullScreen) {
        setFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, fullScreen, slides.length]);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Full Screen Slide */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-7xl flex items-center justify-center">
            {renderFullScreenSlide(slide)}
          </div>
        </div>

        {/* Full Screen Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
          <button
            onClick={previousSlide}
            disabled={currentSlide === 0}
            className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-mono text-white/80 min-w-[80px] text-center">
            {currentSlide + 1} / {slides.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <button
            onClick={toggleFullScreen}
            className="p-2 text-white/60 hover:text-white transition-colors"
            title="Exit Full Screen (ESC)"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              PRESENT
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              PRINT
            </button>
          </div>
        </div>
      </div>

      {/* Slide Viewer */}
      <div className="border border-white/10 bg-surface-2 rounded-xl overflow-hidden mb-6">
        <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-12 flex items-center justify-center">
          {renderSlideContent(slide)}
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
        <div className="flex items-center gap-2 overflow-x-auto max-w-2xl px-2">
          {slides.map((s, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`flex-shrink-0 w-20 h-12 rounded border transition-all flex items-center justify-center ${
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

function renderSlideContent(slide: Slide): React.ReactNode {
  const { title, content, layout = 'content' } = slide;

  // Title slide layout
  if (layout === 'title') {
    return (
      <div className="w-full text-center">
        <h1 className="text-5xl md:text-6xl font-mono font-bold text-white mb-6">
          {title}
        </h1>
        {typeof content === 'object' && content.subtitle && (
          <p className="text-2xl md:text-3xl font-mono text-white/80 mb-4">
            {content.subtitle}
          </p>
        )}
        {typeof content === 'object' && content.tagline && (
          <p className="text-lg md:text-xl font-mono text-white/60">
            {content.tagline}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-4xl md:text-5xl font-mono font-bold text-white mb-8">
        {title}
      </h2>
      <div className="flex-1 flex items-center">
        {renderContentByLayout(content, layout)}
      </div>
    </div>
  );
}

function renderFullScreenSlide(slide: Slide): React.ReactNode {
  const { title, content, layout = 'content' } = slide;

  if (layout === 'title') {
    return (
      <div className="text-center">
        <h1 className="text-7xl font-mono font-bold text-white mb-8">
          {title}
        </h1>
        {typeof content === 'object' && content.subtitle && (
          <p className="text-4xl font-mono text-white/80 mb-6">
            {content.subtitle}
          </p>
        )}
        {typeof content === 'object' && content.tagline && (
          <p className="text-2xl font-mono text-white/60">
            {content.tagline}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-12">
      <h2 className="text-6xl font-mono font-bold text-white mb-12">
        {title}
      </h2>
      <div className="flex-1 flex items-center">
        {renderContentByLayout(content, layout, true)}
      </div>
    </div>
  );
}

function renderContentByLayout(content: any, layout: string, isFullScreen = false): React.ReactNode {
  const textSize = isFullScreen ? 'text-2xl' : 'text-lg';
  const headingSize = isFullScreen ? 'text-3xl' : 'text-xl';

  // Bullets layout
  if (layout === 'bullets' || Array.isArray(content)) {
    const items = Array.isArray(content) ? content : extractBulletPoints(content);
    return (
      <ul className="space-y-4 w-full">
        {items.map((item, index) => (
          <li key={index} className={`${textSize} flex items-start gap-4 text-white/90`}>
            <span className="text-white/40 mt-1 flex-shrink-0">•</span>
            <span className="leading-relaxed">
              {typeof item === 'string' ? item : renderSimpleContent(item, textSize)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Two column layout
  if (layout === 'two-column' && typeof content === 'object') {
    const entries = Object.entries(content);
    const mid = Math.ceil(entries.length / 2);
    const left = entries.slice(0, mid);
    const right = entries.slice(mid);

    return (
      <div className="grid grid-cols-2 gap-8 w-full">
        <div className="space-y-6">
          {left.map(([key, value]) => (
            <div key={key}>
              <h3 className={`${headingSize} font-semibold text-white mb-2 capitalize`}>
                {key.replace(/_/g, ' ')}
              </h3>
              <div className={`${textSize} text-white/80`}>
                {renderSimpleContent(value, textSize)}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {right.map(([key, value]) => (
            <div key={key}>
              <h3 className={`${headingSize} font-semibold text-white mb-2 capitalize`}>
                {key.replace(/_/g, ' ')}
              </h3>
              <div className={`${textSize} text-white/80`}>
                {renderSimpleContent(value, textSize)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Data/metrics layout
  if (layout === 'data' && typeof content === 'object') {
    return (
      <div className="grid grid-cols-2 gap-6 w-full">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-mono text-white/60 uppercase tracking-wider mb-2">
              {key.replace(/_/g, ' ')}
            </h3>
            <div className={`${headingSize} font-bold text-white`}>
              {renderSimpleContent(value, textSize)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default content layout
  return (
    <div className={`${textSize} text-white/90 leading-relaxed w-full`}>
      {renderSimpleContent(content, textSize)}
    </div>
  );
}

function renderSimpleContent(content: any, textSize: string): React.ReactNode {
  if (typeof content === 'string') {
    return <span>{content}</span>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-white/40">•</span>
            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-3">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold text-white">{key.replace(/_/g, ' ')}: </span>
            <span className="text-white/80">
              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(content)}</span>;
}

function extractBulletPoints(obj: any): string[] {
  if (Array.isArray(obj)) return obj.filter(item => typeof item === 'string');

  if (typeof obj === 'object' && obj !== null) {
    const points: string[] = [];
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        points.push(value);
      } else if (Array.isArray(value)) {
        points.push(...value.filter(item => typeof item === 'string'));
      }
    });
    return points;
  }

  return [String(obj)];
}

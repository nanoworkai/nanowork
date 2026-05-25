import { Presentation, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Quick Start Card for Pitch Deck Generator
 * Can be used on the Create page or other dashboard pages
 */
export default function PitchDeckQuickStart() {
  const navigate = useNavigate();

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <Presentation className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">AI Pitch Deck Generator</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400">
              NEW
            </span>
          </div>

          <p className="text-sm text-white/60 mb-4 leading-relaxed">
            Create investor-ready pitch decks in minutes. Our AI generates compelling narratives, market sizing, and complete slide content based on your business description.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI Content
            </span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
              10 Slides
            </span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
              PDF Export
            </span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
              4 Templates
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard/pitch-deck")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-black font-medium text-sm transition-all group/btn"
          >
            Create Pitch Deck
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Presentation,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Grid3x3,
  FileText,
  Save,
  Eye,
  Palette,
  BarChart3,
  FileJson,
  FileCode,
} from "lucide-react";
import { exportToPDF, downloadJSON, downloadMarkdown } from "../lib/pdfExport";

interface SlideContent {
  type: string;
  title: string;
  content: string;
  bullets?: string[];
  data?: Record<string, any>;
  notes?: string;
}

interface PitchDeck {
  id: string;
  companyName: string;
  tagline: string;
  slides: SlideContent[];
  template: string;
  createdAt: string;
  updatedAt: string;
}

interface PitchDeckEditorProps {
  initialBusinessDescription?: string;
  onClose?: () => void;
}

const TEMPLATES = [
  { id: "yc", name: "Y Combinator", description: "Minimal, data-focused" },
  { id: "sequoia", name: "Sequoia", description: "Storytelling narrative" },
  { id: "modern", name: "Modern SaaS", description: "Clean and visual" },
  { id: "corporate", name: "Corporate", description: "Formal and detailed" },
];

export default function PitchDeckEditor({
  initialBusinessDescription = "",
  onClose,
}: PitchDeckEditorProps) {
  const { session } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // State
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");

  // Generation form
  const [businessDescription, setBusinessDescription] = useState(
    initialBusinessDescription
  );
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [targetRaise, setTargetRaise] = useState("");

  // AI assistance
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const currentSlide = deck?.slides[currentSlideIndex];

  // Generate deck
  const handleGenerateDeck = async () => {
    if (!businessDescription.trim() || !session?.access_token) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/pitch-deck/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessDescription,
          companyName: companyName || undefined,
          tagline: tagline || undefined,
          targetRaise: targetRaise || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate deck");
      }

      const data = await response.json();
      setDeck(data.deck);
      setCurrentSlideIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate deck");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Improve slide with AI
  const handleImproveSlide = async () => {
    if (
      !aiInstruction.trim() ||
      !currentSlide ||
      !deck ||
      !session?.access_token
    )
      return;

    setIsImproving(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/pitch-deck/improve-slide`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slideContent: currentSlide,
          instruction: aiInstruction,
          deckContext: {
            companyName: deck.companyName,
            tagline: deck.tagline,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to improve slide");
      }

      const data = await response.json();

      // Update the slide in the deck
      const updatedSlides = [...deck.slides];
      updatedSlides[currentSlideIndex] = data.slide;
      setDeck({ ...deck, slides: updatedSlides, updatedAt: new Date().toISOString() });
      setAiInstruction("");
      setShowAiPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve slide");
      console.error("Improvement error:", err);
    } finally {
      setIsImproving(false);
    }
  };

  // Update slide content
  const updateSlide = (updates: Partial<SlideContent>) => {
    if (!deck || !currentSlide) return;

    const updatedSlides = [...deck.slides];
    updatedSlides[currentSlideIndex] = { ...currentSlide, ...updates };
    setDeck({ ...deck, slides: updatedSlides, updatedAt: new Date().toISOString() });
  };

  // Navigation
  const goToNextSlide = () => {
    if (deck && currentSlideIndex < deck.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Export to PDF
  const handleExport = async () => {
    if (!deck) return;
    setIsExporting(true);
    try {
      exportToPDF(deck);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export PDF");
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (!deck) return;
    downloadJSON(deck);
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    if (!deck) return;
    downloadMarkdown(deck);
  };

  // If no deck yet, show generation form
  if (!deck) {
    return (
      <div className="min-h-screen bg-surface-0 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                AI Pitch Deck Generator
              </h1>
            </div>
            <p className="text-white/60">
              Create an investor-ready pitch deck in minutes. Our AI will
              generate compelling content based on your business description.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Generation Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-surface-1 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">
                Business Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Describe your business, target market, key features, and what makes you unique. Be specific about your product, customers, and traction..."
                    className="w-full h-40 px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Company Name (optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc"
                      className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Tagline (optional)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Building the future of..."
                      className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Target Raise (optional)
                  </label>
                  <input
                    type="text"
                    value={targetRaise}
                    onChange={(e) => setTargetRaise(e.target.value)}
                    placeholder="$2M Seed Round"
                    className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDeck}
              disabled={!businessDescription.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-zinc-100 disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-semibold transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your pitch deck...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Pitch Deck
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editor view
  return (
    <div className="min-h-screen bg-surface-0 text-white flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-surface-1">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">
                {deck.companyName}
              </h1>
              <p className="text-sm text-white/60">{deck.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-white/10">
              <button
                onClick={() => setView("edit")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === "edit"
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => setView("preview")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === "preview"
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Preview
              </button>
            </div>

            {/* Template Selector */}
            <select
              value={deck.template}
              onChange={(e) =>
                setDeck({ ...deck, template: e.target.value })
              }
              className="px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-sm text-white outline-none"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-white/10 text-black disabled:text-white/30 font-medium text-sm transition-colors"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export PDF
              </button>
              {/* Export Options Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-surface-1 border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/5 rounded-t-lg"
                >
                  <Download className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  <FileCode className="w-4 h-4" />
                  Export as Markdown
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/5 rounded-b-lg"
                >
                  <FileJson className="w-4 h-4" />
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Navigator */}
        <div className="w-64 border-r border-white/10 bg-surface-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Grid3x3 className="w-4 h-4 text-white/60" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Slides ({deck.slides.length})
              </span>
            </div>
            <div className="space-y-2">
              {deck.slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentSlideIndex
                      ? "bg-white text-black"
                      : "bg-surface-2 hover:bg-surface-2/80 text-white/80"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-xs font-mono ${
                        index === currentSlideIndex
                          ? "text-black/60"
                          : "text-white/40"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          index === currentSlideIndex
                            ? "text-black"
                            : "text-white"
                        }`}
                      >
                        {slide.title}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          index === currentSlideIndex
                            ? "text-black/60"
                            : "text-white/50"
                        }`}
                      >
                        {slide.type}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slide Navigation */}
          <div className="border-b border-white/10 bg-surface-1 px-6 py-3 flex items-center justify-between">
            <button
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Previous</span>
            </button>

            <div className="text-sm text-white/60">
              Slide {currentSlideIndex + 1} of {deck.slides.length}
            </div>

            <button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === deck.slides.length - 1}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Slide Editor */}
            <div className="flex-1 overflow-y-auto p-8">
              {view === "edit" && currentSlide && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      value={currentSlide.title}
                      onChange={(e) => updateSlide({ title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-2xl font-bold text-white outline-none"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                      Main Content
                    </label>
                    <textarea
                      value={currentSlide.content}
                      onChange={(e) =>
                        updateSlide({ content: e.target.value })
                      }
                      className="w-full h-32 px-4 py-3 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white outline-none resize-none"
                    />
                  </div>

                  {/* Bullets */}
                  {currentSlide.bullets && (
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                        Bullet Points
                      </label>
                      <div className="space-y-2">
                        {currentSlide.bullets.map((bullet, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const newBullets = [...currentSlide.bullets!];
                              newBullets[idx] = e.target.value;
                              updateSlide({ bullets: newBullets });
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-white outline-none"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data (if present) */}
                  {currentSlide.data && (
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                        Data & Metrics
                      </label>
                      <div className="p-4 rounded-lg bg-surface-2 border border-white/10">
                        <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">
                          {JSON.stringify(currentSlide.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === "preview" && currentSlide && (
                <div className="max-w-4xl mx-auto">
                  <SlidePreview slide={currentSlide} template={deck.template} />
                </div>
              )}
            </div>

            {/* AI Panel */}
            {showAiPanel && (
              <div className="w-80 border-l border-white/10 bg-surface-1 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    AI Assistant
                  </h3>
                </div>

                <p className="text-sm text-white/60 mb-4">
                  Tell the AI how you'd like to improve this slide.
                </p>

                <div className="space-y-4">
                  <textarea
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    placeholder="E.g., Make it more compelling, add specific numbers, rewrite for B2B audience..."
                    className="w-full h-32 px-3 py-2 rounded-lg bg-surface-2 border border-white/10 focus:border-white/30 text-sm text-white placeholder-white/40 outline-none resize-none"
                    disabled={isImproving}
                  />

                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAiPanel(false);
                        setAiInstruction("");
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-white text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImproveSlide}
                      disabled={!aiInstruction.trim() || isImproving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-white/10 text-black disabled:text-white/30 text-sm font-medium transition-colors"
                    >
                      {isImproving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Improve
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs font-medium text-white/60 mb-3 uppercase tracking-wider">
                    Quick Actions
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        setAiInstruction("Make this slide more data-driven and specific")
                      }
                      className="w-full text-left px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-sm text-white/80 transition-colors"
                    >
                      Add more data
                    </button>
                    <button
                      onClick={() =>
                        setAiInstruction("Rewrite this to be more compelling and investor-focused")
                      }
                      className="w-full text-left px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-sm text-white/80 transition-colors"
                    >
                      Make more compelling
                    </button>
                    <button
                      onClick={() =>
                        setAiInstruction("Simplify this content and make it more concise")
                      }
                      className="w-full text-left px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-sm text-white/80 transition-colors"
                    >
                      Simplify
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 bg-surface-1 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-white/40">
              Last updated: {new Date(deck.updatedAt).toLocaleString()}
            </div>
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                showAiPanel
                  ? "bg-white text-black"
                  : "bg-surface-2 hover:bg-surface-2/80 text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {showAiPanel ? "Close" : "AI Assistant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide Preview Component
function SlidePreview({
  slide,
  template,
}: {
  slide: SlideContent;
  template: string;
}) {
  // Template-specific rendering
  const getTemplateStyles = () => {
    switch (template) {
      case "yc":
        return "bg-white text-black font-sans";
      case "sequoia":
        return "bg-gradient-to-br from-zinc-900 to-black text-white";
      case "modern":
        return "bg-zinc-50 text-zinc-900";
      case "corporate":
        return "bg-white text-zinc-800 border-4 border-zinc-200";
      default:
        return "bg-white text-black";
    }
  };

  return (
    <div
      className={`aspect-[16/9] rounded-lg shadow-2xl p-12 flex flex-col ${getTemplateStyles()}`}
    >
      {/* Cover Slide */}
      {slide.type === "cover" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
          <p className="text-2xl opacity-70">{slide.content}</p>
        </div>
      )}

      {/* Standard Slide */}
      {slide.type !== "cover" && (
        <>
          <h2 className="text-4xl font-bold mb-8">{slide.title}</h2>
          <div className="flex-1">
            <p className="text-xl opacity-80 mb-6">{slide.content}</p>
            {slide.bullets && slide.bullets.length > 0 && (
              <ul className="space-y-3">
                {slide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg">
                    <span className="opacity-50">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {slide.data && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                {Object.entries(slide.data).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-3xl font-bold">{String(value)}</div>
                    <div className="text-sm opacity-60 mt-1 uppercase">
                      {key}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

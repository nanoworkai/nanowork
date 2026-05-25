import { useState } from "react";
import { Presentation, Sparkles, ArrowRight, FileText, TrendingUp, Users, Target } from "lucide-react";
import PitchDeckEditor from "../components/PitchDeckEditor";

export default function PitchDeck() {
  const [showEditor, setShowEditor] = useState(false);
  const [initialDescription, setInitialDescription] = useState("");

  if (showEditor) {
    return (
      <PitchDeckEditor
        initialBusinessDescription={initialDescription}
        onClose={() => {
          setShowEditor(false);
          setInitialDescription("");
        }}
      />
    );
  }

  const examples = [
    {
      icon: TrendingUp,
      title: "SaaS Platform",
      description:
        "Building a B2B sales automation platform that helps teams close deals 3x faster with AI-powered insights and automated follow-ups.",
    },
    {
      icon: Users,
      title: "Marketplace",
      description:
        "Creating a two-sided marketplace connecting freelance developers with startups. $50K MRR, 500 active developers, raising $2M seed.",
    },
    {
      icon: Target,
      title: "Fintech",
      description:
        "Launching a neobank for freelancers with built-in invoicing, tax automation, and instant payments. 10K waitlist, raising $3M.",
    },
  ];

  const features = [
    {
      title: "AI Content Generation",
      description:
        "Claude writes compelling narratives that investors want to read",
    },
    {
      title: "Professional Templates",
      description: "YC, Sequoia, and Modern SaaS styles built-in",
    },
    {
      title: "Smart Market Sizing",
      description: "AI estimates TAM/SAM/SOM with defensible methodology",
    },
    {
      title: "Real-time Editing",
      description: "Refine every slide with AI assistance",
    },
    {
      title: "Export to PDF",
      description: "Download investor-ready decks instantly",
    },
    {
      title: "Data Integration",
      description: "Pull metrics from your spreadsheets",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Pitch Deck Generator</h1>
        </div>
        <p className="text-white/60 text-base">
          Create investor-ready pitch decks in minutes. Powered by Claude AI to generate compelling narratives, market sizing, and financial projections.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Start */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-xl font-semibold text-white">
                Generate Your Deck
              </h2>
            </div>
            <p className="text-white/60 mb-4">
              Describe your business and we'll create a complete 10-slide pitch deck with compelling content tailored to your company.
            </p>
            <button
              onClick={() => setShowEditor(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Start Building Pitch Deck
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Example Prompts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Example Businesses
            </h3>
            <div className="grid gap-4">
              {examples.map((example, index) => {
                const Icon = example.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setInitialDescription(example.description);
                      setShowEditor(true);
                    }}
                    className="text-left p-5 rounded-xl bg-surface-2 hover:bg-surface-2/80 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white mb-1 group-hover:text-white transition-colors">
                          {example.title}
                        </h4>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {example.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What You Get */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              What You'll Get
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Cover & Company Overview
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Professional title slide with your logo and tagline
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Problem Statement
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Compelling narrative about the pain you're solving
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Solution & Product
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Clear explanation of your unique approach
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Market Size & Opportunity
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    TAM/SAM/SOM with defensible methodology
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">5</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Business Model & Traction
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Revenue model, unit economics, and key metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-400">+</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Competition, Team, Financials & The Ask
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    5 more slides completing your investor narrative
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Features */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40 mt-2" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-6 rounded-xl bg-surface-2 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Pro Tips
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>
                💡 Be specific about your traction and metrics - the AI will
                incorporate real numbers into your deck
              </p>
              <p>
                🎯 Mention your target market and ICP (ideal customer profile)
                for better market sizing
              </p>
              <p>
                📊 If you have financial data, include it - the AI can generate
                projection slides
              </p>
              <p>
                ✨ Use the AI assistant to refine any slide after generation
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-white">10-15 min</div>
                <div className="text-xs text-white/60 mt-1">
                  Average time to create a complete deck
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10 slides</div>
                <div className="text-xs text-white/60 mt-1">
                  Standard investor deck structure
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4 templates</div>
                <div className="text-xs text-white/60 mt-1">
                  Professional styles to choose from
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

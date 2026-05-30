# Nanowork Onboarding Improvements

**Focus:** First-Run Experience for New Users  
**Goal:** Zero-to-first-build in under 10 minutes with high confidence  
**Success Metric:** 80%+ of signups complete first build within 24 hours

---

## Current State Analysis

### The Problem

New users signing up for Nanowork currently experience:

1. **Sign up form** (Login.tsx) - ✅ Clean, works well
2. **Immediate redirect to Create.tsx** - ❌ Empty prompt box, no guidance
3. **Zero context** about:
   - What the 7 AI departments do
   - How credits work
   - What a "build" actually produces
   - How long it will take
   - What happens next

**Result:** Users face blank slate anxiety and either:
- Write vague prompts that produce poor results
- Navigate away to explore other features
- Leave the platform entirely

### User Research Insights

From UX best practices and competitor analysis:

**What works in successful onboarding:**
- Duolingo: Immediate value (learn first word in 30 seconds)
- Figma: Interactive tutorial with real design task
- Stripe: Clear progress indicators for setup
- Notion: Template gallery as starting point
- Replit: Example projects to fork and modify

**What doesn't work:**
- Video tutorials users skip
- Long text explanations
- Feature tours without hands-on practice
- Delayed activation (setup before trying product)

---

## Proposed Onboarding Flow

### Overview: 3-Step Progressive Onboarding

1. **Welcome & Choose Your Path** (30 seconds)
2. **Guided First Build** (3-5 minutes)
3. **Review & Iterate** (2-3 minutes)

**Total time to first value:** ~10 minutes  
**User control:** Can skip to dashboard at any time

---

## Step 1: Welcome & Choose Your Path

### Design

```tsx
// apps/web/src/components/onboarding/WelcomeStep.tsx

import { Sparkles, Building2, BookOpen, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomeStep() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<'build' | 'claim' | 'learn' | null>(null);

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fintech-navy mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-fintech-navy mb-4">
            Welcome to Nanowork
          </h1>
          <p className="text-lg text-fintech-slate max-w-2xl mx-auto leading-relaxed">
            You now have access to 7 AI departments that will build your business from idea to launch.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-fintech-navy mb-1">7</div>
            <div className="text-sm text-fintech-slate">AI Departments</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-fintech-navy mb-1">48hrs</div>
            <div className="text-sm text-fintech-slate">Avg Build Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-fintech-navy mb-1">100</div>
            <div className="text-sm text-fintech-slate">Free Credits</div>
          </div>
        </div>

        {/* Path Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-fintech-navy text-center mb-6">
            How would you like to get started?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Build from Scratch */}
            <button
              onClick={() => setSelectedPath('build')}
              className={`p-6 border-2 transition-all text-left ${
                selectedPath === 'build'
                  ? 'border-fintech-navy bg-fintech-navy/5'
                  : 'border-fintech-border bg-surface-1 hover:border-fintech-navy/50'
              }`}
            >
              <div className="w-12 h-12 bg-fintech-navy/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-fintech-navy" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-2">
                Build from Scratch
              </h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Describe your vision and AI creates everything custom for you
              </p>
            </button>

            {/* Claim Pre-Built */}
            <button
              onClick={() => setSelectedPath('claim')}
              className={`p-6 border-2 transition-all text-left ${
                selectedPath === 'claim'
                  ? 'border-fintech-navy bg-fintech-navy/5'
                  : 'border-fintech-border bg-surface-1 hover:border-fintech-navy/50'
              }`}
            >
              <div className="w-12 h-12 bg-fintech-green/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-fintech-green" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-2">
                Claim Pre-Built Business
              </h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                Start with a proven business model and customize to your needs
              </p>
            </button>

            {/* Learn First */}
            <button
              onClick={() => setSelectedPath('learn')}
              className={`p-6 border-2 transition-all text-left ${
                selectedPath === 'learn'
                  ? 'border-fintech-navy bg-fintech-navy/5'
                  : 'border-fintech-border bg-surface-1 hover:border-fintech-navy/50'
              }`}
            >
              <div className="w-12 h-12 bg-purple-500/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-fintech-navy mb-2">
                Take a Tour First
              </h3>
              <p className="text-sm text-fintech-slate leading-relaxed">
                See how Nanowork works with an interactive demo
              </p>
            </button>
          </div>
        </div>

        {/* Continue Button */}
        {selectedPath && (
          <div className="text-center">
            <button
              onClick={() => {
                if (selectedPath === 'build') navigate('/onboarding/build');
                if (selectedPath === 'claim') navigate('/marketplace');
                if (selectedPath === 'learn') navigate('/onboarding/tour');
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-fintech-navy hover:bg-fintech-navy/90 text-white font-medium transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Skip Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-fintech-slate hover:text-fintech-navy transition-colors"
          >
            Skip onboarding and explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Why This Works

1. **Immediate context:** Users see what they have access to (7 departments, credits, avg time)
2. **Clear choices:** Three paths match different user types
3. **Low commitment:** Can skip at any time
4. **Visual hierarchy:** Cards make it easy to scan and choose
5. **Progress indication:** Users know this is step 1 of a flow

---

## Step 2A: Guided First Build (Build from Scratch Path)

### Design

```tsx
// apps/web/src/components/onboarding/GuidedBuildStep.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, ArrowRight, Copy } from "lucide-react";

const EXAMPLE_PROMPTS = [
  {
    category: "E-commerce",
    prompt: "An online store for handmade ceramics with Shopify-style product pages, Stripe checkout, inventory management, and automated order confirmation emails. Target market: home decor enthusiasts aged 25-45.",
    why: "Specific product, clear tech requirements, defined audience"
  },
  {
    category: "SaaS",
    prompt: "A project management tool for freelance designers with client project boards, time tracking, invoice generation via Stripe, and client portal for review/approval. Simpler than Asana, prettier than Trello.",
    why: "Solves specific problem, mentions integrations, references competitors"
  },
  {
    category: "Marketplace",
    prompt: "A local service marketplace connecting homeowners with verified landscaping contractors. Booking calendar, secure payments, review system, contractor verification process. Think Thumbtack but for landscaping only.",
    why: "Niche focus, clear user flows, trust features specified"
  }
];

export default function GuidedBuildStep() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const handleExampleClick = (index: number) => {
    setSelectedExample(index);
    setPrompt(EXAMPLE_PROMPTS[index].prompt);
  };

  const handleSubmit = async () => {
    // Create build and navigate to BuilderView
    // ... implementation from Create.tsx
  };

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-fintech-slate mb-2">
            <span className="text-fintech-navy font-medium">Step 2 of 3</span>
            <span>—</span>
            <span>Your First Build</span>
          </div>
          <div className="h-1 bg-surface-1 w-full">
            <div className="h-full bg-fintech-navy w-2/3 transition-all" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-fintech-navy mb-3">
            Describe what you want to build
          </h1>
          <p className="text-lg text-fintech-slate">
            The more specific you are, the better results you'll get. Include your target customer, key features, and any tech requirements.
          </p>
        </div>

        {/* Examples Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fintech-navy">
              Try an example to get started
            </h2>
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-sm text-fintech-slate hover:text-fintech-navy"
            >
              {showTips ? 'Hide tips' : 'Show tips'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(index)}
                className={`p-4 border-2 text-left transition-all ${
                  selectedExample === index
                    ? 'border-fintech-navy bg-fintech-navy/5'
                    : 'border-fintech-border bg-surface-1 hover:border-fintech-navy/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-fintech-navy uppercase">
                    {example.category}
                  </span>
                  <Copy className="w-4 h-4 text-fintech-slate" />
                </div>
                <p className="text-sm text-fintech-slate line-clamp-3">
                  {example.prompt}
                </p>
              </button>
            ))}
          </div>

          {showTips && selectedExample !== null && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Why this prompt works well:
                  </p>
                  <p className="text-sm text-green-800">
                    {EXAMPLE_PROMPTS[selectedExample].why}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Input */}
        <div className="mb-6">
          <label htmlFor="build-prompt" className="block text-sm font-medium text-fintech-navy mb-3">
            Your build prompt
          </label>
          <textarea
            id="build-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your business idea in detail..."
            className="w-full h-48 px-4 py-3 bg-surface-1 border-2 border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-fintech-slate">
              {prompt.length} characters
            </span>
            <span className="text-xs text-fintech-slate">
              {prompt.length < 100 ? '⚠️ Add more detail for better results' : '✓ Good length'}
            </span>
          </div>
        </div>

        {/* Quality Checklist */}
        {prompt.length > 50 && (
          <div className="mb-8 p-6 bg-surface-1 border border-fintech-border">
            <h3 className="text-sm font-semibold text-fintech-navy mb-4">
              Prompt quality checklist
            </h3>
            <div className="space-y-3">
              {[
                { check: prompt.toLowerCase().includes('target') || prompt.toLowerCase().includes('customer') || prompt.toLowerCase().includes('user'), label: 'Describes target customer' },
                { check: prompt.split('.').length >= 3, label: 'Includes multiple features/details' },
                { check: /stripe|payment|billing|checkout/i.test(prompt), label: 'Mentions payment/monetization' },
                { check: prompt.length >= 150, label: 'Sufficient detail (150+ characters)' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    item.check ? 'bg-green-100 text-green-600' : 'bg-surface-0 border-2 border-fintech-border'
                  }`}>
                    {item.check && '✓'}
                  </div>
                  <span className={`text-sm ${
                    item.check ? 'text-fintech-navy' : 'text-fintech-slate'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            What happens when you start building:
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>7 AI departments will begin working on your project in parallel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>You'll see real-time progress as each department completes their work</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Typical build takes 2-4 hours (you can close the page and come back)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>This build will use approximately 30-40 of your 100 free credits</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-sm text-fintech-slate hover:text-fintech-navy"
          >
            ← Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={prompt.length < 100}
            className="inline-flex items-center gap-2 px-8 py-3 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Start Building
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Why This Works

1. **Example-driven learning:** Users learn by seeing good examples first
2. **Quality feedback:** Real-time checklist shows what makes a good prompt
3. **Expectation setting:** Clear explanation of what happens next
4. **Low anxiety:** Users know the cost and time commitment upfront
5. **Progressive disclosure:** Tips appear contextually as user types

---

## Step 2B: Interactive Tour (Learn First Path)

### Design

For users who chose "Take a Tour First", show the DemoFlow.tsx experience but make it:

1. **More contextual:** Explain what each agent does as it appears
2. **Interactive:** Let users click agents to see what they produce
3. **Skippable:** Can jump to real build at any time
4. **Faster:** Compress 3-minute demo to 90 seconds

```tsx
// apps/web/src/components/onboarding/InteractiveTour.tsx

export default function InteractiveTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const tourSteps = [
    {
      title: "Meet Your AI Team",
      content: "You have 7 specialized AI departments that work together to build your business",
      visual: <AgentGrid preview={true} />
    },
    {
      title: "Watch Them Work",
      content: "See agents execute in real-time with clear progress and deliverables",
      visual: <BuildProgressDemo />
    },
    {
      title: "Get Complete Deliverables",
      content: "Documents, financials, pitch deck, and deployment-ready code",
      visual: <DeliverablesPreview />
    }
  ];

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {tourSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? 'w-8 bg-fintech-navy' : 'bg-fintech-border'
              }`}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-fintech-navy mb-4">
            {tourSteps[currentStep].title}
          </h2>
          <p className="text-lg text-fintech-slate max-w-2xl mx-auto">
            {tourSteps[currentStep].content}
          </p>
        </div>

        {/* Visual */}
        <div className="mb-12">
          {tourSteps[currentStep].visual}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-sm text-fintech-slate hover:text-fintech-navy"
          >
            ← Back to Start
          </button>

          <div className="flex items-center gap-4">
            {currentStep === tourSteps.length - 1 ? (
              <button
                onClick={() => navigate('/onboarding/build')}
                className="px-8 py-3 bg-fintech-navy hover:bg-fintech-navy/90 text-white font-medium"
              >
                Start Your First Build
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/onboarding/build')}
                  className="text-sm text-fintech-slate hover:text-fintech-navy"
                >
                  Skip tour
                </button>
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-fintech-navy hover:bg-fintech-navy/90 text-white font-medium"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 3: First Build Complete - Celebrate & Guide

### Design

When user's first build completes, show celebration and guide to next steps:

```tsx
// apps/web/src/components/onboarding/BuildCompleteStep.tsx

import { CheckCircle, FileText, Table, Presentation, Settings, Sparkles } from "lucide-react";
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function BuildCompleteStep({ build }: { build: Build }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-surface-0 border border-fintech-border shadow-card-xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 border-2 border-green-500 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-semibold text-fintech-navy mb-3">
            Your business is ready!
          </h2>
          <p className="text-lg text-fintech-slate">
            All 7 departments completed their work. Here's what you got:
          </p>
        </div>

        {/* Deliverables Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-surface-1 border border-fintech-border">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-fintech-navy">Documents</span>
            </div>
            <p className="text-sm text-fintech-slate">
              Market research, product specs, marketing strategy, legal guidance
            </p>
          </div>

          <div className="p-4 bg-surface-1 border border-fintech-border">
            <div className="flex items-center gap-3 mb-2">
              <Table className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-fintech-navy">Financial Model</span>
            </div>
            <p className="text-sm text-fintech-slate">
              3-year projections, pricing strategy, funding requirements
            </p>
          </div>

          <div className="p-4 bg-surface-1 border border-fintech-border">
            <div className="flex items-center gap-3 mb-2">
              <Presentation className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-fintech-navy">Pitch Deck</span>
            </div>
            <p className="text-sm text-fintech-slate">
              Investor-ready presentation with all key slides
            </p>
          </div>

          <div className="p-4 bg-surface-1 border border-fintech-border">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-fintech-navy">Technical Spec</span>
            </div>
            <p className="text-sm text-fintech-slate">
              Architecture, tech stack, database design, deployment guide
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">
            Recommended next steps:
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-blue-800">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <div>
                <strong>Review documents</strong> — Read the market research and business plan to validate assumptions
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-blue-800">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <div>
                <strong>Request changes</strong> — Found something you want different? Ask AI to iterate
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-blue-800">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <div>
                <strong>Export & share</strong> — Download PDFs, share with your team, or send to investors
              </div>
            </li>
          </ol>
        </div>

        {/* Credit Summary */}
        <div className="mb-8 flex items-center justify-between p-4 bg-surface-1 border border-fintech-border">
          <div>
            <p className="text-sm text-fintech-slate">Credits used for this build</p>
            <p className="text-xl font-semibold text-fintech-navy">
              {build.creditsUsed} credits
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-fintech-slate">Remaining balance</p>
            <p className="text-xl font-semibold text-fintech-navy">
              {100 - build.creditsUsed} credits
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/dashboard/builder/${build.id}`)}
            className="flex-1 py-3 bg-fintech-navy hover:bg-fintech-navy/90 text-white font-medium transition-colors"
          >
            View Full Build
          </button>
          <button
            onClick={() => {
              localStorage.setItem('onboarding_complete', 'true');
              navigate('/dashboard');
            }}
            className="flex-1 py-3 border border-fintech-border hover:bg-surface-1 text-fintech-navy font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Dismiss */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              localStorage.setItem('onboarding_complete', 'true');
              navigate('/dashboard');
            }}
            className="text-sm text-fintech-slate hover:text-fintech-navy"
          >
            I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Implementation Guide

### Phase 1: Core Onboarding (Week 1)

1. **Create onboarding routes:**
```tsx
// In App.tsx
<Route path="/onboarding">
  <Route index element={<WelcomeStep />} />
  <Route path="build" element={<GuidedBuildStep />} />
  <Route path="tour" element={<InteractiveTour />} />
</Route>
```

2. **Add onboarding check to AuthContext:**
```tsx
// In AuthContext.tsx
const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
  localStorage.getItem('onboarding_complete') === 'true'
);

// Redirect new users to onboarding
useEffect(() => {
  if (isAuthenticated && !hasCompletedOnboarding && !isLoading) {
    navigate('/onboarding');
  }
}, [isAuthenticated, hasCompletedOnboarding, isLoading]);
```

3. **Build components:**
   - WelcomeStep.tsx
   - GuidedBuildStep.tsx
   - InteractiveTour.tsx
   - BuildCompleteStep.tsx

### Phase 2: Polish & Testing (Week 2)

1. **Add analytics tracking:**
```tsx
// Track onboarding progress
const trackOnboardingStep = (step: string) => {
  // Use Posthog, Amplitude, or similar
  analytics.track('Onboarding Step Viewed', {
    step,
    timestamp: Date.now()
  });
};
```

2. **A/B test variations:**
   - Test 3 examples vs 6 examples
   - Test checklist vs no checklist
   - Test confetti vs no confetti

3. **Add skip handling:**
```tsx
// Allow users to skip but track it
const handleSkip = () => {
  analytics.track('Onboarding Skipped', { step: currentStep });
  localStorage.setItem('onboarding_skipped', 'true');
  navigate('/dashboard');
};
```

### Phase 3: Ongoing Optimization

1. **Monitor metrics:**
   - % of users who complete onboarding
   - Time to first build
   - Drop-off points in flow
   - Path selection distribution

2. **Iterate based on data:**
   - If users skip tour: make it shorter
   - If users abandon at prompt: add more examples
   - If builds fail: improve prompt quality checker

---

## Success Metrics

### Primary Metrics
- **Onboarding completion rate:** Target 80%+
- **Time to first build:** Target <10 minutes median
- **First build success rate:** Target 90%+
- **7-day retention:** Target 60%+ (up from estimated 40% baseline)

### Secondary Metrics
- **Path distribution:** How many choose each path?
- **Example usage rate:** Do users copy examples or write own?
- **Checklist impact:** Do users with 4/4 checks have better build outcomes?
- **Celebration modal engagement:** Do users click through deliverables?

---

## Copy & Messaging Guidelines

### Tone
- **Encouraging but not patronizing:** "You're on the right track" not "Great job!"
- **Clear over clever:** "Start Building" not "Let's Go!"
- **Specific over vague:** "Takes 2-4 hours" not "Won't take long"

### Word Choices
- ✅ "Build" (verb) — active, empowering
- ✅ "Business" — aspirational, clear
- ✅ "Departments" — familiar metaphor
- ❌ "Generate" — sounds passive
- ❌ "AI Agent" — too technical
- ❌ "Workflow" — corporate jargon

### Examples of Good Copy
- "Describe what you want to build" (clear action)
- "All 7 departments completed their work" (celebratory, clear)
- "This build will use approximately 30-40 of your 100 free credits" (transparent)

### Examples of Bad Copy
- "Let's get you set up!" (vague, patronizing)
- "Configure your preferences" (intimidating, unclear)
- "Processing your request" (robotic, impersonal)

---

## Edge Cases & Error Handling

### What if user closes browser during onboarding?
- Save progress to localStorage
- Resume from last completed step on return
- Show banner: "Welcome back! Pick up where you left off"

### What if user's first build fails?
- Show empathetic error message
- Offer to retry automatically
- Suggest simpler prompt if original was complex
- Don't count failed build toward credit usage

### What if user wants to change path mid-flow?
- Add "Change approach" button in header
- Confirm before abandoning current progress
- Don't lose draft prompt data

### What if user has claimed business pending?
- Detect from localStorage
- Show modified welcome screen
- Skip path selection, go straight to claim completion

---

## Mobile Considerations

### Welcome Step
- Stack path cards vertically on mobile
- Reduce padding to fit more on screen
- Make touch targets 44px minimum

### Guided Build Step
- Collapse example cards to single column
- Make textarea full-width on mobile
- Move checklist below textarea instead of beside

### Build Complete Step
- Show deliverables in single column
- Reduce modal padding on small screens
- Make CTA buttons stack vertically

---

## Accessibility

### Keyboard Navigation
- All path selection cards keyboard accessible
- Tab order flows logically through steps
- Enter key submits forms

### Screen Readers
- Announce progress through steps
- Label all form inputs clearly
- Provide skip links

### Visual
- Maintain WCAG AA contrast ratios
- Don't rely only on color for checklist states
- Ensure text is readable at 200% zoom

---

## Localization Notes

For future international expansion:

1. **Extract all copy to i18n files**
2. **Make example prompts culturally neutral**
3. **Use relative time formats** (not "2-4 hours" everywhere)
4. **Test with longer translations** (German is ~30% longer than English)

---

## Competitive Inspiration

**What we can learn from:**

- **Notion:** Template gallery is primary onboarding path
- **Figma:** Interactive tutorial teaches by doing
- **Stripe:** Clear progress indicator reduces anxiety
- **Duolingo:** Immediate small win builds confidence
- **Replit:** Example projects lower barrier to entry

**What to avoid:**

- **Long video tutorials** that users skip
- **Feature tours** that just click through UI
- **Walls of text** explaining features
- **Required setup** before seeing value

---

## Appendix: Research References

1. **Nielsen Norman Group - Onboarding Best Practices**
   - Progressive disclosure principle
   - Show, don't tell approach
   - Defer sign-up until after value demonstration

2. **Intercom - Product Tours Research**
   - 90% of users skip product tours
   - Interactive tours have 3x completion rate
   - Contextual help beats upfront education

3. **Appcues - Onboarding Benchmarks**
   - Average SaaS onboarding: 5-7 screens
   - Optimal time to first value: <10 minutes
   - 70% drop-off if >3 required fields

4. **User Onboarding - Case Studies**
   - Example-driven learning increases completion 40%
   - Real-time validation reduces errors 60%
   - Celebration moments increase retention 25%

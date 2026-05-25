/**
 * INTEGRATION EXAMPLE - How to add CompanyShowcase to Home.tsx
 *
 * This file shows the exact changes needed to integrate the Company Showcase
 * component into the homepage, replacing the Department Grid section.
 */

// ──────────────────────────────────────────────────────────────────────────────
// STEP 1: Add imports at the top of Home.tsx
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Terminal, Building2, Shield } from "lucide-react";

// ADD THESE TWO LINES:
import CompanyShowcase from "../components/CompanyShowcase";
// Optional: if you want the modal functionality
// import ClaimCompanyModal from "../components/ClaimCompanyModal";

// ──────────────────────────────────────────────────────────────────────────────
// STEP 2: Replace the Department Grid section (lines 366-379)
// ──────────────────────────────────────────────────────────────────────────────

// BEFORE (REMOVE THIS):
/*
<section className="py-8 sm:py-12">
  <div className="mb-4 sm:mb-6">
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] sm:text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
        Your Autonomous Team
      </span>
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[10px] sm:text-xs font-mono text-green-400 whitespace-nowrap">7 DEPARTMENTS</span>
    </div>
  </div>

  <DepartmentGrid />
</section>
*/

// AFTER (ADD THIS):
<CompanyShowcase />

// ──────────────────────────────────────────────────────────────────────────────
// ALTERNATIVE: Keep both sections (if you want departments AND showcase)
// ──────────────────────────────────────────────────────────────────────────────

/*
<section className="py-8 sm:py-12">
  <div className="mb-4 sm:mb-6">
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] sm:text-xs font-mono font-bold text-white/40 uppercase tracking-wider">
        Your Autonomous Team
      </span>
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[10px] sm:text-xs font-mono text-green-400 whitespace-nowrap">7 DEPARTMENTS</span>
    </div>
  </div>

  <DepartmentGrid />
</section>

<!-- ADD COMPANY SHOWCASE BELOW -->
<CompanyShowcase />
*/

// ──────────────────────────────────────────────────────────────────────────────
// COMPLETE MODIFIED Home.tsx MAIN SECTION (for reference)
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header - Terminal style */}
      <header className="sticky top-0 z-50 bg-surface-0 border-b border-white/10">
        {/* ... existing header code ... */}
      </header>

      {/* Stock Ticker */}
      <StockTicker />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6">
        {/* Hero Section - Dense, terminal-style */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white uppercase tracking-tight mb-3 sm:mb-4">
              Turn Your Idea Into a Company
            </h1>
            <p className="text-xs sm:text-sm font-mono text-white/70 max-w-3xl leading-relaxed">
              Seven AI departments work 24/7 to build your business. Legal, brand, web, marketing, sales, finance, and ops—all autonomous, all running in parallel. One prompt starts everything.
            </p>
          </div>

          <TerminalPrompt />
        </section>

        {/* ────────────────────────────────────────────────────────────────
            REPLACE THIS SECTION ↓↓↓
            ──────────────────────────────────────────────────────────────── */}

        {/* Company Showcase - NEW */}
        <CompanyShowcase />

        {/* ────────────────────────────────────────────────────────────────
            END REPLACEMENT ↑↑↑
            ──────────────────────────────────────────────────────────────── */}

        {/* Enterprise Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          {/* ... existing enterprise section code ... */}
        </section>

        {/* CTA - Terminal command style */}
        <section className="py-8 sm:py-12 lg:py-16">
          {/* ... existing CTA section code ... */}
        </section>
      </main>

      {/* Footer - Professional with competitors section */}
      <footer className="border-t border-white/10 mt-8 sm:mt-12 lg:mt-16">
        {/* ... existing footer code ... */}
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// OPTIONAL: Add modal state for company claiming (advanced)
// ──────────────────────────────────────────────────────────────────────────────

/*
If you want to handle claims with a modal instead of navigation:

1. Import the modal:
   import ClaimCompanyModal from "../components/ClaimCompanyModal";

2. Add state in Home component:
   const [selectedCompany, setSelectedCompany] = useState<AICompany | null>(null);

3. Modify CompanyShowcase to accept onClaim prop:
   <CompanyShowcase onClaim={(company) => setSelectedCompany(company)} />

4. Render modal:
   {selectedCompany && (
     <ClaimCompanyModal
       company={selectedCompany}
       isOpen={!!selectedCompany}
       onClose={() => setSelectedCompany(null)}
     />
   )}
*/

// ──────────────────────────────────────────────────────────────────────────────
// STYLING NOTES
// ──────────────────────────────────────────────────────────────────────────────

/*
The component uses your existing design system:
- Colors: surface-0/1/2/3 hierarchy
- Typography: font-mono with uppercase tracking
- Spacing: Consistent with existing card system
- Borders: border-white/10 standard
- Shadows: card, card-lg classes
- Animations: animate-pulse for status dots

No additional CSS needed - everything uses Tailwind utilities from your config.
*/

// ──────────────────────────────────────────────────────────────────────────────
// RESPONSIVE BREAKPOINTS
// ──────────────────────────────────────────────────────────────────────────────

/*
Mobile (<768px):     1 column
Tablet (768-1024px): 2 columns
Desktop (1024px+):   3 columns
XL Desktop (1280px+): 4 columns

Filters scroll horizontally on mobile, full width on desktop.
Stats in header hide on mobile, show on lg breakpoint.
*/

// ──────────────────────────────────────────────────────────────────────────────
// TESTING CHECKLIST
// ──────────────────────────────────────────────────────────────────────────────

/*
After integration, test:

1. Visual:
   [ ] Component renders without errors
   [ ] Spacing matches rest of homepage
   [ ] Colors consistent with design system
   [ ] Typography uses monospace everywhere

2. Interaction:
   [ ] Category filters work
   [ ] Hover effects only on available companies
   [ ] CTA buttons navigate correctly
   [ ] "Build Custom" scrolls to top

3. Responsive:
   [ ] Mobile: 1 column layout
   [ ] Tablet: 2 column layout
   [ ] Desktop: 3-4 column layout
   [ ] Filters scroll on mobile

4. States:
   [ ] Available companies show green dot
   [ ] Building companies show progress
   [ ] Claimed companies are disabled
   [ ] Empty state shows when filtered

5. Performance:
   [ ] No layout shift on load
   [ ] Smooth filtering (no lag)
   [ ] No console errors
*/

// ──────────────────────────────────────────────────────────────────────────────
// NEXT STEPS
// ──────────────────────────────────────────────────────────────────────────────

/*
1. IMMEDIATE:
   - Add CompanyShowcase to Home.tsx
   - Test on different screen sizes
   - Verify design consistency

2. SHORT-TERM:
   - Create /claim/:id route
   - Implement claim flow
   - Add authentication check

3. BACKEND:
   - Create companies table in database
   - Build API endpoints (GET /api/companies, POST /api/companies/:id/claim)
   - Add admin panel for managing companies

4. ENHANCEMENTS:
   - Add search functionality
   - Implement real-time status updates
   - Add user wishlist feature
   - Build detailed company pages
*/

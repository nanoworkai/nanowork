# Pitch Deck Generator - Testing Guide

## Test Environment Setup

### Prerequisites
1. Local development environment running
2. Backend worker running on `http://localhost:8787`
3. Frontend running on `http://localhost:5173`
4. Valid `ANTHROPIC_API_KEY` set in environment
5. Authenticated user session

### Quick Start
```bash
# Terminal 1 - Start worker
cd apps/worker
npx wrangler dev

# Terminal 2 - Start frontend
cd apps/web
npm run dev
```

## Test Cases

### 1. Navigation & Access

**Test 1.1: Access from Dashboard**
- [ ] Navigate to `/dashboard`
- [ ] Verify "PITCH DECK" appears in sidebar navigation
- [ ] Click "PITCH DECK" link
- [ ] Verify URL changes to `/dashboard/pitch-deck`
- [ ] Verify landing page loads with header and examples

**Test 1.2: Direct URL Access**
- [ ] Navigate directly to `/dashboard/pitch-deck`
- [ ] Verify page loads (requires authentication)
- [ ] If not logged in, verify redirect to login

### 2. Deck Generation

**Test 2.1: Minimal Input**
```
Business Description: "Building a B2B SaaS platform for sales automation. 
Helps teams close deals faster with AI."
```
- [ ] Enter only business description
- [ ] Leave company name, tagline, target raise blank
- [ ] Click "Generate Pitch Deck"
- [ ] Verify loading state appears
- [ ] Wait 20-40 seconds for generation
- [ ] Verify 10 slides created
- [ ] Verify AI suggested company name
- [ ] Verify AI generated tagline
- [ ] Check all slides have content

**Test 2.2: Full Input**
```
Business Description: "Building a marketplace connecting freelance developers 
with startups. Currently at $50K MRR with 500 active developers. Strong 
network effects and 30% month-over-month growth."

Company Name: "DevMarket"
Tagline: "Where startups find elite developers"
Target Raise: "$2M Seed Round"
```
- [ ] Enter all fields
- [ ] Click "Generate Pitch Deck"
- [ ] Verify generation completes
- [ ] Verify company name is "DevMarket"
- [ ] Verify tagline is used
- [ ] Verify "The Ask" slide mentions $2M
- [ ] Verify traction slide includes $50K MRR

**Test 2.3: Complex Business (Fintech)**
```
Business Description: "Launching a neobank for freelancers and gig workers. 
Features: instant payments, automatic tax withholding, invoicing, expense 
tracking. 10,000 person waitlist. Partnership with Visa secured. Seed funded 
by Y Combinator. Raising Series A to expand to 5 new markets."

Company Name: "FlexPay"
Tagline: "Banking built for freelancers"
Target Raise: "$10M Series A"
```
- [ ] Generate deck
- [ ] Verify problem statement is specific to freelancers
- [ ] Verify solution mentions key features
- [ ] Verify traction slide includes waitlist size
- [ ] Verify team slide mentions YC
- [ ] Verify market sizing is relevant to fintech/banking

### 3. Editor Functionality

**Test 3.1: Slide Navigation**
- [ ] Generate a deck
- [ ] Verify slide navigator shows all 10 slides
- [ ] Click each slide thumbnail
- [ ] Verify content area updates
- [ ] Use "Previous" button at start (should be disabled)
- [ ] Use "Next" button through all slides
- [ ] Use "Next" at end (should be disabled)
- [ ] Verify current slide is highlighted in navigator

**Test 3.2: Content Editing**
- [ ] Navigate to Problem slide (slide 2)
- [ ] Edit the title field
- [ ] Verify changes appear immediately
- [ ] Edit the main content textarea
- [ ] Verify changes persist when navigating away and back
- [ ] Edit bullet points
- [ ] Add/remove text from bullets
- [ ] Verify all changes are preserved

**Test 3.3: View Modes**
- [ ] Start in Edit mode
- [ ] Toggle to Preview mode
- [ ] Verify slide appears in presentation format
- [ ] Check template styling is applied
- [ ] Navigate to different slides in Preview
- [ ] Toggle back to Edit mode
- [ ] Verify editor fields are populated

### 4. Template System

**Test 4.1: Template Selection**
- [ ] Start with default YC template
- [ ] Switch to Sequoia template
- [ ] Verify preview updates (if in Preview mode)
- [ ] Switch to Modern SaaS template
- [ ] Switch to Corporate template
- [ ] Verify each template has distinct styling
- [ ] Check all templates work in Preview mode

**Test 4.2: Template Persistence**
- [ ] Select Sequoia template
- [ ] Navigate through multiple slides
- [ ] Verify template stays Sequoia
- [ ] Switch to Preview mode
- [ ] Verify template styling is consistent

### 5. AI Assistant

**Test 5.1: Basic Improvement**
- [ ] Navigate to Problem slide
- [ ] Click "AI Assistant" button
- [ ] Panel opens on right side
- [ ] Enter instruction: "Make this more compelling"
- [ ] Click "Improve"
- [ ] Wait for AI response (5-10 seconds)
- [ ] Verify slide content updates
- [ ] Verify improvement is contextual
- [ ] Panel closes after improvement

**Test 5.2: Specific Instructions**
Test these instructions on different slides:
- [ ] "Add more specific data and numbers"
- [ ] "Rewrite for B2B enterprise audience"
- [ ] "Make this more concise"
- [ ] "Emphasize our competitive advantages"
- [ ] "Focus on ROI and business value"

**Test 5.3: Quick Actions**
- [ ] Open AI Assistant panel
- [ ] Click "Add more data" quick action
- [ ] Verify instruction is filled
- [ ] Click "Make more compelling" quick action
- [ ] Click "Simplify" quick action
- [ ] Test each quick action actually improves slide

**Test 5.4: Error Handling**
- [ ] Open AI Assistant
- [ ] Leave instruction empty
- [ ] Click "Improve" (should be disabled)
- [ ] Enter very long instruction (>1000 chars)
- [ ] Verify it processes or shows error gracefully

### 6. Export Functionality

**Test 6.1: PDF Export**
- [ ] Complete a deck
- [ ] Click "Export PDF" button
- [ ] Verify new window/tab opens
- [ ] Check print preview appears
- [ ] Verify all 10 slides are present
- [ ] Check template styling is applied
- [ ] Verify slide dimensions look correct (16:9)
- [ ] Print to PDF or cancel
- [ ] Verify original editor still works

**Test 6.2: Markdown Export**
- [ ] Hover over "Export PDF" button
- [ ] Click "Export as Markdown" from dropdown
- [ ] Verify download starts
- [ ] Open downloaded `.md` file
- [ ] Check format:
  - [ ] Company name as title
  - [ ] Slide titles as headers
  - [ ] Bullets formatted correctly
  - [ ] Data preserved
- [ ] Verify file can be imported to Deckset/Marp

**Test 6.3: JSON Export**
- [ ] Click "Export as JSON"
- [ ] Verify download starts
- [ ] Open downloaded `.json` file
- [ ] Verify valid JSON structure
- [ ] Check all fields present:
  - [ ] id
  - [ ] companyName
  - [ ] tagline
  - [ ] slides array
  - [ ] template
  - [ ] timestamps
- [ ] Verify all slide content is intact

### 7. Error Scenarios

**Test 7.1: Empty Business Description**
- [ ] Leave business description blank
- [ ] Try to generate
- [ ] Verify button is disabled
- [ ] Or verify error message appears

**Test 7.2: API Failure**
- [ ] Stop worker (simulate API down)
- [ ] Try to generate deck
- [ ] Verify error message appears
- [ ] Message should be user-friendly
- [ ] No crashes or blank screens

**Test 7.3: Invalid API Key**
- [ ] Set invalid ANTHROPIC_API_KEY
- [ ] Try to generate deck
- [ ] Verify fallback behavior or error message
- [ ] Restart worker with valid key
- [ ] Verify system recovers

**Test 7.4: Network Issues**
- [ ] Generate deck
- [ ] During generation, disable network
- [ ] Verify timeout handling
- [ ] Verify error message
- [ ] Re-enable network
- [ ] Verify can retry

### 8. Edge Cases

**Test 8.1: Very Long Input**
```
Business Description: [5000+ character description with detailed features, 
metrics, team bios, competitive analysis, financial projections, etc.]
```
- [ ] Enter extremely long description
- [ ] Verify generation still works
- [ ] Or verify character limit with helpful message
- [ ] Check if content is truncated intelligently

**Test 8.2: Special Characters**
```
Business Description: "Company: Acme™ & Co. Building "smart" AI for $$$. 
Revenue: €100K/month. Market: 50% < competitors. <script>alert('test')</script>"
```
- [ ] Include special chars, currencies, HTML
- [ ] Verify generation handles safely
- [ ] Check exported content is escaped properly
- [ ] Verify no XSS vulnerabilities

**Test 8.3: Rapid Actions**
- [ ] Generate deck
- [ ] Rapidly click between slides
- [ ] Rapidly edit multiple fields
- [ ] Rapidly open/close AI panel
- [ ] Verify no race conditions or crashes

**Test 8.4: Mobile/Responsive**
- [ ] Resize browser to mobile width
- [ ] Verify layout adapts
- [ ] Check slide navigator behavior
- [ ] Test editing on mobile
- [ ] Verify export works on mobile

### 9. Performance

**Test 9.1: Generation Speed**
- [ ] Generate 5 different decks
- [ ] Record time for each:
  - Deck 1: ___ seconds
  - Deck 2: ___ seconds
  - Deck 3: ___ seconds
  - Deck 4: ___ seconds
  - Deck 5: ___ seconds
- [ ] Verify average is 20-40 seconds
- [ ] Check if any take longer than 60 seconds

**Test 9.2: Editor Performance**
- [ ] Generate deck
- [ ] Navigate through all slides 3 times
- [ ] Verify no lag or stuttering
- [ ] Edit content rapidly
- [ ] Check typing lag
- [ ] Switch templates multiple times
- [ ] Verify smooth transitions

**Test 9.3: Memory Usage**
- [ ] Open browser DevTools
- [ ] Monitor memory during generation
- [ ] Generate multiple decks in sequence
- [ ] Check for memory leaks
- [ ] Verify cleanup after closing editor

### 10. Integration

**Test 10.1: Authentication**
- [ ] Log out
- [ ] Try to access `/dashboard/pitch-deck`
- [ ] Verify redirect to login
- [ ] Log in
- [ ] Verify redirect back to pitch deck
- [ ] Generate deck while logged in
- [ ] Verify API calls include auth token

**Test 10.2: Credits/Billing (if implemented)**
- [ ] Check user credits before generation
- [ ] Generate deck
- [ ] Verify credits deducted
- [ ] Try to generate with 0 credits
- [ ] Verify appropriate message/upgrade prompt

**Test 10.3: Dashboard Navigation**
- [ ] From pitch deck page, click dashboard logo
- [ ] Verify navigates back to `/dashboard`
- [ ] From pitch deck page, click other nav items
- [ ] Verify navigation works
- [ ] Use browser back button
- [ ] Verify history works correctly

## Automated Testing

### Unit Tests (Future)
```typescript
// Example test structure
describe('PitchDeckEditor', () => {
  it('should generate deck from description', async () => {
    // Test implementation
  });
  
  it('should update slide on edit', () => {
    // Test implementation
  });
  
  it('should improve slide with AI', async () => {
    // Test implementation
  });
});
```

### API Tests
```bash
# Test deck generation
curl -X POST http://localhost:8787/api/pitch-deck/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessDescription": "Test business",
    "companyName": "TestCo"
  }'

# Test slide improvement
curl -X POST http://localhost:8787/api/pitch-deck/improve-slide \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slideContent": {...},
    "instruction": "Make more compelling"
  }'
```

## Test Data

### Example Business Descriptions

**SaaS B2B:**
```
Building an AI-powered sales intelligence platform for B2B teams. Automatically 
enriches leads, predicts deal likelihood, and suggests optimal outreach timing. 
Currently at $100K MRR with 50 enterprise customers including 3 Fortune 500s. 
80% logo retention. Raising $3M seed to expand sales team and add integrations.
```

**Marketplace:**
```
Two-sided marketplace connecting pet owners with vetted pet sitters. Real-time 
GPS tracking, insurance included, instant booking. 15K pet owners, 2K sitters, 
$200K monthly GMV. 25% take rate. Top market is SF, expanding to LA and NYC. 
Raising $2M to scale operations and marketing.
```

**E-commerce:**
```
DTC brand selling sustainable home goods. Biodegradable products, carbon-neutral 
shipping, 1% for the Planet member. $2M annual revenue, 40% repeat rate, 
$75 AOV. Built audience of 100K on Instagram. Raising $1.5M to launch new 
product line and retail partnerships.
```

**FinTech:**
```
API platform for embedded finance. Let any company offer banking services to 
their users. Compliant infrastructure, white-label, revenue share model. 
Integrated with 5 major banks. 20 customers in beta generating $50K MRR. 
Raising $5M Series A for sales and compliance team expansion.
```

## Success Criteria

A successful test session should verify:
- [x] Deck generation works with various inputs
- [x] All 10 slides generate with appropriate content
- [x] Editor allows full WYSIWYG editing
- [x] AI assistant successfully improves slides
- [x] All 4 templates render correctly
- [x] Export to PDF/Markdown/JSON works
- [x] Navigation is smooth and intuitive
- [x] Errors are handled gracefully
- [x] Performance is acceptable (< 40s generation)
- [x] No crashes or data loss

## Known Issues

Document any issues found during testing:

1. **Issue:** [Description]
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Workaround:** [If any]

## Test Sign-off

- [ ] All critical tests passed
- [ ] All medium priority tests passed
- [ ] Known issues documented
- [ ] Performance acceptable
- [ ] Ready for user testing

**Tester:** _______________
**Date:** _______________
**Build/Version:** _______________
**Notes:** _______________

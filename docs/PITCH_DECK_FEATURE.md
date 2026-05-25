# AI Pitch Deck Generator

## Overview

The AI Pitch Deck Generator is a comprehensive feature that enables Nanowork users to create professional, investor-ready pitch decks in minutes. Powered by Claude AI (Anthropic), it generates compelling narratives, market sizing, and complete slide content based on business descriptions.

## Architecture

### Components

1. **Backend API** (`apps/worker/src/routes/pitch-deck.ts`)
   - `/api/pitch-deck/generate` - Generate complete deck from business description
   - `/api/pitch-deck/improve-slide` - AI-powered slide improvement
   - `/api/pitch-deck/estimate-market` - Market size estimation (TAM/SAM/SOM)

2. **Frontend Components**
   - `PitchDeckEditor.tsx` - Main editor with WYSIWYG interface
   - `PitchDeck.tsx` - Dashboard page for starting new decks
   - `pdfExport.ts` - Export utilities (PDF, Markdown, JSON)

3. **Dashboard Integration**
   - Added to navigation at `/dashboard/pitch-deck`
   - Accessible from main dashboard menu

### Data Structure

```typescript
interface SlideContent {
  type: 'cover' | 'problem' | 'solution' | 'market' | 'business-model' | 
        'traction' | 'competition' | 'team' | 'financials' | 'ask' | 'contact'
  title: string
  content: string
  bullets?: string[]
  data?: Record<string, any>
  notes?: string
}

interface PitchDeck {
  id: string
  companyName: string
  tagline: string
  slides: SlideContent[]
  template: string  // 'yc' | 'sequoia' | 'modern' | 'corporate'
  createdAt: string
  updatedAt: string
}
```

## Features

### 1. AI Content Generation

**Input:**
- Business description (required)
- Company name (optional - AI will suggest)
- Tagline (optional - AI will generate)
- Target raise amount (optional)
- Spreadsheet data (optional - for financials)

**Output:**
Complete 10-slide deck with:
1. Cover (Company name, tagline)
2. Problem (Market pain points)
3. Solution (Product overview)
4. Market Size (TAM/SAM/SOM with methodology)
5. Business Model (Revenue streams)
6. Traction (Key metrics)
7. Competition (Competitive advantages)
8. Team (Founder backgrounds)
9. Financials (3-year projections)
10. The Ask (Fundraising details)

### 2. Professional Templates

Four built-in templates:
- **Y Combinator**: Minimal, data-focused, high contrast
- **Sequoia**: Narrative-driven, storytelling approach
- **Modern SaaS**: Clean, visual, contemporary design
- **Corporate**: Formal, detailed, traditional

Templates affect both editor preview and PDF export styling.

### 3. Interactive Editor

**Features:**
- Slide navigator with thumbnails
- Real-time WYSIWYG editing
- Edit/Preview toggle
- Individual slide editing:
  - Title
  - Main content
  - Bullet points
  - Data/metrics

### 4. AI Assistant Panel

**Capabilities:**
- Improve any slide with natural language instructions
- Quick actions:
  - "Add more data"
  - "Make more compelling"
  - "Simplify"
- Context-aware improvements using full deck context

**Example prompts:**
- "Make this more investor-focused"
- "Add specific numbers and metrics"
- "Rewrite for B2B audience"
- "Emphasize our competitive advantages"

### 5. Export Options

**PDF Export:**
- Browser-based print to PDF
- Professional slide dimensions (16:9)
- Template-specific styling
- Slide numbers and pagination

**Markdown Export:**
- Compatible with Deckset, Marp, reveal.js
- Preserves content structure
- Easy to version control

**JSON Export:**
- Full deck data
- Import/export for backup
- Shareable format

## User Flow

1. **Discovery**: User navigates to Dashboard → Pitch Deck
2. **Input**: User provides business description and optional metadata
3. **Generation**: AI generates complete 10-slide deck (~30 seconds)
4. **Review**: User reviews generated content in editor
5. **Refinement**: User edits slides directly or uses AI assistant
6. **Template Selection**: User chooses template style
7. **Export**: User exports to PDF, Markdown, or JSON

## AI Prompting Strategy

### System Prompt
Establishes AI as expert pitch deck consultant with:
- VC/angel investor perspective
- Balance of vision and credibility
- Specific, data-driven approach
- No buzzwords or generic statements

### Generation Prompt
Requests structured JSON output with:
- All 10 slides with proper typing
- Specific guidance per slide type
- Emphasis on concrete data
- Credible market sizing methodology

### Improvement Prompt
Context-aware refinement:
- Takes current slide content
- Incorporates deck context (company, tagline)
- Follows user instruction
- Returns improved JSON structure

## Technical Implementation

### API Route (Cloudflare Worker)

```typescript
// Generate deck
POST /api/pitch-deck/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessDescription": "...",
  "companyName": "...",
  "tagline": "...",
  "targetRaise": "...",
  "spreadsheetData": {}
}

// Response
{
  "deck": {
    "id": "uuid",
    "companyName": "...",
    "tagline": "...",
    "slides": [...],
    "template": "yc",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

### Frontend State Management

- React hooks for component state
- Real-time updates on slide edits
- Local state (no persistence yet - future enhancement)
- Optimistic UI updates

### Export System

**PDF Generation:**
- Generates complete HTML document
- Slide-specific styling (1920x1080px)
- Opens in new window for print
- User saves via browser print dialog

**Alternative Approaches (Future):**
- jsPDF library for client-side generation
- Server-side rendering with Puppeteer
- Cloudflare Browser Rendering API

## Future Enhancements

### Phase 2 Features

1. **Deck Persistence**
   - Save decks to database
   - Deck library/history
   - Auto-save functionality

2. **Advanced Data Integration**
   - Pull metrics from spreadsheet tool
   - Live data connections
   - Chart generation from data

3. **Collaboration**
   - Share decks with team
   - Comments and feedback
   - Version history

4. **Enhanced Templates**
   - Custom branding
   - Logo upload
   - Color customization
   - Font selection

5. **Presentation Mode**
   - Full-screen presenter view
   - Speaker notes
   - Slide transitions
   - Remote control

6. **Analytics**
   - Track deck views
   - Time per slide metrics
   - Engagement analytics

### Technical Improvements

1. **PDF Quality**
   - High-resolution exports
   - Vector graphics support
   - Embedded fonts
   - Professional PDF metadata

2. **Performance**
   - Streaming AI responses
   - Faster generation
   - Cached templates
   - Progressive loading

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode
   - WCAG compliance

## Development

### Local Setup

1. API is available at `http://localhost:8787/api/pitch-deck/*`
2. Frontend accessible at `http://localhost:5173/dashboard/pitch-deck`
3. Requires `ANTHROPIC_API_KEY` environment variable

### Testing

**Manual Testing:**
1. Navigate to Pitch Deck page
2. Enter business description
3. Generate deck
4. Edit slides
5. Use AI assistant
6. Change templates
7. Export to PDF/Markdown/JSON

**Test Cases:**
- [ ] Generate deck with minimal input
- [ ] Generate deck with full input
- [ ] Edit slide content
- [ ] Use AI to improve slide
- [ ] Switch between templates
- [ ] Export to PDF
- [ ] Export to Markdown
- [ ] Export to JSON
- [ ] Navigate between slides
- [ ] Toggle Edit/Preview modes

### Dependencies

**Backend:**
- `@anthropic-ai/sdk` - Claude AI integration
- `hono` - API routing

**Frontend:**
- `react` - UI framework
- `react-router-dom` - Navigation
- `lucide-react` - Icons

## Production Considerations

### Rate Limiting
- AI generation is expensive (~$0.10 per deck)
- Consider implementing:
  - Credit-based system (1 credit = 1 deck)
  - Monthly generation limits by plan
  - Pro users get unlimited

### Caching
- Cache common market size estimates
- Store template configurations
- CDN for static assets

### Error Handling
- Graceful AI failure fallbacks
- Retry logic for API calls
- User-friendly error messages
- Logging for debugging

### Security
- Authentication required (requireAuth middleware)
- Input validation and sanitization
- Rate limiting per user
- Content safety checks

## Cost Analysis

**Per Deck Generation:**
- Input tokens: ~500-1000 (business description + prompt)
- Output tokens: ~3000-4000 (full deck JSON)
- Model: Claude Sonnet 4
- Estimated cost: $0.08-0.12 per deck

**Per Slide Improvement:**
- Input tokens: ~300-500 (slide + context + instruction)
- Output tokens: ~200-400 (improved slide)
- Model: Claude Sonnet 4
- Estimated cost: $0.02-0.03 per improvement

**Monthly Estimates:**
- 100 users × 2 decks/month = 200 decks
- 200 decks × 5 improvements/deck = 1000 improvements
- Total: ~$20-$25/month in AI costs

## Support & Documentation

**User Documentation:**
- In-app tooltips
- Example prompts
- Video tutorials (future)
- FAQ section (future)

**Developer Documentation:**
- API documentation
- Component documentation
- Architecture diagrams
- Code examples

## Conclusion

The AI Pitch Deck Generator is a powerful feature that delivers significant value to Nanowork users building businesses. By automating the time-consuming process of creating investor presentations, it enables founders to focus on their business while still producing professional, compelling pitch materials.

The feature is production-ready with room for future enhancements in persistence, collaboration, and advanced customization.

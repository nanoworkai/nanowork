# Pitch Deck Editor Component

## Quick Start

```typescript
import PitchDeckEditor from './components/PitchDeckEditor';

// Basic usage
<PitchDeckEditor />

// With initial business description
<PitchDeckEditor 
  initialBusinessDescription="Building a B2B SaaS platform..."
  onClose={() => console.log('Editor closed')}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialBusinessDescription` | `string` | `""` | Pre-fill the business description field |
| `onClose` | `() => void` | `undefined` | Callback when user closes the editor |

## Features

### Generation Phase
- User enters business description, company name (optional), tagline (optional), target raise (optional)
- Click "Generate Pitch Deck" to create full 10-slide deck
- Loading state shown during AI generation (~30 seconds)

### Editor Phase
- **Slide Navigator**: Left sidebar with all slides (click to navigate)
- **Edit/Preview Toggle**: Switch between editing and presentation preview
- **Template Selector**: Choose from YC, Sequoia, Modern SaaS, or Corporate
- **Slide Editor**: Edit title, content, bullets directly
- **AI Assistant Panel**: Click "AI Assistant" button to get AI help improving slides
- **Export Options**: Export to PDF (print), Markdown, or JSON

### Navigation
- Use Previous/Next buttons or click slide thumbnails
- Keyboard shortcuts: Arrow keys (future enhancement)

## State Management

Internal state managed with React hooks:
- `deck`: Current deck object
- `currentSlideIndex`: Active slide
- `isGenerating`: Generation loading state
- `isImproving`: AI improvement loading state
- `error`: Error messages
- `view`: 'edit' or 'preview'

## API Integration

Makes authenticated requests to:
- `POST /api/pitch-deck/generate` - Generate deck
- `POST /api/pitch-deck/improve-slide` - Improve single slide

Requires valid session with access token.

## Styling

Uses Nanowork terminal aesthetic:
- Dark surfaces (`surface-0`, `surface-1`, `surface-2`)
- White text with opacity variants
- Sharp borders, no border radius (terminal style)
- Monospace fonts for system elements
- High contrast for readability

Preview uses template-specific styling:
- YC: White background, black text, minimal
- Sequoia: Dark gradient, white text, narrative
- Modern: Light gray, contemporary
- Corporate: White with borders, formal

## Export Formats

### PDF
- Opens print dialog with properly formatted slides
- 16:9 aspect ratio (1920x1080px)
- Template-specific styling applied
- User saves via browser print-to-PDF

### Markdown
- Compatible with Deckset, Marp, reveal.js
- Preserves structure: headings, bullets, data
- Downloadable `.md` file

### JSON
- Complete deck data structure
- Can be re-imported (future)
- Useful for backups, sharing

## Error Handling

- API errors shown in red alert boxes
- Generation failures show original error message
- Network issues handled gracefully
- Empty/invalid responses caught and displayed

## Future Enhancements

- [ ] Deck persistence (save to database)
- [ ] Keyboard shortcuts for navigation
- [ ] Undo/redo functionality
- [ ] Image upload for slides
- [ ] Custom branding/colors
- [ ] Presentation mode
- [ ] Collaboration features
- [ ] Version history

## Performance

- Lazy rendering of slide previews
- Debounced auto-save (future)
- Optimistic UI updates on edits
- Minimal re-renders with proper memo usage

## Accessibility

Current: Basic keyboard navigation via tab
Future: Full keyboard controls, ARIA labels, screen reader support

## Dependencies

- `lucide-react` - Icons
- `../context/AuthContext` - Authentication
- `../lib/pdfExport` - Export utilities

## Examples

### Minimal Example
```typescript
function App() {
  const [showEditor, setShowEditor] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>
        Create Pitch Deck
      </button>
      
      {showEditor && (
        <PitchDeckEditor onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}
```

### With Initial Data
```typescript
function CreateDeck() {
  const businessInfo = "Building an AI-powered sales platform...";
  
  return (
    <PitchDeckEditor 
      initialBusinessDescription={businessInfo}
      onClose={() => router.push('/dashboard')}
    />
  );
}
```

## Troubleshooting

**"AI service not configured" error**
- Ensure `ANTHROPIC_API_KEY` is set in environment variables
- Check Cloudflare Worker environment bindings

**Export not working**
- Ensure popup blocker is disabled
- Check browser console for errors
- Try different export format (Markdown as fallback)

**Slow generation**
- Normal generation time is 20-40 seconds
- Claude Sonnet 4 processes ~4000 tokens
- Consider upgrade to Claude Opus for faster results

**Slides look wrong in preview**
- Check template selection
- Ensure CSS is loaded
- Try refreshing the page

## Support

For issues or questions:
1. Check `/docs/PITCH_DECK_FEATURE.md` for full documentation
2. Review API route implementation in `/apps/worker/src/routes/pitch-deck.ts`
3. Test API endpoints directly with curl/Postman
4. Check browser console for client-side errors

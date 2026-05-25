# Agent Orchestration System - Quick Start Guide

## Installation

### 1. Apply Database Migration

```bash
cd /Users/jordan/Dev/nanowork-web
psql $DATABASE_URL < supabase/migrations/20260524000001_agent_orchestration.sql
```

Or apply via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20260524000001_agent_orchestration.sql`
3. Run the migration

### 2. Install Dependencies

Backend dependencies are already installed. If needed:

```bash
cd backend
npm install
```

### 3. Configure Environment

Ensure these variables are set in `backend/.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Server running on port 3000
   Health check: http://localhost:3000/health
   WebSocket: ws://localhost:3000/ws
```

### 5. Start the Frontend

```bash
cd apps/web
npm run dev
```

## Testing the System

### 1. Create a Build

1. Navigate to `http://localhost:5173/dashboard`
2. Enter a business idea in the prompt (e.g., "Build a dog walking marketplace")
3. Click "Start Building"
4. You'll be redirected to the BuilderView

### 2. Start Orchestration

1. On the BuilderView page, click "START BUILDING"
2. Watch as agents begin working in real-time
3. You'll see:
   - Progress bars for each agent
   - Current activity descriptions
   - Real-time status updates

### 3. View Deliverables

Once all agents complete:
1. Click "Documents" to view agent reports
2. Click "Financial Model" to see projections
3. Click "Pitch Deck" to view investor presentation

## Verifying Setup

### Check Backend Health

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "ok": true,
  "tables": 15,
  "timestamp": "2026-05-24T..."
}
```

### Check WebSocket Connection

Open browser console and run:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
```

### Check Database Tables

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN (
  'agent_executions',
  'build_documents',
  'build_spreadsheets',
  'build_pitch_decks'
);
```

Should return all 4 tables.

## System Architecture at a Glance

```
Frontend (React)
    ↓
WebSocket (Real-time updates)
    ↓
AgentOrchestrator (Backend service)
    ↓
Claude API (AI agents)
    ↓
Supabase (Data storage)
```

## File Structure

```
nanowork-web/
├── backend/src/
│   ├── services/
│   │   ├── agentOrchestrator.ts      # Main orchestration logic
│   │   └── websocketServer.ts        # Real-time updates
│   └── routes/
│       └── agent-orchestrator.ts     # API endpoints
│
├── apps/web/src/
│   ├── components/
│   │   └── AgentCard.tsx             # Agent status card
│   └── dashboard/
│       ├── BuilderView.tsx           # Main orchestration UI
│       ├── BuildDocuments.tsx        # Document viewer
│       ├── BuildSpreadsheet.tsx      # Financial model viewer
│       └── BuildPitchDeck.tsx        # Pitch deck viewer
│
├── supabase/migrations/
│   └── 20260524000001_agent_orchestration.sql
│
└── docs/
    ├── AGENT_ORCHESTRATION.md        # Full documentation
    └── AGENT_ORCHESTRATION_QUICKSTART.md  # This file
```

## Common Issues

### "ANTHROPIC_API_KEY not configured"

**Solution:** Set the API key in `backend/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### WebSocket connection fails

**Solution:** Verify the backend is running and check the WebSocket URL in browser console.

### Agents stuck in "queued"

**Solution:** 
1. Check backend logs for errors
2. Verify Claude API key is valid
3. Check Claude API rate limits

### Missing documents after completion

**Solution:**
1. Check database: `SELECT * FROM build_documents WHERE build_id = 'your-build-id'`
2. Verify all agents completed successfully
3. Check RLS policies in Supabase

## Next Steps

1. Read full documentation: `docs/AGENT_ORCHESTRATION.md`
2. Customize agent prompts in `agentOrchestrator.ts`
3. Add new agents following the extension guide
4. Integrate with existing features (spreadsheets, pitch decks)

## Testing Checklist

- [ ] Backend starts without errors
- [ ] WebSocket connects successfully
- [ ] Can create a new build
- [ ] Agents start executing when "START BUILDING" is clicked
- [ ] Real-time progress updates appear
- [ ] All agents complete successfully
- [ ] Documents are generated and viewable
- [ ] Financial spreadsheet is created
- [ ] Pitch deck is compiled
- [ ] Can navigate between views
- [ ] Can download documents

## Support

If you encounter issues:
1. Check server logs: Look at the terminal running `npm run dev` in backend
2. Check browser console: Look for WebSocket or API errors
3. Check database: Verify tables exist and have correct permissions
4. Review documentation: `docs/AGENT_ORCHESTRATION.md`

## Performance Tips

- **Faster Development:** Use Claude Haiku for faster/cheaper testing
- **Production:** Use Claude Sonnet for best quality
- **Rate Limits:** Adjust agent concurrency if hitting API limits
- **Costs:** Each build with 7 agents costs ~$0.50-$2 depending on model

## What's Included

✅ 7 specialized AI agents
✅ Real-time WebSocket updates
✅ Parallel execution where possible
✅ Document generation system
✅ Financial spreadsheet creation
✅ Pitch deck compilation
✅ Beautiful UI with progress tracking
✅ Individual agent detail views
✅ Export capabilities (JSON, CSV)

## What's Not Included (Yet)

- PDF export for pitch decks
- PPTX export
- Agent chat/interaction
- Iteration support
- Custom agent creation
- Sharing/collaboration features

These can be added following the extension patterns in the main documentation.

---

**Ready to build!** 🚀

Create your first business by navigating to `/dashboard` and describing your idea.

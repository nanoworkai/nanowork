# Multi-Agent Orchestration System

## Overview

The Agent Orchestration System coordinates multiple specialized AI agents to build a complete business from a user's idea. Each agent focuses on a specific domain and works in parallel where possible, with results feeding into downstream agents and deliverables.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Input                                │
│              "Build a dog walking marketplace"                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AgentOrchestrator Service                      │
│  • Task queue management                                         │
│  • Dependency resolution                                         │
│  • Parallel execution                                            │
│  • Real-time WebSocket updates                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────┴────────────────────┐
         │      Priority 1 (Parallel)              │
         ├─────────────────────────────────────────┤
         │  • Business Analyst                     │
         │  • Product Designer                     │
         │  • Marketing Strategist                 │
         │  • Legal Advisor                        │
         │  • Technical Architect                  │
         └─────────────────────────────────────────┘
                              ↓
         ┌────────────────────┴────────────────────┐
         │      Priority 2 (Sequential)            │
         ├─────────────────────────────────────────┤
         │  • Financial Planner                    │
         │    (depends on all Priority 1 agents)   │
         └─────────────────────────────────────────┘
                              ↓
         ┌────────────────────┴────────────────────┐
         │      Priority 3 (Sequential)            │
         ├─────────────────────────────────────────┤
         │  • Pitch Strategist                     │
         │    (depends on all previous agents)     │
         └─────────────────────────────────────────┘
                              ↓
         ┌────────────────────┴────────────────────┐
         │           Deliverables                  │
         ├─────────────────────────────────────────┤
         │  • Documents (7 agent reports)          │
         │  • Spreadsheet (financial model)        │
         │  • Pitch Deck (investor presentation)   │
         └─────────────────────────────────────────┘
```

## Agent Types

### 1. Business Analyst Agent
**Purpose:** Market research, competitive analysis, and business model validation

**Deliverables:**
- Market size and opportunity analysis
- Target customer personas (3-5 detailed profiles)
- Competitive landscape (top 5-10 competitors)
- Business model recommendations
- Key success metrics and KPIs
- Risk assessment

**Dependencies:** None (Priority 1)

### 2. Product Designer Agent
**Purpose:** Product/service design, features, and roadmap

**Deliverables:**
- Core features list (MVP vs future)
- User flows and journey maps
- Feature specifications with user stories
- Product roadmap (6-12 months)
- Technical requirements summary
- UX/UI considerations

**Dependencies:** None (Priority 1)

### 3. Marketing Strategist Agent
**Purpose:** Go-to-market strategy, positioning, and growth channels

**Deliverables:**
- Brand positioning and messaging
- Value proposition and unique selling points
- Customer acquisition channels (prioritized)
- Growth marketing tactics
- Content marketing strategy
- Launch strategy and timeline

**Dependencies:** None (Priority 1)

### 4. Legal Advisor Agent
**Purpose:** Business structure, compliance, and legal requirements

**Deliverables:**
- Recommended business structure (LLC, C-Corp, etc.)
- Required licenses and permits by jurisdiction
- Compliance requirements
- Intellectual property considerations
- Terms of service and privacy policy requirements
- Formation checklist

**Dependencies:** None (Priority 1)

### 5. Technical Architect Agent
**Purpose:** System architecture and technology recommendations

**Deliverables:**
- System architecture overview
- Recommended tech stack with rationale
- Database schema recommendations
- API design and integrations
- Infrastructure requirements
- Security architecture
- Development timeline estimate

**Dependencies:** None (Priority 1)

### 6. Financial Planner Agent
**Purpose:** Financial projections, costs, and pricing model

**Deliverables:**
- Startup costs breakdown
- Monthly operating expenses
- Revenue model and pricing strategy
- 3-year financial projections
- Break-even analysis
- Funding requirements
- Unit economics (CAC, LTV, margins)

**Dependencies:** Business Analyst, Product Designer, Marketing, Technical Architect (Priority 2)

### 7. Pitch Strategist Agent
**Purpose:** Investor pitch strategy and fundraising guidance

**Deliverables:**
- Elevator pitch (30 seconds)
- Problem and solution narrative
- Market opportunity (TAM/SAM/SOM)
- Business model summary
- Competition and differentiation
- Financial highlights
- Funding ask and use of funds
- Pitch deck outline (slide-by-slide)

**Dependencies:** Business Analyst, Financial Planner, Product Designer, Marketing (Priority 3)

## Backend Components

### AgentOrchestrator Service
**Location:** `/backend/src/services/agentOrchestrator.ts`

**Responsibilities:**
- Manages agent execution lifecycle
- Resolves dependencies between agents
- Executes agents in parallel where possible
- Broadcasts real-time updates via WebSocket
- Stores results in database
- Generates final deliverables

**Key Methods:**
- `startBuild(buildId, userPrompt)` - Initialize and start orchestration
- `executeAgents(buildId, context)` - Run agents based on dependency graph
- `executeAgent(buildId, agentType, context)` - Execute single agent
- `registerClient(buildId, ws)` - Register WebSocket client for updates
- `getBuildStatus(buildId)` - Get current status of all agents

### WebSocket Server
**Location:** `/backend/src/services/websocketServer.ts`

**Purpose:** Real-time communication between backend and frontend

**Messages:**
- `connected` - Connection established
- `subscribed` - Client subscribed to build updates
- `agent_queued` - Agent added to queue
- `agent_started` - Agent began execution
- `agent_progress` - Agent progress update
- `agent_completed` - Agent finished successfully
- `agent_error` - Agent encountered error
- `build_completed` - All agents finished

### API Routes
**Location:** `/backend/src/routes/agent-orchestrator.ts`

**Endpoints:**
- `POST /agent-orchestrator/builds/:buildId/start` - Start orchestration
- `GET /agent-orchestrator/builds/:buildId/status` - Get agent status
- `GET /agent-orchestrator/builds/:buildId/documents` - Get generated documents
- `GET /agent-orchestrator/builds/:buildId/spreadsheet` - Get financial spreadsheet
- `GET /agent-orchestrator/builds/:buildId/pitch-deck` - Get pitch deck data

## Frontend Components

### BuilderView Component
**Location:** `/apps/web/src/dashboard/BuilderView.tsx`

**Features:**
- Real-time agent status display
- WebSocket connection for live updates
- Progress overview bar
- Agent grid with individual cards
- Deliverables section (documents, spreadsheet, pitch deck)
- Document viewer modal

**State Management:**
- `build` - Build information
- `agents` - Map of agent tasks by type
- `documents` - Generated documents
- `wsRef` - WebSocket connection reference

### AgentCard Component
**Location:** `/apps/web/src/components/AgentCard.tsx`

**Features:**
- Visual representation of agent
- Status indicator (queued, running, completed, error)
- Progress bar with percentage
- Current activity display
- Deliverables list
- View details button (when completed)
- Pulsing indicator for active agents

**Props:**
- `agentType` - Type of agent
- `name` - Display name
- `description` - Brief description
- `status` - Current status
- `progress` - Completion percentage (0-100)
- `currentActivity` - Current task description
- `deliverables` - List of outputs
- `error` - Error message (if any)
- `onViewDetails` - Callback for viewing results

### BuildDocuments Component
**Location:** `/apps/web/src/dashboard/BuildDocuments.tsx`

**Features:**
- Document library sidebar
- Document content viewer
- JSON/structured data rendering
- Download individual documents
- Download all documents as bundle

### BuildSpreadsheet Component
**Location:** `/apps/web/src/dashboard/BuildSpreadsheet.tsx`

**Features:**
- Financial data tables
- Section-based view (costs, revenue, metrics)
- CSV export
- JSON raw data view

### BuildPitchDeck Component
**Location:** `/apps/web/src/dashboard/BuildPitchDeck.tsx`

**Features:**
- Slide viewer with navigation
- Generated slides from agent data
- Slide thumbnails
- PDF export (planned)

## Database Schema

### agent_executions
Tracks the execution status of each agent for a build.

```sql
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES generated_apps(id),
  agent_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  current_activity TEXT,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(build_id, agent_type)
);
```

### build_documents
Stores documents generated by agents.

```sql
CREATE TABLE build_documents (
  id UUID PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES generated_apps(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### build_spreadsheets
Stores financial model data.

```sql
CREATE TABLE build_spreadsheets (
  id UUID PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES generated_apps(id),
  spreadsheet_type TEXT NOT NULL DEFAULT 'financial_model',
  name TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### build_pitch_decks
Stores pitch deck data compiled from all agents.

```sql
CREATE TABLE build_pitch_decks (
  id UUID PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES generated_apps(id),
  deck_data JSONB NOT NULL,
  pdf_url TEXT,
  pptx_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## User Flow

1. **User creates a build** on `/dashboard` (Create.tsx)
2. **Navigation to BuilderView** (`/dashboard/builder/:buildId`)
3. **User clicks "START BUILDING"** button
4. **Backend starts orchestration:**
   - Creates task records for all agents
   - Executes Priority 1 agents in parallel
   - Waits for completion, then runs Priority 2
   - Finally runs Priority 3
5. **Frontend receives real-time updates:**
   - Agent status changes
   - Progress updates
   - Current activity descriptions
6. **Upon completion:**
   - Documents are generated and stored
   - Financial spreadsheet is created
   - Pitch deck is compiled
7. **User can view deliverables:**
   - Click "Documents" to see all agent reports
   - Click "Financial Model" to view spreadsheet
   - Click "Pitch Deck" to see investor presentation

## WebSocket Protocol

### Client → Server

**Subscribe to build:**
```json
{
  "type": "subscribe",
  "buildId": "uuid"
}
```

**Unsubscribe:**
```json
{
  "type": "unsubscribe"
}
```

**Ping:**
```json
{
  "type": "ping"
}
```

### Server → Client

**Connected:**
```json
{
  "type": "connected",
  "message": "WebSocket connection established"
}
```

**Initial State:**
```json
{
  "type": "initial_state",
  "tasks": [
    {
      "buildId": "uuid",
      "agentType": "business_analyst",
      "status": "running",
      "progress": 45,
      "currentActivity": "Analyzing market data..."
    }
  ]
}
```

**Agent Progress:**
```json
{
  "type": "agent_progress",
  "agent": "business_analyst",
  "progress": 60,
  "activity": "Generating insights..."
}
```

**Agent Completed:**
```json
{
  "type": "agent_completed",
  "agent": "business_analyst",
  "task": { /* full task object */ },
  "result": { /* agent output */ }
}
```

**Build Completed:**
```json
{
  "type": "build_completed",
  "buildId": "uuid"
}
```

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Optional
VITE_API_URL=http://localhost:3000  # Frontend API URL
```

### Agent System Prompts

Each agent has a specialized system prompt in `AGENT_DEFINITIONS` that guides its analysis. These can be customized in `/backend/src/services/agentOrchestrator.ts`.

## Deployment

### Database Migration

Apply the agent orchestration migration:

```bash
cd /Users/jordan/Dev/nanowork-web/supabase
psql $DATABASE_URL < migrations/20260524000001_agent_orchestration.sql
```

### Backend

The WebSocket server runs alongside the Express API:

```bash
cd /Users/jordan/Dev/nanowork-web/backend
npm run dev  # Development
npm run build && npm start  # Production
```

### Frontend

The frontend connects via WebSocket and REST API:

```bash
cd /Users/jordan/Dev/nanowork-web/apps/web
npm run dev  # Development
npm run build  # Production
```

## Extending the System

### Adding a New Agent

1. **Define agent in orchestrator:**

```typescript
// In agentOrchestrator.ts
export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  // ... existing agents
  operations: {
    id: 'operations',
    name: 'Operations Manager',
    description: 'Operations and logistics planning',
    dependencies: ['product_designer', 'technical_architect'],
    priority: 2,
    systemPrompt: `You are an operations planning AI agent...`,
    deliverables: ['Operations Plan', 'Process Flows', 'Resource Planning'],
  },
};
```

2. **Add agent type to TypeScript types:**

```typescript
export type AgentType =
  | 'business_analyst'
  | 'financial_planner'
  | 'product_designer'
  | 'marketing'
  | 'legal'
  | 'technical_architect'
  | 'pitch'
  | 'operations'; // New agent
```

3. **Update frontend AgentCard component** to include icon and colors.

4. **Update database migration** to include new agent type in CHECK constraint.

### Customizing Agent Prompts

Edit the `systemPrompt` field in `AGENT_DEFINITIONS` to change how an agent analyzes the business idea.

### Adding New Deliverables

To add a new deliverable type:

1. Create a new table (e.g., `build_business_plans`)
2. Add a method in `AgentOrchestrator` to generate it (e.g., `generateBusinessPlan()`)
3. Call it in `finalizeBuild()`
4. Create a frontend component to display it
5. Add a route in `App.tsx`

## Performance Considerations

- **Parallel Execution:** Priority 1 agents run simultaneously, reducing total time
- **Progressive Updates:** WebSocket provides real-time feedback, improving perceived performance
- **Caching:** Consider caching agent results for similar prompts
- **Rate Limiting:** Claude API has rate limits; adjust concurrency if needed
- **Streaming:** Consider streaming agent responses for even faster feedback

## Error Handling

- **Agent Failures:** Individual agent errors don't stop the entire build
- **Retry Logic:** Consider implementing retries for transient failures
- **Fallback Responses:** If Claude API fails, could return cached/template responses
- **User Notifications:** Errors are displayed in the AgentCard UI

## Monitoring

Track these metrics:
- Agent execution time per type
- Success/failure rates
- WebSocket connection stability
- API call costs
- User engagement with deliverables

## Future Enhancements

1. **Agent Chat:** Allow users to ask questions to individual agents
2. **Iteration Support:** Re-run specific agents with user feedback
3. **Export Formats:** PDF, PPTX, DOCX exports
4. **Templates:** Pre-configured agent setups for industries
5. **Human-in-the-Loop:** Pause for user input mid-orchestration
6. **Agent Collaboration:** Let agents discuss and refine outputs together
7. **Version History:** Track changes across multiple runs
8. **Shareable Links:** Share builds with team members
9. **API Access:** External API for programmatic builds
10. **Custom Agents:** User-defined agents with custom prompts

## Troubleshooting

### WebSocket not connecting
- Check CORS settings in backend
- Verify WebSocket URL (ws:// or wss://)
- Check firewall/proxy settings

### Agents stuck in "queued" state
- Verify ANTHROPIC_API_KEY is set
- Check Claude API rate limits
- Review server logs for errors

### Missing deliverables
- Ensure all agents completed successfully
- Check database for records
- Verify RLS policies allow access

### Slow performance
- Monitor Claude API response times
- Check database query performance
- Optimize WebSocket message frequency
- Consider reducing agent prompt lengths

## Support

For issues or questions:
- Check server logs: `npm run dev` in backend
- Check browser console for WebSocket errors
- Review database records in Supabase dashboard
- Verify environment variables are set correctly

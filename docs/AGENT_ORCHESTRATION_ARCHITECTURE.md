# Agent Orchestration System - Technical Architecture

## System Overview

The Agent Orchestration System is a distributed, event-driven architecture that coordinates multiple AI agents to build comprehensive business analyses. It uses WebSockets for real-time communication, a dependency graph for orchestration, and structured data storage for deliverables.

## Core Components

### 1. AgentOrchestrator (Backend Service)

**Responsibility:** Central coordinator for all agent activities

**Key Features:**
- Dependency resolution based on agent priority
- Parallel execution within priority levels
- Progress tracking and state management
- WebSocket broadcast for real-time updates
- Result aggregation and storage

**State Management:**
```typescript
class AgentOrchestrator {
  private tasks: Map<string, AgentTask>        // Agent execution state
  private contexts: Map<string, BuildContext>  // Build-level context
  private wsClients: Map<string, WebSocket[]>  // Connected clients
}
```

**Execution Flow:**
```
1. startBuild()
   ↓
2. initializeTasks() - Create task records
   ↓
3. executeAgents() - Run by priority level
   ↓
4. For each priority:
   - Execute agents in parallel
   - Wait for all to complete
   - Move to next priority
   ↓
5. finalizeBuild() - Generate deliverables
```

### 2. WebSocket Server

**Responsibility:** Real-time bidirectional communication

**Features:**
- Connection management with heartbeat
- Build-specific subscriptions
- Message broadcasting
- Automatic reconnection handling

**Message Types:**
- Control: `subscribe`, `unsubscribe`, `ping`
- Status: `connected`, `subscribed`, `initial_state`
- Updates: `agent_queued`, `agent_started`, `agent_progress`, `agent_completed`, `agent_error`
- Completion: `build_completed`

### 3. Agent Execution Engine

**Responsibility:** Individual agent execution with Claude API

**Process:**
```
1. Build context prompt from:
   - User's business idea
   - Results from dependency agents
   
2. Send to Claude API with:
   - Agent-specific system prompt
   - Context from previous agents
   - Max tokens: 8000
   
3. Parse response as JSON

4. Update progress and broadcast

5. Store result in database
```

**Progress Simulation:**
During API call, simulate progress stages to provide user feedback:
- Analyzing business concept... (0-20%)
- Researching market data... (20-40%)
- Generating insights... (40-60%)
- Structuring recommendations... (60-80%)
- Finalizing deliverables... (80-90%)
- Processing results... (90-100%)

### 4. Database Layer

**Tables:**

```
agent_executions
├── id (UUID)
├── build_id (FK → generated_apps)
├── agent_type (ENUM)
├── status (queued|running|completed|error)
├── progress (0-100)
├── current_activity (TEXT)
├── result (JSONB)
├── error_message (TEXT)
└── timestamps

build_documents
├── id (UUID)
├── build_id (FK → generated_apps)
├── document_type (TEXT)
├── title (TEXT)
├── content (JSONB)
└── timestamps

build_spreadsheets
├── id (UUID)
├── build_id (FK → generated_apps)
├── data (JSONB)
└── timestamps

build_pitch_decks
├── id (UUID)
├── build_id (FK → generated_apps)
├── deck_data (JSONB)
└── timestamps
```

**Row-Level Security:**
- Users can only access builds they own
- System service role can write all records
- Read policies based on `auth.uid()`

## Frontend Architecture

### Component Hierarchy

```
BuilderView (Main container)
├── Header
│   ├── Navigation
│   └── Start Building button
│
├── Progress Overview
│   └── Progress bars for all agents
│
├── Agent Grid
│   └── AgentCard (×7)
│       ├── Icon & Name
│       ├── Status indicator
│       ├── Progress bar
│       ├── Current activity
│       └── Deliverables list
│
└── Deliverables Section
    ├── Documents link
    ├── Spreadsheet link
    └── Pitch Deck link

BuildDocuments (Document viewer)
├── Sidebar (document list)
└── Content viewer (with download)

BuildSpreadsheet (Financial model)
├── Section tables
└── CSV export

BuildPitchDeck (Investor presentation)
├── Slide viewer
├── Navigation controls
└── PDF export (planned)
```

### State Management

**BuilderView State:**
```typescript
const [build, setBuild] = useState<Build | null>(null)
const [agents, setAgents] = useState<Map<AgentType, AgentTask>>(new Map())
const [documents, setDocuments] = useState<Document[]>([])
const wsRef = useRef<WebSocket | null>(null)
```

**WebSocket Integration:**
```typescript
useEffect(() => {
  connectWebSocket()
  return () => wsRef.current?.close()
}, [buildId])

function connectWebSocket() {
  const ws = new WebSocket(wsUrl)
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    handleWebSocketMessage(message)
  }
  wsRef.current = ws
}

function handleWebSocketMessage(message) {
  switch (message.type) {
    case 'agent_progress':
      setAgents(prev => {
        const newMap = new Map(prev)
        newMap.set(message.agent, message.task)
        return newMap
      })
      break
    // ... other cases
  }
}
```

## Dependency Graph

```
Priority 1 (Parallel):
┌──────────────────┐
│ Business Analyst │ ─┐
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ Product Designer │ ─┤
└──────────────────┘  │
                      ├─→ Priority 2
┌──────────────────┐  │
│ Marketing        │ ─┤
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ Legal            │ ─┤
└──────────────────┘  │
                      │
┌──────────────────┐  │
│ Technical Arch   │ ─┘
└──────────────────┘

Priority 2 (Sequential):
┌──────────────────┐
│ Financial Plan   │ ──→ Depends on all Priority 1
└──────────────────┘
        │
        ├─→ Priority 3
        │
Priority 3 (Sequential):
┌──────────────────┐
│ Pitch Strategist │ ──→ Depends on Business, Financial, Product, Marketing
└──────────────────┘
```

**Execution Algorithm:**
```python
def execute_agents(build_id, context):
    # Group by priority
    agents_by_priority = group_by_priority(AGENT_DEFINITIONS)
    
    # Execute each priority sequentially
    for priority in sorted(agents_by_priority.keys()):
        agents = agents_by_priority[priority]
        
        # Execute all agents at this priority in parallel
        await Promise.all([
            execute_agent(build_id, agent, context)
            for agent in agents
        ])
    
    # All agents complete
    finalize_build(build_id)
```

## Data Flow

### 1. Build Creation
```
User enters prompt
    ↓
POST /builds
    ↓
Create generated_apps record
    ↓
Redirect to BuilderView
```

### 2. Orchestration Start
```
User clicks "START BUILDING"
    ↓
POST /agent-orchestrator/builds/:id/start
    ↓
AgentOrchestrator.startBuild()
    ↓
Initialize agent_executions records
    ↓
Broadcast agent_queued events
```

### 3. Agent Execution
```
For each agent:
    Update status → running
    ↓
    Broadcast agent_started
    ↓
    Build context prompt
    ↓
    Call Claude API
    ↓
    Parse JSON response
    ↓
    Update progress (broadcast)
    ↓
    Store result
    ↓
    Create build_documents record
    ↓
    Broadcast agent_completed
```

### 4. Deliverable Generation
```
All agents complete
    ↓
Extract financial data
    ↓
Create build_spreadsheets record
    ↓
Compile pitch deck data
    ↓
Create build_pitch_decks record
    ↓
Update build status → completed
    ↓
Broadcast build_completed
```

### 5. User Views Deliverables
```
Click "Documents"
    ↓
GET /agent-orchestrator/builds/:id/documents
    ↓
Render BuildDocuments component
    ↓
User downloads or views content
```

## API Endpoints

### REST API

```
POST   /agent-orchestrator/builds/:buildId/start
  → Start agent orchestration
  → Returns: { success: true }

GET    /agent-orchestrator/builds/:buildId/status
  → Get current status of all agents
  → Returns: { tasks: AgentTask[] }

GET    /agent-orchestrator/builds/:buildId/documents
  → Get all generated documents
  → Returns: { documents: Document[] }

GET    /agent-orchestrator/builds/:buildId/spreadsheet
  → Get financial spreadsheet
  → Returns: { spreadsheet: Spreadsheet }

GET    /agent-orchestrator/builds/:buildId/pitch-deck
  → Get pitch deck data
  → Returns: { pitchDeck: PitchDeck }
```

### WebSocket Protocol

**Client → Server:**
```json
{
  "type": "subscribe",
  "buildId": "uuid"
}
```

**Server → Client:**
```json
{
  "type": "agent_progress",
  "agent": "business_analyst",
  "progress": 65,
  "activity": "Analyzing competitors...",
  "task": { /* full task object */ }
}
```

## Error Handling

### Agent Execution Errors

**Strategy:** Fail gracefully, continue with other agents

```typescript
try {
  const result = await runAgent(...)
  task.status = 'completed'
  task.result = result
} catch (error) {
  task.status = 'error'
  task.error = error.message
  // Continue execution - don't stop other agents
}
```

**User Experience:**
- Error displayed in AgentCard
- Other agents continue
- Build can still produce partial results

### WebSocket Disconnection

**Strategy:** Automatic reconnection with exponential backoff

```typescript
ws.onclose = () => {
  setTimeout(() => {
    connectWebSocket() // Reconnect
  }, 3000)
}
```

### Claude API Failures

**Possible causes:**
- Rate limits exceeded
- Invalid API key
- Network issues
- Timeout

**Handling:**
- Log error details
- Set agent status to 'error'
- Display user-friendly message
- Consider implementing retry logic

## Performance Optimization

### 1. Parallel Execution
- Priority 1: 5 agents run simultaneously
- Reduces total time from ~50s to ~10s

### 2. Progressive Updates
- WebSocket provides immediate feedback
- Users see agents working in real-time
- Improves perceived performance

### 3. Efficient Data Storage
- JSONB for structured data
- Indexed queries for fast retrieval
- RLS for security without overhead

### 4. Caching Strategies (Future)
```typescript
// Cache agent results for similar prompts
const cacheKey = hash(agentType + userPrompt)
if (cache.has(cacheKey)) {
  return cache.get(cacheKey)
}
```

### 5. Rate Limiting
```typescript
// Implement token bucket for Claude API
const rateLimiter = new TokenBucket({
  capacity: 10,
  fillRate: 1, // 1 request per second
})

await rateLimiter.take()
const result = await claude.messages.create(...)
```

## Security Considerations

### 1. Authentication
- All API endpoints use `requireUserAuth` middleware
- WebSocket connections verify user ownership

### 2. Authorization
- RLS policies ensure users only access their builds
- Service role used for system operations

### 3. Input Validation
- User prompts sanitized before sending to Claude
- Agent results validated before storage

### 4. Rate Limiting
- Prevent abuse of orchestration system
- Implement per-user limits on concurrent builds

### 5. Cost Control
- Track API usage per user
- Implement credit/quota system
- Monitor Claude API costs

## Monitoring & Observability

### Key Metrics

**System Health:**
- WebSocket connection count
- Active orchestrations
- Agent execution queue depth

**Performance:**
- Average agent execution time
- Total build completion time
- WebSocket message latency

**Reliability:**
- Agent success rate by type
- Error rate and types
- WebSocket reconnection rate

**Business:**
- Builds started vs completed
- Most/least used agents
- Average cost per build

### Logging

```typescript
// Structured logging
logger.info('Agent started', {
  buildId,
  agentType,
  timestamp: new Date(),
})

logger.error('Agent execution failed', {
  buildId,
  agentType,
  error: error.message,
  stack: error.stack,
})
```

## Scaling Considerations

### Horizontal Scaling

**Challenges:**
- WebSocket connections are stateful
- Agent orchestration is stateful

**Solutions:**
- Sticky sessions for WebSocket
- Shared state via Redis
- Message queue for agent tasks

### Vertical Scaling

**Current limits:**
- 5 concurrent Claude API calls per build
- Limited by Claude API rate limits

**Optimizations:**
- Increase concurrency with higher tier
- Use batch API when available
- Implement request pooling

### Database Scaling

**Current approach:**
- Single Supabase instance
- JSONB for flexibility

**Future:**
- Read replicas for queries
- Separate analytics database
- Archive old builds

## Testing Strategy

### Unit Tests
```typescript
describe('AgentOrchestrator', () => {
  test('executes agents in correct order', async () => {
    const orchestrator = new AgentOrchestrator()
    const execution = await orchestrator.startBuild(buildId, prompt)
    // Assert execution order
  })
})
```

### Integration Tests
```typescript
describe('Build API', () => {
  test('complete build lifecycle', async () => {
    // Create build
    const build = await createBuild(prompt)
    
    // Start orchestration
    await startOrchestration(build.id)
    
    // Wait for completion
    await waitForCompletion(build.id)
    
    // Verify deliverables
    const docs = await getDocuments(build.id)
    expect(docs).toHaveLength(7)
  })
})
```

### End-to-End Tests
```typescript
describe('BuilderView', () => {
  test('user can create and view build', async () => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Enter prompt
    await page.fill('textarea', 'Dog walking marketplace')
    await page.click('button:has-text("Start Building")')
    
    // Wait for redirect
    await page.waitForURL(/\/builder\//)
    
    // Start orchestration
    await page.click('button:has-text("START BUILDING")')
    
    // Wait for agents
    await page.waitForSelector('.agent-card[data-status="completed"]')
    
    // Verify deliverables
    expect(await page.textContent('h2')).toContain('Documents')
  })
})
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Cloudflare CDN                 │
│         (Static asset delivery)             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Frontend (Vite/React)             │
│      Hosted on Cloudflare Pages             │
└─────────────────────────────────────────────┘
                    ↓
            WebSocket + REST
                    ↓
┌─────────────────────────────────────────────┐
│      Backend (Express + WebSocket)          │
│         Hosted on Render/Railway            │
│  • AgentOrchestrator service                │
│  • WebSocket server                         │
│  • REST API endpoints                       │
└─────────────────────────────────────────────┘
                    ↓
            ┌───────┴────────┐
            ↓                ↓
┌──────────────────┐  ┌──────────────────┐
│  Claude API      │  │  Supabase        │
│  (AI agents)     │  │  (Database)      │
└──────────────────┘  └──────────────────┘
```

## Future Enhancements

### 1. Advanced Orchestration
- Conditional agent execution
- Dynamic dependency resolution
- Agent retry with backoff
- Parallel agent chains

### 2. User Interaction
- Real-time chat with agents
- Pause/resume orchestration
- Agent parameter tuning
- Custom agent creation

### 3. Collaboration
- Multi-user builds
- Commenting on deliverables
- Sharing builds
- Team workspaces

### 4. Intelligence
- Learn from past builds
- Suggest improvements
- Auto-detect business type
- Personalized agent prompts

### 5. Export & Integration
- PDF/PPTX export
- Notion/Google Docs sync
- API for external tools
- Zapier integration

---

This architecture provides a solid foundation for a scalable, maintainable multi-agent orchestration system. The separation of concerns, event-driven design, and real-time communication create an excellent user experience while remaining performant and reliable.

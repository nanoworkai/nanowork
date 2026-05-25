import Anthropic from '@anthropic-ai/sdk';
import { getAnthropic } from './anthropic';
import { getSupabase } from './supabase';
import WebSocket from 'ws';

export type AgentType =
  | 'business_analyst'
  | 'financial_planner'
  | 'product_designer'
  | 'marketing'
  | 'legal'
  | 'technical_architect'
  | 'pitch';

export interface AgentDefinition {
  id: AgentType;
  name: string;
  description: string;
  dependencies: AgentType[];
  priority: number;
  systemPrompt: string;
  deliverables: string[];
}

export interface AgentTask {
  buildId: string;
  agentType: AgentType;
  status: 'queued' | 'running' | 'completed' | 'error';
  progress: number;
  currentActivity?: string;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BuildContext {
  buildId: string;
  userPrompt: string;
  agentResults: Map<AgentType, any>;
}

// Define all agent types with their configs
export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  business_analyst: {
    id: 'business_analyst',
    name: 'Business Analyst',
    description: 'Market research, competitive analysis, and business model validation',
    dependencies: [],
    priority: 1,
    systemPrompt: `You are a business analyst AI agent. Your job is to analyze the business idea and provide:
1. Market size and opportunity analysis
2. Target customer personas (3-5 detailed profiles)
3. Competitive landscape (top 5-10 competitors with analysis)
4. Business model recommendations (revenue streams, pricing strategy)
5. Key success metrics and KPIs
6. Risk assessment and mitigation strategies

Return your analysis as structured JSON with these sections.`,
    deliverables: ['Market Research', 'Customer Personas', 'Competitive Analysis', 'Business Model'],
  },
  product_designer: {
    id: 'product_designer',
    name: 'Product Designer',
    description: 'Product/service design, features, and roadmap',
    dependencies: [],
    priority: 1,
    systemPrompt: `You are a product design AI agent. Your job is to design the product/service:
1. Core features list (prioritized MVP vs future)
2. User flows and journey maps
3. Feature specifications with user stories
4. Product roadmap (6-12 months)
5. Technical requirements summary
6. UX/UI considerations and design principles

Return your design as structured JSON with these sections.`,
    deliverables: ['Feature Specifications', 'User Flows', 'Product Roadmap'],
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Strategist',
    description: 'Go-to-market strategy, positioning, and growth channels',
    dependencies: [],
    priority: 1,
    systemPrompt: `You are a marketing strategy AI agent. Your job is to create a go-to-market plan:
1. Brand positioning and messaging
2. Value proposition and unique selling points
3. Customer acquisition channels (prioritized)
4. Growth marketing tactics
5. Content marketing strategy
6. Launch strategy and timeline
7. Marketing budget recommendations

Return your strategy as structured JSON with these sections.`,
    deliverables: ['GTM Strategy', 'Brand Positioning', 'Acquisition Channels'],
  },
  legal: {
    id: 'legal',
    name: 'Legal Advisor',
    description: 'Business structure, compliance, and legal requirements',
    dependencies: [],
    priority: 1,
    systemPrompt: `You are a legal advisory AI agent. Your job is to outline legal requirements:
1. Recommended business structure (LLC, C-Corp, etc.) with rationale
2. Required licenses and permits by jurisdiction
3. Compliance requirements (industry-specific regulations)
4. Intellectual property considerations
5. Terms of service and privacy policy requirements
6. Risk areas and legal considerations
7. Formation checklist

Return your analysis as structured JSON with these sections.`,
    deliverables: ['Legal Structure', 'Compliance Checklist', 'Risk Assessment'],
  },
  technical_architect: {
    id: 'technical_architect',
    name: 'Technical Architect',
    description: 'System architecture and technology recommendations',
    dependencies: [],
    priority: 1,
    systemPrompt: `You are a technical architecture AI agent. Your job is to design the technical foundation:
1. System architecture overview (high-level diagram description)
2. Recommended tech stack with rationale
3. Database schema recommendations
4. API design and integrations needed
5. Infrastructure requirements (hosting, scaling)
6. Security architecture
7. Development timeline estimate
8. Technical risks and mitigation

Return your architecture as structured JSON with these sections.`,
    deliverables: ['System Architecture', 'Tech Stack', 'Database Design'],
  },
  financial_planner: {
    id: 'financial_planner',
    name: 'Financial Planner',
    description: 'Financial projections, costs, and pricing model',
    dependencies: ['business_analyst', 'product_designer', 'marketing', 'technical_architect'],
    priority: 2,
    systemPrompt: `You are a financial planning AI agent. Your job is to create financial projections:
1. Startup costs breakdown (one-time expenses)
2. Monthly operating expenses (recurring costs)
3. Revenue model and pricing strategy
4. 3-year financial projections (monthly for year 1, quarterly for years 2-3)
5. Break-even analysis
6. Funding requirements and use of funds
7. Unit economics (CAC, LTV, margins)
8. Key financial assumptions

Return your projections as structured JSON with detailed numbers suitable for a spreadsheet.`,
    deliverables: ['Financial Projections', 'Cost Analysis', 'Pricing Model', 'Funding Requirements'],
  },
  pitch: {
    id: 'pitch',
    name: 'Pitch Strategist',
    description: 'Investor pitch strategy and fundraising guidance',
    dependencies: ['business_analyst', 'financial_planner', 'product_designer', 'marketing'],
    priority: 3,
    systemPrompt: `You are a pitch strategy AI agent. Your job is to create an investor-ready narrative:
1. Elevator pitch (30 seconds)
2. Problem statement (compelling narrative)
3. Solution overview (unique value)
4. Market opportunity (TAM/SAM/SOM)
5. Business model summary
6. Traction and milestones
7. Competition and differentiation
8. Team requirements
9. Financial highlights
10. Funding ask and use of funds
11. Pitch deck outline (slide-by-slide)

Return your pitch strategy as structured JSON with these sections.`,
    deliverables: ['Pitch Deck Outline', 'Investment Narrative', 'Funding Strategy'],
  },
};

export class AgentOrchestrator {
  private tasks: Map<string, AgentTask> = new Map();
  private contexts: Map<string, BuildContext> = new Map();
  private wsClients: Map<string, WebSocket[]> = new Map();

  /**
   * Start orchestrating agents for a build
   */
  async startBuild(buildId: string, userPrompt: string): Promise<void> {
    // Initialize build context
    const context: BuildContext = {
      buildId,
      userPrompt,
      agentResults: new Map(),
    };
    this.contexts.set(buildId, context);

    // Create initial task records in database
    await this.initializeTasks(buildId);

    // Execute agents based on dependency graph
    await this.executeAgents(buildId, context);
  }

  /**
   * Initialize agent task records in database
   */
  private async initializeTasks(buildId: string): Promise<void> {
    const supabase = getSupabase();

    for (const agentType of Object.keys(AGENT_DEFINITIONS) as AgentType[]) {
      const task: AgentTask = {
        buildId,
        agentType,
        status: 'queued',
        progress: 0,
      };

      this.tasks.set(`${buildId}:${agentType}`, task);

      // Store in database
      await supabase.from('agent_executions').insert({
        build_id: buildId,
        agent_type: agentType,
        status: 'queued',
        progress: 0,
      });

      // Broadcast to WebSocket clients
      this.broadcast(buildId, {
        type: 'agent_queued',
        agent: agentType,
        task,
      });
    }
  }

  /**
   * Execute agents in parallel based on dependency graph
   */
  private async executeAgents(buildId: string, context: BuildContext): Promise<void> {
    // Group agents by priority (allows parallel execution within same priority)
    const agentsByPriority = new Map<number, AgentType[]>();

    for (const [agentType, definition] of Object.entries(AGENT_DEFINITIONS)) {
      const priority = definition.priority;
      if (!agentsByPriority.has(priority)) {
        agentsByPriority.set(priority, []);
      }
      agentsByPriority.get(priority)!.push(agentType as AgentType);
    }

    // Execute each priority level sequentially, but agents within same priority in parallel
    const priorities = Array.from(agentsByPriority.keys()).sort((a, b) => a - b);

    for (const priority of priorities) {
      const agents = agentsByPriority.get(priority)!;

      // Execute all agents at this priority level in parallel
      await Promise.all(
        agents.map(agentType => this.executeAgent(buildId, agentType, context))
      );
    }

    // After all agents complete, update build status
    await this.finalizeBuild(buildId);
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(
    buildId: string,
    agentType: AgentType,
    context: BuildContext
  ): Promise<void> {
    const taskKey = `${buildId}:${agentType}`;
    const task = this.tasks.get(taskKey)!;
    const definition = AGENT_DEFINITIONS[agentType];

    try {
      // Update status to running
      task.status = 'running';
      task.startedAt = new Date();
      await this.updateTaskInDB(task);
      this.broadcast(buildId, {
        type: 'agent_started',
        agent: agentType,
        task,
      });

      // Build context prompt with dependencies
      const contextPrompt = this.buildContextPrompt(agentType, context);

      // Execute agent with Claude
      const result = await this.runAgent(
        agentType,
        definition.systemPrompt,
        contextPrompt,
        (progress, activity) => {
          task.progress = progress;
          task.currentActivity = activity;
          this.updateTaskInDB(task);
          this.broadcast(buildId, {
            type: 'agent_progress',
            agent: agentType,
            progress,
            activity,
          });
        }
      );

      // Store result
      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date();
      task.result = result;
      context.agentResults.set(agentType, result);

      // Update database
      await this.updateTaskInDB(task);
      this.broadcast(buildId, {
        type: 'agent_completed',
        agent: agentType,
        task,
        result,
      });

      // Store result as document
      await this.storeAgentResult(buildId, agentType, result);

    } catch (error) {
      task.status = 'error';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();

      await this.updateTaskInDB(task);
      this.broadcast(buildId, {
        type: 'agent_error',
        agent: agentType,
        task,
        error: task.error,
      });
    }
  }

  /**
   * Build context prompt including results from dependency agents
   */
  private buildContextPrompt(agentType: AgentType, context: BuildContext): string {
    const definition = AGENT_DEFINITIONS[agentType];
    let prompt = `Business Idea:\n${context.userPrompt}\n\n`;

    // Add results from dependency agents
    if (definition.dependencies.length > 0) {
      prompt += 'Context from other agents:\n\n';

      for (const depType of definition.dependencies) {
        const depResult = context.agentResults.get(depType);
        if (depResult) {
          const depDef = AGENT_DEFINITIONS[depType];
          prompt += `${depDef.name}:\n${JSON.stringify(depResult, null, 2)}\n\n`;
        }
      }
    }

    prompt += `\nPlease analyze this business idea and provide your ${definition.name} analysis.`;

    return prompt;
  }

  /**
   * Execute agent with Claude API and simulate progress
   */
  private async runAgent(
    agentType: AgentType,
    systemPrompt: string,
    userPrompt: string,
    onProgress: (progress: number, activity: string) => void
  ): Promise<any> {
    const anthropic = getAnthropic();

    // Simulate progress stages
    const stages = [
      'Analyzing business concept...',
      'Researching market data...',
      'Generating insights...',
      'Structuring recommendations...',
      'Finalizing deliverables...',
    ];

    let currentStage = 0;

    // Start progress simulation
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++;
        const progress = (currentStage / stages.length) * 80; // Leave 20% for actual completion
        onProgress(progress, stages[currentStage]);
      }
    }, 2000);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      clearInterval(progressInterval);
      onProgress(90, 'Processing results...');

      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent && 'text' in textContent) {
        try {
          // Try to parse as JSON
          const result = JSON.parse(textContent.text);
          onProgress(100, 'Complete');
          return result;
        } catch {
          // If not valid JSON, return as text
          onProgress(100, 'Complete');
          return { analysis: textContent.text };
        }
      }

      throw new Error('No text content in response');
    } finally {
      clearInterval(progressInterval);
    }
  }

  /**
   * Update task in database
   */
  private async updateTaskInDB(task: AgentTask): Promise<void> {
    const supabase = getSupabase();

    await supabase
      .from('agent_executions')
      .update({
        status: task.status,
        progress: task.progress,
        current_activity: task.currentActivity,
        result: task.result,
        error_message: task.error,
        started_at: task.startedAt?.toISOString(),
        completed_at: task.completedAt?.toISOString(),
      })
      .eq('build_id', task.buildId)
      .eq('agent_type', task.agentType);
  }

  /**
   * Store agent result as a document
   */
  private async storeAgentResult(
    buildId: string,
    agentType: AgentType,
    result: any
  ): Promise<void> {
    const supabase = getSupabase();
    const definition = AGENT_DEFINITIONS[agentType];

    await supabase.from('build_documents').insert({
      build_id: buildId,
      document_type: agentType,
      title: definition.name,
      content: result,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Finalize build after all agents complete
   */
  private async finalizeBuild(buildId: string): Promise<void> {
    const supabase = getSupabase();
    const context = this.contexts.get(buildId);

    if (!context) return;

    // Update build status
    await supabase
      .from('generated_apps')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', buildId);

    // Generate spreadsheet data from financial planner
    const financialData = context.agentResults.get('financial_planner');
    if (financialData) {
      await this.generateSpreadsheet(buildId, financialData);
    }

    // Generate pitch deck outline
    const pitchData = context.agentResults.get('pitch');
    if (pitchData) {
      await this.generatePitchDeck(buildId, pitchData, context);
    }

    this.broadcast(buildId, {
      type: 'build_completed',
      buildId,
    });
  }

  /**
   * Generate spreadsheet from financial data
   */
  private async generateSpreadsheet(buildId: string, financialData: any): Promise<void> {
    const supabase = getSupabase();

    // Store spreadsheet data structure
    await supabase.from('build_spreadsheets').insert({
      build_id: buildId,
      spreadsheet_type: 'financial_model',
      data: financialData,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Generate pitch deck from all agent results
   */
  private async generatePitchDeck(
    buildId: string,
    pitchData: any,
    context: BuildContext
  ): Promise<void> {
    const supabase = getSupabase();

    // Compile all agent results for pitch deck
    const deckData = {
      pitch_outline: pitchData,
      business_analysis: context.agentResults.get('business_analyst'),
      product_design: context.agentResults.get('product_designer'),
      marketing_strategy: context.agentResults.get('marketing'),
      financial_projections: context.agentResults.get('financial_planner'),
      technical_overview: context.agentResults.get('technical_architect'),
    };

    await supabase.from('build_pitch_decks').insert({
      build_id: buildId,
      deck_data: deckData,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Register WebSocket client for real-time updates
   */
  registerClient(buildId: string, ws: WebSocket): void {
    if (!this.wsClients.has(buildId)) {
      this.wsClients.set(buildId, []);
    }
    this.wsClients.get(buildId)!.push(ws);

    // Send current state
    const tasks = Array.from(this.tasks.values())
      .filter(t => t.buildId === buildId);

    ws.send(JSON.stringify({
      type: 'initial_state',
      tasks,
    }));

    ws.on('close', () => {
      const clients = this.wsClients.get(buildId);
      if (clients) {
        const index = clients.indexOf(ws);
        if (index > -1) {
          clients.splice(index, 1);
        }
      }
    });
  }

  /**
   * Broadcast message to all clients watching a build
   */
  private broadcast(buildId: string, message: any): void {
    const clients = this.wsClients.get(buildId);
    if (!clients) return;

    const payload = JSON.stringify(message);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  /**
   * Get current status of a build
   */
  async getBuildStatus(buildId: string): Promise<AgentTask[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('build_id', buildId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ({
      buildId: row.build_id,
      agentType: row.agent_type,
      status: row.status,
      progress: row.progress || 0,
      currentActivity: row.current_activity,
      result: row.result,
      error: row.error_message,
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    }));
  }
}

// Singleton instance
let orchestrator: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

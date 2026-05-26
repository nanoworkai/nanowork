import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Table, Presentation, Sparkles } from "lucide-react";
import AgentCard, { type AgentType, type AgentStatus } from "../components/AgentCard";

interface AgentTask {
  buildId: string;
  agentType: AgentType;
  status: AgentStatus;
  progress: number;
  currentActivity?: string;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

interface Build {
  id: string;
  name: string;
  prompt: string;
  status: string;
  created_at: string;
}

interface Document {
  id: string;
  document_type: string;
  title: string;
  content: any;
  created_at: string;
}

const AGENT_DEFINITIONS = {
  business_analyst: {
    name: 'Business Analyst',
    description: 'Market research & competitive analysis',
    deliverables: ['Market Research', 'Customer Personas', 'Competitive Analysis', 'Business Model'],
  },
  product_designer: {
    name: 'Product Designer',
    description: 'Product design & roadmap',
    deliverables: ['Feature Specifications', 'User Flows', 'Product Roadmap'],
  },
  marketing: {
    name: 'Marketing Strategist',
    description: 'Go-to-market strategy',
    deliverables: ['GTM Strategy', 'Brand Positioning', 'Acquisition Channels'],
  },
  legal: {
    name: 'Legal Advisor',
    description: 'Business structure & compliance',
    deliverables: ['Legal Structure', 'Compliance Checklist', 'Risk Assessment'],
  },
  technical_architect: {
    name: 'Technical Architect',
    description: 'System architecture & tech stack',
    deliverables: ['System Architecture', 'Tech Stack', 'Database Design'],
  },
  financial_planner: {
    name: 'Financial Planner',
    description: 'Financial projections & pricing',
    deliverables: ['Financial Projections', 'Cost Analysis', 'Pricing Model', 'Funding Requirements'],
  },
  pitch: {
    name: 'Pitch Strategist',
    description: 'Investor pitch & fundraising',
    deliverables: ['Pitch Deck Outline', 'Investment Narrative', 'Funding Strategy'],
  },
};

export default function BuilderView() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [build, setBuild] = useState<Build | null>(null);
  const [agents, setAgents] = useState<Map<AgentType, AgentTask>>(new Map());
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadBuild();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [buildId]);

  async function loadBuild() {
    try {
      // Load build details
      const buildRes = await fetch(`${apiUrl}/builds/${buildId}`, {
        credentials: 'include',
      });

      if (!buildRes.ok) {
        throw new Error('Build not found');
      }

      const { build: buildData } = await buildRes.json();
      setBuild(buildData);

      // Load agent status
      const statusRes = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/status`, {
        credentials: 'include',
      });

      if (statusRes.ok) {
        const { tasks } = await statusRes.json();
        const agentMap = new Map<AgentType, AgentTask>();
        tasks.forEach((task: AgentTask) => {
          agentMap.set(task.agentType, task);
        });
        setAgents(agentMap);
      }

      // Load documents
      await loadDocuments();

      // Connect WebSocket for real-time updates
      connectWebSocket();

      setLoading(false);
    } catch (err) {
      console.error('Failed to load build:', err);
      setLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      const docsRes = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/documents`, {
        credentials: 'include',
      });

      if (docsRes.ok) {
        const { documents: docs } = await docsRes.json();
        setDocuments(docs);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }

  function connectWebSocket() {
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        buildId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (buildId) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  }

  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'initial_state':
        const agentMap = new Map<AgentType, AgentTask>();
        message.tasks.forEach((task: AgentTask) => {
          agentMap.set(task.agentType, task);
        });
        setAgents(agentMap);
        break;

      case 'agent_queued':
      case 'agent_started':
      case 'agent_progress':
      case 'agent_completed':
      case 'agent_error':
        setAgents((prev) => {
          const newMap = new Map(prev);
          newMap.set(message.agent, message.task);
          return newMap;
        });

        // Reload documents when an agent completes
        if (message.type === 'agent_completed') {
          loadDocuments();
        }
        break;

      case 'build_completed':
        if (build) {
          setBuild({ ...build, status: 'completed' });
        }
        loadDocuments();
        break;
    }
  }

  async function startBuild() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to start build');
      }
    } catch (err) {
      console.error('Failed to start build:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING BUILD...</p>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-mono text-white/60 mb-4">Build not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-mono text-white/60 hover:text-white"
        >
          ← BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  const allAgentsComplete = Array.from(agents.values()).every(
    (agent) => agent.status === 'completed' || agent.status === 'error'
  );

  const hasStarted = agents.size > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO OVERVIEW
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-white mb-2">{build.name}</h1>
            <p className="text-sm text-white/60 max-w-2xl leading-relaxed">{build.prompt}</p>
          </div>

          {!hasStarted && (
            <button
              onClick={startBuild}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 font-mono text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              START BUILDING
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {hasStarted && (
        <div className="mb-8 p-6 rounded-xl bg-surface-2 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-semibold text-white uppercase">
              Build Progress
            </h2>
            {allAgentsComplete && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-mono font-semibold text-green-400">
                  BUILD COMPLETE
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {(Object.keys(AGENT_DEFINITIONS) as AgentType[]).map((agentType) => {
              const agent = agents.get(agentType);
              const status = agent?.status || 'queued';

              return (
                <div key={agentType} className="text-center">
                  <div
                    className={`h-1 rounded-full mb-2 ${
                      status === 'completed'
                        ? 'bg-green-400'
                        : status === 'running'
                        ? 'bg-white animate-pulse'
                        : status === 'error'
                        ? 'bg-red-400'
                        : 'bg-white/20'
                    }`}
                  />
                  <span className="text-xs text-white/40 font-mono">
                    {AGENT_DEFINITIONS[agentType].name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Grid */}
      {hasStarted && (
        <div className="mb-8">
          <h2 className="text-lg font-mono font-bold text-white mb-4">AI Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(AGENT_DEFINITIONS) as AgentType[]).map((agentType) => {
              const definition = AGENT_DEFINITIONS[agentType];
              const agent = agents.get(agentType);

              return (
                <AgentCard
                  key={agentType}
                  agentType={agentType}
                  name={definition.name}
                  description={definition.description}
                  status={agent?.status || 'queued'}
                  progress={agent?.progress || 0}
                  currentActivity={agent?.currentActivity}
                  deliverables={definition.deliverables}
                  error={agent?.error}
                  onViewDetails={
                    agent?.status === 'completed'
                      ? () => {
                          const doc = documents.find((d) => d.document_type === agentType);
                          if (doc) setSelectedDocument(doc);
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Deliverables */}
      {allAgentsComplete && documents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-mono font-bold text-white mb-4">Deliverables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/dashboard/builds/${buildId}/documents`)}
              className="p-6 border border-white/10 bg-surface-2 hover:bg-surface-1 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-white text-sm">Documents</h3>
                  <p className="text-xs text-white/60">{documents.length} documents</p>
                </div>
              </div>
              <p className="text-xs text-white/60">
                All agent analysis and recommendations
              </p>
            </button>

            <button
              onClick={() => navigate(`/dashboard/builds/${buildId}/spreadsheet`)}
              className="p-6 border border-white/10 bg-surface-2 hover:bg-surface-1 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Table className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-white text-sm">Financial Model</h3>
                  <p className="text-xs text-white/60">3-year projections</p>
                </div>
              </div>
              <p className="text-xs text-white/60">
                Revenue, costs, and funding requirements
              </p>
            </button>

            <button
              onClick={() => navigate(`/dashboard/builds/${buildId}/pitch-deck`)}
              className="p-6 border border-white/10 bg-surface-2 hover:bg-surface-1 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-white text-sm">Pitch Deck</h3>
                  <p className="text-xs text-white/60">Investor-ready</p>
                </div>
              </div>
              <p className="text-xs text-white/60">
                Complete investor presentation
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="bg-surface-1 border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-mono font-bold text-white">{selectedDocument.title}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-white/60 hover:text-white text-sm font-mono"
              >
                CLOSE
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap">
                {JSON.stringify(selectedDocument.content, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

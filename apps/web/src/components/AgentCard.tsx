import {
  Brain,
  TrendingUp,
  Palette,
  Megaphone,
  Scale,
  Code2,
  Presentation,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';

export type AgentType =
  | 'business_analyst'
  | 'financial_planner'
  | 'product_designer'
  | 'marketing'
  | 'legal'
  | 'technical_architect'
  | 'pitch';

export type AgentStatus = 'queued' | 'running' | 'completed' | 'error';

export interface AgentCardProps {
  agentType: AgentType;
  name: string;
  description: string;
  status: AgentStatus;
  progress: number;
  currentActivity?: string;
  deliverables: string[];
  error?: string;
  onViewDetails?: () => void;
}

const AGENT_ICONS: Record<AgentType, React.ComponentType<any>> = {
  business_analyst: Brain,
  financial_planner: TrendingUp,
  product_designer: Palette,
  marketing: Megaphone,
  legal: Scale,
  technical_architect: Code2,
  pitch: Presentation,
};

const AGENT_COLORS: Record<AgentType, string> = {
  business_analyst: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  financial_planner: 'from-green-500/20 to-green-600/20 border-green-500/30',
  product_designer: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  marketing: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  legal: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  technical_architect: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  pitch: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
};

const AGENT_ICON_COLORS: Record<AgentType, string> = {
  business_analyst: 'text-blue-400',
  financial_planner: 'text-green-400',
  product_designer: 'text-purple-400',
  marketing: 'text-pink-400',
  legal: 'text-amber-400',
  technical_architect: 'text-cyan-400',
  pitch: 'text-indigo-400',
};

export default function AgentCard({
  agentType,
  name,
  description,
  status,
  progress,
  currentActivity,
  deliverables,
  error,
  onViewDetails,
}: AgentCardProps) {
  const Icon = AGENT_ICONS[agentType];
  const colorClass = AGENT_COLORS[agentType];
  const iconColor = AGENT_ICON_COLORS[agentType];

  const getStatusIcon = () => {
    switch (status) {
      case 'queued':
        return <Clock className="w-4 h-4 text-white/40" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'queued':
        return 'Queued';
      case 'running':
        return 'Working...';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'queued':
        return 'text-white/40';
      case 'running':
        return 'text-white';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
    }
  };

  return (
    <div
      className={`relative border bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] ${
        status === 'running' ? 'shadow-lg shadow-white/10' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-white text-sm">{name}</h3>
            <p className="text-xs text-white/60 mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-xs font-mono font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {status !== 'queued' && (
        <div className="mb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                status === 'error' ? 'bg-red-400' : 'bg-white/60'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/60 font-mono">{progress}%</span>
            {currentActivity && status === 'running' && (
              <span className="text-xs text-white/80 font-mono animate-pulse">
                {currentActivity}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && status === 'error' && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Deliverables */}
      <div>
        <h4 className="text-xs font-mono font-semibold text-white/60 uppercase mb-2">
          Deliverables
        </h4>
        <div className="space-y-1.5">
          {deliverables.map((deliverable, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  status === 'completed'
                    ? 'bg-green-400'
                    : status === 'running'
                    ? 'bg-white/60 animate-pulse'
                    : 'bg-white/20'
                }`}
              />
              <span className="text-xs font-mono text-white/80">{deliverable}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Details Button */}
      {status === 'completed' && onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-4 w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-mono text-white transition-colors"
        >
          View Details
        </button>
      )}

      {/* Pulsing indicator for active agents */}
      {status === 'running' && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/60 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </div>
      )}
    </div>
  );
}

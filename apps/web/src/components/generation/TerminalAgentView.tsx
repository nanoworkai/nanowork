import { CheckCircle2, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export interface AgentStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  currentActivity?: string;
  completedAt?: string;
  duration?: string;
}

interface TerminalAgentViewProps {
  agents: AgentStatus[];
}

export function TerminalAgentView({ agents }: TerminalAgentViewProps) {
  return (
    <div className="space-y-2 font-mono text-sm">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
        >
          <div className="flex-shrink-0 mt-0.5">
            {agent.status === 'completed' && (
              <CheckCircle2 className="w-5 h-5 text-fintech-green" />
            )}
            {agent.status === 'running' && (
              <Loader2 className="w-5 h-5 text-fintech-cyan animate-spin" />
            )}
            {agent.status === 'pending' && (
              <Clock className="w-5 h-5 text-text-secondary" />
            )}
            {agent.status === 'failed' && (
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-xs">✕</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                agent.status === 'completed' ? 'text-fintech-green' :
                agent.status === 'running' ? 'text-fintech-cyan' :
                agent.status === 'failed' ? 'text-red-500' :
                'text-text-secondary'
              }`}>
                {agent.name}
              </span>
              {agent.status === 'completed' && agent.duration && (
                <span className="text-xs text-text-tertiary">
                  completed in {agent.duration}
                </span>
              )}
            </div>

            {agent.status === 'running' && (
              <>
                {agent.progress !== undefined && (
                  <div className="mt-2 w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-fintech-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                {agent.currentActivity && (
                  <p className="mt-1 text-xs text-text-secondary truncate">
                    {agent.currentActivity}
                  </p>
                )}
              </>
            )}

            {agent.status === 'pending' && (
              <p className="mt-1 text-xs text-text-tertiary">queued</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

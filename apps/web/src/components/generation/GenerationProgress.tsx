import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

interface GenerationProgressProps {
  totalAgents: number;
  completedAgents: number;
  runningAgents: number;
  confidence?: number;
  estimatedTimeRemaining?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export function GenerationProgress({
  totalAgents,
  completedAgents,
  runningAgents,
  confidence,
  estimatedTimeRemaining,
  status,
}: GenerationProgressProps) {
  const progress = totalAgents > 0 ? (completedAgents / totalAgents) * 100 : 0;

  return (
    <div className="bg-surface-2 rounded-lg border border-surface-3 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Company Generation Progress
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {completedAgents} of {totalAgents} agents completed
            {runningAgents > 0 && ` • ${runningAgents} running`}
          </p>
        </div>

        {status === 'completed' && (
          <div className="flex items-center gap-2 text-fintech-green">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}

        {status === 'running' && estimatedTimeRemaining && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{estimatedTimeRemaining} remaining</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="relative">
          <div className="w-full h-3 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-fintech-cyan to-fintech-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="absolute right-0 top-4 text-xs text-text-tertiary font-mono">
            {progress.toFixed(0)}%
          </span>
        </div>

        {/* Confidence score */}
        {confidence !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Confidence Score</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    confidence >= 0.8 ? 'bg-fintech-green' :
                    confidence >= 0.6 ? 'bg-yellow-500' :
                    'bg-orange-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
              <span className="font-mono text-text-primary font-medium">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

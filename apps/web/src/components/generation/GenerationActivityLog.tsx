import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  detail?: string;
}

interface GenerationActivityLogProps {
  entries: ActivityLogEntry[];
  maxHeight?: string;
}

export function GenerationActivityLog({
  entries,
  maxHeight = '300px'
}: GenerationActivityLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div
      className="bg-surface-2 rounded-lg border border-surface-3 overflow-hidden"
      style={{ maxHeight }}
    >
      <div className="px-4 py-2 bg-surface-3 border-b border-surface-3">
        <h3 className="text-sm font-medium text-text-primary font-mono">
          Activity Log
        </h3>
      </div>

      <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: `calc(${maxHeight} - 40px)` }}>
        <AnimatePresence initial={false}>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-xs leading-relaxed"
            >
              <span className="text-text-tertiary">[{entry.timestamp}]</span>{' '}
              <span className="text-fintech-cyan font-medium">{entry.agent}:</span>{' '}
              <span className="text-text-secondary">{entry.action}</span>
              {entry.detail && (
                <div className="ml-6 text-text-tertiary mt-0.5">
                  → {entry.detail}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

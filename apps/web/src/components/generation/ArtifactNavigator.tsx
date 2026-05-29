import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Artifact {
  id: string;
  title: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'code';
  status: 'generating' | 'ready' | 'failed';
  url?: string;
  size?: string;
  generatedAt?: string;
}

interface ArtifactNavigatorProps {
  artifacts: Artifact[];
  onDownload?: (artifact: Artifact) => void;
  onView?: (artifact: Artifact) => void;
}

export function ArtifactNavigator({
  artifacts,
  onDownload,
  onView
}: ArtifactNavigatorProps) {
  const getIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'document':
      case 'spreadsheet':
      case 'presentation':
      case 'code':
        return FileText;
    }
  };

  const getTypeColor = (type: Artifact['type']) => {
    switch (type) {
      case 'document':
        return 'text-blue-400';
      case 'spreadsheet':
        return 'text-green-400';
      case 'presentation':
        return 'text-orange-400';
      case 'code':
        return 'text-purple-400';
    }
  };

  return (
    <div className="bg-surface-2 rounded-lg border border-surface-3 overflow-hidden">
      <div className="px-4 py-3 bg-surface-3 border-b border-surface-3">
        <h3 className="text-sm font-medium text-text-primary">
          Generated Artifacts
        </h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          {artifacts.filter(a => a.status === 'ready').length} / {artifacts.length} ready
        </p>
      </div>

      <div className="divide-y divide-surface-3">
        {artifacts.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary text-sm">
            No artifacts generated yet
          </div>
        ) : (
          artifacts.map((artifact, index) => {
            const Icon = getIcon(artifact.type);
            const colorClass = getTypeColor(artifact.type);

            return (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-surface-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorClass}`} />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {artifact.title}
                    </h4>

                    {artifact.status === 'generating' && (
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin text-fintech-cyan" />
                        <span className="text-xs text-text-secondary">Generating...</span>
                      </div>
                    )}

                    {artifact.status === 'ready' && (
                      <div className="flex items-center gap-3 mt-2">
                        {artifact.size && (
                          <span className="text-xs text-text-tertiary">{artifact.size}</span>
                        )}
                        <div className="flex items-center gap-2">
                          {onView && (
                            <button
                              onClick={() => onView(artifact)}
                              className="text-xs text-fintech-cyan hover:text-fintech-cyan/80 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </button>
                          )}
                          {onDownload && (
                            <button
                              onClick={() => onDownload(artifact)}
                              className="text-xs text-fintech-green hover:text-fintech-green/80 transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {artifact.status === 'failed' && (
                      <span className="text-xs text-red-500 mt-1 block">
                        Generation failed
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

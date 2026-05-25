/**
 * Documents - Word-like document editor
 *
 * For agent briefings, reports, SOPs, and project documentation
 */

import { useState } from 'react';
import { Plus, FileText, Search, Clock } from 'lucide-react';

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white mb-2">
              Documents
            </h1>
            <p className="text-sm font-mono text-white/60">
              Reports, briefings, and project documentation
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Plus className="w-4 h-4" />
            NEW DOCUMENT
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-12 pr-4 py-3 text-sm font-mono text-white bg-surface-1 border border-white/10 rounded-none outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="w-12 h-12 text-white/20 mb-4" />
          <h3 className="text-lg font-mono font-bold text-white/60 mb-2">
            No documents yet
          </h3>
          <p className="text-sm font-mono text-white/40 mb-6">
            Create your first document or import existing files
          </p>
          <button
            className="px-6 py-3 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            CREATE DOCUMENT
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-surface-1 border border-white/10 rounded-none">
          <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">
            🚧 Coming Soon
          </h3>
          <p className="text-xs font-mono text-white/60 leading-relaxed">
            Word-like rich text editor with formatting, styles, comments, and track changes.
            Perfect for agent briefings and project reports.
          </p>
        </div>
      </div>
    </div>
  );
}

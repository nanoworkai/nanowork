/**
 * Files - OneDrive-like file manager
 *
 * For agent deliverables, shared resources, and build artifacts
 */

import { useState } from 'react';
import { Upload, FolderOpen, Search, Grid3x3, List } from 'lucide-react';

export default function Files() {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white mb-2">
              Files
            </h1>
            <p className="text-sm font-mono text-white/60">
              File storage, sharing, and version history
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Upload className="w-4 h-4" />
            UPLOAD FILES
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files and folders..."
              className="w-full pl-12 pr-4 py-3 text-sm font-mono text-white bg-surface-1 border border-white/10 rounded-none outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-white/10 rounded-none overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 transition-colors ${
                view === 'grid'
                  ? 'bg-white text-black'
                  : 'bg-surface-1 text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 transition-colors ${
                view === 'list'
                  ? 'bg-white text-black'
                  : 'bg-surface-1 text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="w-12 h-12 text-white/20 mb-4" />
          <h3 className="text-lg font-mono font-bold text-white/60 mb-2">
            No files yet
          </h3>
          <p className="text-sm font-mono text-white/40 mb-6">
            Upload files or create folders to get started
          </p>
          <button
            className="px-6 py-3 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            UPLOAD FILES
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-surface-1 border border-white/10 rounded-none">
          <h3 className="text-sm font-mono font-bold text-white mb-2 uppercase">
            🚧 Coming Soon
          </h3>
          <p className="text-xs font-mono text-white/60 leading-relaxed">
            OneDrive-like file manager with drag-drop upload, folder organization, sharing,
            and version history. Perfect for managing agent deliverables and shared resources.
          </p>
        </div>
      </div>
    </div>
  );
}

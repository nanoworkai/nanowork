/**
 * Spreadsheets Dashboard Page
 *
 * Browse templates, manage workbooks, and launch the spreadsheet editor
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Clock,
  Trash2,
  Download,
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react';
import { TEMPLATES, type Template } from '../lib/spreadsheet/templates';
import SpreadsheetEditor from '../components/SpreadsheetEditor';

// ───────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────

interface Workbook {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
}

// ───────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────────────────────────────────

export default function Spreadsheets() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<'list' | 'templates' | 'editor'>('list');
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [filteredWorkbooks, setFilteredWorkbooks] = useState<Workbook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWorkbookId, setSelectedWorkbookId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>('all');

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // ─── Load Workbooks ──────────────────────────────────────────────────────

  const loadWorkbooks = async () => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiUrl}/api/spreadsheets/workbooks`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const { workbooks: data } = await res.json();
        setWorkbooks(data);
        setFilteredWorkbooks(data);
      }
    } catch (error) {
      console.error('Failed to load workbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkbooks();
  }, [session]);

  // ─── Search ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWorkbooks(workbooks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workbooks.filter(
      (wb) =>
        wb.name.toLowerCase().includes(query) ||
        wb.description?.toLowerCase().includes(query)
    );
    setFilteredWorkbooks(filtered);
  }, [searchQuery, workbooks]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleCreateBlank = async () => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiUrl}/api/spreadsheets/workbooks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Untitled Workbook',
        }),
      });

      if (res.ok) {
        const { workbook } = await res.json();
        setSelectedWorkbookId(workbook.id);
        setView('editor');
      }
    } catch (error) {
      console.error('Failed to create workbook:', error);
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    if (!session?.access_token) return;

    try {
      const res = await fetch(`${apiUrl}/api/spreadsheets/workbooks/from-template`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: template.id,
          name: template.name,
          template_data: template,
        }),
      });

      if (res.ok) {
        const { workbook } = await res.json();
        setSelectedWorkbookId(workbook.id);
        setView('editor');
      }
    } catch (error) {
      console.error('Failed to create workbook from template:', error);
    }
  };

  const handleOpenWorkbook = (id: string) => {
    setSelectedWorkbookId(id);
    setView('editor');
  };

  const handleDeleteWorkbook = async (id: string) => {
    if (!session?.access_token) return;
    if (!confirm('Delete this workbook? This cannot be undone.')) return;

    try {
      const res = await fetch(`${apiUrl}/api/spreadsheets/workbooks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        await loadWorkbooks();
      }
    } catch (error) {
      console.error('Failed to delete workbook:', error);
    }
  };

  const handleCloseEditor = () => {
    setView('list');
    setSelectedWorkbookId(null);
    loadWorkbooks();
  };

  // ─── Render: Editor ──────────────────────────────────────────────────────

  if (view === 'editor' && selectedWorkbookId) {
    return (
      <div className="h-screen">
        <SpreadsheetEditor
          workbookId={selectedWorkbookId}
          onClose={handleCloseEditor}
        />
      </div>
    );
  }

  // ─── Render: Templates ───────────────────────────────────────────────────

  if (view === 'templates') {
    const filteredTemplates =
      selectedCategory === 'all'
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.category === selectedCategory);

    return (
      <div className="min-h-screen bg-surface-0 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setView('list')}
              className="text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
            >
              ← BACK TO WORKBOOKS
            </button>
            <h1 className="text-2xl font-mono font-bold text-white mb-2">
              Template Library
            </h1>
            <p className="text-sm font-mono text-white/60">
              Pre-built spreadsheets for financial modeling and business planning
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedCategory('financial')}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                selectedCategory === 'financial'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              FINANCIAL
            </button>
            <button
              onClick={() => setSelectedCategory('budget')}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                selectedCategory === 'budget'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              BUDGET
            </button>
            <button
              onClick={() => setSelectedCategory('planning')}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                selectedCategory === 'planning'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              PLANNING
            </button>
            <button
              onClick={() => setSelectedCategory('analysis')}
              className={`px-4 py-2 rounded-none text-xs font-mono font-bold uppercase transition-colors whitespace-nowrap ${
                selectedCategory === 'analysis'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              ANALYSIS
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-surface-1 border border-white/10 rounded-none p-6 hover:border-white/20 transition-colors group cursor-pointer"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-mono font-bold text-white mb-1 truncate">
                      {template.name}
                    </h3>
                    <p className="text-xs font-mono text-white/60 uppercase">
                      {template.category}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-mono text-white/50 leading-relaxed mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/40">
                    {template.sheets.length} sheet{template.sheets.length !== 1 ? 's' : ''}
                  </span>
                  <button className="px-4 py-2 rounded-none bg-white/5 group-hover:bg-white group-hover:text-black text-xs font-mono text-white transition-colors">
                    USE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Workbooks List ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white mb-2">
              Spreadsheets
            </h1>
            <p className="text-sm font-mono text-white/60">
              Financial modeling, budgets, and business planning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('templates')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              TEMPLATES
            </button>
            <button
              onClick={handleCreateBlank}
              className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Plus className="w-4 h-4" />
              NEW WORKBOOK
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workbooks..."
            className="w-full pl-12 pr-4 py-3 text-sm font-mono text-white bg-surface-1 border border-white/10 rounded-none outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Workbooks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-mono text-white/60">LOADING...</p>
            </div>
          </div>
        ) : filteredWorkbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileSpreadsheet className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-mono font-bold text-white/60 mb-2">
              {searchQuery ? 'No workbooks found' : 'No workbooks yet'}
            </h3>
            <p className="text-sm font-mono text-white/40 mb-6">
              {searchQuery
                ? 'Try a different search query'
                : 'Create your first workbook or browse templates'}
            </p>
            {!searchQuery && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('templates')}
                  className="px-6 py-3 rounded-none bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
                >
                  BROWSE TEMPLATES
                </button>
                <button
                  onClick={handleCreateBlank}
                  className="px-6 py-3 rounded-none bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  CREATE BLANK
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkbooks.map((workbook) => {
              const lastAccessed = workbook.last_accessed_at || workbook.updated_at;
              const date = new Date(lastAccessed);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);

              let timeAgo = '';
              if (diffMins < 1) timeAgo = 'Just now';
              else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
              else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
              else if (diffDays === 1) timeAgo = 'Yesterday';
              else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
              else timeAgo = date.toLocaleDateString();

              return (
                <div
                  key={workbook.id}
                  className="bg-surface-1 border border-white/10 rounded-none p-6 hover:border-white/20 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-mono font-bold text-white mb-1 truncate">
                        {workbook.name}
                      </h3>
                      <p className="text-xs font-mono text-white/40 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkbook(workbook.id);
                      }}
                      className="p-2 rounded-none hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {workbook.description && (
                    <p className="text-xs font-mono text-white/50 leading-relaxed mb-4 line-clamp-2">
                      {workbook.description}
                    </p>
                  )}

                  <button
                    onClick={() => handleOpenWorkbook(workbook.id)}
                    className="w-full py-2 rounded-none bg-white/5 hover:bg-white hover:text-black text-xs font-mono text-white font-bold uppercase transition-colors"
                  >
                    OPEN
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {!loading && workbooks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-1 border border-white/10 rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40 uppercase">Workbooks</span>
                </div>
                <p className="text-xl font-mono font-bold text-white">{workbooks.length}</p>
              </div>
              <div className="bg-surface-1 border border-white/10 rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40 uppercase">Templates</span>
                </div>
                <p className="text-xl font-mono font-bold text-white">{TEMPLATES.length}</p>
              </div>
              <div className="bg-surface-1 border border-white/10 rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40 uppercase">AI Assisted</span>
                </div>
                <p className="text-xl font-mono font-bold text-white">Coming Soon</p>
              </div>
              <div className="bg-surface-1 border border-white/10 rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40 uppercase">Export</span>
                </div>
                <p className="text-xl font-mono font-bold text-white">CSV/PDF</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documents - Centralized view of all documents across builds
 *
 * Shows all agent-generated documents from completed builds
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ExternalLink, Calendar } from 'lucide-react';

interface Document {
  id: string;
  document_type: string;
  title: string;
  content: any;
  created_at: string;
  build_id: string;
  build_name: string;
}

const AGENT_NAMES: Record<string, string> = {
  business_analyst: 'Business Analyst',
  financial_planner: 'Financial Planner',
  product_designer: 'Product Designer',
  marketing: 'Marketing Strategist',
  legal: 'Legal Advisor',
  technical_architect: 'Technical Architect',
  pitch: 'Pitch Strategist',
};

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadAllDocuments();
  }, []);

  async function loadAllDocuments() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/documents`, {
        credentials: 'include',
      });

      if (res.ok) {
        const { documents: docs } = await res.json();
        setDocuments(docs);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.build_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      AGENT_NAMES[doc.document_type]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group documents by build
  const documentsByBuild = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.build_id]) {
      acc[doc.build_id] = {
        buildId: doc.build_id,
        buildName: doc.build_name,
        documents: [],
      };
    }
    acc[doc.build_id].documents.push(doc);
    return acc;
  }, {} as Record<string, { buildId: string; buildName: string; documents: Document[] }>);

  const builds = Object.values(documentsByBuild).sort((a, b) => {
    const aNewest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
    const bNewest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
    return bNewest - aNewest;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-white/60">LOADING DOCUMENTS...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white mb-2">
              All Documents
            </h1>
            <p className="text-sm font-mono text-white/60">
              Agent-generated documents across all your builds
            </p>
          </div>
          <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
            <span className="text-sm font-mono text-white">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, builds, or agents..."
            className="w-full pl-12 pr-4 py-3 text-sm font-mono text-white bg-surface-1 border border-white/10 rounded-lg outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Documents by Build */}
        {builds.length > 0 ? (
          <div className="space-y-8">
            {builds.map(({ buildId, buildName, documents: buildDocs }) => (
              <div key={buildId} className="border border-white/10 bg-surface-1 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-mono font-bold text-white text-lg mb-1">{buildName}</h2>
                    <p className="text-xs text-white/60">
                      {buildDocs.length} {buildDocs.length === 1 ? 'document' : 'documents'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/builds/${buildId}/documents`)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                  >
                    VIEW ALL
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {buildDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigate(`/dashboard/builds/${buildId}/documents`)}
                      className="p-4 border border-white/10 bg-surface-2 hover:bg-white/5 rounded-lg text-left transition-all group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-mono text-sm font-semibold text-white mb-1 truncate">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-white/40">
                            {AGENT_NAMES[doc.document_type] || doc.document_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-mono font-bold text-white/60 mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-sm font-mono text-white/40 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Complete a build to generate documents'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-lg bg-white hover:bg-white/90 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                CREATE A BUILD
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

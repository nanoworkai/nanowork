import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download } from "lucide-react";

interface Document {
  id: string;
  document_type: string;
  title: string;
  content: any;
  created_at: string;
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

export default function BuildDocuments() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadDocuments();
  }, [buildId]);

  async function loadDocuments() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/documents`, {
        credentials: 'include',
      });

      if (res.ok) {
        const { documents: docs } = await res.json();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDoc(docs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }

  function downloadDocument(doc: Document) {
    const blob = new Blob([JSON.stringify(doc.content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadAllDocuments() {
    const allDocs = documents.reduce((acc, doc) => {
      acc[doc.document_type] = doc.content;
      return acc;
    }, {} as Record<string, any>);

    const blob = new Blob([JSON.stringify(allDocs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-analysis-${buildId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING DOCUMENTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/dashboard/builder/${buildId}`)}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO BUILDER
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-white mb-2">Business Documents</h1>
            <p className="text-sm text-white/60">All analysis and recommendations from your AI team</p>
          </div>

          <button
            onClick={downloadAllDocuments}
            disabled={documents.length === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD ALL
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedDoc?.id === doc.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-surface-2 border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-white mb-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-white/40">
                      {AGENT_NAMES[doc.document_type] || doc.document_type}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9">
          {selectedDoc ? (
            <div className="border border-white/10 bg-surface-2 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-mono font-bold text-white text-lg">{selectedDoc.title}</h2>
                  <p className="text-sm text-white/60 mt-1">
                    Generated on {new Date(selectedDoc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadDocument(selectedDoc)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  DOWNLOAD
                </button>
              </div>

              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  {renderContent(selectedDoc.content)}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-white/10 bg-surface-2 rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-sm text-white/60">Select a document to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderContent(content: any): React.ReactNode {
  if (typeof content === 'string') {
    return <p className="text-white/80 whitespace-pre-wrap">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="list-disc list-inside space-y-2">
        {content.map((item, index) => (
          <li key={index} className="text-white/80">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-6">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <h3 className="text-white font-mono font-semibold text-base mb-3 capitalize">
              {key.replace(/_/g, ' ')}
            </h3>
            <div className="ml-4">{renderContent(value)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-white/80">{String(content)}</p>;
}

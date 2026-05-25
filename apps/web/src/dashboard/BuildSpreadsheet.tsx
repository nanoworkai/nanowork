import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Table } from "lucide-react";

interface Spreadsheet {
  id: string;
  build_id: string;
  spreadsheet_type: string;
  title: string;
  data: any;
  created_at: string;
}

const SPREADSHEET_TYPES: Record<string, string> = {
  financial_model: 'Financial Model',
  revenue_projections: 'Revenue Projections',
  cost_analysis: 'Cost Analysis',
  cash_flow: 'Cash Flow Statement',
  balance_sheet: 'Balance Sheet',
  income_statement: 'Income Statement',
  break_even: 'Break-Even Analysis',
  funding_requirements: 'Funding Requirements',
};

export default function BuildSpreadsheet() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<Spreadsheet | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadSpreadsheets();
  }, [buildId]);

  async function loadSpreadsheets() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/spreadsheets`, {
        credentials: 'include',
      });

      if (res.ok) {
        const { spreadsheets: data } = await res.json();
        setSpreadsheets(data);
        if (data.length > 0) {
          setSelectedSpreadsheet(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load spreadsheets:', err);
    } finally {
      setLoading(false);
    }
  }

  function downloadSpreadsheet(sheet: Spreadsheet) {
    if (!sheet?.data) return;

    // Generate CSV from spreadsheet data
    const data = sheet.data;
    let csv = `${sheet.title || SPREADSHEET_TYPES[sheet.spreadsheet_type] || 'Spreadsheet'}\n\n`;

    // Add sections
    if (data.startup_costs) {
      csv += 'Startup Costs\n';
      csv += 'Category,Amount\n';
      Object.entries(data.startup_costs).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
      csv += '\n';
    }

    if (data.monthly_expenses) {
      csv += 'Monthly Operating Expenses\n';
      csv += 'Category,Amount\n';
      Object.entries(data.monthly_expenses).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
      csv += '\n';
    }

    if (data.revenue_projections) {
      csv += 'Revenue Projections\n';
      csv += 'Period,Revenue\n';
      Object.entries(data.revenue_projections).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
      csv += '\n';
    }

    // Handle other structured data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'startup_costs' && key !== 'monthly_expenses' && key !== 'revenue_projections') {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          csv += `${key.replace(/_/g, ' ').toUpperCase()}\n`;
          csv += 'Item,Value\n';
          Object.entries(value).forEach(([k, v]) => {
            csv += `${k},${v}\n`;
          });
          csv += '\n';
        }
      }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(sheet.title || sheet.spreadsheet_type).toLowerCase().replace(/\s+/g, '-')}-${buildId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadAllSpreadsheets() {
    spreadsheets.forEach((sheet) => {
      setTimeout(() => downloadSpreadsheet(sheet), 100);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-white/60">LOADING SPREADSHEETS...</p>
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
            <h1 className="text-3xl font-mono font-bold text-white mb-2">Financial Spreadsheets</h1>
            <p className="text-sm text-white/60">All financial models and projections from your AI team</p>
          </div>

          <button
            onClick={downloadAllSpreadsheets}
            disabled={spreadsheets.length === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD ALL
          </button>
        </div>
      </div>

      {/* Spreadsheets Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="space-y-2">
            {spreadsheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedSpreadsheet(sheet)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedSpreadsheet?.id === sheet.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-surface-2 border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Table className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-white mb-1">
                      {sheet.title || SPREADSHEET_TYPES[sheet.spreadsheet_type] || sheet.spreadsheet_type}
                    </h3>
                    <p className="text-xs text-white/40">
                      {new Date(sheet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9">
          {selectedSpreadsheet ? (
            <div className="border border-white/10 bg-surface-2 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-mono font-bold text-white text-lg">
                    {selectedSpreadsheet.title || SPREADSHEET_TYPES[selectedSpreadsheet.spreadsheet_type] || selectedSpreadsheet.spreadsheet_type}
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    Generated on {new Date(selectedSpreadsheet.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadSpreadsheet(selectedSpreadsheet)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  DOWNLOAD
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {renderFinancialSection('Startup Costs', selectedSpreadsheet.data.startup_costs)}
                  {renderFinancialSection('Monthly Operating Expenses', selectedSpreadsheet.data.monthly_expenses)}
                  {renderFinancialSection('Revenue Projections', selectedSpreadsheet.data.revenue_projections)}
                  {renderFinancialSection('Financial Metrics', selectedSpreadsheet.data.metrics)}
                  {renderFinancialSection('Funding Requirements', selectedSpreadsheet.data.funding)}

                  {/* Raw Data View */}
                  <div className="border border-white/10 bg-surface-1 rounded-xl p-6">
                    <h3 className="font-mono font-bold text-white text-base mb-4">Complete Data (JSON)</h3>
                    <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(selectedSpreadsheet.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-white/10 bg-surface-2 rounded-xl p-12 text-center">
              <Table className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-sm text-white/60">
                {spreadsheets.length === 0
                  ? "No spreadsheets available yet"
                  : "Select a spreadsheet to view"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderFinancialSection(title: string, data: any): React.ReactNode {
  if (!data) return null;

  return (
    <div className="border border-white/10 bg-surface-1 rounded-xl p-6">
      <h3 className="font-mono font-bold text-white text-base mb-4">{title}</h3>

      {typeof data === 'object' && !Array.isArray(data) ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-mono text-xs text-white/60">Item</th>
                <th className="text-right py-3 px-4 font-mono text-xs text-white/60">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                <tr key={key} className="border-b border-white/5">
                  <td className="py-3 px-4 text-sm text-white/80 capitalize">
                    {key.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-sm text-white font-mono text-right">
                    {formatValue(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : Array.isArray(data) ? (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="text-sm text-white/80 py-2 border-b border-white/5">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/80">{String(data)}</p>
      )}
    </div>
  );
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  if (typeof value === 'string' && value.match(/^\d+(\.\d+)?$/)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  }
  return String(value);
}

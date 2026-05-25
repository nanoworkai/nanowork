import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Table } from "lucide-react";

interface Spreadsheet {
  id: string;
  spreadsheet_type: string;
  data: any;
  created_at: string;
}

export default function BuildSpreadsheet() {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();

  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadSpreadsheet();
  }, [buildId]);

  async function loadSpreadsheet() {
    try {
      const res = await fetch(`${apiUrl}/agent-orchestrator/builds/${buildId}/spreadsheet`, {
        credentials: 'include',
      });

      if (res.ok) {
        const { spreadsheet: data } = await res.json();
        setSpreadsheet(data);
      }
    } catch (err) {
      console.error('Failed to load spreadsheet:', err);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!spreadsheet?.data) return;

    // Simple CSV generation from financial data
    const data = spreadsheet.data;
    let csv = 'Financial Model\n\n';

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

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-model-${buildId}.csv`;
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
          <p className="text-sm font-mono text-white/60">LOADING FINANCIAL MODEL...</p>
        </div>
      </div>
    );
  }

  if (!spreadsheet) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(`/dashboard/builder/${buildId}`)}
          className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO BUILDER
        </button>
        <div className="text-center py-12">
          <Table className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/60">Financial model not available yet</p>
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
            <h1 className="text-3xl font-mono font-bold text-white mb-2">Financial Model</h1>
            <p className="text-sm text-white/60">3-year financial projections and analysis</p>
          </div>

          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD CSV
          </button>
        </div>
      </div>

      {/* Financial Data */}
      <div className="space-y-6">
        {renderFinancialSection('Startup Costs', spreadsheet.data.startup_costs)}
        {renderFinancialSection('Monthly Operating Expenses', spreadsheet.data.monthly_expenses)}
        {renderFinancialSection('Revenue Projections', spreadsheet.data.revenue_projections)}
        {renderFinancialSection('Financial Metrics', spreadsheet.data.metrics)}
        {renderFinancialSection('Funding Requirements', spreadsheet.data.funding)}

        {/* Raw Data View */}
        <div className="border border-white/10 bg-surface-2 rounded-xl p-6">
          <h2 className="font-mono font-bold text-white text-lg mb-4">Complete Data (JSON)</h2>
          <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(spreadsheet.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function renderFinancialSection(title: string, data: any): React.ReactNode {
  if (!data) return null;

  return (
    <div className="border border-white/10 bg-surface-2 rounded-xl p-6">
      <h2 className="font-mono font-bold text-white text-lg mb-4">{title}</h2>

      {typeof data === 'object' && !Array.isArray(data) ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-mono text-sm text-white/60">Item</th>
                <th className="text-right py-3 px-4 font-mono text-sm text-white/60">Value</th>
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

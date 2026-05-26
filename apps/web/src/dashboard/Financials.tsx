import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function Financials() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      // TODO: Connect to actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult({
        revenue: [100000, 250000, 500000],
        expenses: [80000, 180000, 320000],
        profit: [20000, 70000, 180000],
      });
    } catch (error) {
      console.error("Failed to generate financials:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Projections</h1>
        <p className="text-zinc-400">Generate a 3-year financial model for your business</p>
      </div>

      <div className="space-y-6">
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your business model, pricing, and target market..."
            className="w-full h-40 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              GENERATE FINANCIALS
            </>
          )}
        </button>

        {result && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">3-Year Projection</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-zinc-400 mb-2">YEAR 1</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-zinc-500">Revenue</div>
                    <div className="text-lg font-bold text-white">${(result.revenue[0] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Expenses</div>
                    <div className="text-lg font-bold text-white">${(result.expenses[0] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Profit</div>
                    <div className="text-lg font-bold text-green-400">${(result.profit[0] / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-zinc-400 mb-2">YEAR 2</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-zinc-500">Revenue</div>
                    <div className="text-lg font-bold text-white">${(result.revenue[1] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Expenses</div>
                    <div className="text-lg font-bold text-white">${(result.expenses[1] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Profit</div>
                    <div className="text-lg font-bold text-green-400">${(result.profit[1] / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-zinc-400 mb-2">YEAR 3</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-zinc-500">Revenue</div>
                    <div className="text-lg font-bold text-white">${(result.revenue[2] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Expenses</div>
                    <div className="text-lg font-bold text-white">${(result.expenses[2] / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Profit</div>
                    <div className="text-lg font-bold text-green-400">${(result.profit[2] / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

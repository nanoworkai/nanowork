import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BREAKDOWN = [
  { category: "Agent compute", amount: 32.14, pct: 67 },
  { category: "AI API calls", amount: 11.80, pct: 25 },
  { category: "Storage", amount: 2.30, pct: 5 },
  { category: "Bandwidth", amount: 1.58, pct: 3 },
];

const COLORS = ["bg-brand-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500"];

export default function Usage() {
  const { profile } = useAuth();
  const total = BREAKDOWN.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage</h1>
          <p className="text-zinc-500 text-sm mt-1">Agent activity and spend this month.</p>
        </div>
        <Link
          to="/dashboard/plan"
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
        >
          Upgrade plan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "This month", value: `$${total.toFixed(2)}` },
          { label: "Daily average", value: `$${(total / new Date().getDate()).toFixed(2)}` },
          { label: "Plan", value: <span className="capitalize">{profile?.plan ?? "free"}</span> },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-1 border border-white/5 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 mb-4">
        <h2 className="text-base font-semibold text-white mb-5">Cost breakdown</h2>
        <div className="flex flex-col gap-4">
          {BREAKDOWN.map((item, i) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-zinc-400">{item.category}</span>
                <span className="text-sm font-mono text-zinc-300">${item.amount.toFixed(2)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${COLORS[i]} transition-all duration-700`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-surface-2 border border-white/5 text-sm text-zinc-500">
        Detailed usage logs and invoices are available in the{" "}
        <Link to="/dashboard/plan" className="text-brand-400 hover:text-brand-300 transition-colors">
          billing portal →
        </Link>
      </div>
    </div>
  );
}

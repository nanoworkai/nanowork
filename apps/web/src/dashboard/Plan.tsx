import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserProfile } from "../context/AuthContext";

type PlanTier = UserProfile["plan"];

const PLANS: { tier: PlanTier; name: string; price: number; desc: string; features: string[] }[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    desc: "Preview mode — see what's possible",
    features: ["1 business build", "All 7 agent departments", "Dashboard access", "Community support"],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 99,
    desc: "Full company built and running",
    features: ["Everything in Free", "Live agents 24/7", "1 custom domain", "Priority support", "Revenue dashboard"],
  },
  {
    tier: "growth",
    name: "Growth",
    price: 249,
    desc: "Scaling with more power",
    features: ["Everything in Starter", "3 business builds", "5 custom domains", "Advanced analytics", "Webhook integrations", "Custom branding"],
  },
  {
    tier: "scale",
    name: "Scale",
    price: 499,
    desc: "Enterprise-grade, unlimited",
    features: ["Everything in Growth", "Unlimited builds", "Unlimited domains", "Dedicated support", "SLA guarantees", "White-label options"],
  },
];

export default function Plan() {
  const { profile, updateProfile } = useAuth();
  const [confirm, setConfirm] = useState<PlanTier | null>(null);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (tier: PlanTier) => {
    setSwitching(true);
    await updateProfile({ plan: tier });
    setSwitching(false);
    setConfirm(null);
  };

  const openBillingPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Billing portal coming soon.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Plan</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your subscription.</p>
        </div>
        {profile?.stripeCustomerId && (
          <button
            onClick={openBillingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm text-zinc-300 hover:text-white transition-all font-medium"
          >
            Manage billing
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = profile?.plan === plan.tier;
          const isRecommended = plan.tier === "starter";
          return (
            <div
              key={plan.tier}
              className={`relative p-5 rounded-2xl border flex flex-col transition-all ${
                isCurrent
                  ? "border-brand-500/40 bg-brand-600/10"
                  : isRecommended
                  ? "border-white/15 bg-surface-1"
                  : "border-white/5 bg-surface-1"
              }`}
            >
              {isRecommended && !isCurrent && (
                <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-brand-600 text-white px-2.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-green-500 text-white px-2.5 py-0.5 rounded-full">
                  Current
                </span>
              )}

              <h3 className="text-base font-bold text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-2xl font-bold text-white">${plan.price}</span>
                <span className="text-xs text-zinc-500">/mo</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">{plan.desc}</p>

              <ul className="flex-1 flex flex-col gap-1.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-zinc-400">
                    <svg className="flex-shrink-0 mt-0.5 text-green-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full py-2 rounded-lg text-xs font-semibold bg-surface-3 text-zinc-600 cursor-default">
                  Current plan
                </button>
              ) : (
                <button
                  onClick={() => setConfirm(plan.tier)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isRecommended ? "bg-brand-600 hover:bg-brand-500 text-white" : "bg-surface-2 hover:bg-surface-3 border border-white/10 text-zinc-300 hover:text-white"
                  }`}
                >
                  Switch to {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-sm bg-surface-1 border border-white/10 rounded-2xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Switch plan</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Switch to the <span className="text-white font-semibold">{PLANS.find((p) => p.tier === confirm)?.name}</span> plan? Changes take effect immediately.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSwitch(confirm)}
                disabled={switching}
                className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {switching ? "Switching…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

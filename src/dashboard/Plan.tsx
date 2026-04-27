import { useEffect, useState, type FormEvent } from "react";
import { useAuth, type AgentProfile, type PaymentMethod } from "../context/AuthContext";

type PlanTier = AgentProfile["plan"];

const PLANS: {
  tier: PlanTier;
  name: string;
  price: number;
  desc: string;
  features: string[];
}[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 0,
    desc: "For getting started with your first AI agent",
    features: [
      "1 AI agent",
      "1,000 API calls/mo",
      "1 custom domain",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    tier: "growth",
    name: "Growth",
    price: 49,
    desc: "For scaling your agent with more power and reach",
    features: [
      "3 AI agents",
      "25,000 API calls/mo",
      "5 custom domains",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "Webhook integrations",
    ],
  },
  {
    tier: "scale",
    name: "Scale",
    price: 199,
    desc: "For production workloads with enterprise needs",
    features: [
      "Unlimited agents",
      "Unlimited API calls",
      "Unlimited domains",
      "Dedicated support",
      "Full analytics suite",
      "White-label options",
      "SLA guarantees",
      "SOC 2 compliance",
    ],
  },
];

export default function Plan() {
  const { agent, updateAgent } = useAuth();
  const [switching, setSwitching] = useState<PlanTier | null>(null);
  const [showConfirm, setShowConfirm] = useState<PlanTier | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("4242");
  const [cardExp, setCardExp] = useState("08/27");
  const [paySaving, setPaySaving] = useState(false);

  useEffect(() => {
    if (!agent) return;
    setCardBrand(agent.paymentMethod.brand);
    setCardLast4(agent.paymentMethod.last4);
    setCardExp(
      `${String(agent.paymentMethod.expMonth).padStart(2, "0")}/${String(agent.paymentMethod.expYear).slice(-2)}`,
    );
  }, [agent]);

  if (!agent) return null;

  const onPaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPaySaving(true);
    const [mm, yy] = cardExp.split("/").map((s) => s.trim());
    const month = Math.min(12, Math.max(1, parseInt(mm, 10) || 1));
    const year = yy?.length === 2 ? 2000 + parseInt(yy, 10) : parseInt(yy || "2030", 10);
    const next: PaymentMethod = {
      brand: cardBrand || "Card",
      last4: cardLast4.replace(/\D/g, "").slice(-4) || "0000",
      expMonth: month,
      expYear: year,
    };
    setTimeout(() => {
      updateAgent({ paymentMethod: next });
      setPaySaving(false);
      setShowPay(false);
    }, 600);
  };

  const handleSwitch = async (tier: PlanTier) => {
    setSwitching(tier);
    await new Promise((r) => setTimeout(r, 1000));
    updateAgent({ plan: tier });
    setSwitching(null);
    setShowConfirm(null);
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Plan</h1>
          <p className="dash-page__subtitle">Manage your subscription and billing</p>
        </div>
      </div>

      <div className="dash-settings-section">
        <div className="dash-settings-section__header">
          <h2 className="dash-section__title">Payment method</h2>
          <p className="dash-section__desc">
            Card on file for subscription and usage. Changes apply to the next invoice.
          </p>
        </div>
        {!showPay ? (
          <div className="dash-payment-row">
            <div className="dash-payment-card">
              <span className="dash-payment-card__brand">{agent.paymentMethod.brand}</span>
              <span className="mono">···· {agent.paymentMethod.last4}</span>
              <span className="dash-table__muted">
                Exp {String(agent.paymentMethod.expMonth).padStart(2, "0")}/
                {String(agent.paymentMethod.expYear).slice(-2)}
              </span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setCardBrand(agent.paymentMethod.brand);
                setCardLast4(agent.paymentMethod.last4);
                setCardExp(
                  `${String(agent.paymentMethod.expMonth).padStart(2, "0")}/${String(agent.paymentMethod.expYear).slice(-2)}`,
                );
                setShowPay(true);
              }}
            >
              Change payment method
            </button>
          </div>
        ) : (
          <form className="dash-payment-form" onSubmit={onPaymentSubmit}>
            <div className="dash-payment-form__grid">
              <label className="dash-label">
                Name on card
                <input
                  className="dash-input"
                  name="name"
                  autoComplete="cc-name"
                  placeholder="Name as printed"
                />
              </label>
              <label className="dash-label">
                Card number
                <input
                  className="dash-input"
                  name="number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 1234 1234 1234"
                />
              </label>
              <label className="dash-label">
                Brand
                <select
                  className="dash-input"
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value)}
                >
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>Amex</option>
                </select>
              </label>
              <label className="dash-label">
                Last 4 (for display)
                <input
                  className="dash-input mono"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  maxLength={4}
                />
              </label>
              <label className="dash-label">
                Expires (MM/YY)
                <input
                  className="dash-input mono"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  autoComplete="cc-exp"
                  placeholder="08/27"
                />
              </label>
            </div>
            <div className="dash-modal__actions" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setShowPay(false)}
                disabled={paySaving}
              >
                Cancel
              </button>
              <button className="btn btn--primary btn--sm" type="submit" disabled={paySaving}>
                {paySaving ? "Saving…" : "Save payment method"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="dash-plans">
        {PLANS.map((plan) => {
          const isCurrent = agent.plan === plan.tier;
          return (
            <div
              key={plan.tier}
              className={`dash-plan-card${isCurrent ? " is-current" : ""}${plan.tier === "growth" ? " is-recommended" : ""}`}
            >
              {plan.tier === "growth" && (
                <span className="dash-plan-card__badge">Recommended</span>
              )}
              {isCurrent && (
                <span className="dash-plan-card__badge dash-plan-card__badge--current">Current plan</span>
              )}
              <h3 className="dash-plan-card__name">{plan.name}</h3>
              <div className="dash-plan-card__price">
                <span className="dash-plan-card__amount">${plan.price}</span>
                <span className="dash-plan-card__period">/month</span>
              </div>
              <p className="dash-plan-card__desc">{plan.desc}</p>
              <ul className="dash-plan-card__features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button className="btn btn--ghost btn--sm dash-plan-card__btn" disabled>
                  Current plan
                </button>
              ) : (
                <button
                  className={`btn btn--sm dash-plan-card__btn ${plan.tier === "growth" ? "btn--primary" : "btn--ghost"}`}
                  onClick={() => setShowConfirm(plan.tier)}
                  disabled={switching !== null}
                >
                  {switching === plan.tier ? "Switching…" : `Switch to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showConfirm && (
        <div className="dash-modal-overlay" onClick={() => setShowConfirm(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="dash-modal__title">Change plan</h3>
            <p className="dash-modal__body">
              Switch to the <strong>{PLANS.find((p) => p.tier === showConfirm)?.name}</strong> plan?
              {" "}Changes take effect immediately and billing will be prorated.
            </p>
            <div className="dash-modal__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => setShowConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => handleSwitch(showConfirm)}
                disabled={switching !== null}
              >
                {switching ? "Switching…" : "Confirm switch"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-section">
        <h2 className="dash-section__title">Billing history</h2>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agent.spending.history.slice().reverse().map((entry, i) => (
                <tr key={i}>
                  <td className="dash-table__muted">{entry.month}</td>
                  <td>Agent usage — {agent.plan} plan</td>
                  <td className="mono">${entry.amount.toFixed(2)}</td>
                  <td>
                    <span className="dash-status dash-status--active">
                      <span className="dash-status__dot" />
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

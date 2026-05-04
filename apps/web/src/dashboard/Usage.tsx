import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DAILY_USAGE = [
  { date: "Apr 1", api: 1.2, compute: 0.4, storage: 0.1 },
  { date: "Apr 2", api: 1.8, compute: 0.5, storage: 0.1 },
  { date: "Apr 3", api: 0.9, compute: 0.3, storage: 0.1 },
  { date: "Apr 4", api: 2.1, compute: 0.7, storage: 0.1 },
  { date: "Apr 5", api: 1.5, compute: 0.4, storage: 0.1 },
  { date: "Apr 6", api: 0.6, compute: 0.2, storage: 0.1 },
  { date: "Apr 7", api: 0.4, compute: 0.1, storage: 0.1 },
  { date: "Apr 8", api: 1.9, compute: 0.6, storage: 0.1 },
  { date: "Apr 9", api: 2.3, compute: 0.8, storage: 0.1 },
  { date: "Apr 10", api: 1.7, compute: 0.5, storage: 0.1 },
  { date: "Apr 11", api: 2.0, compute: 0.6, storage: 0.1 },
  { date: "Apr 12", api: 1.4, compute: 0.4, storage: 0.1 },
  { date: "Apr 13", api: 0.8, compute: 0.3, storage: 0.1 },
  { date: "Apr 14", api: 0.5, compute: 0.2, storage: 0.1 },
  { date: "Apr 15", api: 2.5, compute: 0.9, storage: 0.1 },
  { date: "Apr 16", api: 2.1, compute: 0.7, storage: 0.1 },
  { date: "Apr 17", api: 1.8, compute: 0.5, storage: 0.1 },
  { date: "Apr 18", api: 1.3, compute: 0.4, storage: 0.1 },
  { date: "Apr 19", api: 1.6, compute: 0.5, storage: 0.1 },
  { date: "Apr 20", api: 2.2, compute: 0.8, storage: 0.1 },
  { date: "Apr 21", api: 1.9, compute: 0.6, storage: 0.1 },
  { date: "Apr 22", api: 1.1, compute: 0.3, storage: 0.1 },
  { date: "Apr 23", api: 2.4, compute: 0.7, storage: 0.1 },
];

const BREAKDOWN = [
  { category: "API calls", amount: 32.14, percentage: 67, color: "var(--accent)" },
  { category: "Compute", amount: 11.80, percentage: 25, color: "#9fd3a5" },
  { category: "Storage", amount: 2.30, percentage: 5, color: "#8cb4ff" },
  { category: "Bandwidth", amount: 1.58, percentage: 3, color: "#b091f5" },
];

type Period = "7d" | "30d" | "all";

export default function Usage() {
  const { agent, updateAgent } = useAuth();
  const [period, setPeriod] = useState<Period>("30d");
  const [limitInput, setLimitInput] = useState(String(agent?.spending.limit || 200));
  const [limitSaved, setLimitSaved] = useState(false);

  useEffect(() => {
    if (agent) setLimitInput(String(agent.spending.limit));
  }, [agent?.spending.limit]);

  if (!agent) return null;

  const visibleDays = period === "7d" ? DAILY_USAGE.slice(-7) : period === "30d" ? DAILY_USAGE : DAILY_USAGE;
  const maxDay = Math.max(...visibleDays.map((d) => d.api + d.compute + d.storage));

  const handleLimitSave = () => {
    const n = parseInt(limitInput, 10);
    if (Number.isFinite(n) && n >= 10) {
      updateAgent({ spending: { ...agent.spending, limit: n } });
    }
    setLimitSaved(true);
    setTimeout(() => setLimitSaved(false), 2000);
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Usage</h1>
          <p className="dash-page__subtitle">Track how your agent spends</p>
        </div>
        <div className="dash-header-actions">
          <Link to="/dashboard/plan" className="btn btn--primary btn--sm">
            Upgrade plan
          </Link>
          <div className="dash-period-toggle">
          {(["7d", "30d", "all"] as const).map((p) => (
            <button
              key={p}
              className={`dash-period-btn${period === p ? " is-active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p === "7d" ? "7 days" : p === "30d" ? "30 days" : "All time"}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="dash-stats dash-stats--3">
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">This month</span>
          <span className="dash-stat-card__value">${agent.spending.currentMonth.toFixed(2)}</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Daily average</span>
          <span className="dash-stat-card__value">
            ${(agent.spending.currentMonth / new Date().getDate()).toFixed(2)}
          </span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Spending limit</span>
          <span className="dash-stat-card__value">${agent.spending.limit}</span>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section__title">Daily breakdown</h2>
        <div className="dash-chart dash-chart--detailed">
          {visibleDays.map((day, i) => {
            const total = day.api + day.compute + day.storage;
            const height = (total / maxDay) * 100;
            return (
              <div key={i} className="dash-chart__col">
                <div className="dash-chart__bar-wrap">
                  <div className="dash-chart__bar dash-chart__bar--stacked" style={{ height: `${height}%` }}>
                    <div className="dash-chart__segment dash-chart__segment--api" style={{ height: `${(day.api / total) * 100}%` }} />
                    <div className="dash-chart__segment dash-chart__segment--compute" style={{ height: `${(day.compute / total) * 100}%` }} />
                    <div className="dash-chart__segment dash-chart__segment--storage" style={{ height: `${(day.storage / total) * 100}%` }} />
                    <span className="dash-chart__tooltip">${total.toFixed(2)}</span>
                  </div>
                </div>
                <span className="dash-chart__label">{day.date.split(" ")[1]}</span>
              </div>
            );
          })}
        </div>
        <div className="dash-chart-legend">
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: "var(--accent)" }} />API calls</span>
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: "#9fd3a5" }} />Compute</span>
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: "#8cb4ff" }} />Storage</span>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section__title">Cost breakdown</h2>
        <div className="dash-breakdown">
          {BREAKDOWN.map((item) => (
            <div key={item.category} className="dash-breakdown__row">
              <div className="dash-breakdown__info">
                <span className="dash-breakdown__dot" style={{ background: item.color }} />
                <span className="dash-breakdown__category">{item.category}</span>
              </div>
              <div className="dash-breakdown__bar-wrap">
                <div className="dash-breakdown__bar" style={{ width: `${item.percentage}%`, background: item.color }} />
              </div>
              <span className="dash-breakdown__amount">${item.amount.toFixed(2)}</span>
              <span className="dash-breakdown__pct">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section__title">Spending limit</h2>
        <p className="dash-section__desc">
          Set a monthly spending cap. Your agent will pause when this limit is reached. Need more
          headroom?{" "}
          <Link to="/dashboard/plan" className="dash-link">
            Increase your plan
          </Link>{" "}
          or raise the cap below.
        </p>
        <div className="dash-inline-form">
          <div className="dash-input-group">
            <span className="dash-input-prefix">$</span>
            <input
              className="dash-input"
              type="number"
              min="10"
              step="10"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
            />
          </div>
          <button className="btn btn--primary btn--sm" onClick={handleLimitSave}>
            {limitSaved ? "Saved!" : "Update limit"}
          </button>
        </div>
      </div>
    </div>
  );
}

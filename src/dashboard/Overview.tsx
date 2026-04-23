import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`dash-status dash-status--${status}`}>
      <span className="dash-status__dot" />
      {status}
    </span>
  );
}

export default function Overview() {
  const { agent } = useAuth();
  if (!agent) return null;

  const spendPercent = Math.round((agent.spending.currentMonth / agent.spending.limit) * 100);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const projectedSpend = Math.round((agent.spending.currentMonth / today) * daysInMonth * 100) / 100;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Overview</h1>
          <p className="dash-page__subtitle">Your AI agent at a glance</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Current spend</span>
          <span className="dash-stat-card__value">${agent.spending.currentMonth.toFixed(2)}</span>
          <span className="dash-stat-card__meta">of ${agent.spending.limit} limit</span>
          <div className="dash-stat-card__bar">
            <div
              className="dash-stat-card__bar-fill"
              style={{ width: `${Math.min(spendPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Projected this month</span>
          <span className="dash-stat-card__value">${projectedSpend.toFixed(2)}</span>
          <span className="dash-stat-card__meta">based on current usage</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Active domains</span>
          <span className="dash-stat-card__value">{agent.domains.filter((d) => d.status === "active").length}</span>
          <span className="dash-stat-card__meta">of {agent.domains.length} total</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-card__label">Current plan</span>
          <span className="dash-stat-card__value dash-stat-card__value--plan">{agent.plan}</span>
          <span className="dash-stat-card__meta">
            <Link to="/dashboard/plan" className="dash-link">Manage plan →</Link>
          </span>
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section__title">Spending history</h2>
        <div className="dash-chart">
          {agent.spending.history.map((entry, i) => {
            const maxAmount = Math.max(...agent.spending.history.map((e) => e.amount));
            const height = (entry.amount / maxAmount) * 100;
            return (
              <div key={i} className="dash-chart__col">
                <div className="dash-chart__bar-wrap">
                  <div
                    className="dash-chart__bar"
                    style={{ height: `${height}%` }}
                  >
                    <span className="dash-chart__tooltip">${entry.amount.toFixed(2)}</span>
                  </div>
                </div>
                <span className="dash-chart__label">{entry.month.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-section">
        <h2 className="dash-section__title">Agent details</h2>
        <div className="dash-details">
          <div className="dash-detail">
            <span className="dash-detail__label">Agent ID</span>
            <span className="dash-detail__value mono">{agent.id}</span>
          </div>
          <div className="dash-detail">
            <span className="dash-detail__label">Phone</span>
            <span className="dash-detail__value">{agent.phone}</span>
          </div>
          <div className="dash-detail">
            <span className="dash-detail__label">Email</span>
            <span className="dash-detail__value">{agent.email}</span>
          </div>
          <div className="dash-detail">
            <span className="dash-detail__label">Primary domain</span>
            <span className="dash-detail__value">{agent.domain}</span>
          </div>
          <div className="dash-detail">
            <span className="dash-detail__label">Created</span>
            <span className="dash-detail__value">
              {new Date(agent.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-quick-actions">
        <Link to="/dashboard/usage" className="dash-quick-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>View detailed usage</span>
        </Link>
        <Link to="/dashboard/domains" className="dash-quick-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Manage domains</span>
        </Link>
        <Link to="/dashboard/settings" className="dash-quick-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Agent settings</span>
        </Link>
      </div>
    </div>
  );
}

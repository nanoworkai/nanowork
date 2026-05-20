import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useBuiltApp } from "../../built-app/BuiltAppContext";

export default function UserAppHome() {
  const { app, addEmail } = useBuiltApp();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const count = app.signups.length;
  const last = app.signups[0];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    addEmail(email);
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="user-app-page">
      <section className="user-app-hero">
        <h1 className="user-app-hero__title">Welcome to your app</h1>
        <p className="user-app-hero__description">{app.tagline}</p>
        <form className="user-app-hero__form" onSubmit={onSubmit}>
          <label className="user-app-visually-hidden" htmlFor="hp-email">
            Email address
          </label>
          <input
            id="hp-email"
            className="user-app-input"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={submitted ? "hp-success" : undefined}
          />
          <button type="submit" className="user-app-btn user-app-btn--primary">
            {submitted ? "You’re in!" : "Join waitlist"}
          </button>
        </form>
        {submitted && <p id="hp-success" className="user-app-message user-app-message--success" role="status">Added to your live leads list.</p>}
      </section>

      <div className="user-app-stats">
        <div className="user-app-stat">
          <span className="user-app-stat__label">Leads collected</span>
          <span className="user-app-stat__value">{count}</span>
        </div>
        <div className="user-app-stat">
          <span className="user-app-stat__label">API endpoint</span>
          <span className="user-app-stat__value user-app-stat__value--small">/api/sandbox/{app.slug}/v1</span>
        </div>
        <div className="user-app-stat">
          <span className="user-app-stat__label">Most recent signup</span>
          <span className="user-app-stat__value user-app-stat__value--small">
            {last
              ? new Date(last.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "None yet"}
          </span>
        </div>
      </div>

      <p className="user-app-info">
        This is a fully functional preview with real data. View your collected leads in{" "}
        <Link to="/app/leads">Leads</Link>, explore your API in <Link to="/app/api">API</Link>,
        and <Link to="/app/redeem">redeem your app</Link> to keep it running beyond the preview period.
      </p>
    </div>
  );
}

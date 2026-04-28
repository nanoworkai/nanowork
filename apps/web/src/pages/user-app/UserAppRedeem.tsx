import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBuiltApp } from "../../built-app/BuiltAppContext";

export default function UserAppRedeem() {
  const { isAuthenticated } = useAuth();
  const { app } = useBuiltApp();
  const redeemTarget = isAuthenticated
    ? "/dashboard/plan"
    : `/login?next=${encodeURIComponent("/dashboard/plan")}`;

  return (
    <div className="user-app-page user-app-page--narrow">
      <h2 className="user-app-page__h">Redeem and deploy</h2>
      <p className="user-app-page__sub">
        You’re in a live preview of <strong>{app.name}</strong>. Put it on a permanent URL, hook
        up billing, and connect your own domain.
      </p>
      <ul className="user-app-redeem-list">
        <li>Production hosting with SSL</li>
        <li>Subdomain and custom domain on Nanowork</li>
        <li>Usage and plan controls for API + DB</li>
      </ul>
      <div className="user-app-redeem-box">
        <p className="user-app-redeem-price">
          <span className="user-app-redeem-amt">$49</span>
          <span className="user-app-redeem-mo">/mo</span>
        </p>
        <p className="user-app-redeem-plan">Growth — redeem this build</p>
        <Link to={redeemTarget} className="user-app-btn user-app-btn--primary user-app-redeem-cta">
          Pay to redeem app
        </Link>
        <p className="user-app-redeem-foot">
          {isAuthenticated ? (
            <Link to="/dashboard/domains">Set up subdomain in dashboard</Link>
          ) : (
            <>
              <Link to="/login">Sign in</Link> after checkout to add payment and domain.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

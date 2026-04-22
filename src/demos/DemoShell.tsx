import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  businessStyle,
  formatPrice,
  type Business,
} from "../data/businesses";

const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

export function DemoShell({
  business,
  children,
}: {
  business: Business;
  children: ReactNode;
}) {
  const buyHref = `${NANOWORK_SMS_HREF}&body=${encodeURIComponent(
    `Hey Nanowork — I want to buy ${business.name} (${formatPrice(
      business.price,
    )}). What are the next steps?`,
  )}`;

  return (
    <div className="demo-shell" style={businessStyle(business)}>
      <div className="demo-bar" role="banner">
        <div className="demo-bar__inner">
          <Link to="/gallery" className="demo-bar__back">
            <span aria-hidden>←</span> Back to gallery
          </Link>
          <div className="demo-bar__meta">
            <span className="demo-bar__label">
              This is a live demo of <strong>{business.name}</strong> — one of
              the ready-to-transfer businesses in the Nanowork gallery.
            </span>
          </div>
          <div className="demo-bar__actions">
            {business.status === "available" && (
              <a className="demo-bar__cta" href={buyHref}>
                Buy for {formatPrice(business.price)} →
              </a>
            )}
            {business.status === "pending" && (
              <a className="demo-bar__cta demo-bar__cta--ghost" href={buyHref}>
                In escrow · Join waitlist
              </a>
            )}
            {business.status === "sold" && (
              <span className="demo-bar__sold">Sold · Commission similar</span>
            )}
          </div>
        </div>
      </div>
      <div className="demo-app">{children}</div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  businessStyle,
  formatPrice,
  type Business,
} from "../data/businesses";
import { TextUsLink } from "../components/PhoneReveal";

export function DemoShell({
  business,
  children,
}: {
  business: Business;
  children: ReactNode;
}) {
  const buyBody = `Hey Nanowork — I want to buy ${business.name} (${formatPrice(
    business.price,
  )}). What are the next steps?`;
  const waitlistBody = `Hey — put me on the waitlist for ${business.name} if ${formatPrice(
    business.price,
  )} falls through.`;

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
              <TextUsLink className="demo-bar__cta" bodyTemplate={buyBody}>
                Buy for {formatPrice(business.price)} →
              </TextUsLink>
            )}
            {business.status === "pending" && (
              <TextUsLink
                className="demo-bar__cta demo-bar__cta--ghost"
                bodyTemplate={waitlistBody}
              >
                In escrow · Join waitlist
              </TextUsLink>
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

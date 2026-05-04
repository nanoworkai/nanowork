import { TextUsLink } from "./PhoneReveal";

export function PricingStrip() {
  return (
    <section className="pricing-strip" id="pricing" aria-labelledby="pricing-heading">
      <div className="pricing-strip__inner">
        <div className="pricing-strip__copy">
          <h2 className="pricing-strip__title" id="pricing-heading">
            $99<span className="pricing-strip__period">/mo</span>
          </h2>
          <p className="pricing-strip__lede">
            One price. Ship your idea with us — landing pages, payments, launches. Cancel anytime.
          </p>
        </div>
        <div className="pricing-strip__cta">
          <TextUsLink className="btn btn--primary">Text us to start</TextUsLink>
          <p className="pricing-strip__note">We reply same day · No equity · No tiers</p>
        </div>
      </div>
    </section>
  );
}

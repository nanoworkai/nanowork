import { TextUsLink } from "./PhoneReveal";

export function PricingStrip() {
  return (
    <section
      className="bg-background-elevated border-y border-border-DEFAULT py-16 px-6"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3">
          <h2
            className="text-5xl md:text-6xl font-display font-medium text-content-primary tracking-tight"
            id="pricing-heading"
          >
            $99<span className="text-2xl md:text-3xl text-content-secondary font-sans ml-1">/mo</span>
          </h2>
          <p className="text-lg text-content-secondary max-w-xl leading-relaxed">
            One price. Ship your idea with us — landing pages, payments, launches. Cancel anytime.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-3">
          <TextUsLink
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-accent-primary text-white font-semibold text-base hover:bg-accent-primary/90 transition-all hover:scale-[1.02] shadow-md"
          >
            Text us to start
          </TextUsLink>
          <p className="text-sm text-content-tertiary">
            We reply same day · No equity · No tiers
          </p>
        </div>
      </div>
    </section>
  );
}

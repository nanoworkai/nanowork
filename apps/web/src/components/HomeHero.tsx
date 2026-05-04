import { TextUsLink } from "./PhoneReveal";

const EXCHANGE = [
  {
    variant: "user" as const,
    delay: 0,
    body: "I teach pottery nights — want a simple page + deposits before I quit my job.",
    meta: "Delivered",
  },
  {
    variant: "nanowork" as const,
    delay: 140,
    body: "Love it. We’ll tighten the offer, pricing, and a one-page checkout you can share this week. Want SMS reminders or email-only?",
    meta: "Nanowork",
  },
  {
    variant: "user" as const,
    delay: 280,
    body: "Email for now. Keep copy friendly, not corporate.",
    meta: "Delivered",
  },
  {
    variant: "nanowork" as const,
    delay: 420,
    body: "On it. Next message: your draft link + how to turn on $99/mo when you’re ready to go live with us.",
    meta: "Nanowork",
  },
];

/**
 * Homepage hero: shows what happens on the phone (example thread), not a prompt box.
 * Primary conversion is text → subscribe ($99/mo).
 */
export default function HomeHero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <div className="hero__copy">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            $99/mo · Cancel anytime
          </span>

          <h1 className="display-headline" id="hero-heading">
            Your next company starts{" "}
            <span className="display-headline__accent">in your texts.</span>
          </h1>

          <p className="lede">
            Send one message about what you want to earn from. We reply fast, align on scope, and
            ship landing pages, checkout, and launches — you subscribe when it feels right.
          </p>

          <div className="hero__cta-row">
            <TextUsLink className="btn btn--primary">
              Text Nanowork — start for $99/mo
            </TextUsLink>
            <a className="btn btn--ghost" href="#pricing">
              What you get
            </a>
          </div>

          <p className="hero__promise">
            Same-day reply · No equity · Pick your region for the right number
          </p>
        </div>

        <div className="hero__visual">
          <div className="chat" role="img" aria-label="Example text conversation with Nanowork">
            <div className="chat__chrome">
              <div className="chat__bar">
                <div className="chat__dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="chat__title">
                  <span className="chat__avatar" aria-hidden>
                    N
                  </span>
                  Nanowork
                </div>
                <span className="chat__time">now</span>
              </div>
            </div>

            <ul className="chat__stream">
              {EXCHANGE.map((msg, i) => (
                <li
                  key={i}
                  className={`bubble bubble--${msg.variant}`}
                  style={{ animationDelay: `${msg.delay}ms` }}
                >
                  <p>{msg.body}</p>
                  <span className="bubble__meta">{msg.meta}</span>
                </li>
              ))}
            </ul>

            <div className="chat__compose" aria-hidden>
              <div className="chat__compose-field">Your idea — one sentence on your phone…</div>
              <div className="chat__compose-send" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                  <path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <p className="hero__chat-caption">Example thread — yours starts when you text.</p>
        </div>
      </div>
    </section>
  );
}

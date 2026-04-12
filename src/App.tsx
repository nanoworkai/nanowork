import { useEffect, useRef, useState } from "react";

const SF_TIMEZONE = "America/Los_Angeles";

const CHAT_USER =
  "I need a name, landing page, and waitlist for my AI side project.";
const CHAT_ASSISTANT =
  "On it—drafting copy, structure, and a signup flow. I’ll ping you here when it’s ready to ship.";

/** Nanowork SMS / iMessage line — E.164 for sms: links; display for humans. */
const NANOWORK_SMS_E164 = "+16506740193";
const NANOWORK_SMS_DISPLAY = "(650) 674-0193";
const NANOWORK_SMS_HREF = `sms:${NANOWORK_SMS_E164}`;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function ChatDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [showUser, setShowUser] = useState(reducedMotion);
  const [showTyping, setShowTyping] = useState(false);
  const [showAssistant, setShowAssistant] = useState(reducedMotion);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (reducedMotion) {
      setShowUser(true);
      setShowTyping(false);
      setShowAssistant(true);
      return;
    }

    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    const after = (ms: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };

    const runCycle = () => {
      setShowUser(false);
      setShowTyping(false);
      setShowAssistant(false);

      after(350, () => setShowUser(true));
      after(1300, () => setShowTyping(true));
      after(2900, () => {
        setShowTyping(false);
        setShowAssistant(true);
      });
      after(7200, () => {
        setShowUser(false);
        setShowAssistant(false);
      });
      after(8200, () => {
        clearTimers();
        runCycle();
      });
    };

    runCycle();
    return () => clearTimers();
  }, [reducedMotion]);

  return (
    <div
      className="chat-demo"
      aria-hidden="true"
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <div className="chat-demo__shell">
        <div className="chat-demo__header">
          <span className="chat-demo__back" aria-hidden />
          <div className="chat-demo__peer">
            <span className="chat-demo__avatar" aria-hidden>
              N
            </span>
            <div className="chat-demo__peer-text">
              <span className="chat-demo__peer-name">Nanowork</span>
              <span className="chat-demo__peer-status">iMessage</span>
            </div>
          </div>
        </div>
        <div className="chat-demo__thread">
          <div className="chat-demo__hint">You text us like a friend</div>
          <div
            className={`chat-demo__row chat-demo__row--out ${showUser ? "chat-demo__row--visible" : ""}`}
          >
            <div className="chat-demo__bubble chat-demo__bubble--out">
              {CHAT_USER}
            </div>
          </div>
          <div
            className={`chat-demo__row chat-demo__row--in ${showTyping ? "chat-demo__row--visible" : ""}`}
          >
            <div className="chat-demo__bubble chat-demo__bubble--typing">
              <span className="chat-demo__dot" />
              <span className="chat-demo__dot" />
              <span className="chat-demo__dot" />
            </div>
          </div>
          <div
            className={`chat-demo__row chat-demo__row--in ${showAssistant ? "chat-demo__row--visible" : ""}`}
          >
            <div className="chat-demo__bubble chat-demo__bubble--in">
              {CHAT_ASSISTANT}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingSection() {
  return (
    <section className="pricing" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading" className="pricing__heading">
        Pricing
      </h2>
      <p className="pricing__intro">
        One monthly plan. Everything runs in iMessage—text us to work like you would
        with a cofounder.
      </p>
      <div className="pricing__card-wrap">
        <article className="pricing-card">
          <h3 className="pricing-card__name">Nanowork</h3>
          <p className="pricing-card__price">
            <span className="pricing-card__amount">$99</span>
            <span className="pricing-card__period">/ month</span>
          </p>
          <ul className="pricing-card__features">
            <li>Full iMessage access</li>
            <li>Generous usage for real builds and launches</li>
            <li>Multiple projects in flight</li>
            <li>Priority in beta as we add features</li>
          </ul>
          <a className="pricing-card__cta" href={NANOWORK_SMS_HREF}>
            Text us to start
          </a>
        </article>
      </div>
      <p className="pricing__footnote">
        Beta pricing—we may adjust as we learn what builders need. No hidden fees.
      </p>
    </section>
  );
}

function formatSanFranciscoClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SF_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function sanFranciscoWallTimeISO(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SF_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const v = (t: Intl.DateTimeFormatPart["type"]) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}:${v("second")}`;
}

export default function App() {
  const [phone, setPhone] = useState("");

  const [clock, setClock] = useState(() => {
    const d = new Date();
    return {
      display: formatSanFranciscoClock(d),
      iso: sanFranciscoWallTimeISO(d),
    };
  });

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock({
        display: formatSanFranciscoClock(d),
        iso: sanFranciscoWallTimeISO(d),
      });
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div className="noise" aria-hidden />
      <div className="glow" aria-hidden />
      <div className="page page--simple">
        <main className="simple-main">
          <span className="platform-pill">
            <span className="status-dot" aria-hidden />
            In early beta
          </span>
          <h1 className="simple-headline">
            We’re an AI that goes from your prompt to a complete startup—inside
            iMessage.
          </h1>
          <div className="text-us">
            <p className="text-us__lead">
              Text us anytime in iMessage (or SMS)—same as messaging a friend.
            </p>
            <a
              className="text-us__number"
              href={NANOWORK_SMS_HREF}
              aria-label={`Text Nanowork at ${NANOWORK_SMS_DISPLAY}`}
            >
              {NANOWORK_SMS_DISPLAY}
            </a>
            <p className="text-us__note">Tap the number to open Messages.</p>
          </div>
          <ChatDemo />
          <form
            className="phone-signup"
            onSubmit={(e) => {
              e.preventDefault();
            }}
            aria-label="Join the waitlist with your phone number"
          >
            <label className="phone-signup__label" htmlFor="waitlist-phone">
              Your number for the beta
            </label>
            <div className="phone-signup__row">
              <input
                id="waitlist-phone"
                className="phone-signup__input"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="626-666-9675"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button className="phone-signup__submit" type="submit">
                Join waitlist
              </button>
            </div>
          </form>
          <PricingSection />
        </main>
      </div>
      <footer className="site-footer">
        <span className="site-footer__copy">Nanowork, Inc 2026</span>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href="https://x.com/nanoworkai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href="https://www.linkedin.com/company/nanowork/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href={NANOWORK_SMS_HREF}
          aria-label={`Text Nanowork at ${NANOWORK_SMS_DISPLAY}`}
        >
          Text us
        </a>
      </footer>
      <aside
        className="clock-corner"
        aria-label={`San Francisco local time, ${clock.display}`}
      >
        <time className="clock-corner__time" dateTime={clock.iso}>
          {clock.display}
        </time>
        <span className="clock-corner__city">San Francisco</span>
      </aside>
    </>
  );
}

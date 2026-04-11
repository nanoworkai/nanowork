import { useEffect, useRef, useState } from "react";

const SF_TIMEZONE = "America/Los_Angeles";

const CHAT_USER =
  "I need a name, landing page, and waitlist for my AI side project.";
const CHAT_ASSISTANT =
  "On it—drafting copy, structure, and a signup flow. I’ll ping you here when it’s ready to ship.";

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
          <ChatDemo />
        </main>
      </div>
      <footer className="site-footer">
        <span className="site-footer__copy">Nanowork, Inc 2026</span>
        <span className="site-footer__sep" aria-hidden>
          ·
        </span>
        <a
          className="site-footer__link"
          href="https://x.com/nanowork"
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

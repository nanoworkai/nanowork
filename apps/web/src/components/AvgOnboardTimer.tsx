import { useEffect, useRef, useState } from "react";

/** Representative average from hello → workspace ready (marketing stat). */
export const ONBOARD_AVG_SECONDS = 270;

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AvgOnboardTimer() {
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStarted(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSeconds(ONBOARD_AVG_SECONDS);
      return;
    }
    let cancelled = false;
    const durationMs = 2600;
    const t0 = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - (1 - t) ** 2;
      setSeconds(Math.round(eased * ONBOARD_AVG_SECONDS));
      if (t < 1) requestAnimationFrame(tick);
      else setSeconds(ONBOARD_AVG_SECONDS);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [started]);

  return (
    <div ref={wrapRef} className="onboard-timer" aria-live="polite">
      <span className="onboard-timer__label">Avg. time to onboard</span>
      <span className="onboard-timer__digits">{formatMmSs(seconds)}</span>
      <span className="onboard-timer__hint">from first message to live workspace</span>
    </div>
  );
}

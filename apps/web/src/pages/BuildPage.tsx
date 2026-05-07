import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiUrl } from "../lib/apiBase";
import { TopNav } from "../components/SiteChrome";
import { TextUsLink } from "../components/PhoneReveal";

type DeptData = {
  tasks: string[];
  first_output: string;
};

type BuildResult = {
  company_name: string;
  tagline: string;
  departments: Record<string, DeptData>;
};

const DEPT_ORDER = ["Legal", "Brand", "Web", "Marketing", "Sales", "Finance", "Ops"] as const;

const DEPT_META: Record<string, { icon: string; color: string }> = {
  Legal:     { icon: "⊕", color: "#7b8fff" },
  Brand:     { icon: "◇", color: "#c4a574" },
  Web:       { icon: "●", color: "#4caf8a" },
  Marketing: { icon: "◆", color: "#f06292" },
  Sales:     { icon: "→", color: "#ff9f66" },
  Finance:   { icon: "¤", color: "#a78bfa" },
  Ops:       { icon: "▣", color: "#64b5f6" },
};

const LOADING_LINES = [
  "Reading your prompt...",
  "Analyzing the market...",
  "Spinning up 7 agents...",
  "Structuring the company...",
  "Almost ready...",
];

function LoadingState() {
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setLineIdx(i => Math.min(i + 1, LOADING_LINES.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bp-loading">
      <div className="bp-loading__ring" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="bp-loading__dot" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <p className="bp-loading__line" key={lineIdx}>{LOADING_LINES[lineIdx]}</p>
    </div>
  );
}

function DeptCard({
  dept,
  data,
  delay,
}: {
  dept: string;
  data: DeptData;
  delay: number;
}) {
  const meta = DEPT_META[dept];
  const [appeared, setAppeared]   = useState(false);
  const [tasksDone, setTasksDone] = useState(0);

  useEffect(() => {
    const tid = setTimeout(() => setAppeared(true), delay);
    return () => clearTimeout(tid);
  }, [delay]);

  useEffect(() => {
    if (!appeared) return;
    let t = 0;
    const ids: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < data.tasks.length; i++) {
      t += 480 + Math.random() * 220;
      const idx = i + 1;
      ids.push(setTimeout(() => setTasksDone(idx), t));
    }
    return () => ids.forEach(clearTimeout);
  }, [appeared, data.tasks.length]);

  const done = tasksDone >= data.tasks.length;

  return (
    <div
      className={`bp-card ${appeared ? "bp-card--in" : ""}`}
      style={{ "--dept-color": meta.color } as React.CSSProperties}
    >
      <div className="bp-card__head">
        <span className="bp-card__icon" aria-hidden style={{ color: meta.color }}>
          {meta.icon}
        </span>
        <span className="bp-card__dept">{dept}</span>
        {appeared && (
          <span className={`bp-card__badge ${done ? "bp-card__badge--done" : ""}`}>
            {done ? "Done" : "Working"}
          </span>
        )}
      </div>

      <ul className="bp-card__tasks">
        {data.tasks.map((task, i) => {
          const checked = appeared && i < tasksDone;
          return (
            <li key={i} className={`bp-task ${checked ? "bp-task--done" : appeared ? "bp-task--pending" : ""}`}>
              <span className="bp-task__check" aria-hidden>{checked ? "✓" : "◌"}</span>
              <span className="bp-task__text">{task}</span>
            </li>
          );
        })}
      </ul>

      {done && (
        <p className="bp-card__output">{data.first_output}</p>
      )}
    </div>
  );
}

type Phase = "loading" | "building" | "done";

export default function BuildPage() {
  const [params] = useSearchParams();
  const prompt = (params.get("p") ?? "").trim();

  const [result, setResult] = useState<BuildResult | null>(null);
  const [phase,  setPhase]  = useState<Phase>("loading");
  const [error,  setError]  = useState(false);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!prompt) {
      setError(true);
      setPhase("building");
      return;
    }
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(apiUrl("/api/build/run"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) throw new Error("api-error");
        const data = (await res.json()) as { result: BuildResult };
        if (!cancelled) {
          setResult(data.result);
          setPhase("building");
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setPhase("building");
        }
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [prompt]);

  // Transition to "done" after cards have had time to animate
  useEffect(() => {
    if (phase !== "building" || !result) return;
    // 7 cards × ~350ms stagger + ~1.8s for tasks = ~4.3s total, round up
    doneTimerRef.current = setTimeout(() => setPhase("done"), 5000);
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, [phase, result]);

  // Scroll CTA into view when done
  const ctaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase === "done") {
      setTimeout(() => ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
    }
  }, [phase]);

  return (
    <>
      <TopNav />
      <main className="bp-page">

        {/* ── prompt header ─────────────────────────────────────── */}
        <div className="bp-header">
          <div className="bp-header__inner">
            <Link to="/" className="bp-back" aria-label="Back to home">
              ← back
            </Link>

            <div className="bp-prompt-block">
              <span className="bp-prompt-block__eye">Your prompt</span>
              <p className="bp-prompt-block__text">
                {prompt || "No prompt — go back and type one."}
              </p>
            </div>

            {phase === "loading" && <LoadingState />}

            {result && !error && (
              <div className="bp-company">
                <span className="status-dot" aria-hidden />
                <div>
                  <h1 className="bp-company__name">{result.company_name}</h1>
                  <p className="bp-company__tagline">{result.tagline}</p>
                </div>
              </div>
            )}

            {error && (
              <p className="bp-error">
                Could not reach the API — check that the server is running, then{" "}
                <Link to="/">go back</Link> to try again.
              </p>
            )}
          </div>
        </div>

        {/* ── department grid ────────────────────────────────────── */}
        {result && !error && (
          <div className="bp-grid">
            {DEPT_ORDER.map((dept, i) => {
              const data = result.departments[dept];
              if (!data) return null;
              return (
                <DeptCard
                  key={dept}
                  dept={dept}
                  data={data}
                  delay={i * 320}
                />
              );
            })}
          </div>
        )}

        {/* ── subscription CTA ──────────────────────────────────── */}
        <div
          ref={ctaRef}
          className={`bp-cta ${phase === "done" ? "bp-cta--visible" : ""}`}
          aria-hidden={phase !== "done"}
        >
          <div className="bp-cta__inner">
            <div className="bp-cta__live-row">
              <span className="bp-cta__dot" aria-hidden />
              <span>
                All 7 departments are live
                {result ? ` for ${result.company_name}` : ""}.
              </span>
            </div>
            <h2 className="bp-cta__headline">
              Subscribe to keep this running.
            </h2>
            <p className="bp-cta__sub">
              $99/mo — everything you just saw, continuing to ship and earn on your behalf.
              No equity. Cancel anytime.
            </p>
            <div className="bp-cta__buttons">
              <TextUsLink className="btn btn--primary">
                Text us to subscribe — $99/mo
              </TextUsLink>
              <Link to="/" className="btn btn--ghost">
                ← Back to overview
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

import { useMemo, useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";
import { callAi } from "./ai";

type Habit = {
  id: string;
  name: string;
  cadence: string;
  streak: number[];
};

const SEED: Habit[] = [
  {
    id: "write",
    name: "Write 500 words",
    cadence: "Weekdays",
    streak: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  },
  {
    id: "run",
    name: "Morning run",
    cadence: "5× / week",
    streak: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
  },
  {
    id: "read",
    name: "Read 20 pages",
    cadence: "Daily",
    streak: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  },
  {
    id: "stretch",
    name: "Stretch 10 min",
    cadence: "Daily",
    streak: [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  },
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function signal(streak: number[]): number {
  const recent = streak.slice(-7);
  return Math.round((recent.reduce((a, b) => a + b, 0) / 7) * 100);
}

export default function LaminaDemo({ business }: { business: Business }) {
  const [habits, setHabits] = useState<Habit[]>(SEED);
  const [draft, setDraft] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const overall = useMemo(() => {
    const avg =
      habits.reduce((a, h) => a + signal(h.streak), 0) / Math.max(habits.length, 1);
    return Math.round(avg);
  }, [habits]);

  function toggleToday(id: string) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const next = [...h.streak];
        next[next.length - 1] = next[next.length - 1] ? 0 : 1;
        return { ...h, streak: next };
      }),
    );
  }

  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setHabits((prev) => [
      ...prev,
      {
        id: name.toLowerCase().replace(/\s+/g, "-") + "-" + prev.length,
        name,
        cadence: "Daily",
        streak: Array(14).fill(0).concat(),
      },
    ]);
    setDraft("");
  }

  return (
    <DemoShell business={business}>
      <div className="lamina">
        <header className="lamina__top">
          <span className="lamina__brand">Lamina</span>
          <nav>
            <a className="is-active">Today</a>
            <a>Week</a>
            <a>Signal</a>
            <a>Settings</a>
          </nav>
          <span className="lamina__me">JT</span>
        </header>

        <section className="lamina__panel">
          <div className="lamina__panel-head">
            <div>
              <p className="lamina__eyebrow">Wednesday · April 22</p>
              <h1 className="lamina__title">Build the day.</h1>
              <p className="lamina__sub">
                No streaks. No guilt. Just the signal of what you actually kept
                up.
              </p>
            </div>
            <div className="lamina__signal">
              <div
                className="lamina__ring"
                style={{ ["--ring" as string]: `${overall}%` }}
                aria-label={`${overall}% signal this week`}
              >
                <span className="lamina__ring-num">{overall}%</span>
                <span className="lamina__ring-label">7-day signal</span>
              </div>
            </div>
          </div>

          <ul className="lamina__habits">
            {habits.map((h) => (
              <li key={h.id} className="lamina-habit">
                <button
                  type="button"
                  className={`lamina-habit__check ${
                    h.streak[h.streak.length - 1] ? "is-on" : ""
                  }`}
                  onClick={() => toggleToday(h.id)}
                  aria-pressed={!!h.streak[h.streak.length - 1]}
                  aria-label={`Mark ${h.name} done today`}
                >
                  {h.streak[h.streak.length - 1] ? "✓" : ""}
                </button>
                <div className="lamina-habit__body">
                  <div className="lamina-habit__row">
                    <span className="lamina-habit__name">{h.name}</span>
                    <span className="lamina-habit__meta">{h.cadence}</span>
                  </div>
                  <div className="lamina-habit__track" aria-hidden>
                    {h.streak.map((d, i) => (
                      <span
                        key={i}
                        className={`lamina-habit__dot ${d ? "is-on" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="lamina-habit__signal">
                  {signal(h.streak)}%
                </span>
              </li>
            ))}
          </ul>

          <form className="lamina__add" onSubmit={addHabit}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a habit (e.g. No phone before noon)"
              aria-label="New habit"
            />
            <button type="submit">Add</button>
            <button
              type="button"
              className="lamina__suggest"
              disabled={suggesting}
              onClick={async () => {
                setSuggesting(true);
                const result = await callAi("lamina.suggest", {
                  existing: habits.map((h) => h.name),
                });
                if (result.text) setDraft(result.text);
                setSuggesting(false);
              }}
            >
              {suggesting ? "Thinking…" : "Suggest with AI"}
            </button>
          </form>
        </section>

        <section className="lamina__week">
          <div className="lamina__week-head">
            <h2>This week</h2>
            <span className="lamina__muted">Last 7 days</span>
          </div>
          <div className="lamina__grid">
            <div className="lamina__grid-head" aria-hidden>
              <span />
              {DAY_LABELS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            {habits.map((h) => (
              <div className="lamina__grid-row" key={h.id}>
                <span className="lamina__grid-name">{h.name}</span>
                {h.streak.slice(-7).map((d, i) => (
                  <span
                    key={i}
                    className={`lamina__cell ${d ? "is-on" : ""}`}
                    aria-hidden
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <footer className="lamina__foot">
          Pro · $8/mo · cancel anytime · synced across iPhone + Mac
        </footer>
      </div>
    </DemoShell>
  );
}

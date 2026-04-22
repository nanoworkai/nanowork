import { useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Pkg = {
  id: string;
  name: string;
  duration: string;
  price: number;
  includes: string[];
};

const PACKAGES: Pkg[] = [
  {
    id: "discovery",
    name: "Discovery call",
    duration: "45 min",
    price: 0,
    includes: [
      "Scope + timeline sketch",
      "Fit-check, both directions",
      "Follow-up with written next steps",
    ],
  },
  {
    id: "sprint",
    name: "2-week sprint",
    duration: "10 business days",
    price: 7500,
    includes: [
      "Scoped deliverable + weekly demo",
      "Slack channel for async",
      "Handoff doc + Loom walkthrough",
    ],
  },
  {
    id: "monthly",
    name: "Monthly retainer",
    duration: "Recurring",
    price: 16000,
    includes: [
      "40 hours / month, steered by you",
      "Weekly working call",
      "First-in-queue for new work",
    ],
  },
];

const SLOTS = [
  { day: "Thu Apr 23", times: ["10:00", "11:30", "2:00"] },
  { day: "Fri Apr 24", times: ["9:30", "1:00", "3:30"] },
  { day: "Mon Apr 27", times: ["10:00", "11:30", "4:00"] },
  { day: "Tue Apr 28", times: ["9:30", "1:30", "3:00"] },
];

export default function BenchDemo({ business }: { business: Business }) {
  const [pkg, setPkg] = useState<Pkg>(PACKAGES[1]);
  const [day, setDay] = useState(SLOTS[0].day);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", goals: "" });
  const [booked, setBooked] = useState(false);

  const slot = SLOTS.find((s) => s.day === day) ?? SLOTS[0];
  const deposit = pkg.price > 0 ? Math.round(pkg.price * 0.25) : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !time) return;
    setBooked(true);
  }

  return (
    <DemoShell business={business}>
      <div className="bench">
        <header className="bench__top">
          <div className="bench__brand">
            <span className="bench__mark" aria-hidden>
              ⋈
            </span>
            <div>
              <span className="bench__name">Bench</span>
              <span className="bench__sub">Studio of Mira Chen · Brand + product design</span>
            </div>
          </div>
          <nav>
            <a className="is-active">Book</a>
            <a>Work</a>
            <a>About</a>
          </nav>
        </header>

        {booked ? (
          <section className="bench__confirmed">
            <h1>You're on the calendar.</h1>
            <p>
              {form.name}, we're locked in for the <strong>{pkg.name}</strong>{" "}
              on <strong>{slot.day}</strong> at <strong>{time}</strong>.
            </p>
            <p>
              Check <strong>{form.email}</strong> for the Google Meet link,
              intake questionnaire, and — if a deposit was due — your receipt
              for ${deposit.toLocaleString("en-US")}.
            </p>
            <button
              type="button"
              className="bench__again"
              onClick={() => {
                setBooked(false);
                setTime(null);
                setForm({ name: "", email: "", goals: "" });
              }}
            >
              Book another
            </button>
          </section>
        ) : (
          <section className="bench__book">
            <header className="bench__book-head">
              <p className="bench__eyebrow">Book serious work.</p>
              <h1>Pick a package, pick a window, pay the deposit.</h1>
              <p className="bench__lede">
                One link. Clean intake. No ping-pong. If we're a fit, we ship.
                If we're not, we say so on the call.
              </p>
            </header>

            <div className="bench__grid">
              <div className="bench__col">
                <h2>1. Package</h2>
                <ul className="bench__pkgs">
                  {PACKAGES.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`bench-pkg ${
                          pkg.id === p.id ? "is-active" : ""
                        }`}
                        onClick={() => setPkg(p)}
                      >
                        <div className="bench-pkg__row">
                          <strong>{p.name}</strong>
                          <span>
                            {p.price > 0
                              ? `$${p.price.toLocaleString("en-US")}`
                              : "Free"}
                          </span>
                        </div>
                        <span className="bench-pkg__dur">{p.duration}</span>
                        <ul className="bench-pkg__inc">
                          {p.includes.map((i) => (
                            <li key={i}>{i}</li>
                          ))}
                        </ul>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bench__col">
                <h2>2. Window</h2>
                <div className="bench__days">
                  {SLOTS.map((s) => (
                    <button
                      key={s.day}
                      type="button"
                      className={`bench-day ${day === s.day ? "is-active" : ""}`}
                      onClick={() => {
                        setDay(s.day);
                        setTime(null);
                      }}
                    >
                      {s.day}
                    </button>
                  ))}
                </div>
                <div className="bench__times">
                  {slot.times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`bench-time ${time === t ? "is-active" : ""}`}
                      onClick={() => setTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="bench__tz">All times Pacific · 60 min hold</p>
              </div>

              <form className="bench__col bench__intake" onSubmit={submit}>
                <h2>3. Intake</h2>
                <label>
                  <span>Your name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label>
                  <span>What are we solving?</span>
                  <textarea
                    rows={4}
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    placeholder="One or two sentences is plenty."
                  />
                </label>

                <div className="bench__summary">
                  <div>
                    <dt>Package</dt>
                    <dd>{pkg.name}</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>
                      {day}
                      {time ? ` · ${time}` : " · pick a time"}
                    </dd>
                  </div>
                  <div>
                    <dt>Deposit</dt>
                    <dd>
                      {deposit > 0
                        ? `$${deposit.toLocaleString("en-US")} · balance on delivery`
                        : "No deposit"}
                    </dd>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bench__submit"
                  disabled={!time || !form.name || !form.email}
                >
                  {deposit > 0
                    ? `Pay deposit + book · $${deposit.toLocaleString("en-US")}`
                    : "Book discovery call"}
                </button>
                <p className="bench__fine">
                  Secure deposit via Stripe · iCal invite sent instantly · You
                  can reschedule up to 24h before.
                </p>
              </form>
            </div>
          </section>
        )}
      </div>
    </DemoShell>
  );
}

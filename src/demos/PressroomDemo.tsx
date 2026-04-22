import { useMemo, useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Journalist = {
  id: string;
  name: string;
  outlet: string;
  beats: string[];
  region: string;
  email: string;
  lastCovered: string;
};

const JOURNALISTS: Journalist[] = [
  {
    id: "j1",
    name: "Aditi Rao",
    outlet: "TechCrunch",
    beats: ["SaaS", "fintech"],
    region: "San Francisco",
    email: "a.rao@techcrunch.com",
    lastCovered: "Seed-stage AI infra · 3 days ago",
  },
  {
    id: "j2",
    name: "Marcus Webb",
    outlet: "The Information",
    beats: ["B2B", "enterprise"],
    region: "New York",
    email: "m.webb@theinformation.com",
    lastCovered: "$40M Series B · 5 days ago",
  },
  {
    id: "j3",
    name: "Yuki Tanaka",
    outlet: "The Verge",
    beats: ["consumer", "AI"],
    region: "San Francisco",
    email: "y.tanaka@theverge.com",
    lastCovered: "Consumer AI feature · 1 day ago",
  },
  {
    id: "j4",
    name: "Hannah Schmidt",
    outlet: "Protocol",
    beats: ["SaaS", "climate"],
    region: "Austin",
    email: "h.schmidt@protocol.com",
    lastCovered: "Climate SaaS profile · 2 weeks ago",
  },
  {
    id: "j5",
    name: "Derek Olu",
    outlet: "Business Insider",
    beats: ["fintech", "startups"],
    region: "London",
    email: "d.olu@businessinsider.com",
    lastCovered: "Seed-stage fintech roundup · 1 week ago",
  },
  {
    id: "j6",
    name: "Priya Menon",
    outlet: "Axios",
    beats: ["B2B", "media"],
    region: "Washington, DC",
    email: "p.menon@axios.com",
    lastCovered: "Newsroom tooling feature · 4 days ago",
  },
  {
    id: "j7",
    name: "Leo Martins",
    outlet: "Sifted",
    beats: ["europe", "SaaS"],
    region: "Berlin",
    email: "l.martins@sifted.eu",
    lastCovered: "EU SaaS funding piece · yesterday",
  },
  {
    id: "j8",
    name: "Nina Park",
    outlet: "Bloomberg",
    beats: ["fintech", "enterprise"],
    region: "New York",
    email: "n.park@bloomberg.net",
    lastCovered: "Enterprise AI piece · 6 days ago",
  },
];

type Pitch = {
  id: string;
  journalist: string;
  status: "draft" | "sent" | "replied" | "covered";
  sentDays: number;
};

const INITIAL_PITCHES: Pitch[] = [
  { id: "p1", journalist: "Aditi Rao", status: "replied", sentDays: 2 },
  { id: "p2", journalist: "Marcus Webb", status: "sent", sentDays: 1 },
  { id: "p3", journalist: "Yuki Tanaka", status: "draft", sentDays: 0 },
  { id: "p4", journalist: "Hannah Schmidt", status: "covered", sentDays: 8 },
];

export default function PressroomDemo({ business }: { business: Business }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"kit" | "db" | "pipeline">("db");
  const [pitches, setPitches] = useState(INITIAL_PITCHES);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return JOURNALISTS;
    return JOURNALISTS.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.outlet.toLowerCase().includes(q) ||
        j.beats.some((b) => b.toLowerCase().includes(q)) ||
        j.region.toLowerCase().includes(q),
    );
  }, [query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addToPipeline() {
    const added: Pitch[] = [];
    for (const id of selected) {
      const j = JOURNALISTS.find((x) => x.id === id);
      if (!j) continue;
      added.push({
        id: `p-${Date.now()}-${id}`,
        journalist: j.name,
        status: "draft",
        sentDays: 0,
      });
    }
    setPitches((prev) => [...added, ...prev]);
    setSelected(new Set());
    setTab("pipeline");
  }

  return (
    <DemoShell business={business}>
      <div className="pressroom">
        <header className="pressroom__top">
          <div className="pressroom__brand">
            <span className="pressroom__mark">PR</span>
            <span>Pressroom</span>
          </div>
          <nav role="tablist">
            {[
              { k: "kit", label: "Media kit" },
              { k: "db", label: "Journalist DB" },
              { k: "pipeline", label: `Pipeline · ${pitches.length}` },
            ].map((t) => (
              <button
                key={t.k}
                type="button"
                role="tab"
                aria-selected={tab === t.k}
                className={tab === t.k ? "is-active" : ""}
                onClick={() => setTab(t.k as typeof tab)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <span className="pressroom__org">Lumen, Inc.</span>
        </header>

        {tab === "kit" && (
          <section className="pressroom__kit">
            <aside className="pressroom__kit-side">
              <span className="pressroom__mark pressroom__mark--big">L</span>
              <h1>Lumen</h1>
              <p>
                The enterprise data platform for teams that hate enterprise
                data platforms.
              </p>
              <dl>
                <div>
                  <dt>Founded</dt>
                  <dd>2023</dd>
                </div>
                <div>
                  <dt>HQ</dt>
                  <dd>San Francisco, CA</dd>
                </div>
                <div>
                  <dt>Raised</dt>
                  <dd>$18M (Series A)</dd>
                </div>
                <div>
                  <dt>Customers</dt>
                  <dd>340+ · avg 180 seats</dd>
                </div>
              </dl>
              <a
                href="#download"
                className="pressroom__kit-download"
                onClick={(e) => e.preventDefault()}
              >
                Download press kit (ZIP)
              </a>
            </aside>
            <div className="pressroom__kit-body">
              <section>
                <h2>Boilerplate</h2>
                <p>
                  Lumen is a modern data platform built for product teams.
                  It unifies event, behavioral, and application data behind a
                  single schema and query layer — without asking teams to learn
                  yet another DSL. Founded in 2023, Lumen is headquartered in
                  San Francisco and backed by Kite, Greylock, and angels from
                  Figma, Notion, and Vercel.
                </p>
              </section>
              <section>
                <h2>Founders</h2>
                <ul className="pressroom__people">
                  <li>
                    <strong>Ivy Chen</strong>
                    <span>CEO · formerly Staff PM, Stripe</span>
                  </li>
                  <li>
                    <strong>Omar Farah</strong>
                    <span>CTO · formerly Principal Eng, Snowflake</span>
                  </li>
                </ul>
              </section>
              <section>
                <h2>Coverage</h2>
                <ul className="pressroom__coverage">
                  <li>
                    <span>TechCrunch</span>
                    <em>Apr '25</em>
                    <p>"Lumen's Series A bet: product teams, not data engineers."</p>
                  </li>
                  <li>
                    <span>The Information</span>
                    <em>Feb '26</em>
                    <p>"How Lumen beat Snowflake to the mid-market."</p>
                  </li>
                  <li>
                    <span>Axios</span>
                    <em>Mar '26</em>
                    <p>"The quiet boom in small-team data platforms."</p>
                  </li>
                </ul>
              </section>
              <section>
                <h2>Assets</h2>
                <ul className="pressroom__assets">
                  <li>Primary logo (SVG · PNG · light / dark)</li>
                  <li>Product screenshots — 4k</li>
                  <li>Founder headshots — high-res</li>
                  <li>One-pager PDF</li>
                </ul>
              </section>
            </div>
          </section>
        )}

        {tab === "db" && (
          <section className="pressroom__db">
            <header>
              <div>
                <p className="pressroom__eyebrow">press, organized.</p>
                <h1>4,812 journalists indexed.</h1>
                <p>
                  Filtered by beat, outlet, region, and what they actually
                  covered in the last 30 days. Pick a shortlist, draft pitches,
                  and push everything into your pipeline.
                </p>
              </div>
              <input
                type="search"
                placeholder="Search name, outlet, beat, region…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search journalists"
              />
            </header>
            <table className="pressroom__table">
              <thead>
                <tr>
                  <th />
                  <th>Journalist</th>
                  <th>Outlet</th>
                  <th>Beats</th>
                  <th>Region</th>
                  <th>Last covered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr
                    key={j.id}
                    className={selected.has(j.id) ? "is-selected" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(j.id)}
                        onChange={() => toggle(j.id)}
                        aria-label={`Select ${j.name}`}
                      />
                    </td>
                    <td>
                      <strong>{j.name}</strong>
                      <span className="pressroom__email mono">{j.email}</span>
                    </td>
                    <td>{j.outlet}</td>
                    <td>
                      <span className="pressroom__beats">
                        {j.beats.map((b) => (
                          <span key={b}>{b}</span>
                        ))}
                      </span>
                    </td>
                    <td>{j.region}</td>
                    <td>{j.lastCovered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer className="pressroom__db-foot">
              <span>
                {selected.size} selected · {filtered.length} shown · 4,812 total
              </span>
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={addToPipeline}
              >
                Draft pitch to {selected.size || "…"} journalist
                {selected.size === 1 ? "" : "s"}
              </button>
            </footer>
          </section>
        )}

        {tab === "pipeline" && (
          <section className="pressroom__pipeline">
            <header>
              <h1>Pitch pipeline</h1>
              <p>
                Every conversation, in one place. Replies land in the Pressroom
                inbox; covered hits auto-update when we spot the mention.
              </p>
            </header>
            <ul className="pressroom__pipeline-list">
              {pitches.map((p) => (
                <li key={p.id} className={`pressroom-pitch pressroom-pitch--${p.status}`}>
                  <span className="pressroom-pitch__status">
                    {p.status === "draft"
                      ? "Draft"
                      : p.status === "sent"
                        ? "Sent"
                        : p.status === "replied"
                          ? "Replied"
                          : "Covered"}
                  </span>
                  <strong>{p.journalist}</strong>
                  <span>
                    {p.status === "draft"
                      ? "Ready to send"
                      : p.status === "sent"
                        ? `Sent ${p.sentDays}d ago · awaiting reply`
                        : p.status === "replied"
                          ? `Replied ${p.sentDays}d ago · open the thread`
                          : `Covered ${p.sentDays}d ago · logged to kit`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </DemoShell>
  );
}

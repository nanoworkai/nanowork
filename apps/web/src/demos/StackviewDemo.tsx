import { useMemo, useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Portfolio = {
  handle: string;
  name: string;
  role: string;
  location: string;
  stack: string[];
  summary: string;
  stars: number;
  talks: number;
  writing: number;
  highlights: { year: string; title: string; where: string }[];
  repos: { name: string; desc: string; stars: number }[];
  reading: string[];
  theme: "forest" | "ink" | "paper";
};

const PORTFOLIOS: Portfolio[] = [
  {
    handle: "zoe-k",
    name: "Zoë Kamau",
    role: "Staff Engineer · Platform",
    location: "Brooklyn, NY",
    stack: ["Go", "Kubernetes", "Postgres", "gRPC"],
    summary:
      "Ten years of making distributed systems more boring. I care about paved roads, good defaults, and leaving a team that can ship without me.",
    stars: 3240,
    talks: 7,
    writing: 24,
    highlights: [
      {
        year: "2025",
        title: "Led multi-region failover migration",
        where: "Linear",
      },
      {
        year: "2024",
        title: "Authored the platform paved-road RFC",
        where: "Linear",
      },
      {
        year: "2022",
        title: "Built service-mesh rollout for 200+ services",
        where: "Shopify",
      },
    ],
    repos: [
      {
        name: "zoek/gomigrate",
        desc: "Opinionated Postgres migrations for Go monorepos.",
        stars: 1840,
      },
      {
        name: "zoek/sigtrap",
        desc: "Better signal handling for long-running services.",
        stars: 920,
      },
      {
        name: "zoek/retrospect",
        desc: "Incident retro templates we actually use.",
        stars: 480,
      },
    ],
    reading: [
      "Designing Data-Intensive Applications · Kleppmann",
      "Staff Engineer · Larson",
      "The Phoenix Project · Kim",
    ],
    theme: "forest",
  },
  {
    handle: "mallory-r",
    name: "Mallory Reeves",
    role: "Principal Engineer · Product",
    location: "Oakland, CA",
    stack: ["TypeScript", "Rust", "React", "Postgres"],
    summary:
      "I ship product. I also care about the developer experience of the people shipping product around me. Usually the same problem.",
    stars: 1810,
    talks: 4,
    writing: 18,
    highlights: [
      { year: "2025", title: "Rewrote the editor to 60fps on low-end phones", where: "Notion" },
      { year: "2023", title: "Led the mobile PWA, 2M+ MAU", where: "Notion" },
      { year: "2020", title: "First engineer, went from 0 → $5M ARR", where: "Linear (alumnus)" },
    ],
    repos: [
      { name: "mallory/hotkey", desc: "Ergonomic keybinding system for React apps.", stars: 920 },
      { name: "mallory/snap-ssr", desc: "Low-footprint SSR primitives for Remix.", stars: 620 },
      { name: "mallory/flake", desc: "Better flaky-test detection for Jest.", stars: 270 },
    ],
    reading: [
      "A Philosophy of Software Design · Ousterhout",
      "Shape Up · Basecamp",
      "The Design of Everyday Things · Norman",
    ],
    theme: "paper",
  },
  {
    handle: "ravi-s",
    name: "Ravi Sundaram",
    role: "Engineering Manager → IC",
    location: "London, UK",
    stack: ["Python", "Airflow", "dbt", "BigQuery"],
    summary:
      "Ran platform data at two unicorns, then stepped back to IC to build the stuff I used to ask for. Strong opinions on lineage.",
    stars: 540,
    talks: 3,
    writing: 11,
    highlights: [
      { year: "2026", title: "IC lead on data contracts initiative", where: "Monzo" },
      { year: "2024", title: "Scaled data team 6→32", where: "Monzo" },
      { year: "2021", title: "Built the modeling layer that replaced the warehouse", where: "Deliveroo" },
    ],
    repos: [
      { name: "ravi-s/contracts", desc: "Lightweight data-contract DSL + enforcement.", stars: 310 },
      { name: "ravi-s/airflow-sane", desc: "Opinionated Airflow defaults for humans.", stars: 140 },
      { name: "ravi-s/lineage", desc: "Post-hoc lineage for dbt projects.", stars: 90 },
    ],
    reading: [
      "Data Pipelines with Apache Airflow · de Ruiter",
      "Fundamentals of Data Engineering · Reis",
      "The Unicorn Project · Kim",
    ],
    theme: "ink",
  },
];

export default function StackviewDemo({ business }: { business: Business }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>(PORTFOLIOS[0].handle);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PORTFOLIOS;
    return PORTFOLIOS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  const current = PORTFOLIOS.find((p) => p.handle === active) ?? PORTFOLIOS[0];

  return (
    <DemoShell business={business}>
      <div className="stackview">
        <header className="stackview__top">
          <div className="stackview__brand">
            <span className="stackview__mark">⌘</span>
            <span>Stackview</span>
          </div>
          <nav>
            <a className="is-active">Browse</a>
            <a>Templates</a>
            <a>Pricing</a>
          </nav>
          <a className="stackview__cta" href="#claim">
            Claim your domain
          </a>
        </header>

        <section className="stackview__hero">
          <p className="stackview__eyebrow">engineers, rendered.</p>
          <h1>Portfolios for people who don't want to build a portfolio.</h1>
          <p>
            184 portfolios shipped this year. GitHub, talks, writing, and
            reading list pulled in automatically. One YAML file is the whole
            config.
          </p>
          <form
            className="stackview__search"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, or stack (e.g. Rust, Postgres)"
              aria-label="Search engineers"
            />
            <span className="stackview__count">
              {filtered.length} engineer{filtered.length === 1 ? "" : "s"}
            </span>
          </form>
        </section>

        <div className="stackview__layout">
          <ul className="stackview__list">
            {filtered.map((p) => (
              <li key={p.handle}>
                <button
                  type="button"
                  onClick={() => setActive(p.handle)}
                  className={`stackview-card ${
                    active === p.handle ? "is-active" : ""
                  }`}
                >
                  <div className="stackview-card__head">
                    <span className="stackview-card__mono mono">
                      nanowork.ai/stackview/{p.handle}
                    </span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.role} · {p.location}</p>
                  <ul className="stackview-card__chips">
                    {p.stack.slice(0, 4).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </button>
              </li>
            ))}
          </ul>

          <article className={`stackview__profile stackview__profile--${current.theme}`}>
            <header className="stackview__profile-head">
              <div>
                <span className="stackview__mono mono">
                  nanowork.ai/stackview/{current.handle}
                </span>
                <h2>{current.name}</h2>
                <p>{current.role} · {current.location}</p>
              </div>
              <dl className="stackview__stats">
                <div>
                  <dt>★</dt>
                  <dd>{current.stars.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt>Talks</dt>
                  <dd>{current.talks}</dd>
                </div>
                <div>
                  <dt>Writing</dt>
                  <dd>{current.writing}</dd>
                </div>
              </dl>
            </header>

            <p className="stackview__summary">{current.summary}</p>

            <ul className="stackview__chips">
              {current.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <section>
              <h3>Highlights</h3>
              <ul className="stackview__highlights">
                {current.highlights.map((h) => (
                  <li key={h.title}>
                    <span className="stackview__year">{h.year}</span>
                    <div>
                      <strong>{h.title}</strong>
                      <span>{h.where}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Pinned repos</h3>
              <ul className="stackview__repos">
                {current.repos.map((r) => (
                  <li key={r.name}>
                    <div>
                      <strong className="mono">{r.name}</strong>
                      <p>{r.desc}</p>
                    </div>
                    <span>★ {r.stars}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Reading now</h3>
              <ul className="stackview__reading">
                {current.reading.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          </article>
        </div>

        <section className="stackview__cta-section" id="claim">
          <h2>Ship your portfolio this afternoon.</h2>
          <p>
            Connect GitHub, pick a theme, add your talks. We render the site,
            the OG image, and the RSS feed. Your custom domain is one DNS
            record away.
          </p>
          <div className="stackview__cta-row">
            <span className="mono">nanowork.ai/stackview/</span>
            <input placeholder="your-handle" aria-label="Desired handle" />
            <button>Claim</button>
          </div>
        </section>
      </div>
    </DemoShell>
  );
}

import { useMemo, useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Stage = "label" | "in_transit" | "out_for_delivery" | "delivered";

type Shipment = {
  id: string;
  customer: string;
  store: string;
  carrier: "UPS" | "USPS" | "FedEx" | "DHL";
  to: string;
  stage: Stage;
  eta: string;
  updated: string;
  items: string;
};

const SEED: Shipment[] = [
  {
    id: "PC-3829",
    customer: "Anjali R.",
    store: "Moss & Fern",
    carrier: "UPS",
    to: "Brooklyn, NY 11211",
    stage: "out_for_delivery",
    eta: "Today, by 8pm",
    updated: "2m ago",
    items: "Linen throw (ecru) × 1",
  },
  {
    id: "PC-3828",
    customer: "Daniel P.",
    store: "Hollow Hardware",
    carrier: "FedEx",
    to: "Austin, TX 78702",
    stage: "in_transit",
    eta: "Fri, Apr 24",
    updated: "18m ago",
    items: "Brass drawer pulls × 8",
  },
  {
    id: "PC-3827",
    customer: "Sarah M.",
    store: "Moss & Fern",
    carrier: "USPS",
    to: "Portland, OR 97214",
    stage: "delivered",
    eta: "Delivered Tue 3:14pm",
    updated: "1d ago",
    items: "Ceramic planter (ink) × 2",
  },
  {
    id: "PC-3826",
    customer: "Kenji T.",
    store: "Salt Supply",
    carrier: "DHL",
    to: "Toronto, ON",
    stage: "label",
    eta: "Label printed · pickup tomorrow",
    updated: "3h ago",
    items: "Cold-brew concentrate × 6",
  },
  {
    id: "PC-3825",
    customer: "Mara L.",
    store: "Hollow Hardware",
    carrier: "UPS",
    to: "Oakland, CA 94607",
    stage: "in_transit",
    eta: "Sat, Apr 25",
    updated: "41m ago",
    items: "Solid brass hinges × 4",
  },
  {
    id: "PC-3824",
    customer: "Jordan K.",
    store: "Salt Supply",
    carrier: "USPS",
    to: "Chicago, IL 60647",
    stage: "delivered",
    eta: "Delivered Mon 11:08am",
    updated: "2d ago",
    items: "Sea salt sampler × 1",
  },
];

const STAGE_ORDER: Stage[] = ["label", "in_transit", "out_for_delivery", "delivered"];
const STAGE_LABEL: Record<Stage, string> = {
  label: "Label printed",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export default function ParcelDemo({ business }: { business: Business }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(SEED[0].id);
  const [shipments, setShipments] = useState(SEED);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shipments;
    return shipments.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.to.toLowerCase().includes(q) ||
        s.store.toLowerCase().includes(q),
    );
  }, [query, shipments]);

  const active =
    shipments.find((s) => s.id === activeId) ?? filtered[0] ?? shipments[0];

  const counts = useMemo(() => {
    const c: Record<Stage, number> = {
      label: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
    };
    for (const s of shipments) c[s.stage] += 1;
    return c;
  }, [shipments]);

  function advance(id: string) {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const idx = STAGE_ORDER.indexOf(s.stage);
        const nextStage = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
        return { ...s, stage: nextStage, updated: "just now" };
      }),
    );
  }

  return (
    <DemoShell business={business}>
      <div className="parcel">
        <header className="parcel__top">
          <div className="parcel__brand">
            <span className="parcel__mark" aria-hidden>
              ▚
            </span>
            Parcel
          </div>
          <nav>
            <a className="is-active">Shipments</a>
            <a>Routes</a>
            <a>Customers</a>
            <a>Settings</a>
          </nav>
          <div className="parcel__user">
            <span className="parcel__chip">Moss &amp; Fern</span>
            <span className="parcel__avatar">AR</span>
          </div>
        </header>

        <div className="parcel__stats">
          <div>
            <span className="parcel__stat-num">{counts.in_transit + counts.out_for_delivery}</span>
            <span className="parcel__stat-label">In flight</span>
          </div>
          <div>
            <span className="parcel__stat-num">4,218</span>
            <span className="parcel__stat-label">Shipments this week</span>
          </div>
          <div>
            <span className="parcel__stat-num">97.3%</span>
            <span className="parcel__stat-label">On-time rate</span>
          </div>
          <div>
            <span className="parcel__stat-num">$0.04</span>
            <span className="parcel__stat-label">Cost per SMS update</span>
          </div>
        </div>

        <div className="parcel__layout">
          <section className="parcel__list">
            <div className="parcel__list-head">
              <input
                type="search"
                placeholder="Search by tracking, customer, city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search shipments"
              />
              <button type="button" className="parcel__new">
                + New shipment
              </button>
            </div>
            <ul>
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(s.id)}
                    className={`parcel-row ${
                      active?.id === s.id ? "is-active" : ""
                    }`}
                  >
                    <span className={`parcel-row__stage parcel-row__stage--${s.stage}`}>
                      {STAGE_LABEL[s.stage]}
                    </span>
                    <span className="parcel-row__id mono">{s.id}</span>
                    <span className="parcel-row__customer">{s.customer}</span>
                    <span className="parcel-row__to">{s.to}</span>
                    <span className="parcel-row__eta">{s.eta}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="parcel__empty">No shipments match that search.</li>
              )}
            </ul>
          </section>

          <aside className="parcel__detail">
            {active ? (
              <>
                <div className="parcel__detail-head">
                  <div>
                    <p className="parcel__detail-eyebrow">
                      {active.carrier} · {active.store}
                    </p>
                    <h2>{active.id}</h2>
                    <p className="parcel__detail-sub">
                      {active.customer} · {active.to}
                    </p>
                  </div>
                  <span className={`parcel-row__stage parcel-row__stage--${active.stage}`}>
                    {STAGE_LABEL[active.stage]}
                  </span>
                </div>

                <ol className="parcel__timeline">
                  {STAGE_ORDER.map((stage) => {
                    const currentIdx = STAGE_ORDER.indexOf(active.stage);
                    const idx = STAGE_ORDER.indexOf(stage);
                    const state =
                      idx < currentIdx
                        ? "done"
                        : idx === currentIdx
                          ? "active"
                          : "pending";
                    return (
                      <li key={stage} className={`parcel__step parcel__step--${state}`}>
                        <span className="parcel__step-dot" />
                        <div>
                          <strong>{STAGE_LABEL[stage]}</strong>
                          {state === "active" && (
                            <span className="parcel__step-meta">· updated {active.updated}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <dl className="parcel__meta">
                  <div>
                    <dt>Items</dt>
                    <dd>{active.items}</dd>
                  </div>
                  <div>
                    <dt>ETA</dt>
                    <dd>{active.eta}</dd>
                  </div>
                  <div>
                    <dt>Branded page</dt>
                    <dd className="mono">
                      nanowork.ai/parcel/track/{active.id.toLowerCase()}
                    </dd>
                  </div>
                </dl>

                <div className="parcel__detail-actions">
                  <button
                    className="parcel__advance"
                    type="button"
                    onClick={() => advance(active.id)}
                    disabled={active.stage === "delivered"}
                  >
                    {active.stage === "delivered"
                      ? "Delivered"
                      : "Advance stage + notify customer"}
                  </button>
                  <span className="parcel__detail-foot">
                    Branded email + SMS sent automatically on every stage change.
                  </span>
                </div>
              </>
            ) : (
              <p className="parcel__empty">Select a shipment to see details.</p>
            )}
          </aside>
        </div>
      </div>
    </DemoShell>
  );
}

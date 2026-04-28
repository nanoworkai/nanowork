import { useMemo, useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Property = {
  slug: string;
  name: string;
  short: string;
  region: string;
  sleeps: number;
  beds: number;
  baths: number;
  nightly: number;
  rating: number;
  reviews: number;
  highlights: string[];
  amenities: string[];
};

const PROPERTIES: Property[] = [
  {
    slug: "salt-cabin",
    name: "Salt Cabin",
    short: "A-frame + sauna on a salt marsh",
    region: "Stinson Beach, California",
    sleeps: 4,
    beds: 2,
    baths: 1,
    nightly: 485,
    rating: 4.97,
    reviews: 134,
    highlights: [
      "15-min walk to the ocean",
      "Wood-fired sauna + outdoor shower",
      "Stocked kitchen, no TV on purpose",
    ],
    amenities: ["Sauna", "Fireplace", "Hot tub", "EV charger", "Dog-friendly"],
  },
  {
    slug: "barn-house",
    name: "Barn House",
    short: "Converted dairy barn on 8 private acres",
    region: "Sonoma County, California",
    sleeps: 8,
    beds: 4,
    baths: 3,
    nightly: 920,
    rating: 4.92,
    reviews: 212,
    highlights: [
      "32 ft great room with original beams",
      "Private trail down to the creek",
      "Sleeps 8, hosts 14 for dinner",
    ],
    amenities: ["Pool", "Pizza oven", "Starlink", "Workspace", "Piano"],
  },
  {
    slug: "pier-house",
    name: "Pier House",
    short: "Shingled cottage with a private dock",
    region: "Hudson Valley, New York",
    sleeps: 6,
    beds: 3,
    baths: 2,
    nightly: 610,
    rating: 4.89,
    reviews: 178,
    highlights: [
      "Swim off the dock in summer",
      "Woodstove + deep window seats",
      "10 minutes to downtown Beacon",
    ],
    amenities: ["Dock", "Kayaks", "Woodstove", "Record player", "Fast Wi-Fi"],
  },
];

function nightsBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  const ms = db.getTime() - da.getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

export default function NightkeyDemo({ business }: { business: Business }) {
  const [slug, setSlug] = useState(PROPERTIES[0].slug);
  const [checkin, setCheckin] = useState("2026-05-08");
  const [checkout, setCheckout] = useState("2026-05-11");
  const [guests, setGuests] = useState(2);
  const [held, setHeld] = useState<null | { code: string; total: number }>(null);

  const prop = useMemo(
    () => PROPERTIES.find((p) => p.slug === slug) ?? PROPERTIES[0],
    [slug],
  );

  const nights = nightsBetween(checkin, checkout);
  const nightly = prop.nightly * nights;
  const cleaning = 175;
  const service = Math.round(nightly * 0.03);
  const total = nightly + cleaning + service;

  function hold() {
    if (nights <= 0) return;
    const code = `NK-${Math.floor(1000 + Math.random() * 9000)}`;
    setHeld({ code, total });
  }

  return (
    <DemoShell business={business}>
      <div className="nightkey">
        <header className="nightkey__top">
          <div className="nightkey__brand">
            <span className="nightkey__mark" aria-hidden>
              ◈
            </span>
            <span>Nightkey</span>
          </div>
          <nav>
            <a className="is-active">Stays</a>
            <a>Guide</a>
            <a>Concierge</a>
          </nav>
          <a className="nightkey__cta" href="#book">
            Check dates
          </a>
        </header>

        <section className="nightkey__hero">
          <p className="nightkey__eyebrow">Three houses. No middle.</p>
          <h1>Stay direct.</h1>
          <p>
            Nightkey is a tiny collection of homes, booked straight from the
            owners. No platform fees, no auto-generated listings, no mystery
            cleaners. Just the key and a number to text.
          </p>
        </section>

        <ul className="nightkey__tabs" role="tablist">
          {PROPERTIES.map((p) => (
            <li key={p.slug}>
              <button
                role="tab"
                aria-selected={slug === p.slug}
                type="button"
                className={slug === p.slug ? "is-active" : ""}
                onClick={() => setSlug(p.slug)}
              >
                <strong>{p.name}</strong>
                <span>{p.region}</span>
              </button>
            </li>
          ))}
        </ul>

        <section className="nightkey__property">
          <div className="nightkey__gallery" aria-hidden>
            <div className="nightkey__gallery-main" />
            <div className="nightkey__gallery-col">
              <div />
              <div />
            </div>
          </div>

          <div className="nightkey__body">
            <header>
              <h2>{prop.name}</h2>
              <p>{prop.short} · {prop.region}</p>
              <p className="nightkey__stats">
                ★ {prop.rating} ({prop.reviews} stays) · sleeps {prop.sleeps} · {prop.beds} beds · {prop.baths} baths
              </p>
            </header>

            <ul className="nightkey__highlights">
              {prop.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <div className="nightkey__amenities">
              {prop.amenities.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>

            <aside className="nightkey__book" id="book">
              {held ? (
                <div className="nightkey__held">
                  <p className="nightkey__held-head">Hold placed · {held.code}</p>
                  <p>
                    We've put a 24-hour hold on{" "}
                    <strong>{prop.name}</strong>. You'll get an SMS with a
                    Stripe link to confirm for{" "}
                    <strong>${held.total.toLocaleString("en-US")}</strong>.
                  </p>
                  <button
                    type="button"
                    className="nightkey__book-submit"
                    onClick={() => setHeld(null)}
                  >
                    Start over
                  </button>
                </div>
              ) : (
                <>
                  <p className="nightkey__price">
                    <strong>${prop.nightly}</strong> / night
                  </p>
                  <div className="nightkey__fields">
                    <label>
                      <span>Check in</span>
                      <input
                        type="date"
                        value={checkin}
                        onChange={(e) => setCheckin(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Check out</span>
                      <input
                        type="date"
                        value={checkout}
                        onChange={(e) => setCheckout(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Guests</span>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {Array.from({ length: prop.sleeps }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} guest{n === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {nights > 0 ? (
                    <dl className="nightkey__totals">
                      <div>
                        <dt>
                          ${prop.nightly} × {nights} night{nights === 1 ? "" : "s"}
                        </dt>
                        <dd>${nightly.toLocaleString("en-US")}</dd>
                      </div>
                      <div>
                        <dt>Cleaning</dt>
                        <dd>${cleaning}</dd>
                      </div>
                      <div>
                        <dt>Service</dt>
                        <dd>${service}</dd>
                      </div>
                      <div className="nightkey__total">
                        <dt>Total</dt>
                        <dd>${total.toLocaleString("en-US")}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="nightkey__note">
                      Pick a check-in and check-out date.
                    </p>
                  )}

                  <button
                    className="nightkey__book-submit"
                    type="button"
                    disabled={nights <= 0}
                    onClick={hold}
                  >
                    Hold for 24 hours
                  </button>
                  <p className="nightkey__fine">
                    Stripe-powered hold · iCal synced with Airbnb + VRBO · No
                    platform fees, ever.
                  </p>
                </>
              )}
            </aside>
          </div>
        </section>
      </div>
    </DemoShell>
  );
}

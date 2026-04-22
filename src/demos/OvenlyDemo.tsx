import { useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "bread" | "pastry" | "drink";
  status: "available" | "low" | "soldout";
};

const MENU: Item[] = [
  {
    id: "miso-sourdough",
    name: "Miso sourdough",
    description: "Long-fermented white miso loaf. Fresh at 3pm.",
    price: 9,
    category: "bread",
    status: "available",
  },
  {
    id: "walnut-rye",
    name: "Walnut rye",
    description: "Dense, caraway-flecked rye with toasted walnut.",
    price: 11,
    category: "bread",
    status: "low",
  },
  {
    id: "potato-focaccia",
    name: "Potato focaccia",
    description: "Rosemary, flaked salt, yukon gold, olive oil from Liguria.",
    price: 8,
    category: "bread",
    status: "available",
  },
  {
    id: "morning-bun",
    name: "Brown butter morning bun",
    description: "Laminated sugar crust. Best eaten warm, over the sink.",
    price: 5.5,
    category: "pastry",
    status: "available",
  },
  {
    id: "almond-croissant",
    name: "Almond croissant",
    description: "Twice-baked. Dusted. Not subtle.",
    price: 6,
    category: "pastry",
    status: "low",
  },
  {
    id: "chocolate-babka",
    name: "Chocolate babka",
    description: "Whole loaf. Serves 4 if you have self-control.",
    price: 16,
    category: "pastry",
    status: "soldout",
  },
  {
    id: "oat-latte",
    name: "Oat milk latte",
    description: "Single origin espresso, oat, no sweetener unless asked.",
    price: 5,
    category: "drink",
    status: "available",
  },
  {
    id: "hibiscus-tea",
    name: "Iced hibiscus",
    description: "Steeped cold overnight. Lime on the side.",
    price: 4.5,
    category: "drink",
    status: "available",
  },
];

type Filter = "all" | "bread" | "pastry" | "drink";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function OvenlyDemo({ business }: { business: Business }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pickup, setPickup] = useState("3:00 PM");
  const [placed, setPlaced] = useState<string | null>(null);

  const shown = MENU.filter((m) => filter === "all" || m.category === filter);

  function add(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function remove(id: string) {
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  const subtotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = MENU.find((m) => m.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;
  const cartItems = Object.entries(cart);

  function placeOrder() {
    const n = Math.floor(1000 + Math.random() * 9000);
    setPlaced(`OV-${n}`);
    setCart({});
  }

  return (
    <DemoShell business={business}>
      <div className="ovenly">
        <header className="ovenly__top">
          <div className="ovenly__brand">
            <span className="ovenly__mark" aria-hidden>
              🥖
            </span>
            <span>Ovenly</span>
          </div>
          <nav>
            <a className="is-active">Today's menu</a>
            <a>Pickup</a>
            <a>Standing order</a>
          </nav>
          <span className="ovenly__hours">Open · Closes 6pm</span>
        </header>

        <section className="ovenly__hero">
          <div>
            <p className="ovenly__eyebrow">Baked today</p>
            <h1>Today's bake.</h1>
            <p className="ovenly__sub">
              Small runs, daily. Order before 2pm for same-day pickup.
            </p>
          </div>
          <div className="ovenly__filters" role="tablist">
            {(["all", "bread", "pastry", "drink"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? "is-active" : ""}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <div className="ovenly__layout">
          <ul className="ovenly__menu">
            {shown.map((item) => (
              <li key={item.id} className="ovenly-item">
                <div className="ovenly-item__img" aria-hidden />
                <div className="ovenly-item__body">
                  <div className="ovenly-item__row">
                    <h3>{item.name}</h3>
                    <span className="ovenly-item__price">{money(item.price)}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="ovenly-item__row">
                    <span
                      className={`ovenly-tag ovenly-tag--${item.status}`}
                    >
                      {item.status === "available"
                        ? "Available"
                        : item.status === "low"
                          ? "Almost out"
                          : "Sold out"}
                    </span>
                    {item.status !== "soldout" ? (
                      cart[item.id] ? (
                        <div className="ovenly-qty">
                          <button onClick={() => remove(item.id)} aria-label="Remove one">
                            −
                          </button>
                          <span>{cart[item.id]}</span>
                          <button onClick={() => add(item.id)} aria-label="Add one">
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="ovenly-item__add"
                          onClick={() => add(item.id)}
                        >
                          Add to bag
                        </button>
                      )
                    ) : (
                      <span className="ovenly-item__notify">Text me when it returns</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="ovenly__cart">
            <h2>Your bag</h2>
            {placed ? (
              <div className="ovenly__placed">
                <p className="ovenly__placed-head">Order {placed}</p>
                <p>
                  Ready at {pickup} · we'll text you when it's bagged. Pay in
                  store or with the link in the confirmation.
                </p>
                <button
                  type="button"
                  className="ovenly__place"
                  onClick={() => setPlaced(null)}
                >
                  New order
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <p className="ovenly__empty">
                Nothing in the bag yet — add a loaf.
              </p>
            ) : (
              <>
                <ul className="ovenly__lines">
                  {cartItems.map(([id, qty]) => {
                    const item = MENU.find((m) => m.id === id);
                    if (!item) return null;
                    return (
                      <li key={id}>
                        <span>
                          {qty}× {item.name}
                        </span>
                        <span>{money(item.price * qty)}</span>
                      </li>
                    );
                  })}
                </ul>
                <dl className="ovenly__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Tax</dt>
                    <dd>{money(tax)}</dd>
                  </div>
                  <div className="ovenly__total">
                    <dt>Total</dt>
                    <dd>{money(total)}</dd>
                  </div>
                </dl>
                <label className="ovenly__pickup">
                  <span>Pickup window</span>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  >
                    <option>12:00 PM</option>
                    <option>1:30 PM</option>
                    <option>3:00 PM</option>
                    <option>4:30 PM</option>
                  </select>
                </label>
                <button className="ovenly__place" onClick={placeOrder}>
                  Place pickup order
                </button>
                <p className="ovenly__note">
                  SMS confirmation · Square payments · No account required
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </DemoShell>
  );
}

import { useEffect, useRef, useState, type ReactNode } from "react";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal--visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <>
      <div className="noise" aria-hidden />
      <div className="glow" aria-hidden />
      <div className="page">
        <header className="site-header">
          <span className="eyebrow">Nanowork</span>
        </header>

        <main className="story">
          <section className="story-hero" aria-labelledby="story-title">
            <h1 id="story-title" className="story-title">
              Solve job scarcity
              <span className="story-title__line">post AGI.</span>
            </h1>
            <p className="story-lede">
              That is Nanowork’s mission. We assume capable automation will
              compress demand for traditional cognitive work faster than labor
              markets, policy, and training fully adjust. The risk is not only
              slower GDP growth — it is millions of people without a credible
              path to income and dignity. We are focused on widening access to
              legitimate, scalable work in that world — not on preserving every
              role exactly as it exists today.
            </p>
          </section>

          <Reveal>
            <section className="story-block" aria-labelledby="labor-heading">
              <h2 id="labor-heading" className="story-h2">
                Payroll does not absorb the whole transition
              </h2>
              <div className="prose">
                <p>
                  Employment has been the main way advanced economies allocate
                  income. As capability scales, the same output may require fewer
                  seats on an
                  org chart — not overnight everywhere, but directionally and
                  unevenly. Waiting for hiring alone to solve that leaves a gap:
                  people who are able to work, without a slot that still exists
                  on a balance sheet.
                </p>
                <p>
                  One lever that is already moving is lower cost to own
                  outcomes instead of only selling time. A credible product,
                  GTM surface, and first revenue can ship in days instead of
                  quarters. That does not replace redistribution or public
                  goods, but it expands who can participate in wealth creation
                  when the default job ladder thins.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="story-block" aria-labelledby="shift-heading">
              <h2 id="shift-heading" className="story-h2">
                The product constraint moved
              </h2>
              <div className="prose">
                <p>
                  When scaffolding is cheap, the bottleneck stops being “can
                  we build it?” and becomes “does it hold up?” — under load,
                  across edge cases, in compliance and security, and when
                  customers expect the product to work tomorrow the same way
                  it worked today. Income tied to software only works if the
                  software is trustworthy enough to keep.
                </p>
                <p>
                  Quality did not get a matching step change. Reliability,
                  maintainability, and clarity still compound with time,
                  judgment, and ownership. Two teams can ship equally fast
                  demos; they will not ship equally durable businesses — or
                  equally durable livelihoods built on top.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="story-split" aria-labelledby="gap-heading">
              <h2 id="gap-heading" className="sr-only">
                Compressed versus still expensive
              </h2>
              <div className="story-split__col story-split__col--fast">
                <h3 className="story-split__label">What AI compresses</h3>
                <ul className="story-list">
                  <li>Time from idea to working software</li>
                  <li>Cost of early product and GTM surface area</li>
                  <li>Ability for small teams to look “big” on day one</li>
                  <li>Iteration on features and copy</li>
                </ul>
              </div>
              <div className="story-split__divider" aria-hidden />
              <div className="story-split__col story-split__col--slow">
                <h3 className="story-split__label">What still does not</h3>
                <ul className="story-list">
                  <li>Trust: incidents, refunds, reputation</li>
                  <li>Correctness under real data and traffic</li>
                  <li>Security, privacy, and operational discipline</li>
                  <li>Long-horizon maintenance and debt paydown</li>
                </ul>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="story-block" aria-labelledby="stakes-heading">
              <h2 id="stakes-heading" className="story-h2">
                Asymmetric outcomes
              </h2>
              <div className="prose">
                <p>
                  The upside is not hypothetical. Faster builds mean more shots
                  on goal, lower capital intensity, and access to markets that
                  were previously gated by engineering headcount. Job scarcity
                  and entrepreneurial leverage can coexist: many people may need
                  new income at the same time only some can turn a launch into
                  recurring revenue.
                </p>
                <p>
                  In that environment, durability becomes the differentiator —
                  not because polish is morally better, but because customers
                  and regulators eventually care whether the thing works, and
                  because livelihoods attached to software cannot rest on
                  systems nobody maintains.
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="story-closer" aria-labelledby="closer-heading">
              <h2 id="closer-heading" className="sr-only">
                Closing
              </h2>
              <p className="story-spine">
                Our mission is to solve job scarcity post AGI.{" "}
                <span className="story-spine__emph">
                  That means building toward more paths to real income — and
                  treating reliability, ownership, and accountability as part of
                  the same problem, not an afterthought once the demo ships.
                </span>
              </p>
            </section>
          </Reveal>
        </main>

        <footer>© Nanowork, Inc 2026</footer>
      </div>
    </>
  );
}

import { useState } from "react";
import type { Business } from "../data/businesses";
import { DemoShell } from "./DemoShell";

type Issue = {
  n: number;
  date: string;
  title: string;
  dek: string;
  read: string;
  access: "free" | "paid";
  body: string[];
};

const ISSUES: Issue[] = [
  {
    n: 47,
    date: "Apr 21, 2026",
    title: "How a 3-person SaaS priced itself up",
    dek: "They started at $19/mo and couldn't cover hosting. The week they raised to $79, half the work stopped — and revenue doubled.",
    read: "8 min read",
    access: "paid",
    body: [
      "Pricing is usually the first lever founders are afraid to pull — and almost always the highest-ROI one. This week I spent two hours on a call with the operators of a three-person B2B SaaS who finally did it.",
      "They were at $19/mo, 680 customers, and about $12,800 MRR. Their infra bill alone was 14% of revenue. Support was eating their CEO's days. They raised the list price to $79/mo for new customers, grandfathered existing, and added a $19 'solo' tier that drops all the hand-holding.",
      "Within two weeks: conversion rate on the marketing site dropped by ~40%, but revenue per new customer almost 5×'d. Support load fell because the cheaper customers self-select into the simpler tier. The CEO now has 3 hours a day back to do sales.",
      "The takeaway isn't 'raise your prices.' It's: price to segment. The customer who'll pay $79 is a different customer than the one who'll pay $19 — and they want different things from you.",
    ],
  },
  {
    n: 46,
    date: "Apr 14, 2026",
    title: "Why your first hire is almost never an engineer",
    dek: "Counterintuitive advice from 12 post-$1M indie companies — and one spreadsheet that changed how I think about leverage.",
    read: "7 min read",
    access: "paid",
    body: [],
  },
  {
    n: 45,
    date: "Apr 7, 2026",
    title: "The 'quiet acquisition' playbook",
    dek: "How a $40k/yr newsletter got sold to a strategic without a banker, a data room, or a deck. Three lessons I didn't expect.",
    read: "6 min read",
    access: "paid",
    body: [],
  },
  {
    n: 44,
    date: "Mar 31, 2026",
    title: "Reading the room on burn",
    dek: "A simple, blunt framework for whether you have enough runway — that doesn't require a CFO or a dashboard.",
    read: "5 min read",
    access: "free",
    body: [],
  },
  {
    n: 43,
    date: "Mar 24, 2026",
    title: "Field notes from 40 founder calls",
    dek: "The pattern I didn't expect: everyone doing $5–25k MRR is fighting the same four problems, and almost nobody is naming them out loud.",
    read: "9 min read",
    access: "paid",
    body: [],
  },
];

export default function FieldnoteDemo({ business }: { business: Business }) {
  const [open, setOpen] = useState<number | null>(ISSUES[0].n);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const issue = ISSUES.find((i) => i.n === open);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <DemoShell business={business}>
      <div className="fieldnote">
        <header className="fieldnote__top">
          <div className="fieldnote__brand">
            <span className="fieldnote__mark">F</span>
            <div>
              <span className="fieldnote__name">Fieldnote</span>
              <span className="fieldnote__tag">Notes from the floor.</span>
            </div>
          </div>
          <nav>
            <a className="is-active">Archive</a>
            <a>About</a>
            <a>Press</a>
          </nav>
          <a className="fieldnote__cta" href="#subscribe">
            Subscribe · $9/mo
          </a>
        </header>

        <section className="fieldnote__hero">
          <p className="fieldnote__eyebrow">Issue {ISSUES[0].n} · {ISSUES[0].date}</p>
          <h1>{ISSUES[0].title}</h1>
          <p className="fieldnote__dek">{ISSUES[0].dek}</p>
          <div className="fieldnote__meta">
            <span>1,412 paid readers</span>
            <span>·</span>
            <span>Published Tuesdays</span>
            <span>·</span>
            <span>Written by Hannah Reeves</span>
          </div>
        </section>

        <div className="fieldnote__layout">
          <article className="fieldnote__article">
            {issue ? (
              <>
                <p className="fieldnote__eyebrow">Issue {issue.n} · {issue.date} · {issue.read}</p>
                <h2>{issue.title}</h2>
                <p className="fieldnote__dek">{issue.dek}</p>
                {issue.body.length > 0 ? (
                  <div className="fieldnote__body">
                    {issue.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {issue.access === "paid" && (
                      <div className="fieldnote__paywall">
                        <p>
                          You're reading a preview. The rest of this issue —
                          including the spreadsheet, the case study, and the
                          pricing worksheet — is for paid subscribers.
                        </p>
                        <a href="#subscribe" className="fieldnote__paywall-cta">
                          Subscribe for $9/mo →
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="fieldnote__locked">
                    <p>
                      This issue is for paid subscribers.
                    </p>
                    <a href="#subscribe" className="fieldnote__paywall-cta">
                      Unlock the archive →
                    </a>
                  </div>
                )}
              </>
            ) : null}
          </article>

          <aside className="fieldnote__sidebar">
            <h3>Archive</h3>
            <ol className="fieldnote__list">
              {ISSUES.map((i) => (
                <li key={i.n}>
                  <button
                    type="button"
                    onClick={() => setOpen(i.n)}
                    className={issue?.n === i.n ? "is-active" : ""}
                  >
                    <span className="fieldnote__list-date">{i.date}</span>
                    <span className="fieldnote__list-title">{i.title}</span>
                    <span className={`fieldnote__access fieldnote__access--${i.access}`}>
                      {i.access === "paid" ? "Paid" : "Free"}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <section className="fieldnote__subscribe" id="subscribe">
          {subscribed ? (
            <div className="fieldnote__thanks">
              <h2>Check your inbox.</h2>
              <p>
                A confirmation is on its way to{" "}
                <strong>{email}</strong>. Reply to that email and you're in.
              </p>
            </div>
          ) : (
            <>
              <h2>One email, Tuesday morning.</h2>
              <p>
                Operating lessons from small, profitable companies — written by
                someone still running one. No hustle porn. No frameworks for
                frameworks' sake. $9/mo, cancel anytime.
              </p>
              <form onSubmit={subscribe}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  aria-label="Email address"
                />
                <button type="submit">Start reading</button>
              </form>
              <p className="fieldnote__finep">
                7-day free trial · Powered by Ghost + Stripe
              </p>
            </>
          )}
        </section>
      </div>
    </DemoShell>
  );
}

import { useEffect, useRef, useState } from "react";

const AGENT_TASKS = [
  { agent: "Legal", task: "Operating agreement updated · Nanowork, Inc." },
  { agent: "Legal", task: "EIN confirmation archived · Nanowork, Inc." },
  { agent: "Legal", task: "Privacy policy refreshed · CCPA + GDPR pass" },
  { agent: "Legal", task: "Contractor NDA executed · 3 signatures collected" },
  { agent: "Legal", task: "Terms of service reviewed · v2.1 live" },
  { agent: "Brand", task: "Voice guidelines doc exported · Nanowork" },
  { agent: "Brand", task: "Social asset pack generated · 6 formats" },
  { agent: "Brand", task: "Logo system finalized · light + dark exports" },
  { agent: "Brand", task: "Ad creative exported · 4 performance variants" },
  { agent: "Brand", task: "Brand refresh deck compiled · stakeholder-ready" },
  { agent: "Web", task: "Pricing page A/B variant deployed · nanowork.ai" },
  { agent: "Web", task: "Core Web Vitals pass · mobile layout tuned" },
  { agent: "Web", task: "Checkout flow tested · 100% conversion path clear" },
  { agent: "Web", task: "SEO meta updated · 14 pages refreshed" },
  { agent: "Web", task: "Sitemap submitted · Google Search Console" },
  { agent: "Sales", task: "Cold outreach sequence triggered · 18 contacts" },
  { agent: "Sales", task: "Pipeline refreshed · 9 qualified leads added" },
  { agent: "Sales", task: "Follow-up cadence sent · 7 warm contacts" },
  { agent: "Sales", task: "Demo request answered · same-hour SLA met" },
  { agent: "Sales", task: "CRM hygiene pass · 34 stale records cleaned" },
  { agent: "Finance", task: "Stripe revenue reconciled · April 2026" },
  { agent: "Finance", task: "Expense report compiled · Q1 close complete" },
  { agent: "Finance", task: "Invoice batch sent · 2 outstanding collected" },
  { agent: "Finance", task: "Chart of accounts updated · new revenue line" },
  { agent: "Ops", task: "Deployment runbook updated · checklist v3" },
  { agent: "Ops", task: "Status page updated · all systems nominal" },
  { agent: "Ops", task: "Vendor SLA reviewed · infrastructure terms" },
  { agent: "Marketing", task: "Email campaign deployed · 412 subscribers" },
  { agent: "Marketing", task: "SEO article published · nanowork.ai/blog" },
  { agent: "Marketing", task: "LinkedIn post scheduled · 3 platform variants" },
];

const AGENT_COLORS: Record<string, string> = {
  Legal: "#7b8fff",
  Brand: "#c4a574",
  Web: "#4caf8a",
  Sales: "#ff9f66",
  Finance: "#a78bfa",
  Ops: "#64b5f6",
  Marketing: "#f06292",
};

function timeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

type TaskEntry = {
  id: number;
  agent: string;
  task: string;
  ts: number;
};

const BASE_AGENT_COUNT = 42 + Math.floor(Math.random() * 22);
const BASE_TASK_COUNT = 1180 + Math.floor(Math.random() * 260);

export function LiveAgentFeed() {
  const [agentCount, setAgentCount] = useState(BASE_AGENT_COUNT);
  const [taskCount, setTaskCount] = useState(BASE_TASK_COUNT);
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [now, setNow] = useState(Date.now());
  const idRef = useRef(0);
  const usedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const indices = new Set<number>();
    while (indices.size < 6) {
      indices.add(Math.floor(Math.random() * AGENT_TASKS.length));
    }
    const initial: TaskEntry[] = [];
    let offset = 0;
    for (const i of indices) {
      initial.push({
        id: idRef.current++,
        ...AGENT_TASKS[i],
        ts: Date.now() - (offset * 48000 + Math.random() * 28000),
      });
      offset++;
    }
    setTasks(initial);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    function scheduleNext() {
      const delay = 4200 + Math.random() * 6800;
      timeoutId = setTimeout(() => {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * AGENT_TASKS.length);
        } while (usedRef.current.has(idx) && usedRef.current.size < AGENT_TASKS.length);
        if (usedRef.current.size >= AGENT_TASKS.length) usedRef.current.clear();
        usedRef.current.add(idx);
        const entry: TaskEntry = { id: idRef.current++, ...AGENT_TASKS[idx], ts: Date.now() };
        setTasks((prev) => [entry, ...prev].slice(0, 7));
        setTaskCount((n) => n + 1);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    function scheduleNext() {
      const delay = 9000 + Math.random() * 18000;
      timeoutId = setTimeout(() => {
        setAgentCount((n) => n + 1 + (Math.random() < 0.28 ? 1 : 0));
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="laf-section" aria-label="Live agent activity">
      <div className="laf-inner">
        <div className="laf-header">
          <span className="laf-live-pill">
            <span className="laf-live-pill__dot" aria-hidden />
            LIVE
          </span>
          <span className="laf-header__label">Agent floor · Nanowork</span>
        </div>

        <div className="laf-body">
          <div className="laf-stat-col">
            <div className="laf-stat">
              <span className="laf-stat__num" key={agentCount} aria-live="polite">
                {agentCount}
              </span>
              <span className="laf-stat__label">agents active</span>
            </div>
            <div className="laf-stat laf-stat--secondary">
              <span className="laf-stat__num laf-stat__num--sm" key={taskCount} aria-live="polite">
                {taskCount.toLocaleString()}
              </span>
              <span className="laf-stat__label">tasks completed</span>
            </div>
          </div>

          <div className="laf-feed-col">
            <ul className="laf-feed" aria-live="polite" aria-label="Recent agent tasks">
              {tasks.map((t) => (
                <li key={t.id} className="laf-feed__row">
                  <span
                    className="laf-feed__dot"
                    style={{ background: AGENT_COLORS[t.agent] ?? "var(--accent)" }}
                    aria-hidden
                  />
                  <span
                    className="laf-feed__agent"
                    style={{ color: AGENT_COLORS[t.agent] ?? "var(--accent)" }}
                  >
                    {t.agent}
                  </span>
                  <span className="laf-feed__task">{t.task}</span>
                  <span className="laf-feed__time">{timeAgo(now - t.ts)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { TopNav, SiteFooter } from "../components/SiteChrome";
import type { RentItem, RentCategory } from "../types/rent";

// ── Utilities ─────────────────────────────────────────────────────────────

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ── Components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RentItem["status"] }) {
  const labels = {
    coming_soon: "Coming Soon",
    preview: "Preview",
    available: "Available",
    waitlist_only: "Waitlist Only",
    unavailable: "Unavailable",
  };

  const styles = {
    coming_soon: "bg-slate-100 text-slate-600 border-slate-200",
    preview: "bg-blue-50 text-blue-700 border-blue-200",
    available: "bg-green-50 text-green-700 border-green-200",
    waitlist_only: "bg-amber-50 text-amber-700 border-amber-200",
    unavailable: "bg-slate-100 text-slate-400 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      {labels[status]}
    </span>
  );
}

function Hero({ onJoinWaitlist }: { onJoinWaitlist: () => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="py-20 px-6">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Preview Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-medium text-slate-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse-dot" />
          Early Access · Physical Marketplace
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 tracking-tight mb-6">
          Physical resources for
          <br />
          <span className="text-slate-500">AI agents that build.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Hardware, sensors, APIs, and lab equipment your agents can access directly.
          From a Raspberry Pi cluster to a PCR machine — if your agent needs it, we provide access via MCP.
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={onJoinWaitlist}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shadow-lg"
          >
            Join the Waitlist
          </button>
          <a
            href="#items"
            className="px-8 py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 text-sm font-medium rounded-xl transition-colors"
          >
            Browse Preview
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 flex-wrap">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure MCP protocol
          </div>
          <div className="w-px h-4 bg-slate-300" />
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Real-time availability
          </div>
          <div className="w-px h-4 bg-slate-300" />
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Usage-based pricing
          </div>
        </div>
      </div>
    </section>
  );
}

type FilterKey = "all" | RentCategory;

function RentGrid({ onJoinWaitlist }: { onJoinWaitlist: (itemId?: string) => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [items, setItems] = useState<RentItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "lab_equipment", label: "Lab Equipment" },
    { key: "compute", label: "Compute" },
    { key: "stores", label: "Stores" },
    { key: "human_services", label: "Human Services" },
  ];

  useEffect(() => {
    fetchItems();
  }, [filter]);

  async function fetchItems() {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const url = filter === "all"
        ? `${apiUrl}/api/rent`
        : `${apiUrl}/api/rent?category=${filter}`;

      const res = await fetch(url);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch (err) {
      console.error("Failed to fetch rent items:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item =>
    filter === "all" || item.category === filter
  );

  return (
    <section className="py-16 px-6 bg-slate-50" id="items">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Preview Catalog
          </p>
          <h2 className="text-4xl font-semibold text-slate-900 mb-2">
            Physical resources.
            <br />
            <span className="text-slate-500">Ready for your agents.</span>
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl">
            Every item here will be accessible via MCP integration. Browse what's coming,
            join the waitlist to be notified when we launch.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f.key
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 mb-4">No items in this category yet.</p>
            <button
              onClick={() => onJoinWaitlist()}
              className="text-slate-900 font-medium underline"
            >
              Join waitlist to be notified
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, i) => (
              <RentCard
                key={item.id}
                item={item}
                onJoinWaitlist={() => onJoinWaitlist(item.id)}
                delay={i * 50}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RentCard({
  item,
  onJoinWaitlist,
  delay
}: {
  item: RentItem;
  onJoinWaitlist: () => void;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group border-2 border-slate-200 rounded-2xl p-6 bg-white hover:border-slate-900 hover:shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Icon/Image */}
      <div className="mb-4 flex items-center justify-between">
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-3xl">
          {item.icon_emoji ?? "📦"}
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Category */}
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
        {item.category.replace(/_/g, " ")}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
        {item.name}
      </h3>

      {/* Tagline */}
      <p className="text-sm text-slate-600 mb-4">
        {item.tagline}
      </p>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {item.description}
      </p>

      {/* Location */}
      {item.location && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {item.location}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        {item.price_preview && (
          <span className="text-sm font-medium text-slate-900">
            {item.price_preview}
          </span>
        )}
        <button
          onClick={onJoinWaitlist}
          className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Notify Me
        </button>
      </div>
    </div>
  );
}

function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="py-20 px-6">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 text-center">
          How It Works
        </p>
        <h2 className="text-4xl font-semibold text-slate-900 text-center mb-16">
          Access physical resources from your IDE.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              MCP Integration
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect your IDE via Model Context Protocol. Your AI agents discover available resources automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Request Access
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Agents request time slots, API keys, or resource allocations. Usage is tracked and billed automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Build Faster
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Stop managing infrastructure. Your agents access what they need, when they need it — you focus on building.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitlistModal({
  isOpen,
  onClose,
  itemId
}: {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const res = await fetch(`${apiUrl}/api/rent/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          item_id: itemId,
          referrer: window.location.href,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail("");
        }, 2000);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">You're on the list!</h3>
            <p className="text-slate-600">We'll notify you when the marketplace launches.</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Join the Waitlist
            </h3>
            <p className="text-slate-600 mb-6">
              Be the first to know when the physical marketplace launches. Early access for waitlist members.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none mb-4"
              />

              {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {loading ? "Joining..." : "Join Waitlist"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Rent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

  function handleJoinWaitlist(itemId?: string) {
    setSelectedItemId(itemId);
    setModalOpen(true);
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white">
        <Hero onJoinWaitlist={() => handleJoinWaitlist()} />
        <RentGrid onJoinWaitlist={handleJoinWaitlist} />
        <HowItWorks />
      </main>
      <SiteFooter />

      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemId={selectedItemId}
      />
    </>
  );
}

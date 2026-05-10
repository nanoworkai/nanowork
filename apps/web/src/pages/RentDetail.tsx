import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopNav, SiteFooter } from "../components/SiteChrome";
import { useAuth } from "../context/AuthContext";
import type { RentItem } from "../types/rent";

export default function RentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [item, setItem] = useState<RentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [slug]);

  async function fetchItem() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rent/${slug}`);
      if (!res.ok) {
        throw new Error("Resource not found");
      }
      const data = await res.json();
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resource");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking() {
    if (!session) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`/api/rent/${item?.id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          duration_hours: duration,
        }),
      });

      if (!res.ok) {
        throw new Error("Booking failed");
      }

      setBookingSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-slate-500">Loading resource...</div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-semibold text-slate-900 mb-4">Resource Not Found</h1>
            <p className="text-slate-600 mb-8">{error || "This resource doesn't exist."}</p>
            <button
              onClick={() => navigate("/rent")}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const statusColors = {
    coming_soon: "bg-slate-100 text-slate-600 border-slate-200",
    preview: "bg-blue-50 text-blue-700 border-blue-200",
    available: "bg-green-50 text-green-700 border-green-200",
    waitlist_only: "bg-amber-50 text-amber-700 border-amber-200",
    unavailable: "bg-slate-100 text-slate-400 border-slate-200",
  };

  const statusLabels = {
    coming_soon: "Coming Soon",
    preview: "Preview",
    available: "Available",
    waitlist_only: "Waitlist Only",
    unavailable: "Unavailable",
  };

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
            <button onClick={() => navigate("/rent")} className="hover:text-slate-900">
              Marketplace
            </button>
            <span>/</span>
            <span className="text-slate-900">{item.name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-5xl flex-shrink-0">
                    {item.icon_emoji || "📦"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        {item.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h1 className="text-4xl font-semibold text-slate-900 mb-2">{item.name}</h1>
                    <p className="text-lg text-slate-600">{item.tagline}</p>
                  </div>
                </div>

                {/* Location */}
                {item.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.location}
                  </div>
                )}

                {/* Description */}
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">About this resource</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* MCP Integration (Coming Soon) */}
              <div className="border-2 border-slate-200 rounded-2xl p-6 bg-slate-50 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  MCP Integration
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  This resource will be accessible via Model Context Protocol, allowing AI agents
                  to discover and book it programmatically.
                </p>
                <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 overflow-x-auto">
                  <pre>{`{
  "mcpServers": {
    "${item.slug}": {
      "command": "npx",
      "args": ["-y", "@nanowork/mcp-server"],
      "env": {
        "RESOURCE_ID": "${item.id}"
      }
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Reviews Placeholder */}
              <div className="border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Reviews</h3>
                <p className="text-sm text-slate-500">No reviews yet. Be the first to book!</p>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-2 border-slate-200 rounded-2xl p-6 bg-white sticky top-6">
                {item.price_preview && (
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="text-3xl font-semibold text-slate-900">
                      {item.price_preview}
                    </div>
                  </div>
                )}

                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-sm text-slate-600">Redirecting to dashboard...</p>
                  </div>
                ) : item.status === "available" || item.status === "preview" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Start Time
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Duration (hours)
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                      >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={3}>3 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={8}>8 hours</option>
                        <option value={24}>Full day (24 hours)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTime || bookingLoading}
                      className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {bookingLoading ? "Booking..." : "Book Now"}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      You'll be charged when the booking starts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 text-center mb-4">
                      {item.status === "coming_soon"
                        ? "This resource is coming soon."
                        : item.status === "waitlist_only"
                        ? "Join the waitlist to be notified when available."
                        : "This resource is currently unavailable."}
                    </p>
                    <button
                      onClick={() => {
                        /* Open waitlist modal */
                      }}
                      className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Join Waitlist
                    </button>
                  </div>
                )}

                {/* Contact Info */}
                {(item.contact_email || item.contact_url) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact</h4>
                    <div className="space-y-2 text-sm">
                      {item.contact_email && (
                        <a
                          href={`mailto:${item.contact_email}`}
                          className="block text-blue-600 hover:text-blue-800"
                        >
                          {item.contact_email}
                        </a>
                      )}
                      {item.contact_url && (
                        <a
                          href={item.contact_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800"
                        >
                          Visit website →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.view_count} views</span>
                    <span>Listed {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

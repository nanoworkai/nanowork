import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { BookingWithItem } from "../types/booking";

export default function Bookings() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session, filter]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rent/bookings?limit=50`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (filter === "upcoming") {
      return startTime > now || (startTime <= now && endTime > now);
    } else if (filter === "past") {
      return endTime <= now;
    }
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-700",
    cancelled: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500">Manage your resource reservations</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "upcoming", "past"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === f
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-slate-500 mb-4">No bookings yet</p>
          <button
            onClick={() => navigate("/rent")}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-sm"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
            const now = new Date();
            const isUpcoming = startTime > now;
            const isActive = startTime <= now && endTime > now;

            return (
              <div
                key={booking.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {booking.item.icon_emoji || "📦"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {booking.item.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {startTime.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {booking.duration_hours}h
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ${(booking.amount_cents / 100).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-green-500" : isUpcoming ? "bg-blue-500" : "bg-slate-400"
                          }`}
                        />
                        {isActive ? "In progress" : isUpcoming ? "Upcoming" : "Completed"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/rent/${booking.item.slug}`)}
                        className="text-sm text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        View Resource →
                      </button>

                      {isActive && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `/api/rent/bookings/${booking.id}/credentials`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${session?.access_token}`,
                                  },
                                }
                              );
                              const creds = await res.json();
                              alert(JSON.stringify(creds, null, 2));
                            } catch (err) {
                              alert("Failed to get credentials");
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Get Access Credentials
                        </button>
                      )}

                      {(booking.status === "pending" || booking.status === "confirmed") &&
                        isUpcoming && (
                          <button
                            onClick={async () => {
                              if (
                                !confirm("Are you sure you want to cancel this booking?")
                              )
                                return;

                              try {
                                await fetch(`/api/rent/bookings/${booking.id}`, {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: `Bearer ${session?.access_token}`,
                                  },
                                });
                                fetchBookings();
                              } catch (err) {
                                alert("Failed to cancel booking");
                              }
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold"
                          >
                            Cancel Booking
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

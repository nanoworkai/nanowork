import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav, SiteFooter } from "../components/SiteChrome";
import { useAuth } from "../context/AuthContext";
import type { RentCategory } from "../types/rent";

export default function SubmitResource() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "preview" | "success">("form");

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "compute" as RentCategory,
    icon_emoji: "",
    price_preview: "",
    location: "",
    contact_email: user?.email || "",
    contact_url: "",
  });

  if (!user) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-semibold text-slate-900 mb-4">
              Sign in to submit a resource
            </h1>
            <p className="text-slate-600 mb-8">
              You need to be signed in to list physical resources on the marketplace.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Sign In
            </button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const categories: { value: RentCategory; label: string; description: string }[] = [
    {
      value: "lab_equipment",
      label: "Lab Equipment",
      description: "PCR machines, microscopes, sequencers, spectrometers",
    },
    {
      value: "compute",
      label: "Compute Resources",
      description: "GPUs, TPUs, clusters, edge devices, quantum computers",
    },
    {
      value: "stores",
      label: "Physical Spaces",
      description: "Makerspaces, kitchens, studios, cleanrooms, workshops",
    },
    {
      value: "human_services",
      label: "Human Services",
      description: "Designers, engineers, consultants, specialists",
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/rent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit resource");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-4xl font-semibold text-slate-900 mb-4">
              Resource Submitted!
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your resource is now pending approval. Our team will review it within 24-48 hours.
              You'll receive an email when it goes live on the marketplace.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/rent")}
                className="px-6 py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 rounded-xl transition-colors"
              >
                Browse Marketplace
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setFormData({
                    name: "",
                    tagline: "",
                    description: "",
                    category: "compute",
                    icon_emoji: "",
                    price_preview: "",
                    location: "",
                    contact_email: user?.email || "",
                    contact_url: "",
                  });
                }}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
              >
                Submit Another
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (step === "preview") {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-semibold text-slate-900 mb-2">Preview Your Listing</h1>
              <p className="text-slate-600">
                This is how your resource will appear on the marketplace
              </p>
            </div>

            <div className="border-2 border-slate-200 rounded-2xl p-8 bg-white mb-8">
              <div className="mb-6 flex items-start justify-between">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-4xl">
                  {formData.icon_emoji || "📦"}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Approval
                </span>
              </div>

              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                {formData.category.replace(/_/g, " ")}
              </div>

              <h2 className="text-2xl font-semibold text-slate-900 mb-2">{formData.name}</h2>

              <p className="text-sm text-slate-600 mb-4">{formData.tagline}</p>

              <p className="text-sm text-slate-500 leading-relaxed mb-6">{formData.description}</p>

              {formData.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {formData.location}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {formData.price_preview && (
                  <span className="text-sm font-medium text-slate-900">
                    {formData.price_preview}
                  </span>
                )}
                <button className="ml-auto px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg">
                  Notify Me
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("form")}
                className="flex-1 px-6 py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 rounded-xl transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold text-slate-900 mb-2">
              List Your Resource
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Share your equipment, space, or expertise with AI agents building the future.
              All submissions are reviewed before going live.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setStep("preview"); }} className="space-y-8">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Category
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.category === cat.value
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 mb-1">{cat.label}</div>
                    <div className="text-xs text-slate-600">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Resource Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g., NVIDIA A100 GPU, PCR Machine, Makerspace Workshop"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tagline
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    One short sentence
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="e.g., High-performance ML training"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  maxLength={500}
                  placeholder="Describe what your resource offers, technical specifications, use cases, and any special requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none resize-none"
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {formData.description.length}/500
                </div>
              </div>
            </div>

            {/* Visual & Pricing */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Icon Emoji
                  <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="⚡"
                  value={formData.icon_emoji}
                  onChange={(e) => setFormData({ ...formData, icon_emoji: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none text-2xl text-center"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Price Preview
                  <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g., $2.50/hour, $200/session"
                  value={formData.price_preview}
                  onChange={(e) => setFormData({ ...formData, price_preview: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Location & Contact */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g., Remote, San Francisco CA, Oakland CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Website or Booking URL
                  <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  value={formData.contact_url}
                  onChange={(e) => setFormData({ ...formData, contact_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                What happens after submission?
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Our team reviews your resource within 24-48 hours</li>
                <li>• We'll email you when it's approved and live</li>
                <li>• You can edit or remove your listing anytime</li>
                <li>• Interested users will contact you directly via email</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/rent")}
                className="px-6 py-3 border-2 border-slate-200 hover:border-slate-900 text-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
              >
                Preview Listing
              </button>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

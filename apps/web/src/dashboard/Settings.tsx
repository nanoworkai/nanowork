import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { LogOut, CreditCard, Globe, User, Mail, Copy, Check, Inbox, ExternalLink, AlertCircle } from "lucide-react";
import type { UserProfile } from "../context/AuthContext";

/* ── Section wrapper ─────────────────────────────────────── */

function Section({
  title,
  desc,
  danger,
  children,
}: {
  title: string;
  desc: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-6 rounded-xl border ${danger ? "border-red-200 bg-red-50" : "border-border-DEFAULT bg-white"}`}>
      <div className="mb-4">
        <h2 className={`text-base font-semibold ${danger ? "text-red-600" : "text-text-primary"}`}>{title}</h2>
        <p className="text-sm text-text-secondary mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SaveButton({ saved, loading, label }: { saved: boolean; loading?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
        saved
          ? "bg-green-50 text-green-600 border border-green-200"
          : "bg-accent-primary hover:bg-accent-hover text-white"
      } disabled:opacity-50`}
    >
      {loading ? "Saving…" : saved ? "✓ Saved" : (label ?? "Save")}
    </button>
  );
}

function FieldInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        className={`w-full px-3 py-2 text-sm border outline-none transition-colors ${
          readOnly
            ? "bg-background-subtle border-border-DEFAULT text-text-tertiary cursor-default font-mono rounded-md"
            : "bg-background-subtle border-border-DEFAULT rounded-md focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-tertiary"
        }`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}

/* ── Billing section ─────────────────────────────────────── */

function BillingSection() {
  const { profile, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    if (!session?.access_token) {
      setError("You must be logged in to manage billing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/billing/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to open billing portal");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      console.error("Billing portal error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to open billing portal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Billing & subscription"
      desc="Manage your payment method, invoices, and plan through the Stripe billing portal."
    >
      <div className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary font-medium capitalize mb-1">
              {profile?.plan ?? "free"} plan
            </p>
            <p className="text-xs text-text-tertiary">
              {profile?.subscriptionStatus
                ? `Status: ${profile.subscriptionStatus}`
                : profile?.stripeCustomerId
                ? "Subscription active"
                : "No active subscription"}
            </p>
          </div>
          <button
            onClick={openPortal}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-background-subtle hover:bg-background-DEFAULT border border-border-DEFAULT text-sm font-medium text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-border-DEFAULT border-t-accent-primary rounded-full animate-spin" />
            )}
            {loading ? "Opening…" : "Manage billing"}
            {!loading && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            )}
          </button>
        </div>

        {/* Features List */}
        <div className="rounded-xl bg-background-subtle border border-border-DEFAULT p-4">
          <p className="text-xs font-medium text-text-secondary mb-3">In the billing portal you can:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <CreditCard className="w-3.5 h-3.5 text-text-tertiary mt-0.5 flex-shrink-0" />
              <span>Update your payment method</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <svg className="w-3.5 h-3.5 text-text-tertiary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View and download invoices</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <svg className="w-3.5 h-3.5 text-text-tertiary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Change or cancel your subscription</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ── Profile section ─────────────────────────────────────── */

function ProfileSection() {
  const { profile, user, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.businessName ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile({ businessName: name.trim(), email: email.trim() });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Section title="Profile" desc="Your business name and contact info.">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <FieldInput label="Business name" value={name} onChange={setName} placeholder="My Unicorn Inc." />
        <FieldInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <FieldInput label="Phone" value={user?.phone ?? profile?.phone ?? "—"} readOnly />
        <FieldInput label="User ID" value={user?.id ?? "—"} readOnly />
        <div className="flex justify-end">
          <SaveButton saved={saved} loading={loading} />
        </div>
      </form>
    </Section>
  );
}

/* ── Delete account ──────────────────────────────────────── */

function DeleteSection() {
  const { user, logout, session } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phrase = "delete my account";

  const handleDelete = async () => {
    if (confirm !== phrase || !user || !session) return;

    setDeleting(true);
    setError(null);

    try {
      // Call backend API to delete user and all related data
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/user`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Delete account error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <Section
      title="Delete account"
      desc="Permanently delete your account and all associated data. This cannot be undone."
      danger
    >
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="px-4 py-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition-colors"
        >
          Delete account
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          <p className="text-sm text-text-secondary">
            Type <span className="font-mono text-red-600">"{phrase}"</span> to confirm:
          </p>
          <input
            type="text"
            className="w-full px-3 py-2 bg-background-subtle border border-red-300 rounded-md focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm text-text-primary outline-none transition-colors"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={phrase}
            autoFocus
            disabled={deleting}
          />
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirm !== phrase || deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {deleting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              onClick={() => { setShow(false); setConfirm(""); setError(null); }}
              disabled={deleting}
              className="px-4 py-2 rounded-md bg-background-subtle hover:bg-background-DEFAULT border border-border-DEFAULT text-text-secondary hover:text-text-primary text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ── AI Email section ──────────────────────────────────────── */

interface EmailMessage {
  id: string;
  from_address: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  received_at: string;
  status: string;
}

function AIEmailSection() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchEmails = async () => {
      const { data, error } = await supabase
        .from('email_messages')
        .select('id, from_address, from_name, subject, body_text, received_at, status')
        .eq('user_id', profile.id)
        .eq('direction', 'inbound')
        .order('received_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setEmails(data);
      }
      setLoading(false);
    };

    fetchEmails();
  }, [profile?.id]);

  const copyToClipboard = () => {
    if (profile?.aiEmail) {
      navigator.clipboard.writeText(profile.aiEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!profile?.aiEmail) {
    return null; // Don't show section if no AI email assigned
  }

  return (
    <Section
      title="AI Agent Email"
      desc="Your AI agent's email address for receiving messages from contacts."
    >
      <div className="space-y-4">
        {/* Email Display */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Agent Email Address</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-md bg-background-subtle border border-border-DEFAULT flex items-center justify-between group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                <span className="text-sm font-mono text-text-primary truncate">{profile.aiEmail}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-md hover:bg-background-DEFAULT transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-text-tertiary group-hover:text-text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="px-4 py-3 rounded-xl bg-background-subtle border border-border-DEFAULT">
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">How it works:</strong> Contacts can email your AI agent directly at this address.
            Your agent will read, understand, and respond to messages automatically, handling inquiries 24/7.
          </p>
        </div>

        {/* Inbox Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm font-medium text-text-primary">Recent Messages</span>
            {emails.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-background-DEFAULT text-xs font-semibold text-text-tertiary">
                {emails.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInbox(!showInbox)}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            {showInbox ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Inbox View */}
        {showInbox && (
          <div className="rounded-xl bg-background-subtle border border-border-DEFAULT overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-border-DEFAULT border-t-accent-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-text-secondary">Loading messages...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-6 text-center">
                <Mail className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-text-secondary mb-1">No messages yet</p>
                <p className="text-xs text-text-tertiary">
                  When contacts email your agent, messages will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-DEFAULT">
                {emails.map((email) => (
                  <div key={email.id} className="p-4 hover:bg-background-DEFAULT transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {email.from_name || email.from_address}
                          </p>
                          {email.status === 'processed' && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                              ✓ Replied
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary font-mono truncate">
                          {email.from_address}
                        </p>
                      </div>
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {formatDate(email.received_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium mb-1 truncate">
                      {email.subject || '(No subject)'}
                    </p>
                    {email.body_text && (
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {email.body_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

/* ── Plan section ────────────────────────────────────────── */

type PlanTier = UserProfile["plan"];

const PLANS: { tier: PlanTier; name: string; price: number; desc: string; features: string[] }[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    desc: "Preview mode — see what's possible",
    features: ["1 business build", "All 7 agent departments", "Dashboard access", "Community support"],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 99,
    desc: "Full company built and running",
    features: ["Everything in Free", "Live agents 24/7", "1 custom domain", "Priority support", "Revenue dashboard"],
  },
  {
    tier: "growth",
    name: "Growth",
    price: 249,
    desc: "Scaling with more power",
    features: ["Everything in Starter", "3 business builds", "5 custom domains", "Advanced analytics", "Webhook integrations", "Custom branding"],
  },
  {
    tier: "scale",
    name: "Scale",
    price: 499,
    desc: "Enterprise-grade, unlimited",
    features: ["Everything in Growth", "Unlimited builds", "Unlimited domains", "Dedicated support", "SLA guarantees", "White-label options"],
  },
];

function PlanSection() {
  const { profile, updateProfile } = useAuth();
  const [confirm, setConfirm] = useState<PlanTier | null>(null);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (tier: PlanTier) => {
    setSwitching(true);
    await updateProfile({ plan: tier });
    setSwitching(false);
    setConfirm(null);
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = profile?.plan === plan.tier;
          const isRecommended = plan.tier === "starter";
          return (
            <div
              key={plan.tier}
              className={`relative p-5 rounded-xl border flex flex-col transition-all ${
                isCurrent
                  ? "border-accent-primary bg-accent-primary/5"
                  : isRecommended
                  ? "border-border-DEFAULT bg-white shadow-sm"
                  : "border-border-DEFAULT bg-white"
              }`}
            >
              {isRecommended && !isCurrent && (
                <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-accent-primary text-white px-2.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
                  Current
                </span>
              )}

              <h3 className="text-base font-bold text-text-primary">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-2xl font-bold text-text-primary">${plan.price}</span>
                <span className="text-xs text-text-tertiary">/mo</span>
              </div>
              <p className="text-xs text-text-secondary mb-4">{plan.desc}</p>

              <ul className="flex-1 flex flex-col gap-1.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <svg className="flex-shrink-0 mt-0.5 text-green-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full py-2 rounded-md text-xs font-semibold bg-background-subtle text-text-tertiary cursor-default">
                  Current plan
                </button>
              ) : (
                <button
                  onClick={() => setConfirm(plan.tier)}
                  className={`w-full py-2 rounded-md text-xs font-semibold transition-colors ${
                    isRecommended ? "bg-accent-primary hover:bg-accent-hover text-white" : "bg-background-subtle hover:bg-background-DEFAULT border border-border-DEFAULT text-text-primary"
                  }`}
                >
                  Switch to {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-sm bg-white border border-border-DEFAULT rounded-xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary mb-2">Switch plan</h3>
            <p className="text-sm text-text-secondary mb-6">
              Switch to the <span className="text-text-primary font-semibold">{PLANS.find((p) => p.tier === confirm)?.name}</span> plan? Changes take effect immediately.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2 rounded-md bg-background-subtle hover:bg-background-DEFAULT border border-border-DEFAULT text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSwitch(confirm)}
                disabled={switching}
                className="flex-1 py-2 rounded-md bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {switching ? "Switching…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Domains section ──────────────────────────────────────── */

const PLATFORM_HOST = "nanowork.app";

function normalizeSubdomain(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/, "").slice(0, 40);
}

function DomainsSection() {
  const { profile, updateProfile } = useAuth();
  const [subdomain, setSubdomain] = useState(profile?.subdomain ?? "");
  const [subSaved, setSubSaved] = useState(false);
  const [subError, setSubError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://${subdomain || "your-app"}.${PLATFORM_HOST}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubdomainSave = async (e: FormEvent) => {
    e.preventDefault();
    const next = normalizeSubdomain(subdomain);
    if (next.length < 2) { setSubError("At least 2 characters required."); return; }
    setSubError("");
    await updateProfile({ subdomain: next });
    setSubdomain(next);
    setSubSaved(true);
    setTimeout(() => setSubSaved(false), 2500);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    await updateProfile({ customDomain: newDomain.trim() });
    setNewDomain("");
    setShowAdd(false);
  };

  return (
    <>
      {/* Subdomain */}
      <Section
        title="Platform subdomain"
        desc={`Your business is served at *.${PLATFORM_HOST}`}
      >
        <form onSubmit={handleSubdomainSave} className="flex flex-col gap-3">
          <div className="flex items-center gap-1 px-3 py-2 bg-background-subtle border border-border-DEFAULT rounded-md focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20 transition-colors">
            <span className="text-xs text-text-tertiary">https://</span>
            <input
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none min-w-0"
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(normalizeSubdomain(e.target.value))}
              placeholder="your-app"
            />
            <span className="text-xs text-text-tertiary whitespace-nowrap">.{PLATFORM_HOST}</span>
          </div>
          {subError && <p className="text-xs text-red-600">{subError}</p>}
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              <span>{fullUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex justify-end">
            <SaveButton saved={subSaved} label="Save subdomain" />
          </div>
        </form>
      </Section>

      {/* Custom domain */}
      <Section
        title="Custom domain"
        desc="Connect your own domain."
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-3 py-1.5 rounded-md bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
            >
              {showAdd ? "Cancel" : "+ Add domain"}
            </button>
          </div>

          {showAdd && (
            <div className="p-5 rounded-xl bg-background-subtle border border-border-DEFAULT">
              <label className="block text-xs font-medium text-text-secondary mb-2">Domain name</label>
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 px-3 py-2 bg-background-subtle border border-border-DEFAULT rounded-md focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors"
                  type="text"
                  placeholder="yourbrand.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                  autoFocus
                />
                <button
                  onClick={handleAddDomain}
                  disabled={!newDomain.trim()}
                  className="px-4 py-2 rounded-md bg-accent-primary hover:bg-accent-hover disabled:opacity-40 text-white text-sm font-semibold transition-colors"
                >
                  Add domain
                </button>
              </div>
              {newDomain && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-900 mb-1">DNS Configuration Required</p>
                      <p className="text-xs text-amber-700">Add this CNAME record at your DNS provider:</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-amber-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-tertiary mb-0.5">Type</p>
                        <p className="text-sm font-mono text-text-primary">CNAME</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-tertiary mb-0.5">Name</p>
                        <p className="text-sm font-mono text-text-primary truncate">{newDomain}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-tertiary mb-0.5">Value</p>
                        <p className="text-sm font-mono text-text-primary">nanowork.app</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${newDomain} CNAME nanowork.app`)}
                        className="p-2 hover:bg-background-DEFAULT rounded transition-colors"
                        title="Copy DNS record"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-text-tertiary" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {profile?.customDomain ? (
            <div className="rounded-xl bg-background-subtle border border-border-DEFAULT p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-text-primary font-medium">{profile.customDomain}</p>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">Your custom domain is connected and live</p>
                  <a
                    href={`https://${profile.customDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mt-2"
                  >
                    <span>Visit site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Remove this custom domain?")) {
                      updateProfile({ customDomain: undefined });
                    }
                  }}
                  className="p-2 rounded-md hover:bg-red-50 text-text-tertiary hover:text-red-600 transition-colors"
                  title="Remove domain"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-tertiary">
              <Globe className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No custom domain connected yet.</p>
              <p className="text-xs text-text-tertiary mt-1">Click "Add domain" above to get started.</p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

/* ── Logout section ──────────────────────────────────────── */

function LogoutSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to sign out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Section
      title="Sign out"
      desc="End your current session and return to the homepage."
    >
      <div className="space-y-3">
        {error && (
          <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-background-subtle hover:bg-background-DEFAULT border border-border-DEFAULT text-sm font-medium text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loading ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </Section>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"account" | "plan" | "domains">("account");

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "plan" as const, label: "Plan", icon: CreditCard },
    { id: "domains" as const, label: "Domains", icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account, billing, and domain configuration.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border-DEFAULT overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-accent-primary border-accent-primary"
                  : "text-text-secondary border-transparent hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-4">
        {activeTab === "account" && (
          <>
            <ProfileSection />
            <AIEmailSection />
            <BillingSection />
            <LogoutSection />
            <DeleteSection />
          </>
        )}
        {activeTab === "plan" && <PlanSection />}
        {activeTab === "domains" && <DomainsSection />}
      </div>
    </div>
  );
}

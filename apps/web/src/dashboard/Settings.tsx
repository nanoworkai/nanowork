import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { LogOut, CreditCard, Globe, User, Mail, Copy, Check, Inbox } from "lucide-react";

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
    <div className={`p-6 rounded-2xl border ${danger ? "border-red-500/20 bg-red-500/5" : "border-white/5 bg-surface-1"}`}>
      <div className="mb-4">
        <h2 className={`text-base font-semibold ${danger ? "text-red-400" : "text-white"}`}>{title}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
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
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        saved
          ? "bg-green-500/15 text-green-400 border border-green-500/20"
          : "bg-white hover:bg-white text-white"
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
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <input
        type={type}
        className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors ${
          readOnly
            ? "bg-surface-3 border-white/5 text-zinc-500 cursor-default font-mono"
            : "bg-surface-2 border-white/10 focus:border-white/20/60 text-zinc-100 placeholder-zinc-600"
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
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300 font-medium capitalize mb-1">
              {profile?.plan ?? "free"} plan
            </p>
            <p className="text-xs text-zinc-600">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
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
        <div className="rounded-xl bg-surface-2 border border-white/5 p-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">In the billing portal you can:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <CreditCard className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
              <span>Update your payment method</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <svg className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View and download invoices</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-500">
              <svg className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

/* ── Domain section ──────────────────────────────────────── */

function DomainSection() {
  const { profile, updateProfile } = useAuth();
  const [domain, setDomain] = useState(profile?.customDomain ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile({ customDomain: domain.trim() });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Section
      title="Custom domain"
      desc="Connect your own domain to your Nanowork business site."
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <FieldInput
          label="Domain"
          value={domain}
          onChange={setDomain}
          placeholder="yourbrand.com"
        />
        {domain && (
          <div className="rounded-xl bg-surface-2 border border-white/5 p-4 text-xs space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white/60 text-xs">1</span>
              </div>
              <div>
                <p className="font-semibold text-zinc-400 mb-1">Add DNS record at your provider</p>
                <p className="text-zinc-500">Go to your domain registrar (Namecheap, GoDaddy, etc.)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white/60 text-xs">2</span>
              </div>
              <div>
                <p className="font-semibold text-zinc-400 mb-1">Create CNAME record</p>
                <div className="font-mono text-zinc-300 bg-surface-3 px-3 py-2 rounded mt-1 border border-white/5">
                  <div className="flex justify-between items-center gap-4 mb-1">
                    <span className="text-zinc-500">Type:</span>
                    <span>CNAME</span>
                  </div>
                  <div className="flex justify-between items-center gap-4 mb-1">
                    <span className="text-zinc-500">Name:</span>
                    <span className="truncate">{domain}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-500">Value:</span>
                    <span>nanowork.app</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white/60 text-xs">3</span>
              </div>
              <div>
                <p className="font-semibold text-zinc-400 mb-1">Save and wait</p>
                <p className="text-zinc-500">DNS changes can take up to 24 hours to propagate</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <SaveButton saved={saved} loading={loading} label="Save domain" />
        </div>
      </form>
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
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold transition-colors"
        >
          Delete account
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <p className="text-sm text-zinc-400">
            Type <span className="font-mono text-red-400">"{phrase}"</span> to confirm:
          </p>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-red-500/30 focus:border-red-500/60 text-sm text-zinc-100 outline-none transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {deleting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              onClick={() => { setShow(false); setConfirm(""); setError(null); }}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors disabled:opacity-50"
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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Agent Email Address</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-surface-2 border border-white/10 flex items-center justify-between group">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="text-sm font-mono text-zinc-200 truncate">{profile.aiEmail}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="px-4 py-3 rounded-xl bg-surface-2 border border-white/5">
          <p className="text-xs text-zinc-400 leading-relaxed">
            <strong className="text-zinc-300">How it works:</strong> Contacts can email your AI agent directly at this address.
            Your agent will read, understand, and respond to messages automatically, handling inquiries 24/7.
          </p>
        </div>

        {/* Inbox Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">Recent Messages</span>
            {emails.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-zinc-400">
                {emails.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInbox(!showInbox)}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {showInbox ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Inbox View */}
        {showInbox && (
          <div className="rounded-xl bg-surface-2 border border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Loading messages...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-6 text-center">
                <Mail className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 mb-1">No messages yet</p>
                <p className="text-xs text-zinc-600">
                  When contacts email your agent, messages will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {emails.map((email) => (
                  <div key={email.id} className="p-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-zinc-200 truncate">
                            {email.from_name || email.from_address}
                          </p>
                          {email.status === 'processed' && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              ✓ Replied
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono truncate">
                          {email.from_address}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 whitespace-nowrap">
                        {formatDate(email.received_at)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 font-medium mb-1 truncate">
                      {email.subject || '(No subject)'}
                    </p>
                    {email.body_text && (
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
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
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
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
  const [activeTab, setActiveTab] = useState<"account" | "billing" | "domain">("account");

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
    { id: "domain" as const, label: "Domain", icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account, billing, and domain configuration.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-white/5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white border-white"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
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
            <LogoutSection />
            <DeleteSection />
          </>
        )}
        {activeTab === "billing" && <BillingSection />}
        {activeTab === "domain" && <DomainSection />}
      </div>
    </div>
  );
}

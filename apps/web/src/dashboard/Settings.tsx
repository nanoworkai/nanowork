import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
          : "bg-brand-600 hover:bg-brand-500 text-white"
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
            : "bg-surface-2 border-white/10 focus:border-brand-500/60 text-zinc-100 placeholder-zinc-600"
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
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // portal not yet wired — inform user
      alert("Billing portal coming soon. Contact support to manage your subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      title="Billing & subscription"
      desc="Manage your payment method, invoices, and plan through the Stripe billing portal."
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-300 font-medium capitalize">
            {profile?.plan ?? "free"} plan
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">
            {profile?.stripeCustomerId ? "Subscription active" : "No active subscription"}
          </p>
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? "Opening…" : "Manage billing"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
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
          <div className="rounded-xl bg-surface-2 border border-white/5 p-4 text-xs text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-400 mb-2">DNS setup</p>
            <p>Add a CNAME record pointing:</p>
            <p className="font-mono text-zinc-300 bg-surface-3 px-2 py-1 rounded mt-1">
              {domain} → nanowork.app
            </p>
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const phrase = "delete my account";

  const handleDelete = async () => {
    if (confirm !== phrase || !user) return;
    setDeleting(true);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.admin?.deleteUser(user.id).catch(() => {});
    await logout();
    navigate("/", { replace: true });
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
          />
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={confirm !== phrase || deleting}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              onClick={() => { setShow(false); setConfirm(""); }}
              className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account, billing, and domain.</p>
      </div>

      <div className="flex flex-col gap-4">
        <ProfileSection />
        <BillingSection />
        <DomainSection />
        <DeleteSection />
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Tab = "signin" | "signup";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.includes(":")) return "/dashboard";
  return raw;
}

export default function Login() {
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("redirect") ?? searchParams.get("next"));
  const pendingPrompt = searchParams.get("p");

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    const dest = pendingPrompt
      ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
      : nextPath;
    navigate(dest, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tab === "signup") {
      const { error: err } = await signUp(email, password, name);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        // Success - user is now authenticated
        const dest = pendingPrompt
          ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
          : nextPath;
        navigate(dest);
      }
    } else {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        // Success - user is now authenticated
        const dest = pendingPrompt
          ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
          : nextPath;
        navigate(dest);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 text-slate-900 font-semibold text-[15px] mb-8 hover:opacity-70 transition-opacity">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor"/>
        </svg>
        Nanowork
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-lg">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => { setTab("signin"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === "signin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === "signup"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign up
          </button>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {tab === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {tab === "signup"
            ? "Start building your AI-powered company"
            : "Sign in to continue to your dashboard"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-name">
                Name
              </label>
              <input
                id="login-name"
                className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 focus:border-slate-900 text-slate-900 placeholder-slate-400 text-sm outline-none transition-colors"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 focus:border-slate-900 text-slate-900 placeholder-slate-400 text-sm outline-none transition-colors"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 focus:border-slate-900 text-slate-900 placeholder-slate-400 text-sm outline-none transition-colors"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-2"
          >
            {loading ? (tab === "signup" ? "Creating account…" : "Signing in…") : (tab === "signup" ? "Create account" : "Sign in")}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-500 mt-6 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-slate-700 hover:text-slate-900 underline transition-colors">Terms</a>
        {" "}and{" "}
        <a href="#" className="text-slate-700 hover:text-slate-900 underline transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}

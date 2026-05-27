import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, AlertCircle, CheckCircle } from "lucide-react";
import Footer from "../components/Footer";

type Tab = "signin" | "signup";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.includes(":")) return "/dashboard";
  return raw;
}

export default function Login() {
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("redirect") ?? searchParams.get("next"));
  const pendingPrompt = searchParams.get("p");
  const claimIntent = searchParams.get("intent") === "claim";

  const [tab, setTab] = useState<Tab>(claimIntent ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string>("");

  // Get pending claim data from localStorage
  const pendingClaim = localStorage.getItem('pending_claim');
  const claimData = pendingClaim ? JSON.parse(pendingClaim) : null;

  // Handle success/error messages from location state
  useEffect(() => {
    const state = location.state as { success?: string; error?: string } | null;
    if (state?.success) {
      setSuccess(state.success);
      setError("");
    }
    if (state?.error) {
      setError(state.error);
      setSuccess("");
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const dest = pendingPrompt
        ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
        : nextPath;
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath, pendingPrompt]);

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
        const pendingClaim = localStorage.getItem('pending_claim');
        if (pendingClaim) {
          navigate('/dashboard?claim_pending=true');
        } else {
          const dest = pendingPrompt
            ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
            : nextPath;
          navigate(dest);
        }
      }
    } else {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        const dest = pendingPrompt
          ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
          : nextPath;
        navigate(dest);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Header */}
      <header className="border-b border-fintech-border bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3 text-fintech-navy hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-fintech-navy flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Nanowork</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Claim Banner */}
          {claimData && (
            <div className="mb-6 p-4 border border-fintech-green/20 bg-fintech-green/5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-fintech-green flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-fintech-navy mb-1">
                    Claiming business
                  </p>
                  <p className="text-base font-medium text-fintech-navy mb-1">
                    {claimData.businessName}
                  </p>
                  <p className="text-sm text-fintech-slate">
                    Create your account to continue
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auth Card */}
          <div className="border border-fintech-border bg-surface-1 shadow-card">
            <div className="p-8">
              <h1 className="text-2xl font-semibold text-fintech-navy mb-2">
                {tab === "signin" ? "Sign in to your account" : "Create your account"}
              </h1>
              <p className="text-sm text-fintech-slate mb-8">
                {tab === "signin"
                  ? "Welcome back. Enter your credentials to continue."
                  : "Get started with Nanowork. Build and launch your business."}
              </p>

              {/* Tab Switcher */}
              <div className="flex gap-1 mb-6 p-1 bg-surface-0 border border-fintech-divider">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    tab === "signin"
                      ? "bg-surface-1 text-fintech-navy shadow-sm"
                      : "text-fintech-slate hover:text-fintech-navy"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setError("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    tab === "signup"
                      ? "bg-surface-1 text-fintech-navy shadow-sm"
                      : "text-fintech-slate hover:text-fintech-navy"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-fintech-navy mb-2" htmlFor="login-name">
                      Full name
                    </label>
                    <input
                      id="login-name"
                      className="w-full px-4 py-2.5 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-fintech-navy mb-2" htmlFor="login-email">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    className="w-full px-4 py-2.5 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-fintech-navy" htmlFor="login-password">
                      Password
                    </label>
                    {tab === "signin" && (
                      <Link
                        to="/forgot-password"
                        className="text-sm text-fintech-slate hover:text-fintech-navy transition-colors"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <input
                    id="login-password"
                    className="w-full px-4 py-2.5 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    required
                  />
                </div>

                {success && (
                  <div className="px-4 py-3 border border-fintech-green/20 bg-fintech-green/5">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-fintech-green flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-fintech-green">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="px-4 py-3 border border-fintech-red/20 bg-fintech-red/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-fintech-red flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-fintech-red">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-button transition-colors"
                >
                  {loading
                    ? tab === "signup" ? "Creating account..." : "Signing in..."
                    : tab === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-fintech-divider px-8 py-4 bg-surface-0">
              <p className="text-xs text-fintech-slate text-center">
                Secure authentication • Enterprise-grade encryption
              </p>
            </div>
          </div>

          <p className="text-sm text-fintech-slate text-center mt-6">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-fintech-navy hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-fintech-navy hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

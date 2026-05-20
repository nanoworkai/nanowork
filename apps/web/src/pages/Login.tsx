import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, Lock } from "lucide-react";

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

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string>("");

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
    setSuccess("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (tab === "signup") {
      // Password strength validation for signup
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const { error: err } = await signUp(email, password, name);
      setLoading(false);
      if (err) {
        // Improve error messages
        if (err.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else if (err.includes("Invalid email")) {
          setError("Please enter a valid email address");
        } else {
          setError(err);
        }
      } else {
        // Check if email confirmation is required
        setSuccess("Account created successfully! Check your email to verify your account, then sign in.");
        // Don't auto-navigate on signup - user needs to verify email first
        setTab("signin");
        setPassword("");
      }
    } else {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) {
        // Improve error messages
        if (err.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (err.includes("Email not confirmed")) {
          setError("Please verify your email before signing in. Check your inbox for the confirmation link.");
        } else {
          setError(err);
        }
      } else {
        const dest = pendingPrompt
          ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
          : nextPath;
        navigate(dest);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-text-primary text-lg font-semibold mb-8 sm:mb-12 hover:text-accent-primary transition-colors"
      >
        <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
        Nanowork
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-card border border-border-subtle overflow-hidden">
          {/* Header */}
          <div className="border-b border-border-subtle px-4 sm:px-6 py-4 sm:py-5 bg-bg-tertiary">
            <div className="flex items-center gap-2 sm:gap-3">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-text-tertiary" />
              <span className="text-sm sm:text-base font-medium text-text-secondary">
                Authentication Required
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-status-success" />
                <span className="text-xs sm:text-sm text-text-tertiary">Secure</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-4 sm:mb-6 p-1 bg-bg-tertiary rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError("");
                }}
                className={`flex-1 py-2.5 sm:py-3 text-sm font-medium rounded-md transition-all ${
                  tab === "signin"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/50"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setError("");
                }}
                className={`flex-1 py-2.5 sm:py-3 text-sm font-medium rounded-md transition-all ${
                  tab === "signup"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/50"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              {tab === "signup" && (
                <div>
                  <label
                    className="block text-sm font-medium text-text-secondary mb-2"
                    htmlFor="login-name"
                  >
                    Name
                  </label>
                  <input
                    id="login-name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-bg-tertiary border border-border-default focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-tertiary text-sm outline-none transition-all"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium text-text-secondary mb-2"
                  htmlFor="login-email"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-bg-tertiary border border-border-default focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-tertiary text-sm outline-none transition-all"
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-sm font-medium text-text-secondary"
                    htmlFor="login-password"
                  >
                    Password {tab === "signup" && <span className="text-text-tertiary">(min. 6 characters)</span>}
                  </label>
                  {tab === "signin" && (
                    <Link
                      to="/forgot-password"
                      className="text-sm text-accent-primary hover:text-accent-hover transition-colors"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  id="login-password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-bg-tertiary border border-border-default focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-tertiary text-sm outline-none transition-all"
                  type="password"
                  placeholder={tab === "signup" ? "Create a secure password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={tab === "signup" ? 6 : undefined}
                />
              </div>

              {success && (
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border border-status-success/20 bg-status-success/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-medium text-status-success mt-0.5">Success:</span>
                    <p className="text-xs sm:text-sm text-status-success leading-relaxed flex-1">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border border-status-error/20 bg-status-error/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-medium text-status-error mt-0.5">Error:</span>
                    <p className="text-xs sm:text-sm text-status-error leading-relaxed flex-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 rounded-lg bg-accent-primary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors mt-2 shadow-sm"
              >
                {loading
                  ? tab === "signup"
                    ? "Creating account..."
                    : "Signing in..."
                  : tab === "signup"
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-border-subtle px-4 sm:px-6 py-3 sm:py-4 bg-bg-tertiary">
            <p className="text-xs sm:text-sm text-text-tertiary text-center">
              Encrypted connection · Enterprise security
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-text-tertiary mt-6 sm:mt-8 text-center px-4">
        By continuing you agree to{" "}
        <a href="#" className="text-accent-primary hover:text-accent-hover transition-colors underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="text-accent-primary hover:text-accent-hover transition-colors underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

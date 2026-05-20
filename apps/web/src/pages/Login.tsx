import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Terminal, Lock } from "lucide-react";

/**
 * INDUSTRIAL LOGIN DESIGN:
 * - Sharp edges, no rounded corners
 * - Hard borders instead of soft shadows
 * - Terminal/data-dense aesthetic
 * - Monospace fonts for system feel
 * - Square logo, no circles
 * - Minimal, functional forms
 * - Industrial color scheme
 */

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

  // Auto-select tab based on route
  const initialTab = location.pathname === "/signup" ? "signup" : "signin";
  const [tab, setTab] = useState<Tab>(initialTab);
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Logo - Square, terminal style */}
      <Link
        to="/"
        className="flex items-center gap-2 text-content-primary text-sm mb-8 sm:mb-12 hover:opacity-70 transition-opacity"
      >
        <Terminal className="w-7 h-7 text-accent-primary stroke-[2.5]" />
        <span className="font-bold uppercase tracking-wider">Nanowork</span>
      </Link>

      {/* Login Card - Sharp edges, hard borders */}
      <div className="w-full max-w-md">
        <div className="bg-background-elevated border-2 border-border-DEFAULT">
          {/* Header - Terminal style */}
          <div className="border-b-2 border-border-DEFAULT px-4 sm:px-6 py-3 sm:py-4 bg-background-subtle">
            <div className="flex items-center gap-2 sm:gap-3">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-content-tertiary" />
              <span className="text-xs sm:text-sm font-bold text-content-secondary uppercase tracking-wider font-mono">
                AUTH_REQUIRED
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-accent-success" />
                <span className="text-[10px] sm:text-xs text-content-tertiary font-mono uppercase">SECURE</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Tab Switcher - Sharp edges */}
            <div className="flex gap-0 mb-4 sm:mb-6 border-2 border-border-DEFAULT">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider transition-colors font-mono ${
                  tab === "signin"
                    ? "bg-accent-primary text-white"
                    : "bg-background-subtle text-content-secondary hover:bg-background-muted border-r-2 border-border-DEFAULT"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider transition-colors font-mono ${
                  tab === "signup"
                    ? "bg-accent-primary text-white"
                    : "bg-background-subtle text-content-secondary hover:bg-background-muted"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              {tab === "signup" && (
                <div>
                  <label
                    className="block text-xs font-bold text-content-secondary mb-2 uppercase tracking-wider font-mono"
                    htmlFor="login-name"
                  >
                    Name
                  </label>
                  <input
                    id="login-name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background-subtle border-2 border-border-DEFAULT focus:border-accent-primary text-content-primary placeholder-content-muted text-sm outline-none transition-colors"
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
                  className="block text-xs font-bold text-content-secondary mb-2 uppercase tracking-wider font-mono"
                  htmlFor="login-email"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background-subtle border-2 border-border-DEFAULT focus:border-accent-primary text-content-primary placeholder-content-muted text-sm outline-none transition-colors"
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
                    className="block text-xs font-bold text-content-secondary uppercase tracking-wider font-mono"
                    htmlFor="login-password"
                  >
                    Password {tab === "signup" && <span className="text-content-tertiary font-normal lowercase">(min. 6 chars)</span>}
                  </label>
                  {tab === "signin" && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors font-bold uppercase tracking-wider font-mono"
                    >
                      Reset?
                    </Link>
                  )}
                </div>
                <input
                  id="login-password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background-subtle border-2 border-border-DEFAULT focus:border-accent-primary text-content-primary placeholder-content-muted text-sm outline-none transition-colors"
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
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-accent-success bg-accent-success/5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-bold text-accent-success uppercase tracking-wider font-mono">Success:</span>
                    <p className="text-xs sm:text-sm text-accent-success leading-relaxed flex-1">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-accent-danger bg-accent-danger/5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-bold text-accent-danger uppercase tracking-wider font-mono">Error:</span>
                    <p className="text-xs sm:text-sm text-accent-danger leading-relaxed flex-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-colors mt-2 border-2 border-accent-primary font-mono"
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

          {/* Footer - Terminal style */}
          <div className="border-t-2 border-border-DEFAULT px-4 sm:px-6 py-3 sm:py-4 bg-background-subtle">
            <p className="text-[10px] sm:text-xs text-content-tertiary text-center font-mono uppercase tracking-wider">
              Encrypted Connection • Enterprise Security
            </p>
          </div>
        </div>
      </div>

      {/* Legal footer - Terminal style */}
      <p className="text-[10px] sm:text-xs text-content-tertiary mt-6 sm:mt-8 text-center px-4 font-mono">
        By continuing you agree to{" "}
        <a href="#" className="text-accent-primary hover:text-accent-primary/80 transition-colors uppercase font-bold">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="text-accent-primary hover:text-accent-primary/80 transition-colors uppercase font-bold">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

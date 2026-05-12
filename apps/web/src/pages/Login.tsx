import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
        const dest = pendingPrompt
          ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
          : nextPath;
        navigate(dest);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-white font-mono text-sm font-bold uppercase tracking-wider mb-8 sm:mb-12 hover:opacity-70 transition-opacity"
      >
        <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
        Nanowork
      </Link>

      {/* Terminal Login Card */}
      <div className="w-full max-w-md">
        <div className="card-lg rounded-none border border-white/10">
          {/* Header */}
          <div className="border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-surface-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
                Authentication Required
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                <span className="text-[10px] sm:text-xs font-mono text-white/40">SECURE</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Tab Switcher */}
            <div className="flex gap-0 mb-4 sm:mb-6 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError("");
                }}
                className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  tab === "signin"
                    ? "bg-white text-black"
                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
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
                className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-colors border-l border-white/10 ${
                  tab === "signup"
                    ? "bg-white text-black"
                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              {tab === "signup" && (
                <div>
                  <label
                    className="block text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider mb-2"
                    htmlFor="login-name"
                  >
                    Name
                  </label>
                  <input
                    id="login-name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-none bg-surface-3 border border-white/10 focus:border-white/30 text-white placeholder-white/30 text-xs sm:text-sm font-mono outline-none transition-colors"
                    type="text"
                    placeholder="FULL NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider mb-2"
                  htmlFor="login-email"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-none bg-surface-3 border border-white/10 focus:border-white/30 text-white placeholder-white/30 text-xs sm:text-sm font-mono outline-none transition-colors"
                  type="email"
                  placeholder="USER@DOMAIN.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider mb-2"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-none bg-surface-3 border border-white/10 focus:border-white/30 text-white placeholder-white/30 text-xs sm:text-sm font-mono outline-none transition-colors"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  required
                />
              </div>

              {error && (
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border border-red-400/20 bg-red-400/5">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] sm:text-xs font-mono text-red-400 mt-0.5">ERROR:</span>
                    <p className="text-[10px] sm:text-xs font-mono text-red-400 leading-relaxed flex-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 rounded-none bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors mt-2"
              >
                {loading
                  ? tab === "signup"
                    ? "CREATING..."
                    : "AUTHENTICATING..."
                  : tab === "signup"
                  ? "Create Account"
                  : "Authenticate"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-surface-1">
            <p className="text-[10px] sm:text-xs font-mono text-white/30 text-center leading-relaxed">
              ENCRYPTED CONNECTION · SOC 2 TYPE II CERTIFIED
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10px] sm:text-xs font-mono text-white/30 mt-6 sm:mt-8 text-center px-4 leading-relaxed">
        BY CONTINUING YOU AGREE TO{" "}
        <a href="#" className="text-white/50 hover:text-white transition-colors underline">
          TERMS
        </a>{" "}
        AND{" "}
        <a href="#" className="text-white/50 hover:text-white transition-colors underline">
          PRIVACY POLICY
        </a>
      </p>
    </div>
  );
}

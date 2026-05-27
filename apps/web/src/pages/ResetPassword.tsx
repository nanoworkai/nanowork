import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Terminal, Eye, EyeOff, Lock, Check, AlertCircle } from "lucide-react";
import Footer from "../components/Footer";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingSession, setValidatingSession] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          navigate("/forgot-password", {
            state: { error: "This reset link is invalid or has expired" },
            replace: true,
          });
          return;
        }

        setValidatingSession(false);
      } catch (err) {
        console.error("Session validation error:", err);
        navigate("/forgot-password", {
          state: { error: "This reset link is invalid or has expired" },
          replace: true,
        });
      }
    };

    validateSession();
  }, [navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();

      navigate("/login", {
        state: { success: "Password updated successfully. Please sign in with your new password." },
        replace: true,
      });
    } catch (err) {
      console.error("Password update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (validatingSession) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-fintech-border border-t-fintech-navy animate-spin mx-auto mb-4" />
          <p className="text-sm text-fintech-slate">Validating reset link...</p>
        </div>
      </div>
    );
  }

  const passwordValidations = [
    { label: "At least 8 characters", valid: newPassword.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", valid: /[a-z]/.test(newPassword) },
    { label: "One number", valid: /[0-9]/.test(newPassword) },
  ];

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
          <div className="border border-fintech-border bg-surface-1 shadow-card">
            <div className="p-8">
              <h1 className="text-2xl font-semibold text-fintech-navy mb-2">
                Set new password
              </h1>
              <p className="text-sm text-fintech-slate mb-8">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-4 py-3 border border-fintech-red/20 bg-fintech-red/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-fintech-red flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-fintech-red">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-fintech-navy mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      className="w-full px-4 py-2.5 pr-12 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors disabled:opacity-50"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-fintech-slate hover:text-fintech-navy transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className="border border-fintech-divider bg-surface-0 p-3">
                    <p className="text-xs font-medium text-fintech-navy mb-2">Password requirements:</p>
                    <div className="space-y-1.5">
                      {passwordValidations.map((validation) => (
                        <div key={validation.label} className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 flex items-center justify-center transition-colors ${
                              validation.valid
                                ? "bg-fintech-green/10 text-fintech-green"
                                : "bg-surface-0 border border-fintech-divider text-fintech-slate/40"
                            }`}
                          >
                            {validation.valid && <Check className="w-3 h-3" />}
                          </div>
                          <span
                            className={`text-xs transition-colors ${
                              validation.valid ? "text-fintech-slate" : "text-fintech-slate/60"
                            }`}
                          >
                            {validation.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-fintech-navy mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                      className="w-full px-4 py-2.5 pr-12 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors disabled:opacity-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-fintech-slate hover:text-fintech-navy transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-fintech-red mt-1.5">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    passwordValidations.some((v) => !v.valid)
                  }
                  className="w-full py-3 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-button transition-colors"
                >
                  {loading ? "Updating password..." : "Update password"}
                </button>
              </form>
            </div>

            <div className="border-t border-fintech-divider px-8 py-4 bg-surface-0">
              <div className="flex items-start gap-2 text-xs text-fintech-slate">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  After updating your password, you'll be signed out and redirected to the login page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

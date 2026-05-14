import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Terminal, Eye, EyeOff, Lock, Check } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingSession, setValidatingSession] = useState(true);

  // Validate session on page load
  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // No valid session - redirect to forgot password
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

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login with success message
      navigate("/login", {
        state: { success: "Password updated — please log in" },
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

  // Show loading state while validating session
  if (validatingSession) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Validating reset link...</p>
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
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center">
              <Terminal className="w-6 h-6 text-black" />
            </div>
            <span className="font-mono font-bold text-white text-xl uppercase tracking-wider">
              Nanowork
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-sm text-zinc-500">
            Choose a strong password for your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-xs font-medium text-zinc-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors disabled:opacity-50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
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

            {/* Password Requirements */}
            {newPassword && (
              <div className="rounded-xl bg-surface-2 border border-white/5 p-3">
                <p className="text-xs font-medium text-zinc-400 mb-2">Password requirements:</p>
                <div className="space-y-1">
                  {passwordValidations.map((validation) => (
                    <div key={validation.label} className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                          validation.valid
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/5 text-zinc-600"
                        }`}
                      >
                        {validation.valid && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span
                        className={`text-xs transition-colors ${
                          validation.valid ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {validation.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-2 border border-white/10 focus:border-white/20 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordValidations.some((v) => !v.valid)
              }
              className="w-full px-4 py-3 rounded-xl bg-white hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="rounded-xl bg-surface-2 border border-white/5 p-4 text-xs text-zinc-500">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              After updating your password, you'll be signed out and redirected to the login page.
              Use your new password to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

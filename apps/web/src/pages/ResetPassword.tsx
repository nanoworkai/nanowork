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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-accent-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-mono">Validating reset link...</p>
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Terminal className="w-10 h-10 text-accent-primary stroke-[2.5]" />
            <span className="font-mono font-bold text-white text-xl tracking-tight">
              Nanowork
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-sm text-gray-400 font-mono">
            Choose a strong password for your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border-2 border-[#2a2a2a] p-6 mb-6">
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/20 text-red-400 text-sm font-mono">
                {error}
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2 font-mono">
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
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border-2 border-[#2a2a2a] focus:border-accent-primary focus:ring-0 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50 disabled:bg-[#0a0a0a] font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
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
              <div className="bg-[#0a0a0a] border-2 border-[#2a2a2a] p-3">
                <p className="text-xs font-medium text-gray-300 mb-2 font-mono">Password requirements:</p>
                <div className="space-y-1">
                  {passwordValidations.map((validation) => (
                    <div key={validation.label} className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 flex items-center justify-center border-2 transition-colors ${
                          validation.valid
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-transparent border-[#2a2a2a] text-gray-600"
                        }`}
                      >
                        {validation.valid && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span
                        className={`text-xs transition-colors font-mono ${
                          validation.valid ? "text-gray-300" : "text-gray-500"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 font-mono">
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
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border-2 border-[#2a2a2a] focus:border-accent-primary focus:ring-0 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50 disabled:bg-[#0a0a0a] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
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
                <p className="text-xs text-red-400 mt-1.5 font-mono">Passwords do not match</p>
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
              className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 font-mono border-2 border-transparent hover:border-accent-primary/50"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
              )}
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] p-4 text-xs text-gray-400">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono">
              After updating your password, you'll be signed out and redirected to the login page.
              Use your new password to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

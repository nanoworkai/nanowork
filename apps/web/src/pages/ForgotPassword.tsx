import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Terminal, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_SITE_URL ?? ''}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      // Show success regardless of whether email exists (security best practice)
      setSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-sm text-gray-400 font-mono">
            {submitted
              ? "Check your email for the reset link"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 font-mono">
                If an account exists for <strong className="text-white">{email}</strong>, you'll
                receive a password reset link shortly.
              </p>
              <div className="bg-[#0a0a0a] border-2 border-[#2a2a2a] p-4 text-xs text-gray-400 space-y-2 w-full font-mono">
                <p className="font-semibold text-gray-300">What to do next:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Set your new password</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border-2 border-[#2a2a2a] p-6 mb-6">
            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/20 text-red-400 text-sm font-mono">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#2a2a2a] focus:border-accent-primary focus:ring-0 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50 disabled:bg-[#0a0a0a] font-mono"
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 font-mono border-2 border-transparent hover:border-accent-primary/50"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                )}
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}

        {/* Back to Login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 font-mono">
            For security reasons, we don't reveal whether an email is registered
          </p>
        </div>
      </div>
    </div>
  );
}

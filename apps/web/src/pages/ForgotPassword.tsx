import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Terminal, ArrowLeft, Mail, AlertCircle } from "lucide-react";
import Footer from "../components/Footer";

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

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
          {submitted ? (
            /* Success State */
            <div className="border border-fintech-border bg-surface-1 shadow-card">
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-fintech-green/10 flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-fintech-green" />
                  </div>
                  <h1 className="text-2xl font-semibold text-fintech-navy mb-2">
                    Check your email
                  </h1>
                  <p className="text-sm text-fintech-slate leading-relaxed mb-6">
                    If an account exists for <strong className="text-fintech-navy">{email}</strong>,
                    you'll receive a password reset link shortly.
                  </p>
                  <div className="border border-fintech-divider bg-surface-0 p-4 text-sm text-fintech-slate space-y-2 w-full">
                    <p className="font-semibold text-fintech-navy">What to do next:</p>
                    <ul className="space-y-1.5 list-disc list-inside text-left">
                      <li>Check your inbox (and spam folder)</li>
                      <li>Click the reset link in the email</li>
                      <li>Set your new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-fintech-divider px-8 py-4 bg-surface-0">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-fintech-slate hover:text-fintech-navy transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
            <>
              <div className="border border-fintech-border bg-surface-1 shadow-card">
                <div className="p-8">
                  <h1 className="text-2xl font-semibold text-fintech-navy mb-2">
                    Reset your password
                  </h1>
                  <p className="text-sm text-fintech-slate mb-8">
                    Enter your email and we'll send you a password reset link.
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
                      <label htmlFor="email" className="block text-sm font-medium text-fintech-navy mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        disabled={loading}
                        className="w-full px-4 py-2.5 bg-surface-0 border border-fintech-border focus:border-fintech-navy focus:outline-none text-fintech-navy placeholder:text-fintech-slate/40 text-sm transition-colors disabled:opacity-50"
                        autoFocus
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full py-3 bg-fintech-navy hover:bg-fintech-navy/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-button transition-colors"
                    >
                      {loading ? "Sending reset link..." : "Send reset link"}
                    </button>
                  </form>
                </div>

                <div className="border-t border-fintech-divider px-8 py-4 bg-surface-0">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-fintech-slate hover:text-fintech-navy transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </div>

              <p className="text-xs text-fintech-slate text-center mt-6">
                For security, we don't reveal whether an email is registered.
              </p>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

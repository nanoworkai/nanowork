import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Step = "phone" | "otp";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.includes(":")) return "/dashboard";
  return raw;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  return `+1${digits}`;
}

export default function Login() {
  const { requestOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("redirect") ?? searchParams.get("next"));
  const pendingPrompt = searchParams.get("p");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const dest = pendingPrompt
        ? `${nextPath}?p=${encodeURIComponent(pendingPrompt)}`
        : nextPath;
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath, pendingPrompt]);

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await requestOtp(toE164(phone));
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    const code = newOtp.join("");
    if (code.length === 6) submitOtp(code);
  };

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const newOtp = [...otp];
    for (let i = 0; i < text.length; i++) newOtp[i] = text[i];
    setOtp(newOtp);
    if (text.length === 6) submitOtp(text);
    else otpRefs.current[text.length]?.focus();
  };

  const submitOtp = async (code: string) => {
    setLoading(true);
    setError("");
    const { error: err } = await verifyOtp(toE164(phone), code);
    setLoading(false);
    if (err) {
      setError("Invalid code — please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-8">
        <span className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-base">N</span>
        Nanowork
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-1 border border-white/10 rounded-2xl p-8 shadow-2xl animate-slide-up">
        {step === "phone" ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome</h1>
            <p className="text-sm text-zinc-400 mb-6">
              Enter your phone number to sign in or create an account.
            </p>
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="login-phone">
                  Phone number
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-2 border border-white/10 focus-within:border-brand-500/60 transition-colors">
                  <span className="text-sm text-zinc-500 select-none">🇺🇸 +1</span>
                  <input
                    id="login-phone"
                    className="flex-1 bg-transparent text-white placeholder-zinc-600 text-sm outline-none"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    autoFocus
                    autoComplete="tel"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                {loading ? "Sending code…" : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Enter code</h1>
            <p className="text-sm text-zinc-400 mb-6">
              We sent a 6-digit code to{" "}
              <span className="text-white font-medium">+1 {phone}</span>
            </p>

            <div className="flex gap-2 justify-between mb-4" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className="w-12 h-14 rounded-xl bg-surface-2 border border-white/10 focus:border-brand-500/60 text-center text-xl font-bold text-white outline-none transition-colors tabular-nums"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {loading && (
              <p className="text-xs text-zinc-500 mb-4 text-center">Verifying…</p>
            )}

            <button
              type="button"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-full text-center"
              onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
            >
              ← Use a different number
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-zinc-600 mt-6 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-zinc-500 hover:text-zinc-300 underline transition-colors">Terms</a>
        {" "}and{" "}
        <a href="#" className="text-zinc-500 hover:text-zinc-300 underline transition-colors">Privacy Policy</a>.
      </p>
    </div>
  );
}

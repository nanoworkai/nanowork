import { useState, useRef, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandMark } from "../components/SiteChrome";

type Step = "phone" | "otp";

export default function Login() {
  const { requestOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestOtp(phone);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const code = newOtp.join("");
    if (code.length === 6) {
      submitOtp(code);
    }
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
    for (let i = 0; i < text.length; i++) {
      newOtp[i] = text[i];
    }
    setOtp(newOtp);
    if (text.length === 6) submitOtp(text);
    else otpRefs.current[text.length]?.focus();
  };

  const submitOtp = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const ok = await verifyOtp(code);
      if (ok) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <BrandMark />
        </div>

        {step === "phone" ? (
          <>
            <h1 className="login-card__title">Welcome back</h1>
            <p className="login-card__subtitle">
              Sign in with your phone number to manage your AI agent.
            </p>
            <form onSubmit={handlePhoneSubmit} className="login-form">
              <label className="login-label" htmlFor="login-phone">
                Phone number
              </label>
              <input
                id="login-phone"
                className="login-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
                autoComplete="tel"
              />
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn--primary login-submit" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="login-card__title">Enter code</h1>
            <p className="login-card__subtitle">
              We sent a 6-digit code to <strong>{phone}</strong>
            </p>
            <div className="otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className="otp-input"
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
            {error && <p className="login-error">{error}</p>}
            {loading && <p className="login-loading">Verifying…</p>}
            <button
              className="login-back"
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
            >
              ← Use a different number
            </button>
          </>
        )}

        <p className="login-card__legal">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

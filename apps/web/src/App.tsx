import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Revenue from "./pages/Revenue";
import Swipe from "./pages/Swipe";
import PreviewPage from "./pages/PreviewPage";
import Pricing from "./pages/Pricing";
import DashboardLayout from "./dashboard/DashboardLayout";
import Overview from "./dashboard/OverviewNew";
import Bookings from "./dashboard/Bookings";
import Settings from "./dashboard/Settings";
import BuildView from "./dashboard/BuildView";
import Inbox from "./dashboard/Inbox";
import Wallet from "./dashboard/Wallet";
import Plan from "./dashboard/Plan";
import UserAppEntry from "./pages/user-app/UserAppEntry";
import UserAppLayout from "./pages/user-app/UserAppLayout";
import UserAppHome from "./pages/user-app/UserAppHome";
import UserAppLeads from "./pages/user-app/UserAppLeads";
import UserAppAPI from "./pages/user-app/UserAppAPI";
import UserAppSettings from "./pages/user-app/UserAppSettings";
import UserAppRedeem from "./pages/user-app/UserAppRedeem";
import ClaimedCompany from "./pages/ClaimedCompany";
import ClaimPreview from "./pages/claim/ClaimPreview";
import ClaimPayment from "./pages/claim/ClaimPayment";
import { useAuth } from "./context/AuthContext";
import { isSupabaseConfigured } from "./lib/supabase";
import { startKeepAlive } from "./utils/keepAlive";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, authError, retryAuth } = useAuth();
  const { pathname, search } = useLocation();
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Track loading time and show warnings/retry options
  useEffect(() => {
    if (!isLoading) {
      setShowSlowWarning(false);
      setShowRetryButton(false);
      return;
    }

    // Show "taking longer than usual" warning after 5 seconds
    const warningTimer = setTimeout(() => {
      if (isLoading) {
        setShowSlowWarning(true);
      }
    }, 5000);

    // Show retry button after 10 seconds
    const retryTimer = setTimeout(() => {
      if (isLoading) {
        setShowRetryButton(true);
      }
    }, 10000);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(retryTimer);
    };
  }, [isLoading]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryAuth();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearCacheAndRetry = () => {
    // Clear localStorage
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    // Reload the page
    window.location.reload();
  };

  const getDiagnosticInfo = () => {
    const diagnostics = [];

    if (!isSupabaseConfigured) {
      diagnostics.push({
        icon: "⚠️",
        title: "Supabase Configuration",
        message: "Supabase is not properly configured. Check your environment variables.",
        severity: "error" as const,
      });
    }

    if (!navigator.onLine) {
      diagnostics.push({
        icon: "📡",
        title: "Network Connection",
        message: "You appear to be offline. Check your internet connection.",
        severity: "error" as const,
      });
    }

    if (authError) {
      diagnostics.push({
        icon: "❌",
        title: "Authentication Error",
        message: authError,
        severity: "error" as const,
      });
    }

    return diagnostics;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    const diagnostics = getDiagnosticInfo();
    const hasErrors = diagnostics.length > 0;

    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="inline-block w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary text-sm mb-2">Checking authentication...</p>

          {showSlowWarning && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                This is taking longer than usual...
              </p>
            </div>
          )}

          {hasErrors && (
            <div className="mt-6 space-y-3 text-left">
              <p className="text-sm font-medium text-text-primary mb-2">Diagnostic Information:</p>
              {diagnostics.map((diag, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    diag.severity === "error"
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-yellow-500/10 border-yellow-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{diag.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary mb-1">{diag.title}</p>
                      <p className="text-xs text-text-secondary">{diag.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showRetryButton && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-text-secondary mb-3">
                Having trouble? Try one of these options:
              </p>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isRetrying ? "Retrying..." : "Retry Authentication"}
              </button>
              <button
                onClick={handleClearCacheAndRetry}
                className="w-full px-4 py-2 bg-bg-secondary text-text-primary rounded-lg hover:bg-bg-tertiary border border-border-primary transition-colors text-sm"
              >
                Clear Cache & Retry
              </button>
              <div className="mt-4 p-3 bg-bg-secondary rounded-lg border border-border-primary">
                <p className="text-xs text-text-secondary text-left">
                  <strong>Troubleshooting steps:</strong>
                  <br />
                  1. Check your internet connection
                  <br />
                  2. Try clearing your browser cache
                  <br />
                  3. Try a different browser or incognito mode
                  <br />
                  4. Contact support if the issue persists
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (authError && !isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-4 text-red-500">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Authentication Failed
          </h2>
          <p className="text-text-secondary text-sm mb-6">{authError}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? "Retrying..." : "Try Again"}
            </button>
            <button
              onClick={() => window.location.href = "/login"}
              className="w-full px-4 py-2 bg-bg-secondary text-text-primary rounded-lg hover:bg-bg-tertiary border border-border-primary transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  // Start keep-alive ping to prevent Render free tier from spinning down
  useEffect(() => {
    const cleanup = startKeepAlive();
    return cleanup;
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/swipe" element={<Swipe />} />
      <Route path="/preview/:buildId" element={<PreviewPage />} />

      {/* Claim flow routes */}
      <Route path="/claim/:companyId/preview" element={<ClaimPreview />} />
      <Route path="/claim/:companyId/payment" element={<ClaimPayment />} />
      <Route path="/claimed/:companyId" element={<ClaimedCompany />} />

      {/* Dashboard routes - authenticated */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="builds/:buildId" element={<Overview />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="plan" element={<Plan />} />
        <Route path="settings" element={<Settings />} />
        <Route path="build-view/:buildId" element={<BuildView />} />
      </Route>

      {/* User app routes - for built apps */}
      <Route path="/app" element={<UserAppEntry />}>
        <Route element={<UserAppLayout />}>
          <Route index element={<UserAppHome />} />
          <Route path="leads" element={<UserAppLeads />} />
          <Route path="api" element={<UserAppAPI />} />
          <Route path="settings" element={<UserAppSettings />} />
        </Route>
        <Route path="redeem" element={<UserAppRedeem />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
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
import UserAppEntry from "./pages/user-app/UserAppEntry";
import UserAppLayout from "./pages/user-app/UserAppLayout";
import UserAppHome from "./pages/user-app/UserAppHome";
import UserAppLeads from "./pages/user-app/UserAppLeads";
import UserAppAPI from "./pages/user-app/UserAppAPI";
import UserAppSettings from "./pages/user-app/UserAppSettings";
import UserAppRedeem from "./pages/user-app/UserAppRedeem";
import ClaimedCompany from "./pages/ClaimedCompany";
// TODO: Create claim flow components
// import ClaimPreview from "./pages/claim/ClaimPreview";
// import ClaimPayment from "./pages/claim/ClaimPayment";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname, search } = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary text-sm">Checking authentication...</p>
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
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/swipe" element={<Swipe />} />
      <Route path="/preview/:buildId" element={<PreviewPage />} />

      {/* Claim flow routes */}
      {/* <Route path="/claim/:companyId/preview" element={<ClaimPreview />} /> */}
      {/* <Route path="/claim/:companyId/payment" element={<ClaimPayment />} /> */}
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

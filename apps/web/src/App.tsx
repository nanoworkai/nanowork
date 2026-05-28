import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Revenue from "./pages/Revenue";
import Swipe from "./pages/Swipe";
import PreviewPage from "./pages/PreviewPage";
import Pricing from "./pages/Pricing";
import Marketplace from "./pages/Marketplace";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import DashboardLayout from "./dashboard/DashboardLayout";
import Create from "./dashboard/Create";
import History from "./dashboard/History";
import Overview from "./dashboard/OverviewNew";
import Settings from "./dashboard/Settings";
import BuildView from "./dashboard/BuildView";
import BuilderView from "./dashboard/BuilderView";
import BuildDocuments from "./dashboard/BuildDocuments";
import BuildSpreadsheet from "./dashboard/BuildSpreadsheet";
import BuildPitchDeck from "./dashboard/BuildPitchDeck";
import Inbox from "./dashboard/Inbox";
import Wallet from "./dashboard/Wallet";
import Financials from "./dashboard/Financials";
import PitchDeck from "./dashboard/PitchDeck";
import Spreadsheets from "./dashboard/Spreadsheets";
import Documents from "./dashboard/Documents";
import Presentations from "./dashboard/Presentations";
import Files from "./dashboard/Files";
import UserAppEntry from "./pages/user-app/UserAppEntry";
import UserAppLayout from "./pages/user-app/UserAppLayout";
import UserAppHome from "./pages/user-app/UserAppHome";
import UserAppLeads from "./pages/user-app/UserAppLeads";
import UserAppAPI from "./pages/user-app/UserAppAPI";
import UserAppSettings from "./pages/user-app/UserAppSettings";
import UserAppRedeem from "./pages/user-app/UserAppRedeem";
import { useAuth } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname, search } = useLocation();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/swipe" element={<Swipe />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/preview/:buildId" element={<PreviewPage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/security" element={<Security />} />
      <Route path="/contact" element={<Contact />} />

      {/* Dashboard routes - authenticated */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Create />} />
        <Route path="financials" element={<Financials />} />
        <Route path="history" element={<History />} />
        <Route path="builds/:buildId" element={<Overview />} />
        <Route path="builder/:buildId" element={<BuilderView />} />
        <Route path="builds/:buildId/documents" element={<BuildDocuments />} />
        <Route path="builds/:buildId/spreadsheet" element={<BuildSpreadsheet />} />
        <Route path="builds/:buildId/pitch-deck" element={<BuildPitchDeck />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="pitch-deck" element={<PitchDeck />} />
        <Route path="spreadsheets" element={<Spreadsheets />} />
        <Route path="documents" element={<Documents />} />
        <Route path="presentations" element={<Presentations />} />
        <Route path="files" element={<Files />} />
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
    </>
  );
}

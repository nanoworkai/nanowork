import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { BUSINESSES } from "./data/businesses";
import Changelog from "./pages/Changelog";
import DemoPage from "./pages/Demo";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DashboardLayout from "./dashboard/DashboardLayout";
import Overview from "./dashboard/Overview";
import Usage from "./dashboard/Usage";
import Domains from "./dashboard/Domains";
import Plan from "./dashboard/Plan";
import Settings from "./dashboard/Settings";
import { useAuth } from "./context/AuthContext";
import UserAppEntry from "./pages/user-app/UserAppEntry";
import UserAppLayout from "./pages/user-app/UserAppLayout";
import UserAppHome from "./pages/user-app/UserAppHome";
import UserAppLeads from "./pages/user-app/UserAppLeads";
import UserAppAPI from "./pages/user-app/UserAppAPI";
import UserAppSettings from "./pages/user-app/UserAppSettings";
import UserAppRedeem from "./pages/user-app/UserAppRedeem";

const RESERVED_PATHS = new Set([
  "gallery",
  "changelog",
  "demo",
  "api",
  "assets",
  "static",
  "login",
  "dashboard",
  "app",
]);

function LegacyDemoRedirect() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/gallery" replace />;
  return <Navigate to={`/${slug}`} replace />;
}

function SlugRouter() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || RESERVED_PATHS.has(slug)) {
    return <NotFound />;
  }
  const isBusiness = BUSINESSES.some((b) => b.slug === slug);
  if (!isBusiness) {
    return <NotFound />;
  }
  return <DemoPage />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { pathname } = useLocation();
  const showAmbient = !pathname.startsWith("/app");
  return (
    <>
      {showAmbient && (
        <>
          <div className="noise" aria-hidden />
          <div className="glow" aria-hidden />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<UserAppEntry />}>
          <Route element={<UserAppLayout />}>
            <Route index element={<UserAppHome />} />
            <Route path="leads" element={<UserAppLeads />} />
            <Route path="api" element={<UserAppAPI />} />
            <Route path="settings" element={<UserAppSettings />} />
            <Route path="redeem" element={<UserAppRedeem />} />
          </Route>
        </Route>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="usage" element={<Usage />} />
          <Route path="domains" element={<Domains />} />
          <Route path="plan" element={<Plan />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/demo/:slug" element={<LegacyDemoRedirect />} />
        <Route path="/:slug" element={<SlugRouter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

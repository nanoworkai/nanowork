import { Navigate, Route, Routes, useParams } from "react-router-dom";
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

const RESERVED_PATHS = new Set([
  "gallery",
  "changelog",
  "demo",
  "api",
  "assets",
  "static",
  "login",
  "dashboard",
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
  return (
    <>
      <div className="noise" aria-hidden />
      <div className="glow" aria-hidden />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/login" element={<Login />} />
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

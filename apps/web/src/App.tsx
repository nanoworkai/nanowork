import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Revenue from "./pages/Revenue";
import Swipe from "./pages/Swipe";
import PreviewPage from "./pages/PreviewPage";
import DashboardLayout from "./dashboard/DashboardLayout";
import Overview from "./dashboard/Overview";
import Bookings from "./dashboard/Bookings";
import Domains from "./dashboard/Domains";
import Plan from "./dashboard/Plan";
import Settings from "./dashboard/Settings";
import BuildView from "./dashboard/BuildView";
import { useAuth } from "./context/AuthContext";

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/swipe" element={<Swipe />} />
      <Route path="/preview/:buildId" element={<PreviewPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="domains" element={<Domains />} />
        <Route path="plan" element={<Plan />} />
        <Route path="settings" element={<Settings />} />
        <Route path="builds/:buildId" element={<BuildView />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

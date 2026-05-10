import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Rent from "./pages/Rent";
import RentDetail from "./pages/RentDetail";
import SubmitResource from "./pages/SubmitResource";
import Revenue from "./pages/Revenue";
import Swipe from "./pages/Swipe";
import DashboardLayout from "./dashboard/DashboardLayout";
import Overview from "./dashboard/Overview";
import Bookings from "./dashboard/Bookings";
import Domains from "./dashboard/Domains";
import Plan from "./dashboard/Plan";
import Settings from "./dashboard/Settings";
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
      <Route path="/rent" element={<Rent />} />
      <Route path="/rent/submit" element={<SubmitResource />} />
      <Route path="/rent/:slug" element={<RentDetail />} />
      <Route path="/revenue" element={<Revenue />} />
      <Route path="/swipe" element={<Swipe />} />
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
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

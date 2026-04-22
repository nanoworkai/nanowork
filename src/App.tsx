import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Home from "./pages/Home";
import Changelog from "./pages/Changelog";
import DemoPage from "./pages/Demo";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import { BUSINESSES } from "./data/businesses";

const RESERVED_PATHS = new Set([
  "gallery",
  "changelog",
  "demo",
  "api",
  "assets",
  "static",
]);

function LegacyDemoRedirect() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/gallery" replace />;
  return <Navigate to={`/${slug}`} replace />;
}

function SlugRouter() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || RESERVED_PATHS.has(slug)) {
    return <Navigate to="/" replace />;
  }
  const isBusiness = BUSINESSES.some((b) => b.slug === slug);
  if (!isBusiness) {
    return <NotFound />;
  }
  return <DemoPage />;
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
        <Route path="/demo/:slug" element={<LegacyDemoRedirect />} />
        <Route path="/:slug" element={<SlugRouter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

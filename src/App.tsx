import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Changelog from "./pages/Changelog";
import DemoPage from "./pages/Demo";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <div className="noise" aria-hidden />
      <div className="glow" aria-hidden />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/demo/:slug" element={<DemoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

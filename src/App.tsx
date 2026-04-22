import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
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
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/demo/:slug" element={<DemoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

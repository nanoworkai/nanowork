import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <div className="noise" aria-hidden />
      <div className="glow" aria-hidden />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

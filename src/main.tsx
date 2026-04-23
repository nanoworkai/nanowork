import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./demos/demos.css";
import "./demos/demos-extra.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { PhoneProvider } from "./context/PhoneContext";
import { PhoneRevealModal } from "./components/PhoneReveal";

const root = document.getElementById("root");
if (!root) {
  throw new Error('Missing root element with id "root"');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PhoneProvider>
          <App />
          <PhoneRevealModal />
        </PhoneProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

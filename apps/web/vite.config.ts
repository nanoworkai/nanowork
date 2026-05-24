import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

const API_TARGET = process.env.VITE_DEV_API_PROXY ?? "http://localhost:8000";

function backendProxy(): ProxyOptions {
  return {
    target: API_TARGET,
    changeOrigin: true,
    configure(proxy) {
      proxy.on("error", (_err, _req, res) => {
        if (res && "writeHead" in res && !res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "unavailable", detail: "API not running" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": backendProxy(),
      "/health": backendProxy(),
      "/webhooks": backendProxy(),
      "/internal": backendProxy(),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          stripe: ["@stripe/stripe-js"],
        },
      },
    },
  },
});

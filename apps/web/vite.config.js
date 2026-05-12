import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8787",
                changeOrigin: true,
            },
            "/health": {
                target: "http://127.0.0.1:8787",
                changeOrigin: true,
            },
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

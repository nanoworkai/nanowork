import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
/**
 * Local dev: proxy /api to FastAPI so the web app can keep using same-origin /api/* paths.
 * Production: set VITE_API_BASE_URL to your API origin (e.g. https://api.example.com) in Amplify env.
 */
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
});

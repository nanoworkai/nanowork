#!/usr/bin/env bun
import { join } from 'path';
import { readFileSync } from 'fs';
const PORT = 5173;
const WORKER_URL = 'http://127.0.0.1:8787';
console.log(`🚀 Starting Bun dev server on port ${PORT}...`);
// Read index.html template
const indexHtmlPath = join(import.meta.dir, 'index.html');
const indexHtml = readFileSync(indexHtmlPath, 'utf-8');
const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        // Proxy API and health endpoints to worker
        if (url.pathname.startsWith('/api') || url.pathname === '/health') {
            try {
                const workerUrl = `${WORKER_URL}${url.pathname}${url.search}`;
                const response = await fetch(workerUrl, {
                    method: req.method,
                    headers: req.headers,
                    body: req.body,
                });
                return response;
            }
            catch (error) {
                console.error('Proxy error:', error);
                return new Response('Proxy error', { status: 502 });
            }
        }
        // Serve source files directly for development (TypeScript/JSX)
        if (url.pathname.startsWith('/src/')) {
            const filePath = join(import.meta.dir, url.pathname.slice(1));
            const file = Bun.file(filePath);
            if (await file.exists()) {
                const content = await file.text();
                return new Response(content, {
                    headers: {
                        'Content-Type': url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')
                            ? 'application/javascript'
                            : url.pathname.endsWith('.css')
                                ? 'text/css'
                                : 'application/javascript',
                    },
                });
            }
        }
        // Serve static files from public directory
        if (url.pathname !== '/') {
            const publicPath = join(import.meta.dir, 'public', url.pathname.slice(1));
            const publicFile = Bun.file(publicPath);
            if (await publicFile.exists()) {
                return new Response(publicFile);
            }
        }
        // Serve index.html for all other routes (SPA)
        return new Response(indexHtml, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    },
});
console.log(`✅ Dev server running at http://localhost:${PORT}`);
console.log(`🔄 Proxying /api and /health to ${WORKER_URL}`);
console.log(`\n📝 Note: Run your worker separately with: npm run dev:worker`);

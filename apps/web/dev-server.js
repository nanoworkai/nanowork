#!/usr/bin/env bun
import { join } from 'path';
import { readFileSync } from 'fs';
import { spawn } from 'child_process';
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
        // Serve source files with transpilation for development (TypeScript/JSX)
        if (url.pathname.startsWith('/src/')) {
            const filePath = join(import.meta.dir, url.pathname.slice(1));
            const file = Bun.file(filePath);
            if (await file.exists()) {
                // For TypeScript/JSX files, transpile them
                if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.jsx')) {
                    try {
                        const transpiled = await Bun.build({
                            entrypoints: [filePath],
                            target: 'browser',
                            format: 'esm',
                            minify: false,
                            sourcemap: 'inline',
                        });
                        if (transpiled.outputs[0]) {
                            const jsCode = await transpiled.outputs[0].text();
                            return new Response(jsCode, {
                                headers: {
                                    'Content-Type': 'application/javascript',
                                    'Cache-Control': 'no-cache',
                                },
                            });
                        }
                    }
                    catch (error) {
                        console.error(`Transpilation error for ${url.pathname}:`, error);
                        return new Response(`// Transpilation error: ${error}`, {
                            status: 500,
                            headers: { 'Content-Type': 'application/javascript' },
                        });
                    }
                }
                // For CSS files, process with PostCSS/Tailwind if needed
                if (url.pathname.endsWith('.css')) {
                    try {
                        const content = await file.text();
                        // Check if CSS needs PostCSS processing (has @tailwind directives)
                        if (content.includes('@tailwind') || content.includes('@apply')) {
                            // Use Bun to process CSS with PostCSS
                            const proc = spawn('bunx', ['postcss', filePath], {
                                cwd: import.meta.dir,
                                stdio: ['pipe', 'pipe', 'pipe'],
                            });
                            const chunks = [];
                            const errorChunks = [];
                            proc.stdout.on('data', (chunk) => chunks.push(chunk));
                            proc.stderr.on('data', (chunk) => errorChunks.push(chunk));
                            const processedCss = await new Promise((resolve, reject) => {
                                proc.on('close', (code) => {
                                    if (code === 0) {
                                        resolve(Buffer.concat(chunks).toString('utf-8'));
                                    }
                                    else {
                                        const error = Buffer.concat(errorChunks).toString('utf-8');
                                        console.error('PostCSS error:', error);
                                        reject(new Error(error));
                                    }
                                });
                            });
                            return new Response(processedCss, {
                                headers: {
                                    'Content-Type': 'text/css',
                                    'Cache-Control': 'no-cache',
                                },
                            });
                        }
                        // Return raw CSS if no processing needed
                        return new Response(content, {
                            headers: {
                                'Content-Type': 'text/css',
                                'Cache-Control': 'no-cache',
                            },
                        });
                    }
                    catch (error) {
                        console.error(`CSS processing error for ${url.pathname}:`, error);
                        return new Response(`/* CSS processing error: ${error} */`, {
                            status: 500,
                            headers: { 'Content-Type': 'text/css' },
                        });
                    }
                }
                // For other files, serve as-is
                const content = await file.text();
                return new Response(content, {
                    headers: {
                        'Content-Type': 'application/javascript',
                        'Cache-Control': 'no-cache',
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

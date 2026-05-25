#!/usr/bin/env bun

import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';

const PORT = 5173;
const WORKER_URL = 'http://127.0.0.1:8787';

// Load environment variables
const envPath = join(import.meta.dir, '../../.env-backup/.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Create import.meta.env object for Vite compatibility
const importMetaEnv: Record<string, string> = {
  MODE: 'development',
  DEV: 'true',
  PROD: 'false',
  SSR: 'false',
};

// Add all VITE_ prefixed env vars
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('VITE_')) {
    importMetaEnv[key] = value || '';
  }
});

// Add Supabase vars with VITE_ prefix
if (process.env.SUPABASE_URL) {
  importMetaEnv['VITE_SUPABASE_URL'] = process.env.SUPABASE_URL;
}
if (process.env.SUPABASE_ANON_KEY) {
  importMetaEnv['VITE_SUPABASE_ANON_KEY'] = process.env.SUPABASE_ANON_KEY;
}

console.log(`🚀 Starting Bun dev server on port ${PORT}...`);
console.log(`🔧 Loaded ${Object.keys(importMetaEnv).length} environment variables`);

// Path to index.html (will be read on each request for dev hot-reload)
const indexHtmlPath = join(import.meta.dir, 'index.html');

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
      } catch (error) {
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
              define: {
                // Inject import.meta.env values as string literals
                ...Object.entries(importMetaEnv).reduce((acc, [key, value]) => {
                  acc[`import.meta.env.${key}`] = JSON.stringify(value);
                  return acc;
                }, {} as Record<string, string>),
                'import.meta.env': JSON.stringify(importMetaEnv),
              },
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
          } catch (error) {
            console.error(`Transpilation error for ${url.pathname}:`, error);
            return new Response(`// Transpilation error: ${error}`, {
              status: 500,
              headers: { 'Content-Type': 'application/javascript' },
            });
          }
        }

        // For CSS files with Tailwind directives, process with Tailwind CLI
        if (url.pathname.endsWith('.css')) {
          const content = await file.text();

          // Check if CSS needs Tailwind processing
          if (content.includes('@tailwind') || content.includes('@apply')) {
            try {
              // Use Tailwind CLI to process CSS
              const proc = spawn('tailwindcss', [
                '-i', filePath,
                '--config', join(import.meta.dir, 'tailwind.config.js'),
                '--minify'
              ], {
                cwd: import.meta.dir,
              });

              const chunks: Buffer[] = [];
              const errorChunks: Buffer[] = [];

              proc.stdout.on('data', (chunk) => chunks.push(chunk));
              proc.stderr.on('data', (chunk) => errorChunks.push(chunk));

              const processedCss = await new Promise<string>((resolve, reject) => {
                proc.on('close', (code) => {
                  if (code === 0) {
                    resolve(Buffer.concat(chunks).toString('utf-8'));
                  } else {
                    const error = Buffer.concat(errorChunks).toString('utf-8');
                    reject(new Error(error));
                  }
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                  proc.kill();
                  reject(new Error('Tailwind processing timeout'));
                }, 10000);
              });

              return new Response(processedCss, {
                headers: {
                  'Content-Type': 'text/css',
                  'Cache-Control': 'no-cache',
                },
              });
            } catch (error) {
              console.error(`Tailwind processing error for ${url.pathname}:`, error);
              // Return error but don't crash
              return new Response(`/* Tailwind processing error: ${error} */\n${content}`, {
                headers: {
                  'Content-Type': 'text/css',
                  'Cache-Control': 'no-cache',
                },
              });
            }
          }

          // Return raw CSS if no Tailwind directives
          return new Response(content, {
            headers: {
              'Content-Type': 'text/css',
              'Cache-Control': 'no-cache',
            },
          });
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
    // Read fresh HTML on each request for dev hot-reload
    const indexHtml = readFileSync(indexHtmlPath, 'utf-8');
    return new Response(indexHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  },
});

console.log(`✅ Dev server running at http://localhost:${PORT}`);
console.log(`🔄 Proxying /api and /health to ${WORKER_URL}`);
console.log(`\n📝 Note: Run your worker separately with: npm run dev:worker`);

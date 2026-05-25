#!/usr/bin/env bun
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
const distDir = join(import.meta.dir, 'dist');
const publicDir = join(import.meta.dir, 'public');
const indexHtmlPath = join(import.meta.dir, 'index.html');
const srcCssPath = join(import.meta.dir, 'src', 'index.css');
const processedCssPath = join(import.meta.dir, 'dist', 'processed.css');
// Clean dist directory
if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });
console.log('🏗️  Building with Bun...');
// Process CSS through Tailwind CLI if it contains directives
const cssContent = await Bun.file(srcCssPath).text();
const needsTailwindProcessing = cssContent.includes('@tailwind') || cssContent.includes('@apply');
if (needsTailwindProcessing) {
    console.log('⚡ Processing Tailwind CSS...');
    const proc = spawn('tailwindcss', [
        '-i', srcCssPath,
        '-o', processedCssPath,
        '--config', join(import.meta.dir, 'tailwind.config.js'),
        '--minify'
    ], {
        cwd: import.meta.dir,
    });
    const errorChunks = [];
    proc.stderr.on('data', (chunk) => errorChunks.push(chunk));
    const exitCode = await new Promise((resolve, reject) => {
        proc.on('close', (code) => resolve(code || 0));
        proc.on('error', (error) => reject(error));
        // Timeout after 30 seconds
        setTimeout(() => {
            proc.kill();
            reject(new Error('Tailwind processing timeout'));
        }, 30000);
    });
    if (exitCode !== 0) {
        const error = Buffer.concat(errorChunks).toString('utf-8');
        console.error('❌ Tailwind processing failed:', error);
        process.exit(1);
    }
    console.log('✅ Tailwind CSS processed');
}
// Create import.meta.env object from environment variables
const importMetaEnv = {
    MODE: process.env.NODE_ENV || 'production',
    DEV: 'false',
    PROD: 'true',
    SSR: 'false',
};
// Add all VITE_ prefixed env vars from process.env
Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith('VITE_')) {
        importMetaEnv[key] = value || '';
    }
});
console.log(`📝 Injecting ${Object.keys(importMetaEnv).length} environment variables into build`);
// Build the application with processed CSS
const entrypoints = needsTailwindProcessing
    ? ['./src/main.tsx', './dist/processed.css']
    : ['./src/main.tsx'];
const result = await Bun.build({
    entrypoints,
    outdir: './dist',
    minify: true,
    sourcemap: 'external',
    splitting: true,
    target: 'browser',
    naming: {
        entry: '[dir]/[name]-[hash].[ext]',
        chunk: '[name]-[hash].[ext]',
        asset: 'assets/[name]-[hash].[ext]',
    },
    external: [],
    define: {
        // Inject import.meta.env values as string literals at build time
        ...Object.entries(importMetaEnv).reduce((acc, [key, value]) => {
            acc[`import.meta.env.${key}`] = JSON.stringify(value);
            return acc;
        }, {}),
        'import.meta.env': JSON.stringify(importMetaEnv),
    },
});
if (!result.success) {
    console.error('❌ Build failed');
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}
console.log('✅ Build successful');
// Copy public assets
if (existsSync(publicDir)) {
    console.log('📦 Copying public assets...');
    cpSync(publicDir, distDir, { recursive: true });
}
// Find built assets
const distFiles = readdirSync(distDir);
const jsFile = distFiles.find(f => f.startsWith('main-') && f.endsWith('.js'));
const cssFile = distFiles.find(f => f.startsWith('processed-') && f.endsWith('.css'));
if (!jsFile) {
    console.error('❌ Could not find built JavaScript file');
    process.exit(1);
}
if (!cssFile) {
    console.error('❌ Could not find built CSS file');
    process.exit(1);
}
// Generate index.html with updated asset references
console.log('📝 Generating index.html...');
const indexTemplate = await Bun.file(indexHtmlPath).text();
const updatedIndex = indexTemplate
    .replace('<script type="module" src="/src/main.tsx"></script>', `<script type="module" src="/${jsFile}"></script>`)
    .replace('<link rel="stylesheet" href="/src/index.css" />', `<link rel="stylesheet" href="/${cssFile}" />`);
writeFileSync(join(distDir, 'index.html'), updatedIndex);
console.log('🎉 Build complete!');
console.log(`📦 Output: ${distDir}`);

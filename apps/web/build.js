#!/usr/bin/env bun
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
const distDir = join(import.meta.dir, 'dist');
const publicDir = join(import.meta.dir, 'public');
const indexHtmlPath = join(import.meta.dir, 'index.html');
// Clean dist directory
if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });
console.log('🏗️  Building with Bun...');
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
// Build the application
const result = await Bun.build({
    entrypoints: ['./src/main.tsx'],
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
// Find the built JS file
const distFiles = readdirSync(distDir);
const jsFile = distFiles.find(f => f.startsWith('main-') && f.endsWith('.js'));
if (!jsFile) {
    console.error('❌ Could not find built JavaScript file');
    process.exit(1);
}
// Generate index.html
console.log('📝 Generating index.html...');
const indexTemplate = await Bun.file(indexHtmlPath).text();
const updatedIndex = indexTemplate.replace('<script type="module" src="/src/main.tsx"></script>', `<script type="module" src="/${jsFile}"></script>`);
writeFileSync(join(distDir, 'index.html'), updatedIndex);
console.log('🎉 Build complete!');
console.log(`📦 Output: ${distDir}`);

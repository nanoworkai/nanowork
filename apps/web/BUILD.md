# Build System Documentation

This document explains the build system for the Nanowork web application.

## Overview

The app uses **Bun** as the build tool and runtime, with **Tailwind CSS** for styling. Both development and production builds use the same CSS processing approach via the Tailwind CLI.

## Key Build Files

- `build.ts` - Production build script
- `dev-server.ts` - Development server with hot reload
- `package.json` - Scripts and dependencies
- `tailwind.config.js` - Tailwind configuration

## Build Process

### Development (`npm run dev`)

The dev server (`dev-server.ts`) provides:
- Hot reload on file changes
- TypeScript/JSX transpilation on-the-fly
- **Tailwind CSS processing via CLI** for files containing `@tailwind` or `@apply` directives
- API proxying to worker (port 8787)
- Serves at `http://localhost:5173`

### Production (`npm run build`)

The production build (`build.ts`) performs:

1. **CSS Processing** - Processes `src/index.css` through Tailwind CLI if it contains directives
   - Input: `src/index.css`
   - Output: `dist/processed.css` (minified)
   - Uses `tailwind.config.js` for configuration

2. **JavaScript Bundle** - Builds with Bun
   - Entry: `src/main.tsx`
   - Includes processed CSS as entry point
   - Minifies and splits code
   - Generates hashed filenames for cache busting

3. **Static Assets** - Copies `public/` directory to `dist/`

4. **HTML Generation** - Updates `index.html` with:
   - Hashed JS filename (`main-[hash].js`)
   - Hashed CSS filename (`processed-[hash].css`)

### Build Verification (`npm run verify-build`)

Runs the build and verifies:
- Build completes successfully
- `dist/index.html` exists
- HTML references the processed CSS file

## CSS Processing Details

Both dev and production use **Tailwind CLI** to process CSS. This ensures consistency between environments.

**Why Tailwind CLI?**
- Handles `@tailwind` directives (`base`, `components`, `utilities`)
- Processes `@apply` statements in custom utilities
- Applies PostCSS transformations (autoprefixer, etc.)
- Generates only the CSS classes actually used in the codebase

**Process:**
```bash
tailwindcss -i src/index.css -o dist/processed.css --config tailwind.config.js --minify
```

This was implemented to fix a production bug where CSS wasn't being processed, causing missing styles.

## Environment Variables

The build injects environment variables at build time:

- All `VITE_*` prefixed variables from `process.env`
- Build metadata: `MODE`, `DEV`, `PROD`, `SSR`

Access in code via `import.meta.env.VITE_*`

## Dependencies

**CSS Processing:**
- `tailwindcss` - Tailwind CSS framework (must be available as CLI)
- `postcss` - CSS transformations
- `autoprefixer` - Vendor prefixes

**Build:**
- `bun` - Build tool and runtime
- TypeScript for type checking

## Common Issues

### Missing Styles in Production

**Symptom:** Styles work in dev but not in production build.

**Cause:** CSS file doesn't include processed Tailwind output.

**Solution:** Ensure `tailwindcss` is installed and available in PATH. The build script will fail if Tailwind processing fails.

### Build Script Location

The `build` script in `package.json` must point to `build.ts`:
```json
"build": "bun run build.ts"
```

### Tailwind Not Found

If you see "tailwindcss: command not found":
```bash
npm install
# or
bun install
```

Ensure `tailwindcss` is in dependencies (not devDependencies) since it's used at runtime via CLI.

## Scripts Reference

```json
{
  "dev": "bun run --watch dev-server.ts",        // Start dev server with hot reload
  "build": "bun run build.ts",                   // Build for production
  "start": "serve -s dist -l 3000",              // Serve production build
  "preview": "bun run --watch dev-server.ts",    // Preview mode (same as dev)
  "verify-build": "bun run build.ts && ...",     // Build and verify CSS processing
  "typecheck": "tsc -b"                          // Type check without building
}
```

## Architecture Notes

- **No Vite**: Previously used Vite, now using Bun directly for faster builds
- **CSS-in-JS avoided**: Uses Tailwind for maintainable, consistent styling
- **Dev/Prod parity**: Both environments use Tailwind CLI for CSS processing
- **Hash-based caching**: Production files include content hashes for cache invalidation

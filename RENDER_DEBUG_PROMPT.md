# Render Deployment Debug Prompt

Copy and paste this into Claude Code:

---

The app works perfectly on localhost but fails to deploy on Render. The frontend static site triggers but never goes live. Do the following:

**Step 1 — Print the exact Render environment:**
```bash
# What Node version is Render using vs local?
node --version
npm --version

# What does the build output look like?
rm -rf apps/web/dist
cd apps/web && npm install && npm run build 2>&1
echo "Exit code: $?"
ls -la dist/
ls -la dist/assets/
```

**Step 2 — Check for a `_redirects` or `_headers` file missing:**
```bash
ls -la apps/web/dist/
cat apps/web/dist/_redirects 2>/dev/null || echo "NO _redirects FILE"
cat apps/web/public/_redirects 2>/dev/null || echo "NO public/_redirects FILE"
```

**Step 3 — Render static sites require a `_redirects` file for React Router. Create it:**
```bash
echo "/* /index.html 200" > apps/web/public/_redirects
```

**Step 4 — Check `vite.config.ts` for anything that could break on Render:**
```bash
cat apps/web/vite.config.ts
```
Look for hardcoded localhost URLs, incorrect base paths, or missing env var handling.

**Step 5 — Check all `VITE_` env vars are set on the Render static site service:**
```bash
grep -r "import.meta.env\." apps/web/src/ --include="*.ts" --include="*.tsx" | grep -o 'VITE_[A-Z_]*' | sort -u
```
Every `VITE_` variable found must be set in **Render → static site → Environment**.

**Step 6 — Ensure `render.yaml` static site config is correct:**
```bash
cat render.yaml | grep -A 15 "type: static"
```

**Step 7 — Commit and push:**
```bash
git add -A
git commit -m "fix: add _redirects for React Router on Render static site"
git push origin main
```

After deploying, open Render static site build logs and paste the last 20 lines here.

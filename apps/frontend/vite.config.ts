import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type LocalAdminBypass = {
  enabled?: boolean
  customerId?: string
  adminEmail?: string
  adminPassword?: string
}

function loadLocalAdminBypass() {
  const bypassPath = path.resolve(__dirname, 'admin-bypass.local')

  if (!fs.existsSync(bypassPath)) {
    return null
  }

  try {
    const fileContents = fs.readFileSync(bypassPath, 'utf8')
    const parsed = JSON.parse(fileContents) as LocalAdminBypass

    if (!parsed.enabled || !parsed.customerId) {
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to load admin bypass file:', error)
    return null
  }
}

function localAdminBypassPlugin() {
  return {
    name: 'local-admin-bypass',
    transformIndexHtml(html: string) {
      const bypass = loadLocalAdminBypass()

      if (!bypass) {
        return html
      }

      const injectedContext = JSON.stringify({
        customerId: bypass.customerId,
        adminEmail: bypass.adminEmail ?? '',
        adminPassword: bypass.adminPassword ?? '',
      })

      return html.replace(
        '</head>',
        `<script>
          window.__NANOWORK_CONTEXT__ = {
            ...(window.__NANOWORK_CONTEXT__ || {}),
            ...${injectedContext},
          };
        </script></head>`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), command === 'serve' ? localAdminBypassPlugin() : null].filter(Boolean),
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
}))

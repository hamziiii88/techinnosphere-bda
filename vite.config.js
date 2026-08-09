import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
//
// Custom local hostname:
//   The dev server is reachable at http://techinnosphere-automation:5173/
//   instead of http://localhost:5173/ once you add this line to
//   C:\Windows\System32\drivers\etc\hosts (needs Administrator):
//
//     127.0.0.1  techinnosphere-automation
//
//   Hostnames can't contain spaces, so "TechInnoSphere Automation" becomes
//   the hyphenated form above. localhost:5173 keeps working either way.
// GitHub Pages serves project sites from a subpath
// (https://<user>.github.io/<repo>/), so every absolute asset URL needs that
// prefix at build time. Local dev keeps '/' so localhost:5173 is unaffected.
// If you later attach a custom domain (e.g. www.techinnosphere.com) via a
// CNAME file in public/, change BASE_PATH back to '/' and redeploy.
const BASE_PATH = process.env.GITHUB_PAGES === 'true' ? '/techinnosphere-bda/' : '/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'apple-touch-icon.png'],
      manifest: {
        id: BASE_PATH,
        name: 'TechInnoSphere BDA Automation',
        short_name: 'TechInnoSphere',
        description: 'TechInnoSphere BDA Platform — Lead Directory, Cold Call Hub, Email Pitching, WhatsApp Outreach & Director EOD Reporting.',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: 'standalone',
        // "any" (not "portrait") so the installed app works properly on
        // laptops/tablets in landscape, not just phones held upright.
        orientation: 'any',
        background_color: '#0b0f19',
        theme_color: '#0b0f19',
        categories: ['business', 'productivity'],
        icons: [
          { src: `${BASE_PATH}icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE_PATH}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${BASE_PATH}icon-192-maskable.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: `${BASE_PATH}icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Precache the built app shell (HTML/JS/CSS/icons) so the installed
        // app opens instantly and doesn't show a blank/error screen offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        // NEVER cache the email/tracking API (email-server.cjs, port 3001) or
        // any other cross-origin request — sending mail and reading tracking
        // status must always hit the live server, never a stale cached copy.
        navigateFallbackDenylist: [/^\/track\//, /:3001/],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => !sameOrigin || url.port === '3001',
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: {
        // Also register the service worker under `npm run dev`, so phone/
        // tablet testing during development gets the same installable
        // behavior as the production build.
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})

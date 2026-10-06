import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Vitest loads this file too — skip the PWA plugin entirely in tests.
const pwaPlugins = process.env.VITEST
  ? []
  : [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/apple-touch-icon.png'],
        manifest: {
          name: 'AERO2687 · Aerospace Study Web',
          short_name: 'Aero Study',
          description:
            'AERO2687 — Introduction to Aerospace Engineering: interactive 3D formula & variable web, exam radar, quizzes. Liquid-glass study tool.',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'any',
          background_color: '#070c18',
          theme_color: '#070c18',
          icons: [
            { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: 'index.html',
          globPatterns: ['**/*.{js,mjs,css,html,svg,png,woff2}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-files', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
          ],
        },
      }),
    ]

export default defineConfig({
  base: './',
  plugins: pwaPlugins,
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          graph: ['3d-force-graph'],
          katex: ['katex'],
          react: ['react', 'react-dom'],
          zip: ['jszip'],
          pdf: ['pdfjs-dist'],
        },
      },
    },
  },
  test: {
    globals: true,
  },
})

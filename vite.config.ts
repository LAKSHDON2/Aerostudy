import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
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

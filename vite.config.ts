import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    // Relative base so the same build works at a domain root (Vercel / onlytok.uk)
    // AND under a subpath (GitHub Pages project site at /OnlyTok/).
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Allow the Arena/E2B sandbox preview host plus local development.
      allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    },
    build: {
      // Split the large Firebase/admin chunk from the public app bundle.
      chunkSizeWarningLimit: 700,
    },
  };
});

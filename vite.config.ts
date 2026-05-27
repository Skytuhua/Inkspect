import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is './' so the built site works both at a domain root and from a
// subpath (e.g. GitHub Pages project pages) and when opened from a file path.
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/bhoj360/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/r': {
        target: 'http://localhost:4000',
        ws: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    },
  },
});

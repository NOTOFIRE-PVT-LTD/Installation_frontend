import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // EC2 serves Workspace under http://HOST/ws/ — set VITE_BASE_PATH=/ws/ for that build.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

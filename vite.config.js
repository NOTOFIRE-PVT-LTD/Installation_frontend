import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // EC2 serves Workspace under /ws/ — set VITE_BASE_PATH=/ws/ in .env for that build.
  const base = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/';
  return {
    base,
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
  };
});

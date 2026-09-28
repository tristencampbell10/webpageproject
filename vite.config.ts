import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'src',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN || 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
});

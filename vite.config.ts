import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://middlewarejd-cnbqcdhyccb2d5du.mexicocentral-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

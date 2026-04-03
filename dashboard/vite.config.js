import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'dashboard',
  server: {
    proxy: {
      '/api/transactions': {
        target: 'http://localhost:3847',
      },
    },
  },
});

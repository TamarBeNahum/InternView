import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
     
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'date-fns',
      'firebase/app',
      'firebase/analytics',
      'firebase/database',
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/], // Ensures all commonjs dependencies are included
    },
  },
});

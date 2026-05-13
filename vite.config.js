import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Port 3000 is required by the environment
    port: 3000,
    strictPort: true,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  // Ensure that node internals are not bundled for the browser
  build: {
    outDir: 'dist',
  }
});

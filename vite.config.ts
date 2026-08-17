import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Forces relative file asset paths so Cloudflare reads the bundle perfectly
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});

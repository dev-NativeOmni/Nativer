import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  // Relative base allows seamless deployment on both GitHub Pages and Cloudflare Pages/Workers
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});

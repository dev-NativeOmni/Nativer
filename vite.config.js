import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base so deployment to GitHub Pages (subpath) works out of the box
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

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@reduxjs/toolkit']
        }
      }
    }
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    global: 'globalThis'
  },
  
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  
  esbuild: {
    target: 'es2020'
  }
});
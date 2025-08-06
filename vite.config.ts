import { defineConfig } from 'vite';

export default defineConfig({
  // Configurar correctamente los directorios
  publicDir: 'public',
  
  server: {
    port: 3000,
    open: true,
    hmr: {
      // Configurar HMR para evitar conflictos
      overlay: false
    }
  },
  
  build: {
    // Configurar el directorio de salida
    outDir: 'dist',
    // Configurar el directorio público
    assetsDir: 'assets',
    // Configuración de rollup mejorada
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors para mejor caching
          vendor: ['@reduxjs/toolkit']
        }
      }
    }
  },
  
  define: {
    // Variables de entorno para evitar warnings
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
    // Asegurar que import.meta.env esté disponible
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  
  // Resolver alias para evitar conflictos
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // Configuración mejorada para desarrollo
  esbuild: {
    target: 'es2020',
    keepNames: true
  },
  
  // Configuración para el Service Worker
  worker: {
    format: 'es'
  }
});
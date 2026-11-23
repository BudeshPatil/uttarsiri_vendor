import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// The dashboard is served from a sub-path on staging/production
// (https://innoventies.com/admin) but from the root in dev.
// VITE_BASE_PATH drives Vite's `base`, which in turn feeds import.meta.env.BASE_URL,
// the router basename and the hard redirects in src/lib/apiClient.js.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 4303,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5004',
          changeOrigin: true,
          secure: false,
        },
        '/public': {
          target: 'http://localhost:5004',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4303,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5004',
          changeOrigin: true,
          secure: false,
        },
        '/public': {
          target: 'http://localhost:5004',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'build',
    },
  };
});

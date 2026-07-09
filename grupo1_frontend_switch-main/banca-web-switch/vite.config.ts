import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api/core': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
      '/api/switch': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
      '/api/buzon': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/buzon/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});

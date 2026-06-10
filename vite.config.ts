import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        },
        // Exclude data files from Vite's file watcher.
        // The admin server writes to public/data/*.json on every save;
        // without this, Vite detects those writes and triggers a full page
        // reload, which breaks the ProductDetail page (shows 'Not Found').
        watch: {
          ignored: ['**/public/data/**', '**/data/backup.json', '**/data/collections.json']
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        assetsInlineLimit: 4096, // Inline assets under 4KB to save HTTP requests
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name].[hash][extname]',
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
                if (id.includes('framer-motion')) {
                  return 'vendor-framer';
                }
                if (id.includes('gsap')) {
                  return 'vendor-gsap';
                }
                if (id.includes('lucide-react')) {
                  return 'vendor-lucide';
                }
                return 'vendor-core'; // react, react-dom, react-router-dom, etc.
              }
            }
          }
        }
      }
    };
});

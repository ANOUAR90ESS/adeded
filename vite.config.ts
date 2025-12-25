import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Upload source maps to Sentry in production
        isProduction && sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          authToken: env.SENTRY_AUTH_TOKEN,
        }),
      ].filter(Boolean),
      define: {
        // SECURITY: DO NOT expose API keys to frontend
        // All Gemini API calls should go through /api/gemini proxy
        // 'process.env.GEMINI_API_KEY': undefined (removed for security)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: false, // SECURITY: Disable source maps in production (prevents code inspection)
        minify: 'terser', // Use Terser for better minification and obfuscation
        terserOptions: {
          compress: {
            drop_console: true, // Remove all console.log in production
            drop_debugger: true, // Remove debugger statements
          },
          mangle: {
            // Mangle variable names to make code harder to read
            safari10: true,
          },
        },
      }
    };
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isDisableHmr = process.env.DISABLE_HMR === 'true' || process.env.NODE_ENV === 'production';
  const hmrHost = process.env.HMR_HOST || process.env.SERVICE_URL || undefined;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: isDisableHmr ? false : {
        protocol: 'wss',
        clientPort: 443,
        host: hmrHost,
        overlay: false,
      },
      watch: isDisableHmr ? null : {},
    },
  };
});


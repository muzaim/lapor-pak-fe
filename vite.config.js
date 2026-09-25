import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || env.PORT || '5173', 10);
  const targetServer = env.VITE_SERVER_URL || 'http://localhost:3000';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: port,
      proxy: {
        '/api': {
          target: targetServer,
          changeOrigin: true,
        },
        '/uploads': {
          target: targetServer,
          changeOrigin: true,
        }
      }
    }
  };
});

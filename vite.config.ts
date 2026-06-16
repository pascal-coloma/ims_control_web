import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ims': {
        target: 'https://api.imsambulancias.cl',
        changeOrigin: true,
      },
    },
  },
})

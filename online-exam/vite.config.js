import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',   // This ensures relative paths for Netlify deployment
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://online-examination-6.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  server: {
    proxy: {
      '/api': { // This captures all requests starting with /api
        target: 'http://localhost:5004', // <-- Make sure this matches your backend's port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // This line is usually redundant if /api is also the backend's base path, but harmless.
      },
    }
  }
 
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert' // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert({ // Add the plugin with configuration options
      host: 'localhost', // The hostname for the development server
      port: 443, // The port for the HTTPS server, 443 is the default HTTPS port
      open: true // Open the browser automatically when the server starts
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

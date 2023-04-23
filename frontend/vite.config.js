import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert' // Import the plugin
import fs from 'fs'

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
        secure: false, // Allow self-signed certificates
        rewrite: (path) => path.replace(/^\/api/, ''),
        timeout: 10000
      },
      '/v1': {
        target: 'https://127.0.0.1:5100/api', // Use HTTPS
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        rewrite: (path) => path.replace(/^\/v1/, '')
      }
    }
  }  
})

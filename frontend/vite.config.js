import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Los .riv son binarios: Vite debe emitirlos como asset, no parsearlos.
  assetsInclude: ['**/*.riv'],
  server: {
    host: true, 
    allowedHosts: true, 
  }
})

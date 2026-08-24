import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/cv-creator/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,
    strictPort: true,
    open: true,
  },
})

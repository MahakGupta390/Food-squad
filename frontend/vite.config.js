import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './', // Ensures it looks in the current directory
  build: {
    outDir: 'dist',
  }
})

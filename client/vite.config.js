import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],  // Explicitly optimize react and react-dom
  },
  plugins: [react()],
  test: {
    environment:'jsdom',
    setupFiles:'./setupTests.js'
  }
})

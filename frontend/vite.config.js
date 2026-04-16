import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    hmr: {
      clientPort: 443, // Memaksa HMR menggunakan port HTTPS
      host: 'd34f3d5l-5173.asse.devtunnels.ms', // Masukkan link tunnel Anda di sini
    },
  },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), // Plugin para Vue
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias para importar desde src fácilmente
    },
  },

  server: {
    host: '0.0.0.0',   // 👈 Escuchar en todas las interfaces (accesible desde tu red)
    port: 5173,        // 👈 (Opcional) Puedes cambiar el puerto si lo deseas
  },
})

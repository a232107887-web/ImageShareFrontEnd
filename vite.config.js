import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://imagesharebackend-a9bahdacgugcg5bd.francecentral-01.azurewebsites.net',
        changeOrigin: true,
        secure: true
      }
    }
  }
})





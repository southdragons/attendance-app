import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base:  '/attendance-app/',
  plugins: [vue()],
})
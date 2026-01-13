import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from "node:path"

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 12345,
    open: false
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/components/Crontab.vue'),
      name: 'VueCrontab',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})

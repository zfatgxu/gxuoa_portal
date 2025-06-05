// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 路径别名设置
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/app-api': {
        target: 'http://172.19.97.157:48080',
        changeOrigin: true,
        rewrite: (path) => {
          // 如果路径中包含 /system，就把 /app-api 替换成 /admin-api
          if (path.includes('/system/')) {
            console.log('原始路径：', path);
            const newPath = path.replace(/^\/app-api/, '/admin-api');
            console.log('重写后路径：', newPath);
            return newPath;
          }
          return path;
        }
      }
    }    
  }
})

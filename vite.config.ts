// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// 使用动态导入方式引入 UnoCSS
export default defineConfig(async () => {
  const UnoCSS = (await import('unocss/vite')).default

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()], 
      }),
      UnoCSS(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]', 
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 路径别名设置
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;'
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/app-api': {
          // target: 'http://172.19.97.157:48080',
          target: 'http://127.0.0.1:48080',
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
  }
})

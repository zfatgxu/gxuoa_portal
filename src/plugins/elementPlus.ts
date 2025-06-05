import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import type { App } from 'vue'

// 配置Element Plus，使用中文语言包
export function setupElementPlus(app: App) {
  app.use(ElementPlus, {
    locale: zhCn, // 设置语言为中文
    size: 'default', // 设置组件默认尺寸
    zIndex: 3000 // 设置弹框层级
  })
}

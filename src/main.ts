import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from '@/store'
// import { setupDirectives } from '@/directives' // 目录不存在，暂时注释

// 引入token刷新管理器
import { initTokenRefresh } from '@/utils/tokenRefresh'

// 引入样式文件
import './assets/css/meeting.css'
import './assets/styles/loading.css'
import './assets/styles/meeting-form.css'
import './assets/styles/meeting-topics.css'

// 引入 bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 引入全局样式
import '@/styles/index.scss'

// 引入文档样式
import '@/styles/document.css'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'  

// 全局组件
// import { setupGlobCom } from '@/components' // 可能没有导出此函数，暂时注释

// 引入 element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入 form-create
//import { setupFormCreate } from '@/plugins/formCreate'

// 引入动画库
import 'animate.css'

// 引入 Uno.css
import 'uno.css'
// 引入 SVG 图标
import 'virtual:svg-icons-register'

// 使用异步函数初始化应用
const bootstrap = async () => {
  const app = createApp(App)
  // 使用路由
  app.use(router)
  // 初始化 i18n
  await setupI18n(app)

  
   
  // 初始化Element Plus并设置为中文
  setupElementPlus(app)
  // 初始化 store
  app.use(store)
  // 初始化全局组件
  // setupGlobCom(app) // 暂时注释
  // 初始化 form-create
  //setupFormCreate(app)
  
  // 初始化token刷新管理器（如果用户已登录）
  initTokenRefresh()
  
  app.mount('#app')
}

bootstrap()

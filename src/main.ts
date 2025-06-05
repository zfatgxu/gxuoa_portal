import { createApp } from 'vue'
import App from './App.vue'
// 导入路由配置
import router from './router'

// 导入样式文件
import './assets/css/meeting.css'
import './assets/styles/loading.css'
import './assets/styles/meeting-form.css'
import './assets/styles/meeting-topics.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { setupI18n } from '@/plugins/vueI18n'
// 导入Element Plus中文配置
import { setupElementPlus } from '@/plugins/elementPlus'

// 使用异步函数初始化应用
const bootstrap = async () => {
  const app = createApp(App)
  // 使用路由
  app.use(router)
  // 初始化 i18n
  await setupI18n(app)
  // 初始化Element Plus并设置为中文
  setupElementPlus(app)
  app.mount('#app')
}

bootstrap()

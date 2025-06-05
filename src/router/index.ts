import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/Login.vue'
import DocumentApproval from '../views/document/DocumentApproval.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/document/approval',
    name: 'documentApproval',
    component: DocumentApproval,
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },

  {
    path: '/document/document/presentation-view/:id',
    name: 'PresentationView',
    component: () => import('@/views/document/PresentationView.vue'),
  },
  {
    path: '/document/circulation/history',
    name: 'CirculationHistory',
    component: () => import('@/views/document/circulation/history.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    if (!isLoggedIn) {
      // 未登录，重定向到登录页
      next({ name: 'login' })
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 不需要登录权限的页面
    // 如果用户已登录且尝试访问登录页，重定向到首页
    if (to.name === 'login' && localStorage.getItem('isLoggedIn') === 'true') {
      next({ name: 'home' })
    } else {
      // 其他情况正常放行
      next()
    }
  }
})

export default router

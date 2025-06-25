import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import LoginView from '../views/Login.vue'
import DocumentApproval from '../views/document/DocumentApproval.vue'
import { h } from 'vue'
import { RouterView } from 'vue-router'

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
    },
    children: [
      {
        path: '',
        redirect: '/home/default'
      },
      {
        path: 'default',
        name: 'homeDefault',
        component: () => import('@/views/home/DefaultView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'user-center',
        name: 'userCenter',
        component: () => import('@/components/User/UserCenterComponent.vue'),
        meta: { requiresAuth: true }
      },
      // 将workplace子路由移到home下
      {
        path: 'workplace',
        name: 'workplace',
        // 使用RouterView作为占位符组件，避免[object Promise]问题
        component: { render: () => h(RouterView) },
        redirect: '/home/workplace/mytodo',
        children: [
          {
            path: 'mytodo',
            name: 'workplaceMytodo',
            component: () => import('@/views/workplace/mytodo.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'myisdone',
            name: 'workplaceMyisdone',
            component: () => import('@/views/workplace/myisdone.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'myapply',
            name: 'workplaceMyapply',
            component: () => import('@/views/workplace/myapply.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'myall',
            name: 'workplaceMyall',
            component: () => import('@/views/workplace/myall.vue'),
            meta: { requiresAuth: true }
          }
        ]
      },
      // 将document子路由移到home下
      {
        path: 'document',
        name: 'document',
        // 使用RouterView作为占位符组件，避免[object Promise]问题
        component: { render: () => h(RouterView) },
        redirect: '/home/document/todo',
        children: [
          {
            path: 'todo',
            name: 'documentTodo',
            component: () => import('@/components/Document/TodoComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'alldoc',
            name: 'documentAllDoc',
            component: () => import('@/components/Document/AllDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'deptdoc',
            name: 'documentDeptDoc',
            component: () => import('@/components/Document/DeptDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'externaldoc',
            name: 'documentExternalDoc',
            component: () => import('@/components/Document/ExternalDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'favoritedoc',
            name: 'documentFavoriteDoc',
            component: () => import('@/components/Document/FavoriteDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'internaldoc',
            name: 'documentInternalDoc',
            component: () => import('@/components/Document/InternalDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'leavedoc',
            name: 'documentLeaveDoc',
            component: () => import('@/components/Document/LeaveDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          },
          {
            path: 'schooldoc',
            name: 'documentSchoolDoc',
            component: () => import('@/components/Document/SchoolDocComponent.vue'),
            meta: {
              requiresAuth: true // 需要登录才能访问
            }
          }
        ]
      }
    ]
  },
  {
    path: '/document/approval',
    name: 'documentApproval',
    component: DocumentApproval,
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

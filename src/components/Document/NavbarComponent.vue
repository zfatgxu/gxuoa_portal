<template>
  <div class="navbar">
    <div class="navbar-container">
      <!-- 左侧logo和系统名称 -->
      <div class="navbar-left">
        <div class="logo">
          <img src="../assets/logo.png" alt="Logo" v-if="logoUrl" />
          <span v-else class="logo-placeholder">GX</span>
        </div>
        <h1 class="system-title">广西大学OA系统</h1>
      </div>
      
      <!-- 中间导航菜单 -->
      <div class="navbar-center">
        <ul class="nav-menu">
          <li 
            v-for="(item, index) in menuItems" 
            :key="index" 
            :class="{ 'active': activeMenu === item.path }"
            @click="navigateTo(item.path)"
          >
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </div>
      
      <!-- 右侧用户信息和操作 -->
      <div class="navbar-right">
        <el-dropdown trigger="click">
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar">{{ userInitials }}</el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="navigateTo('/profile')">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="navigateTo('/settings')">
                <el-icon><Setting /></el-icon>系统设置
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Document, 
  Notification, 
  Setting, 
  User, 
  ArrowDown, 
  SwitchButton, 
  House, 
  Calendar, 
  ChatDotRound 
} from '@element-plus/icons-vue'

// 路由相关
const router = useRouter()
const route = useRoute()

// 菜单项配置
const menuItems = [
  { title: '首页', path: '/', icon: 'House' },
  { title: '我的待办', path: '/todo', icon: 'Document' },
  { title: '公文管理', path: '/documents', icon: 'Folder' },
  { title: '通知公告', path: '/announcements', icon: 'Notification' },
  { title: '日程安排', path: '/schedule', icon: 'Calendar' },
  { title: '消息中心', path: '/messages', icon: 'ChatDotRound' }
]

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 用户信息
const userName = ref('张三')
const userAvatar = ref('')  // 可以设置默认头像URL
const userInitials = computed(() => {
  return userName.value ? userName.value.substring(0, 1) : '用'
})

// Logo URL
const logoUrl = ref('')  // 可以设置Logo URL

// 退出登录
const handleLogout = () => {
  // 清除登录信息
  localStorage.removeItem('token')
  // 跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
}

.logo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: bold;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav-menu li {
  padding: 0 15px;
  height: 60px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.nav-menu li:hover {
  color: #409EFF;
}

.nav-menu li.active {
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
}

.nav-menu li .el-icon {
  margin-right: 5px;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}
</style>

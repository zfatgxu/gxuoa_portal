<template>
  <div>
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="menu-toggle">
        <i class="bi bi-list"></i>
      </div>
      <div class="logo">文件管理系统</div>
      <ul class="top-menu">
        <li><a href="#" class="active" @click.prevent="goToHome">首页</a></li>
        <li><a href="#">公文管理</a></li>
        <li><a href="#">流程管理</a></li>
        <li><a href="#">督查督办</a></li>
        <li><a href="#">信访工作</a></li>
        <li><a href="#">行政管理</a></li>
        <li><a href="#">文档管理</a></li>
      </ul>
      <div class="user-actions">
        <div class="icon" @click="toggleNotifications" ref="notificationIcon">
          <i class="bi bi-bell"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>
        <div class="icon">
          <i class="bi bi-envelope"></i>
          <!-- <span class="notification-badge">3</span> -->
        </div>
        <div class="icon"><i class="bi bi-gear"></i></div>
        <!-- 简化用户下拉菜单实现 -->
        <el-dropdown trigger="click">
          <div class="user-avatar" :title="userName">{{ userName[0] }}</div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToUserCenter">
                <i class="bi bi-person"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="logout">
                <i class="bi bi-box-arrow-right"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ userName }}
      </div>
    </div>

    <!-- 左侧菜单 -->
    <div class="sidebar">
      <ul class="sidebar-menu">
        <li :class="{ open: isWorkbenchOpen }">
          <a href="#" @click.prevent="toggleWorkbench">
            <span class="menu-icon"><i class="bi bi-house-door"></i></span>
            <span>工作台</span>
            <span class="arrow"><i class="bi bi-chevron-right"></i></span>
          </a>
          <ul class="submenu">
            <li><a href="#" @click.prevent="switchView('todo')" :class="{ active: currentView === 'todo' }">我的待办</a></li>
            <li><a href="#" @click.prevent="switchView('done')" :class="{ active: currentView === 'done' }">我的已办</a></li>
            <li><a href="#" @click.prevent="switchView('all')" :class="{ active: currentView === 'all' }">全部</a></li>
            <li><a href="#" @click.prevent="switchView('apply')" :class="{ active: currentView === 'apply' }">我的申请</a></li>
          </ul>
        </li>
        <li>
          <a href="#" id="doc-menu">
            <span class="menu-icon"><i class="bi bi-file-earmark-text"></i></span>
            <span>公文流转</span>
            <span class="arrow"><i class="bi bi-chevron-right"></i></span>
          </a>
          <ul class="submenu">
            <li><a href="#" @click.prevent="currentComponent = 'TodoComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'TodoComponent' }">我的待办</a></li>
            <!-- <li><a href="#" @click.prevent="currentComponent = 'MeetingDocComponent'" :class="{ active: currentComponent === 'MeetingDocComponent' }">拟上会文件</a></li> -->
            <li><a href="#" @click.prevent="currentComponent = 'InternalDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'InternalDocComponent' }">我的已签校内文件</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'ExternalDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'ExternalDocComponent' }">我的已签校外文件</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'SchoolDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'SchoolDocComponent' }">我的已签学校发文</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'LeaveDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'LeaveDocComponent' }">我的请假文件</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'DeptDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'DeptDocComponent' }">本部门文件</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'AllDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'AllDocComponent' }">我的全部公文</a></li>
            <li><a href="#" @click.prevent="currentComponent = 'FavoriteDocComponent'; isWorkbenchOpen = false" :class="{ active: currentComponent === 'FavoriteDocComponent' }">我的收藏</a></li>
          </ul>
        </li>
        <li>
          <a href="#">
            <span class="menu-icon"><i class="bi bi-folder2-open"></i></span>
            <span>文件管理</span>
            <span class="arrow"><i class="bi bi-chevron-right"></i></span>
          </a>
          <ul class="submenu">
            <li>
              <a href="#">
                <span>学校文件</span>
                <span class="arrow"><i class="bi bi-chevron-right"></i></span>
              </a>
              <ul class="submenu">
                <li><a href="#">党委文件</a></li>
                <li><a href="#">行政文件</a></li>
              </ul>
            </li>
            <li>
              <a href="#">
                <span>部门文件</span>
                <span class="arrow"><i class="bi bi-chevron-right"></i></span>
              </a>
              <ul class="submenu">
                <li><a href="#">党群行政部门</a></li>
                <li><a href="#">教学单位</a></li>
                <li><a href="#">科研单位</a></li>
                <li><a href="#">教辅单位</a></li>
                <li><a href="#">附属单位</a></li>
                <li><a href="#">其他单位</a></li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <a href="#">
            <span class="menu-icon"><i class="bi bi-calendar-week"></i></span>
            <span>行政审批</span>
            <span class="arrow"><i class="bi bi-chevron-right"></i></span>
          </a>
          <ul class="submenu">
            <li><a href="#" class="load-leave">离邕审批</a></li>
            <li><a href="#">会议管理</a></li>
            <li><a href="#">印信申请</a></li>
            <li><a href="#">纸质纪要申请</a></li>
          </ul>
        </li>
        <li>
          <a href="#">
            <span class="menu-icon"><i class="bi bi-clipboard-check"></i></span>
            <span>督查督办</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class="menu-icon"><i class="bi bi-chat-left-dots"></i></span>
            <span>信访工作</span>
          </a>
        </li>
        <li>
          <a href="#">
            <span class="menu-icon"><i class="bi bi-calendar3"></i></span>
            <span>领导活动安排</span>
          </a>
        </li>
      </ul>
      <div id="sidebar-toggle" class="sidebar-toggle" @click="toggleSidebar">
        <i class="bi bi-chevron-left"></i>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">      
      <!-- 个人中心 -->
      <div v-show="currentView === 'userCenter'" class="content-container">
        <UserCenterComponent />
      </div>
      <!-- 待办事项列表 -->
       <!-- 待办事项列表 -->
       <div v-show="currentView === 'todo' && !currentComponent" class="content-container">
        <h2 class="content-title">我的待办</h2>
        <div class="search-form">
          <el-form :inline="true" :model="todoSearchForm" class="demo-form-inline">
            <el-form-item label="标题">
              <el-input v-model="todoSearchForm.title" placeholder="请输入标题关键词" clearable />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="todoSearchForm.type" placeholder="请选择类型" clearable>
                <el-option label="全部" value="" />
                <el-option label="公文" value="公文" />
                <el-option label="会议" value="会议" />
                <el-option label="请假" value="请假" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="todoSearchForm.status" placeholder="请选择状态" clearable>
                <el-option label="全部" value="" />
                <el-option label="已完成" value="true" />
                <el-option label="未完成" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchTodoList">搜索</el-button>
              <el-button @click="resetTodoSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="content-body">
          <el-empty description="暂无待办事项" v-if="todoList.length === 0" />
          <div v-else>
            <el-table :data="todoList" style="width: 100%" v-loading="todoListLoading">
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="title" label="标题">
                <template #default="scope">
                  <span class="clickable-title" @click="goToTodoDetail(scope.row)">{{ scope.row.title }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="circulationStatus" label="流转状态" width="180" />
              <el-table-column prop="comeFrom" label="来件单位" width="180" />
              <el-table-column prop="comeTime" label="来件时间" width="180" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'true' ? 'success' : 'warning'">
                    {{ scope.row.status === 'true' ? '已完成' : '未完成' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="todoPageParams.pageNum"
                v-model:page-size="todoPageParams.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="todoTotal"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 已办事项列表 -->
      <div v-show="currentView === 'done' && !currentComponent" class="content-container">
        <h2 class="content-title">我的已办</h2>
        <div class="content-body">
          <el-table :data="doneList" style="width: 100%">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="completeDate" label="完成日期" width="180" />
            <el-table-column prop="result" label="处理结果" width="120">
              <template #default="scope">
                <el-tag type="success">{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 我的申请 -->
      <div v-show="currentView === 'apply' && !currentComponent" class="content-container">
        <h2 class="content-title">我的申请</h2>
        <div class="content-body">
          <el-table :data="applyList" style="width: 100%">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="title" label="申请标题" />
            <el-table-column prop="applyDate" label="申请日期" width="180" />
            <el-table-column prop="status" label="审批状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 公文流转相关视图 -->
      <div v-if="currentComponent === 'TodoComponent'" class="content-container">
        <TodoComponent />
      </div>
      <div v-else-if="currentComponent === 'MeetingDocComponent'" class="content-container">
        <MeetingDocComponent />
      </div>
      <div v-else-if="currentComponent === 'InternalDocComponent'" class="content-container">
        <InternalDocComponent />
      </div>
      <div v-else-if="currentComponent === 'ExternalDocComponent'" class="content-container">
        <ExternalDocComponent />
      </div>
      <div v-else-if="currentComponent === 'SchoolDocComponent'" class="content-container">
        <SchoolDocComponent />
      </div>
      <div v-else-if="currentComponent === 'LeaveDocComponent'" class="content-container">
        <LeaveDocComponent />
      </div>
      <div v-else-if="currentComponent === 'DeptDocComponent'" class="content-container">
        <DeptDocComponent />
      </div>
      <div v-else-if="currentComponent === 'AllDocComponent'" class="content-container">
        <AllDocComponent />
      </div>
      <div v-else-if="currentComponent === 'FavoriteDocComponent'" class="content-container">
        <FavoriteDocComponent />
      </div>

      <!-- 默认内容 -->
      <div v-show="currentView === 'default' && !currentComponent" class="row">
        <!-- 左侧内容 -->
        <div class="col-lg-8">
          <!-- 待办事项 -->
 <!-- 待办事项 -->
<!-- 待办事项 -->
<!-- 待办事项 -->
<div class="card">
            <div class="card-header">
              <div class="title"><i class="bi bi-check2-square me-2"></i>待办事项</div>
              <div class="more" @click="goToTodoList">更多 <i class="bi bi-chevron-right"></i></div>
            </div>
            <div class="card-body">
              <div class="todo-list" v-if="todoList && todoList.length > 0">
                <div class="todo-item" v-for="(item, index) in todoList.slice(0, 5)" :key="index" >
                  <div class="index-circle me-2">{{ index + 1 }}</div>
                  <div class="todo-type">{{ item.type }}</div>
                  <div class="todo-content">
                    <div class="todo-title" @click="goToTodoDetail(item)">{{ item.title }}
                      <span v-if="item.priority === 'high'" class="badge badge-danger">急</span>
                    </div>
                    
                  </div>
                  <div class="todo-content">{{ item.circulationStatus }}</div>
                  <div class="todo-content">{{ item.comeFrom }}</div>
                  <div class="todo-content">{{ formatDate(item.comeTime) }}</div>
                </div>
              </div>
              <el-empty v-else description="暂无待办事项" />
            </div>
          </div>
  
          <!-- 文件管理 -->
          <div class="card">
            <div class="card-header">
              <div class="title"><i class="bi bi-file-earmark-text me-2"></i>文件管理：前三天文件</div>
              <div class="more">更多 <i class="bi bi-chevron-right"></i></div>
            </div>
            <div class="card-body">
              <div class="file-list">
                <div class="file-item">
                  <div class="file-icon"><i class="bi bi-file-earmark-word"></i></div>
                  <div class="file-info">
                    <div class="file-name">项目计划书.docx</div>
                    <div class="file-meta">
                      <span class="file-size">2.5MB</span>
                      <span class="file-date">2023-10-08 14:30</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <i class="bi bi-download"></i>
                    <i class="bi bi-share"></i>
                    <i class="bi bi-three-dots-vertical"></i>
                  </div>
                </div>
                <div class="file-item">
                  <div class="file-icon"><i class="bi bi-file-earmark-excel"></i></div>
                  <div class="file-info">
                    <div class="file-name">项目汇总表.xlsx</div>
                    <div class="file-meta">
                      <span class="file-size">3.8MB</span>
                      <span class="file-date">2023-10-07 09:15</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <i class="bi bi-download"></i>
                    <i class="bi bi-share"></i>
                    <i class="bi bi-three-dots-vertical"></i>
                  </div>
                </div>
                <div class="file-item">
                  <div class="file-icon"><i class="bi bi-file-earmark-pdf"></i></div>
                  <div class="file-info">
                    <div class="file-name">合同文件.pdf</div>
                    <div class="file-meta">
                      <span class="file-size">1.2MB</span>
                      <span class="file-date">2023-10-06 16:45</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <i class="bi bi-download"></i>
                    <i class="bi bi-share"></i>
                    <i class="bi bi-three-dots-vertical"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷功能 -->
          <div class="card">
            <div class="card-header">
              <div class="title"><i class="bi bi-lightning-charge me-2"></i>快捷功能</div>
            </div>
            <div class="card-body">
              <div class="shortcut-grid">
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-upload"></i></div>
                  <div class="shortcut-text">上传文件</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-calendar-plus"></i></div>
                  <div class="shortcut-text">添加日程</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-file-earmark-plus"></i></div>
                  <div class="shortcut-text">新建公文</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-people"></i></div>
                  <div class="shortcut-text">通讯录</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-chat-dots"></i></div>
                  <div class="shortcut-text">即时通讯</div>
                </div>
                <div class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-clipboard-data"></i></div>
                  <div class="shortcut-text">数据统计</div>
                </div>
                <router-link to="/meeting" class="shortcut-item">
                  <div class="shortcut-icon"><i class="bi bi-calendar-event"></i></div>
                  <div class="shortcut-text">会议记录</div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="col-lg-4">
          <!-- 通知公告 -->
          <div class="card">
            <div class="card-header">
              <div class="title"><i class="bi bi-megaphone me-2"></i>通知公告</div>
              <div class="more">更多 <i class="bi bi-chevron-right"></i></div>
            </div>
            <div class="card-body">
              <div class="notice-list">
                <div class="notice-item">
                  <div class="notice-title">关于系统升级的通知</div>
                  <div class="notice-date">2023-10-08</div>
                  <div class="notice-content">系统将于本周六进行升级维护，届时系统将暂停使用，请各部门做好相关工作安排。</div>
                </div>
                <div class="notice-item">
                  <div class="notice-title">年度员工体检安排</div>
                  <div class="notice-date">2023-10-05</div>
                  <div class="notice-content">年度员工体检将于本月15日开始，请各部门按照安排表进行。</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 日程安排 -->
          <div class="card">
            <div class="card-header">
              <div class="title"><i class="bi bi-calendar3 me-2"></i>日程安排</div>
              <div class="more">更多 <i class="bi bi-chevron-right"></i></div>
            </div>
            <div class="card-body">
              <div class="schedule-header">
                <div class="current-date">2023年10月9日</div>
                <div class="date-nav">
                  <i class="bi bi-chevron-left"></i>
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
              <div class="schedule-list">
                <div class="schedule-item">
                  <div class="schedule-time">09:30 - 11:00</div>
                  <div class="schedule-content">
                    <div class="schedule-title">项目启动会议</div>
                    <div class="schedule-location"><i class="bi bi-geo-alt"></i> 会议室A</div>
                  </div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-time">14:00 - 15:30</div>
                  <div class="schedule-content">
                    <div class="schedule-title">学校办公会议</div>
                    <div class="schedule-location"><i class="bi bi-geo-alt"></i> 会议室B</div>
                  </div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-time">16:00 - 17:00</div>
                  <div class="schedule-content">
                    <div class="schedule-title">部门周例会</div>
                    <div class="schedule-location"><i class="bi bi-geo-alt"></i> 大会议室</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  

  <!-- 通知抽屉 -->
  <el-drawer
    v-model="notificationDrawerVisible"
    title="通知消息"
    size="30%"
    :destroy-on-close="false"
  >
    <NotificationsIndex />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import TodoComponent from '../components/Document/TodoComponent.vue'
import MeetingDocComponent from '../components/Document/MeetingDocComponent.vue'
import InternalDocComponent from '../components/Document/InternalDocComponent.vue'
import ExternalDocComponent from '../components/Document/ExternalDocComponent.vue'
import SchoolDocComponent from '../components/Document/SchoolDocComponent.vue'
import LeaveDocComponent from '../components/Document/LeaveDocComponent.vue'
import AllDocComponent from '../components/Document/AllDocComponent.vue'
import FavoriteDocComponent from '../components/Document/FavoriteDocComponent.vue'
import DeptDocComponent from '../components/Document/DeptDocComponent.vue'
import UserCenterComponent from '../components/User/UserCenterComponent.vue'
import { removeToken } from '@/utils/auth'
import { eventBus, EVENT_NAMES } from '@/utils/eventBus'
import { useUserStore } from '@/store/modules/user'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { getUnreadNotifyMessageCount } from '@/api/notify'
import NotificationsIndex from '@/views/notifications/index.vue'
import homeTodoApi  from '@/api/home/home-todo'
import { formatDate } from '@/utils/formatTime'

// 路由实例
const router = useRouter()

// 用户菜单状态
const showUserMenu = ref(false)

// 工作台菜单展开状态
const isWorkbenchOpen = ref(false)

// 侧边栏收起状态
const isSidebarCollapsed = ref(false)

// 缓存工具
const { wsCache } = useCache()

// 获取用户名称
const userName = computed(() => {
  // 尝试从缓存中获取用户信息
  const userInfo = wsCache.get(CACHE_KEY.USER)
  console.log('用户信息:', userInfo)
  
  // 检查多种可能的用户信息结构
  if (userInfo) {
    // 结构 1：userInfo.data.nickname
    if (userInfo.data && userInfo.data.nickname) {
      return userInfo.data.nickname
    }
    
    // 结构 2：userInfo.user.nickname
    if (userInfo.user && userInfo.user.nickname) {
      return userInfo.user.nickname
    }
    
    // 结构 3：userInfo.nickname
    if (userInfo.nickname) {
      return userInfo.nickname
    }
  }
  
  // 如果缓存中没有，则返回默认值
  return '用户'
})

// 切换用户菜单显示状态
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 切换工作台菜单展开状态
const toggleWorkbench = () => {
  isWorkbenchOpen.value = !isWorkbenchOpen.value
  console.log('工作台菜单展开状态：', isWorkbenchOpen.value)
}

const goToTodoList = () => {
  
  currentView.value = 'todo'

   // 确保工作台菜单展开
   toggleWorkbench()
  
  // 清除当前组件选择
  currentComponent.value = ''
  
  console.log('跳转到待办事项列表')
  
}

// 切换侧边栏收起/展开状态
const toggleSidebar = () => {
  // 获取侧边栏元素
  const sidebar = document.querySelector('.sidebar')
  if (!sidebar) return
  
  // 获取切换按钮和图标
  const toggleButton = document.getElementById('sidebar-toggle')
  const icon = toggleButton?.querySelector('i')
  if (!icon) return
  
  // 切换收起状态
  const isCollapsed = sidebar.classList.contains('collapsed')
  
  if (isCollapsed) {
    // 如果当前是收起状态，则展开
    sidebar.classList.remove('collapsed')
    // 切换图标为左箭头
    icon.className = 'bi bi-chevron-left'
  } else {
    // 如果当前是展开状态，则收起
    sidebar.classList.add('collapsed')
    // 切换图标为右箭头
    icon.className = 'bi bi-chevron-right'
  }
  
  // 更新状态变量
  isSidebarCollapsed.value = sidebar.classList.contains('collapsed')
  console.log('侧边栏收起状态：', isSidebarCollapsed.value, '图标类名：', icon.className)
}

// 点击首页返回首页
const goToHome = () => {
  // 重置当前视图为默认视图
  currentView.value = 'default'
  // 清除当前选中的组件
  currentComponent.value = ''
  // 可以添加其他需要的重置操作
  console.log('返回首页')
}

// 点击其他地方关闭用户菜单
const closeUserMenu = (e: MouseEvent) => {
  // 检查点击的元素是否在用户头像或下拉菜单内
  const userDropdown = document.querySelector('.user-dropdown')
  const userAvatar = document.querySelector('.user-avatar')
  
  // 如果点击的是用户头像，则不处理（由toggleUserMenu处理）
  if (userAvatar && userAvatar.contains(e.target as Node)) {
    return
  }
  
  // 如果点击的不是下拉菜单内的元素，则关闭菜单
  if (userDropdown && !userDropdown.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

// 前往个人中心
const goToUserCenter = () => {
  // 关闭菜单
  showUserMenu.value = false
  // 切换到个人中心组件
  currentView.value = 'userCenter'
  // 清除当前选中的组件
  currentComponent.value = ''
  console.log('切换到个人中心')
}

// 退出登录
const logout = () => {
  console.log('点击了退出登录按钮')
  
  // 使用原生的confirm对话框
  if (confirm('确定要退出登录吗？')) {
    console.log('用户确认退出')
    
    try {
      // 清除令牌（使用auth工具函数）
      removeToken()
      console.log('令牌已清除')
      
      // 清除浏览器中的所有相关存储
      // 清除localStorage中的所有认证相关项
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiresTime')
      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('REFRESH_TOKEN')
      console.log('localStorage中的令牌已清除')
    
      // 清除可能存在的会话存储
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')

      // 清除缓存中的用户信息
      wsCache.delete(CACHE_KEY.USER)
      console.log('缓存中的用户信息已清除')
    
      // 删除可能存在的cookie
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      
      
      console.log('所有令牌和登录状态已清除')
      
      // 提示成功
      alert('退出登录成功')
      
      // 跳转到登录页
      router.push('/')
    } catch (error) {
      console.error('退出登录失败', error)
      alert('退出登录失败')
    }
}
}

// 处理文件处理操作
const goToTodoDetail = (row) => {
  
  const path = router.resolve({
    path: row.url,
    query: { id: row.id, isTodo: 1 }
  }).href
  
  try {
    console.log('打开路径:', path)
    
    const newWindow = window.open(
      path,
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口')
      // 备选方案：在当前页打开
      router.push({ path: row.url, query: { id: row.id, isTodo: 1 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('处理失败')
  }
    

  
}

// 监听组件切换事件
const listenToComponentSwitch = () => {
  
  eventBus.on(EVENT_NAMES.SWITCH_COMPONENT, (componentName: string) => {
    console.log('接收到组件切换事件：', componentName)
    currentComponent.value = componentName
    
    
  })

  if (currentComponent.value) {
   toggleWorkbench()
  }
  
}

// 挂载时添加事件监听
onMounted(() => {
  document.addEventListener('click', closeUserMenu)
  listenToComponentSwitch()
  
  // 初始化侧边栏状态
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    isSidebarCollapsed.value = sidebar.classList.contains('collapsed')
  }
  
  // 获取未读通知数量
  fetchUnreadCount()
  // 定时刷新未读通知数量
  notificationTimer.value = setInterval(() => {
    fetchUnreadCount()
  }, 6000) // 每6秒刷新一次

   // 监听未读消息计数更新事件
   eventBus.on(EVENT_NAMES.UPDATE_UNREAD_COUNT, () => {
    fetchUnreadCount()
  })
})

// 卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
  eventBus.off(EVENT_NAMES.SWITCH_COMPONENT)
  
  // 清除定时器
  if (notificationTimer.value) {
    clearInterval(notificationTimer.value)
  }

  // 移除未读消息计数更新事件监听
  eventBus.off(EVENT_NAMES.UPDATE_UNREAD_COUNT)
})

// 当前视图
const currentView = ref('default')

// 当前组件
const currentComponent = ref('')

// 切换视图函数
const switchView = (view: string) => {
  currentView.value = view
  currentComponent.value = ''

  
  
}



// 待办列表数据
const todoList = ref([])
const todoTotal = ref(0)
const todoListLoading = ref(false)

// 搜索表单
const todoSearchForm = ref({
  title: '',
  type: '',
  status: ''
})

// 分页参数
const todoPageParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 处理页码变化
const handleCurrentChange = (val) => {
  todoPageParams.value.pageNum = val
  getTodoList()
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  todoPageParams.value.pageSize = val
  todoPageParams.value.pageNum = 1 // 重置为第一页
  getTodoList()
}

// 搜索待办列表
const searchTodoList = () => {
  todoPageParams.value.pageNum = 1 // 搜索时重置为第一页
  getTodoList()
}

// 重置搜索条件
const resetTodoSearch = () => {
  todoSearchForm.value = {
    title: '',
    type: '',
    status: ''
  }
  todoPageParams.value.pageNum = 1
  getTodoList()
}

// 获取待办列表
const getTodoList = async () => {
  try {
    todoListLoading.value = true
    
    // 构建请求参数，包含分页和搜索条件
    const params = {
      pageNum: todoPageParams.value.pageNum,
      pageSize: todoPageParams.value.pageSize,
      ...todoSearchForm.value
    }
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    console.log('请求参数:', params)
    
    const res = await homeTodoApi.getHomeToDoPage(params)
    if (res.code === 0) {
      todoList.value = res.data.list || res.data || []
      todoTotal.value = res.data.total || todoList.value.length
      console.log('待办列表数据:', todoList.value)
      console.log('总数:', todoTotal.value)
    }
  } catch (error) {
    console.error('获取待办列表失败', error)
    ElMessage.error('获取待办列表失败')
  } finally {
    todoListLoading.value = false
  }
}


const priorityMap = {
  high: '高',
  medium: '中',
  low: '低'
}

const formatDeadline = (deadline) => {
  if (Array.isArray(deadline)) {
    return `${deadline[0]}-${deadline[1].toString().padStart(2, '0')}-${deadline[2].toString().padStart(2, '0')}`
  }
  return deadline || '未设置'
}

const goTo = (url) => {
  if (url) window.open(url, '_blank')
}

// 已办列表数据
const doneList = ref([
  {
    title: '系统需求分析',
    completeDate: '2025-05-25',
    result: '已通过'
  },
  {
    title: '用户界面设计',
    completeDate: '2025-05-20',
    result: '已完成'
  }
])

// 申请列表数据
const applyList = ref([
  {
    title: '项目经费申请',
    applyDate: '2025-05-15',
    status: '审批中'
  },
  {
    title: '设备采购申请',
    applyDate: '2025-05-10',
    status: '已通过'
  },
  {
    title: '出差申请',
    applyDate: '2025-05-05',
    status: '已拒绝'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '审批中': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || 'info'
}








// 生命周期钩子
onMounted(() => {
  initSidebar();
  getTodoList();
  // 定时刷新待办列表
  setInterval(() => {
    getTodoList();
  }, 6000);
});

// 方法
const initSidebar = () => {
  // 侧边菜单切换（处理所有菜单的折叠/展开）
  const menuItems = document.querySelectorAll('.sidebar-menu a');
  menuItems.forEach(item => {
    // 检查该菜单项是否有子菜单
    if (item.nextElementSibling && item.nextElementSibling.classList.contains('submenu')) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const parent = this.parentElement;
        
        // 切换当前菜单的展开/折叠状态
        parent.classList.toggle('open');
        
        // 更新箭头方向
        const arrow = this.querySelector('.arrow i');
        if (parent.classList.contains('open')) {
          arrow.classList.remove('bi-chevron-right');
          arrow.classList.add('bi-chevron-down');
        } else {
          arrow.classList.remove('bi-chevron-down');
          arrow.classList.add('bi-chevron-right');
        }
      });
    }
  });
  
  // 侧边栏折叠/展开切换的事件监听器已移至 toggleSidebar 方法中
  // 这里不再添加事件监听器，避免冲突
  
  // 移动端菜单切换
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('mobile-open');
      document.body.classList.toggle('sidebar-open');
      
      // 点击菜单按钮时，如果侧边栏打开，添加遮罩层
      if (sidebar.classList.contains('mobile-open')) {
        // 创建遮罩层
        let overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭侧边栏
        overlay.addEventListener('click', function() {
          sidebar.classList.remove('mobile-open');
          document.body.classList.remove('sidebar-open');
          document.body.removeChild(overlay);
        });
      } else {
        // 关闭侧边栏时移除遮罩层
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
          document.body.removeChild(overlay);
        }
      }
    });
  }
  
  // 处理窗口大小变化
  window.addEventListener('resize', function() {
    // 如果窗口宽度大于768px，确保移动端特有的类被移除
    if (window.innerWidth > 768) {
      sidebar.classList.remove('mobile-open');
      document.body.classList.remove('sidebar-open');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
  });
}

// 通知相关
const unreadCount = ref(0)
const notificationTimer = ref(null)

// 获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadNotifyMessageCount()
    if (res.code === 0) {
      unreadCount.value = res.data
    }
  } catch (error) {
    console.error('获取未读通知数量失败', error)
  }
}

// 通知相关
const notificationDrawerVisible = ref(false)
// 切换通知面板显示
const toggleNotifications = () => {
  notificationDrawerVisible.value = !notificationDrawerVisible.value
  // 如果是打开通知面板，则触发刷新通知内容
  if (notificationDrawerVisible.value) {
    // 通过事件总线触发通知内容刷新
    eventBus.emit(EVENT_NAMES.UPDATE_UNREAD_COUNT)
  }
}
</script>

<style>
/* 内容区样式 */
.content-container {
  padding: 0px 20px;
}

.search-form {
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.index-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--primary-color, #2c6aa0);
  color: #fff;
  font-size: 13px;
  font-weight: bold;
}

/* 待办事项 */
.todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.todo-type {
    width: 100px;
    text-align: center;
    margin-right: 10px;
    font-weight: bold;
    color: var(--primary-color);
    background-color: var(--hover-color);
    border-radius: 4px;
}

.todo-item {
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
}

.todo-item:last-child {
    border-bottom: none;
}

.todo-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    cursor: pointer;
}

.todo-checkbox i {
    display: none;
    color: #fff;
}

.todo-checkbox.checked {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

.todo-checkbox.checked i {
    display: block;
}

.todo-content {
    flex: 1;
}

.todo-title {
    font-size: 16px;
    margin-bottom: 5px;
}

.todo-title:hover {
    cursor: pointer;
    text-decoration: underline;
    color: var(--primary-color);
}

.todo-date {
    font-size: 14px;
    color: #888;
}

.todo-priority {
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    margin-left: 10px;
}

.todo-priority.high {
    background-color: #dc3545;
}

.todo-priority.medium {
    background-color: #fd7e14;
}

.todo-priority.low {
    background-color: #28a745;
}

.todo-item .badge {
    margin-right: 10px;
    background-color: #f0ad4e;
    color: white;
    padding: 5px 8px;
    border-radius: 3px;
    font-size: 12px;
}

.todo-item .title {
    flex: 1;
    font-size: 14px;
}

.todo-item .time {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
}

.clickable-title {
  cursor: pointer;
  color: #2c6aa0;
}

.clickable-title:hover {
  text-decoration: underline;
}
.content-title {
  padding: 12px 20px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(90deg, var(--primary-color, #409eff) 0%, #66b1ff 100%);
  color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border: none;
  letter-spacing: 0.5px;
}


.content-body {
  background: #fff;
  padding: 0px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
:root {
    --primary-color: #2c6aa0;
    --secondary-color: #f5f5f5;
    --text-color: #333;
    --border-color: #e0e0e0;
    --hover-color: #eef5fb;
    --active-color: #d4e6f6;
}

body {
    font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
    color: var(--text-color);
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-size: 18px; /* 基础字体大小增加 */
    -webkit-text-size-adjust: 100%; /* 防止iOS设备上的文本自动调整大小 */
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
    width: 100%;
    box-sizing: border-box;
}

/* 顶部导航栏 */
.top-navbar {
    background-color: var(--primary-color);
    color: white;
    height: 85px; /* 将导航条高度设为90px */
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    border-radius: 6px; /* 确保四个角都没有圆角 */
}

.logo {
    font-size: 24px; /* 增大logo字体 */
    font-weight: bold;
    margin-right: 40px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); /* 添加发光效果 */
    letter-spacing: 1px; /* 增加字间距 */
}

.top-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
}

.top-menu li {
    margin-right: 30px; /* 增加菜单间距 */
    position: relative;
    display: flex;
    align-items: center;
    height: 120%;
}

.top-menu a {
    color: white;
    text-decoration: none;
    font-size: 22px; /* 增大菜单字体 */
    padding: 30px 0; /* 进一步增加上下内边距，使菜单项更高 */
    display: block;
    transition: all 0.3s ease; /* 添加过渡效果 */
    position: relative; /* 为下划线动画做准备 */
}

.top-menu a:hover {
    color: #ffffff;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5); /* 文字发光效果 */
    transform: translateY(-2px); /* 轻微上浮效果 */
}

.top-menu a:after {
    content: '';
    position: absolute;
    width: 0;
    height: 3px;
    bottom: 0;
    left: 0;
    background-color: white;
    transition: width 0.3s;
}

.top-menu a:hover:after {
    width: 100%; /* 悬停时下划线动画 */
}

.top-menu a.active {
    font-weight: bold;
    border-bottom: 3px solid white;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.7); /* 激活状态下的发光效果更强 */
}

.user-actions {
    display: flex;
    align-items: center;
}

.user-actions .icon {
    margin-left: 15px;
    font-size: 20px; /* 增大图标大小 */
    cursor: pointer;
}

.user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #fff;
    margin-left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-weight: bold;
    cursor: pointer;
    overflow: hidden;     /* 添加溢出隐藏 */
    text-overflow: ellipsis;  /* 添加省略号 */
    white-space: nowrap;  /* 防止文本换行 */
    max-width: 50px;      /* 确保最大宽度与宽度一致 */
    padding: 0 5px;       /* 添加内边距，防止文字紧贴边缘 */
    box-sizing: border-box; /* 确保内边距不会增加元素总宽度 */
    font-size: 14px;      /* 设置合适的字体大小 */
}

/* 当名称过长时，显示首字母的样式 */
.user-avatar.initial-only {
    font-size: 18px;      /* 首字母可以用更大的字体 */
}

/* 左侧菜单 */
.sidebar {
    width: 220px;
    background-color: white;
    border-right: 1px solid var(--border-color);
    position: fixed;
    top: 90px; /* 调整侧边栏顶部位置，与导航条高度一致 */
    left: 0;
    bottom: 0;
    overflow-y: auto;
    z-index: 900;
    transition: all 0.3s;
}

/* 折叠状态的侧边栏 */
.sidebar.collapsed {
    width: 60px;
}

/* 折叠按钮 */
.sidebar-toggle {
    position: fixed;
    left: 18px;
    bottom: 20px;
    width: 24px;
    height: 24px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 950; /* 增加z-index确保不被遮挡 */
    transition: all 0.3s ease;
    font-size: 12px; /* 减小图标大小 */
}

.sidebar-toggle:hover {
    transform: scale(1.1);
}

.sidebar.collapsed .sidebar-toggle i {
    transform: rotate(180deg);
}

.sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-menu > li {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2px; /* 增加菜单项间距 */
}

/* 一级菜单特殊样式 */
.sidebar-menu > li > a {
    font-weight: bold; /* 加粗字体 */
    font-size: 17px; /* 增大一级菜单字体 */
    background-color: #f0f7ff; /* 添加浅色背景 */
    border-left: 3px solid var(--primary-color); /* 左侧边框 */
    letter-spacing: 0.8px; /* 增加字间距 */
}

.sidebar-menu a {
    color: var(--text-color);
    text-decoration: none;
    padding: 15px 20px; /* 增加高度 */
    display: flex;
    align-items: center;
    transition: all 0.3s ease; /* 增强过渡效果 */
    font-size: 16px; /* 基础文字大小 */
    letter-spacing: 0.5px; /* 增加字间距 */
}

.sidebar-menu a:hover {
    background-color: var(--hover-color);
    padding-left: 25px; /* 悬停时微左移效果 */
    box-shadow: inset 4px 0 0 var(--primary-color); /* 左侧边框效果 */
}

.sidebar-menu a.active {
    background-color: var(--active-color);
    color: var(--primary-color);
    font-weight: bold;
    box-shadow: inset 4px 0 0 var(--primary-color); /* 左侧边框效果 */
    border-radius: 0 4px 4px 0; /* 右侧圆角 */
}

.sidebar-menu .menu-icon {
    margin-right: 12px;
    font-size: 18px; /* 增大图标大小 */
    width: 24px;
    text-align: center;
    color: var(--primary-color); /* 使图标颜色与主题色一致 */
}

/* 一级菜单图标特殊样式 */
.sidebar-menu > li > a .menu-icon {
    font-size: 20px; /* 一级菜单图标更大 */
    color: var(--primary-color); /* 一级菜单图标颜色更鲜明 */
}

/* 折叠时菜单项样式 */
.sidebar.collapsed .sidebar-menu a {
    padding: 15px 18px;
    justify-content: center;
}

.sidebar.collapsed .sidebar-menu span:not(.menu-icon) {
    display: none;
}

.sidebar.collapsed .sidebar-menu .menu-icon {
    margin-right: 0;
}

.sidebar.collapsed .submenu {
    display: none !important;
}

.sidebar-menu .arrow {
    margin-left: auto;
    transition: transform 0.3s;
    color: #888; /* 箭头颜色调整 */
    font-size: 12px; /* 箭头大小调整 */
}

.sidebar-menu .submenu {
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: #f9f9f9;
    display: none;
}

.sidebar-menu .submenu a {
    padding-left: 55px;
    font-size: 16px; /* 增大二级菜单字体大小 */
    transition: all 0.3s ease;
    font-weight: bold; /* 二级菜单加粗 */
    background-color: transparent; /* 移除背景色 */
    border-left: none; /* 移除边框 */
    width: 250px;
}

/* 三级菜单样式 */
.sidebar-menu .submenu .submenu a {
    padding-left: 75px;
    font-size: 15px; /* 增大三级菜单字体大小 */
    background-color: #f5f5f5; /* 浅色背景 */
    transition: all 0.3s ease;
    font-weight: bold; /* 三级菜单加粗 */
    color: #666; /* 三级菜单文字颜色略深 */
}

.sidebar-menu li.open .arrow {
    transform: rotate(90deg);
}

.sidebar-menu li.open > .submenu {
    display: block;
}

/* 主内容区域 */
.main-content {
    margin-left: 220px;
    padding: 20px;
    padding-top: 95px; /* 顶部留出足够的空间，与导航条高度一致并有一些额外空间 */
    min-height: calc(100vh - 95px);
    box-sizing: border-box;
    transition: margin-left 0.3s;
    background-color: #f5f5f5;
    width: auto;
    overflow-x: hidden;
}

.sidebar.collapsed ~ .main-content {
    margin-left: 60px;
}

/* 卡片样式 */
.card {
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    background-color: white;
    border: none;
}

.card-header {
    background-color: white;
    border-bottom: 1px solid var(--border-color);
    padding: 15px 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-header .title {
    color: var(--primary-color);
    font-size: 18px;
}

.card-header .more {
    color: #999;
    font-size: 12px;
    font-weight: normal;
    cursor: pointer;
}

.card-body {
    padding: 15px 20px;
}



/* 通知公告 */
.notice-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.notice-item {
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    background-color: #f8f9fa;
    transition: all 0.2s ease;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.notice-item:hover {
    background-color: #eef5fb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notice-item:last-child {
    margin-bottom: 0;
}

.notice-title {
    font-size: 17px;
    color: #2c6aa0;
    margin-bottom: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.notice-title:before {
    content: '\F5C8';
    font-family: 'bootstrap-icons';
    margin-right: 8px;
    color: #2c6aa0;
    font-size: 16px;
}

.notice-date {
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.notice-date:before {
    content: '\F5EF';
    font-family: 'bootstrap-icons';
    margin-right: 6px;
    font-size: 13px;
    color: #888;
}

.notice-content {
    font-size: 15px;
    line-height: 1.6;
    color: #444;
    background-color: rgba(255, 255, 255, 0.7);
    padding: 10px;
    border-radius: 4px;
}

/* 日程安排 */
.schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.current-date {
    font-size: 18px;
    font-weight: 500;
    color: #333;
}

.date-nav {
    display: flex;
    gap: 10px;
}

.date-nav i {
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
}

.date-nav i:hover {
    color: var(--primary-color);
}

.schedule-list {
    padding: 0;
    margin: 0;
}

.schedule-item {
    display: flex;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.schedule-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.schedule-time {
    width: 110px;
    padding: 5px 15px 5px 8px;
    font-size: 15px;
    color: #2c6aa0;
    position: relative;
    background-color: #eef5fb;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
}

.schedule-time:after {
    content: '';
    position: absolute;
    top: 5px;
    right: 0;
    width: 1px;
    height: calc(100% - 5px);
    background-color: #d4e6f6;
}

.schedule-content {
    flex: 1;
    padding-left: 15px;
}

.schedule-title {
    font-size: 17px;
    font-weight: 500;
    color: #333;
    margin-bottom: 5px;
}

.schedule-location {
    font-size: 14px;
    color: #888;
    display: flex;
    align-items: center;
}

.schedule-location i {
    margin-right: 5px;
    font-size: 12px;
    color: #999;
}

.notice-item .info {
    color: #999;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
}

/* 快捷功能 */
.shortcut-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    padding: 5px;
}

.shortcut-item {
    text-align: center;
    cursor: pointer;
    padding: 16px 10px;
    border-radius: 8px;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
}

.shortcut-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.shortcut-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 22px;
    transition: all 0.3s;
    position: relative;
    z-index: 1;
}

.shortcut-text {
    font-size: 15px;
    color: #333;
    margin-top: 8px;
    font-weight: 500;
}

/* 不同功能的颜色 */
.shortcut-item:nth-child(1) .shortcut-icon {
    background-color: #e8f4ff;
    color: #2c6aa0;
}

.shortcut-item:nth-child(2) .shortcut-icon {
    background-color: #e6f9f1;
    color: #28a745;
}

.shortcut-item:nth-child(3) .shortcut-icon {
    background-color: #fff2e6;
    color: #fd7e14;
}

.shortcut-item:nth-child(4) .shortcut-icon {
    background-color: #f0e8ff;
    color: #6f42c1;
}

.shortcut-item:nth-child(5) .shortcut-icon {
    background-color: #e6f9ff;
    color: #17a2b8;
}

.shortcut-item:nth-child(6) .shortcut-icon {
    background-color: #ffebf3;
    color: #e83e8c;
}

.shortcut-item:nth-child(7) .shortcut-icon {
    background-color: #f0f5ff;
    color: #4285f4;
}

/* 悬停效果 */
.shortcut-item:hover .shortcut-icon {
    transform: scale(1.1);
}

/* 文件管理列表样式 */
.file-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.file-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
    transition: all 0.2s ease;
    border-radius: 6px;
}

.file-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-item:last-child {
    border-bottom: none;
}

.file-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #f0f7ff;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 20px;
}

.file-icon i.bi-file-earmark-word {
    color: #2b579a;
}

.file-icon i.bi-file-earmark-excel {
    color: #217346;
}

.file-icon i.bi-file-earmark-pdf {
    color: #f40f02;
}

.file-icon i.bi-file-earmark-text {
    color: #5a6268;
}

.file-info {
    flex: 1;
    min-width: 0; /* 确保文本可以正确截断 */
}

.file-name {
    font-size: 17px;
    font-weight: 500;
    color: #333;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-meta {
    display: flex;
    font-size: 14px;
    color: #888;
}

.file-size {
    margin-right: 15px;
    color: #6c757d;
}

.file-date {
    color: #6c757d;
}

.file-actions {
    display: flex;
    gap: 12px;
    margin-left: 15px;
}

.file-actions i {
    font-size: 16px;
    color: #6c757d;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s;
}

.file-actions i:hover {
    color: var(--primary-color);
    background-color: #e9f2ff;
}

.file-actions i.bi-download:hover {
    color: #28a745;
}

.file-actions i.bi-share:hover {
    color: #fd7e14;
}

.file-actions i.bi-three-dots-vertical:hover {
    color: #6c757d;
}

.file-index {
    flex: 0 0 30px;
    color: #666;
    font-weight: bold;
}

.file-content {
    flex: 1;
}

.file-title {
    font-size: 15px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
}

.file-title-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-date {
    font-size: 13px;
    color: #888;
    white-space: nowrap;
    margin-left: 10px;
    flex-shrink: 0;
}

/* 响应式调整 */
@media (max-width: 992px) {
    .sidebar {
        width: 200px;
    }
    .main-content {
        margin-left: 200px;
    }
    .shortcut-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .top-menu {
        display: none;
    }
    .logo {
        margin-right: 0;
        flex: 1;
    }
}

@media (max-width: 768px) {
    body {
        font-size: 16px; /* 移动设备上减小基础字体大小 */
        width: 100%;
        overflow-x: hidden;
    }
    .sidebar {
        width: 0;
        transform: translateX(-100%);
        z-index: 1001; /* 确保侧边栏在移动设备上显示在最上层 */
    }
    .main-content {
        margin-left: 0;
        width: 100%;
        padding: 10px; /* 减小内边距 */
    }
    .menu-toggle {
        display: block !important;
    }
    .sidebar.mobile-open {
        width: 250px;
        transform: translateX(0);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
    }
    .shortcut-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px; /* 减小间距 */
    }
    .top-navbar {
        height: 70px; /* 减小导航栏高度 */
        padding: 0 15px;
    }
    .logo {
        font-size: 20px; /* 减小logo字体大小 */
    }
    .user-actions .icon {
        margin-left: 10px;
        font-size: 18px;
    }
    .user-avatar {
        width: 32px;
        height: 32px;
    }
    .content-container {
        padding: 15px 10px; /* 减小内边距 */
    }
    .content-body {
        padding: 15px;
    }
    /* 确保移动设备上表格能够水平滚动 */
    .el-table {
        width: 100%;
        overflow-x: auto;
    }
    /* 调整侧边栏顶部位置 */
    .sidebar {
        top: 70px;
    }
}

/* 小屏幕设备额外调整 */
@media (max-width: 576px) {
    .shortcut-grid {
        grid-template-columns: repeat(1, 1fr);
    }
    .row {
        flex-direction: column;
    }
    .col-md-8, .col-md-4 {
        width: 100%;
        padding: 0 5px;
    }
    .file-actions {
        gap: 8px;
    }
    .file-name {
        font-size: 15px;
    }
    .file-meta {
        flex-direction: column;
    }
    .file-size {
        margin-right: 0;
        margin-bottom: 5px;
    }
}

/* 菜单切换按钮 */
.menu-toggle {
    display: none;
    margin-right: 15px;
    font-size: 20px;
    cursor: pointer;
    z-index: 1002;
}

/* 侧边栏遮罩层 */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: block;
}

/* 通知角标样式 */
.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ff3b30;
    color: white;
    font-size: 12px;
    font-weight: bold;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon {
    position: relative;
}

/* 用户下拉菜单样式 */
.user-dropdown {
    position: relative;
}

/* 下拉菜单过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.dropdown-menu {
    position: absolute;
    top: 45px;
    right: 0;
    width: 150px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
}

.dropdown-item {
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
}

.dropdown-item i {
    margin-right: 8px;
    font-size: 16px;
}

.dropdown-item:hover {
    background-color: #f5f7fa;
    color: var(--primary-color);
}

.dropdown-item:not(:last-child) {
    border-bottom: 1px solid #ebeef5;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
<template>
  <div class="notification-page">
    <div class="notification-header">
      <h2>通知消息</h2>
      <el-button type="primary" size="small" @click="markAllAsRead">全部标记为已读</el-button>
    </div>
    
    <div class="notification-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="未读消息" name="unread"></el-tab-pane>
        <el-tab-pane label="全部消息" name="all"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="notification-list">
      <el-empty v-if="list.length === 0" description="暂无通知消息"></el-empty>
      <div v-else>
        <div v-for="item in list" :key="item.id" class="notification-item" @click="viewNotification(item)">
          <div class="notification-content">
            <div class="notification-title">{{ item.templateNickname }}</div>
            <div class="notification-text">{{ item.templateContent }}</div>
            <div class="notification-time">{{ formatTime(item.createTime) }}</div>
          </div>
          <div class="notification-status">
            <el-tag v-if="!item.readStatus" type="danger" size="small">未读</el-tag>
            <el-tag v-else type="info" size="small">已读</el-tag>
          </div>
        </div>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 通知详情抽屉 -->
  <el-drawer
    v-model="drawerVisible"
    :title="currentNotification.templateNickname || '通知详情'"
    size="30%"
    :destroy-on-close="true"
  >
    <div class="notification-detail">
      <div class="detail-content">{{ currentNotification.templateContent }}</div>
      <div class="detail-time" v-if="currentNotification.createTime">
        <span>发送时间：{{ formatTime(currentNotification.createTime) }}</span>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyNotifyMessagePage, updateNotifyMessageRead, updateAllNotifyMessageRead, getNotifyMessage } from '@/api/notify'
import { eventBus, EVENT_NAMES } from '@/utils/eventBus'

// 状态变量
const activeTab = ref('unread')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const drawerVisible = ref(false)
const currentNotification = ref({})

// 获取通知列表
const fetchNotifications = async () => {
  try {
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      readStatus: activeTab.value === 'unread' ? false : undefined
    }
    
    const res = await getMyNotifyMessagePage(params)
    if (res.code === 0) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取通知列表失败', error)
    ElMessage.error('获取通知列表失败')
  }
}

// 查看通知详情
const viewNotification = async (notification) => {
  try {
    // 如果未读，则标记为已读
    if (!notification.readStatus) {
      await updateNotifyMessageRead([notification.id])
      notification.readStatus = true
      eventBus.emit(EVENT_NAMES.UPDATE_UNREAD_COUNT)
    }
    
    // 获取完整通知内容
    const res = await getNotifyMessage(notification.id)
    if (res.code === 0) {
      currentNotification.value = res.data
      drawerVisible.value = true
    }
  } catch (error) {
    console.error('查看通知详情失败', error)
    ElMessage.error('查看通知详情失败')
  }
}

// 标记所有为已读
const markAllAsRead = async () => {
  try {
    const res = await updateAllNotifyMessageRead()
    if (res.code === 0) {
      ElMessage.success('已全部标记为已读')
      fetchNotifications() // 刷新列表
      
      // 通知主页更新未读消息计数
      eventBus.emit(EVENT_NAMES.UPDATE_UNREAD_COUNT)
    }
  } catch (error) {
    console.error('标记全部已读失败', error)
    ElMessage.error('标记全部已读失败')
  }
}

// 页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchNotifications()
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 一小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
  }
  
  // 一天内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 超过一天
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 监听标签页变化
watch(activeTab, () => {
  currentPage.value = 1
  fetchNotifications()
})

// 组件挂载时获取数据
onMounted(() => {
  fetchNotifications()

  eventBus.on(EVENT_NAMES.UPDATE_UNREAD_COUNT, () => {
    fetchNotifications()
  })
})

onUnmounted(() => {
  eventBus.off(EVENT_NAMES.UPDATE_UNREAD_COUNT)
})
</script>

<style scoped>
.notification-page {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notification-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.notification-list {
  margin-top: 20px;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  color: #303133;
}

.notification-text {
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.notification-time {
  color: #909399;
  font-size: 12px;
}

.notification-status {
  margin-left: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.notification-detail {
  padding: 20px;
}

.detail-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.detail-time {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}
</style>

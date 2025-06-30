<template>
  <div class="card">
    <div class="card-header">
      <div class="title"><i class="bi bi-bell me-2"></i>系统公告
      
        <div class="toggle-icon" style="margin-left: auto;" @click="toggleExpand">
        <i class="bi bi-chevron-down" v-if="isExpanded">收起</i>
        <i class="bi bi-chevron-up" v-else>展开</i>
      </div>
      </div>
     
      <div class="more" @click="goToNoticeList">更多 <i class="bi bi-chevron-right"></i></div>
    </div>
    <div class="card-body" v-show="isExpanded">
      <div class="notice-list" v-if="noticeList && noticeList.length > 0">
        <div class="notice-item" v-for="(item, index) in noticeList.slice(0, props.noticelength)" :key="index" @click="viewNotice(item)">
          <div class="notice-badge" :class="getNoticeBadgeClass(item.type)">{{ getNoticeTypeText(item.type) }}</div>
          <div class="notice-content">
            <div class="notice-title">{{ item.title }}
              <span v-if="item.isNew" class="new-badge">新</span>
            </div>
            <div class="notice-info">
              <span class="notice-publisher">{{ item.publisher }}</span>
              <span class="notice-time">{{ formatDate(item.publishTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无通知公告" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { ElMessage } from 'element-plus'

// 定义事件
const emit = defineEmits(['goToNoticeList', 'viewNotice'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const props = defineProps({
  noticelength: {
    type: Number,
    default: 5
  }
})
// 通知列表数据
const noticeList = ref([])
const noticeListLoading = ref(false)

// 获取通知列表
const getNoticeList = async () => {
  try {
    noticeListLoading.value = true
    
    // 模拟API调用，实际项目中应替换为真实API
    // const res = await noticeApi.getNoticeList()
    
    // 模拟数据
    setTimeout(() => {
      noticeList.value = [
        {
          id: 1,
          title: '关于2025年暑假放假安排的通知',
          type: 'notice',
          publisher: '校长办公室',
          publishTime: new Date().getTime() - 3600000, // 1小时前
          content: '根据国家法定节假日安排，结合我校实际情况，现将2025年暑假放假安排通知如下...',
          isNew: true
        },
        {
          id: 2,
          title: '关于开展2025年度教职工评优评先工作的通知',
          type: 'notice',
          publisher: '人事处',
          publishTime: new Date().getTime() - 86400000, // 1天前
          content: '为表彰先进，树立典型，激励广大教职工积极进取，现开展2025年度教职工评优评先工作...',
          isNew: false
        },
        {
          id: 3,
          title: '紧急通知：校园网络系统升级维护',
          type: 'urgent',
          publisher: '信息中心',
          publishTime: new Date().getTime() - 172800000, // 2天前
          content: '为提升校园网络服务质量，计划于本周六凌晨2:00-6:00进行网络系统升级维护，期间校园网将暂时无法使用...',
          isNew: false
        },
        {
          id: 4,
          title: '2025年度科研项目申报指南',
          type: 'announcement',
          publisher: '科研处',
          publishTime: new Date().getTime() - 259200000, // 3天前
          content: '现将2025年度各类科研项目申报指南发布如下，请各学院、各部门及时通知相关教师...',
          isNew: false
        },
        {
          id: 5,
          title: '校园安全隐患排查工作通知',
          type: 'important',
          publisher: '保卫处',
          publishTime: new Date().getTime() - 345600000, // 4天前
          content: '为确保校园安全稳定，维护正常教学秩序，现开展校园安全隐患排查工作...',
          isNew: false
        }
      ]
      noticeListLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取通知列表失败', error)
    ElMessage.error('获取通知列表失败')
    noticeListLoading.value = false
  }
}

// 获取通知类型文本
const getNoticeTypeText = (type) => {
  const typeMap = {
    'notice': '通知',
    'announcement': '公告',
    'important': '重要',
    'urgent': '紧急'
  }
  return typeMap[type] || '通知'
}

// 获取通知类型样式
const getNoticeBadgeClass = (type) => {
  const classMap = {
    'notice': 'badge-primary',
    'announcement': 'badge-success',
    'important': 'badge-warning',
    'urgent': 'badge-danger'
  }
  return classMap[type] || 'badge-primary'
}

// 查看通知详情
const viewNotice = (notice) => {
  emit('viewNotice', notice)
}

// 跳转到通知列表
const goToNoticeList = () => {
  emit('goToNoticeList')
}

onMounted(() => {
  getNoticeList()
})
</script>

<style scoped>
/* 通知列表样式 */
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-item:hover {
  background-color: var(--hover-color);
}

.notice-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
  color: white;
  min-width: 40px;
  text-align: center;
}

.badge-primary {
  background-color: #3498db;
}

.badge-success {
  background-color: #2ecc71;
}

.badge-warning {
  background-color: #f39c12;
}

.badge-danger {
  background-color: #e74c3c;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.new-badge {
  background-color: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.notice-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.notice-publisher {
  color: #666;
}

/* 卡片样式 */
.card {
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: white;
  border: none;
  height: 100%;
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
  display: flex;
  align-items: center;
}

.toggle-icon {
  cursor: pointer;
  margin-right: 5px;
  font-size: 16px;
  transition: transform 0.3s;
}

.toggle-icon:hover {
  color: var(--primary-color);
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
</style>

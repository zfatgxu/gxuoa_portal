<template>
  <div class="card">
    <div class="card-body" v-show="isExpanded">
      <div class="entry-container">
        <div 
          v-for="(item, index) in entryList.slice(0, maxEntries)" 
          :key="index" 
          class="entry-item"
          @click="handleEntryClick(item)"
        >
          <div class="entry-icon">
            <img :src="item.icon" :alt="item.name" class="entry-img" />
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </div>
          <div class="entry-name">{{ item.name }}</div>
        </div>
        <div class="entry-item add-entry" @click="handleAddEntry">
          <div class="entry-icon add-icon">
            <i class="bi bi-plus-lg"></i>
          </div>
          <div class="entry-name">添加</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { BadgeService } from '@/api/home/badge'

const router = useRouter()
const emit = defineEmits(['goToAllEntries', 'addEntry'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 计算最大可显示的图标数量（不包括添加按钮）
const maxEntries = computed(() => {
  // 根据屏幕宽度动态计算，这里简化处理
  const screenWidth = window.innerWidth
  if (screenWidth > 1400) return 7
  if (screenWidth > 1200) return 6
  if (screenWidth > 992) return 5
  if (screenWidth > 768) return 4
  if (screenWidth > 576) return 3
  return 2
})

// // 监听窗口大小变化
// const updateMaxEntries = () => {
//   // 窗口大小变化时重新计算
//   window.dispatchEvent(new Event('resize'))
// }

// 快捷入口列表
const entryList = ref([
  {
    name: '公文',
    icon: new URL('@/assets/imgs/quickEntry/document.png', import.meta.url).href,
    path: '/gwlz/gwlztodo',
    bgColor: '#4a7eff',
    badge: '',
    badgeKey: 'document'
  },
  {
    name: '邮件',
    icon: new URL('@/assets/imgs/quickEntry/mail.png', import.meta.url).href,
    path: '/mail/index',
    bgColor: '#4cd964',
    badge: '',
    badgeKey: 'mail'
  },
  {
    name: '请假审批',
    icon: new URL('@/assets/imgs/quickEntry/leave.png', import.meta.url).href,
    path: '/leave/list/todo',
    bgColor: '#9c88ff',
    badge: '',
    badgeKey: 'leave'
  },
  // {
  //   name: '出差审批',
  //   icon: new URL('@/assets/imgs/quickEntry/trip.png', import.meta.url).href,
  //   path: '/visit',
  //   bgColor: '#5352ed',
  //   badge: '1'
  // },
  {
    name: '督查督办',
    icon: new URL('@/assets/imgs/quickEntry/supervison.png', import.meta.url).href,
    path: '/supervision/index',
    bgColor: '#70a1ff',
    badge: '',
    badgeKey: 'supervision'
  },
  // {
  //   name: '问题反馈',
  //   icon: new URL('@/assets/imgs/quickEntry/feedback.png', import.meta.url).href,
  //   path: '/approval',
  //   bgColor: '#2ed573',
  //   badge: '1'
  // },
  {
    name: '印章管理',
    icon: new URL('@/assets/imgs/quickEntry/feedback.png', import.meta.url).href,
    path: '/seal/seal_todo',
    bgColor: '#70a1ff',
    badge: '',
    badgeKey: 'seal'
  },
])

// 处理快捷入口点击
const handleEntryClick = (item) => {
  if (item.path) {
    router.push(item.path)
  } else {
    ElMessage.info(`功能 "${item.name}" 正在开发中`)
  }
}

// 跳转到所有入口页面
const goToAllEntries = () => {
  emit('goToAllEntries')
}

// 处理添加入口
const handleAddEntry = () => {
  emit('addEntry')
  ElMessage.info('添加快捷入口功能正在开发中')
}

// 加载待办数量
const loadBadgeCounts = async () => {
  try {
    const badgeCounts = await BadgeService.getAllBadgeCounts()
    
    // 更新每个入口的badge数量
    entryList.value.forEach(item => {
      if (item.badgeKey && badgeCounts[item.badgeKey] !== undefined) {
        const count = badgeCounts[item.badgeKey]
        item.badge = count > 0 ? count.toString() : ''
      }
    })
  } catch (error) {
    console.error('加载待办数量失败:', error)
  }
}

// 定时刷新待办数量（每5分钟刷新一次）
let refreshTimer: NodeJS.Timeout | null = null

const startAutoRefresh = () => {
  // 清除之前的定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置新的定时器
  refreshTimer = setInterval(() => {
    loadBadgeCounts()
  }, 5 * 60 * 1000) // 5分钟
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(() => {
  // 初始加载待办数量
  loadBadgeCounts()
  
  // 开始自动刷新
  startAutoRefresh()
  
  // 可以在这里加载用户自定义的快捷入口
  //window.addEventListener('resize', updateMaxEntries)
})

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  stopAutoRefresh()
})

</script>

<style scoped>
/* 快捷入口布局 */
.entry-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  padding: 5px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  gap: 70px;
}

.entry-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 3px;
  border-radius: 5px;
  flex: 0 0 auto;
  min-width: 60px;
  max-width: 80px;
}

.entry-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
}

.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  transition: all 0.3s;
  position: relative;
}

.entry-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  /*filter: brightness(0);*/
}

.entry-item:hover .entry-icon {
  transform: scale(1.05);
}

.entry-name {
  font-size: 14px;
  text-align: center;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.add-icon {
  background-color: #f1f2f6;
  color: #747d8c;
  border: 2px dashed #dfe4ea;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
}

.add-entry:hover .add-icon {
  background-color: #dfe4ea;
}

/* 卡片样式 */
.card {
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
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
  padding: 10px 10px;
}
</style>

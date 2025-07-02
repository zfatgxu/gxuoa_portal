<template>
  <div class="card">
    <div class="card-header" @click="toggleExpand" style="cursor: pointer;">
      <div class="title"><i class="bi bi-lightning-charge me-2"></i>快捷功能
      
        <div class="toggle-icon" style="margin-left: auto;" >
        <i class="bi bi-chevron-down" v-if="isExpanded"></i>
        <i class="bi bi-chevron-up" v-else></i>
      </div>
      
      </div>
      
      <div class="more" @click="goToAllFunctions">更多 <i class="bi bi-chevron-right"></i></div>
    </div>
    <div class="card-body" v-show="isExpanded">
      <div class="shortcut-grid">
        <div 
          v-for="(item, index) in shortcutList.slice(0, props.shortcutlength)" 
          :key="index" 
          class="shortcut-item"
          @click="handleShortcutClick(item)"
        >
          <div class="shortcut-icon" :style="{ backgroundColor: item.bgColor }">
            <i class="bi" :class="item.icon"></i>
          </div>
          <div class="shortcut-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const emit = defineEmits(['goToAllFunctions'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const props = defineProps({
  shortcutlength: {
    type: Number,
    default: 5
  }
})
// 快捷功能列表
const shortcutList = ref([
  {
    name: '文档中心',
    icon: 'bi-file-earmark-text',
    path: '/document-center',
    bgColor: '#3498db'
  },
  {
    name: '会议管理',
    icon: 'bi-calendar-event',
    path: '/meeting',
    bgColor: '#2ecc71'
  },
  {
    name: '即时通讯',
    icon: 'bi-person-lines-fill',
    path: '/contacts',
    bgColor: '#9b59b6'
  },
  {
    name: '签到打卡',
    icon: 'bi-geo-alt',
    path: '/check-in',
    bgColor: '#e74c3c'
  },
  {
    name: '请假申请',
    icon: 'bi-calendar-check',
    path: '/leave-application',
    bgColor: '#f39c12'
  },
  {
    name: '工作报告',
    icon: 'bi-file-earmark-bar-graph',
    path: '/work-report',
    bgColor: '#16a085'
  },
  {
    name: '资源预约',
    icon: 'bi-bookmark-check',
    path: '/resource-reservation',
    bgColor: '#8e44ad'
  },
])

// 处理快捷功能点击
const handleShortcutClick = (item) => {
  if (item.path) {
    router.push(item.path)
  } else {
    ElMessage.info(`功能 "${item.name}" 正在开发中`)
  }
}

// 跳转到所有功能页面
const goToAllFunctions = () => {
  emit('goToAllFunctions')
}

onMounted(() => {
  // 可以在这里加载用户自定义的快捷功能
})
</script>

<style scoped>
/* 快捷功能网格布局 */
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

@media (max-width: 768px) {
  .shortcut-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .shortcut-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px;
  border-radius: 5px;
}

.shortcut-item:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: white;
  font-size: 24px;
  transition: all 0.3s;
}

.shortcut-item:hover .shortcut-icon {
  transform: scale(1.05);
}

.shortcut-name {
  font-size: 14px;
  text-align: center;
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

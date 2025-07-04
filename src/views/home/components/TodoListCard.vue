<template>
  <div class="card">
    <div class="card-header">
      <div class="title" @click="toggleExpand" style="cursor: pointer;">
        <i class="bi bi-list-task me-2"></i>待办事项  
        <div class="toggle-icon" style="margin-left: auto;">
        <i class="bi bi-chevron-down" v-if="isExpanded"></i>
        <i class="bi bi-chevron-up" v-else></i>
      </div>
      </div>
      
      <div class="more" @click="goToTodoList">更多 <i class="bi bi-chevron-right"></i></div>
    </div>
    <div class="card-body" v-show="isExpanded">
      <div class="todo-list" v-if="todoList && todoList.length > 0">
        <div class="todo-item" v-for="(item, index) in todoList.slice(0, props.todolength)" :key="index">
          <div class="todo-icon">
            <el-tag size="small" :type="getTagType(item.type)" class="todo-type">{{ item.type }}</el-tag>
          </div>
          <div class="todo-info">
            <div class="todo-name" @click="goToTodoDetail(item)">
              {{ item.title }}
              
            </div>
            <div class="todo-meta">
              <!-- <el-tag size="small" :type="getTagType(item.type)" class="todo-type">{{ item.type }}</el-tag> -->
              <span v-if="item.comeFrom!=null" class="todo-from">{{ item.comeFrom }}</span>
              <span v-if="item.comeTime!=null" class="todo-time">{{ formatDate(item.comeTime) }}</span>
              <span v-if="item.priority === 'high'" class="badge badge-danger">急</span>
            </div>
          </div>
          <div class="todo-actions" >
            <el-tooltip content="流转历史" placement="top">
              <div class="action-icon" @click="goToHistory(item)">
                <i class="bi bi-three-dots"></i>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无待办事项" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue'
import { formatDate } from '@/utils/formatTime'
import * as homeTodoApi from '@/api/home/todo'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['goToTodoList', 'goToTodoDetail'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const props = defineProps({
  todolength: {
    type: Number,
    default: 5
  }
})
// 待办列表数据
const todoList = ref([])
const todoTotal = ref(0)
const todoListLoading = ref(false)

// 分页参数
const todoPageParams = ref({
  pageNum: 1,
  pageSize: 5
})

// 根据待办类型获取对应图标
const getTodoIcon = (type: string) => {
  const iconMap = {
    '收文': 'bi-envelope',
    '发文': 'bi-send',
    '签报': 'bi-file-earmark-text',
    '请示': 'bi-question-circle',
    '公文': 'bi-file-earmark-richtext',
    '会议': 'bi-calendar-event',
    '任务': 'bi-list-check'
  }
  
  return iconMap[type] || 'bi-file-earmark'
}

// 根据待办类型获取对应标签类型
const getTagType = (type: string) => {
  const typeMap = {
    '收文': '',
    '发文': 'success',
    '签报': 'warning',
    '请示': 'danger',
    '公文': 'info',
    '会议': '',
    '任务': 'warning',
    '通知': 'info',
    '审批': 'success',
    '传阅': '',
    '批示': 'danger',
    '阅读': 'info',
    '汇报': 'warning',
    '办理': 'success'
  }
  
  return typeMap[type] || ''
}

// 获取待办列表
const getTodoList = async () => {
  try {
    todoListLoading.value = true
    
    // 构建请求参数，包含分页
    const params = {
      pageNum: todoPageParams.value.pageNum,
      pageSize: todoPageParams.value.pageSize
    }
    
    homeTodoApi.getHomeToDoPage(params).then((data) => {
      // 直接使用res.data，因为它已经是数组了
      console.log('待办列表数据:', data)
      todoList.value = data || []
      todoTotal.value = data.length || 0
      
    })
  } catch (error) {
    console.error('获取待办列表失败', error)
    ElMessage.error('获取待办列表失败')
  } finally {
    todoListLoading.value = false
  }
}

// 跳转到待办列表
const goToTodoList = () => {
  emit('goToTodoList')
}

// 跳转到待办详情
const goToTodoDetail = (item) => {
  emit('goToTodoDetail', item)
}

// 跳转到待办历史
const goToHistory = (item) => {
  console.log('查看流转历史:', item)
  
  try {
    // 根据路由配置生成完整路径
    const fullPath = router.resolve({
      path: '/document/history',
      query: { 
        documentId: item.id,
        circulationId: item.circulationId
      }
    }).href
    
    // 在新窗口打开流转历史页面
    const newWindow = window.open(
      fullPath, 
      '_blank',
      'width=1000,height=700,left=150,top=150,resizable=yes,scrollbars=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口或检查浏览器设置')
      // 备选方案：在当前窗口打开
      router.push({ 
        path: '/document/history',
        query: { 
          documentId: item.id,
          circulationId: item.circulationId
        }
      })
    }
  } catch (error) {
    console.error('打开流转历史页面失败:', error)
    ElMessage.error('打开流转历史页面失败，请重试')
  }
}

onMounted(() => {
  getTodoList()
  // 定时刷新待办列表
  setInterval(() => {
    getTodoList()
  }, 6000) // 每分钟刷新一次
})
</script>

<style scoped>
/* 待办事项样式 */
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
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

.todo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-left: 10px;
  font-size: 24px;
  color: var(--primary-color);
}

.todo-info {
  flex: 1;
}

.todo-name {
  font-size: 16px;
  margin-bottom: 5px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  
  text-overflow: ellipsis;
  max-width: 100%;
}

.todo-name:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.todo-meta {
  display: flex;
  font-size: 12px;
  color: #999;
}

.todo-type {
  margin-right: 15px;
}

.todo-from {
  margin-right: 15px;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.todo-time {
  max-width: 150px;
}

.todo-actions {
  display: flex;
  align-items: center;
}

.todo-status {
  color: #409eff;
  cursor: pointer;
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.todo-status:hover {
  text-decoration: underline;
}

.badge {
  margin-left: 10px;
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
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

.card-header .more:hover {
  color: var(--primary-color);
}

.card-body {
  padding: 15px 20px;
}

.action-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f0f0f0;
    transform: scale(1.1);
    
    i {
      color: #409EFF;
    }
  }
  
  i {
    font-size: 14px;
    color: #606266;
  }
}
</style>

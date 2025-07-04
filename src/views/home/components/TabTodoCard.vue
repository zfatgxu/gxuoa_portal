<template>
  <div class="card">
    <div class="card-tabs">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.name }}
      </div>
      <div class="tab-more" @click="goToMore">
        查看更多 <i class="bi bi-chevron-right"></i>
      </div>
    </div>
    
    <div class="card-body">
      <!-- 待办事项选项卡 -->
      <div v-if="activeTab === 0" class="tab-content">
        <div class="todo-list" v-if="todoList.length > 0">
          <div 
            v-for="(item, index) in todoList" 
            :key="index" 
            class="todo-item"
          >
            <div class="todo-index">{{ index + 1 }}</div>
            <div class="todo-title-container">
              <span v-if="item.priority === 'high'" class="badge badge-danger">急</span>
              <div class="todo-title" @click="goToTodoDetail(item)" :title="item.title" >
                {{ item.title }}
              </div>
            </div>
            <div class="todo-type">{{ item.type }}</div>
            <div class="todo-dept">{{ item.comeFrom }}</div>
            <div class="todo-date">{{ formatDate(item.comeTime) }}</div>
            <div class="todo-actions">
              <el-tooltip content="流转历史" placement="top">
                <div class="action-icon" @click.stop="goToHistory(item)">
                  <i class="bi bi-three-dots"></i>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无待办事项" />
      </div>
      
      <!-- 待阅文件选项卡 -->
      <div v-if="activeTab === 1" class="tab-content">
        <div class="todo-list" v-if="readingList.length > 0">
          <div 
            v-for="(item, index) in readingList" 
            :key="index" 
            class="todo-item"
          >
            <div class="todo-index">{{ index + 1 }}</div>
            <div class="todo-title-container">
              <i class="bi me-2" :class="getFileIcon(item.fileType)"></i>
              <div class="todo-title" @click="viewFileDetail(item)" :title="item.title">
                {{ item.title }}
              </div>
            </div>
            <div class="todo-type">{{ item.type }}</div>
            <div class="todo-dept">{{ item.comeFrom }}</div>
            <div class="todo-date">{{ formatDate(item.comeTime) }}</div>
            <div class="todo-actions">
              <el-tooltip content="分享" placement="top">
                <div class="action-icon" @click.stop="previewFile(item, $event)">
                  <i class="bi bi-share me-2"></i>
                </div>
              </el-tooltip>
              <el-tooltip content="下载" placement="top">
                <div class="action-icon" @click.stop="downloadFile(item, $event)">
                  <i class="bi bi-download me-2"></i>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无待阅文件" />
      </div>
      
      <!-- 我的申请选项卡 -->
      <div v-if="activeTab === 2" class="tab-content">
        <div class="todo-list" v-if="myFileList.length > 0">
          <div 
            v-for="(item, index) in myFileList" 
            :key="index" 
            class="todo-item"
          >
            <div class="todo-index">{{ index + 1 }}</div>
            <div class="todo-title-container">
              <div class="todo-title" @click="viewMyFile(item)" :title="item.title">
                {{ item.title }}
              </div>
            </div>
            <div class="todo-type">{{ item.tag }}</div>
            <div class="todo-dept">{{ item.department }}</div>
            <div class="todo-date">{{ item.date }}</div>
            <div class="todo-actions">
              <el-tooltip content="查看详情" placement="top">
                <div class="action-icon" @click.stop="viewMyFile(item)">
                  <i class="bi bi-eye"></i>
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无申请记录" />
      </div>
      
      
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as homeTodoApi from '@/api/home/todo'
import { formatDate } from '@/utils/formatTime'

const router = useRouter()
const emit = defineEmits(['viewTodoDetail', 'viewFileDetail', 'viewMyFile', 'goToMore'])

// 选项卡数据
const tabs = [
  { name: '待办事项', route: '/workplace/mytodo' },
  { name: '待阅文件', route: '/document/reading' },
  { name: '我的申请', route: '/file/list' }
]

// 当前激活的选项卡
const activeTab = ref(0)

// 切换选项卡
const switchTab = (index: number) => {
  activeTab.value = index
}

// 跳转到更多页面
const goToMore = () => {
  const currentTab = tabs[activeTab.value]
  router.push(currentTab.route)
}

// 待办列表数据
const todoList = ref([])
const todoTotal = ref(0)
const todoListLoading = ref(false)

// 分页参数
const todoPageParams = ref({
  pageNum: 1,
  pageSize: 5
})

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

// 根据待办类型获取对应标签类型
const getTagType = (type: string) => {
  const typeMap = {
    '收文': 'blue',
    '发文': 'green',
    '签报': 'orange',
    '请示': 'red',
    '公文': 'blue',
    '会议': 'purple',
    '任务': 'orange',
    '通知': 'green',
    '审批': 'blue',
    '传阅': 'purple',
    '批示': 'red',
    '阅读': 'green',
    '汇报': 'orange',
    '办理': 'blue'
  }
  
  return typeMap[type] || 'blue'
}

// 待阅文件数据
const readingList = ref([])
const readingListLoading = ref(false)
const readingTotal = ref(0)

// 分页参数
const readingPageParams = ref({
  pageNum: 1,
  pageSize: 5
})

// 获取待阅文件列表
const getReadingList = async () => {
  try {
    readingListLoading.value = true
    
    // 模拟API调用，实际项目中应替换为真实API
    // const res = await documentApi.getReadingDocuments(readingPageParams.value)
    
    // 模拟数据
    setTimeout(() => {
      readingList.value = [
        {
          id: '1',
          title: '关于2025年暑假安排的通知',
          fileType: 'docx',
          fileSize: 2048576, // 2MB
          comeTime: new Date().getTime() - 86400000, // 昨天
          comeFrom: '人事部',
          type: '通知'
        },
        {
          id: '2',
          title: '第二季度工作总结会议纪要',
          fileType: 'pdf',
          fileSize: 3145728, // 3MB
          comeTime: new Date().getTime() - 172800000, // 前天
          comeFrom: '办公室',
          type: '会议'
        },
        {
          id: '3',
          title: '2025年度预算报表',
          fileType: 'xlsx',
          fileSize: 1048576, // 1MB
          comeTime: new Date().getTime() - 259200000, // 3天前
          comeFrom: '财务部',
          type: '报表'
        },
        {
          id: '4',
          title: '新产品发布会宣传材料',
          fileType: 'pptx',
          fileSize: 4194304, // 4MB
          comeTime: new Date().getTime() - 345600000, // 4天前
          comeFrom: '市场部',
          type: '宣传'
        },
        {
          id: '5',
          title: '系统升级维护通知',
          fileType: 'pdf',
          fileSize: 1572864, // 1.5MB
          comeTime: new Date().getTime() - 432000000, // 5天前
          comeFrom: 'IT部门',
          type: '通知'
        }
      ]
      readingTotal.value = 15 // 总数据量
      readingListLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取待阅文件列表失败', error)
    ElMessage.error('获取待阅文件列表失败')
    readingListLoading.value = false
  }
}

// 根据文件类型获取对应图标
const getFileIcon = (fileType) => {
  const iconMap = {
    'pdf': 'bi-file-earmark-pdf',
    'docx': 'bi-file-earmark-word',
    'doc': 'bi-file-earmark-word',
    'xlsx': 'bi-file-earmark-excel',
    'xls': 'bi-file-earmark-excel',
    'pptx': 'bi-file-earmark-ppt',
    'ppt': 'bi-file-earmark-ppt',
    'jpg': 'bi-file-earmark-image',
    'jpeg': 'bi-file-earmark-image',
    'png': 'bi-file-earmark-image',
    'gif': 'bi-file-earmark-image',
    'mp4': 'bi-file-earmark-play',
    'mp3': 'bi-file-earmark-music',
    'zip': 'bi-file-earmark-zip',
    'rar': 'bi-file-earmark-zip',
    'txt': 'bi-file-earmark-text'
  }
  
  return iconMap[fileType] || 'bi-file-earmark'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

// 查看待阅文件详情
const viewFileDetail = (item) => {
  try {
    // 使用 router.resolve 获取完整路径
    const path = router.resolve({
      name: 'documentDetail',
      query: { id: item.id, type: 2 }
    }).href
    
    console.log('打开待阅文件:', path)
    
    const newWindow = window.open(
      path,
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口')
      // 备选方案：在当前页打开
      router.push({ name: 'documentDetail', query: { id: item.id, type: 2 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('处理失败')
  }
}

// 下载文件
const downloadFile = (item, event) => {
  event.stopPropagation() // 阻止事件冒泡
  console.log('下载文件:', item)
  ElMessage.success('开始下载文件：' + item.title)
  // 实际项目中应调用下载API
}

// 预览文件
const previewFile = (item, event) => {
  event.stopPropagation() // 阻止事件冒泡
  console.log('预览文件:', item)
  ElMessage.info('预览文件：' + item.title)
  // 实际项目中应调用预览API
}

// 我的文件数据
const myFileList = ref([
  {
    id: '1',
    title: '年假申请-7月份',
    tag: '请假申请',
    tagType: 'blue',
    department: '人事部门',
    date: '2025-7-1'
  },
  {
    id: '2',
    title: '项目合同用印申请',
    tag: '用印申请',
    tagType: 'green',
    department: '法务部门',
    date: '2025-7-2'
  },
  {
    id: '3',
    title: '病假申请-3天',
    tag: '请假申请',
    tagType: 'blue',
    department: '人事部门',
    date: '2025-6-28'
  },
  {
    id: '4',
    title: '公章用印申请-招标文件',
    tag: '用印申请',
    tagType: 'green',
    department: '采购部门',
    date: '2025-6-30'
  },
  {
    id: '5',
    title: '事假申请-家庭事务',
    tag: '请假申请',
    tagType: 'blue',
    department: '人事部门',
    date: '2025-7-3'
  }
])

const goToTodoDetail = (item) => {
  // 使用 router.resolve 获取完整路径
  const path = router.resolve({
    name: 'documentApproval',
    query: { id: item.id, type: 3, isTodo: 1 }
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
      router.push({ name: 'documentApproval', query: { id: item.id, type: 3, isTodo: 1 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('处理失败')
  }
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
  // 获取待办列表数据
  getTodoList()
  
  // 获取待阅文件列表
  getReadingList()
  
  // 定时刷新待办列表
  const refreshInterval = setInterval(() => {
    if (activeTab.value === 0) {
      getTodoList()
    } else if (activeTab.value === 1) {
      getReadingList()
    }
  }, 60000) // 每分钟刷新一次
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(refreshInterval)
  })
})
</script>

<style scoped>
.card {
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: white;
  border: none;
}

.card-tabs {
  display: flex;
  border-bottom: 1px solid #e6e6e6;
  position: relative;
}

.tab-item {
  padding: 15px 20px;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  color: #606266;
  font-weight: 500;
}

.tab-item.active {
  color: #409EFF;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background-color: #409EFF;
}

.tab-more {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

.tab-more:hover {
  color: #409EFF;
}

.card-body {
  padding: 0;
}

.tab-content {
  min-height: 200px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.3s;
}

.todo-item:hover {
  background-color: #f5f7fa;
}

.todo-index {
  width: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.todo-title-container {
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 60%;
  margin-right: 10px;
}

.todo-title {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  cursor: pointer;
}

.todo-title:hover {
  color: #409EFF;
  text-decoration: underline;
}

.todo-type {
  width: 60px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background-color: #409EFF;
  text-align: center;
  margin-right: 10px;
}

.todo-type.blue {
  background-color: #409EFF;
}

.todo-type.green {
  background-color: #67C23A;
}

.todo-type.orange {
  background-color: #E6A23C;
}

.todo-type.red {
  background-color: #F56C6C;
}

.todo-type.purple {
  background-color: #909399;
}

.todo-dept {
  width: 80px;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #909399;
  font-size: 12px;
}

.todo-date {
  width: 70px;
  color: #909399;
  font-size: 12px;
}

.todo-actions {
  width: 24px;
  display: flex;
  justify-content: center;
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
}

.action-icon:hover {
  background-color: #f0f0f0;
  transform: scale(1.1);
}

.action-icon i {
  font-size: 14px;
  color: #606266;
}

.action-icon:hover i {
  color: #409EFF;
}

.todo-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background-color: #409EFF;
  margin-right: 30px;
}

.todo-tag.blue {
  background-color: #409EFF;
}

.todo-tag.green {
  background-color: #67C23A;
}

.todo-tag.orange {
  background-color: #E6A23C;
}

.todo-tag.red {
  background-color: #F56C6C;
}

.todo-tag.purple {
  background-color: #909399;
}

.todo-left {
  display: flex;
  align-items: center;
  max-width: 70%;
}

.todo-right {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.progress-container {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
  text-align: right;
}

.badge {
  flex-shrink: 0;
  margin-right: 5px;
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
}

.badge-danger {
  background-color: #f56c6c;
}
</style>

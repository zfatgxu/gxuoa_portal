<template>
  <div class="task-dashboard">
    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">
        <el-icon class="title-icon"><DataAnalysis /></el-icon>
        本月任务情况
      </h3>
      <div class="stats-cards">
        <el-card class="stat-card my-tasks">
          <div class="stat-content">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-label">我的任务</div>
              <div class="stat-number">{{ statistics.myTaskCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card ongoing">
          <div class="stat-content">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-number">{{ statistics.ongoingCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card completed">
          <div class="stat-content">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-number">{{ statistics.completedCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card overdue">
          <div class="stat-content">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">超时提醒</div>
              <div class="stat-number">{{ statistics.overdueCount }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Task Management Section -->
    <div class="task-section">
      <div class="task-header-controls">
        <el-tabs v-model="activeTab" class="inline-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="牵头任务" name="lead" />
          <el-tab-pane label="协办任务" name="co" />
          <el-tab-pane label="已完成" name="done" />
        </el-tabs>
        <!-- 搜索和筛选功能 -->
        <div class="flex space-x-4 items-center">
            <span class="text-gray-700 font-medium">督办标题</span>
            <el-input
                v-model="searchQuery"
                placeholder="请输入督办事项标题"
                clearable
                style="width: 280px;"
                >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <span class="text-gray-700 font-medium">优先级</span>
            <el-select 
                v-model="selectedPriority" 
                placeholder="全部优先级" 
                clearable 
                style="width: 150px;"
            >
                <el-option
                    v-for="priority in priorityOptions"
                    :key="priority.value"
                    :label="priority.label"
                    :value="priority.value"
                />
            </el-select>
            <el-button type="primary" @click="handleSearch">
                查询
            </el-button>
            <el-button @click="handleReset">
                重置
            </el-button>
        </div>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <el-card
          v-for="task in filteredTaskList"
          :key="task.id"
          class="task-item"
          shadow="hover"
        >
          <div class="task-header">
            <div class="flex items-center">
              <span 
                class="px-2 py-2 rounded text-xs font-medium text-white mr-3"
                :style="{
                  fontWeight: 'bold',
                  backgroundColor: getTypeText(task) === '工作督办' ? 'rgb(27, 173, 255)' : 'rgb(129, 179, 55)'
                }">
                {{ getTypeText(task) }}
              </span>
              <h4 class="task-title" @click="viewTaskDetail(task)">{{ getTaskTitle(task) }}</h4>
            </div>
            <div class="task-actions">
              <span
                class="px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                :style="{
                  fontWeight: 'bold',
                  backgroundColor: getPriorityText(task) === '高优先级' ? 'rgb(179, 55, 55)' :
                                 getPriorityText(task) === '中优先级' ? 'rgb(129, 179, 55)' :
                                 getPriorityText(task) === '一般优先' ? 'rgb(64, 149, 229)' :
                                 'rgb(64, 149, 229)'
                }">
                {{ getPriorityText(task) }}
              </span>
              <span
                class="ml-2 px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                :style="{
                  fontWeight: 'bold',
                  backgroundColor: getStatusText(task) === '已超时' ? 'rgb(179, 55, 55)' :
                                 getStatusText(task) === '已结束' ? 'rgb(154, 154, 154)' :
                                 getStatusText(task) === '进行中' ? 'rgb(129, 179, 55)' :
                                 'rgb(154, 154, 154)'
                }">
                {{ getStatusText(task) }}
              </span>
            </div>
          </div>
          <div class="task-description" v-if="getTaskContent(task)">
            <p class="text-gray-600 mb-7 leading-relaxed">{{ getTaskContent(task) }}</p>
          </div>

          <!-- 批示显示区域 - 移到主要内容下方 -->
          <div v-if="task.leaderRemarks && task.leaderRemarks.length > 0" class="task-remarks">
            <el-icon><Document /></el-icon>
            <span v-for="(remark, index) in task.leaderRemarks" :key="`${remark.leaderId}-${index}`" class="remark-item">
              <span v-if="index > 0">；</span>
              <span class="remark-text">{{ getRemarkLabel(remark) }}：{{ remark.remark }}</span>
            </span>
          </div>

          <div class="task-content">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-6 flex-wrap">
                <div class="flex items-center">
                  <span class="text-gray-500">创建时间：</span>
                  <span class="text-gray-700">{{ formatCreateTime(task.createTime) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500">截止时间：</span>
                  <span :class="getDeadlineClass(task)">{{ getDeadlineText(task) }}</span>
                </div>
                <div class="flex items-center">
                  <span v-if="activeTab !== 'done'" :class="getPreciseTimeRemainingClass(task)">
                    {{ getPreciseTimeRemaining(task) }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500">协办部门：</span>
                  <span class="text-gray-700">{{ getCoDeptNames(task) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500">牵头部门：</span>
                  <span class="text-gray-700">{{ getLeadDeptName(task) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500">分管校领导：</span>
                  <span class="text-gray-700">{{ task.supervisionPageVOData?.leaderNickname || '未设置' }}</span>
                </div>
              </div>
            </div>

              <div class="flex ml-6">
                <el-button class="w-20" @click="viewTaskDetail(task)">查看详情</el-button>
                <el-button v-if="activeTab === 'lead' || activeTab === 'co'" class="w-20 ml-2" type="primary" @click="handleAudit(task)">办理</el-button>
              </div>
          </div>
        </el-card>
        <div v-if="filteredTaskList.length === 0 && !loading" class="no-tasks-message">
          {{ taskList.length === 0 ? '暂无相关任务。' : '没有符合条件的任务。' }}
        </div>
        <el-pagination
          v-if="pagination.total > 0"
          background
          layout="prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.pageNo"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 督办详情弹窗 -->
    <SupervisionDetailDialog
      v-model="detailDialogVisible"
      :task-data="selectedTask"
      :process-instance-id="selectedTask?.processInstance?.id"
      :supervision-status="selectedTask?.supervisionStatus"
      @close="handleDetailClose"
    />


  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, Bell, DataAnalysis, Document, Clock, CircleCheck, Warning,
  OfficeBuilding, User
} from '@element-plus/icons-vue'
import SupervisionDetailDialog from '../components/SupervisionDetailDialog.vue'
import * as DeptApi from '@/api/system/dept'
import { SupervisionTaskApi, LeaderRemarkApi, SupervisionIndexApi } from '@/api/supervision/index'
import { dateFormatter } from '@/utils/formatTime'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

// 格式化日期，只显示年月日
const formatDateOnly = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取用户store
const userStore = useUserStore()

// 根据批示的leaderId判断显示标签
const getRemarkLabel = (remark) => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id

  // 如果批示的leaderId与当前用户ID匹配，显示"我的批示"
  if (remark.leaderId === currentUserId) {
    return '我的批示'
  }

  // 否则显示领导姓名
  return `${remark.leaderNickName}批示`
}

const { push } = useRouter() // 路由

// 响应式数据
const activeTab = ref('lead') // 默认激活"牵头任务"
// 搜索和筛选相关变量
const searchQuery = ref('')
const selectedPriority = ref('')
const detailDialogVisible = ref(false)
const selectedTask = ref(null)
const loading = ref(false)

// 统计数据
const statistics = reactive({
  myTaskCount: 0,
  ongoingCount: 0,
  completedCount: 0,
  overdueCount: 0
})

// 任务列表数据
const taskList = ref([])

// 分页相关
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})

// 优先级选项
const priorityOptions = [
  { label: '一般优先', value: '一般优先' },
  { label: '中优先级', value: '中优先级' },
  { label: '高优先级', value: '高优先级' }
]



// 加载统计数据
const loadStatistics = async () => {
  try {
    console.log('开始调用部门统计数据API...')

    // 先测试现有的API是否工作
    try {
      const testResult = await SupervisionIndexApi.getStatistics()
      console.log('现有统计API测试成功:', testResult)
    } catch (testError) {
      console.error('现有统计API测试失败:', testError)
    }

    // 调用真实API获取部门月度任务统计数据
    const result = await SupervisionIndexApi.getDeptMonthTaskStatistics()
    console.log('部门统计数据API响应:', result)
    console.log('API响应类型:', typeof result)
    console.log('API响应键:', Object.keys(result || {}))

    // 映射API返回的字段到界面显示
    statistics.myTaskCount = result.monthNew // 我的任务
    statistics.ongoingCount = result.monthInProgress // 进行中
    statistics.completedCount = result.monthCompleted // 已完成
    statistics.overdueCount = result.monthOverdue // 超时提醒

    console.log('统计数据更新完成:', statistics)
  } catch (error) {
    console.error('加载统计数据失败', error)
    console.error('错误详情:', error.response || error)
    ElMessage.error('加载统计数据失败: ' + (error.message || error))

    // 如果API调用失败，使用默认值
    statistics.myTaskCount = 0
    statistics.ongoingCount = 0
    statistics.completedCount = 0
    statistics.overdueCount = 0
  }
}

// 获取优先级数值（用于API调用）
const getPriorityValue = (priorityText) => {
  switch (priorityText) {
    case '一般优先': return 1
    case '中优先级': return 2
    case '高优先级': return 3
    default: return null
  }
}

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize
    }
    
    // 添加搜索条件
    if (searchQuery.value) {
      params.orderTitle = searchQuery.value // 使用orderTitle字段进行标题搜索
    }
    
    if (selectedPriority.value) {
      params.priority = getPriorityValue(selectedPriority.value) // 使用priority字段进行优先级筛选
    }

    let result
    if (activeTab.value === 'lead') {
      result = await SupervisionTaskApi.getSupervisionTodoPage(params)
    } else if (activeTab.value === 'co') {
      result = await SupervisionTaskApi.getCoDeptTodoPage(params)
    } else {
      // 已完成标签页，调用 done-page 接口时添加 category 参数
      const doneParams = {
        ...params,
        category: '督查督办'
      }
      result = await SupervisionTaskApi.getSupervisionDonePage(doneParams)
    }

    const tasks = result.list || []

    // 为每个任务获取批示信息
    for (const task of tasks) {
      if (task.processInstanceId) {
        try {
          const remarks = await LeaderRemarkApi.getLeaderRemark(task.processInstanceId)
          task.leaderRemarks = remarks || []
        } catch (error) {
          console.error('获取批示信息失败', error)
          task.leaderRemarks = []
        }
      } else {
        task.leaderRemarks = []
      }
    }

    taskList.value = tasks
    pagination.total = result.total || 0
  } catch (error) {
    console.error('加载任务列表失败', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变更
const handlePageChange = (page) => {
  pagination.pageNo = page
  loadTaskList()
}

// 前端过滤逻辑暂时注释，后期调用后端接口实现
// const filteredTaskList = computed(() => {
//   return taskList.value.filter(task => {
//     // 关键词搜索 - 搜索标题和内容
//     const matchesSearch = !taskSearch.value ||
//       task.supervisionPageVOData?.orderTitle?.toLowerCase().includes(taskSearch.value.toLowerCase()) ||
//       task.supervisionPageVOData?.content?.toLowerCase().includes(taskSearch.value.toLowerCase())

//     // 督办类型过滤
//     const matchesCategory = !taskCategory.value ||
//       task.supervisionPageVOData?.type?.toString() === taskCategory.value

//     return matchesSearch && matchesCategory
//   })
// })

// 暂时直接使用 taskList.value，不进行前端过滤
const filteredTaskList = computed(() => {
  return taskList.value
})

// 处理筛选条件变更逻辑暂时注释
// const handleFilterChange = () => {
//   // 前端过滤，不需要重新请求API
// }

// 处理标签页切换
const handleTabChange = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  selectedPriority.value = ''
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 数据处理辅助方法
const getTaskTitle = (task) => {
  return task.supervisionPageVOData?.orderTitle || task.name || '未知任务'
}

const getTaskContent = (task) => {
  return task.supervisionPageVOData?.content || ''
}

const getOrderCode = (task) => {
  return task.supervisionPageVOData?.orderCode || ''
}

const getStartUserName = (task) => {
  return task.processInstance?.startUser?.nickname || ''
}

const getLeadDeptName = (task) => {
  const leadDeptNameMap = task.supervisionPageVOData?.leadDeptNameMap || {}
  const names = Object.values(leadDeptNameMap)
  return names.length > 0 ? names.join('、') : (task.supervisionPageVOData?.leadDeptName || '未设置')
}

const getCreatorDeptName = (task) => {
  return task.supervisionPageVOData?.creatorDeptName || ''
}

const getCoDeptNames = (task) => {
  const coDeptNameMap = task.supervisionPageVOData?.coDeptNameMap || {}
  const names = Object.values(coDeptNameMap)
  return names.length > 0 ? names.join('、') : '未设置'
}

const getDeadlineText = (task) => {
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) return '无'
  return formatDateOnly(deadline)
}

// 根据任务状态获取截止时间的样式类
const getDeadlineClass = (task) => {
  const status = getStatusText(task)
  if (status === '已超时') {
    return 'deadline-date-overdue' // 红色
  } else if (status === '已结束') {
    return 'deadline-date-finished' // 黑色
  } else if (status === '进行中') {
    return 'deadline-date-processing' // 橙色
  }
  return 'deadline-date' // 默认颜色
}

// 计算精确的剩余时间文本
const getPreciseTimeRemaining = (task) => {
  // 从任务的supervisionPageVOData中获取deadline
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) return null

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const timeDiff = deadlineDate.getTime() - now.getTime()

  // 计算绝对时间差
  const absDiff = Math.abs(timeDiff)
  const totalMinutes = Math.floor(absDiff / (60 * 1000))
  const totalHours = Math.floor(absDiff / (60 * 60 * 1000))
  const totalDays = Math.floor(absDiff / (24 * 60 * 60 * 1000))

  if (timeDiff < 0) {
    // 已超时 - 优先显示更小的时间单位
    if (totalDays >= 1) {
      return `超时${totalDays}天`
    } else if (totalHours >= 1) {
      return `超时${totalHours}小时`
    } else if (totalMinutes >= 1) {
      return `超时${totalMinutes}分钟`
    } else {
      return `刚刚超时`
    }
  } else {
    // 还有剩余时间 - 优先显示更小的时间单位
    if (totalDays >= 1) {
      return `剩余${totalDays}天`
    } else if (totalHours >= 1) {
      return `剩余${totalHours}小时`
    } else if (totalMinutes >= 1) {
      return `剩余${totalMinutes}分钟`
    } else {
      return `即将到期`
    }
  }
}

// 获取剩余时间的样式类
const getPreciseTimeRemainingClass = (task) => {
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) return 'remaining-days'

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const timeDiff = deadlineDate.getTime() - now.getTime()
  const totalHours = Math.abs(Math.floor(timeDiff / (60 * 60 * 1000)))

  if (timeDiff < 0) {
    return 'remaining-days overdue' // 超期显示红色
  } else if (totalHours <= 24) {
    return 'remaining-days urgent' // 24小时内显示橙色
  } else {
    return 'remaining-days' // 正常显示绿色
  }
}



const getPriorityType = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return 'info'    // 一般优先级
  if (priority === 2) return 'warning' // 中优先级
  if (priority === 3) return 'danger'  // 高优先级
  return 'info' // 一般优先级
}

const getPriorityText = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return '一般优先'
  if (priority === 2) return '中优先级'
  if (priority === 3) return '高优先级'
  return '一般优先'
}

const getTypeTag = (task) => {
  const type = task.supervisionPageVOData?.type
  return type === 2 ? 'success' : 'primary'
}

const getTypeText = (task) => {
  const type = task.supervisionPageVOData?.type
  return type === 2 ? '专项督办' : '工作督办'
}

// 获取任务状态类型（用于标签颜色）
const getStatusType = (task) => {
  const status = getStatusText(task)
  const types = {
    '进行中': 'warning',
    '已结束': 'success',
    '已超时': 'danger'
  }
  return types[status] || 'info'
}

// 获取任务状态文本
const getStatusText = (task) => {
  // 已完成标签页中的任务都显示"已结束"
  if (activeTab.value === 'done') {
    return '已结束'
  }

  // 牵头任务和协办任务标签页中的任务根据截止时间判断状态（精确到分钟）
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) {
    return '进行中' // 没有截止时间默认为进行中
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()

  // 使用精确时间比较（精确到分钟）
  if (now > deadlineDate) {
    return '已超时'
  } else {
    return '进行中'
  }
}

const formatCreateTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDateOnly(timestamp)
}

const formatEndTime = (timestamp) => {
  if (!timestamp) return ''
  return dateFormatter(null, null, timestamp)
}

// 获取督办状态用于详情弹窗显示（与外面状态标签保持一致）
const getSupervisionStatusForDialog = (task) => {
  // 直接返回与外面状态标签一致的状态文本
  return getStatusText(task)
}

// 任务详情相关
const viewTaskDetail = async (task) => {
  try {
    // 转换数据格式以匹配SupervisionDetailDialog组件期望的格式
    const supervisionData = task.supervisionPageVOData || {}
    const coDeptNames = Object.values(supervisionData.coDeptNameMap || {})

    selectedTask.value = {
      id: supervisionData.id,
      title: supervisionData.orderTitle || '未知任务',
      description: supervisionData.content || '',
      mainContent: supervisionData.content || '',
      undertakingContent: supervisionData.undertakeMatter || '',
      leadDepartment: supervisionData.leadDeptName || '',
      assistDepartments: coDeptNames,
      collaborators: coDeptNames,
      supervisor: supervisionData.leaderNickname || '',
      priority: getPriorityText(task),
      deadline: supervisionData.deadline ? dateFormatter(null, null, supervisionData.deadline) : '无',
      deadlineTimestamp: supervisionData.deadline, // 添加原始时间戳
      createTime: dateFormatter(null, null, task.createTime),
      createdDate: dateFormatter(null, null, task.createTime),
      orderNumber: supervisionData.orderCode || '',
      processInstanceId: task.processInstance?.id || task.processInstanceId,
      // 添加流程实例信息以匹配组件期望的数据结构
      processInstance: {
        id: task.processInstance?.id || task.processInstanceId
      },
      // 添加原型需要的字段
      issueUnit: supervisionData.creatorDeptName || '', // 下发单位
      coDeptNameMap: supervisionData.coDeptNameMap || {}, // 协办部门映射
      // 添加督办状态，用于详情弹窗中的状态显示
      supervisionStatus: getSupervisionStatusForDialog(task)
    }
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取任务详情失败', error)
    ElMessage.error('获取任务详情失败')
  }
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedTask.value = null
}

// 处理审批按钮（保持工作流功能）
const handleAudit = (task) => {
  // 督办相关流程跳转到督办专用工作流详情页面
  if (task.processInstance?.processDefinitionKey === 'supervision' ||
      task.processInstance?.name?.includes('督办') ||
      task.processInstance?.category?.includes('督办')) {
    push({
      name: 'SupervisionWorkflowDetail',
      params: {
        id: task.processInstance.id
      },
      query: {
        taskId: task.id
      }
    })
  } else {
    // 其他流程使用原来的页面
    push({
      name: 'BpmProcessInstanceDetail',
      query: {
        id: task.processInstance.id,
        taskId: task.id
      }
    })
  }
}

// 初始化
onMounted(() => {
  // 加载统计数据
  loadStatistics()
  // 加载任务列表
  loadTaskList()
})
</script>

<style scoped>
.task-dashboard {
  padding: 20px;
}

.stats-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 16px;
  color: #303133;
}

.title-icon {
  margin-right: 8px;
  font-size: 20px;
  color: #409eff;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.my-tasks {
  border-left: 4px solid #409eff;
}

.stat-card.ongoing {
  border-left: 4px solid #e6a23c;
}

.stat-card.completed {
  border-left: 4px solid #67c23a;
}

.stat-card.overdue {
  border-left: 4px solid #f56c6c;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 28px;
}

.stat-card.my-tasks .stat-icon {
  color: #409eff;
}

.stat-card.ongoing .stat-icon {
  color: #e6a23c;
}

.stat-card.completed .stat-icon {
  color: #67c23a;
}

.stat-card.overdue .stat-icon {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.task-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.task-header-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.inline-tabs {
  min-width: 300px;
}

/* 标签页文字样式 */
.inline-tabs :deep(.el-tabs__item) {
  font-size: 20px;        /* 调整文字大小 */
  font-weight: 500;       /* 调整文字粗细：normal(400), 500, 600, bold(700) */
  color: black;         /* 未激活状态文字颜色 */
}

/* 激活状态的标签页文字样式 */
.inline-tabs :deep(.el-tabs__item.is-active) {
  font-size: 20px;        /* 激活状态文字大小 */
  font-weight: 500;       /* 激活状态文字粗细 */
  color: #409EFF;         /* 激活状态文字颜色 */
}

.task-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.task-search {
  width: 220px;
}

.task-filter {
  width: 130px;
}



.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  margin-bottom: 16px;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-title {
  margin: 0;
  font-size: 20px; /* 与首页保持一致 */
  font-weight: bold; /* 与首页保持一致 */
  cursor: pointer;
  color: #303133;
  transition: color 0.3s;
}

.task-title:hover {
  color: #409eff;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-description {
  margin-bottom: 0;
}

.description-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.leadership-instruction {
  margin-bottom: 12px;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
}

.task-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.detail-item .el-icon {
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.detail-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.deadline-date {
  color: #E6A23C;
  font-size: 14px;
  font-weight: 500;
}

/* 截止时间颜色样式 */
.deadline-date-overdue {
  color: #F56C6C; /* 红色 - 已超时 */
  font-size: 14px;
  font-weight: 500;
}

.deadline-date-finished {
  color: #303133; /* 黑色 - 已结束 */
  font-size: 14px;
  font-weight: 500;
}

.deadline-date-processing {
  color: #E6A23C; /* 橙色 - 进行中 */
  font-size: 14px;
  font-weight: 500;
}



.supervisor {
  font-weight: 500;
}

.deadline {
  margin-left: auto;
}

.deadline-date {
  color: #409eff;
  font-weight: 500;
}

.remaining-days {
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.remaining-days.overdue {
  color: #f56c6c;
  font-weight: 600;
}

.remaining-days.urgent {
  color: #e6a23c;
  font-weight: 600;
}

.task-buttons {
  display: flex;
  gap: 8px;
}

.no-tasks-message {
  padding: 40px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* Element Plus 卡片样式调整 */
:deep(.el-card__body) {
  padding: 24px; /* 与首页保持一致 */
}

@media (max-width: 768px) {
  .task-header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-controls {
    margin-top: 12px;
    width: 100%;
  }
  
  .task-search, .task-filter {
    width: 100%;
  }
  
  .task-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-buttons {
    margin-top: 16px;
  }
}

/* 批示显示样式 - 横向布局，橙色主题 */
.task-remarks {
  margin: 8px 0;
  padding: 6px 10px;
  background-color: #fff7e6;
  border-radius: 4px;
  border-left: 3px solid #faad14;
  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 70%;
}

.task-remarks .el-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #d46b08;
  flex-shrink: 0;
}

.remark-item {
  display: inline;
}

.remark-text {
  font-size: 13px;
  font-weight: bold;
  color: #8c4400;
  line-height: 1.4;
}

/* Element Plus 卡片样式调整 */
:deep(.el-card__body) {
  padding: 24px; /* 与督办单列表页面保持一致 */
}
</style>

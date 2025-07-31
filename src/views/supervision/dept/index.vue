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
        <div class="task-controls">
          <el-input
            v-model="taskSearch"
            placeholder="输入搜索关键词"
            class="task-search"
            :prefix-icon="Search"
            @input="handleFilterChange"
          />
          <el-select v-model="taskCategory" placeholder="请选择督办类型" class="task-filter" @change="handleFilterChange">
            <el-option label="全部类型" value="" />
            <el-option label="工作督办" value="1" />
            <el-option label="专项督办" value="2" />
          </el-select>
          <el-button :icon="Bell">一键提醒</el-button>
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
            <h4 class="task-title" @click="viewTaskDetail(task)">{{ getTaskTitle(task) }}</h4>
            <div class="task-actions">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium w-20 text-center',
                  getPriorityText(task) === '高优先级' ? 'bg-red-100 text-red-800' :
                  getPriorityText(task) === '中优先级' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                ]"
                style="font-weight: bold;">
                {{ getPriorityText(task) }}
              </span>
              <span
                :class="[
                  'ml-2 px-2 py-1 rounded text-xs font-medium w-20 text-center',
                  getStatusText(task) === '已超时' ? 'bg-red-100 text-red-800' :
                  getStatusText(task) === '已结束' ? 'bg-gray-500 text-white' :
                  getStatusText(task) === '进行中' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                ]"
                style="font-weight: bold;">
                {{ getStatusText(task) }}
              </span>
            </div>
          </div>
          <div class="task-description" v-if="getTaskContent(task)">
            <p class="description-text">{{ getTaskContent(task) }}</p>
          </div>

          <!-- 批示显示区域 - 移到主要内容下方 -->
          <div v-if="task.leaderRemarks && task.leaderRemarks.length > 0" class="task-remarks">
            <el-icon><Document /></el-icon>
            <span v-for="(remark, index) in task.leaderRemarks" :key="remark.leaderNickName" class="remark-text">
              <span v-if="index > 0">；</span>{{ remark.leaderNickName }}批示：{{ remark.remark }}
            </span>
          </div>

          <div class="task-content">
            <div class="task-details">
              <div class="detail-row">
                <div class="detail-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span class="detail-label">下发单位：</span>
                  <span class="detail-value">{{ getCreatorDeptName(task) }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><User /></el-icon>
                  <span class="detail-label">协办部门：</span>
                  <span class="detail-value">{{ getCoDeptNames(task) }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><User /></el-icon>
                  <span class="detail-label">分管领导：</span>
                  <span class="detail-value">{{ task.supervisionPageVOData?.leaderNickname || '' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">截止时间：</span>
                  <span :class="getDeadlineClass(task)">{{ getDeadlineText(task) }}</span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">创建时间：</span>
                  <span class="detail-value">{{ formatCreateTime(task.createTime) }}</span>
                </div>
                <div v-if="activeTab !== 'done'" class="detail-item">
                  <span :class="getRemainingTimeClass(task)">{{ getRemainingTimeText(task) }}</span>
                </div>
              </div>
            </div>

            <div class="task-buttons">
              <el-button size="small" @click="viewTaskDetail(task)">查看详情</el-button>
              <el-button v-if="activeTab === 'lead' || activeTab === 'co'" size="small" type="primary" @click="handleAudit(task)">办理</el-button>
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
import { SupervisionTaskApi, LeaderRemarkApi } from '@/api/supervision/index'
import { dateFormatter } from '@/utils/formatTime'
import { ElMessage } from 'element-plus'

// 格式化日期，只显示年月日
const formatDateOnly = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const { push } = useRouter() // 路由

// 响应式数据
const activeTab = ref('lead') // 默认激活"牵头任务"
const taskSearch = ref('')
const taskCategory = ref('')
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



// 加载统计数据
const loadStatistics = async () => {
  try {
    // 使用模拟数据
    statistics.myTaskCount = 12
    statistics.ongoingCount = 8
    statistics.completedCount = 15
    statistics.overdueCount = 2
  } catch (error) {
    console.error('加载统计数据失败', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize
      // 移除搜索参数，改为前端过滤
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
        category: '督察督办'
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

// 前端过滤的计算属性
const filteredTaskList = computed(() => {
  return taskList.value.filter(task => {
    // 关键词搜索 - 搜索标题和内容
    const matchesSearch = !taskSearch.value ||
      task.supervisionPageVOData?.orderTitle?.toLowerCase().includes(taskSearch.value.toLowerCase()) ||
      task.supervisionPageVOData?.content?.toLowerCase().includes(taskSearch.value.toLowerCase())

    // 督办类型过滤
    const matchesCategory = !taskCategory.value ||
      task.supervisionPageVOData?.type?.toString() === taskCategory.value

    return matchesSearch && matchesCategory
  })
})

// 处理筛选条件变更 - 改为前端过滤，不重新请求API
const handleFilterChange = () => {
  // 前端过滤，不需要重新请求API
}

// 处理标签页切换
const handleTabChange = () => {
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
  return task.supervisionPageVOData?.leadDeptName || ''
}

const getCreatorDeptName = (task) => {
  return task.supervisionPageVOData?.creatorDeptName || ''
}

const getCoDeptNames = (task) => {
  const coDeptNameMap = task.supervisionPageVOData?.coDeptNameMap || {}
  const names = Object.values(coDeptNameMap)
  return names.length > 0 ? names.join('、') : '无'
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

const getRemainingTimeText = (task) => {
  const deadline = task.supervisionPageVOData?.deadline
  const createTime = task.createTime

  if (!deadline || !createTime) return ''

  const deadlineDate = new Date(deadline)
  const createDate = new Date(createTime)
  const now = new Date()

  // 计算剩余时间（以天为单位）
  const remainingMs = deadlineDate.getTime() - now.getTime()
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

  if (remainingDays > 0) {
    return `剩余${remainingDays}天`
  } else if (remainingDays === 0) {
    return '今日到期'
  } else {
    return `超期${Math.abs(remainingDays)}天`
  }
}

const getRemainingTimeClass = (task) => {
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) return 'remaining-days'

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const remainingMs = deadlineDate.getTime() - now.getTime()
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

  if (remainingDays < 0) {
    return 'remaining-days overdue' // 超期显示红色
  } else if (remainingDays === 0) {
    return 'remaining-days urgent' // 今日到期显示橙色
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

  // 牵头任务和协办任务标签页中的任务根据截止时间判断状态
  const deadline = task.supervisionPageVOData?.deadline
  if (!deadline) {
    return '进行中' // 没有截止时间默认为进行中
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()

  // 如果当前时间超过截止时间，显示"已超时"，否则显示"进行中"
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
  margin-bottom: 12px;
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
  margin-bottom: 12px;
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

.remark-text {
  font-size: 13px;
  font-weight: bold;
  color: #8c4400;
  line-height: 1.4;
}
</style>

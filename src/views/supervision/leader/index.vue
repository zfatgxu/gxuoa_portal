<template>
  <div class="supervision-dashboard">
    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">
        <el-icon class="title-icon"><DataAnalysis /></el-icon>
        本月督办情况
      </h3>
      <div class="stats-cards">
        <el-card class="stat-card managed-items">
          <div class="stat-content">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-label">我的分管事项</div>
              <div class="stat-number">{{ filteredTaskListByTab('managed-items').length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card ongoing">
          <div class="stat-content">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-number">{{ filteredTaskListByStatus('进行中').length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card instructed">
          <div class="stat-content">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已批示</div>
              <div class="stat-number">{{ filteredTaskListByInstruction().length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card attention">
          <div class="stat-content">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">需要关注</div>
              <div class="stat-number">{{ filteredTaskListByTab('attention-items').length }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Task Management Section -->
    <div class="task-section">
      <div class="task-header-controls">
        <el-tabs v-model="activeTab" class="inline-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="全部事项" name="all-items" />
          <el-tab-pane label="需要关注" name="attention-items" />
        </el-tabs>
        <div class="control-group">
          <el-input
            v-model="searchQuery"
            placeholder="输入搜索关键词"
            class="task-search"
            :prefix-icon="Search"
            @input="handleFilterChange"
          />
          <el-select
            v-model="selectedDepartment"
            placeholder="全部部门"
            class="task-filter dept-filter"
            @change="handleFilterChange"
            popper-class="dept-dropdown"
            clearable
          >
            <el-option label="全部部门" value="" />
            <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
            />
          </el-select>
          <el-select
            v-model="selectedStatus"
            placeholder="全部状态"
            class="task-filter status-filter"
            @change="handleFilterChange"
            popper-class="status-dropdown"
            clearable
          >
            <el-option label="全部状态" value="" />
            <el-option
              v-for="status in statuses"
              :key="status"
              :label="status"
              :value="status"
            />
          </el-select>

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
                  getStatusText(task) === '需要关注' ? 'bg-red-100 text-red-800' :
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
            <span class="remark-label">我的批示：</span>
            <span v-for="(remark, index) in task.leaderRemarks" :key="remark.leaderNickName" class="remark-text">
              <span v-if="index > 0">；</span>{{ remark.remark }}
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
                <div v-if="activeTab !== 'attention-items' && getStatusText(task) !== '已结束'" class="detail-item">
                  <span :class="getRemainingTimeClass(task)">{{ getRemainingTimeText(task) }}</span>
                </div>
              </div>
            </div>

            <div class="task-buttons">
              <el-button size="small" @click="viewTaskDetail(task)">查看详情</el-button>
              <el-button v-if="getStatusText(task) !== '已结束'" size="small" type="primary" @click="addInstruction(task)">新增批示</el-button>
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
      :process-instance-id="selectedTask?.processInstanceId"
      :supervision-status="selectedTask?.supervisionStatus"
      @close="handleDetailClose"
    />

    <!-- Add Instruction Dialog -->
    <el-dialog
      v-model="instructionDialogVisible"
      title="新增批示"
      width="60%"
    >
      <el-form :model="instructionForm" label-width="100px">
        <el-form-item label="批示内容">
          <el-input
            v-model="instructionForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入批示内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="instructionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInstruction">确定</el-button>
      </template>
    </el-dialog>

    <!-- History Dialog -->
    <el-dialog
      v-model="historyDialogVisible"
      title="历史记录"
      width="80%"
    >
      <div class="history-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in historyList"
            :key="index"
            :timestamp="item.time"
            :type="item.type"
          >
            <div class="history-item">
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
              <div class="history-meta">
                <span>操作人：{{ item.operator }}</span>
                <span>部门：{{ item.department }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, DataAnalysis, Document, Clock, CircleCheck, Warning,
  OfficeBuilding, User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SupervisionDetailDialog from '../components/SupervisionDetailDialog.vue'
import { SupervisionTaskApi, LeaderRemarkApi } from '@/api/supervision/index'
import { dateFormatter } from '@/utils/formatTime'

// 格式化日期，只显示年月日
const formatDateOnly = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Reactive data
const activeTab = ref('all-items') // 默认激活“分管事项”
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const detailDialogVisible = ref(false)
const instructionDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const selectedTask = ref(null)
const loading = ref(false)

const instructionForm = reactive({
  content: ''
})

// 分页相关
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})

// 模拟当前用户的部门，用于“协办任务”过滤


// 任务列表数据
const taskList = ref([])

const historyList = ref([])

// 静态状态选项
const statuses = ['进行中', '已超时', '已结束', '需要关注']

// 计算部门选项 - 从任务数据中提取部门名称
const departments = computed(() => {
  const deptSet = new Set()
  taskList.value.forEach(task => {
    // 添加牵头单位
    if (task.supervisionPageVOData?.leadDeptName) {
      deptSet.add(task.supervisionPageVOData.leadDeptName)
    }
    // 添加创建单位
    if (task.supervisionPageVOData?.creatorDeptName) {
      deptSet.add(task.supervisionPageVOData.creatorDeptName)
    }
    // 添加协办单位
    if (task.supervisionPageVOData?.coDeptNameMap) {
      Object.values(task.supervisionPageVOData.coDeptNameMap).forEach(dept => {
        if (dept) deptSet.add(dept)
      })
    }
  })
  return Array.from(deptSet)
})

// 前端过滤的计算属性 - 参考督查督办首页的实现
const filteredTaskList = computed(() => {
  return taskList.value.filter(task => {
    // 关键词搜索 - 搜索标题和内容（参考督查督办首页）
    const matchesSearch = !searchQuery.value ||
      task.supervisionPageVOData?.orderTitle?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.supervisionPageVOData?.content?.toLowerCase().includes(searchQuery.value.toLowerCase())

    // 部门过滤 - 检查牵头单位、创建单位和协办单位（参考督查督办首页）
    const matchesDepartment = !selectedDepartment.value ||
      task.supervisionPageVOData?.leadDeptName === selectedDepartment.value ||
      task.supervisionPageVOData?.creatorDeptName === selectedDepartment.value ||
      Object.values(task.supervisionPageVOData?.coDeptNameMap || {}).includes(selectedDepartment.value)

    // 状态过滤（参考督查督办首页）
    const matchesStatus = !selectedStatus.value || getStatusText(task) === selectedStatus.value

    return matchesSearch && matchesDepartment && matchesStatus
  })
})

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo || 1,
      pageSize: pagination.pageSize || 10,
      category: '督察督办'
    }

    console.log('API请求参数:', params) // 添加调试日志

    let result
    if (activeTab.value === 'all-items') {
      result = await SupervisionTaskApi.getAllTasksPage(params)
    } else if (activeTab.value === 'attention-items') {
      result = await SupervisionTaskApi.getAttentionTasksPage(params)
    }

    console.log('API响应结果:', result) // 添加调试日志
    console.log('返回的任务数量:', result?.list?.length) // 检查实际返回的任务数量
    console.log('返回的总数:', result?.total) // 检查返回的总数

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

// 处理标签页切换
const handleTabChange = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 处理筛选条件变更 - 前端过滤，不重新请求API
const handleFilterChange = () => {
  // 前端过滤，不需要重新请求API
}

// 数据处理辅助方法
const getTaskTitle = (task) => {
  return task.supervisionPageVOData?.orderTitle || task.name || '未知任务'
}

const getTaskContent = (task) => {
  return task.supervisionPageVOData?.content || ''
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
  } else if (status === '进行中' || status === '需要关注') {
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

const getPriorityText = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return '一般优先'
  if (priority === 2) return '中优先级'
  if (priority === 3) return '高优先级'
  return '一般优先'
}

const formatCreateTime = (timestamp) => {
  if (!timestamp) return ''
  return formatDateOnly(timestamp)
}

// Methods
const getPriorityType = (task) => {
  const priority = task.supervisionPageVOData?.priority
  if (priority === 1) return 'info'    // 一般优先级
  if (priority === 2) return 'warning' // 中优先级
  if (priority === 3) return 'danger'  // 高优先级
  return 'info' // 一般优先级
}

// 获取任务状态类型（用于标签颜色）
const getStatusType = (task) => {
  const status = getStatusText(task)
  const types = {
    '进行中': 'warning',
    '已结束': 'success',
    '已超时': 'danger',
    '需要关注': 'danger'
  }
  return types[status] || 'info'
}

// 获取任务状态文本
const getStatusText = (task) => {
  // 需要关注标签页中的任务都显示"需要关注"
  if (activeTab.value === 'attention-items') {
    return '需要关注'
  }

  // 全部事项标签页中根据taskType判断状态
  const taskType = task.taskType

  if (taskType === 'done') {
    return '已结束'
  }

  if (taskType === 'todo') {
    // 检查是否超时
    const deadline = task.supervisionPageVOData?.deadline
    if (deadline) {
      const deadlineDate = new Date(deadline)
      const now = new Date()

      if (now > deadlineDate) {
        return '已超时'
      }
    }
    return '进行中'
  }

  // 默认情况（兼容旧数据）
  return '进行中'
}

// 获取督办状态用于详情弹窗显示（与外面状态标签保持一致）
const getSupervisionStatusForDialog = (task) => {
  // 直接返回与外面状态标签一致的状态文本
  return getStatusText(task)
}

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
      status: getStatusText(task), // 添加状态信息
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
      taskType: task.taskType, // 添加任务类型信息
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

const addInstruction = (task) => {
  selectedTask.value = task
  instructionDialogVisible.value = true
}

const submitInstruction = async () => {
  if (!instructionForm.content.trim()) {
    ElMessage.warning('请输入批示内容')
    return
  }

  try {
    // 调用新增批示API
    await LeaderRemarkApi.insertLeaderRemark({
      processInstanceId: selectedTask.value.processInstanceId,
      remark: instructionForm.content.trim()
    })

    ElMessage.success('批示已提交')
    instructionDialogVisible.value = false

    // 重置表单
    instructionForm.content = ''

    // 重新加载任务列表以显示最新批示
    await loadTaskList()
  } catch (error) {
    console.error('提交批示失败', error)
    ElMessage.error('提交批示失败')
  }
}

const showMoreHistory = () => {
  historyDialogVisible.value = true
}

const handleScroll = (event) => {
  // 处理滚动事件
  console.log('Content scrolled:', event.target.scrollTop)
}

// Helper computed properties for statistics cards
const filteredTaskListByTab = (tabName) => {
  let filtered = taskList.value;
  if (tabName === 'managed-items') {
    filtered = filtered.filter(task => task.supervisionPageVOData?.leaderNickname === '张副校长');
  } else if (tabName === 'attention-items') {
    filtered = filtered.filter(task => task.supervisionPageVOData?.priority === 3);
  }
  return filtered;
};

const filteredTaskListByStatus = (status) => {
  return taskList.value.filter(task => getStatusText(task) === status);
};

const filteredTaskListByInstruction = () => {
  return taskList.value.filter(task => task.instruction);
};

// 初始化
onMounted(() => {
  // 加载任务列表
  loadTaskList()
})
</script>

<style scoped>
.supervision-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.stats-section {
  margin-bottom: 30px;
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

.stat-card.managed-items {
  border-left: 4px solid #409eff;
}

.stat-card.ongoing {
  border-left: 4px solid #e6a23c;
}

.stat-card.instructed {
  border-left: 4px solid #67c23a;
}

.stat-card.attention {
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

.stat-card.managed-items .stat-icon {
  color: #409eff;
}

.stat-card.ongoing .stat-icon {
  color: #e6a23c;
}

.stat-card.instructed .stat-icon {
  color: #67c23a;
}

.stat-card.attention .stat-icon {
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
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.inline-tabs {
  flex-shrink: 0;
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

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.task-search {
  width: 250px;
}

.task-filter {
  width: 150px;
}

.more-btn {
  color: #409eff;
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
  font-size: 20px; /* 与部门界面保持一致 */
  font-weight: bold; /* 与部门界面保持一致 */
  cursor: pointer;
  color: #303133;
  transition: color 0.3s;
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

.task-title {
  cursor: pointer;
}

.task-title:hover {
  color: #409eff;
}

.remaining-days.overdue {
  color: #f56c6c;
  font-weight: 600;
}

.remaining-days.urgent {
  color: #e6a23c;
  font-weight: 600;
}

.supervisor {
  color: #409eff; /* 蓝色样式 */
  font-weight: 500;
}

.deadline {
  margin-left: auto;
  color: #303133;
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

.remaining-days {
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
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
  padding: 24px; /* 与部门界面保持一致 */
}

@media (max-width: 768px) {
  .task-header-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group {
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





.history-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.history-btn {
  color: #409eff;
  font-size: 14px;
}

.history-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.history-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.history-item p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.history-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.no-tasks-message {
  text-align: center;
  padding: 50px;
  color: #909399;
  font-size: 16px;
}

/* Element Plus 深度选择器 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0; /* 确保标签页头部没有额外底部间距 */
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 0; /* 确保标签页导航包裹器没有额外底部间距 */
}

:deep(.el-alert) {
  margin: 0;
  border-radius: 6px;
}

:deep(.el-alert__content) {
  font-size: 13px;
}

:deep(.el-alert--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
}

:deep(.el-alert--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
}

:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

/* 批示显示样式 - 横向布局，蓝色主题 */
.task-remarks {
  margin: 8px 0;
  padding: 6px 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 70%;
}

.task-remarks .el-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #409eff;
  flex-shrink: 0;
}

.remark-label {
  font-size: 13px;
  font-weight: bold;
  color: #409eff;
  margin-right: 4px;
}

.remark-text {
  font-size: 13px;
  font-weight: bold;
  color: #409eff;
  line-height: 1.4;
}

:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}

/* 只对非督办详情弹窗应用此样式 */
:deep(.el-dialog:not(.supervision-detail-dialog) .el-dialog__body) {
  padding: 15px 20px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
}
</style>

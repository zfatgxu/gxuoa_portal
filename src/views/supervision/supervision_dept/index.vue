<template>
<div class="min-h-screen bg-gray-50 p-6">
    <!-- Statistics Cards -->
<div class="grid grid-cols-[1fr_1fr_2fr] gap-6 mb-8">
    <!-- Total Tasks Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
        <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
        <h3 class="text-gray-700 font-medium">督办任务合计</h3>
        </div>
        <div class="flex items-center justify-center">
        <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="8" fill="none"/>
            <!-- Progress circle for 工作督办 -->
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#f59e0b" 
              stroke-width="8" 
              fill="none"
              :stroke-dasharray="workSupervisionDashArray"
              stroke-linecap="round"
            />
            <!-- Progress circle for 专项督查 -->
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#3b82f6" 
              stroke-width="8" 
              fill="none"
              :stroke-dasharray="specialSupervisionDashArray"
              :stroke-dashoffset="specialSupervisionDashOffset"
              stroke-linecap="round"
            />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-gray-800">{{ taskStats.total }}</span>
            <span class="text-sm text-gray-500">全部数据</span>
            </div>
        </div>
        <div class="ml-6 space-y-2">
            <div class="flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span class="text-sm text-gray-600">工作督办</span>
            <span class="ml-2 text-sm font-medium">{{ taskStats.workSupervision }}</span>
            </div>
            <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span class="text-sm text-gray-600">专项督查</span>
            <span class="ml-2 text-sm font-medium">{{ taskStats.specialSupervision }}</span>
            </div>
        </div>
        </div>
    </div>

    <!-- Task Status Statistics Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
        <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
        <h3 class="text-gray-700 font-medium">本月督办任务状态统计</h3>
        </div>
        <div class="flex items-center justify-center">
        <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="35" stroke="#e5e7eb" stroke-width="12" fill="none"/>
            <!-- Status segments -->
            <circle 
              cx="50" 
              cy="50" 
              r="35" 
              stroke="#3b82f6" 
              stroke-width="12" 
              fill="none"
              :stroke-dasharray="statusInProgressDashArray"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="35" 
              stroke="#ef4444" 
              stroke-width="12" 
              fill="none"
              :stroke-dasharray="statusOverdueDashArray"
              :stroke-dashoffset="statusOverdueDashOffset"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="35" 
              stroke="#10b981" 
              stroke-width="12" 
              fill="none"
              :stroke-dasharray="statusCompletedDashArray"
              :stroke-dashoffset="statusCompletedDashOffset"
            />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-xl font-bold text-gray-800">{{ statusStats.total }}</span>
            <span class="text-xs text-gray-500">全部数据</span>
            </div>
        </div>
        <div class="ml-4 space-y-1 text-sm">
            <div class="flex items-center space-x-3">
            <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span class="text-gray-600">进行中</span>
            </div>
            <span class="font-medium">{{ statusStats.inProgress }}</span>
            </div>
            <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span class="text-gray-600">已超时</span>
            </div>
            <span class="font-medium">{{ statusStats.overdue }}</span>
            </div>
            <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span class="text-gray-600">已结束</span>
            </div>
            <span class="font-medium">{{ statusStats.completed }}</span>
            </div>
        </div>
        </div>
    </div>

    <!-- Monthly Status Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
        <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
        <h3 class="text-gray-700 font-medium">本月督办情况</h3>
        </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-blue-500"><Calendar /></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-md text-gray-600">本月新增</span>
                <span class="text-2xl font-bold text-blue-600">{{ monthlyStats.newTasks }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-orange-500"><Clock /></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">进行中</span>
                <span class="text-2xl font-bold text-orange-600">{{ monthlyStats.inProgress }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-green-500"><CheckCircle /></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">已完成</span>
                <span class="text-2xl font-bold text-green-600">{{ monthlyStats.completed }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-red-500"><TimerOff /></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">已超时</span>
                <span class="text-2xl font-bold text-red-600">{{ monthlyStats.overdue }}</span>
            </div>
        </div>
      </div>
    </div>
</div>

    <!-- Tabs and Filters -->
    <div class="bg-white rounded-lg shadow-sm">
    <div>
        <div class="task-header-row px-6 pt-6 pb-0">
        <div class="flex items-center -ml-3">
          <el-tabs v-model="activeTab" class="tabs-custom">
            <el-tab-pane 
              v-for="tab in tabs" 
              :key="tab.key" 
              :label="tab.label" 
              :name="tab.key"
            />
          </el-tabs>
<!--          <div class="flex items-center ml-4">-->
<!--            <el-button-->
<!--              class="rounded-md"-->
<!--              :style="{ backgroundColor: 'rgb(64,149,229)', borderColor: 'rgb(64,149,229)', color: '#fff', height: '30px', padding: '0 14px', fontSize: '13px', fontWeight: '600' }"-->
<!--              @click="goToCreate"-->
<!--            >-->
<!--              新建督办-->
<!--            </el-button>-->
<!--          </div>-->
        </div>
        <!-- 搜索和筛选功能（响应式布局） -->
        <div class="task-controls">
            <span class="text-gray-700 font-medium">督办事项</span>
            <el-input 
                v-model="searchQuery" 
                placeholder="请输入督办事项" 
                style="width: 200px;"
            />
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
            <span class="text-gray-700 font-medium">督办状态</span>
            <el-select 
                v-model="selectedSupervisionStatus" 
                placeholder="全部状态" 
                clearable 
                style="width: 150px;"
            >
                <el-option
                    v-for="status in supervisionStatusOptions"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                />
            </el-select>
            <el-button type="primary" @click="handleSearch">
                查询
            </el-button>
            <el-button @click="handleReset">
                重置
            </el-button>
            <el-button type="primary" plain @click="openSeniorFilter">
                <el-icon class="mr-1"><Filter /></el-icon>
                高级筛选
            </el-button>
        </div>
        </div>
      </div>

      <!-- 状态筛选按钮组 -->
      <div class="px-6 pt-4 pb-2 border-b border-gray-200">
        <div class="flex items-center">
          <div class="flex space-x-4">
            <button
              @click="toggleStatusFilter('pendingReview')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
              :style="{
                backgroundColor: statusFilters.pendingReview ? '#39A8F9' : '#9A9A9A'
              }"
            >
              待审核
            </button>
            <button
              @click="toggleStatusFilter('inProgress')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
              :style="{
                backgroundColor: statusFilters.inProgress ? '#39A8F9' : '#9A9A9A'
              }"
            >
              进行中
            </button>
            <button
              @click="toggleStatusFilter('overdue')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
              :style="{
                backgroundColor: statusFilters.overdue ? '#39A8F9' : '#9A9A9A'
              }"
            >
              已超时
            </button>
            <button
              @click="toggleStatusFilter('completed')"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-white border-0 outline-none hover:shadow-md cursor-pointer"
              :style="{
                backgroundColor: statusFilters.completed ? '#39A8F9' : '#9A9A9A'
              }"
            >
              已结束
            </button>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="p-6">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
          style="border: 1px solid #e5e7eb;"
          @click="navigateToWorkflowDetail(task)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center">
                  <button 
                    @click.stop="handleCategoryClick(task.type)"
                    :style="{
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: task.type === 'work' || task.type === 1 ? 'rgb(27, 173, 255)' : 'rgb(129, 179, 55)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }"
                    class="hover:opacity-80 mr-2"
                  >
                    {{ task.type === 'work' || task.type === 1 ? '工作督办' : '专项督查' }}
                  </button>
                  <h4 class="text-xl font-bold text-gray-900 mr-4">{{ task.title }}</h4>
                </div>
                <div class="flex items-center">
                  <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium w-20 flex items-center justify-center',
                    'text-white'
                  ]"
                  :style="{
                    fontWeight: 'bold',
                    backgroundColor: task.priority === '高优先级' ? 'rgb(179, 55, 55)' :
                                   task.priority === '中优先级' ? 'rgb(129, 179, 55)' :
                                   task.priority === '一般优先' ? 'rgb(64, 149, 229)' :
                                   'rgb(64, 149, 229)'
                  }">
                  {{ task.priority }}
                  </span>
                  <span
                  :class="[
                    'ml-2 px-2 py-1 rounded text-xs font-medium w-20 flex items-center justify-center',
                    'text-white'
                  ]"
                  :style="{
                    fontWeight: 'bold',
                    backgroundColor: task.status === '已超时' ? 'rgb(179, 55, 55)' :
                                   task.status === '已结束' ? 'rgb(154, 154, 154)' :
                                   task.status === '进行中' ? 'rgb(129, 179, 55)' :
                                   task.status === '待审核' ? 'rgb(99, 102, 241)' :
                                   'rgb(154, 154, 154)'
                  }">
                  {{ task.status }}
                  </span>
                </div>  
              </div>
              
              <!-- 描述 + 批示 同行展示 -->
              <div
                class="task-desc-row mb-7"
                v-if="getDisplayText(task) || getRemarks(task).length > 0"
              >
                <el-tooltip 
                  class="desc-box"
                  :content="getDisplayText(task)" 
                  :disabled="getDisplayText(task).length <= 45"
                  placement="bottom"
                  effect="dark"
                >
                  <span class="text-gray-600 leading-relaxed desc-text inline-block">{{ getTruncatedText(task) }}</span>
                </el-tooltip>

                <div v-if="getRemarks(task).length > 0" class="task-remarks inline-remarks">
                  <el-icon class="remark-icon"><Document /></el-icon>
                  <el-tooltip 
                    :content="getAllRemarksFullText(task)"
                    placement="bottom"
                    effect="dark"
                  >
                    <span class="remark-item">
                      <span class="remark-label">{{ getFirstRemarkLabel(task) }}：</span>
                      <span class="remark-text">{{ getFirstRemarkTruncatedText(task) }}</span>
                    </span>
                  </el-tooltip>
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-6 flex-wrap">
                  <div class="flex items-center">
                    <span class="text-gray-500">创建时间：</span>
                    <span class="text-gray-700">{{ task.createdDate }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500">截止时间：</span>
                    <span :class="getDeadlineColorClass(task)">
                      {{ task.deadline }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span v-if="getPreciseTimeRemaining(task)" :class="getPreciseTimeRemainingClass(task)">
                      {{ getPreciseTimeRemaining(task) }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500">协办部门：</span>
                    <span class="text-gray-700">{{ task.assistDepartments.length > 0 ? task.assistDepartments.join('、') : '未设置' }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500">牵头部门：</span>
                    <span class="text-gray-700">{{ task.leadDepartment }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-500">分管校领导：</span>
                    <span class="text-gray-700">{{ task.supervisor }}</span>
                  </div>
                </div>
                <div class="flex ml-6">
                  <!-- <el-button v-if="activeTab === 'todo' && task.taskId" class="w-20" type="primary" @click.stop="handleAudit(task)">
                    办理
                  </el-button> -->
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="flex justify-center mt-6">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="currentTabTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 高级筛选组件 -->
    <SeniorFilter
      ref="seniorFilterRef"
      v-model="seniorFilterVisible"
      :result-count="seniorFilterResultCount"
      @apply="handleSeniorFilterApply"
      @clear="handleSeniorFilterClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { SupervisionIndexApi, SupervisionTaskApi, LeaderRemarkApi } from '@/api/supervision/index'
import { useUserStore } from '@/store/modules/user'
import { formatDate as utilFormatDate } from '@/utils/formatTime'
import SeniorFilter from '../components/seniorFilter.vue'

const { push } = useRouter()
const userStore = useUserStore()
// 新建督办跳转：固定路径
const goToCreate = () => {
  push({ path: '/supervision/create' })
}

// 定义任务数据类型
interface TaskData {
  id: number
  title: string
  description: string
  summary?: string // 添加概述字段
  leadDepartment: string
  assistDepartments: string[]
  createdDate: string
  deadline: string
  deadlineTimestamp?: number // 添加原始时间戳字段
  supervisor: string
  priority: string
  status: string
  overdueDays: number | null
  isOverdue: boolean
  daysRemaining: number | null
  type: string
  processInstanceId?: string
  supervisionStatus?: string
  taskId?: number // 任务ID，用于待办列表标签页的办理功能
  remarks?: any[] // 批示数据
  supervisionPageVOData?: any // 督办页面数据
}

// 定义任务统计数据类型
interface TaskStatsData {
  total: number
  workSupervision: number
  specialSupervision: number
}

// 定义状态统计数据类型
interface StatusStatsData {
  total: number
  inProgress: number
  overdue: number
  completed: number
}

// 定义月度统计数据类型
interface MonthlyStatsData {
  newTasks: number
  inProgress: number
  completed: number
  overdue: number
}

// 定义分页数据类型
interface PaginationData {
  pageNo: number
  pageSize: number
  total: number
}

// 响应式数据
const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const selectedPriority = ref('')
const selectedSupervisionStatus = ref('')
const activeTab = ref<string>('todo')
const seniorFilterVisible = ref(false)
const seniorFilterParams = ref({})
const seniorFilterResultCount = ref(0)
const seniorFilterRef = ref()
// 状态筛选按钮状态
const statusFilters = ref({
  pendingReview: true, // 待审核 - 默认开启
  inProgress: true,    // 进行中 - 默认开启
  overdue: true,       // 已超时 - 默认开启
  completed: true      // 已结束 - 默认开启
})
// 详情弹框已移除

// Static data
const tabs = [
  { key: 'todo', label: '最近更新' },
  { key: 'work', label: '工作督办' },
  { key: 'special', label: '专项督查' }
]

// 优先级选项
const priorityOptions = [
  { label: '一般优先', value: '一般优先' },
  { label: '中优先级', value: '中优先级' },
  { label: '高优先级', value: '高优先级' }
]

// 督办状态选项
const supervisionStatusOptions = [
  { label: '待审核', value: 4 },
  { label: '进行中', value: 1 },
  { label: '已超时', value: 2 },
  { label: '已结束', value: 3 }
]

// Statistics data
const taskStats = ref<TaskStatsData>({
  total: 0,
  workSupervision: 0,
  specialSupervision: 0
})

const statusStats = ref<StatusStatsData>({
  total: 0,
  inProgress: 0,
  overdue: 0,
  completed: 0
})

const monthlyStats = ref<MonthlyStatsData>({
  newTasks: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

// 任务列表数据
const tasks = ref<TaskData[]>([])

// 分页数据
const pagination = ref<PaginationData>({
  pageNo: 1,
  pageSize: 10, // 默认显示10条数据
  total: 0
})

// 解析协办部门（从API返回的coDeptNameMap中获取）
const parseCoDepts = (coDeptNameMap: Record<string, string> | null | undefined): string[] => {
  if (!coDeptNameMap) return []
  return Object.values(coDeptNameMap)
}

// 解析牵头部门（从API返回的leadDeptNameMap中获取）
const parseLeadDepts = (leadDeptNameMap: Record<string, string> | null | undefined): string => {
  if (!leadDeptNameMap) return '未设置'
  const deptNames = Object.values(leadDeptNameMap)
  return deptNames.join('、') || '未设置'
}

// 从leadLeaders数组中提取分管校领导（督办领导和牵头领导）
const getLeadLeadersText = (leadLeaders: Array<{id: number, name: string, type: string}> | null | undefined): string => {
  if (!leadLeaders || leadLeaders.length === 0) return '未设置'
  
  // 筛选督办领导和牵头领导
  const targetLeaders = leadLeaders.filter(leader => 
    leader.type === '督办领导' || leader.type === '牵头领导'
  )
  
  if (targetLeaders.length === 0) return '未设置'
  
  // 返回领导姓名，用顿号分隔
  return targetLeaders.map(leader => leader.name).join('、')
}

// 根据supervisionStatus获取状态文本
const getSupervisionStatusText = (supervisionStatus: number | null | undefined): string => {
  if (supervisionStatus === null || supervisionStatus === undefined) return '进行中'
  switch (supervisionStatus) {
    case 1: return '进行中'
    case 2: return '已超时'
    case 3: return '已结束'
    case 4: return '待审核'
    default: return '进行中'
  }
}

// 根据任务状态获取截止时间颜色样式类
const getDeadlineColorClass = (task: TaskData) => {
  const status = task.status
  if (status === '已超时') {
    return 'text-red-600' // 红色
  } else if (status === '已结束') {
    return 'text-gray-900' // 黑色
  } else if (status === '进行中') {
    return 'text-orange-500' // 橙色
  } else if (status === '待审核') {
    return 'text-indigo-600' // 蓝紫色
  }
  return 'text-gray-700' // 默认颜色
}

// 计算精确的剩余时间文本
const getPreciseTimeRemaining = (task) => {
  // 直接使用原始时间戳（数据库中的精确时间）
  const deadlineTimestamp = task.deadlineTimestamp
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    console.warn('缺少原始时间戳数据:', task)
    return null
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
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

// 判断是否精确超时（精确到分钟）
const isPreciseOverdue = (task) => {
  const deadlineTimestamp = task.deadlineTimestamp
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    return false
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
  return now > deadlineDate
}

// 获取剩余时间的样式类
const getPreciseTimeRemainingClass = (task) => {
  const deadlineTimestamp = task.deadlineTimestamp
  if (!deadlineTimestamp || typeof deadlineTimestamp !== 'number') {
    return 'remaining-days'
  }

  const now = new Date()
  const deadlineDate = new Date(deadlineTimestamp)
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

// 根据新的supervisionStatus字段计算显示状态
const calculateDisplayStatusNew = (supervisionStatus: number | null | undefined): {
  daysRemaining: number | null
  isOverdue: boolean
  overdueDays: number | null
  status: string
} => {
  const statusText = getSupervisionStatusText(supervisionStatus)
  
  return {
    daysRemaining: null,
    isOverdue: statusText === '已超时',
    overdueDays: null,
    status: statusText
  }
}

// 获取优先级文本
const getPriorityText = (priority: number | null | undefined): string => {
  if (priority === null || priority === undefined) return '一般优先'
  switch (priority) {
    case 1: return '一般优先'
    case 2: return '中优先级'
    case 3: return '高优先级'
    default: return '一般优先'
  }
}

// 获取统计数据
const getStatisticsData = async () => {
  return await SupervisionIndexApi.getStatistics()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 并行获取统计数据和督办数据
    let supervisionPromise

    // 构建通用搜索参数
    const searchParams: any = {
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize
    }
    
    // 优先使用高级筛选参数
    if (Object.keys(seniorFilterParams.value).length > 0) {
      const filters = seniorFilterParams.value

      // 处理高级筛选参数，转换为新的格式
      Object.keys(filters).forEach(key => {
        const value = filters[key]
        if (Array.isArray(value) && value.length > 0) {
          // 数组参数直接赋值，qs会自动处理为重复键名格式
          searchParams[key] = value
        } else if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value
        }
      })
      console.log('使用高级筛选参数:', filters)
    } else {
      // 使用简单筛选参数
      // 添加关键词搜索
      if (searchQuery.value.trim()) {
        searchParams.orderTitle = searchQuery.value.trim()
      }

      if (selectedPriority.value) {
        // 优先级转换为数组格式
        const priorityValue = getPriorityValue(selectedPriority.value)
        searchParams.priority = [priorityValue]
      }

      // 处理督办状态筛选 - 两种筛选方式互斥
      if (selectedSupervisionStatus.value !== '') {
        // 使用下拉框筛选（单个状态转为数组）
        searchParams.supervisionStatusList = [selectedSupervisionStatus.value]
      } else {
        // 使用按钮筛选（多状态支持）
        const activeStatuses = []
        if (statusFilters.value.pendingReview) activeStatuses.push(4) // 待审核
        if (statusFilters.value.inProgress) activeStatuses.push(1)    // 进行中
        if (statusFilters.value.overdue) activeStatuses.push(2)       // 已超时
        if (statusFilters.value.completed) activeStatuses.push(3)     // 已结束

        // 传递筛选参数：全部开启时不传参数，部分开启时传对应状态，全部关闭时传特殊值
        if (activeStatuses.length === 4) {
          // 全部开启，不传参数（显示所有数据）
        } else if (activeStatuses.length === 0) {
          // 全部关闭，传递特殊值表示不显示任何数据
          searchParams.supervisionStatusList = [-1]
          console.log('传递supervisionStatusList:', [-1])
        } else {
          // 部分开启，传递对应状态
          searchParams.supervisionStatusList = activeStatuses
          console.log('传递supervisionStatusList:', activeStatuses)
        }
      }
    }

    // 构建类型参数
    if (activeTab.value === 'todo') {
      // 最近更新标签页 - 使用合并的全部任务接口
      supervisionPromise = SupervisionTaskApi.getMergedAllTasksPage(searchParams)
    } else {
      // 工作督办和专项督查 - 只有在没有使用高级筛选时才添加类型参数
      if (Object.keys(seniorFilterParams.value).length === 0) {
        // 简单筛选时，根据标签页添加类型参数
        const typeParam = activeTab.value === 'work' ? 1 : 2
        searchParams.type = [typeParam]
      }
      // 如果使用了高级筛选，type参数已经在高级筛选中传递了

      console.log('最终传递给后端的参数:', searchParams)
      supervisionPromise = SupervisionIndexApi.getIndexData(searchParams)
    }

    const [statisticsResult, supervisionResult] = await Promise.allSettled([
      getStatisticsData(),
      supervisionPromise
    ])

    // 处理统计数据
    if (statisticsResult.status === 'fulfilled') {
      const statistics = statisticsResult.value
      console.log('获取统计数据成功', statistics)

      // 设置任务类型统计
      taskStats.value = {
        total: statistics.workSupervision + statistics.specialSupervision,
        workSupervision: statistics.workSupervision,
        specialSupervision: statistics.specialSupervision
      }

      // 设置本月统计数据
      monthlyStats.value = {
        newTasks: statistics.monthTotal,
        inProgress: statistics.monthInProgress,
        completed: statistics.monthCompleted,
        overdue: statistics.monthOverdue
      }

      // 设置本月督办任务状态统计
      statusStats.value = {
        total: statistics.monthTotal, // 直接使用API返回的monthTotal字段
        inProgress: statistics.monthInProgress, // 进行中
        overdue: statistics.monthOverdue, // 已超时
        completed: statistics.monthCompleted // 已结束
      }

      console.log('本月督办任务状态统计数据:', {
        API原始数据: {
          monthTotal: statistics.monthTotal,
          monthInProgress: statistics.monthInProgress,
          monthOverdue: statistics.monthOverdue,
          monthCompleted: statistics.monthCompleted
        },
        映射后数据: statusStats.value
      })
    } else {
      console.error('获取统计数据失败', statisticsResult.reason)
      ElMessage.error('获取统计数据失败')
    }

    // 处理督办数据
    if (supervisionResult.status === 'fulfilled') {
      const supervisionResponse = supervisionResult.value
      console.log('获取督办数据成功', supervisionResponse)
      console.log('督办数据列表:', supervisionResponse.list)

      // 更新分页总数
      pagination.value.total = supervisionResponse.total

      // 更新高级筛选结果数量
      if (Object.keys(seniorFilterParams.value).length > 0) {
        seniorFilterResultCount.value = supervisionResponse.total || 0
      }
      
      console.log('获取数据成功:', {
        currentTab: activeTab.value,
        total: pagination.value.total,
        listLength: supervisionResponse.list.length,
        searchParams,
        seniorFilterActive: Object.keys(seniorFilterParams.value).length > 0
      })

      let processedTasks: TaskData[] = []

      if (activeTab.value === 'todo') {
        // 处理待办列表数据（任务格式），参考工作督办的字段映射
        const taskList = supervisionResponse.list || []

        processedTasks = taskList.map((task: any) => {
          // 格式化日期的辅助函数（与工作督办保持一致）
          const formatOrderDate = (dateValue: number | string | null | undefined): string => {
            if (!dateValue) return ''
            try {
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) return ''
              return utilFormatDate(date, 'YYYY年MM月DD日 HH:mm')
            } catch {
              return ''
            }
          }

          // 待办列表数据结构：从task.supervisionPageVOData获取督办单信息
          // 根据实际API返回结构，督办单信息在task.supervisionPageVOData中：
          // - 标题：supervisionPageVOData.orderTitle
          // - 牵头部门：supervisionPageVOData.leadDeptName
          // - 截止时间：supervisionPageVOData.deadline
          // - 协办部门：supervisionPageVOData.coDeptNameMap（只要名字）
          // - 分管领导：supervisionPageVOData.leadLeaders（督办领导和牵头领导）
          const supervisionData = task.supervisionPageVOData || {}

          // 使用新的supervisionStatus字段计算状态
          const displayStatus = calculateDisplayStatusNew(supervisionData.supervisionStatus)

          return {
            id: supervisionData.id || task.id,
            title: supervisionData.orderTitle || '',
            description: supervisionData.content || '',
            summary: supervisionData.summary || '', // 添加概述字段映射
            leadDepartment: parseLeadDepts(supervisionData.leadDeptNameMap),
            assistDepartments: parseCoDepts(supervisionData.coDeptNameMap),
            createdDate: task.createTime ? utilFormatDate(new Date(task.createTime), 'YYYY年MM月DD日 HH:mm') : '未设置',
            deadline: supervisionData.deadline ? utilFormatDate(new Date(supervisionData.deadline), 'YYYY年MM月DD日 HH:mm') : '未设置',
            deadlineTimestamp: supervisionData.deadline, // 保存原始时间戳
            supervisor: getLeadLeadersText(supervisionData.leadLeaders) || '未分配',
            priority: getPriorityText(supervisionData.priority),
            status: displayStatus?.status || '进行中', // 待办列表只显示进行中和已超时
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: supervisionData.type === 1 ? 'work' : 'special', // 根据supervisionData中的type字段设置
            processInstanceId: task.processInstanceId || supervisionData.processInstanceId || '',
            supervisionStatus: supervisionData.supervisionStatus || '',
            taskId: task.id, // 保存任务ID用于办理
            // 关键：挂载原始对象以便 getRemarks() 能从 supervisionPageVOData.remarks 读取
            supervisionPageVOData: supervisionData
          } as TaskData
        })
      } else {
        // 处理工作督办和专项督查数据（督办单格式）
        const supervisionOrders = supervisionResponse.list

        // 注意：督办数量统计现在使用API返回的数据，不再前端计算

        processedTasks = supervisionOrders.map((order) => {
          // 使用新的supervisionStatus字段计算状态
          const displayStatus = calculateDisplayStatusNew(order.supervisionStatus)

          // 调试信息
          console.log(`督办单 ${order.orderTitle}: supervisionStatus=${order.supervisionStatus}, 计算状态=${displayStatus?.status || '未知'}`)

          // 格式化日期的辅助函数
          const formatOrderDate = (dateValue: number | string | null | undefined): string => {
            if (!dateValue) return ''
            try {
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) return ''
              return utilFormatDate(date, 'YYYY年MM月DD日 HH:mm')
            } catch {
              return ''
            }
          }

          return {
            id: order.id,
            title: order.orderTitle || '',
            description: order.content || '',
            summary: order.summary || '', // 添加概述字段映射
            leadDepartment: parseLeadDepts(order.leadDeptNameMap),
            assistDepartments: parseCoDepts(order.coDeptNameMap),
            createdDate: formatOrderDate(order.createTime),
            deadline: formatOrderDate(order.deadline),
            deadlineTimestamp: order.deadline, // 保存原始时间戳
            supervisor: getLeadLeadersText(order.leadLeaders) || '未分配',
            priority: getPriorityText(order.priority),
            status: displayStatus?.status || '进行中',
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: order.type === 1 ? 'work' : 'special',
            processInstanceId: order.processInstanceId || '',
            supervisionStatus: order.supervisionStatus || '',
            // 关键：工作督办/专项督查从 order.remarks 提供批示
            remarks: Array.isArray(order.remarks) ? order.remarks : []
          } as TaskData
        })
      }

      tasks.value = processedTasks
    } else {
      console.error('获取督办数据失败', supervisionResult.reason)
      ElMessage.error('获取督办数据失败')
    }

  } catch (error) {
    console.error('获取督办数据失败', error)
    ElMessage.error('获取督办数据失败')
  } finally {
    loading.value = false
  }
}

// 分页事件处理
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.pageNo = 1
  fetchData()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.pageNo = newPage
  fetchData()
}

// 监听标签页切换，重新获取数据
watch(activeTab, () => {
  pagination.value.pageNo = 1 // 切换标签页时重置到第一页
  fetchData()
})

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

// Computed properties for chart data
const workSupervisionDashArray = computed(() => {
  if (taskStats.value.total === 0) return '0 251.2'
  const percentage = (taskStats.value.workSupervision / taskStats.value.total) * 251.2
  return `${percentage} 251.2`
})

const specialSupervisionDashArray = computed(() => {
  if (taskStats.value.total === 0) return '0 251.2'
  const percentage = (taskStats.value.specialSupervision / taskStats.value.total) * 251.2
  return `${percentage} 251.2`
})

const specialSupervisionDashOffset = computed(() => {
  if (taskStats.value.total === 0) return '0'
  const offset = (taskStats.value.workSupervision / taskStats.value.total) * 251.2
  return `-${offset}`
})

// Status chart computed properties
const statusInProgressDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.inProgress / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusOverdueDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.overdue / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusOverdueDashOffset = computed(() => {
  if (statusStats.value.total === 0) return '0'
  const offset = (statusStats.value.inProgress / statusStats.value.total) * 219.8
  return `-${offset}`
})

const statusCompletedDashArray = computed(() => {
  if (statusStats.value.total === 0) return '0 219.8'
  const percentage = (statusStats.value.completed / statusStats.value.total) * 219.8
  return `${percentage} 219.8`
})

const statusCompletedDashOffset = computed(() => {
  if (statusStats.value.total === 0) return '0'
  const offset = ((statusStats.value.inProgress + statusStats.value.overdue) / statusStats.value.total) * 219.8
  return `-${offset}`
})

// 直接返回后端数据
const filteredTasks = computed(() => {
  return tasks.value
})

// 计算当前标签页的总数量
const currentTabTotal = computed(() => {
  return pagination.value.total
})

// 详情弹框相关逻辑已移除

// 处理审批按钮（参考部门界面实现）
const handleAudit = (task: TaskData) => {
  // 督办相关流程跳转到督办专用工作流详情页面
  if (task.processInstanceId) {
    push({
      name: 'SupervisionWorkflowDetail',
      params: {
        id: task.processInstanceId
      },
      query: {
        taskId: task.taskId || task.id
      }
    })
  } else {
    ElMessage.error('无法获取流程实例信息')
  }
}

// 整卡点击跳转到工作流详情（路径格式 A）
const navigateToWorkflowDetail = (task: TaskData) => {
  if (task.processInstanceId) {
    const path = `/supervision/workflow/detail/${task.processInstanceId}`
    const query: any = {}
    if (task.taskId || task.id) {
      query.taskId = task.taskId || task.id
    }
    push({ path, query })
  } else {
    ElMessage.error('无法获取流程实例信息')
  }
}

// 优先级文本转数值的辅助函数
const getPriorityValue = (priorityText: string): number => {
  switch (priorityText) {
    case '一般优先': return 1
    case '中优先级': return 2
    case '高优先级': return 3
    default: return 1
  }
}

// 高级筛选相关方法
const openSeniorFilter = () => {
  seniorFilterVisible.value = true
}

const handleSeniorFilterApply = (filters) => {
  seniorFilterParams.value = filters
  // 应用高级筛选时，重置简单筛选
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''
  // 重置状态筛选按钮为全部开启
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }
  // 应用高级筛选时，重置简单筛选新获取数据
  fetchData()
}

const handleSeniorFilterClear = () => {
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0
  // 应用高级筛选时，重置简单筛选新获取数据
  // 重新获取数据
  fetchData()
}

// 处理搜索按钮点击
const handleSearch = () => {
  // 清空高级筛选参数
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0
  
  // 如果下拉框有选择，重置状态筛选按钮为全部开启
  if (selectedSupervisionStatus.value !== '') {
    statusFilters.value = {
      pendingReview: true,
      inProgress: true,
      overdue: true,
      completed: true
    }
  }
  
  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 处理重置按钮点击
const handleReset = () => {
  // 重置简单筛选条件
  searchQuery.value = ''
  selectedPriority.value = ''
  selectedSupervisionStatus.value = ''

  // 重置状态筛选按钮为全部开启
  statusFilters.value = {
    pendingReview: true,
    inProgress: true,
    overdue: true,
    completed: true
  }

  // 清空高级筛选参数
  seniorFilterParams.value = {}
  seniorFilterResultCount.value = 0

  // 重置高级筛选组件内部状态
  if (seniorFilterRef.value && typeof seniorFilterRef.value.clearAllFilters === 'function') {
    seniorFilterRef.value.clearAllFilters()
  }

  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 切换状态筛选按钮
const toggleStatusFilter = (status: 'pendingReview' | 'inProgress' | 'overdue' | 'completed') => {
  statusFilters.value[status] = !statusFilters.value[status]
  
  // 清空下拉框选择，避免冲突
  selectedSupervisionStatus.value = ''
  
  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
}

// 处理分类标签点击事件
const handleCategoryClick = (taskType: string | number) => {
  // 根据任务类型切换到对应标签页
  if (taskType === 'work' || taskType === 1) {
    activeTab.value = 'work'
  } else if (taskType === 'special' || taskType === 2) {
    activeTab.value = 'special'
  }
}

// 获取显示文本（用于判断长度）
const getDisplayText = (task: TaskData): string => {
  return task.summary || task.description || '未设置'
}

// 获取截断后的文本（超过45字符显示省略号）
const getTruncatedText = (task: TaskData): string => {
  const text = getDisplayText(task)
  return text.length > 45 ? text.substring(0, 45) + '...' : text
}

// 根据批示的leaderId判断显示标签
const getRemarkLabel = (remark: any) => {
  const currentUser = userStore.getUser
  const currentUserId = currentUser?.id

  // 如果批示的leaderId与当前用户ID匹配，显示"我的批示"
  if (remark.leaderId === currentUserId) {
    return '我的批示'
  }

  // 否则显示领导姓名
  return `${remark.leaderNickName}批示`
}

// 按 leaderId 去重，保留每位领导最新一条批示
const dedupeLatestByLeader = (remarks) => {
  const seen = new Set()
  const result = []
  for (const r of remarks || []) {
    const id = r?.leaderId
    if (id == null) continue
    if (!seen.has(id)) {
      seen.add(id)
      result.push(r) // 保留首次出现 = 最新
    }
  }
  return result
}

// 批示辅助函数
const getRemarks = (task: TaskData) => {
  let remarks = []
  // 最近更新标签页：从 task.supervisionPageVOData.remarks 获取
  if (activeTab.value === 'todo') {
    remarks = Array.isArray(task?.supervisionPageVOData?.remarks) ? task.supervisionPageVOData.remarks : []
  } else {
    // 工作督办/专项督查标签页：从 task.remarks 获取
    remarks = Array.isArray(task?.remarks) ? task.remarks : []
  }
  return dedupeLatestByLeader(remarks)
}

const getAllRemarksFullText = (task: TaskData) => {
  const remarks = getRemarks(task)
  if (!remarks.length) return ''
  // 组合为多行文本：如 "我的批示：XXXX"
  return remarks
    .map((r) => `${getRemarkLabel(r)}：${r?.remark || ''}`)
    .join('; ')
}

const getFirstRemarkLabel = (task: TaskData) => {
  const first = getRemarks(task)[0]
  return first ? getRemarkLabel(first) : ''
}

const getFirstRemarkTruncatedText = (task: TaskData) => {
  const remarks = getRemarks(task)
  const first = remarks[0]
  const text = first?.remark || ''
  // 基础截断逻辑
  let display = text.length > 45 ? text.slice(0, 45) + '...' : text
  // 若存在多条批示，即使未超长也追加省略号，提示有更多内容
  if (remarks.length > 1 && !display.endsWith('...')) {
    display += '...'
  }
  return display
}

</script>

<style scoped>
/* Custom styles for better visual appeal */
.transition-colors {
transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-shadow {
transition: box-shadow 0.2s ease-in-out;
}

/* Ensure proper spacing and alignment */
.grid {
gap: 1rem;
}

.tabs-custom {
  padding: 0 16px;
}
.tabs-custom :deep(.el-tabs__item) {
  font-weight: bold;
  font-size: 24px;
  padding: 0 8px;
}
.tabs-custom :deep(.el-tabs__header) {
  margin: 0;
}
.tabs-custom :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
width: 6px;
}

::-webkit-scrollbar-track {
background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
background: #c1c1c1;
border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
background: #a8a8a8;
}

/* 剩余时间颜色样式 */
/* 第一行：tabs + 搜索区域（左右） */
.task-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px; /* 比 space-x-4 更直观控制 */
}

/* 响应式：窄屏时搜索区域换行 */
@media (max-width: 1200px) {
  .task-header-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-controls {
    margin-top: 12px;
    width: 100%;
  }
}

/* 描述与批示同行布局：使用flexbox确保同行显示 */
.task-desc-row {
  display: flex;
  align-items: flex-start;
  gap: 36px;
  margin-bottom: 1.75rem; /* 与首页的 mb-7 一致，避免被 scoped 样式覆盖后无间距 */
  min-height: 24px;
}

.desc-text {
  color: #606266;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.task-remarks.inline-remarks {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 描述容器：限制描述区域宽度，避免把批示推到最右边 */
.desc-box {
  flex: 0 1 70%;
  max-width: 70%;
  display: inline-flex;
}

.remark-item {
  display: inline;
}

.remark-label {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold;
  color: rgb(229, 146, 50); /* 统一为(229,146,50) */
}

.remark-text {
  font-size: inherit; /* 与描述行一致 */
  font-weight: bold; /* 内容加粗 */
  color: rgb(229, 146, 50); /* 统一为(229,146,50) */
}

.remark-icon {
  font-size: 14px;
  color: rgb(229, 146, 50); /* 统一为(229,146,50) */
  flex-shrink: 0;
}

/* 响应式：窄屏改为上下布局 */
@media (max-width: 1024px) {
  .task-desc-row {
    flex-direction: column;
    gap: 12px;
  }
}

.remaining-days {
  color: #67c23a; /* 绿色 - 正常 */
  font-weight: 600;
}

.remaining-days.overdue {
  color: #f56c6c; /* 红色 - 超期 */
  font-weight: 600;
}

.remaining-days.urgent {
  color: #e6a23c; /* 橙色 - 今日到期 */
  font-weight: 600;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

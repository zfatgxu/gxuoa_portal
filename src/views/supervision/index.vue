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
            <circle cx="50" cy="50" r="40" stroke="#f59e0b" stroke-width="8" fill="none"
                    :stroke-dasharray="workSupervisionDashArray"
                    stroke-linecap="round"/>
            <!-- Progress circle for 专项督查 -->
            <circle cx="50" cy="50" r="40" stroke="#3b82f6" stroke-width="8" fill="none"
                    :stroke-dasharray="specialSupervisionDashArray"
                    :stroke-dashoffset="specialSupervisionDashOffset"
                    stroke-linecap="round"/>
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
            <circle cx="50" cy="50" r="35" stroke="#3b82f6" stroke-width="12" fill="none"
                    :stroke-dasharray="statusInProgressDashArray"/>
            <circle cx="50" cy="50" r="35" stroke="#ef4444" stroke-width="12" fill="none"
                    :stroke-dasharray="statusOverdueDashArray"
                    :stroke-dashoffset="statusOverdueDashOffset"/>
            <circle cx="50" cy="50" r="35" stroke="#10b981" stroke-width="12" fill="none"
                    :stroke-dasharray="statusCompletedDashArray"
                    :stroke-dashoffset="statusCompletedDashOffset"/>
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
    <div class="border-b border-gray-200">
        <div class="flex items-center justify-between p-6 pb-0">
        <div class="flex space-x-2">
            <el-tabs v-model="activeTab" class="tabs-custom">
            <el-tab-pane 
                v-for="tab in tabs" 
                :key="tab.key" 
                :label="tab.label" 
                :name="tab.key"
            />
            </el-tabs>
        </div>
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
    </div>

    <!-- Task List -->
    <div class="p-6">
        <div v-for="task in filteredTasks" :key="task.id" class="rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow" style="border: 1px solid #e5e7eb;">
        <div class="flex items-start justify-between">
            <div class="flex-1">
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center">
                    <span 
                        class="px-2 py-2 rounded text-xs font-medium text-white mr-3"
                        :style="{
                            fontWeight: 'bold',
                            backgroundColor: task.type === 'work' || task.type === 1 ? 'rgb(27, 173, 255)' : 'rgb(129, 179, 55)'
                        }">
                        {{ task.type === 'work' || task.type === 1 ? '工作督办' : '专项督查' }}
                    </span>
                    <h4 class="text-xl font-bold text-gray-900 mr-4">{{ task.title }}</h4>
                </div>
                <div class="flex space-x-2 text-center">
                    <span
                    :class="[
                        'px-2 py-1 rounded text-xs font-medium w-20',
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
                        'ml-2 px-2 py-1 rounded text-xs font-medium w-20',
                        'text-white'
                    ]"
                    :style="{
                        fontWeight: 'bold',
                        backgroundColor: task.status === '已超时' ? 'rgb(179, 55, 55)' :
                                       task.status === '已结束' ? 'rgb(154, 154, 154)' :
                                       task.status === '进行中' ? 'rgb(129, 179, 55)' :
                                       'rgb(154, 154, 154)'
                    }">
                    {{ task.status }}
                    </span>
                </div>  
            </div>
            
            <p class="text-gray-600 mb-7 leading-relaxed">{{ task.description }}</p>
            
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
                    <el-button class="w-20" @click="openDetailDialog(task)">
                        查看详情
                    </el-button>
                    <el-button v-if="activeTab === 'todo'" class="w-20 ml-2" type="primary" @click="handleAudit(task)">
                        办理
                    </el-button>
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

    <!-- 督办详情弹框 -->
    <SupervisionDetailDialog
      v-model="detailDialogVisible"
      :task-data="selectedTask"
      :process-instance-id="selectedTask?.processInstanceId"
      :supervision-status="selectedTask?.status"
    />
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// 使用 Element Plus 图标替代 lucide-vue-next
import {
  Calendar,
  Clock,
  CircleCheck as CheckCircle,
  Timer as TimerOff,
  Search,
  User as Users,
  Warning as AlertTriangle
} from '@element-plus/icons-vue'
import SupervisionDetailDialog from './components/SupervisionDetailDialog.vue'
import { SupervisionIndexApi, SupervisionTaskApi } from '@/api/supervision/index'
import type { SupervisionOrderDetailVO } from '@/api/supervision/index'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import { useRouter } from 'vue-router'

const { push } = useRouter()

// 定义任务数据类型
interface TaskData {
  id: number
  title: string
  description: string
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

// Reactive data
const activeTab = ref<string>('work')
// 搜索和筛选相关变量
const searchQuery = ref<string>('')
const selectedPriority = ref<string>('')
const detailDialogVisible = ref<boolean>(false)
const selectedTask = ref<TaskData | null>(null)
const loading = ref<boolean>(false)



// Static data
const tabs = [
{ key: 'work', label: '工作督办' },
{ key: 'special', label: '专项督查' },
{ key: 'todo', label: '待办列表' }
]

// 优先级选项
const priorityOptions = [
  { label: '一般优先', value: '一般优先' },
  { label: '中优先级', value: '中优先级' },
  { label: '高优先级', value: '高优先级' }
]

// 计算部门选项 - 从任务数据中提取部门名称（暂时注释）
// const departments = computed(() => {
//   const deptSet = new Set<string>()
//   tasks.value.forEach(task => {
//     if (task.leadDepartment) {
//       deptSet.add(task.leadDepartment)
//     }
//     task.assistDepartments.forEach(dept => {
//       if (dept) deptSet.add(dept)
//     })
//   })
//   return Array.from(deptSet)
// })

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
  if (!leadDeptNameMap) return '未知部门'
  const deptNames = Object.values(leadDeptNameMap)
  return deptNames.join('、') || '未知部门'
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

// 根据督办状态和截止时间计算显示状态
const calculateDisplayStatus = (supervisionStatus: string, deadline: number | null): {
  daysRemaining: number | null
  isOverdue: boolean
  overdueDays: number | null
  status: string
} => {
  // 根据 supervisionStatus 判断基本状态
  if (supervisionStatus === '办结文件' || supervisionStatus === '否决文件') {
    return {
      daysRemaining: null,
      isOverdue: false,
      overdueDays: null,
      status: '已结束'
    }
  }

  // 如果是"流程中"，需要进一步判断是否超时
  if (supervisionStatus === '流程中') {
    if (!deadline) {
      return {
        daysRemaining: null,
        isOverdue: false,
        overdueDays: null,
        status: '进行中'
      }
    }

    // 使用精确时间比较（精确到分钟）
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const isOverdue = now > deadlineDate

    if (isOverdue) {
      // 已超时
      return {
        daysRemaining: null,
        isOverdue: true,
        overdueDays: null,
        status: '已超时'
      }
    } else {
      // 还有剩余时间
      return {
        daysRemaining: null,
        isOverdue: false,
        overdueDays: null,
        status: '进行中'
      }
    }
  }

  // 其他状态默认显示进行中
  return {
    daysRemaining: null,
    isOverdue: false,
    overdueDays: null,
    status: '进行中'
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
    
    // 添加搜索条件
    if (searchQuery.value) {
      searchParams.orderTitle = searchQuery.value // 使用orderTitle字段进行标题搜索
    }
    
    if (selectedPriority.value) {
      searchParams.priority = getPriorityValue(selectedPriority.value) // 使用priority字段进行优先级筛选
    }

    if (activeTab.value === 'todo') {
      // 待办列表标签页 - 使用督办待办任务接口
      supervisionPromise = SupervisionTaskApi.getTodoPage(searchParams)
    } else {
      // 工作督办和专项督查 - 添加类型参数
      const typeParam = activeTab.value === 'work' ? 1 : 2
      searchParams.type = typeParam
      
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
              return formatDate(date, 'YYYY-MM-DD')
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
          // - 分管领导：supervisionPageVOData.leaderNickname
          const supervisionData = task.supervisionPageVOData || {}

          // 待办列表专用的状态计算逻辑：只显示进行中和已超时
          const calculateTodoStatus = (deadline: number | null): {
            daysRemaining: number | null
            isOverdue: boolean
            overdueDays: number | null
            status: string
          } => {
            if (!deadline) {
              return {
                daysRemaining: null,
                isOverdue: false,
                overdueDays: null,
                status: '进行中'
              }
            }

            // 使用精确时间比较（精确到分钟）
            const now = new Date()
            const deadlineDate = new Date(deadline)
            const isOverdue = now > deadlineDate

            if (isOverdue) {
              // 已超时
              return {
                daysRemaining: null,
                isOverdue: true,
                overdueDays: null,
                status: '已超时'
              }
            } else {
              // 进行中
              return {
                daysRemaining: null,
                isOverdue: false,
                overdueDays: null,
                status: '进行中'
              }
            }
          }

          const displayStatus = calculateTodoStatus(supervisionData.deadline || null)

          return {
            id: supervisionData.id || task.id,
            title: supervisionData.orderTitle || '',
            description: supervisionData.content || '',
            leadDepartment: parseLeadDepts(supervisionData.leadDeptNameMap),
            assistDepartments: parseCoDepts(supervisionData.coDeptNameMap),
            createdDate: formatOrderDate(task.createTime),
            deadline: formatOrderDate(supervisionData.deadline),
            deadlineTimestamp: supervisionData.deadline, // 保存原始时间戳
            supervisor: supervisionData.leaderNickname || '未分配',
            priority: getPriorityText(supervisionData.priority),
            status: displayStatus?.status || '进行中', // 待办列表只显示进行中和已超时
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: supervisionData.type === 1 ? 'work' : 'special', // 根据supervisionData中的type字段设置
            processInstanceId: task.processInstanceId || supervisionData.processInstanceId || '',
            supervisionStatus: supervisionData.supervisionStatus || '',
            taskId: task.id // 保存任务ID用于办理
          } as TaskData
        })
      } else {
        // 处理工作督办和专项督查数据（督办单格式）
        const supervisionOrders = supervisionResponse.list

        // 注意：督办数量统计现在使用API返回的数据，不再前端计算

        processedTasks = supervisionOrders.map((order) => {
          // 使用新的状态计算函数，传入 supervisionStatus 和 deadline
          const displayStatus = calculateDisplayStatus(order.supervisionStatus || '流程中', order.deadline || null)

          // 调试信息
          console.log(`督办单 ${order.orderTitle}: supervisionStatus=${order.supervisionStatus}, 计算状态=${displayStatus?.status || '未知'}`)

          // 格式化日期的辅助函数
          const formatOrderDate = (dateValue: number | string | null | undefined): string => {
            if (!dateValue) return ''
            try {
              const date = new Date(dateValue)
              if (isNaN(date.getTime())) return ''
              return formatDate(date, 'YYYY-MM-DD')
            } catch {
              return ''
            }
          }

          return {
            id: order.id,
            title: order.orderTitle || '',
            description: order.content || '',
            leadDepartment: parseLeadDepts(order.leadDeptNameMap),
            assistDepartments: parseCoDepts(order.coDeptNameMap),
            createdDate: formatOrderDate(order.createTime),
            deadline: formatOrderDate(order.deadline),
            deadlineTimestamp: order.deadline, // 保存原始时间戳
            supervisor: order.leaderNickname || '未分配',
            priority: getPriorityText(order.priority),
            status: displayStatus?.status || '进行中',
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: order.type === 1 ? 'work' : 'special',
            processInstanceId: order.processInstanceId || '',
            supervisionStatus: order.supervisionStatus || ''
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

// 前端搜索逻辑暂时注释，后期调用后端接口实现
// const filteredTasks = computed(() => {
//   return tasks.value.filter(task => {
//     // 不需要再按type过滤，因为后端已经按类型返回了数据
//     const matchesSearch = !searchQuery.value ||
//       task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
//     const matchesDepartment = !selectedDepartment.value ||
//       task.leadDepartment === selectedDepartment.value ||
//       task.assistDepartments.includes(selectedDepartment.value)
//     const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value

//     return matchesSearch && matchesDepartment && matchesStatus
//   })
// })

// 直接返回后端数据
const filteredTasks = computed(() => {
  return tasks.value
})

// 计算当前标签页的总数量
const currentTabTotal = computed(() => {
  return pagination.value.total
})

// 打开详情弹框
const openDetailDialog = (task: TaskData) => {
  selectedTask.value = task
  detailDialogVisible.value = true
}

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

// 优先级文本转数值的辅助函数
const getPriorityValue = (priorityText: string): number => {
  switch (priorityText) {
    case '一般优先': return 1
    case '中优先级': return 2
    case '高优先级': return 3
    default: return 1
  }
}

// 处理搜索按钮点击
const handleSearch = () => {
  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
  console.log('执行搜索:', {
    searchQuery: searchQuery.value,
    selectedPriority: selectedPriority.value
  })
}

// 处理重置按钮点击
const handleReset = () => {
  searchQuery.value = ''
  selectedPriority.value = ''
  // 重置到第一页并重新获取数据
  pagination.value.pageNo = 1
  fetchData()
  console.log('重置搜索条件')
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
  height: 1px;
  background-color: var(--el-border-color-light);
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
</style>

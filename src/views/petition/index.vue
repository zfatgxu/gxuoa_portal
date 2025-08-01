<template>
<div class="min-h-screen bg-gray-50 p-6">
    <!-- Statistics Cards -->
<div class="grid grid-cols-[1fr_1fr] gap-6 mb-8">
    <!-- Monthly Status Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm rotate-45 mr-2"></div>
          <h3 class="text-gray-700 font-medium">本月信访情况</h3>
        </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-blue-500"><Calendar color="blue"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-md text-gray-600">本月新增</span>
                <span class="text-2xl font-bold text-blue-600">{{ monthlyStats.newTasks }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-orange-500"><Clock color="orange"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">进行中</span>
                <span class="text-2xl font-bold text-orange-600">{{ monthlyStats.inProgress }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-green-500"><CheckCircle color="green"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">已完成</span>
                <span class="text-2xl font-bold text-green-600">{{ monthlyStats.completed }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon class="w-7 h-7 text-red-500"><TimerOff color="red"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">已超时</span>
                <span class="text-2xl font-bold text-red-600">{{ monthlyStats.overdue }}</span>
            </div>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
        <div class="w-3 h-3 bg-blue-500 rounded-sm rotate-45 mr-2"></div>
        <h3 class="text-gray-700 font-medium">快捷操作</h3>
        </div>
      <div class="grid grid-cols-4 gap-4">
        <div 
          v-for="(item, index) in entryList" 
          :key="index" 
          class="flex flex-col items-center justify-center"
          @click="handleEntryClick(item)"
        >
          <div>
            <img :src="item.icon" :alt="item.name" class="w-16 h-16" />
          </div>
          <div>{{ item.name }}</div>
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
        <div class="flex space-x-4 w-50%">
            <el-input
                v-model="searchQuery"
                size="small"
                placeholder="请输入搜索关键词"
                :suffix-icon="Search"
                style="width: 60%;"
              />
            <el-select v-model="selectedDepartment" placeholder="全部分类" clearable style="width: 30%;">
            <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
            />
            </el-select>
            <el-select v-model="selectedStatus" placeholder="全部状态" clearable style="width: 30%;">
            <el-option
                v-for="status in statuses"
                :key="status"
                :label="status"
                :value="status"
            />
            </el-select>
            <el-button :icon="Bell" @click="handleBellClick">一键提醒</el-button>
            <div class="flex items-center w-20%" @click="handleMoreClick">
              更多
            <el-icon><ArrowRightBold /></el-icon>
            </div>
        </div>
        </div>
    </div>

    <!-- Task List -->
    <div class="p-6">
        <div v-for="task in filteredTasks" :key="task.id" class="rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow" style="border: 1px solid #e5e7eb;">
        <div class="flex items-start justify-between">
            <div class="flex-1">
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-xl font-bold text-gray-900 mr-4">{{ task.title }}</h4>
                <div class="flex space-x-2 text-center">
                    <span
                    :class="[
                        'px-2 py-1 rounded text-xs font-medium w-20',
                        task.priority === '高优先级' ? 'bg-red-100 text-red-800' :
                        task.priority === '中优先级' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    ]"
                    style="font-weight: bold;">
                    {{ task.priority }}
                    </span>
                    <span
                    :class="[
                        'ml-2 px-2 py-1 rounded text-xs font-medium w-20',
                        task.status === '已超时' ? 'bg-red-100 text-red-800' :
                        task.status === '已结束' ? 'bg-gray-500 text-white' :
                        task.status === '进行中' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    ]"
                    style="font-weight: bold;">
                    {{ task.status }}
                    </span>
                </div>  
            </div>
            
            <p class="text-gray-600 mb-4 leading-relaxed">{{ task.description }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div class="flex items-center">
                  <el-icon class="w-4 h-4 text-gray-400 mr-2"><Users /></el-icon>
                <span class="text-gray-500">信访人：</span>
                <span class="text-gray-700">黄二二</span>
                </div>
                <div class="flex items-center">
                  <el-icon class="w-4 h-4 text-gray-400 mr-2"><OfficeBuilding /></el-icon>
                <span class="text-gray-500">信访单位：</span>
                <span >
                    超自然科学管理局
                </span>
                </div>
                <div class="flex items-center">
                  <el-icon class="w-4 h-4 text-gray-400 mr-2"><Edit /></el-icon>
                  <span class="text-gray-500">目的分类：</span>
                  <span class="text-gray-700">咨询求助</span>
                </div>
                <div class="flex items-center">
                  <el-icon class="w-4 h-4 text-gray-400 mr-2"><Edit /></el-icon>
                  <span class="text-gray-500">内容分类：</span>
                  <span class="text-gray-700">教学管理</span>
                </div>
            </div>
            <div class="flex items-center text-sm mt-3">
                <el-icon class="w-4 h-4 text-gray-400 mr-2"><TriangleAlert /></el-icon>
                <span class="text-gray-500">任务状态：</span>
                <span class="text-gray-700">已分配任务</span>
            </div>
            
            <div class="mt-3 flex items-center justify-between text-sm">
                <div class="flex items-center w-30% justify-between">
                    <span class="text-gray-500">信访时间：
                      <span class="text-gray-700">{{ task.createdDate }}</span>
                    </span>
                    <span class="text-gray-500">截止时间：
                      <span class="text-red">{{ task.createdDate }}</span>
                    </span>
                    <div class="flex items-center">
                        <span v-if="task.daysRemaining" class="ml-2 text-orange-600">
                            剩余{{ task.daysRemaining }}天
                        </span>
                        <el-icon v-if="task.isOverdue" class="w-6 h-6 text-red-500 ml-2"><AlertTriangle /></el-icon>
                        <span v-if="task.overdueDays" class="ml-2 text-orange-600">
                            超时{{ task.overdueDays }}天
                        </span>
                    </div>
                </div>
                <div class="flex ml-6">
                    <el-button class="w-20" @click="openDetailDialog(task)">
                        查看详情
                    </el-button>
                    <el-button class="w-20" @click="handleTransfer(task)">
                        流转
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
  Bell,
  TriangleAlert
} from 'lucide-vue-next'
import { SupervisionIndexApi, SupervisionTaskApi } from '@/api/supervision/index'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import { useRouter } from 'vue-router'
import { ArrowRightBold, OfficeBuilding, Edit } from '@element-plus/icons-vue'
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
const searchQuery = ref<string>('')
const selectedDepartment = ref<string>('')
const selectedStatus = ref<string>('')
const detailDialogVisible = ref<boolean>(false)
const selectedTask = ref<TaskData | null>(null)
const loading = ref<boolean>(false)



// Static data
const tabs = [
{ key: 'work', label: '待办事项' },
{ key: 'special', label: '已办事项' },
{ key: 'todo', label: '我的申请' }
]

const statuses: string[] = ['进行中', '已超时', '已结束']

// 计算部门选项 - 从任务数据中提取部门名称
const departments = computed(() => {
  const deptSet = new Set<string>()
  tasks.value.forEach(task => {
    if (task.leadDepartment) {
      deptSet.add(task.leadDepartment)
    }
    task.assistDepartments.forEach(dept => {
      if (dept) deptSet.add(dept)
    })
  })
  return Array.from(deptSet)
})

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

// 快捷入口列表
const entryList = ref([
  {
    name: '新建信访',
    icon: new URL('@/assets/imgs/petition/1.png', import.meta.url).href,
    bgColor: '#4a7eff',
  },
  {
    name: '导出报告',
    icon: new URL('@/assets/imgs/petition/2.png', import.meta.url).href,
    bgColor: '#4cd964',
  },
  {
    name: '督办提醒',
    icon: new URL('@/assets/imgs/petition/3.png', import.meta.url).href,
    bgColor: '#9c88ff',
  },
  {
    name: '统计查询',
    icon: new URL('@/assets/imgs/petition/4.png', import.meta.url).href,
    bgColor: '#5352ed',
  },
])

// 处理快捷入口点击
const handleEntryClick = (item) => {
  if (item.path) {
    push(item.path)
  } else {
    ElMessage.info(`功能 "${item.name}" 正在开发中`)
  }
}

// 处理更多点击
const handleMoreClick = () => {
  ElMessage.info('更多功能正在开发中')
}

// 处理提醒点击
const handleBellClick = () => {
  ElMessage.info('提醒功能正在开发中')
}

// 处理流转点击
const handleTransfer = (task: TaskData) => {
  ElMessage.info('流转功能正在开发中')
}

// 解析协办部门（从API返回的coDeptNameMap中获取）
const parseCoDepts = (coDeptNameMap: Record<string, string> | null | undefined): string[] => {
  if (!coDeptNameMap) return []
  return Object.values(coDeptNameMap)
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

    // 获取今天的日期（只保留年月日，忽略时分秒）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 获取截止日期（只保留年月日，忽略时分秒）
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    // 计算天数差：正数表示还有剩余天数，负数表示已超时
    const daysDiff = Math.floor((deadlineDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

    if (daysDiff < 0) {
      // 已超时
      return {
        daysRemaining: null,
        isOverdue: true,
        overdueDays: Math.abs(daysDiff),
        status: '已超时'
      }
    } else if (daysDiff === 0) {
      // 今天截止
      return {
        daysRemaining: 0,
        isOverdue: false,
        overdueDays: null,
        status: '进行中'
      }
    } else {
      // 还有剩余时间
      return {
        daysRemaining: daysDiff,
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

    if (activeTab.value === 'todo') {
      // 待办列表标签页 - 使用督办待办任务接口
      supervisionPromise = SupervisionTaskApi.getTodoPage({
        pageNo: pagination.value.pageNo,
        pageSize: pagination.value.pageSize
      })
    } else {
      // 工作督办和专项督办
      const typeParam = activeTab.value === 'work' ? 1 : 2
      supervisionPromise = SupervisionIndexApi.getIndexData({
        pageNo: pagination.value.pageNo,
        pageSize: pagination.value.pageSize,
        type: typeParam
      })
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

      // 设置状态统计
      statusStats.value = {
        total: statistics.monthTotal,
        inProgress: statistics.monthInProgress,
        overdue: statistics.monthOverdue,
        completed: statistics.monthCompleted
      }
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

          // 从任务中获取督办单信息，参考工作督办的数据结构
          const order = task.supervisionOrder || task.businessData || {}

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

            // 获取今天的日期（只保留年月日，忽略时分秒）
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // 获取截止日期（只保留年月日，忽略时分秒）
            const deadlineDate = new Date(deadline)
            deadlineDate.setHours(0, 0, 0, 0)

            // 计算天数差：正数表示还有剩余天数，负数表示已超时
            const daysDiff = Math.floor((deadlineDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

            if (daysDiff < 0) {
              // 已超时
              return {
                daysRemaining: null,
                isOverdue: true,
                overdueDays: Math.abs(daysDiff),
                status: '已超时'
              }
            } else {
              // 进行中（包括今天截止的情况）
              return {
                daysRemaining: daysDiff,
                isOverdue: false,
                overdueDays: null,
                status: '进行中'
              }
            }
          }

          const displayStatus = calculateTodoStatus(order.deadline || null)

          return {
            id: order.id || task.id,
            title: order.orderTitle || task.name || '',
            description: order.content || '',
            leadDepartment: order.leadDeptName || '未知部门',
            assistDepartments: parseCoDepts(order.coDeptNameMap),
            createdDate: formatOrderDate(task.createTime || order.createTime),
            deadline: formatOrderDate(order.deadline),
            supervisor: order.leaderNickname || '未分配',
            priority: getPriorityText(order.priority), // 使用与工作督办相同的优先级处理
            status: displayStatus?.status || '进行中', // 待办列表只显示进行中和已超时
            overdueDays: displayStatus?.overdueDays || null,
            isOverdue: displayStatus?.isOverdue || false,
            daysRemaining: displayStatus?.daysRemaining || null,
            type: 'todo', // 标记为待办
            processInstanceId: task.processInstance?.id || order.processInstanceId || '',
            supervisionStatus: order.supervisionStatus || '',
            taskId: task.id // 保存任务ID用于办理
          } as TaskData
        })
      } else {
        // 处理工作督办和专项督办数据（督办单格式）
        const supervisionOrders = supervisionResponse.list

        // 调试：统计不同类型的督办数量
        const workCount = supervisionOrders.filter(order => order.type === 1).length
        const specialCount = supervisionOrders.filter(order => order.type === 2).length
        console.log(`工作督办数量: ${workCount}, 专项督办数量: ${specialCount}`)

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
            leadDepartment: order.leadDeptName || '未知部门',
            assistDepartments: parseCoDepts(order.coDeptNameMap),
            createdDate: formatOrderDate(order.createTime),
            deadline: formatOrderDate(order.deadline),
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

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // 不需要再按type过滤，因为后端已经按类型返回了数据
    const matchesSearch = !searchQuery.value ||
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesDepartment = !selectedDepartment.value ||
      task.leadDepartment === selectedDepartment.value ||
      task.assistDepartments.includes(selectedDepartment.value)
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value

    return matchesSearch && matchesDepartment && matchesStatus
  })
})

// 计算当前标签页的总数量（用于分页显示）
const currentTabTotal = computed(() => {
  return pagination.value.total // 直接使用后端返回的总数
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
</style>

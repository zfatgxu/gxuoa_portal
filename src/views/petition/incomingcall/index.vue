<template>
<div class="min-h-screen bg-gray-50 p-6">
    <!-- Statistics Cards -->
<div class="grid grid-cols-1 gap-6 mb-8">
    <!-- Monthly Status Card -->
    <div class="bg-white rounded-lg shadow-md p-6">   
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm rotate-45 mr-2"></div>
          <h3 class="text-gray-700 font-medium">本月信访情况</h3>
        </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon size="24"><Calendar color="blue"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-md text-gray-600">本月新增</span>
                <span class="text-2xl font-bold text-blue-600">{{ monthlyStats.increase }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon size="24"><Clock color="orange"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">进行中</span>
                <span class="text-2xl font-bold text-orange-600">{{ monthlyStats.ongoing }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon size="24"><CheckCircle color="green"/></el-icon>
            <div class="flex flex-col items-center ml-4">
                <span class="text-sm text-gray-600">已完成</span>
                <span class="text-2xl font-bold text-green-600">{{ monthlyStats.finished }}</span>
            </div>
        </div>
        <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <el-icon size="24"><TimerOff color="red"/></el-icon>
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
        <div class="flex space-x-4 w-50%">
            <el-input
                v-model="searchQuery"
                size="small"
                placeholder="请输入搜索关键词"
                :suffix-icon="Search"
                style="width: 60%;"
              />
            <el-select v-model="purposeCategory" placeholder="目的分类" clearable multiple style="width: 30%;">
            <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.PURPOSE_CATEGORY)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
            </el-select>
            <el-select v-model="contentCategory" placeholder="内容分类" clearable multiple style="width: 30%;">
            <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.CONTENT_CATEGORY)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
            </el-select>
            <el-select v-model="urgencyLevel" placeholder="紧急程度" clearable style="width: 30%;">
            <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
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
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <el-icon class="is-loading" style="font-size: 24px;">
                <Loading />
            </el-icon>
            <span class="ml-2">加载中...</span>
        </div>
        
        <!-- 任务列表 -->
        <div v-else>
            <div 
                v-for="task in tasks" 
                :key="task.id" 
                class="rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow card-item cursor-pointer" 
                style="border: 1px solid #e5e7eb;"
                @click="openDetailDialog(task)"
            >
                <!-- 头部两行：第一行 优先级(左) | 状态(右)；第二行 标题 -->
                <div class="mb-4">
                    <div class="flex items-center justify-between">
                        <!-- 优先级标签 -->
                        <span 
                            class="px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                            :style="{
                                backgroundColor: task.urgencyLevel === 3 ? '#EF4444' : 
                                               task.urgencyLevel === 2 ? '#F59E0B' : '#3B82F6'
                            }"
                        >
                            {{ getDictLabel(DICT_TYPE.SUPERVISION_PRIORITY_TYPE, task.urgencyLevel) }}
                        </span>
                        
                        <!-- 状态标签 -->
                        <span 
                            class="px-2 py-1 rounded text-xs font-medium w-20 text-center text-white"
                            :style="{
                                backgroundColor: task.status === '已超时' ? '#F59E0B' : 
                                               task.status === '已结束' ? '#10B981' : '#22A4EF'
                            }"
                        >
                            {{ task.status }}
                        </span>
                    </div>
                    <div class="mt-2">
                        <h4 class="text-xl font-bold text-gray-900">{{ task.title }}</h4>
                    </div>
                </div>
                
                <!-- 信访内容 -->
                <div class="mb-4">
                    <p class="text-gray-600 leading-relaxed line-clamp-2">{{ task.content }}</p>
                </div>
                
                <!-- 基本信息网格 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div class="flex items-center">
                        <el-icon class="w-4 h-4 text-gray-400 mr-2"><Users /></el-icon>
                        <span class="text-gray-500">信访人：</span>
                        <span class="text-gray-700">{{ task.name }}</span>
                    </div>
                    <div class="flex items-center">
                        <el-icon class="w-4 h-4 text-gray-400 mr-2"><OfficeBuilding /></el-icon>
                        <span class="text-gray-500">信访单位：</span>
                        <span class="text-gray-700">{{ task.petitionerUnit }}</span>
                    </div>
                    <div class="flex items-center">
                        <el-icon class="w-4 h-4 text-gray-400 mr-2"><Edit /></el-icon>
                        <span class="text-gray-500">目的分类：</span>
                        <span class="text-gray-700">{{ getDictLabel(DICT_TYPE.PURPOSE_CATEGORY, task.purposeCategory) }}</span>
                    </div>
                    <div class="flex items-center">
                        <el-icon class="w-4 h-4 text-gray-400 mr-2"><Edit /></el-icon>
                        <span class="text-gray-500">内容分类：</span>
                        <span class="text-gray-700">{{ getDictLabel(DICT_TYPE.CONTENT_CATEGORY, task.contentCategory) }}</span>
                    </div>
                </div>
                
                <!-- 时间信息网格 -->
                <div class="grid items-start w-fit" style="grid-template-columns: max-content max-content; column-gap: 1.5rem; row-gap: 0.5rem;">
                    <div class="flex items-center">
                        <span class="text-gray-900 font-semibold inline-block w-24">信访时间：</span>
                        <span class="text-gray-900">{{ task.petitionDate }}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-900 font-semibold inline-block w-24">截止时间：</span>
                        <span class="font-semibold text-red-600">{{ task.deadline }}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-900 font-semibold inline-block w-24">任务状态：</span>
                        <span class="text-gray-900">已分配任务</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-900 font-semibold inline-block w-24">时间状态：</span>
                        <div class="flex items-center">
                            <span v-if="task.daysRemaining" class="text-orange-600">
                                剩余{{ task.daysRemaining }}天
                            </span>
                            <el-icon v-if="task.isOverdue" class="w-4 h-4 text-red-500 ml-1"><AlertTriangle /></el-icon>
                            <span v-if="task.overdueDays" class="text-red-600 ml-1">
                                超时{{ task.overdueDays }}天
                            </span>
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
  TriangleAlert,
  AlertTriangle
} from 'lucide-vue-next'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { ArrowRightBold, OfficeBuilding, Edit } from '@element-plus/icons-vue'
import { InfoApi } from '@/api/petition/info/index'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import * as PetitionApi from '@/api/petition/index'
const { push } = useRouter()
// 定义任务数据类型
interface TaskData {
  id: number
  petitionNumber: string, // 信访编号
  name: string, // 信访人
  inSchool: number |string, // 是否在校
  petitionerUnit: string, // 信访人单位
  petitionChannel: number |string, // 信访渠道
  purposeCategory: number |string, // 原因分类
  urgencyLevel: number |string, // 紧急程度
  contentCategory: number |string, // 内容分类
  isRepeat: number |string, // 重复信访
  title: string, // 文件标题
  content: string, // 具体内容
  petitionDate: string,
  deadline: string, //截止日期
  status: string, // 任务状态
  daysRemaining?: number, // 剩余天数
  isOverdue?: boolean, // 是否超时
  overdueDays?: number, // 超时天数
  description?: string, // 任务描述
  leadDepartment?: string, // 牵头部门
  assistDepartments?: string[], // 协办部门
  processInstanceId?: string, // 流程实例ID
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
  increase: number
  ongoing: number
  finished: number
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

const purposeCategory = ref<number[]>([])
const contentCategory = ref<number[]>([])
const urgencyLevel = ref<string>('')

const monthlyStats = ref<MonthlyStatsData>({
  increase: 0,
  ongoing: 0,
  finished: 0,
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
    path: '/petition/create'
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
    path: '/petition/statistics'
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

// 计算是否超时和超时天数
const calculateOverdueInfo = (deadline) => {
  if (!deadline) {
    return { isOverdue: false, overdueDays: 0, daysRemaining: 0 }
  }
  
  // 获取当前日期（只保留年月日，忽略时分秒）
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  // 处理截止时间，支持时间戳和日期字符串
  let deadlineDate: Date
  
  if (typeof deadline === 'number') {
    // 如果是时间戳数字
    deadlineDate = new Date(deadline)
  } else if (typeof deadline === 'string') {
    // 如果是时间戳字符串
    if (/^\d+$/.test(deadline)) {
      deadlineDate = new Date(parseInt(deadline))
    } else {
      // 如果是日期字符串
      deadlineDate = new Date(deadline)
    }
  } else {
    // 其他类型，尝试直接创建日期对象
    deadlineDate = new Date(deadline)
  }
  
  // 检查日期是否有效
  if (isNaN(deadlineDate.getTime())) {
    return { isOverdue: false, overdueDays: 0, daysRemaining: 0 }
  }
  
  // 设置截止日期为当天00:00:00
  deadlineDate.setHours(0, 0, 0, 0)
  
  // 计算天数差（精确到天）
  const timeDiff = deadlineDate.getTime() - now.getTime()
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
  
  if (daysDiff < 0) {
    // 已超时
    return { 
      isOverdue: true, 
      overdueDays: Math.abs(daysDiff),
      daysRemaining: 0
    }
  } else {
    // 未超时
    return { 
      isOverdue: false, 
      overdueDays: 0,
      daysRemaining: daysDiff
    }
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const req = reactive({
      pageSize: pagination.value.pageSize, 
      pageNo: pagination.value.pageNo,
      purposeCategory: purposeCategory.value,
      contentCategory: contentCategory.value,
      urgencyLevel: urgencyLevel.value,
      title: searchQuery.value,
      channel: 2
    })
    if (activeTab.value === 'work') {
      req.status = 0
    } else if (activeTab.value === 'special') {
      req.status = 1
    }
    // 先尝试调用API获取数据
    const response = await InfoApi.getInfoPage(req)
    
    if (response) {
      // 将API返回的数据转换为任务数据格式
      tasks.value = response.list.map(item => {
        const overdueInfo = calculateOverdueInfo(item.deadline)
        
        // 格式化截止时间，如果是时间戳则转换为日期字符串
        const formatDeadline = (deadline: any) => {
          if (!deadline) return '无截止日期'
          
          // 如果是时间戳（数字类型）
          if (typeof deadline === 'number') {
            const date = new Date(deadline)
            return date.toLocaleDateString('zh-CN')
          }
          
          // 如果是日期字符串，直接返回
          if (typeof deadline === 'string') {
            // 如果是时间戳字符串，转换为日期
            if (/^\d+$/.test(deadline)) {
              const date = new Date(parseInt(deadline))
              return date.toLocaleDateString('zh-CN')
            }
            // 如果是日期字符串，直接返回
            return deadline
          }
          
          return '无截止日期'
        }
        
        // 格式化信访时间
        const formatPetitionDate = (date: any) => {
          if (!date) return '未知日期'
          
          if (typeof date === 'number') {
            const d = new Date(date)
            return d.toLocaleDateString('zh-CN')
          }
          
          if (typeof date === 'string') {
            if (/^\d+$/.test(date)) {
              const d = new Date(parseInt(date))
              return d.toLocaleDateString('zh-CN')
            }
            return date
          }
          
          return '未知日期'
        }
        
        return {
          id: item.id || 0,
          petitionNumber: item.petitionNumber || '无编号',
          name: item.name || '匿名',
          inSchool: item.inSchool || 0,
          petitionerUnit: item.petitionerUnit || '未知单位',
          petitionChannel: item.petitionChannel || 0,
          purposeCategory: item.purposeCategory || 0,
          urgencyLevel: item.urgencyLevel || 1,
          contentCategory: item.contentCategory || 0,
          isRepeat: item.isRepeat || 0,
          title: item.title || '无标题',
          content: item.content || '无内容',
          petitionDate: formatPetitionDate(item.petitionDate),
          deadline: formatDeadline(item.deadline),
          status: overdueInfo.isOverdue ? '已超时' : '进行中',
          daysRemaining: overdueInfo.daysRemaining,
          isOverdue: overdueInfo.isOverdue,
          overdueDays: overdueInfo.overdueDays,
          processInstanceId: item.processInstanceId || ''
        }
      })
      
      pagination.value.total = response.total || 0
    } else {
      // 如果API返回空数据，使用模拟数据
      useMockData()
    }
    PetitionApi.getStatCount({channel: 2, isMonth: true}).then(res => {
      if (res) {
        monthlyStats.value = res
      }
    })
  } catch (error) {
    console.error('获取任务数据失败，使用模拟数据:', error)
    // API调用失败时使用模拟数据
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  const mockTasks = [
    {
      id: 1,
      petitionNumber: 'XF20240001',
      name: '张三',
      inSchool: 1,
      petitionerUnit: '计算机学院',
      petitionChannel: 1,
      purposeCategory: 1,
      urgencyLevel: 2,
      contentCategory: 1,
      isRepeat: 0,
      title: '关于教学设备更新的建议',
      content: '希望学校能够更新计算机实验室的教学设备，提高教学质量。',
      petitionDate: '2024-01-15',
      deadline: '2024-02-15'
    },
    {
      id: 2,
      petitionNumber: 'XF20240002',
      name: '李四',
      inSchool: 0,
      petitionerUnit: '校友会',
      petitionChannel: 2,
      purposeCategory: 2,
      urgencyLevel: 3,
      contentCategory: 2,
      isRepeat: 1,
      title: '校园安全管理问题',
      content: '反映校园夜间照明不足，存在安全隐患。',
      petitionDate: '2024-01-10',
      deadline: '2024-01-25'
    },
    {
      id: 3,
      petitionNumber: 'XF20240003',
      name: '王五',
      inSchool: 1,
      petitionerUnit: '文学院',
      petitionChannel: 1,
      purposeCategory: 3,
      urgencyLevel: 1,
      contentCategory: 3,
      isRepeat: 0,
      title: '图书馆开放时间建议',
      content: '建议延长图书馆周末开放时间，方便学生学习。',
      petitionDate: '2024-01-20',
      deadline: '2024-02-20'
    }
  ]
  
  // 使用相同的计算逻辑处理模拟数据
  tasks.value = mockTasks.map(item => {
    const overdueInfo = calculateOverdueInfo(item.deadline)
    
    return {
      ...item,
      status: overdueInfo.isOverdue ? '已超时' : '进行中',
      daysRemaining: overdueInfo.daysRemaining,
      isOverdue: overdueInfo.isOverdue,
      overdueDays: overdueInfo.overdueDays
    }
  })
  
  pagination.value.total = tasks.value.length
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

watch([purposeCategory, contentCategory, urgencyLevel], () => {
  pagination.value.pageNo = 1 // 重置到第一页
  fetchData()
})

// 监听搜索关键词变化，自动更新列表
watch(searchQuery, () => {
  pagination.value.pageNo = 1 // 重置到第一页
  fetchData()
})

// 添加防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: any = null
  return function(...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 创建防抖搜索函数
const debouncedSearch = debounce(() => {
  pagination.value.pageNo = 1
  fetchData()
}, 300)

// 修改搜索监听器
watch(searchQuery, () => {
  debouncedSearch()
})

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

// 计算当前标签页的总数量（用于分页显示）
const currentTabTotal = computed(() => {
  return pagination.value.total // 直接使用后端返回的总数
})

// 打开详情弹框
const openDetailDialog = (task: TaskData) => {
  push({
    path: '/petition/detail',
    query: {
      id: task.id,
      taskId: task.processInstanceId || ''
    }
  })
}
</script>

<style scoped>
/* 与督办页面一致的样式变量 */
:root {
  --gap-x: 2rem;
  --sidebar-w: 12rem;
  --grid-col-gap: 1.5rem;
  --grid-row-gap: 0.5rem;
  --left-max: clamp(28rem, 48vw, 42rem);
  --header-gap: clamp(0.5rem, 1vw, 0.75rem);
}

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

/* 与督办页面一致的卡片样式 */
.card-item {
  background-color: #FAFBFC; /* 调整为更浅的卡片底色 */
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 单行省略统一样式 */
.one-line-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; /* 在 flex 布局下允许收缩，确保省略号生效 */
}

/* 校领导等标签固定宽度对齐样式 */
.leader-field-label {
  display: inline-block;
  width: 4em;
  text-align: justify;
  text-align-last: justify;
}

/* 响应式：极窄屏时卡片上下堆叠兜底 */
@media (max-width: 900px) {
  .task-two-col {
    flex-direction: column;
    gap: 1rem;
  }

  .right-col {
    width: 100% !important;
  }
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
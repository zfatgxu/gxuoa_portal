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
                      :stroke-dasharray="`${(taskStats.workSupervision / taskStats.total) * 251.2} 251.2`"
                      stroke-linecap="round"/>
              <!-- Progress circle for 专项督办 -->
              <circle cx="50" cy="50" r="40" stroke="#3b82f6" stroke-width="8" fill="none"
                      :stroke-dasharray="`${(taskStats.specialSupervision / taskStats.total) * 251.2} 251.2`"
                      :stroke-dashoffset="`-${(taskStats.workSupervision / taskStats.total) * 251.2}`"
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
              <span class="text-sm text-gray-600">专项督办</span>
              <span class="ml-2 text-sm font-medium">{{ taskStats.specialSupervision }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Status Statistics Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-4">
          <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <h3 class="text-gray-700 font-medium">督办任务状态统计</h3>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="35" stroke="#e5e7eb" stroke-width="12" fill="none"/>
              <!-- Status segments -->
              <circle cx="50" cy="50" r="35" stroke="#3b82f6" stroke-width="12" fill="none"
                      :stroke-dasharray="`${(statusStats.fast / statusStats.total) * 219.8} 219.8`"/>
              <circle cx="50" cy="50" r="35" stroke="#8b5cf6" stroke-width="12" fill="none"
                      :stroke-dasharray="`${(statusStats.consulting / statusStats.total) * 219.8} 219.8`"
                      :stroke-dashoffset="`-${(statusStats.fast / statusStats.total) * 219.8}`"/>
              <circle cx="50" cy="50" r="35" stroke="#f59e0b" stroke-width="12" fill="none"
                      :stroke-dasharray="`${(statusStats.slow / statusStats.total) * 219.8} 219.8`"
                      :stroke-dashoffset="`-${((statusStats.fast + statusStats.consulting) / statusStats.total) * 219.8}`"/>
              <circle cx="50" cy="50" r="35" stroke="#10b981" stroke-width="12" fill="none"
                      :stroke-dasharray="`${(statusStats.completed / statusStats.total) * 219.8} 219.8`"
                      :stroke-dashoffset="`-${((statusStats.fast + statusStats.consulting + statusStats.slow) / statusStats.total) * 219.8}`"/>
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
                <span class="text-gray-600">进展较快</span>
              </div>
              <span class="font-medium">{{ statusStats.fast }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span class="text-gray-600">会商解决</span>
              </div>
              <span class="font-medium">{{ statusStats.consulting }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span class="text-gray-600">进展滞后</span>
              </div>
              <span class="font-medium">{{ statusStats.slow }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span class="text-gray-600">已完成</span>
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
            <Calendar class="w-7 h-7 text-blue-500" />
            <div class="flex flex-col items-center ml-4">
              <span class="text-md text-gray-600">本月新增</span>
              <span class="text-2xl font-bold text-blue-600">{{ monthlyStats.newTasks }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <Clock class="w-7 h-7 text-orange-500" />
            <div class="flex flex-col items-center ml-4">
              <span class="text-sm text-gray-600">进行中</span>
              <span class="text-2xl font-bold text-orange-600">{{ monthlyStats.inProgress }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <CheckCircle class="w-7 h-7 text-green-500" />
            <div class="flex flex-col items-center ml-4">
              <span class="text-sm text-gray-600">已完成</span>
              <span class="text-2xl font-bold text-green-600">{{ monthlyStats.completed }}</span>
            </div>
          </div>
          <div class="flex items-center p-4 justify-center rounded-lg" style="border: 1px solid #e5e7eb;">
            <TimerOff class="w-7 h-7 text-red-500" />
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
              placeholder="输入搜索关键词"
              :suffix-icon="Search"
              class="w-40%"
              >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="selectedDepartment" placeholder="全部部门" clearable style="width: 50%;">
              <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
            <el-select v-model="selectedStatus" placeholder="全部状态" clearable style="width: 50%;">
              <el-option
                v-for="status in statuses"
                :key="status"
                :label="status"
                :value="status"
              />
            </el-select>
            <el-button>
              <Bell class="w-5 h-5 mr-2" /> 一键提醒 
            </el-button>
            <el-button type="text" class="text-blue-600 hover:text-blue-700">
              更多 
            </el-button>
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
                    task.status === '已完成' ? 'bg-green-100 text-green-800' :
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
                  <Users class="w-4 h-4 text-gray-400 mr-2" />
                  <span class="text-gray-500">牵头部门：</span>
                  <span class="text-gray-700">{{ task.leadDepartment }}</span>
                </div>
                <div class="flex items-center">
                  <Clock class="w-4 h-4 text-gray-400 mr-2" />
                  <span class="text-gray-500">截止时间：</span>
                  <span :class="task.isOverdue ? 'text-red-600' : 'text-gray-700'">
                    {{ task.deadline }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-500">分管领导：</span>
                  <span class="text-gray-700">{{ task.supervisor }}</span>
                </div>
              </div>
              <div class="flex items-center text-sm mt-3">
                <span class="text-gray-500">协办部门：</span>
                <span class="text-gray-700">{{ task.assistDepartments.join('、') }}</span>
              </div>
              
              <div class="mt-3 flex items-center justify-between text-sm">
                <div class="flex items-center">
                  <span class="text-gray-500">创建时间：</span>
                  <span class="text-gray-700">{{ task.createdDate }}</span>
                  <div class="flex items-center">
                    <span v-if="task.daysRemaining" class="ml-2 text-orange-600">
                      剩余{{ task.daysRemaining }}天
                    </span>
                    <AlertTriangle v-if="task.isOverdue" class="w-6 h-6 text-red-500 ml-2" />
                    <span v-if="task.overdueDays" class="ml-2 text-orange-600">
                      超时{{ task.overdueDays }}天
                    </span>
                  </div>
                </div>
                <div class="flex ml-6">
                  <el-button class="w-20" @click="openDetailDialog(task)">
                    查看详情
                  </el-button>
                  <el-button class="w-20">
                    流转
                  </el-button>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>

    <!-- 督办详情弹框 -->
    <SupervisionDetailDialog
      v-model="detailDialogVisible"
      :task-data="selectedTask"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Calendar,
  Clock,
  CheckCircle,
  TimerOff,
  Search,
  Bell,
  ChevronRight,
  Users,
  Building,
  User,
  AlertTriangle
} from 'lucide-vue-next'
import SupervisionDetailDialog from './components/SupervisionDetailDialog.vue'
import { mockTaskStats, mockStatusStats, mockMonthlyStats, mockSupervisionTasks } from '@/api/supervision/mock'

// Reactive data
const activeTab = ref('work')
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

// 弹框相关状态
const detailDialogVisible = ref(false)
const selectedTask = ref(null)

// Static data
const tabs = [
  { key: 'work', label: '工作督办' },
  { key: 'special', label: '专项督办' }
]

const departments = ['学生处', '保卫处', '后勤处', '教务处', '人事处']
const statuses = ['进行中', '已完成', '已超时', '待开始']

// Statistics data
const taskStats = ref({
  total: 0,
  workSupervision: 0,
  specialSupervision: 0
})

const statusStats = ref({
  total: 0,
  fast: 0,
  consulting: 0,
  slow: 0,
  completed: 0
})

const monthlyStats = ref({
  newTasks: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

// 任务列表数据
const tasks = ref([])

// 获取数据
const fetchData = async () => {
  try {
    // 获取任务统计数据
    const taskStatsData = await mockTaskStats()
    taskStats.value = taskStatsData
    
    // 获取状态统计数据
    const statusStatsData = await mockStatusStats()
    statusStats.value = statusStatsData
    
    // 获取月度统计数据
    const monthlyStatsData = await mockMonthlyStats()
    monthlyStats.value = monthlyStatsData
    
    // 获取任务列表
    const tasksData = await mockSupervisionTasks(20)
    tasks.value = tasksData
  } catch (error) {
    console.error('获取督办数据失败', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

// Computed properties
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesTab = activeTab.value === task.type
    const matchesSearch = !searchQuery.value || 
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesDepartment = !selectedDepartment.value || 
      task.leadDepartment === selectedDepartment.value ||
      task.assistDepartments.includes(selectedDepartment.value)
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value
    
    return matchesTab && matchesSearch && matchesDepartment && matchesStatus
  })
})

// 打开详情弹框
function openDetailDialog(task) {
  selectedTask.value = task
  detailDialogVisible.value = true
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
  background-color: #ebeef5; /* 替换var(--el-border-color-light)为具体的颜色值 */
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

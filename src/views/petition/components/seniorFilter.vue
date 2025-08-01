<template>
  <el-dialog
    v-model="dialogVisible"
    width="800px"
    :before-close="handleClose"
    class="advanced-filter-dialog"
  >
    <div class="flex items-center mb-6">
      <div class="w-10 h-10 rounded-md mr-2 flex items-center justify-center" style="background-color: #409EFF">
        <el-icon size="20"><Filter color="white"/></el-icon>
      </div>
      <div class="text-gray-500 flex flex-col">
        <span class="text-lg font-bold">高级筛选</span>
        <span>已选择 <span class="text-blue-500 font-bold">{{ selectedFiltersCount }}</span> 个筛选条件</span>
      </div>
    </div>

    <div class="dialog-content">
      
        <!-- 时间范围筛选 -->
        <div class="mb-6">
            <div class="flex items-center mb-2">
                <div class="w-10 h-10 rounded-md mr-2 flex items-center justify-center" style="background-color: #cef8e2">
                    <el-icon size="20"><CalendarRange color="green"/></el-icon>
                </div>
                <div class="text-gray-500 flex flex-col">
                    <div class="section-title font-bold text-gray-700">时间范围</div>
                    <span>请选择需要统计的时间范围</span>
                </div>
            </div>
            <div class="ml-12">
                <el-date-picker
                        v-model="filterData.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
            </div>
        </div>

      <!-- 基础筛选 -->
      <div class="mb-6">
        <div class="flex items-center mb-2">
                <div class="w-10 h-10 rounded-md mr-2 flex items-center justify-center" style="background-color: #9cc5ef">
                    <el-icon size="20"><ChartColumn color="blue"/></el-icon>
                </div>
                <div class="text-gray-500 flex flex-col">
                    <div class="section-title font-bold text-gray-700">基础筛选</div>
                    <span>按信访类型、分类和状态筛选</span>
                </div>
        </div>
        <div class="grid grid-cols-4 ml-12">
          <!-- 信访类型 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><FileText color="blue"/></el-icon>信访类型</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="type in petitionTypes" 
                :key="type.value" 
                v-model="filterData.petitionTypes[type.value]"
              >
                {{ type.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 信访目的 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><TriangleAlert color="orange"/></el-icon>信访目的</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="purpose in petitionPurposes" 
                :key="purpose.value" 
                v-model="filterData.petitionPurposes[purpose.value]"
              >
                {{ purpose.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 信访内容分类 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><Notebook color="purple"/></el-icon>信访内容</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="category in contentCategories" 
                :key="category.value" 
                v-model="filterData.contentCategories[category.value]"
              >
                {{ category.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 处理状态 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><CircleCheck color="green"/></el-icon>处理状态</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="status in processingStatuses" 
                :key="status.value" 
                v-model="filterData.processingStatuses[status.value]"
              >
                {{ status.label }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级筛选 -->
      <div class="filter-section">
        <div class="flex items-center mb-2">
                <div class="w-10 h-10 rounded-md mr-2 flex items-center justify-center" style="background-color: #d9baf1">
                    <el-icon size="20"><Users color="purple"/></el-icon>
                </div>
                <div class="text-gray-500 flex flex-col">
                    <div class="section-title font-bold text-gray-700">高级筛选</div>
                    <span>按优先级、部门和人员类型筛选</span>
                </div>
        </div>
        <div class="grid grid-cols-4 ml-12">
          <!-- 优先级 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><ChartSpline color="red"/></el-icon>优先级</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="priority in priorityLevels" 
                :key="priority.value" 
                v-model="filterData.priorityLevels[priority.value]"
              >
                {{ priority.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 部门 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><Building /></el-icon>部门</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="dept in departments" 
                :key="dept.value" 
                v-model="filterData.departments[dept.value]"
              >
                {{ dept.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 信访人类型 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><User color="blue"/></el-icon>信访人类型</div>
            <div class="flex flex-col gap-2">
              <el-checkbox 
                v-for="type in petitionerTypes" 
                :key="type.value" 
                v-model="filterData.petitionerTypes[type.value]"
              >
                {{ type.label }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-end">
        <el-button :icon="Filter" @click="clearFilters">清空筛选</el-button>
        <el-button :icon="SuccessFilled" type="primary" @click="applyFilters">应用筛选</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, SuccessFilled } from '@element-plus/icons-vue'
import { CalendarRange, ChartColumn, FileText, TriangleAlert, Notebook, CircleCheck, Users, ChartSpline, Building, User } from 'lucide-vue-next'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'apply', 'clear'])

// 控制对话框显示
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 筛选数据
const filterData = ref({
  dateRange: [],
  petitionTypes: {}, // 信访类型
  petitionPurposes: {}, // 信访目的
  contentCategories: {}, // 信访内容分类
  processingStatuses: {}, // 处理状态
  priorityLevels: {}, // 优先级
  departments: {}, // 部门
  petitionerTypes: {} // 信访人类型
})

// 选项数据
const petitionTypes = [
  { label: '上级转办转交', value: 'work' },
  { label: '书记校长信箱', value: 'special' },
  { label: '来人来电来信', value: 'specially' },
]

const petitionPurposes = [
  { label: '咨询求助', value: 'consultation' },
  { label: '意见建议', value: 'suggestion' },
  { label: '投诉举报', value: 'complaint' },
  { label: '其他', value: 'other' }
]

const contentCategories = [
  { label: '教学管理', value: 'teaching' },
  { label: '学生管理', value: 'student' },
  { label: '后勤服务', value: 'logistics' },
  { label: '校园安全', value: 'safety' },
  { label: '其他', value: 'other' }
]

const processingStatuses = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已超时', value: 'overdue' }
]

const priorityLevels = [
  { label: '一般优先', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
]

const departments = [
  { label: '教务处', value: 'academic' },
  { label: '学生处', value: 'student' },
  { label: '后勤处', value: 'logistics' },
  { label: '保卫处', value: 'security' },
  { label: '其他部门', value: 'other' }
]

const petitionerTypes = [
  { label: '学生', value: 'student' },
  { label: '教职工', value: 'staff' },
  { label: '家长', value: 'parent' },
  { label: '其他', value: 'other' }
]

// 计算已选择的筛选条件数量
const selectedFiltersCount = computed(() => {
  let count = 0
  
  // 日期范围
  if (filterData.value.dateRange && filterData.value.dateRange.length === 2 && 
      filterData.value.dateRange[0] && filterData.value.dateRange[1]) {
    count++
  }
  // 计算其他筛选条件
  const countSelectedInObject = (obj: Record<string, boolean>) => {
    return Object.values(obj).filter(Boolean).length
  }
  
  count += countSelectedInObject(filterData.value.petitionTypes)
  count += countSelectedInObject(filterData.value.petitionPurposes)
  count += countSelectedInObject(filterData.value.contentCategories)
  count += countSelectedInObject(filterData.value.processingStatuses)
  count += countSelectedInObject(filterData.value.priorityLevels)
  count += countSelectedInObject(filterData.value.departments)
  count += countSelectedInObject(filterData.value.petitionerTypes)
  
  return count
})

// 清空筛选条件
const clearFilters = () => {
  // 重置所有筛选条件
  filterData.value = {
    dateRange: [],
    petitionTypes: {},
    petitionPurposes: {},
    contentCategories: {},
    processingStatuses: {},
    priorityLevels: {},
    departments: {},
    petitionerTypes: {}
  }
  
  // 重新初始化各个筛选项的对象，确保所有勾选框状态为未选中
  petitionTypes.forEach(option => {
    filterData.value.petitionTypes[option.value] = false
  })
  
  petitionPurposes.forEach(option => {
    filterData.value.petitionPurposes[option.value] = false
  })
  
  contentCategories.forEach(option => {
    filterData.value.contentCategories[option.value] = false
  })
  
  processingStatuses.forEach(option => {
    filterData.value.processingStatuses[option.value] = false
  })
  
  priorityLevels.forEach(option => {
    filterData.value.priorityLevels[option.value] = false
  })
  
  departments.forEach(option => {
    filterData.value.departments[option.value] = false
  })
  
  petitionerTypes.forEach(option => {
    filterData.value.petitionerTypes[option.value] = false
  })
  
  emit('clear')
  ElMessage.success('筛选条件已清除')
}

// 应用筛选条件
const applyFilters = () => {
  // 构建筛选条件对象
  const filters = {
    dateRange: filterData.value.dateRange,
    petitionTypes: Object.entries(filterData.value.petitionTypes)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    petitionPurposes: Object.entries(filterData.value.petitionPurposes)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    contentCategories: Object.entries(filterData.value.contentCategories)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    processingStatuses: Object.entries(filterData.value.processingStatuses)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    priorityLevels: Object.entries(filterData.value.priorityLevels)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    departments: Object.entries(filterData.value.departments)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    petitionerTypes: Object.entries(filterData.value.petitionerTypes)
      .filter(([_, selected]) => selected)
      .map(([value]) => value),
    selectedFiltersCount
  }
  
  emit('apply', filters)
  dialogVisible.value = false
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.advanced-filter-dialog :deep(.el-dialog__header) {
  display: none;
}

.advanced-filter-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.filter-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.filter-section:last-child {
  border-bottom: none;
}

.group-title {
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
  padding-top: 10px;
}

.section-title {
  font-size: 16px;
}

</style>
<template>
  <el-dialog
    v-model="visible"
    title="高级筛选"
    width="800px"
    :before-close="handleClose"
    class="senior-filter-dialog"
  >
    <div class="senior-filter-content">
      <!-- 已选择筛选条件提示 -->
      <div class="filter-count-tip">
        <Icon icon="lucide:filter" class="filter-icon" />
        <span>已选择{{ totalFilterCount }}个筛选条件</span>
      </div>

      <!-- 时间范围筛选 -->
      <div class="filter-section">
        <div class="section-title">
          <el-icon class="section-icon" size="20"><CalendarRange color="green"/></el-icon>
          <span>时间范围</span>
        </div>
        <div class="section-content">
          <div class="time-range-row" style="display: flex; align-items: center; gap: 24px;">
            <div style="display:flex; align-items:center;">
              <span class="time-label">创建时间：</span>
              <el-date-picker
                v-model="filters.createTime"
                type="datetime"
                placeholder="请选择创建时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="time-picker"
              />
            </div>
            <div style="display:flex; align-items:center; margin-left: auto;">
              <span class="time-label">截止时间：</span>
              <el-date-picker
                v-model="filters.deadlineTime"
                type="datetime"
                placeholder="请选择截止时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="time-picker"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 基础筛选 -->
      <div class="filter-section">
        <div class="section-title">
          <el-icon class="section-icon" size="20"><ChartColumn color="blue"/></el-icon>
          <span>基础筛选</span>
        </div>
        <div class="section-content">
          <!-- 督办类型 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><FileText color="blue"/></el-icon>督办类型</div>
            <div class="checkbox-group">
              <el-checkbox
                v-for="type in supervisionTypes"
                :key="type.value"
                v-model="filters.supervisionTypes"
                :label="type.value"
                @change="handleSupervisionTypeChange"
              >
                {{ type.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 督办分类 -->
          <div class="filter-group" v-if="availableCategories.length > 0">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><CircleCheck color="green"/></el-icon>督办分类</div>
            <div class="checkbox-group">
              <el-checkbox
                v-for="category in availableCategories"
                :key="category.value"
                v-model="filters.supervisionCategories"
                :label="category.value"
              >
                {{ category.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 批示状态 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><Notebook color="purple"/></el-icon>批示状态</div>
            <div class="checkbox-group">
              <el-checkbox
                v-for="status in instructionStatuses"
                :key="status.value"
                v-model="filters.instructionStatuses"
                :label="status.value"
              >
                {{ status.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 优先级 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><TriangleAlert color="orange"/></el-icon>优先级</div>
            <div class="checkbox-group">
              <el-checkbox
                v-for="priority in urgencyLevels"
                :key="priority.value"
                v-model="filters.urgencyLevels"
                :label="priority.value"
              >
                {{ priority.label }}
              </el-checkbox>
            </div>
          </div>

          <!-- 处理状态 -->
          <div class="filter-group">
            <div class="group-title mb-2"><el-icon class="mr-2" size="20"><ChartSpline color="red"/></el-icon>处理状态</div>
            <div class="checkbox-group">
              <el-checkbox
                v-for="status in processingStatuses"
                :key="status.value"
                v-model="filters.processingStatuses"
                :label="status.value"
              >
                {{ status.label }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>

      <!-- 人员、部门筛选 -->
      <div class="filter-section">
        <div class="section-title">
          <el-icon class="section-icon" size="20"><Users color="purple"/></el-icon>
          <span>人员、部门筛选</span>
        </div>
        <div class="section-content">
          <!-- 校领导 -->
          <div class="selector-group">
            <div class="selector-label"><el-icon class="mr-2" size="16"><User color="blue"/></el-icon>校领导</div>
            <div class="selector-input-group">
              <el-input
                v-model="filters.schoolLeadersDisplay"
                placeholder="请选择校领导"
                readonly
                class="selector-input"
              >
                <template #suffix>
                  <el-icon
                    v-if="filters.schoolLeadersDisplay"
                    class="el-input__icon el-input__clear"
                    role="button"
                    tabindex="0"
                    title="清空"
                    @click="clearSchoolLeaders"
                    @keydown.enter.prevent="clearSchoolLeaders"
                    @keydown.space.prevent="clearSchoolLeaders"
                  >
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" plain @click="openSchoolLeaderSelector">
                点击选择校领导
              </el-button>
            </div>
          </div>

          <!-- 督办人 -->
          <div class="selector-group">
            <div class="selector-label"><el-icon class="mr-2" size="16"><User color="green"/></el-icon>督办人</div>
            <div class="selector-input-group">
              <el-input
                v-model="filters.supervisorsDisplay"
                placeholder="请选择督办人"
                readonly
                class="selector-input"
              >
                <template #suffix>
                  <el-icon
                    v-if="filters.supervisorsDisplay"
                    class="el-input__icon el-input__clear"
                    role="button"
                    tabindex="0"
                    title="清空"
                    @click="clearSupervisors"
                    @keydown.enter.prevent="clearSupervisors"
                    @keydown.space.prevent="clearSupervisors"
                  >
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" plain @click="openSupervisorSelector">
                点击选择督办人
              </el-button>
            </div>
          </div>

          <!-- 牵头单位 -->
          <div class="selector-group">
            <div class="selector-label"><el-icon class="mr-2" size="16"><Building color="orange"/></el-icon>牵头单位</div>
            <div class="selector-input-group">
              <el-input
                v-model="filters.leadDeptDisplay"
                placeholder="请选择牵头单位"
                readonly
                class="selector-input"
              >
                <template #suffix>
                  <el-icon
                    v-if="filters.leadDeptDisplay"
                    class="el-input__icon el-input__clear"
                    role="button"
                    tabindex="0"
                    title="清空"
                    @click="clearLeadDept"
                    @keydown.enter.prevent="clearLeadDept"
                    @keydown.space.prevent="clearLeadDept"
                  >
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" plain @click="openLeadDeptSelector">
                点击选择牵头单位
              </el-button>
            </div>
          </div>

          <!-- 协办单位 -->
          <div class="selector-group">
            <div class="selector-label"><el-icon class="mr-2" size="16"><Building color="purple"/></el-icon>协办单位</div>
            <div class="selector-input-group">
              <el-input
                v-model="filters.collaborateDeptsDisplay"
                placeholder="请选择协办单位"
                readonly
                class="selector-input"
              >
                <template #suffix>
                  <el-icon
                    v-if="filters.collaborateDeptsDisplay"
                    class="el-input__icon el-input__clear"
                    role="button"
                    tabindex="0"
                    title="清空"
                    @click="clearCollaborateDepts"
                    @keydown.enter.prevent="clearCollaborateDepts"
                    @keydown.space.prevent="clearCollaborateDepts"
                  >
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" plain @click="openCollaborateDeptSelector">
                点击选择协办单位
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <span class="current-filter-count">当前筛选条件：{{ totalFilterCount }}</span>
        </div>
        <div class="footer-right">
          <el-button @click="clearAllFilters" class="clear-btn">
            清空筛选
          </el-button>
          <el-button type="primary" @click="applyFilters" :loading="applyLoading">
            应用筛选（{{ resultCount }}条数据）
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 复用通用选择组件 -->
  <UserSelectForm ref="userSelectFormRef" @confirm="onUserSelectConfirm" />
  <DeptSelectForm
    ref="deptSelectFormRef"
    @confirm="onDeptSelectConfirm"
    :multiple="true"
    :check-strictly="false"
  />

</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { Filter, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { CalendarRange, ChartColumn, FileText, TriangleAlert, Notebook, CircleCheck, Users, ChartSpline, Building, User } from 'lucide-vue-next'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { OrderApi, SupervisionTypeRespVO } from '@/api/supervision'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import DeptSelectForm from '@/components/DeptSelectForm/index.vue'

defineOptions({ name: 'SupervisionSeniorFilter' })

// Props
interface Props {
  modelValue: boolean
  resultCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  resultCount: 0
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', filters: any): void
  (e: 'clear'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const applyLoading = ref(false)

// 筛选条件
const filters = reactive({
  createTime: null as string | null,
  deadlineTime: null as string | null,
  supervisionTypes: [] as number[],
  supervisionCategories: [] as number[],
  instructionStatuses: [] as number[],
  urgencyLevels: [] as number[],
  processingStatuses: [] as number[],
  schoolLeaders: [] as number[],
  schoolLeadersDisplay: '',
  supervisors: [] as number[],
  supervisorsDisplay: '',
  leadDept: [] as number[],
  leadDeptDisplay: '',
  collaborateDepts: [] as number[],
  collaborateDeptsDisplay: ''
})

// 基础数据
const userList = ref<any[]>([])
const deptList = ref<any[]>([])

// 督办类型选项
const supervisionTypes = ref([
  { value: 1, label: '工作督办' },
  { value: 2, label: '专项督查' }
])

// 督办分类选项（动态加载）
const workSupervisionCategories = ref<any[]>([])
const specialSupervisionCategories = ref<any[]>([])

// 批示状态选项
const instructionStatuses = ref([
  { value: 1, label: '已批示' },
  { value: 0, label: '未批示' }
])

// 优先级选项
const urgencyLevels = ref([
  { value: 1, label: '一般优先' },
  { value: 2, label: '中优先级' },
  { value: 3, label: '高优先级' }
])

// 处理状态选项
const processingStatuses = ref([
  { value: 4, label: '待审核' },
  { value: 1, label: '进行中' },
  { value: 3, label: '已结束' },
  { value: 2, label: '已超时' }
])

// 可用的督办分类（根据选择的督办类型动态显示）
const availableCategories = computed(() => {
  const categories: any[] = []
  
  if (filters.supervisionTypes.includes(1)) {
    categories.push(...workSupervisionCategories.value)
  }
  
  if (filters.supervisionTypes.includes(2)) {
    categories.push(...specialSupervisionCategories.value)
  }
  
  // 去重
  const uniqueCategories = categories.filter((item, index, self) => 
    index === self.findIndex(t => t.value === item.value)
  )
  
  return uniqueCategories
})

// 总筛选条件数量
const totalFilterCount = computed(() => {
  let count = 0
  
  if (filters.createTime) count++
  if (filters.deadlineTime) count++
  if (filters.supervisionTypes.length > 0) count++
  if (filters.supervisionCategories.length > 0) count++
  if (filters.instructionStatuses.length > 0) count++
  if (filters.urgencyLevels.length > 0) count++
  if (filters.processingStatuses.length > 0) count++
  if (filters.schoolLeaders.length > 0) count++
  if (filters.supervisors.length > 0) count++
  if (filters.leadDept.length > 0) count++
  if (filters.collaborateDepts.length > 0) count++
  
  return count
})

// 人员选择器相关（改为复用通用组件 UserSelectForm）
const userSelectFormRef = ref()
const userSelectorType = ref('')
const selectedUserIds = ref<number[]>([])

// 部门选择器相关（改为复用通用组件 DeptSelectForm）
const deptSelectFormRef = ref()
const deptSelectorType = ref('')
const selectedDeptIds = ref<number[]>([])

// 关闭弹窗处理
const handleClose = (done: () => void) => {
  done()
}

// 方法
const loadUserList = async () => {
  try {
    const result = await UserApi.getSimpleUserList()
    userList.value = result || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

const loadDeptList = async () => {
  try {
    const result = await DeptApi.getSimpleDeptList()
    deptList.value = result || []
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败')
  }
}

const loadSupervisionCategories = async () => {
  try {
    console.log('开始加载督办分类数据...')
    
    // 加载工作督办分类
    console.log('调用API获取工作督办分类...')
    const workResult = await OrderApi.getSupervisionDetailTypes(1)
    console.log('工作督办分类API返回:', workResult)
    
    if (workResult && Array.isArray(workResult)) {
      workSupervisionCategories.value = workResult.map((item: SupervisionTypeRespVO) => ({
        value: item.id,
        label: item.type
      }))
    }
    console.log('工作督办分类处理后:', workSupervisionCategories.value)

    // 加载专项督查分类
    console.log('调用API获取专项督查分类...')
    const specialResult = await OrderApi.getSupervisionDetailTypes(2)
    console.log('专项督查分类API返回:', specialResult)
    
    if (specialResult && Array.isArray(specialResult)) {
      specialSupervisionCategories.value = specialResult.map((item: SupervisionTypeRespVO) => ({
        value: item.id,
        label: item.type
      }))
    }
    console.log('专项督查分类处理后:', specialSupervisionCategories.value)
  } catch (error) {
    console.error('加载督办分类失败:', error)
    ElMessage.error('加载督办分类失败')
  }
}

const handleSupervisionTypeChange = () => {
  // 当督办类型变化时，清空已选择的督办分类（如果不在可用分类中）
  const availableValues = availableCategories.value.map(cat => cat.value)
  filters.supervisionCategories = filters.supervisionCategories.filter(cat => 
    availableValues.includes(cat)
  )
}

// 打开校领导选择器（复用 UserSelectForm）
const openSchoolLeaderSelector = () => {
  userSelectorType.value = 'schoolLeaders'
  selectedUserIds.value = [...filters.schoolLeaders]
  const selectedList = userList.value.filter(u => selectedUserIds.value.includes(u.id))
  // open(id, deptId?, selectedList?, currentUserId?) - 此处无需限制部门
  userSelectFormRef.value?.open(null, undefined, selectedList)
}

// 打开督办人选择器（复用 UserSelectForm）
const openSupervisorSelector = () => {
  userSelectorType.value = 'supervisors'
  selectedUserIds.value = [...filters.supervisors]
  const selectedList = userList.value.filter(u => selectedUserIds.value.includes(u.id))
  userSelectFormRef.value?.open(null, undefined, selectedList)
}

// 打开牵头单位选择器（复用 DeptSelectForm）
const openLeadDeptSelector = () => {
  deptSelectorType.value = 'leadDept'
  selectedDeptIds.value = [...filters.leadDept]
  const selectedList = deptList.value.filter(d => selectedDeptIds.value.includes(d.id))
  deptSelectFormRef.value?.open(selectedList)
}

// 打开协办单位选择器（复用 DeptSelectForm）
const openCollaborateDeptSelector = () => {
  deptSelectorType.value = 'collaborateDepts'
  selectedDeptIds.value = [...filters.collaborateDepts]
  const selectedList = deptList.value.filter(d => selectedDeptIds.value.includes(d.id))
  deptSelectFormRef.value?.open(selectedList)
}

// 通用人员选择组件回调
const onUserSelectConfirm = (_id: any, selectedUsers: any[]) => {
  const ids = selectedUsers.map((u: any) => u.id)
  const displayText = selectedUsers.map((u: any) => u.nickname || u.username).join('，')
  if (userSelectorType.value === 'schoolLeaders') {
    filters.schoolLeaders = ids
    filters.schoolLeadersDisplay = displayText
  } else if (userSelectorType.value === 'supervisors') {
    filters.supervisors = ids
    filters.supervisorsDisplay = displayText
  }
}

// 通用部门选择组件回调
const onDeptSelectConfirm = (selectedDepts: any[]) => {
  const ids = selectedDepts.map((d: any) => d.id)
  const displayText = selectedDepts.map((d: any) => d.name).join('，')
  if (deptSelectorType.value === 'leadDept') {
    filters.leadDept = ids
    filters.leadDeptDisplay = displayText
  } else if (deptSelectorType.value === 'collaborateDepts') {
    filters.collaborateDepts = ids
    filters.collaborateDeptsDisplay = displayText
  }
}

// 清空：校领导
const clearSchoolLeaders = () => {
  filters.schoolLeaders = []
  filters.schoolLeadersDisplay = ''
  selectedUserIds.value = []
}

// 清空：督办人
const clearSupervisors = () => {
  filters.supervisors = []
  filters.supervisorsDisplay = ''
  selectedUserIds.value = []
}

// 清空：牵头单位
const clearLeadDept = () => {
  filters.leadDept = []
  filters.leadDeptDisplay = ''
  selectedDeptIds.value = []
}

// 清空：协办单位
const clearCollaborateDepts = () => {
  filters.collaborateDepts = []
  filters.collaborateDeptsDisplay = ''
  selectedDeptIds.value = []
}

// 清空所有筛选条件
const clearAllFilters = () => {
  filters.createTime = null
  filters.deadlineTime = null
  filters.supervisionTypes = []
  filters.supervisionCategories = []
  filters.instructionStatuses = []
  filters.urgencyLevels = []
  filters.processingStatuses = []
  filters.schoolLeaders = []
  filters.schoolLeadersDisplay = ''
  filters.supervisors = []
  filters.supervisorsDisplay = ''
  filters.leadDept = []
  filters.leadDeptDisplay = ''
  filters.collaborateDepts = []
  filters.collaborateDeptsDisplay = ''
  
  emit('clear')
}

// 应用筛选
const applyFilters = () => {
  applyLoading.value = true
  
  // 构建筛选参数
  const filterParams: any = {}
  
  // 创建时间与截止时间（单点，可各自独立）
  if (filters.createTime) {
    filterParams.startTime = filters.createTime
  }
  if (filters.deadlineTime) {
    filterParams.endTime = filters.deadlineTime
  }
  
  // 督办类型（1=工作督办，2=专项督查）
  if (filters.supervisionTypes.length > 0) {
    filterParams.type = filters.supervisionTypes
  }

  // 督办分类（传递ID数组）
  if (filters.supervisionCategories.length > 0) {
    filterParams.supervisionTypes = filters.supervisionCategories
  }
  
  // 批示状态 (1=已批示, 0=未批示)
  if (filters.instructionStatuses.length > 0) {
    filterParams.remarkStatus = filters.instructionStatuses
  }
  
  // 优先级
  if (filters.urgencyLevels.length > 0) {
    filterParams.priority = filters.urgencyLevels
  }
  
  // 处理状态
  if (filters.processingStatuses.length > 0) {
    filterParams.supervisionStatusList = filters.processingStatuses
  }
  
  // 校领导（转为逗号分隔字符串）
  if (filters.schoolLeaders.length > 0) {
    filterParams.schoolLeaders = filters.schoolLeaders.join(',')
  }
  
  // 督办人（转为逗号分隔字符串）
  if (filters.supervisors.length > 0) {
    filterParams.supervisors = filters.supervisors.join(',')
  }
  
  // 牵头单位（转为逗号分隔字符串）
  if (filters.leadDept.length > 0) {
    filterParams.leadDept = filters.leadDept.join(',')
  }
  
  // 协办单位（转为逗号分隔字符串）
  if (filters.collaborateDepts.length > 0) {
    filterParams.coDept = filters.collaborateDepts.join(',')
  }
  
  console.log('高级筛选参数:', filterParams)
  emit('apply', filterParams)
  
  setTimeout(() => {
    applyLoading.value = false
    visible.value = false
  }, 500)
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadUserList(),
    loadDeptList(),
    loadSupervisionCategories()
  ])
})


// 暴露方法给父组件调用
defineExpose({
  clearAllFilters
})
</script>

<style scoped lang="scss">
.senior-filter-dialog {
  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.senior-filter-content {
  .filter-count-tip {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #f0f9ff;
    border: 1px solid #e0f2fe;
    border-radius: 6px;
    margin-bottom: 20px;
    color: #0369a1;
    font-size: 14px;
    
    .filter-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }

  .filter-section {
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;

    .section-title {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 500;
      color: #374151;

      .section-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #6b7280;
      }
    }

    .section-content {
      padding: 16px;

      .time-range-row {
        display: flex;
        align-items: center;
        gap: 12px;

        .time-label {
          font-size: 14px;
          color: #374151;
          white-space: nowrap;
        }

        .time-picker {
          flex: 1;
          max-width: 400px;
        }
      }

      .filter-group {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .group-title {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;

          .el-checkbox {
            margin-right: 0;
          }
        }
      }

      .selector-group {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .selector-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .selector-input-group {
          display: flex;
          gap: 12px;

          .selector-input {
            flex: 1;
          }

          .el-button {
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0 0;
  border-top: 1px solid #e5e7eb;

  .footer-left {
    .current-filter-count {
      font-size: 14px;
      color: #6b7280;
    }
  }

  .footer-right {
    display: flex;
    gap: 12px;

    .clear-btn {
      color: #6b7280;
      border-color: #d1d5db;

      &:hover {
        color: #374151;
        border-color: #9ca3af;
      }
    }
  }
}

.clear-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  color: #909399;
  border-radius: 9999px;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.05s ease;

  &:hover {
    color: #409eff; /* Element Plus primary */
    background-color: rgba(64, 158, 255, 0.12);
  }

  &:active {
    color: #337ecc;
    background-color: rgba(64, 158, 255, 0.18);
    transform: scale(0.92);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.user-selector-dialog,
.dept-selector-dialog {
  .search-input {
    margin-bottom: 16px;
  }

  .user-list,
  .dept-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;

    .user-item,
    .dept-item {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .el-checkbox {
        width: 100%;
      }
    }
  }
}
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="会议室占用管理"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
  >
    <div class="occupation-management">
      <!-- 会议室信息 -->
      <div class="room-info-form">
        <el-form label-width="80px">
          <el-form-item label="会议室">
            <el-input
              :value="roomInfo?.name || '未选择会议室'"
              readonly
              placeholder="会议室名称"
            />
          </el-form-item>
          <el-form-item v-if="roomInfo?.location" label="位置">
            <el-input
              :value="roomInfo.location"
              readonly
              placeholder="会议室位置"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 日期范围选择器 -->
      <div class="date-selector">
        <label class="form-label">选择日期范围：</label>
        <el-date-picker
          v-model="selectedDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          @change="handleDateRangeChange"
          class="date-picker"
        />
      </div>

      <!-- 时间段选择界面 -->
      <div class="time-slots-section" v-loading="loading.fetchingTimeSlots">
        <div class="section-header">
          <div>
            <label class="form-label">选择时间段：</label>
            <span v-if="selectedDateRange.length === 2" class="date-range-info">
              （将应用于 {{ selectedDateRange[0] }} 至 {{ selectedDateRange[1] }}）
            </span>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="toggleSelectAllTimeSlots"
            :disabled="availableUnoccupiedTimeSlots.length === 0"
          >
            {{ isAllSelected ? '取消全选' : '全选时间段' }}
          </el-button>
        </div>

        <div class="time-slots-grid" v-if="availableTimeSlots.length > 0">
          <div
            v-for="timeSlot in availableTimeSlots"
            :key="timeSlot.id"
            class="time-slot-button"
            :class="{
              'selected': selectedTimeSlots.includes(timeSlot.id),
              'occupied': timeSlot.occupied,
              'disabled': timeSlot.occupied
            }"
            @click="handleTimeSlotClick(timeSlot)"
          >
            <div class="time-range">
              {{ formatTime(timeSlot.startTime) }} - {{ formatTime(timeSlot.endTime) }}
            </div>
            <div v-if="timeSlot.occupied" class="occupation-status">
              <el-tag :type="getOccupationTagType(timeSlot.occupationInfo?.occupationTypeColor)" size="small">
                {{ timeSlot.occupationInfo?.occupationTypeName || '已占用' }}
              </el-tag>
              <div class="occupied-hint">已占用</div>
            </div>
          </div>
        </div>

        <el-empty v-else description="该日期暂无可用时间段" />
      </div>

      <!-- 占用信息表单 -->
      <div class="occupation-form">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item label="占用类型" prop="occupationType">
            <el-select
              v-model="formData.occupationType"
              placeholder="请选择占用类型"
              style="width: 100%"
            >
              <el-option
                v-for="option in occupationTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span>{{ option.label }}</span>
                <el-tag :type="option.colorType" size="small" style="margin-left: 8px">
                  {{ option.label }}
                </el-tag>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="占用原因" prop="occupationReason">
            <el-input
              v-model="formData.occupationReason"
              type="textarea"
              :rows="3"
              placeholder="请输入占用原因（1-200字符）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <!-- 已占用时间段显示区域 -->
          <el-form-item>
            <template #label>
              <span>已占用时间段</span>
            </template>

            <div v-if="currentDateOccupations.length > 0" class="occupied-time-slots" v-loading="loading.fetchingOccupations">
              <div
                v-for="occupation in currentDateOccupations"
                :key="occupation.id"
                class="occupied-slot-item"
              >
                <div class="slot-info">
                  <div class="time-info">
                    <el-tag :type="getOccupationTagType(occupation.occupationTypeColor)" size="small">
                      {{ occupation.occupationTypeName }}
                    </el-tag>
                    <span class="time-range">
                      {{ formatOccupationTimeRange(occupation) }}
                    </span>
                  </div>
                  <div class="reason-info">
                    <span class="reason-label">原因：</span>
                    <span class="reason-text" :title="occupation.occupationReason">{{ occupation.occupationReason }}</span>
                  </div>

                </div>
                <div class="slot-actions">
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="handleCancelOccupationFromList(occupation)"
                    :loading="loading.cancelling"
                  >
                    取消占用
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else-if="selectedDateRange.length === 2" class="no-occupations">
              <el-empty description="当前日期范围内暂无占用记录" :image-size="60" />
            </div>
            <div v-else class="no-date-selected">
              <el-alert
                title="请先选择日期范围以查看占用记录"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading.submitting"
          :disabled="selectedTimeSlots.length === 0"
        >
          添加占用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getDictOptions, DICT_TYPE } from '@/utils/dict'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { RoomTimeApi } from '@/api/meetingroom/roomtime'
import { createOccupation, cancelOccupation, getOccupationsByMeetingRoom } from '@/api/meetingroom/roomTimeOccupation'

/** 占用管理对话框 */
defineOptions({ name: 'OccupationManagementDialog' })

// 组件属性
interface Props {
  modelValue: boolean
  roomInfo?: {
    id: number
    name: string
    location?: string
  } | null
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  roomInfo: null
})

const emit = defineEmits<Emits>()

// 字典store
const dictStore = useDictStoreWithOut()

// 响应式数据
const formRef = ref<FormInstance>()
const selectedDateRange = ref<string[]>([])
const selectedTimeSlots = ref<number[]>([])
const availableTimeSlots = ref<any[]>([])
const currentDateOccupations = ref<any[]>([])

// 加载状态
const loading = reactive({
  fetchingTimeSlots: false,
  fetchingOccupations: false,
  submitting: false,
  cancelling: false
})

// 表单数据
const formData = reactive({
  occupationType: undefined as number | undefined,
  occupationReason: ''
})

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 占用类型选项
const occupationTypeOptions = computed(() => {
  // 强制刷新字典数据
  if (!dictStore.isSetDict) {
    dictStore.setDictMap()
  }

  const dictOptions = getDictOptions(DICT_TYPE.MEETINGROOM_OCCUPATION_TYPE)

  if (!dictOptions || dictOptions.length === 0) {
    // 如果字典数据为空，返回默认选项（移除"部门管理"选项）
    return [
      { value: 1, label: '维护', colorType: 'danger' },
      { value: 2, label: '其他', colorType: 'info' }
    ]
  }

  // 过滤掉"部门管理"相关的选项，只保留实际需要的选项
  return dictOptions
    .filter(item => !item.label.includes('部门管理'))
    .map(item => ({
      value: parseInt(item.value as string),
      label: item.label,
      colorType: item.colorType === 'default' ? 'info' : item.colorType || 'info'
    }))
})

// 计算属性：可用的未占用时间段
const availableUnoccupiedTimeSlots = computed(() => {
  return availableTimeSlots.value.filter(slot => !slot.occupied)
})

// 计算属性：是否全选
const isAllSelected = computed(() => {
  const unoccupiedSlots = availableUnoccupiedTimeSlots.value
  return unoccupiedSlots.length > 0 &&
         unoccupiedSlots.every(slot => selectedTimeSlots.value.includes(slot.id))
})

// 表单验证规则
const formRules: FormRules = {
  occupationType: [
    { required: true, message: '请选择占用类型', trigger: 'change' }
  ],
  occupationReason: [
    { required: true, message: '请输入占用原因', trigger: 'blur' },
    { min: 1, max: 200, message: '占用原因长度应在1-200字符之间', trigger: 'blur' }
  ]
}

// 禁用日期（只能选择今天及以后的日期）
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 格式化时间显示
const formatTime = (time: string) => {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return time
}

// 格式化日期时间显示
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化占用时间范围显示
const formatOccupationTimeRange = (occupation: any) => {
  // 第一优先级：使用批量时间范围字段（最清晰的显示）
  if (occupation.batchTimeRange) {
    return formatBatchTimeRange(occupation.batchTimeRange)
  }

  // 第二优先级：使用完整时间范围字段，智能解析为批量格式
  if (occupation.timeRange) {
    return formatTimeRangeToBatch(occupation.timeRange)
  }

  // 第三优先级：使用 startTime 和 endTime 构建批量格式
  if (occupation.startTime && occupation.endTime) {
    // 处理时间戳格式
    if (typeof occupation.startTime === 'number' && typeof occupation.endTime === 'number') {
      const startDate = new Date(occupation.startTime)
      const endDate = new Date(occupation.endTime)

      // 格式化为本地时间字符串 YYYY-MM-DD HH:mm:ss
      const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const startTimeStr = formatLocalDateTime(startDate)
      const endTimeStr = formatLocalDateTime(endDate)
      return formatStartEndTimeToBatch(startTimeStr, endTimeStr)
    }

    // 处理字符串格式
    if (typeof occupation.startTime === 'string' && typeof occupation.endTime === 'string') {
      return formatStartEndTimeToBatch(occupation.startTime, occupation.endTime)
    }
  }

  // 第四优先级：使用我们新添加的格式化显示字段
  if (occupation.timeRangeDisplay) {
    return occupation.timeRangeDisplay
  }

  // 第五优先级：使用智能简化显示
  if (occupation.timeRangeSimple) {
    const timeRangeWithoutSeconds = occupation.timeRangeSimple.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')
    if (occupation.occupationDate && !occupation.timeRangeSimple.includes('-07-')) {
      return `${occupation.occupationDate} ${timeRangeWithoutSeconds}`
    }
    return timeRangeWithoutSeconds
  }



  // 第六优先级：使用时间段信息构建批量格式
  if (occupation.timeSlot?.startTime && occupation.timeSlot?.endTime) {
    const startTime = formatTime(occupation.timeSlot.startTime)
    const endTime = formatTime(occupation.timeSlot.endTime)

    // 如果有占用日期显示，使用它构建批量格式
    if (occupation.occupationDateDisplay) {
      return `${occupation.occupationDateDisplay} 的 ${startTime}-${endTime}`
    }

    return `${startTime}-${endTime}`
  }

  return '时间未知'
}

/**
 * 格式化批量时间范围为标准显示格式
 * @param batchTimeRange 批量时间范围字符串
 * @returns 格式化后的显示字符串
 */
const formatBatchTimeRange = (batchTimeRange: string): string => {
  try {
    // 去掉秒数部分
    let formatted = batchTimeRange.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')

    // 转换日期格式：2025-07-04 到 2025-07-05 的 08:00-12:00
    // 目标格式：2025/7/4-2025/7/5 的 08:00-12:00
    formatted = formatted.replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, year, month, day) => {
      return `${year}/${parseInt(month)}/${parseInt(day)}`
    })

    // 替换 "到" 为 "-"
    formatted = formatted.replace(/\s到\s/g, '-')

    return formatted
  } catch (error) {
    return batchTimeRange
  }
}

/**
 * 将完整时间范围转换为批量格式
 * @param timeRange 完整时间范围字符串
 * @returns 批量格式的显示字符串
 */
const formatTimeRangeToBatch = (timeRange: string): string => {
  try {
    // 去掉秒数部分
    const timeRangeStr = timeRange.replace(/(\d{2}:\d{2}):\d{2}/g, '$1')

    // 尝试解析时间范围格式：2025-07-04 08:00 - 2025-07-05 12:00
    const rangeMatch = timeRangeStr.match(/(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) - (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/)

    if (rangeMatch) {
      const [, startDate, startTime, endDate, endTime] = rangeMatch

      // 转换日期格式
      const formattedStartDate = startDate.replace(/(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) => {
        return `${year}/${parseInt(month)}/${parseInt(day)}`
      })

      const formattedEndDate = endDate.replace(/(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) => {
        return `${year}/${parseInt(month)}/${parseInt(day)}`
      })

      // 如果是同一天
      if (startDate === endDate) {
        return `${formattedStartDate} 的 ${startTime}-${endTime}`
      }

      // 如果是跨日期的相同时间段占用
      if (startTime === endTime) {
        return `${formattedStartDate}-${formattedEndDate} 的 ${startTime}`
      }

      // 如果是不同日期的不同时间段占用
      return `${formattedStartDate}-${formattedEndDate} 的 ${startTime}-${endTime}`
    }

    return timeRangeStr
  } catch (error) {
    return timeRange
  }
}

/**
 * 将开始时间和结束时间转换为批量格式
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 批量格式的显示字符串
 */
const formatStartEndTimeToBatch = (startTime: string, endTime: string): string => {
  try {
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '时间格式错误'
    }

    // 格式化日期：2025/7/4
    const formattedStartDate = `${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}`
    const formattedEndDate = `${endDate.getFullYear()}/${endDate.getMonth() + 1}/${endDate.getDate()}`

    // 格式化时间：08:00
    const formattedStartTime = startDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const formattedEndTime = endDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // 如果是同一天
    if (formattedStartDate === formattedEndDate) {
      return `${formattedStartDate} 的 ${formattedStartTime}-${formattedEndTime}`
    }

    // 如果是跨日期的相同时间段占用
    if (formattedStartTime === formattedEndTime) {
      return `${formattedStartDate}-${formattedEndDate} 的 ${formattedStartTime}`
    }

    // 如果是不同日期的不同时间段占用
    return `${formattedStartDate}-${formattedEndDate} 的 ${formattedStartTime}-${formattedEndTime}`
  } catch (error) {
    return '时间解析失败'
  }
}

// 获取占用状态标签类型
const getOccupationTagType = (color?: string) => {
  const colorMap: Record<string, string> = {
    'orange': 'warning',
    'red': 'danger',
    'blue': 'primary',
    'gray': 'info'
  }
  return colorMap[color || 'gray'] || 'info'
}

// 获取正确的占用类型名称（前端重新映射）
const getCorrectOccupationTypeName = (occupation: any) => {
  // 优先使用当前字典数据
  const dictOptions = occupationTypeOptions.value
  const dictOption = dictOptions.find(option => option.value === occupation.occupationType)

  if (dictOption) {
    return dictOption.label
  }

  // 如果字典中没有找到，检查后端返回的名称是否包含"部门管理"
  let typeName = occupation.occupationTypeName || '未知类型'

  // 如果包含"部门管理"，根据占用类型值进行映射
  if (typeName.includes('部门管理')) {
    const typeMapping = {
      1: '维护',
      2: '其他'
    }
    typeName = typeMapping[occupation.occupationType] || '其他'
  }

  return typeName
}

// 日期范围变化处理
const handleDateRangeChange = async (dateRange: string[]) => {
  if (dateRange && dateRange.length === 2 && props.roomInfo?.id) {
    await fetchTimeSlots()
    await fetchCurrentDateOccupations()
  }
}

// 获取时间段列表
const fetchTimeSlots = async () => {
  if (!props.roomInfo?.id || !selectedDateRange.value || selectedDateRange.value.length !== 2) return

  loading.fetchingTimeSlots = true
  try {
    const response = await RoomTimeApi.getRoomTimePage({
      meetingRoomId: props.roomInfo.id,
      pageNo: 1,
      pageSize: 100
    })

    if (response && response.list) {
      // 获取占用记录来更新时间段的占用状态
      const occupationResponse = await getOccupationsByMeetingRoom(props.roomInfo.id)

      // 统一处理API响应格式
      let occupations: any[] = []
      if (occupationResponse) {
        if (Array.isArray(occupationResponse)) {
          occupations = occupationResponse
        } else if (occupationResponse.data && Array.isArray(occupationResponse.data)) {
          occupations = occupationResponse.data
        } else if (occupationResponse.list && Array.isArray(occupationResponse.list)) {
          occupations = occupationResponse.list
        } else if (occupationResponse.code === 0 && occupationResponse.data && Array.isArray(occupationResponse.data)) {
          occupations = occupationResponse.data
        }
      }

      // 获取所有有效的占用记录（不按当前选择的日期范围过滤）
      const currentOccupations = occupations.filter((occupation: any) => {
        // 只过滤有效状态的占用记录
        if (occupation.status !== undefined && occupation.status !== 1) {
          return false
        }

        // 检查 startTime 是否存在
        if (!occupation.startTime) {
          return false
        }

        return true
      })



      // 更新时间段的占用状态
      const currentStartDate = new Date(selectedDateRange.value[0])
      const currentEndDate = new Date(selectedDateRange.value[1])

      // 先映射时间段数据，然后按时间排序
      const mappedTimeSlots = response.list.map((timeSlot: any) => {
        // 检查该时间段是否在当前选择的日期范围内被占用
        const occupation = currentOccupations.find((occ: any) => {
          if (occ.roomTimeId !== timeSlot.id) {
            return false
          }

          // 解析占用记录的开始和结束时间
          let occupationStartDate: Date
          let occupationEndDate: Date

          try {
            if (typeof occ.startTime === 'number') {
              occupationStartDate = new Date(occ.startTime)
            } else if (typeof occ.startTime === 'string') {
              occupationStartDate = new Date(occ.startTime.split(' ')[0])
            } else {
              return false
            }

            if (typeof occ.endTime === 'number') {
              occupationEndDate = new Date(occ.endTime)
            } else if (typeof occ.endTime === 'string') {
              occupationEndDate = new Date(occ.endTime.split(' ')[0])
            } else {
              return false
            }
          } catch (error) {
            return false
          }

          // 检查占用时间范围是否与当前选择的日期范围有重叠
          const occupationStartDateOnly = new Date(occupationStartDate.getFullYear(), occupationStartDate.getMonth(), occupationStartDate.getDate())
          const occupationEndDateOnly = new Date(occupationEndDate.getFullYear(), occupationEndDate.getMonth(), occupationEndDate.getDate())
          const currentStartDateOnly = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), currentStartDate.getDate())
          const currentEndDateOnly = new Date(currentEndDate.getFullYear(), currentEndDate.getMonth(), currentEndDate.getDate())

          const hasOverlap = occupationStartDateOnly <= currentEndDateOnly && occupationEndDateOnly >= currentStartDateOnly

          return hasOverlap
        })

        const isOccupied = !!occupation

        return {
          ...timeSlot,
          occupied: isOccupied,
          occupationInfo: occupation ? {
            id: occupation.id,
            occupationType: occupation.occupationType,
            occupationTypeName: occupation.occupationTypeName,
            occupationTypeColor: occupation.occupationTypeColor,
            occupationReason: occupation.occupationReason,
            creator: occupation.creator,
            createTime: occupation.createTime
          } : null
        }
      })

      // 按照开始时间排序时间段
      availableTimeSlots.value = mappedTimeSlots.sort((a, b) => {
        return compareTimeSlots(a, b)
      })

      selectedTimeSlots.value = []
    } else {
      availableTimeSlots.value = []
    }
  } catch (error) {
    ElMessage.error('获取时间段失败，请检查会议室是否配置了时间段')
    availableTimeSlots.value = []
  } finally {
    loading.fetchingTimeSlots = false
  }
}

// 获取当前日期范围的占用记录
const fetchCurrentDateOccupations = async () => {
  if (!props.roomInfo?.id || !selectedDateRange.value || selectedDateRange.value.length !== 2) {
    currentDateOccupations.value = []
    return
  }

  loading.fetchingOccupations = true
  try {
    // 确保时间段列表已加载
    if (availableTimeSlots.value.length === 0) {
      await fetchTimeSlots()
    }

    const response = await getOccupationsByMeetingRoom(props.roomInfo.id)
    let occupations: any[] = []

    if (response) {
      if (Array.isArray(response)) {
        occupations = response
      } else if (response.data && Array.isArray(response.data)) {
        occupations = response.data
      } else if (response.list && Array.isArray(response.list)) {
        occupations = response.list
      } else if (response.code === 0 && response.data && Array.isArray(response.data)) {
        occupations = response.data
      }
    }

    if (occupations.length > 0) {
      // 获取日期范围用于过滤
      const startDate = new Date(selectedDateRange.value[0])
      const endDate = new Date(selectedDateRange.value[1])

      const filteredOccupations = occupations.filter((occupation: any, index: number) => {
        if (occupation.status !== undefined && occupation.status !== 1) {
          return false
        }

        if (!occupation.roomTimeId) {
          return false
        }

        // 3. 放宽日期范围检查 - 如果没有时间信息也保留
        if (occupation.startTime) {
          let occupationDate: Date

          // 后端已统一返回字符串格式 "YYYY-MM-DD HH:mm:ss"
          if (typeof occupation.startTime === 'string') {
            // 如果是字符串格式，提取日期部分
            if (occupation.startTime.includes(' ')) {
              occupationDate = new Date(occupation.startTime.split(' ')[0])
            } else {
              occupationDate = new Date(occupation.startTime)
            }
          } else if (typeof occupation.startTime === 'number') {
            // 兼容旧的时间戳格式（如果还有的话）
            occupationDate = new Date(occupation.startTime)
          } else {
            return true
          }

          if (occupationDate && !isNaN(occupationDate.getTime())) {
            // 检查占用记录的时间范围是否与当前选择的日期范围有重叠
            let occupationStartDate = occupationDate
            let occupationEndDate = occupationDate

            // 如果有结束时间，使用结束时间
            if (occupation.endTime) {
              if (typeof occupation.endTime === 'string') {
                if (occupation.endTime.includes(' ')) {
                  occupationEndDate = new Date(occupation.endTime.split(' ')[0])
                } else {
                  occupationEndDate = new Date(occupation.endTime)
                }
              } else if (typeof occupation.endTime === 'number') {
                occupationEndDate = new Date(occupation.endTime)
              }
            }

            const occupationStartDateOnly = new Date(occupationStartDate.getFullYear(), occupationStartDate.getMonth(), occupationStartDate.getDate())
            const occupationEndDateOnly = new Date(occupationEndDate.getFullYear(), occupationEndDate.getMonth(), occupationEndDate.getDate())
            const currentStartDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
            const currentEndDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

            // 检查时间范围是否有重叠
            const hasOverlap = occupationStartDateOnly <= currentEndDateOnly && occupationEndDateOnly >= currentStartDateOnly

            if (!hasOverlap) {
              return false
            }


          }
        }

        return true
      })

      // 为每个占用记录添加对应的时间段信息和格式化时间
      const occupationsWithTimeSlots = filteredOccupations.map((occupation: any) => {
        const timeSlot = availableTimeSlots.value.find(slot => slot.id === occupation.roomTimeId)

        // 格式化时间显示
        let timeRangeDisplay = ''
        let occupationDateDisplay = ''

        // 优先使用后端提供的格式化字段
        if (occupation.batchTimeRange) {
          timeRangeDisplay = formatBatchTimeRange(occupation.batchTimeRange)
          occupationDateDisplay = occupation.occupationDate || ''
        } else if (occupation.timeRange) {
          timeRangeDisplay = formatTimeRangeToBatch(occupation.timeRange)
          occupationDateDisplay = occupation.occupationDate || ''
        } else if (occupation.startTime && occupation.endTime) {
          // 如果没有格式化字段，手动格式化
          let startTime: Date, endTime: Date

          // 后端已统一返回字符串格式
          if (typeof occupation.startTime === 'string' && typeof occupation.endTime === 'string') {
            startTime = new Date(occupation.startTime)
            endTime = new Date(occupation.endTime)
          } else if (typeof occupation.startTime === 'number' && typeof occupation.endTime === 'number') {
            // 兼容旧格式
            startTime = new Date(occupation.startTime)
            endTime = new Date(occupation.endTime)
          } else {
            return occupation
          }

          if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
            const startDateStr = startTime.toLocaleDateString('zh-CN')
            const endDateStr = endTime.toLocaleDateString('zh-CN')
            const startTimeStr = startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            const endTimeStr = endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

            if (startDateStr === endDateStr) {
              // 同一天
              timeRangeDisplay = `${startDateStr} ${startTimeStr}-${endTimeStr}`
              occupationDateDisplay = startDateStr
            } else {
              // 跨天
              timeRangeDisplay = `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`
              occupationDateDisplay = `${startDateStr} 至 ${endDateStr}`
            }
          }
        } else if (timeSlot) {
          // 如果没有具体时间，使用时间段信息
          timeRangeDisplay = `${timeSlot.startTime}-${timeSlot.endTime}`
          occupationDateDisplay = '当前时间段'
        } else {
          // 如果既没有时间信息也没有时间段信息，仍然显示基本信息
          timeRangeDisplay = `时间段ID: ${occupation.roomTimeId}`
          occupationDateDisplay = '时间段信息缺失'
        }

        return {
          ...occupation,
          timeSlot: timeSlot || {
            id: occupation.roomTimeId,
            startTime: '未知',
            endTime: '未知'
          },
          // 添加格式化的时间显示字段
          timeRangeDisplay,
          occupationDateDisplay
        }
      })

      currentDateOccupations.value = occupationsWithTimeSlots

      // 更新时间段的占用状态
      updateTimeSlotOccupationStatus(occupationsWithTimeSlots)

      // 自动移除已选择但现在已被占用的时间段
      const currentlyOccupiedSlots = availableTimeSlots.value
        .filter(slot => slot.occupied)
        .map(slot => slot.id)

      const originalSelectedCount = selectedTimeSlots.value.length
      selectedTimeSlots.value = selectedTimeSlots.value.filter(slotId =>
        !currentlyOccupiedSlots.includes(slotId)
      )

      if (originalSelectedCount > selectedTimeSlots.value.length) {
        const removedCount = originalSelectedCount - selectedTimeSlots.value.length
        ElMessage.warning(`已自动移除 ${removedCount} 个已被占用的时间段选择`)
      }
    } else {
      currentDateOccupations.value = []
      // 清空占用状态
      updateTimeSlotOccupationStatus([])
    }
  } catch (error) {
    ElMessage.error('获取占用记录失败: ' + (error.message || '未知错误'))
    currentDateOccupations.value = []
  } finally {
    loading.fetchingOccupations = false
  }
}

// 时间段排序比较函数
const compareTimeSlots = (a: any, b: any) => {
  // 解析时间字符串为小时和分钟
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hours: 0, minutes: 0 }

    // 处理各种时间格式：HH:mm, H:mm, HH:mm:ss 等
    const timeParts = timeStr.split(':')
    const hours = parseInt(timeParts[0]) || 0
    const minutes = parseInt(timeParts[1]) || 0

    return { hours, minutes }
  }

  const timeA = parseTime(a.startTime)
  const timeB = parseTime(b.startTime)

  // 先比较小时，再比较分钟
  if (timeA.hours !== timeB.hours) {
    return timeA.hours - timeB.hours
  }
  return timeA.minutes - timeB.minutes
}

const updateTimeSlotOccupationStatus = (occupations: any[]) => {
  if (!selectedDateRange.value || selectedDateRange.value.length !== 2) {
    return
  }

  const currentStartDate = new Date(selectedDateRange.value[0])
  const currentEndDate = new Date(selectedDateRange.value[1])

  // 重置所有时间段的占用状态并排序
  const updatedTimeSlots = availableTimeSlots.value.map(timeSlot => {
    // 查找该时间段在当前日期范围内是否有占用记录
    const occupation = occupations.find(occ => {
      if (occ.roomTimeId !== timeSlot.id) {
        return false
      }

      // 这里的occupations已经是经过处理的当前日期范围内的占用记录
      // 所以直接返回true即可
      return true
    })

    const isOccupied = !!occupation

    return {
      ...timeSlot,
      occupied: isOccupied,
      occupationInfo: occupation ? {
        id: occupation.id,
        occupationType: occupation.occupationType,
        occupationTypeName: occupation.occupationTypeName,
        occupationTypeColor: occupation.occupationTypeColor,
        occupationReason: occupation.occupationReason,
        creator: occupation.creator,
        createTime: occupation.createTime
      } : null
    }
  })

  availableTimeSlots.value = updatedTimeSlots.sort((a, b) => {
    return compareTimeSlots(a, b)
  })
}

// 处理时间段点击
const handleTimeSlotClick = async (timeSlot: any) => {
  if (timeSlot.occupied) {
    // 已占用的时间段，不允许点击
    const timeRange = `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`
    const occupationType = timeSlot.occupationInfo?.occupationTypeName || '未知类型'
    const occupationReason = timeSlot.occupationInfo?.occupationReason || '无原因说明'
    ElMessage.warning(`时间段 ${timeRange} 已被占用\n占用类型：${occupationType}\n占用原因：${occupationReason}`)
    return
  } else {
    // 未占用的时间段，切换选择状态
    toggleTimeSlot(timeSlot)
  }
}

// 切换时间段选择
const toggleTimeSlot = (timeSlot: any) => {
  // 检查时间段是否可用
  if (timeSlot.occupied) {
    const timeRange = `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`
    const occupationType = timeSlot.occupationInfo?.occupationTypeName || '未知类型'
    ElMessage.warning(`时间段 ${timeRange} 已被占用（${occupationType}），无法选择`)
    return
  }

  if (!timeSlot.enable || timeSlot.unable) {
    const timeRange = `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`
    ElMessage.warning(`时间段 ${timeRange} 当前不可用`)
    return
  }

  const index = selectedTimeSlots.value.indexOf(timeSlot.id)
  if (index > -1) {
    selectedTimeSlots.value.splice(index, 1)
  } else {
    selectedTimeSlots.value.push(timeSlot.id)
  }
}

// 从占用列表中取消占用
const handleCancelOccupationFromList = async (occupation: any) => {
  if (!occupation.id) {
    ElMessage.error('无法获取占用记录ID')
    return
  }

  try {
    const timeSlotInfo = occupation.timeSlot
      ? `${formatTime(occupation.timeSlot.startTime)} - ${formatTime(occupation.timeSlot.endTime)}`
      : '未知时间段'

    await ElMessageBox.confirm(
      `确定要取消时间段 ${timeSlotInfo} 的占用吗？\n占用原因：${occupation.occupationReason}`,
      '取消占用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.cancelling = true
    await cancelOccupation(occupation.id)
    ElMessage.success('取消占用成功')

    // 刷新时间段列表和占用记录
    await fetchTimeSlots()
    await fetchCurrentDateOccupations()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('取消占用失败')
    }
  } finally {
    loading.cancelling = false
  }
}

// 全选/取消全选时间段
const toggleSelectAllTimeSlots = () => {
  if (isAllSelected.value) {
    // 当前是全选状态，执行取消全选
    selectedTimeSlots.value = []
  } else {
    // 当前不是全选状态，执行全选
    const availableIds = availableUnoccupiedTimeSlots.value.map(slot => slot.id)
    selectedTimeSlots.value = [...availableIds]
  }
}



// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (selectedTimeSlots.value.length === 0) {
    ElMessage.warning('请选择要占用的时间段')
    return
  }

  // 检查是否选择了已占用的时间段
  const occupiedSlots = selectedTimeSlots.value.filter(slotId => {
    const slot = availableTimeSlots.value.find(s => s.id === slotId)
    return slot?.occupied
  })

  if (occupiedSlots.length > 0) {
    // 获取被占用时间段的详细信息
    const occupiedSlotNames = occupiedSlots.map(slotId => {
      const slot = availableTimeSlots.value.find(s => s.id === slotId)
      return slot ? `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}` : '未知时间段'
    }).join('、')

    ElMessage.error(`以下时间段已被占用，无法选择：${occupiedSlotNames}`)

    // 自动移除已占用的时间段
    selectedTimeSlots.value = selectedTimeSlots.value.filter(slotId => {
      const slot = availableTimeSlots.value.find(s => s.id === slotId)
      return !slot?.occupied
    })
    return
  }

  // 最后一次检查：确保所有选择的时间段都存在且可用
  const invalidSlots = selectedTimeSlots.value.filter(slotId => {
    const slot = availableTimeSlots.value.find(s => s.id === slotId)
    return !slot || slot.occupied || !slot.enable || slot.unable
  })

  if (invalidSlots.length > 0) {
    ElMessage.error('选择的时间段中包含无效或不可用的时间段，请重新选择')
    // 移除无效的时间段
    selectedTimeSlots.value = selectedTimeSlots.value.filter(slotId => {
      const slot = availableTimeSlots.value.find(s => s.id === slotId)
      return slot && !slot.occupied && slot.enable && !slot.unable
    })
    return
  }

  loading.submitting = true
  try {
    // 生成日期范围内的所有日期
    const startDate = new Date(selectedDateRange.value[0])
    const endDate = new Date(selectedDateRange.value[1])
    const dateList: string[] = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateList.push(d.toISOString().split('T')[0])
    }

    // 为每个选中的时间段创建一条占用记录（覆盖整个日期范围）
    const promises: Promise<any>[] = []
    const startDateStr = dateList[0] // 日期范围的开始日期
    const endDateStr = dateList[dateList.length - 1] // 日期范围的结束日期

    selectedTimeSlots.value.forEach(roomTimeId => {
      const timeSlot = availableTimeSlots.value.find(slot => slot.id === roomTimeId)
      if (!timeSlot) return

      // 构建占用时间范围：开始日期+时间段开始时间 到 结束日期+时间段结束时间
      const startDateTime = `${startDateStr} ${timeSlot.startTime}`
      const endDateTime = `${endDateStr} ${timeSlot.endTime}`

      // 检查该时间段是否已被占用（在当前日期范围内）
      const existingOccupation = currentDateOccupations.value.find(occupation =>
        occupation.roomTimeId === roomTimeId && occupation.status === 1
      )

      if (existingOccupation) {
        // 检查时间是否重叠
        const existingStart = new Date(existingOccupation.startTime).getTime()
        const existingEnd = new Date(existingOccupation.endTime).getTime()
        const newStart = new Date(startDateTime).getTime()
        const newEnd = new Date(endDateTime).getTime()

        if (newEnd > existingStart && newStart < existingEnd) {
          return
        }
      }

      const occupationData = {
        roomTimeId,
        meetingRoomId: props.roomInfo!.id,
        occupationType: formData.occupationType!,
        occupationReason: formData.occupationReason,
        startTime: startDateTime,
        endTime: endDateTime
      }

      // 为每个API调用添加错误处理
      const promise = (async () => {
        try {
          const response = await createOccupation(occupationData)
          return response
        } catch (error) {
          throw error // 重新抛出错误，让Promise.all能够捕获
        }
      })()

      promises.push(promise)
    })

    await Promise.all(promises)

    const occupationPeriod = startDateStr === endDateStr ? startDateStr : `${startDateStr} 至 ${endDateStr}`
    const actualCount = selectedTimeSlots.value.length // 使用实际选择的时间段数量
    ElMessage.success(`占用添加成功，共创建了 ${actualCount} 个时间段的占用记录，占用期间：${occupationPeriod}`)
    emit('success')

    await fetchTimeSlots()
    await fetchCurrentDateOccupations()

    selectedTimeSlots.value = []
    resetFormData()
  } catch (error: any) {

    // 提供具体的错误信息
    let errorMessage = '创建占用失败'

    // 处理不同类型的错误
    if (error?.response?.data?.msg) {
      errorMessage = error.response.data.msg
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message) {
      // 将常见的英文错误信息翻译为中文
      const message = error.message
      if (message.includes('Cannot access') && message.includes('before initialization')) {
        errorMessage = '系统内部错误，请稍后重试'
      } else if (message.includes('Network Error')) {
        errorMessage = '网络连接失败，请检查网络连接'
      } else if (message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (message.includes('401')) {
        errorMessage = '登录已过期，请重新登录'
      } else if (message.includes('403')) {
        errorMessage = '您没有权限执行此操作'
      } else if (message.includes('500')) {
        errorMessage = '服务器内部错误，请联系管理员'
      } else {
        errorMessage = message
      }
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    // 特殊错误处理和用户友好的提示
    if (errorMessage.includes('已被占用') || errorMessage.includes('时间冲突') || errorMessage.includes('occupied')) {
      ElMessage.error('所选时间段已被其他用户占用，请重新选择时间段')
    } else if (errorMessage.includes('权限') || errorMessage.includes('permission') || errorMessage.includes('403')) {
      ElMessage.error('您没有权限执行此操作，请联系管理员')
    } else if (errorMessage.includes('网络') || errorMessage.includes('Network')) {
      ElMessage.error('网络连接失败，请检查网络连接后重试')
    } else if (errorMessage.includes('登录') || errorMessage.includes('401')) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (errorMessage.includes('服务器') || errorMessage.includes('500')) {
      ElMessage.error('服务器繁忙，请稍后重试')
    } else {
      ElMessage.error(errorMessage || '创建占用失败，请稍后重试')
    }
  } finally {
    loading.submitting = false
  }
}

// 重置表单数据
const resetFormData = () => {
  formData.occupationType = undefined
  formData.occupationReason = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false
  // 重置所有数据
  selectedDateRange.value = []
  selectedTimeSlots.value = []
  availableTimeSlots.value = []
  currentDateOccupations.value = []
  resetFormData()
}

// 强制刷新字典数据
const refreshDictData = async () => {
  try {
    await dictStore.resetDict()
  } catch (error) {
    // 静默处理错误
  }
}

// 监听对话框打开
watch(() => props.modelValue, async (visible) => {
  if (visible && props.roomInfo?.id) {
    // 重置所有数据
    resetFormData()
    selectedTimeSlots.value = []
    currentDateOccupations.value = []
    availableTimeSlots.value = []

    // 刷新字典数据
    await refreshDictData()

    // 默认选择今天到明天的范围
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    selectedDateRange.value = [today, tomorrow]

    await fetchTimeSlots()
    await fetchCurrentDateOccupations()
  } else if (!visible) {
    resetFormData()
    selectedTimeSlots.value = []
    currentDateOccupations.value = []
    availableTimeSlots.value = []
    selectedDateRange.value = []
  }
})

// 组件挂载时初始化字典
onMounted(async () => {
  await refreshDictData()
})
</script>

<style scoped>
.occupation-management {
  padding: 20px 0;
}

/* 确保表单标签水平显示 */
.occupation-management .el-form-item__label {
  writing-mode: horizontal-tb !important;
  display: inline-block !important;
  white-space: nowrap !important;
  text-orientation: mixed !important;
}

/* 强制标题文本水平显示且可见 */
.occupation-management .section-title {
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  color: #303133 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  display: inline-block !important;
  white-space: nowrap !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.room-info-form {
  margin-bottom: 20px;
}

.room-info-form .el-form-item {
  margin-bottom: 16px;
}

.room-info-form .el-input {
  background-color: #f5f7fa;
}

.room-info-form .el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #303133;
}

.date-selector {
  margin-bottom: 20px;
}

.form-label {
  display: inline-block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.date-picker {
  width: 300px;
}

.time-slots-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.date-range-info {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.time-slot-button {
  padding: 12px;
  border: 2px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  background-color: #fff;
}

.time-slot-button:hover:not(.occupied) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.time-slot-button.selected {
  border-color: #409eff;
  background-color: #409eff;
  color: white;
}

.time-slot-button.occupied {
  border-color: #f56c6c;
  background-color: #fef0f0;
  cursor: not-allowed;
  opacity: 0.7;
  position: relative;
}

.time-slot-button.occupied::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(245, 108, 108, 0.1) 2px,
    rgba(245, 108, 108, 0.1) 4px
  );
  pointer-events: none;
}

.time-slot-button.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.time-slot-button.disabled:hover {
  border-color: #f56c6c;
  background-color: #fef0f0;
  transform: none;
  box-shadow: none;
}

.time-slot-button.occupied:hover {
  border-color: #f56c6c;
  background-color: #fef0f0;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.time-range {
  font-weight: 500;
  margin-bottom: 4px;
}

.occupation-status {
  margin-top: 4px;
}

.occupied-hint {
  font-size: 10px;
  color: #f56c6c;
  margin-top: 2px;
  line-height: 1;
  font-weight: 500;
}

.occupation-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  text-align: right;
}

/* 已占用时间段标题样式 */
.occupied-section-header {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  writing-mode: horizontal-tb !important;
}

.section-title {
  font-weight: 500 !important;
  color: #303133 !important;
  writing-mode: horizontal-tb !important;
  display: inline-block !important;
  white-space: nowrap !important;
}

/* 已占用时间段显示区域样式 */
.occupied-time-slots {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.occupied-slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.occupied-slot-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.occupied-slot-item:last-child {
  margin-bottom: 0;
}

.slot-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-right: 16px;
  min-width: 0;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
  flex-shrink: 0;
}

.time-info .el-tag {
  flex-shrink: 0;
}

.time-range {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  white-space: nowrap;
}

.reason-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 300px;
}

.reason-label {
  font-weight: 500;
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
}

.reason-text {
  color: #303133;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  min-width: 180px;
  flex-shrink: 0;
}

.creator-label {
  font-weight: 500;
}

.creator-text {
  color: #606266;
}

.create-time {
  color: #909399;
  font-size: 11px;
}

.slot-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.no-occupations {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.no-date-selected {
  padding: 16px;
}
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="设置时间段占用"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 时间段信息 -->
      <el-form-item label="时间段">
        <el-input
          :value="timeSlotDisplay"
          readonly
          placeholder="请选择时间段"
        />
      </el-form-item>

      <!-- 占用类型 -->
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
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span>{{ option.label }}</span>
              <el-tag
                :type="getTagTypeByColor(option.color)"
                size="small"
              >
                {{ option.label }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 占用原因 -->
      <el-form-item label="占用原因" prop="occupationReason">
        <el-input
          v-model="formData.occupationReason"
          type="textarea"
          :rows="4"
          placeholder="请输入占用原因（1-200字符）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  createOccupation,
  getOccupationTypeOptions,
  getTagTypeByColor,
  validateCreateOccupationRequest,
  handleApiError,
  type CreateOccupationRequest,
  type RoomTimeSlot
} from '@/api/meetingroom/roomTimeOccupation'

/** 占用设置对话框 */
defineOptions({ name: 'OccupationDialog' })

// 组件属性
interface Props {
  modelValue: boolean
  timeSlot?: RoomTimeSlot | null
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  timeSlot: null
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)

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

// 时间段显示文本
const timeSlotDisplay = computed(() => {
  if (!props.timeSlot) return ''
  return `${props.timeSlot.startTime} - ${props.timeSlot.endTime}`
})

// 占用类型选项
const occupationTypeOptions = getOccupationTypeOptions()

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

// 监听对话框打开，重置表单
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

/**
 * 重置表单
 */
const resetForm = () => {
  formData.occupationType = undefined
  formData.occupationReason = ''
  formRef.value?.clearValidate()
}

/**
 * 处理取消
 */
const handleCancel = () => {
  dialogVisible.value = false
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  if (!props.timeSlot) {
    ElMessage.error('请选择时间段')
    return
  }

  // 表单验证
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // 构建请求数据
  // 获取当前日期作为占用日期
  const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD 格式

  // 确保时间格式正确（HH:mm:ss）
  const formatTime = (time: string) => {
    if (time.includes(':')) {
      const parts = time.split(':')
      if (parts.length === 2) {
        return `${parts[0]}:${parts[1]}:00` // 添加秒数
      }
    }
    return time
  }

  const startDateTime = `${currentDate} ${formatTime(props.timeSlot.startTime)}`
  const endDateTime = `${currentDate} ${formatTime(props.timeSlot.endTime)}`

  const requestData: CreateOccupationRequest = {
    roomTimeId: props.timeSlot.id,
    meetingRoomId: props.timeSlot.meetingRoomId,
    occupationType: formData.occupationType!,
    occupationReason: formData.occupationReason.trim(),
    startTime: startDateTime,
    endTime: endDateTime
  }

  // 业务逻辑验证
  const validationError = validateCreateOccupationRequest(requestData)
  if (validationError) {
    ElMessage.error(validationError)
    return
  }

  loading.value = true
  try {
    const response = await createOccupation(requestData)
    ElMessage.success('设置占用成功')
    dialogVisible.value = false
    emit('success', {
      occupationType: requestData.occupationType,
      occupationReason: requestData.occupationReason
    })
  } catch (error: any) {
    const errorMessage = handleApiError(error)
    ElMessage.error(`设置占用失败: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 20px;
}
</style>

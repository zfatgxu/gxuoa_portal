<template>
  <el-dialog
    v-model="dialogVisible"
    title="定时发送"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="发送时间">
        <el-date-picker
          v-model="form.scheduledTime"
          type="datetime"
          placeholder="选择发送时间"
          :disabled-date="disabledDate"
          :disabled-hours="disabledHours"
          :disabled-minutes="disabledMinutes"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item>
        <div class="quick-select">
          <span class="label">快捷选择：</span>
          <el-button size="small" @click="selectTime(1)">1小时后</el-button>
          <el-button size="small" @click="selectTime(3)">3小时后</el-button>
          <el-button size="small" @click="selectTime(24)">明天此时</el-button>
        </div>
      </el-form-item>
      <el-alert
        v-if="form.scheduledTime"
        :title="`将于 ${formatScheduledTime(form.scheduledTime)} 发送`"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
      />
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!form.scheduledTime">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { formatMailTime } from '../utils/mailHelpers'

interface Props {
  modelValue: boolean
  initialTime?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', time: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialTime: ''
})

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  scheduledTime: ''
})

// 监听初始时间变化
watch(() => props.initialTime, (newVal) => {
  if (newVal) {
    form.value.scheduledTime = newVal
  }
}, { immediate: true })

// 监听对话框打开
watch(() => props.modelValue, (newVal) => {
  if (newVal && !form.value.scheduledTime) {
    // 默认设置为1小时后
    selectTime(1)
  }
})

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 60000 // 禁用1分钟前的时间
}

// 禁用过去的小时
const disabledHours = () => {
  const now = new Date()
  const selectedDate = form.value.scheduledTime ? new Date(form.value.scheduledTime) : null
  
  if (!selectedDate) return []
  
  // 如果是今天，禁用当前小时之前的时间
  if (
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate()
  ) {
    const hours = []
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
    return hours
  }
  
  return []
}

// 禁用过去的分钟
const disabledMinutes = (hour: number) => {
  const now = new Date()
  const selectedDate = form.value.scheduledTime ? new Date(form.value.scheduledTime) : null
  
  if (!selectedDate) return []
  
  // 如果是今天且是当前小时，禁用当前分钟之前的时间
  if (
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate() &&
    hour === now.getHours()
  ) {
    const minutes = []
    for (let i = 0; i <= now.getMinutes(); i++) {
      minutes.push(i)
    }
    return minutes
  }
  
  return []
}

// 快捷选择时间
const selectTime = (hours: number) => {
  const now = new Date()
  const scheduledDate = new Date(now.getTime() + hours * 60 * 60 * 1000)
  
  const year = scheduledDate.getFullYear()
  const month = String(scheduledDate.getMonth() + 1).padStart(2, '0')
  const day = String(scheduledDate.getDate()).padStart(2, '0')
  const hour = String(scheduledDate.getHours()).padStart(2, '0')
  const minute = String(scheduledDate.getMinutes()).padStart(2, '0')
  
  form.value.scheduledTime = `${year}-${month}-${day} ${hour}:${minute}:00`
}

// 格式化显示时间
const formatScheduledTime = (timeStr: string) => {
  if (!timeStr) return ''
  
  try {
    // 复用模块的时间格式化函数
    return formatMailTime(timeStr)
  } catch (e) {
    return timeStr
  }
}

// 确认
const handleConfirm = () => {
  if (!form.value.scheduledTime) {
    ElMessage.warning('请选择发送时间')
    return
  }
  
  const scheduledDate = new Date(form.value.scheduledTime)
  const now = new Date()
  
  if (scheduledDate.getTime() <= now.getTime()) {
    ElMessage.warning('定时发送时间必须晚于当前时间')
    return
  }
  
  emit('confirm', form.value.scheduledTime)
  handleClose()
}

// 关闭
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.quick-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-select .label {
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>



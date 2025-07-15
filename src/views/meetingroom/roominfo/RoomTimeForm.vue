<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="会议室" prop="meetingRoomId">
        <el-input v-model="roomName" placeholder="会议室名称" readonly />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-time-picker
          v-model="formData.startTime"
          placeholder="请选择开始时间"
          format="HH:mm"
          value-format="HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-time-picker
          v-model="formData.endTime"
          placeholder="请选择结束时间"
          format="HH:mm"
          value-format="HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addTimeSlot">添加时间段</el-button>
      </el-form-item>
      
      <!-- 已添加的时间段列表 -->
      <div v-if="timeSlots.length > 0" class="time-slots-list">
        <h3>已添加的时间段：</h3>
        <el-table :data="timeSlots" style="width: 100%">
          <el-table-column prop="startTime" label="开始时间" width="180">
            <template #default="scope">
              {{ formatTime(scope.row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="180">
            <template #default="scope">
              {{ formatTime(scope.row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="removeTimeSlot(scope.$index)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 当前会议室已有的时间段 -->
      <div v-if="existingTimeSlots.length > 0" class="existing-time-slots">
        <h3>当前会议室已有的时间段：</h3>
        <el-table :data="existingTimeSlots" style="width: 100%">
          <el-table-column prop="startTime" label="开始时间" width="120">
            <template #default="scope">
              {{ formatTime(scope.row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="120">
            <template #default="scope">
              {{ formatTime(scope.row.endTime) }}
            </template>
          </el-table-column>





          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="removeExistingTimeSlot(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">提 交</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>




</template>

<script setup lang="ts">
import { RoomInfoApi } from '@/api/meetingroom/roominfo'
import { RoomTimeApi, RoomTimeVO } from '@/api/meetingroom/roomtime'

import { ElMessageBox } from 'element-plus'





/** 会议室时间段 表单 */
defineOptions({ name: 'RoomTimeForm' })

const formRef = ref() // 表单 Ref
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const roomName = ref('')// 会议室名称

// 定义表单数据类型
interface FormRoomTimeVO {
  id?: number
  meetingRoomId?: number
  startTime: string
  endTime: string
  enable: boolean
  unable: boolean
}

const formData = ref<FormRoomTimeVO>({
  id: undefined,
  meetingRoomId: undefined,
  startTime: '',
  endTime: '',
  enable: true,
  unable: false
})

// 存储已添加的时间段列表
const timeSlots = ref<FormRoomTimeVO[]>([])

// 存储当前会议室已有的时间段
const existingTimeSlots = ref<RoomTimeVO[]>([])



// 表单校验
const formRules = reactive({
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'blur' }],
})

/**
 * 格式化时间显示
 * @param time 时间字符串
 */
const formatTime = (time: string) => {
  if (!time) return ''
  // 如果是完整的时间格式，只返回时分部分
  if (time.includes(':')) {
    const parts = time.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`
    }
  }
  return time
}







/**
 * 刷新已有时间段列表
 */
const refreshExistingTimeSlots = async () => {
  if (!formData.value.meetingRoomId) return

  try {
    console.log('刷新时间段列表，会议室ID:', formData.value.meetingRoomId)
    const res = await RoomTimeApi.getRoomTimePage({meetingRoomId: formData.value.meetingRoomId})
    console.log('API返回数据:', res)

    if (res.list && res.list.length > 0) {
      existingTimeSlots.value = res.list.map(item => ({
        ...item,
        meetingRoomId: formData.value.meetingRoomId
      }))
      console.log('获取时间段列表成功:', existingTimeSlots.value)
    } else {
      existingTimeSlots.value = []
      console.log('会议室没有配置时间段')
    }
  } catch (error) {
    console.error('获取会议室时间段失败:', error)
    message.error('获取会议室时间段失败')
    existingTimeSlots.value = []
  }
}

/** 打开弹窗 */
const open = async (type: string, roomId: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  const res1 = await RoomInfoApi.getRoomInfo(roomId)
  formData.value.meetingRoomId = roomId
  roomName.value = res1.name
  formData.value.startTime = ''
  formData.value.endTime = ''
  timeSlots.value = []

  // 获取时间段列表
  await refreshExistingTimeSlots()
}

/** 添加时间段 */
const addTimeSlot = () => {
  if (!formData.value.startTime || !formData.value.endTime) {
    message.warning('请选择完整的开始和结束时间')
    return
  }
  if (formData.value.startTime >= formData.value.endTime) {
    message.warning('结束时间必须晚于开始时间')
    return
  }
  const isOverlap = timeSlots.value.some(slot => {
    return (
      (formData.value.startTime >= slot.startTime && formData.value.startTime < slot.endTime) ||
      (formData.value.endTime > slot.startTime && formData.value.endTime <= slot.endTime) ||
      (formData.value.startTime <= slot.startTime && formData.value.endTime >= slot.endTime)
    )
  })
  if (isOverlap) {
    message.warning('添加的时间段与已有时间段重叠')
    return
  }
  timeSlots.value.push({
    id: undefined,
    meetingRoomId: formData.value.meetingRoomId,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime,
    enable: true,
    unable: false
  })
  formData.value.startTime = ''
  formData.value.endTime = ''
  message.success('时间段添加成功')
}

/** 删除时间段 */
const removeTimeSlot = (index: number) => {
  timeSlots.value.splice(index, 1)
  message.success('时间段删除成功')
}

/** 删除已有的时间段 */
const removeExistingTimeSlot = (roomTimeId: number) => {
  RoomTimeApi.deleteRoomTime(roomTimeId)
  existingTimeSlots.value = existingTimeSlots.value.filter(item => item.id !== roomTimeId)
  message.success('已有的时间段删除成功')
} 

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (timeSlots.value.length === 0) {
    message.warning('请添加至少一个时间段')
    return
  }
  
  // 检查新添加的时间段是否与已有的时间段重叠
  const hasOverlap = timeSlots.value.some(newSlot => {
    return existingTimeSlots.value.some(existingSlot => {
      return (
        (newSlot.startTime >= existingSlot.startTime && newSlot.startTime < existingSlot.endTime) ||
        (newSlot.endTime > existingSlot.startTime && newSlot.endTime <= existingSlot.endTime) ||
        (newSlot.startTime <= existingSlot.startTime && newSlot.endTime >= existingSlot.endTime)
      )
    })
  })
  
  if (hasOverlap) {
    message.warning('提交的时间段与已有时间段重叠，请调整后再提交')
    return
  }
  
  formLoading.value = true
  try {
    console.log('提交表单', timeSlots.value)
    if (formType.value === 'create') {
      const promises = timeSlots.value.map(slot => RoomTimeApi.createRoomTime(slot as RoomTimeVO))
      await Promise.all(promises)
      message.success(t('common.createSuccess'))
    } else {
      // 如果是编辑模式，可能需要先删除原有时间段，再创建新的
      // 这里简化处理，直接创建新的时间段
      const promises = timeSlots.value.map(slot => RoomTimeApi.updateRoomTime(slot as RoomTimeVO))
      await Promise.all(promises)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('保存会议室时间段失败', error)
    message.error('保存会议室时间段失败')
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped>
.time-slots-list,
.existing-time-slots {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.time-slots-list h3,
.existing-time-slots h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.existing-time-slots {
  margin-top: 20px;
  background-color: #f0f9eb;
}

/* 占用管理相关样式 */
.occupation-info {
  text-align: left;
  font-size: 12px;
}

.info-item {
  margin-bottom: 4px;
}

.info-item .label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.info-item .value {
  color: var(--el-text-color-primary);
}

.no-occupation {
  color: var(--el-text-color-placeholder);
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}


</style>
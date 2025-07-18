<template>
  <div class="room-time-occupation-table">
    <!-- 表格头部操作区 -->
    <div class="table-header">
      <div class="header-left">
        <h3>时间段占用管理</h3>
        <div class="header-tags">
          <el-tag type="info" size="small">
            会议室ID: {{ meetingRoomId }}
          </el-tag>
          <el-tag v-if="timeSlotList.length > 0" type="success" size="small">
            总时间段: {{ timeSlotList.length }}
          </el-tag>
          <el-tag v-if="occupiedSlotsCount > 0" type="warning" size="small">
            已占用: {{ occupiedSlotsCount }}
          </el-tag>
          <el-tag v-if="availableSlotsCount > 0" type="primary" size="small">
            可用: {{ availableSlotsCount }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :icon="RefreshRight"
          @click="refreshData"
          :loading="loading.fetching"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 时间段表格 -->
    <el-table
      :data="timeSlotList"
      v-loading="loading.fetching"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column prop="startTime" label="开始时间" width="120" align="center">
        <template #default="{ row }">
          {{ formatTime(row.startTime) }}
        </template>
      </el-table-column>

      <el-table-column prop="endTime" label="结束时间" width="120" align="center">
        <template #default="{ row }">
          {{ formatTime(row.endTime) }}
        </template>
      </el-table-column>

      <el-table-column label="占用状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="!row.occupied" type="success" size="small">
            可用
          </el-tag>
          <el-tag
            v-else
            :type="getTagTypeByColor(row.occupationInfo?.occupationTypeColor)"
            size="small"
          >
            {{ getCorrectOccupationTypeName(row.occupationInfo) || '已占用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="占用信息" min-width="200">
        <template #default="{ row }">
          <div v-if="row.occupied && row.occupationInfo" class="occupation-info">
            <div class="info-item">
              <span class="label">原因：</span>
              <span class="value">{{ row.occupationInfo.occupationReason }}</span>
            </div>
            <div class="info-item">
              <span class="label">操作人：</span>
              <span class="value">{{ row.occupationInfo.creator }}</span>
            </div>
            <div class="info-item">
              <span class="label">时间：</span>
              <span class="value">{{ formatDateTime(row.occupationInfo.createTime) }}</span>
            </div>
          </div>
          <span v-else class="no-occupation">-</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <div class="operation-buttons">
            <!-- 设为占用按钮 -->
            <el-button
              v-if="!row.occupied"
              type="warning"
              size="small"
              @click="showOccupationDialog(row)"
            >
              设为占用
            </el-button>

            <!-- 取消占用按钮 -->
            <el-button
              v-if="row.occupied"
              type="info"
              size="small"
              @click="handleCancelOccupation(row)"
              :loading="loading.cancelling"
            >
              取消占用
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 占用设置对话框 -->
    <OccupationDialog
      v-model="occupationDialogVisible"
      :time-slot="selectedTimeSlot"
      @success="handleOccupationSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import {
  cancelOccupation,
  getOccupationByRoomTime,
  getOccupationsByMeetingRoom,
  getTagTypeByColor,
  handleApiError,
  type RoomTimeSlot,
  type OccupationRecord
} from '@/api/meetingroom/roomTimeOccupation'
import { RoomTimeApi } from '@/api/meetingroom/roomtime'
import OccupationDialog from './OccupationDialog.vue'
import { formatDate } from '@/utils/formatTime'
import { getDictOptions, DICT_TYPE } from '@/utils/dict'

/** 时间段占用管理表格 */
defineOptions({ name: 'RoomTimeOccupationTable' })

// 组件属性
interface Props {
  meetingRoomId: number
}

const props = defineProps<Props>()

// 响应式数据
const loading = reactive({
  fetching: false,
  cancelling: false
})

const timeSlotList = ref<RoomTimeSlot[]>([])
const total = ref(0)
const occupationDialogVisible = ref(false)
const selectedTimeSlot = ref<RoomTimeSlot | null>(null)

// 自动刷新定时器
let refreshTimer: NodeJS.Timeout | null = null

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  meetingRoomId: props.meetingRoomId
})

// 计算属性：统计占用情况
const occupiedSlotsCount = computed(() => {
  return timeSlotList.value.filter(slot => slot.occupied).length
})

const availableSlotsCount = computed(() => {
  return timeSlotList.value.filter(slot => !slot.occupied).length
})

onMounted(() => {
  refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

/**
 * 启动自动刷新
 */
const startAutoRefresh = () => {
  stopAutoRefresh()
  refreshTimer = setInterval(() => {
    refreshData()
  }, 30000)
}

/**
 * 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 格式化时间显示
 */
const formatTime = (time: string) => {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return time
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm')
}

/**
 * 获取正确的占用类型名称（过滤"部门管理"标签）
 */
const getCorrectOccupationTypeName = (occupationInfo: any) => {
  if (!occupationInfo) return '已占用'

  // 获取字典选项
  const dictOptions = getDictOptions(DICT_TYPE.MEETINGROOM_OCCUPATION_TYPE)
  const dictOption = dictOptions.find(option => option.value == occupationInfo.occupationType)

  if (dictOption && !dictOption.label.includes('部门管理')) {
    return dictOption.label
  }

  // 如果后端返回的名称包含"部门管理"，进行映射
  let typeName = occupationInfo.occupationTypeName || '已占用'
  if (typeName.includes('部门管理')) {
    const typeMapping = {
      1: '维护',
      2: '其他'
    }
    typeName = typeMapping[occupationInfo.occupationType] || '其他'
  }

  return typeName
}

/**
 * 刷新数据
 */
const refreshData = async () => {
  loading.fetching = true
  try {
    const response = await RoomTimeApi.getRoomTimePage(queryParams)

    if (!response.list || response.list.length === 0) {
      timeSlotList.value = []
      total.value = 0
      return
    }

    let occupationRecords: OccupationRecord[] = []
    try {
      const occupationResponse = await getOccupationsByMeetingRoom(props.meetingRoomId)

      if (occupationResponse) {
        if (Array.isArray(occupationResponse)) {
          occupationRecords = occupationResponse
        } else if (occupationResponse.data && Array.isArray(occupationResponse.data)) {
          occupationRecords = occupationResponse.data
        } else if (occupationResponse.list && Array.isArray(occupationResponse.list)) {
          occupationRecords = occupationResponse.list
        } else if (occupationResponse.code === 0 && occupationResponse.data && Array.isArray(occupationResponse.data)) {
          occupationRecords = occupationResponse.data
        } else {
          occupationRecords = []
        }
      }
    } catch (occupationError) {
      // 继续显示基础时间段
    }

    // 第三步：合并数据，为每个时间段添加占用状态
    timeSlotList.value = response.list.map(timeSlot => {
      // 查找对应的占用记录
      const occupationRecord = occupationRecords.find(record =>
        record.roomTimeId === timeSlot.id && record.status === 1
      )

      if (occupationRecord) {
        return {
          ...timeSlot,
          occupied: true,
          occupationInfo: {
            id: occupationRecord.id,
            occupationType: occupationRecord.occupationType,
            occupationTypeName: occupationRecord.occupationTypeName,
            occupationTypeColor: occupationRecord.occupationTypeColor,
            occupationReason: occupationRecord.occupationReason,
            creator: occupationRecord.creator,
            createTime: occupationRecord.createTime
          }
        }
      } else {
        return {
          ...timeSlot,
          occupied: false,
          occupationInfo: null
        }
      }
    })

    total.value = response.total

  } catch (error) {
    ElMessage.error('获取时间段列表失败')
    timeSlotList.value = []
    total.value = 0
  } finally {
    loading.fetching = false
  }
}

/**
 * 显示占用设置对话框
 */
const showOccupationDialog = (timeSlot: RoomTimeSlot) => {
  selectedTimeSlot.value = timeSlot
  occupationDialogVisible.value = true
}

/**
 * 处理取消占用
 */
const handleCancelOccupation = async (timeSlot: RoomTimeSlot) => {
  if (!timeSlot.occupationInfo) {
    ElMessage.error('没有找到占用信息')
    return
  }

  // 检查是否有占用记录ID
  const occupationId = timeSlot.occupationInfo.id || timeSlot.id
  if (!occupationId) {
    ElMessage.error('无法获取占用记录ID')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消时间段 ${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)} 的占用吗？`,
      '取消占用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.cancelling = true

    try {
      let actualOccupationId = occupationId

      if (!timeSlot.occupationInfo.id) {
        try {
          const occupationResponse = await getOccupationByRoomTime(timeSlot.id)
          if (occupationResponse.data && occupationResponse.data.id) {
            actualOccupationId = occupationResponse.data.id
          } else {
            throw new Error('未找到对应的占用记录')
          }
        } catch (queryError) {
          ElMessage.error('无法找到对应的占用记录')
          return
        }
      }

      await cancelOccupation(actualOccupationId)
      ElMessage.success('取消占用成功')
      await refreshData()
    } catch (error) {
      const errorMessage = handleApiError(error)
      ElMessage.error(errorMessage)
    }

  } catch (error: any) {
    if (error !== 'cancel') {
      // 操作被取消
    }
  } finally {
    loading.cancelling = false
  }
}

const handleOccupationSuccess = async () => {
  await refreshData()
  ElMessage.success('占用状态已更新')
}

/**
 * 处理页面大小变化
 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNo = 1
  refreshData()
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNo = page
  refreshData()
}

// 暴露刷新方法供父组件调用
defineExpose({
  refreshData
})
</script>

<style scoped>
.room-time-occupation-table {
  background: #fff;
  border-radius: 4px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

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
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

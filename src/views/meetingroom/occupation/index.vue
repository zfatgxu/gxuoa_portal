<template>
  <div class="meeting-room-occupation">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>会议室时间段占用管理</h2>
      <p class="page-description">
        管理会议室时间段的占用状态，支持设置部门管理占用、维护占用、装修占用等类型
      </p>
    </div>

    <!-- 会议室选择卡片 -->
    <el-card class="room-selector-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>选择会议室</span>
          <el-button
            type="primary"
            :icon="RefreshRight"
            @click="loadMeetingRooms"
            :loading="roomLoading"
            size="small"
          >
            刷新列表
          </el-button>
        </div>
      </template>

      <div class="room-selector">
        <el-select
          v-model="selectedRoomId"
          placeholder="请选择要管理的会议室"
          style="width: 300px"
          filterable
          clearable
          @change="handleRoomChange"
        >
          <el-option
            v-for="room in meetingRooms"
            :key="room.id"
            :label="`${room.name} (${room.location})`"
            :value="room.id"
          >
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>{{ room.name }}</span>
              <span style="color: #8492a6; font-size: 12px;">{{ room.location }}</span>
            </div>
          </el-option>
        </el-select>

        <div v-if="selectedRoomInfo" class="room-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="会议室名称">{{ selectedRoomInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="位置">{{ selectedRoomInfo.location }}</el-descriptions-item>
            <el-descriptions-item label="容量">{{ selectedRoomInfo.capacity }}人</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="selectedRoomInfo.status === 1 ? 'success' : 'danger'" size="small">
                {{ selectedRoomInfo.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- 时间段占用管理表格 -->
    <el-card v-if="selectedRoomId" class="occupation-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ selectedRoomName }} - 时间段占用管理</span>
          <div class="header-actions">
            <el-tag type="info" size="small">
              会议室ID: {{ selectedRoomId }}
            </el-tag>
          </div>
        </div>
      </template>
      
      <RoomTimeOccupationTable
        ref="occupationTableRef"
        :meeting-room-id="selectedRoomId"
      />
    </el-card>

    <!-- 空状态 -->
    <el-empty 
      v-else 
      description="请先选择要管理的会议室"
      :image-size="200"
    >
      <el-button type="primary" @click="loadMeetingRooms">
        加载会议室列表
      </el-button>
    </el-empty>

    <!-- 功能说明卡片 -->
    <el-card class="help-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>功能说明</span>
        </div>
      </template>
      
      <div class="help-content">
        <h4>占用类型说明：</h4>
        <ul>
          <li><el-tag type="danger" size="small">维护</el-tag> - 设备维护或检修</li>
          <li><el-tag type="info" size="small">其他</el-tag> - 其他特殊情况</li>
        </ul>
        
        <h4>操作说明：</h4>
        <ul>
          <li>选择会议室后，可以查看该会议室的所有时间段</li>
          <li>对于可用的时间段，可以点击"设为占用"按钮进行占用设置</li>
          <li>对于已占用的时间段，可以点击"取消占用"按钮取消占用</li>
          <li>占用原因必须填写，长度为1-200字符</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import RoomTimeOccupationTable from '@/components/MeetingRoom/RoomTimeOccupationTable.vue'
import { RoomInfoApi, type RoomInfoVO } from '@/api/meetingroom/roominfo'

/** 会议室时间段占用管理主页面 */
defineOptions({ name: 'MeetingRoomOccupationIndex' })

// 响应式数据
const roomLoading = ref(false)
const meetingRooms = ref<RoomInfoVO[]>([])
const selectedRoomId = ref<number | null>(null)
const occupationTableRef = ref()

// 计算属性
const selectedRoomInfo = computed(() => {
  if (!selectedRoomId.value) return null
  return meetingRooms.value.find(room => room.id === selectedRoomId.value) || null
})

const selectedRoomName = computed(() => {
  return selectedRoomInfo.value?.name || ''
})

// 组件挂载时加载会议室列表
onMounted(() => {
  loadMeetingRooms()
})

/**
 * 加载会议室列表
 */
const loadMeetingRooms = async () => {
  roomLoading.value = true
  try {
    const response = await RoomInfoApi.getRoomInfoPage({
      pageNo: 1,
      pageSize: 1000, // 获取所有会议室
      status: 1 // 只获取启用的会议室
    })
    
    meetingRooms.value = response.list || []
    
    if (meetingRooms.value.length === 0) {
      ElMessage.warning('暂无可用的会议室')
    }
  } catch (error) {
    ElMessage.error('加载会议室列表失败')
    meetingRooms.value = []
  } finally {
    roomLoading.value = false
  }
}

/**
 * 处理会议室选择变化
 */
const handleRoomChange = (roomId: number | null) => {
  selectedRoomId.value = roomId
  
  if (roomId && occupationTableRef.value) {
    // 刷新占用表格数据
    occupationTableRef.value.refreshData()
  }
}
</script>

<style scoped>
.meeting-room-occupation {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.room-selector-card,
.occupation-table-card,
.help-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-info {
  max-width: 600px;
}

.help-content h4 {
  margin: 16px 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.help-content ul {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

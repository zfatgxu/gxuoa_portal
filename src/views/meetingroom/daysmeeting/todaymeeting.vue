<template>
  <div class="today-meeting-container">
    <div class="page-header">
      <h2>今日会议</h2>
      <div class="date-display">{{ formattedToday }}</div>
    </div>

    <!-- 会议列表 -->
    <div class="meeting-list-container">
      <div v-if="todayMeetings.length > 0">
        <el-table :data="todayMeetings" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="roomName" label="会议室名称" width="150" show-overflow-tooltip />
          <el-table-column prop="title" label="会议主题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="organizer" label="申请人" width="120" />
          <el-table-column prop="phone" label="手机号码" width="130" />
          <el-table-column prop="participants" label="参加人员及人数" min-width="150" show-overflow-tooltip />
          <el-table-column prop="timeRange" label="会议时间" width="200" />
          <el-table-column prop="manager" label="管理员" width="120" />
        </el-table>
      </div>

      <div v-else class="no-meetings">
        <el-empty description="今日暂无会议安排" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RoomApplyApi } from '@/api/meetingroom/roomapply'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 引入中文语言包
dayjs.locale('zh-cn') // 设置为中文

// 今日会议列表
const todayMeetings = ref([])

// 格式化的今日日期
const formattedToday = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

// 获取今日会议数据
const loadTodayMeetings = async () => {
  try {
    const today = dayjs();
    const todayDateStr = today.format('YYYY-MM-DD'); 
    const queryParams = {
      pageNo: 1,
      pageSize: 100, 
      my: 1,
      relate: 1
    }
    const res = await RoomApplyApi.getRoomApplyPage(queryParams)
    todayMeetings.value = res.list
      .filter(item => {
        if (item.status !== 1) return false;
        const startDate = dayjs(item.startTime).format('YYYY-MM-DD');
        return startDate === todayDateStr;
      })
      .map(item => ({
        index: item.id,
        roomName: item.conferenceRoom,
        title: item.activityTheme,
        organizer: item.applicant,
        phone: item.phone || '—',
        participants: item.participants,
        manager: item.adminPerson || '—',
        timeRange: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
      }))
  } catch (error) {
    console.error('加载今日会议失败:', error)
    ElMessage.error('加载今日会议失败')
  }
}

// 格式化时间戳为时间
const formatTime = (timestamp) => {
  if (!timestamp) return '—'
  return dayjs(timestamp).format('HH:mm')
}

// 页面加载时获取今日会议数据
onMounted(() => {
  loadTodayMeetings()
})
</script>

<style scoped>
.today-meeting-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  font-size: 22px;
  color: #303133;
  margin: 0;
}

.date-display {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.meeting-list-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.no-meetings {
  padding: 40px 0;
  text-align: center;
}
</style>

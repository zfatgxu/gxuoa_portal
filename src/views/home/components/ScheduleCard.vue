<template>
  <div class="card">
    <div class="card-header" @click="toggleExpand" style="cursor: pointer;">
      <div class="title"><i class="bi bi-calendar3 me-2"></i>日程安排
        <div class="toggle-icon" style="margin-left: auto;">
        <i class="bi bi-chevron-down" v-if="isExpanded"></i>
        <i class="bi bi-chevron-up" v-else></i>
      </div>
      </div>
      <!-- 搜索图标 -->
      <div class="search-icon" @click="goToSchedule">
        <i class="bi bi-search"></i>
      </div>
      <div class="more" @click="goToSchedule">更多 <i class="bi bi-chevron-right"></i></div>
    </div>
    <div class="card-body" v-show="isExpanded">
      <div class="calendar-header">
        <div class="month-selector">
          <i class="bi bi-chevron-left" @click="prevMonth"></i>
          <span>{{ currentYearMonth }}</span>
          <i class="bi bi-chevron-right" @click="nextMonth"></i>
        </div>
      </div>
      
      <div class="schedule-list" v-if="scheduleList && scheduleList.length > 0">
        <div 
          v-for="(item, index) in scheduleList.slice(0, props.schedulelength)" 
          :key="index" 
          class="schedule-item"
          @click="viewScheduleDetail(item)"
        >
          <div class="schedule-date">
            <div class="date-day">{{ formatDay(item.startTime) }}</div>
            <div class="date-month">{{ formatMonth(item.startTime) }}</div>
          </div>
          <div class="schedule-content">
            <div class="schedule-title">{{ item.title }}</div>
            <div class="schedule-time">
              <i class="bi bi-clock me-1"></i>{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}
            </div>
            <div class="schedule-location" v-if="item.location">
              <i class="bi bi-geo-alt me-1"></i>{{ item.location }}
            </div>
          </div>
          
        </div>
      </div>
      <div v-else class="empty-schedule">
        <el-empty description="本月暂无日程安排" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  schedulelength: {
    type: Number,
    default: 5
  }
})
// 定义事件
const emit = defineEmits(['goToSchedule', 'viewScheduleDetail'])

// 控制卡片内容展开/收起的状态
const isExpanded = ref(true)

// 切换展开/收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 当前日期
const currentDate = ref(new Date())
const currentYearMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 日程列表数据
const scheduleList = ref([])
const scheduleLoading = ref(false)

// 获取日程列表
const getScheduleList = async () => {
  try {
    scheduleLoading.value = true
    
    // 模拟API调用，实际项目中应替换为真实API
    // const res = await scheduleApi.getMonthSchedule(currentDate.value)
    
    // 模拟数据
    setTimeout(() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const day = now.getDate()
      
      scheduleList.value = [
        {
          id: 1,
          title: '部门周例会',
          startTime: new Date(year, month, day, 9, 0).getTime(),
          endTime: new Date(year, month, day, 10, 30).getTime(),
          location: '行政楼203会议室',
          status: 'upcoming'
        },
        {
          id: 2,
          title: '项目进度汇报',
          startTime: new Date(year, month, day + 1, 14, 0).getTime(),
          endTime: new Date(year, month, day + 1, 16, 0).getTime(),
          location: '科研楼501会议室',
          status: 'upcoming'
        },
        {
          id: 3,
          title: '教学工作研讨会',
          startTime: new Date(year, month, day + 2, 10, 0).getTime(),
          endTime: new Date(year, month, day + 2, 11, 30).getTime(),
          location: '教学楼302',
          status: 'upcoming'
        },
        {
          id: 4,
          title: '学院学术报告',
          startTime: new Date(year, month, day + 3, 15, 0).getTime(),
          endTime: new Date(year, month, day + 3, 17, 0).getTime(),
          location: '学术报告厅',
          status: 'upcoming'
        },
        {
          id: 5,
          title: '迎新生工作部署会',
          startTime: new Date(year, month, day + 5, 9, 30).getTime(),
          endTime: new Date(year, month, day + 5, 11, 0).getTime(),
          location: '行政楼多功能厅',
          status: 'upcoming'
        }
      ]
      scheduleLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取日程列表失败', error)
    ElMessage.error('获取日程列表失败')
    scheduleLoading.value = false
  }
}

// 格式化日期（日）
const formatDay = (timestamp) => {
  const date = new Date(timestamp)
  return date.getDate()
}

// 格式化日期（月）
const formatMonth = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月`
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 获取日程状态文本
const getScheduleStatusText = (schedule) => {
  const now = new Date().getTime()
  if (schedule.endTime < now) {
    return '已结束'
  } else if (schedule.startTime <= now && schedule.endTime >= now) {
    return '进行中'
  } else {
    return '未开始'
  }
}

// 获取日程状态样式
const getScheduleStatusClass = (schedule) => {
  const now = new Date().getTime()
  if (schedule.endTime < now) {
    return 'status-ended'
  } else if (schedule.startTime <= now && schedule.endTime >= now) {
    return 'status-ongoing'
  } else {
    return 'status-upcoming'
  }
}

// 上个月
const prevMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() - 1)
  currentDate.value = date
  getScheduleList()
}

// 下个月
const nextMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + 1)
  currentDate.value = date
  getScheduleList()
}

// 查看日程详情
const viewScheduleDetail = (schedule) => {
  emit('viewScheduleDetail', schedule)
}

// 跳转到日程页面
const goToSchedule = () => {
  emit('goToSchedule')
}

onMounted(() => {
  getScheduleList()
})
</script>

<style scoped>
/* 日历头部样式 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.month-selector {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.month-selector i {
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  margin: 0 8px;
}

.month-selector i:hover {
  background-color: var(--hover-color);
}

/* 日程列表样式 */
.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.schedule-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item:hover {
  background-color: var(--hover-color);
}

.schedule-date {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  background-color: #409EFF; /* 替换var(--primary-color) */
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.date-day {
  font-size: 20px;
  font-weight: bold;
}

.date-month {
  font-size: 12px;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 500;
}

.schedule-time, .schedule-location {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.schedule-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
}

.status-upcoming {
  background-color: #e8f4fd;
  color: #3498db;
}

.status-ongoing {
  background-color: #e8f8f5;
  color: #2ecc71;
}

.status-ended {
  background-color: #f5f5f5;
  color: #95a5a6;
}

.empty-schedule {
  padding: 20px 0;
  text-align: center;
}

/* 卡片样式 */
.card {
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  background-color: white;
  border: none;
  height: 100%;
}

.card-header {
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  padding: 15px 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .title {
  color: var(--primary-color);
  font-size: 18px;
  display: flex;
  align-items: center;
}

.toggle-icon {
  cursor: pointer;
  margin-right: 5px;
  font-size: 16px;
  transition: transform 0.3s;
}

.toggle-icon:hover {
  color: var(--primary-color);
}

.card-header .more {
  color: #999;
  font-size: 12px;
  font-weight: normal;
  cursor: pointer;
}

.card-body {
  padding: 15px 20px;
}
</style>

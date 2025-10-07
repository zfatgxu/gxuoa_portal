<template>
  <div class="weekly-schedule">
    <!-- 顶部导航栏 -->
    <div class="header-bar">
      <div class="location">
        <span>当前位置：</span>
        <span>重要活动安排</span>
      </div>
      <!-- 周次选择 -->
      <div style="width: 460px;">
          <el-select v-model="selectedWeek" placeholder="请选择周次" @change="getScheduleTaskList">
            <el-option
              v-for="week in weekOptions"
              :key="week.value"
              :label="week.label"
              :value="week.value"
            />
          </el-select>
      </div>
      <div class="export" @click="showExportDialog = true">
        <span>导出数据</span>
      </div>
      <div class="export" @click="handleAddActivity">
        <span>添加活动内容</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <ContentWrap>
      <div class="schedule-container">


        <!-- 标题 -->
        <div class="schedule-title">
          {{ scheduleTitle }}
        </div>

        <!-- 活动安排表格 -->
        <el-table
          :data="scheduleData"
          border
          :span-method="objectSpanMethod"
          class="schedule-table"
          header-cell-class-name="table-header"
        >
          <el-table-column prop="date" label="日期" width="140" align="center" />
          <el-table-column label="时间" align="center">
            <el-table-column prop="period" label="" width="100" align="center" class-name="time-sub-column"/>
            <el-table-column prop="time" label="" width="100" align="center" class-name="time-sub-column"/>
          </el-table-column>
          <el-table-column prop="event" label="事项" min-width="300" />
          <el-table-column prop="location" label="地点" width="150" align="center" />
          <el-table-column prop="leaders" label="参加领导" width="150" align="center" />
        </el-table>
      </div>
    </ContentWrap>
    <!-- 导出数据弹窗 -->
    <el-dialog v-model="showExportDialog" title="请选择日期" width="500px">
      <div>
        <div style="display: flex;justify-content: space-between;">
          <div>
            <el-date-picker v-model="exportForm.startDate" type="date" placeholder="选择开始日期" />
          </div>
          <div>
            <el-date-picker v-model="exportForm.endDate" type="date" placeholder="选择截止日期" />
          </div>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center;">
          <el-button type="primary" @click="handleExport">导出数据</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getScheduleWeekList } from '@/api/schedule/index'
import dayjs from 'dayjs'
import { getScheduleWeekTaskList, exportScheduleWeekTask } from '@/api/schedule/addaction'
import { getNowDateTime } from '@/utils/formatTime'
import download from '@/utils/download'
defineOptions({ name: 'WeeklySchedule' })
const router = useRouter()
// 选中的周次
const selectedWeek = ref('')
//获取活动周列表
const getWeekList = async () => {
  try {
    const res = await getScheduleWeekList({})
    const weekTimeMap = new Map() // 用于存储活动周的时间信息
    // 检查返回的数据结构
    if (res && res.list && Array.isArray(res.list)) {
      // 如果数据在list字段中
      res.list.forEach((item: any) => {
        processWeekItem(item, weekTimeMap)
      })
    } else {
      ElMessage.warning('获取活动周列表失败：数据格式错误')
    }
    // 找到最接近当前时间的活动周
    findNearestWeek(weekTimeMap)
    await getScheduleTaskList()
  } catch (error) {
    ElMessage.error('获取活动周列表失败')
  } finally {

  }
}
// 找到最接近当前时间的活动周
const findNearestWeek = (weekTimeMap: Map<number, number>) => {
  if (weekTimeMap.size === 0) return

  const now = new Date().getTime()
  let nearestWeekId = ''
  let minDiff = Infinity

  for (const [weekId, midTime] of weekTimeMap) {
    const diff = Math.abs(midTime - now)
    if (diff < minDiff) {
      minDiff = diff
      nearestWeekId = weekId
    }
  }

  if (nearestWeekId) {
    selectedWeek.value = nearestWeekId
  }
}
// 处理单个活动周项目
const processWeekItem = (item: any, weekTimeMap: Map<number, number>) => {
  if (!item.name) return

  const [startYear, endYear, semesterNumber, weekNumber] = item.name.split('-')
  if (!startYear || !endYear || !semesterNumber || !weekNumber) return

  const startDate = new Date(item.startTime)
  const endDate = new Date(item.endTime)

  // 计算活动周的中间时间点作为参考
  const midTime = (startDate.getTime() + endDate.getTime()) / 2

  const newWeek = {
    label: `${startYear}-${endYear}学年第${semesterNumber === '1' ? '一' : '二'}学期第${weekNumber}周活动安排表(${formatDate(startDate)}—${formatDate(endDate)})`,
    value: item.id,
    startDate: startDate,
    endDate: endDate
  }
  weekOptions.value.push(newWeek)

  // 存储活动周的时间信息用于比较
  weekTimeMap.set(item.id, midTime)
}
// 周次选项
const weekOptions = ref([])
// 格式化日期
const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
}
// 标题
const scheduleTitle = computed(() => {
  const option = weekOptions.value.find(item => item.value === selectedWeek.value)
  return option ? option.label : ''
})

const getScheduleTaskList = async () => {
  scheduleData.value = []
  const res = await getScheduleWeekTaskList({
    weekId: selectedWeek.value,
  })
  if (res) {
    res.list.forEach((item: any) => {
      // 处理时间戳格式
      const datetime = new Date(item.taskStarttime)
      const date = datetime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][datetime.getDay()]
      const formattedDate = `${date}\n${weekDay}`

      // 判断上午下午
      const hour = datetime.getHours()
      const period = hour < 12 ? '上午' : '下午'

      // 格式化时间
      const time = datetime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

      // 处理校领导数据
      let leadersText = ''
      let leadersId = []
      try {
        if (item.leadersInfoJson) {
          const leadersArray = JSON.parse(item.leadersInfoJson)
          leadersText = leadersArray.map((leader: any) => leader.nickname).join('、')
          leadersId = leadersArray.map((leader: any) => leader.id)
        } else if (item.leaders) {
          // 如果是字符串格式，直接使用
          leadersText = item.leaders
        }
      } catch (error) {
        console.error('解析校领导数据失败:', error)
        leadersText = item.leaders || ''
      }
      const scheduleItem = {
        id: item.id,
        date: formattedDate,
        period: period,
        time: time,
        event: item.name,
        location: item.place,
        leaders: leadersText,
        leadersId: leadersId,
        datetime: dayjs(item.taskStarttime).format('YYYY-MM-DD HH:mm:ss')
      }
      scheduleData.value.push(scheduleItem)
      // 按照datetime排序
      scheduleData.value.sort((a, b) => {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      })
    })
  }
}

// 活动安排数据
const scheduleData = ref([])

// 表格合并方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    // 日期列合并
    const dates = scheduleData.value.map(item => item.date)
    const currentDate = row.date
    const firstIndex = dates.indexOf(currentDate)

    if (rowIndex === firstIndex) {
      const count = dates.filter(d => d === currentDate).length
      return {
        rowspan: count,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }

  if (columnIndex === 1) {
    // 时间段列合并
    const key = `${row.date}-${row.period}`
    const keys = scheduleData.value.map(item => `${item.date}-${item.period}`)
    const firstIndex = keys.indexOf(key)

    if (rowIndex === firstIndex) {
      const count = keys.filter(k => k === key).length
      return {
        rowspan: count,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}


// 弹窗控制
const showExportDialog = ref(false)

// 导出表单
const exportForm = ref({
  startDate: '',
  endDate: ''
})


// 导出数据
// 导出数据
const handleExport = async () => {
  try {
    // 调用导出API
    const response = await exportScheduleWeekTask({
      taskStarttime: dayjs(exportForm.value.startDate).format('YYYY-MM-DD HH:mm:ss'),
      taskEndtime: dayjs(exportForm.value.endDate).format('YYYY-MM-DD HH:mm:ss')
    })
    const nowDateTime = dayjs(getNowDateTime()).format('YYYY-MM-DD')
    // 处理导出响应
    if (response) {
      download.excel(response, `${nowDateTime}.xls`)
      ElMessage.success('导出成功！')
      exportForm.value.startDate = ''
      exportForm.value.endDate = ''
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    showExportDialog.value = false
  }
}
// 跳转到添加活动页面
const handleAddActivity = () => {
  router.push('/schedulelist/add')
}
onMounted(() => {
  // 初始化加载数据
  getWeekList() // 获取活动周列表
})
</script>

<style scoped lang="scss">
.weekly-schedule {
  min-height: 100vh;
  background-color: #e8e8f0;

  .header-bar {
    background-color: #d4d4e8;
    padding: 8px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #c0c0d0;

    .location {
      font-size: 14px;
      color: #333;

    }

    .announcement {
      font-size: 14px;
      color: #333;
    }
    .export {
      font-size: 14px;
      color: #333;
      font-weight: bold;
    }

  }

  .schedule-container {
    padding: 20px;
    background-color: #fff;

    .schedule-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      background: linear-gradient(to bottom, #6b8dd6 0%, #4a6fb5 100%);
      padding: 12px;
      margin-bottom: 20px;
      border: 2px solid #4a6fb5;
      border-radius: 4px;
    }

    .schedule-table {
      :deep(.table-header) {
        background-color: #7ba3e0;
        color: #fff;
        font-weight: bold;
        text-align: center;
      }

      :deep(.el-table__cell) {
        padding: 8px 0;
      }

      :deep(.time-sub-column) {
        padding: 0 !important;
      }

      :deep(td) {
        white-space: pre-line;
      }

      :deep(.cell) {
        line-height: 1.6;
      }
    }
  }
}

</style>

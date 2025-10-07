<template>
  <div class="schedule-manage">
    <ContentWrap>
      <!-- 顶部筛选表单 -->
      <div class="filter-form">
        <el-form :inline="true" :model="queryParams" class="form-inline">
          <el-form-item label="请选择">
            <el-select v-model="queryParams.weekId" placeholder="请选择周次" style="width: 460px" :loading="weekLoading" @change="getScheduleTaskList">
              <el-option
                v-for="week in weekOptions"
                :key="week.value"
                :label="week.label"
                :value="week.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" @click="handleDeleted">删除</el-button>
            <el-button type="primary" @click="showAddWeekDialog = true">添加活动周</el-button>
          </el-form-item>
        </el-form>
        
        <el-form :inline="true" :model="queryParams" class="form-inline">
          <el-form-item label="日期时间">
            <el-date-picker
              v-model="queryParams.datetime"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 200px"
              :disabled-date="disabledDate"
            />
          </el-form-item>
          <el-form-item label="活动">
            <el-input v-model="queryParams.event" placeholder="请输入活动" style="width: 150px" />
          </el-form-item>
          <el-form-item label="地点">
            <el-input v-model="queryParams.location" placeholder="请输入地点" style="width: 150px" />
          </el-form-item>
          <el-form-item label="参加校领导">
            <el-select 
              v-model="queryParams.leaders" 
              multiple 
              placeholder="请选择校领导" 
              style="width: 150px" 
              :loading="weekLoading"
              filterable
              clearable
            >
              <el-option
                v-for="leader in leaderUser"
                :key="leader.id"
                :label="leader.nickname"
                :value="leader.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </ContentWrap>
    <!-- 添加活动周弹窗 -->
    <el-dialog v-model="showAddWeekDialog" title="添加活动周" width="600px">
      <el-form :model="weekForm" label-width="120px">
        <el-form-item label="活动周信息">
          <div style="display: flex; align-items: center; gap: 5px;">
            <el-input-number v-model="weekForm.startYear" :min="2020" :max="2030" :controls="false" style="width: 80px" placeholder="开始年" />
            <span>-</span>
            <el-input-number v-model="weekForm.endYear" :min="2020" :max="2030" :controls="false" style="width: 80px" placeholder="结束年" />
            <span>学年第</span>
            <el-input-number v-model="weekForm.semesterNumber" :min="1" :max="2" :controls="false" style="width: 60px" placeholder="学期" />
            <span>学期第</span>
            <el-input-number v-model="weekForm.weekNumber" :min="1" :max="30" :controls="false" style="width: 60px" placeholder="周次" />
            <span>周</span>
          </div>
        </el-form-item>
        
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="weekForm.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledStartDate"
          />
        </el-form-item>
        <!-- <el-form-item label="结束日期">
          <el-date-picker
            v-model="weekForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <el-button @click="showAddWeekDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddWeek">确定添加</el-button>
      </template>
    </el-dialog>
    <!-- 活动列表表格 -->
    <ContentWrap>
      <div class="schedule-title-bar">
        {{ scheduleTitle }}
      </div>
      
      <el-table
        :data="scheduleList"
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
        <el-table-column prop="event" label="活动" min-width="250" />
        <el-table-column prop="location" label="地点" width="150" align="center" />
        <el-table-column prop="leaders" label="参加校领导" width="150" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button v-if="showButton(scope.row)" link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="showButton(scope.row)" link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElMessage, ElMessageBox } from 'element-plus'
import { submitScheduleWeek, getScheduleWeekList, deleteScheduleWeek } from '@/api/schedule/index'
import dayjs from 'dayjs'
import { getUserListByRoleCode } from '@/api/system/user/index'
import { submitScheduleWeekTask, updateScheduleWeekTask, deleteScheduleWeekTask, getScheduleWeekTaskList } from '@/api/schedule/addaction'
import { useUserStore } from '@/store/modules/user'
defineOptions({ name: 'ScheduleManage' })

// 添加活动周弹窗控制
const showAddWeekDialog = ref(false)
// 活动周表单
const weekForm = ref({
  startYear: 2024,
  endYear: 2025,
  semesterNumber: 2,
  weekNumber: 1,
  startDate: '',
})
// 活动周参数
const queryParams = ref({
  id:'',
  weekId: '',
  datetime: '',
  event: '',
  location: '',
  leaders: [] as any[]
})
//获取活动周列表
const getWeekList = async () => {
  try {
    weekLoading.value = true
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
    weekLoading.value = false
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
    queryParams.value.weekId = nearestWeekId
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
// 加载状态
const weekLoading = ref(false)
// 标题
const scheduleTitle = computed(() => {
  const option = weekOptions.value.find(item => item.value === queryParams.value.weekId)
  return option ? option.label : ''
})
// 校领导用户
const leaderUser = ref<any[]>([])
// 获取校领导用户
const getLeaderUser = async () => {
  const res = await getUserListByRoleCode('xld')
  if (res) {
    res.forEach((item: any) => {
      leaderUser.value.push({
        id: item.id,
        nickname: item.nickname
      })
    })
  }
}
// 日期选择器的禁用函数
const disabledDate = (time: Date) => {
  const option = weekOptions.value.find(item => item.value === queryParams.value.weekId)
  const startDate = new Date(option?.startDate.getTime() - 1 * 24 * 60 * 60 * 1000)
  const endDate = option?.endDate
  
  if (!startDate || !endDate) return true // 如果没有选择活动周，禁用所有日期
  
  // 只允许选择在活动周时间范围内的日期
  return time.getTime() < startDate.getTime() || time.getTime() > endDate.getTime()
}
// 开始日期选择器的禁用函数 - 检查活动周时间重叠
const disabledStartDate = (time: Date) => {
  if (!time) return false
  
  const selectedDate = new Date(time)
  // 计算活动周的结束日期（开始日期 + 6天）
  const endDate = new Date(selectedDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  // 检查与现有活动周是否有重叠
  for (const week of weekOptions.value) {
    const existingStart = new Date(week.startDate)
    const existingEnd = new Date(week.endDate)
    
    // 检查时间重叠：新活动周的开始时间早于现有活动周的结束时间，且新活动周的结束时间晚于现有活动周的开始时间
    if (selectedDate.getTime() < existingEnd.getTime() && endDate.getTime() > existingStart.getTime()) {
      return true // 有重叠，禁用这个日期
    }
  }
  
  return false // 无重叠，允许选择
}
// 活动列表数据
const scheduleList = ref([])
const getScheduleTaskList = async () => {
  scheduleList.value = []
  const res = await getScheduleWeekTaskList({
    weekId: queryParams.value.weekId,
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
        datetime: dayjs(item.taskStarttime).format('YYYY-MM-DD HH:mm:ss'),
        creator: item.creator,
      }
      scheduleList.value.push(scheduleItem)
      // 按照datetime排序
      scheduleList.value.sort((a, b) => {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      })
    })
  }
}

// 表格合并方法
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    // 日期列合并
    const dates = scheduleList.value.map(item => item.date)
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
    const keys = scheduleList.value.map(item => `${item.date}-${item.period}`)
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
const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
}
// 删除
const handleDeleted = async () => {
  ElMessageBox.confirm('确定要删除该活动周吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // 先检查该周是否有活动安排
    const activities = await getScheduleWeekTaskList({
      weekId: queryParams.value.weekId,
    })
    if (activities.list && activities.list.length > 0) {
      ElMessage.warning('该活动周下有活动安排，无法删除')
      return
    } else {
      await deleteScheduleWeek(Number(queryParams.value.weekId))
      ElMessage.success('删除活动周成功')
      // 删除后刷新
      await refreshWeekOptions()
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
// 刷新活动周选项列表
const refreshWeekOptions = async () => {
  // 清空现有选项，强制界面重新渲染
  weekOptions.value.length = 0
  await getWeekList()
}

// 添加活动周
const handleAddWeek = async () => {
  if ( !weekForm.value.startDate) {
    ElMessage.warning('请填写完整信息！')
    return
  }
  
  // 格式化日期
  const startDate = new Date(weekForm.value.startDate)
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  // 生成新的周次选项
  const newWeek = {
  label: `${weekForm.value.startYear}-${weekForm.value.endYear}学年第${weekForm.value.semesterNumber}学期第${weekForm.value.weekNumber}周活动安排表(${formatDate(startDate)}—${formatDate(endDate)})`,
  value: `${weekForm.value.startYear}-${weekForm.value.endYear}-${weekForm.value.semesterNumber}-${weekForm.value.weekNumber}`
  }
  const data={
    name:newWeek.value,
    startTime:dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
    endTime:dayjs(endDate).format('YYYY-MM-DD HH:mm:ss')
  }

  // 添加到周次选项列表
  await submitScheduleWeek(data)
  
  ElMessage.success('添加活动周成功！')

  // 添加后刷新列表
  refreshWeekOptions()
  // 重置表单
  weekForm.value = {
  startYear: 2024,
  endYear: 2025,
  semesterNumber: 2,
  weekNumber: 1,
  startDate: '',
}
}
// 提交
const handleSubmit = async () => {
  if (!queryParams.value.datetime || !queryParams.value.event) {
    ElMessage.warning('请填写日期时间和活动！')
    return
  }

  const leadersArray = queryParams.value.leaders.map((leaderId: number) => {
  const leader = leaderUser.value.find(l => l.id === leaderId)
  return {
    id: leaderId,
    nickname: leader ? leader.nickname : ''
  }
  })

  const data={
    id: queryParams.value.id,
    weekId: queryParams.value.weekId,
    taskStarttime: dayjs(queryParams.value.datetime).format('YYYY-MM-DD HH:mm:ss'),
    name: queryParams.value.event,
    place: queryParams.value.location,
    leadersInfoJson: JSON.stringify(leadersArray) // 转换为JSON字符串
  }

  if (!queryParams.value.id) {
    await submitScheduleWeekTask(data)
    ElMessage.success('添加活动成功！')
  }else{
    await updateScheduleWeekTask(data)
    ElMessage.success('更新活动成功！')
  }
 
  refreshScheduleList()
}

// 刷新活动列表
const refreshScheduleList = async () => {
  scheduleList.value = []
  await getScheduleTaskList()
  queryParams.value.id = ''
  queryParams.value.datetime = ''
  queryParams.value.event = ''
  queryParams.value.location = ''
  queryParams.value.leaders = []
}
//检查是否显示编辑按钮
const showButton = (row: any) => {
  // 获取当前登录用户id
  const userId = useUserStore().getUser.id
  
  // 如果当前登录用户是活动创建者或者当前登录用户是参与校领导或者管理员，显示编辑按钮
  if (Number(row.creator)===userId || row.leadersId.includes(userId)  || userId===1) {
    return true
  }
  return false
}
// 编辑
const handleEdit = (row: any) => {
  queryParams.value.id = row.id
  queryParams.value.datetime = row.datetime
  queryParams.value.event = row.event
  queryParams.value.location = row.location
  queryParams.value.leaders = row.leadersId
}

// 删除
const handleDelete = async (row: any) => {
  ElMessageBox.confirm('确定要删除这条活动记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteScheduleWeekTask(row.id)
    ElMessage.success('删除成功！')
    refreshScheduleList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

onMounted(() => {
  // 初始化加载数据
  getWeekList() // 获取活动周列表
  getLeaderUser() // 获取校领导用户
  
})
</script>

<style scoped lang="scss">
.schedule-manage {
  .filter-form {
    background-color: #f5f5f5;
    padding: 15px 20px;
    border-radius: 4px;
    
    .form-inline {
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      :deep(.el-form-item) {
        margin-bottom: 10px;
      }
      
      :deep(.el-form-item__label) {
        font-weight: normal;
      }
    }
  }
  
  .schedule-title-bar {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    padding: 15px;
    background-color: #f0f0f0;
    border-bottom: 2px solid #ddd;
    margin-bottom: 0;
  }
  
  .schedule-table {
    :deep(.table-header) {
      background-color: #fff;
      color: #333;
      font-weight: bold;
      text-align: center;
      border: 1px solid #ddd;
    }
    
    :deep(.el-table__cell) {
      padding: 8px 0;
      border: 1px solid #ddd;
    }
    
    :deep(.time-sub-column) {
      padding: 0 !important;
      height: 0 !important;
    }

    :deep(td) {
      white-space: pre-line;
    }
    
    :deep(.cell) {
      line-height: 1.6;
    }
    
    :deep(.el-button--text) {
      padding: 0 5px;
    }
  }
}
</style>
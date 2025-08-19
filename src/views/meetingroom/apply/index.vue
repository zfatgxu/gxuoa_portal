<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="left-section">
        <div class="logo">会议室管理系统</div>
      </div>

      <div class="settings">
        <div class="nav-link" @click="goToMyApply">
          <i class="fas fa-cog"></i> 我的申请
        </div>
      </div>
    </header>
    <div class="filter-container">
      <div class="room-selector">
        <!-- 部门选择 -->
        <el-select
          v-model="selectedDept"
          placeholder="选择部门"
          size="small"
          clearable
          filterable
          @change="handleDeptChange"
          style="margin-right: 10px; width: 120px;"
        >
          <el-option
            v-for="dept in deptOptions"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>

        <!-- 会议室选择 -->
        <el-select
          v-model="selectedRoom"
          placeholder="选择会议室"
          size="small"
          clearable
          filterable
          @change="handleRoomChange"
          :disabled="!selectedDept"
          style="width: 150px;"
        >
          <el-option
            v-for="room in roomOptions"
            :key="room.id"
            :label="`${room.name}--${room.capacity}人`"
            :value="room.id"
          />
        </el-select><!-- 细节筛选按钮 -->
        <el-button type="primary" style="margin-left: 10px" size="small" @click="dialogVisible = true">
          细节筛选
        </el-button>
        <!-- 弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          title="细节筛选"
          width="900px"
        >
          <!-- 整体容器：左右分布 -->
          <div style="display: flex; align-items: flex-start;">

            <!-- 左侧条件区域 -->
            <div style="flex: 6; display: flex; flex-wrap: wrap; align-items: center;">
              <el-date-picker
                v-model="alterDate"
                type="date"
                placeholder="选择日期"
                size="small"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="margin-right: 10px; width: 150px;"
                class="black-text-picker"
              />

              <el-time-select
                v-model="beginTime"
                :disabled="!alterDate"
                placeholder="开始时间"
                size="small"
                start="00:00"
                end="23:30"
                step="00:30"
                style="margin-right: 10px; width: 120px;"
              />

              <el-time-select
                v-model="lastTime"
                :disabled="!beginTime"
                placeholder="结束时间"
                size="small"
                :start="beginTime"
                end="23:30"
                step="00:30"
                style="margin-right: 10px; width: 120px;"
              />
              <el-select
                v-model="department"
                placeholder="选择部门"
                size="small"
                clearable
                filterable
                style="width: 120px; margin-right: 10px;"
              >
                <el-option
                  v-for="dept in deptOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
              <el-input
                v-model="roomCapacity"
                placeholder="人数"
                style="width: 80px; margin-right: 10px; height: 28px;"
                class="custom-input"
                type="number"
                @input="onRoomCapacityInput"
              />

              <el-input
                v-model="roomLocation"
                placeholder="请输入位置关键字"
                style="width: 400px; margin-right: 10px; height: 28px;"
                maxlength="20"
                show-word-limit
                class="custom-input"
              />

            </div>

            <!-- 右侧按钮区域 -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start;">
              <el-button @click="handleReset" style="margin-bottom: 10px; width: 80px;">
                清空
              </el-button>
              <el-button type="primary" @click="handleFilter" style="width: 80px;">
                搜索
              </el-button>
              <DialogSearch
                v-model:visible="dialogListVisible"
                :data="meetingRoomList"
              />
            </div>
          </div>
        </el-dialog>

      </div>
    </div>
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧会议室信息 -->
      <div class="room-info-panel">
        <div class="room-status-header">会议室信息</div>

        <!-- 未选择会议室时的提示 -->
        <div class="empty-room-tip" v-if="!selectedRoom || !currentRoomInfo">
          <el-empty description="请选择会议室" />
        </div>

        <!-- 已选择会议室时显示信息 -->
        <div class="room-card" v-else>
          <div class="room-image">
            <!-- <img :alt="currentRoomInfo.name" class="room-img"/> -->
            <div class="room-status">{{ isRoomOpen ? '开放使用' : '内部使用' }}</div>
            <div class="room-title" style="color: #000;">
              <h2>{{ currentRoomInfo.name }}</h2>
              <p>({{ currentRoomInfo.capacity }}个座位)</p>
            </div>
          </div>

          <div class="room-details">
            <div class="detail-item">
              <span class="label">位置</span>
              <span class="value">{{ currentRoomInfo.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">管理人员</span>
              <span class="value">{{ currentRoomInfo.manager }}</span>
            </div>
            <div class="detail-item">
              <span class="label">容纳人数：</span>
              <span class="value">{{ currentRoomInfo.capacity }}人</span>
            </div>
            <div class="detail-item">
              <span class="label">会议设备：</span>
              <span class="value">{{ currentRoomInfo.equipment }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧日历和会议列表 -->
      <div class="calendar-panel">
        <!-- 日期标题区域已隐藏 -->

        <!-- 使用Element Plus日历控件 -->
        <div class="calendar-container">
          <el-calendar v-model="selectedDate">
            <template #date-cell="{ data }">
              <div
                class="calendar-cell"
                :class="{ 'disabled-date': isPastDate(data) }"
                @click="!isPastDate(data) && handleDateClick(data)"
              >
                <div class="calendar-day">{{ data.day.split('-')[2] }}</div>
                <div v-if="isToday(data)" class="today-marker"></div>
                <div v-if="isBooked(data)" class="booked-marker"></div>
              </div>
            </template>
          </el-calendar>
        </div>

        <!-- 日历下方的图例 -->
        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-dot gray"></span>
            <span>已结束</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot blue"></span>
            <span>当日</span>
          </div>
        </div>

        <!-- 会议列表 -->
        <div class="meeting-list-header">我预订的会议</div>

        <!-- 已选择会议室时显示会议列表 -->
        <div class="meeting-list">
          <div v-if="meetingsList.length > 0">
            <table class="application-table">
              <thead>
              <tr>
                <th style="width: 120px;">序号</th>
                <th>会议室名称</th>
                <th>主题</th>
                <th>申请人</th>
                <th>手机号码</th>
                <th>参加人员及人数</th>
                <th> 管理员</th>
                <th> 审核状态</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(meeting, index) in meetingsList" :key="meeting.index">
                <td>  {{ index + 1 }}</td>
                <td>{{ meeting.roomName || '—' }}</td>
                <td>{{ meeting.title || '—' }}</td>
                <td>{{ meeting.organizer || '—' }}</td>
                <td>{{ meeting.phone || '—' }}</td>
                <td>{{ meeting.participants || '—' }}</td>
                <td>{{ meeting.manager || '—' }}</td>
                <td>
                  <el-tag :type="success" disable-transitions>
                    已预约
                  </el-tag>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="no-meetings">
            <p>当前没有预订的会议</p>
          </div>
        </div>

        <!-- 时段选择对话框 -->
        <el-dialog
          v-model="timeSlotDialogVisible"
          :title="`选择预约时段 (${selectedDateFormatted})`"
          width="30%"
          center
        >
          <div
            class="time-slot-options"
            style="max-height: 300px; overflow-y: auto; padding: 10px;"
          >
            <el-radio-group v-model="selectedTimeSlot" direction="vertical">
              <el-radio
                v-for="(slot, index) in availableTimeSlots"
                :key="slot.id"
                :label="slot.id"
                :disabled="slot.Alt === 0"
                style="margin-bottom: 10px;"
              >
        <span :style="{ color: slot.Alt === 0 ? '#aaa' : '#333' }">
          时段 {{ index + 1 }}：{{ slot.startTime }} - {{ slot.endTime }}
          <span v-if="slot.Alt === 0">（{{ slot.conflictReason || '该时段已被预定' }}）</span>
        </span>
              </el-radio>
            </el-radio-group>
          </div>



          <template #footer>
    <span class="dialog-footer">
      <el-button @click="timeSlotDialogVisible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedTimeSlot" @click="GoToApplyForm">
        确认申请
      </el-button>
    </span>
          </template>
        </el-dialog>
      </div> <!-- calendar-panel的闭合标签 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { RoomApplyApi } from '@/api/meetingroom/roomapply'
import { RoomInfoApi } from '@/api/meetingroom/roominfo'
import { RoomTimeApi } from '@/api/meetingroom/roomtime'
import { getOccupationsByMeetingRoom, getOccupationsByDate } from '@/api/meetingroom/roomTimeOccupation'
import { getSimpleDeptList } from '@/api/system/dept'
import dayjs from 'dayjs'
import DialogSearch from '@/views/meetingroom/apply/dialogSearch.vue'

const meetingsList = ref([])
const alterDate = ref(null)
const beginTime = ref(null)
const lastTime = ref(null)

function onRoomCapacityInput(value) {
  // 只允许数字（非负整数）
  const digitsOnly = value.replace(/\D/g, '')
  roomCapacity.value = digitsOnly
}


watchEffect(() => {
  if (alterDate.value && beginTime.value && lastTime.value) {
    const [startHour, startMin] = beginTime.value.split(':').map(Number)
    const [endHour, endMin] = lastTime.value.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (startMinutes >= endMinutes) {
      lastTime.value = ''
      ElMessage.warning('请选择合法时间段（结束时间必须晚于开始时间）')
      return
    }
    timeSlotRoomId()
  }
})
const timeSlotRoomInfo = ref([])
const flag = ref(0)
const timeSlotRoomId = async () => {
  // 三个值都选中时执行的逻辑

  const Params = reactive({
    startTime:  `${alterDate.value} ${beginTime.value}:00`,
    endTime: `${alterDate.value} ${lastTime.value}:00`,
  })
  timeSlotRoomInfo.value = await RoomTimeApi.timeSlotRoomId(Params)
  flag.value = 1
}


// 重置函数：清空所有筛选条件
function handleReset() {
  alterDate.value = null
  beginTime.value = null
  lastTime.value = null
  roomCapacity.value = ''
  roomLocation.value = ''
  department.value = null
}
const dialogListVisible = ref(false)
async function handleFilter() {
  const isAllEmpty = !alterDate.value && !beginTime.value && !lastTime.value
  const isAllFilled = alterDate.value && beginTime.value && lastTime.value
  const isPartial = (!isAllEmpty && !isAllFilled)

  if (isPartial) {
    ElMessage.warning('请填写完整的日期和时间范围')
    return
  }

  let req = {
    alterDate: '',
    startTime: '',
    endTime: '',
    capacity: roomCapacity.value,
    location: roomLocation.value,
    deptId: department.value,
    pageNo: 1,
    pageSize: 10,
  }

  if (isAllEmpty) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0] // yyyy-MM-dd

    req.alterDate = tomorrowDateStr
    req.startTime = '00:00'
    req.endTime = '23:30'
  } else if (isAllFilled) {
    req.alterDate = alterDate.value
    req.startTime = beginTime.value
    req.endTime = lastTime.value
  }

  // 发起请求
  try {
    const res = await RoomTimeApi.getRoomSearchPage(req)
    meetingRoomList.value = res
    console.log('查询结果:', meetingRoomList.value)
    dialogListVisible.value = true
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('系统异常，查询失败')
  }
}
const loadMeetings = async () => {
  try {
    const res = await RoomApplyApi.getRoomApplyPage(queryParams)
    meetingsList.value = res.list
      .filter(item => item.status === 1)
      .map(item => ({
        index: item.id,
        roomName: item.conferenceRoom,
        title: item.activityTheme,
        organizer: item.applicant,
        phone: item.phone || '—',
        participants: item.participants,
        manager: item.adminPerson || '—',
      }))
  } catch (error) {
    ElMessage.error('加载会议失败')
  }
}


const router = useRouter()
const goToMyApply = () => {
  router.push('/meeting/MyApply')
}

//查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  my: 1,
})
const queryRoomTimeParams = reactive({
  pageNo: 1,
  pageSize: 100,
  meetingRoomId: 20
})

// 当前选中的日期
const selectedDate = ref(new Date()) // 使用当前日期

// 时段选择对话框相关状态
const timeSlotDialogVisible = ref(false)
const selectedTimeSlot = ref('')
const selectedDateFormatted = ref('')

const dialogVisible = ref(false)

// 部门选择相关状态
const selectedDept = ref('') // 选中的部门ID
const deptOptions = ref([]) // 部门选项列表

// 会议室选择相关状态
const selectedRoom = ref('') // 选中的会议室ID
const roomOptions = ref([]) // 会议室选项列表
const loading = ref(false) // 加载状态

const bookedMeetings = ref([])
// 监听是否用时间推荐筛选
watchEffect(() => {
  if (flag.value === 1) {

    const seenDeptIds = new Set()
    deptOptions.value = []

    for (const item of timeSlotRoomInfo.value) {
      if (item.deptId != null && !seenDeptIds.has(item.deptId)) {
        seenDeptIds.add(item.deptId)
        deptOptions.value.push({
          id: item.deptId,
          name: item.deptName
        })
      }
    }
  }
})

// 获取部门列表
const getDeptList = async () => {

  try {
    loading.value = true
    const res = await getSimpleDeptList()
    if (res) {
      deptOptions.value = res.map(item => ({
        id: item.id,
        name: item.name
      }))
    }
  } catch (error) {
    ElMessage({
      message: `获取部门列表失败: ${error.message}`,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 根据部门ID获取会议室列表
const getRoomInfoByDeptId = async (deptId) => {
  if (!deptId) {
    roomOptions.value = []
    selectedRoom.value = ''
    return
  }

  try {
    loading.value = true
    const params = {
        pageNo: 1,
        pageSize: 100,
        deptId: deptId
    }
    const res = await RoomInfoApi.getRoomInfoPage(params)
    if (res.list) {
      // 过滤掉 status 为 0 的会议室
      roomOptions.value = res.list
        .filter(item => item.status !== 0)
        .map(item => ({
          id: item.id,
          name: item.name,
          capacity: item.capacity || '',
          location: item.location || '',
          manager: item.manager || '',
          equipment: item.equipment || '',
          status: item.status || '',
          open: item.open || '',
        }))
      // 不默认选中会议室，由用户手动选择
      selectedRoom.value = ''
    } else {
      roomOptions.value = []
      selectedRoom.value = ''
    }
  } catch (error) {
    ElMessage({
      message: `获取会议室列表失败: ${error.message}`,
      type: 'error'
    })
    roomOptions.value = []
    selectedRoom.value = ''
  } finally {
    loading.value = false
  }
}

// 处理部门选择变化
const handleDeptChange = (deptId) => {
  if (!deptId) {
    roomOptions.value = []
    selectedRoom.value = ''
    return
  }

  // 获取该部门的会议室列表
  if (flag.value === 1){
      roomOptions.value = timeSlotRoomInfo.value
      .filter(item => item.status !== 0 && item.deptId === deptId)
      .map(item => ({
        id: item.id,
        name: item.name,
        capacity: item.capacity || '',
        location: item.location || '',
        manager: item.manager || '',
        equipment: item.equipment || '',
        status: item.status || '',
        open: item.open || '',
      }))
  }else {
    getRoomInfoByDeptId(deptId)
  }

}

// 监听会议室选择变化
const handleRoomChange = (roomId) => {
  // 如果没有选择会议室，不做处理
  if (!roomId) {
    return
  }
  // 获取选中的会议室信息
  const selectedRoomInfo = roomOptions.value.find(room => room.id === roomId)
  if (selectedRoomInfo) {
    ElMessage({
      message: `已切换到会议室: ${selectedRoomInfo.name}`,
      type: 'success'
    })
  }
}

// 当前选中的会议室信息
const currentRoomInfo = computed(() => {
  const room = roomOptions.value.find(room => room.id === selectedRoom.value)
  if (room) {
    return {
      ...room
    }
  }
  return null
})

// 判断会议室是否开放
const isRoomOpen = computed(() => {
  const roomId = selectedRoom.value
  const room = roomOptions.value.find(room => room.id === roomId)
  return room?.open === 1
})

// 格式化当前日期显示
const currentDateDisplay = computed(() => {
  const date = selectedDate.value
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = weekdays[date.getDay()]

  return `${year}-${month}-${day} (${weekday})`
})

const roomCapacity = ref()
const roomLocation = ref()
const department = ref()

// 检查日期是否为今天
const isToday = (data) => {
  const today = new Date()
  const cellDate = new Date(data.day)
  return today.getDate() === cellDate.getDate() &&
         today.getMonth() === cellDate.getMonth() &&
         today.getFullYear() === cellDate.getFullYear()
}

// 检查日期是否有会议预定
const isBooked = (data) => {
  if (!bookedMeetings.value || !Array.isArray(bookedMeetings.value) || !selectedRoom.value) {
    return false
  }

  const dateStr = data.day

  // 检查这个日期是否有会议
  return bookedMeetings.value.some(meeting => {
    if (!meeting || !meeting.date) return false
    const meetingDate = meeting.date.split('T')[0]
    return meetingDate === dateStr && meeting.roomId === selectedRoom.value
  })
}

// 处理日期点击事件
const handleDateClick = (data) => {
  // 格式化所选日期用于显示
  const date = new Date(data.day)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayNum = String(date.getDate()).padStart(2, '0')
  selectedDateFormatted.value = `${year}-${month}-${dayNum}`
  loadAndFilter(data.day)
  // 打开时段选择对话框
  timeSlotDialogVisible.value = true
}

const loadAndFilter = async (selectedDate) => {
  try {
    await getBookedRoomTimeDetail(selectedDate)   // 第一步：获取已预订时间
    await getOccupiedRoomTimeDetail(selectedDate) // 第二步：获取已占用时间
    await getRoomTimeDetail()                     // 第三步：获取所有可用时间段
    await filterAvailablefilter(selectedDate)    // 第四步：根据前三步数据过滤
  } catch (error) {
    ElMessage.error('加载时间段失败')
  }
}



// 模拟屏幕尺寸响应式
const $screens = ref({
  sm: false
})


//跳转到会议室申请表页面
const GoToApplyForm = () => {
  // 获取当前选中的会议室信息
  const roomInfo = currentRoomInfo.value
  const selecedTime = availableTimeSlots.value.find(slot => slot.id === selectedTimeSlot.value)

  if (roomInfo) {
    // 将会议室信息存储到 sessionStorage
    sessionStorage.setItem('selectedRoomInfo', JSON.stringify({
      id: roomInfo.id,
      name: roomInfo.name,
      capacity: roomInfo.capacity,
      date: selectedDateFormatted.value,
      timeSlot: selectedTimeSlot.value,
      startTime: selecedTime.startTime,
      endTime: selecedTime.endTime,
      meetingRoomId: selectedRoom.value,
      meetingRoomTimeId: selecedTime.id
    }))
  }

  // 跳转到申请表页面
  router.push('/meetingroom/apply')
}

// 初始化数据
onMounted(() => {
  getDeptList() // 获取部门列表
  loadMeetings()
})

// 判断是否为过去日期
const isPastDate = (data) => {
  const today = new Date();
  const date = new Date(data.day);
  today.setHours(0, 0, 0, 0);  // 只保留日期部分
  date.setHours(0, 0, 0, 0);
  return date < today;
};

const availableTimeSlots = ref([]) // 存储时段数据
const occupiedTime = ref([]) // 存储占用记录数据

const getRoomTimeDetail = async () => {
  try {
    loading.value = true
    queryRoomTimeParams.meetingRoomId = selectedRoom.value
    const res = await RoomTimeApi.getRoomTimePage(queryRoomTimeParams)
    if (res && res.list) {
      res.list.forEach(item => {
        item.Alt = 1
      })
      availableTimeSlots.value = res.list
    }
  } catch (error) {
    ElMessage.error('加载时间段失败')
  } finally {
    loading.value = false
  }
}

const bookedTime = ref([])

const getBookedRoomTimeDetail = async (selectedDate) => {
  try {
    const startOfDay = dayjs(selectedDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const endOfDay = dayjs(selectedDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')

    const paramBookedroom = {
      meetingRoomId: selectedRoom.value,
      startTime: startOfDay,
      endTime: endOfDay
    }
    const res = await RoomApplyApi.getRoomApplyAll(paramBookedroom)
    bookedTime.value = res
    // 如果 API 返回的是 { code, data, msg } 结构

  } catch (error) {
    ElMessage.error('获取预订记录失败')
  }
}

// 获取指定日期的占用记录
const getOccupiedRoomTimeDetail = async (selectedDate) => {
  try {
    if (!selectedRoom.value) {
      occupiedTime.value = []
      return
    }

    let res
    const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD')

    try {
      res = await getOccupationsByMeetingRoom(selectedRoom.value)
    } catch (apiError) {
      if (apiError.response?.status === 403) {
        occupiedTime.value = []
        return
      }
      throw apiError
    }

    // 处理多种API响应格式
    let allOccupations = []
    if (res) {
      if (Array.isArray(res)) {
        // 直接是数组格式
        allOccupations = res
      } else if (res.code === 0 && res.data) {
        // CommonResult格式: { code: 0, data: [...], msg: "success" }
        allOccupations = Array.isArray(res.data) ? res.data : []
      } else if (res.data && Array.isArray(res.data)) {
        // { data: [...] } 格式
        allOccupations = res.data
      } else if (res.list && Array.isArray(res.list)) {
        // { list: [...] } 格式
        allOccupations = res.list
      }
    }

    if (allOccupations.length === 0) {
      occupiedTime.value = []
      return
    }

    // 总是进行日期过滤，确保只获取与选择日期相关的占用记录
    const selectedDateStart = dayjs(selectedDate).startOf('day').valueOf()
    const selectedDateEnd = dayjs(selectedDate).endOf('day').valueOf()

    const filteredOccupations = allOccupations.filter(occupation => {
      if (!occupation.startTime || !occupation.endTime) {
        return false
      }

      // 检查占用状态，只处理有效的占用记录
      if (occupation.status !== undefined && occupation.status !== 1) {
        return false
      }

      // 获取占用记录的时间戳
      let occupationStart, occupationEnd
      if (typeof occupation.startTime === 'number') {
        occupationStart = occupation.startTime
        occupationEnd = occupation.endTime
      } else {
        occupationStart = new Date(occupation.startTime).getTime()
        occupationEnd = new Date(occupation.endTime).getTime()
      }

      // 检查时间戳是否有效
      if (isNaN(occupationStart) || isNaN(occupationEnd)) {
        return false
      }

      // 检查占用时间段是否与选择日期有重叠
      // 使用时间重叠算法：occupation.end > day.start && occupation.start < day.end
      const hasOverlap = occupationEnd > selectedDateStart && occupationStart < selectedDateEnd

      return hasOverlap
    })

    // 转换为与bookedTime相同的格式，便于统一处理
    occupiedTime.value = filteredOccupations.map(occupation => {
      let startTime, endTime

      if (typeof occupation.startTime === 'number') {
        startTime = occupation.startTime
      } else {
        startTime = new Date(occupation.startTime).getTime()
      }

      if (typeof occupation.endTime === 'number') {
        endTime = occupation.endTime
      } else {
        endTime = new Date(occupation.endTime).getTime()
      }

      return {
        startTime,
        endTime,
        roomTimeId: occupation.roomTimeId,
        occupationType: occupation.occupationType,
        occupationReason: occupation.occupationReason || '管理员占用',
        isOccupation: true // 标记为占用记录
      }
    })


  } catch (error) {
    ElMessage.error('获取占用记录失败，可能影响时间段显示准确性')
    occupiedTime.value = []
  }
}

// 工具函数：将 "HH:mm:ss" 转换为当日毫秒时间戳
function getFullTimestamp(dateStr, timeStr) {
  const base = dayjs(dateStr).startOf('day').valueOf()
  const [h, m, s] = timeStr.split(':').map(Number)
  return base + ((h * 60 + m) * 60 + s) * 1000
}

// 工具函数：判断两个时间区间是否有交集
function isTimeSlotConflict(start1, end1, start2, end2) {
  return end1 > start2 && start1 < end2
}

// 工具函数：修复跨天占用记录，只保留指定日期内的部分
function fixCrossDayOccupation(occupation, selectedDate) {
  const selectedDateObj = new Date(selectedDate)
  const dayStart = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate()).getTime()
  const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1 // 当天23:59:59.999

  let startTime = occupation.startTime
  let endTime = occupation.endTime

  if (startTime < dayStart) {
    startTime = dayStart
  }

  if (endTime > dayEnd) {
    endTime = dayEnd
  }

  if (startTime >= endTime) {
    return null
  }

  return {
    ...occupation,
    startTime,
    endTime
  }
}

const filterAvailablefilter = async (selectedDate) => {
  for (const available of availableTimeSlots.value) {
    // 1. 生成 available 对应的起止时间戳（当天）
    const availableStart = getFullTimestamp(selectedDate, available.startTime)
    const availableEnd = getFullTimestamp(selectedDate, available.endTime)

    // 默认设置为可用
    available.Alt = 1
    available.conflictReason = '' // 记录冲突原因

    // 【原有逻辑】检查与已预订记录的冲突
    for (const booked of bookedTime.value) {
      // 2. 直接使用 booked 的时间戳
      const bookedStart = Number(booked.startTime)
      const bookedEnd = Number(booked.endTime)

      if (isTimeSlotConflict(availableStart, availableEnd, bookedStart, bookedEnd)) {
        // 有冲突
        available.Alt = 0
        available.conflictReason = '该时段已被预定'
        break
      }
    }

    // 【新增逻辑】如果没有预订冲突，再检查占用记录冲突
    if (available.Alt === 1) {
      for (const occupied of occupiedTime.value) {
        // 3. 直接使用 occupied 的时间戳
        const occupiedStart = Number(occupied.startTime)
        const occupiedEnd = Number(occupied.endTime)

        // 详细的时间比较日志
        const availableStartDate = new Date(availableStart)
        const availableEndDate = new Date(availableEnd)
        const occupiedStartDate = new Date(occupiedStart)
        const occupiedEndDate = new Date(occupiedEnd)

        if (isNaN(occupiedStart) || isNaN(occupiedEnd)) {
          continue
        }

        // 检查是否是批量占用（跨多天的占用）
        const occupiedDays = Math.ceil((occupiedEnd - occupiedStart) / (24 * 60 * 60 * 1000))
        const isBatchOccupation = occupiedDays > 1

        let hasConflict = false

        if (isBatchOccupation) {
          const occupiedStartTime = occupiedStartDate.getHours() * 60 + occupiedStartDate.getMinutes()
          const occupiedEndTime = occupiedEndDate.getHours() * 60 + occupiedEndDate.getMinutes()
          const availableStartTime = availableStartDate.getHours() * 60 + availableStartDate.getMinutes()
          const availableEndTime = availableEndDate.getHours() * 60 + availableEndDate.getMinutes()

          const overlapStart = Math.max(availableStartTime, occupiedStartTime)
          const overlapEnd = Math.min(availableEndTime, occupiedEndTime)
          const overlapMinutes = Math.max(0, overlapEnd - overlapStart)

          hasConflict = overlapMinutes > 10
        } else {
          hasConflict = isTimeSlotConflict(availableStart, availableEnd, occupiedStart, occupiedEnd)
        }

        if (hasConflict) {
          available.Alt = 0
          available.conflictReason = `该时段已被占用（${occupied.occupationReason || '管理员占用'}）`
          break
        }
      }
    }
  }
}

const meetingRoomList = ref()
</script>

<style scoped>
/* 未选择会议室时的提示样式 */
.empty-room-tip, .empty-meeting-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 10px 0;
}

.empty-meeting-tip {
  height: 150px;
}

.calendar-cell.disabled-date {
  pointer-events: none;
  color: #ccc;
  background-color: #f5f5f5;
  cursor: not-allowed;
  border-radius: 6px;
}

.application-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.application-table th,
.application-table td {
  padding: 10px 12px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #e0e0e0;
  white-space: normal;
  word-break: break-word;
  font-size: 14px;
}

.application-table th {
  background-color: #f7f7f7;
  font-weight: 600;
}

.meeting-list {
  overflow-x: auto;
  margin-bottom: 20px;
}

.no-meetings {
  text-align: center;
  margin-top: 20px;
  color: #999;
}
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: "Microsoft YaHei", sans-serif;
}

.room-card {
  padding: 0;
}

.calendar-cell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.calendar-day {
  font-size: 14px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.today-marker {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  background-color: #3498db;
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
}

.booked-marker {
  position: absolute;
  top: 2px;
  right: 2px;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: #3498db;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
}

.nav-link {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
}

.room-selector {
  min-width: 220px;
}

.settings-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1rem;
}
::v-deep(.black-text-picker .el-input__inner) {
  color: #000 !important;
  font-weight: 400 !important; /* 或 normal，表示常规/细字体 */
}

.main-content {
  display: flex;
  flex: 1;
  padding: 1rem;
  gap: 1rem;
}

.room-info-panel {
  flex: 0 0 350px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.room-status-header {
  padding: 0.7rem;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.room-card {
  padding: 0;
}

.room-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.room-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.room-status {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: #3498db;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.room-title {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.room-title h2 {
  margin: 0;
  font-size: 1.5rem;
}

.room-title p {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
}

.room-details {
  padding: 1rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.8rem;
  align-items: center;
}

.label {
  flex: 0 0 100px;
  color: #666;
  text-align: left;
}

.value {
  flex: 1;
  color: #333;
  text-align: left;
  margin-left: 0;
}

.new-meeting-btn {
  display: block;
  width: calc(100% - 2rem);
  margin: 0.5rem 1rem 1rem;
  padding: 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-meeting-btn:hover {
  background-color: #2980b9;
}

.calendar-panel {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.date-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: normal;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
  background-color: #f5f5f5;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

.calendar-container {
  margin: 1rem 0;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.gray {
  background-color: #bdc3c7;
}

.legend-dot.blue {
  background-color: #3498db;
}

.meeting-list-header {
  padding: 1rem 1rem 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.meeting-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.meeting-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #f5f5f5;
}

.meeting-time {
  flex: 0 0 120px;
  color: #333;
}

.meeting-content {
  flex: 1;
}

.meeting-title {
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.meeting-room {
  color: #666;
  margin-bottom: 0.3rem;
}

.meeting-participants {
  color: #666;
  font-size: 0.9rem;
}

.meeting-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 0.5rem;
  min-width: 100px;
}

.meeting-status.ended span {
  background-color: #f0f0f0;
  color: #95a5a6;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

.meeting-status.booked span {
  background-color: #3498db;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.all-apply{
  font-size: 15px !important;
  font-family:inherit !important;
  color:white;
  background-color: #4a90e2;
  border:none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .room-info-panel {
    flex: none;
    width: 100%;
  }
}


/* 自定义日历样式 */
:deep(.vc-container) {
  --day-content-transition-time: 0.1s;
  border: none;
  width: 100%;
}

/* 增加相邻月份之间的间距 */
:deep(.vc-pane) {
  padding: 0 15px;
}

:deep(.vc-weeks) {
  padding: 0;
}

:deep(.vc-day) {
  padding: 5px 0;
}

:deep(.vc-day-content) {
  font-weight: normal;
  height: 32px;
  width: 32px;
}

:deep(.vc-day-content:hover) {
  background-color: #f5f5f5;
}

:deep(.vc-weekday) {
  color: #666;
  font-weight: normal;
}

:deep(.vc-day.is-not-in-month) {
  opacity: 0.4;
}
:deep(.custom-input .el-input__inner) {
  color: #000000 !important;
  background-color: #ffffff !important;
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-shadow: none !important;
  border-color: #ccc !important;
}

:deep(.custom-input .el-input__inner::placeholder) {
  color: #999999 !important;
  opacity: 1 !important;
}
/* 头部导航栏整体布局优化 - 保持原背景色 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  min-height: 60px;
  /* 保持原来的背景色，不做修改 */
}

.filter-container {
  margin-bottom: 5px;
  margin-top: 5px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

/* 左侧区域 */
.left-section {
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 0 0 auto;
}

/* Logo样式 - 改为白色并加粗 */
.logo {
  font-size: 20px;
  font-weight: 700 !important;
  color: white !important;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 会议室选择器样式调整 */
.room-selector {
  min-width: 200px;
}

/* 导航按钮容器 - 居中并合理分配空间 */
.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex: 1;
  max-width: 800px;
  margin: 0 20px;
}


/* 导航按钮项样式 - 改为白色并加粗 */
.nav-button-item {
  font-size: 16px;
  font-weight: 700 !important;
  color: white !important;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  background-color: transparent;
  border: none;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-align: center;
}

.nav-button-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ecf0f1 !important;
  transform: translateY(-1px);
  font-weight: 700 !important;
}

.nav-button-item:active {
  transform: translateY(0);
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 700 !important;
}

/* 右侧设置区域 */
.settings {
  flex: 0 0 auto;
}

/* 设置按钮样式 - 改为白色并加粗 */
.settings-btn {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white !important;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 700 !important;
}

.el-picker-panel__body {
  background-color: white !important;
}

.settings-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ecf0f1 !important;
  font-weight: 700 !important;
}

.settings-btn i {
  color: white !important;
  margin-right: 5px;
  font-weight: 700 !important;
}

/* Element Plus 选择器样式覆盖 - 加粗 */
:deep(.el-select) {
  --el-select-input-color: white;
  --el-select-placeholder-color: rgba(255, 255, 255, 0.7);
}


:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.el-input__inner) {
  color: white !important;
  font-weight: 600 !important;
}

:deep(.el-select__caret) {
  color: white !important;
}

:deep(.el-select-dropdown__item) {
  font-weight: 600 !important;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .nav-buttons {
    gap: 30px;
  }

  .nav-button-item {
    font-size: 15px;
    padding: 8px 16px;
    font-weight: 700 !important;
  }
}

@media (max-width: 1200px) {
  .header {
    padding: 0 20px;
  }

  .nav-buttons {
    gap: 25px;
    margin: 0 15px;
  }

  .nav-button-item {
    font-size: 14px;
    padding: 6px 12px;
    font-weight: 700 !important;
  }

  .left-section {
    gap: 20px;
  }

  .logo {
    font-weight: 700 !important;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 15px 20px;
    min-height: auto;
  }

  .left-section {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 10px;
    margin: 0;
    width: 100%;
  }

  .nav-button-item {
    width: 100%;
    text-align: center;
    padding: 10px;
    font-weight: 700 !important;
  }

  .settings {
    margin-top: 15px;
  }

  .settings-btn {
    font-weight: 700 !important;
  }

  .logo {
    font-weight: 700 !important;
  }
}

.logo {
  font-weight: 700 !important;
}

:deep(.el-select__caret) {
  color: white !important;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .nav-buttons {
    gap: 30px;
  }

  .nav-button-item {
    font-size: 15px;
    padding: 8px 16px;
    font-weight: 700 !important;
  }
}

@media (max-width: 1200px) {
  .header {
    padding: 0 20px;
  }

  .nav-buttons {
    gap: 25px;
    margin: 0 15px;
  }

  .nav-button-item {
    font-size: 14px;
    padding: 6px 12px;
    font-weight: 700 !important;
  }

  .left-section {
    gap: 20px;
  }

  .logo {
    font-weight: 700 !important;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 15px 20px;
    min-height: auto;
  }

  .left-section {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 10px;
    margin: 0;
    width: 100%;
  }

  .nav-button-item {
    width: 100%;
    text-align: center;
    padding: 10px;
    font-weight: 700 !important;
  }

  .settings {
    margin-top: 15px;
  }

  .settings-btn {
    font-weight: 700 !important;
  }

  .logo {
    font-weight: 700 !important;
  }
}
.room-title {
  color: #000;
}
</style>

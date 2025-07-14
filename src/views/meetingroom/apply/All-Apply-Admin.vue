<template>
  <div class="booking-system-container">
    <div class="header">
      <div class="title-section">
        <h1>全 部 申 请</h1>
        <el-select 
          v-model="queryParams.roomName" 
          placeholder="全部会议室" 
          class="room-filter"
          clearable
          filterable
          @change="handleFilter"
        >
          <el-option 
            v-for="room in roomOptions" 
            :key="room.id" 
            :label="room.name" 
            :value="room.name" 
          />
        </el-select>
        
        <!-- 状态筛选下拉列表 -->
        <el-select
          v-model="queryParams.status"
          placeholder="审核状态"
          class="status-filter"
          clearable
          @change="handleStatusFilter"
        >
          <el-option label="全部" :value="''" />
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
      </div>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      height="calc(100vh - 200px)"
      v-loading="loading"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="conferenceRoom" label="会议室名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="activityTheme" label="主题" min-width="150" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号码" width="120" />
      <el-table-column prop="participants" label="参加人员及人数" min-width="150" show-overflow-tooltip />
      <el-table-column prop="adminPerson" label="管理员" width="100" />
      <el-table-column prop="status" label="审核状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 0"
            type="primary"
            size="small"
            @click="handleReview(row)"
          >
            审核
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            @click="handleReview(row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { RoomApplyApi } from '@/api/meetingroom/roomapply'
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const roomOptions = ref([])

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  roomName: undefined, // 会议室名称
  conferenceRoom: undefined, // 后端可能使用这个参数名来过滤会议室
  status: undefined,
  startTime: undefined,
  endTime: undefined,
  my: 0
})

// 状态映射
const statusMap = {
  0: { text: '待审核', type: 'warning' },
  1: { text: '已通过', type: 'success' },
  2: { text: '已拒绝', type: 'danger' },
  3: { text: '已取消', type: 'info' }
}

// 获取状态文本
const getStatusText = (status) => {
  return statusMap[status]?.text || '未知状态'
}

// 获取状态标签类型
const getStatusType = (status) => {
  return statusMap[status]?.type || ''
}

// 获取会议室列表
const getRoomList = async () => {
  try {
    const res = await RoomApplyApi.getAdminApply({ pageSize: 100 }) // 增加获取数量，确保获取更多会议室
    if (res && res.data && res.data.list) {
      roomOptions.value = res.data.list.map(item => ({
        id: item.id,
        name: item.conferenceRoom
      }))
    }
  } catch (error) {
    console.error('获取会议室列表失败:', error)
  }
}

// 从表格数据中提取会议室名称并添加到下拉列表中
const updateRoomOptionsFromTableData = () => {
  if (!tableData.value || tableData.value.length === 0) return
  
  // 获取表格中所有的会议室名称
  const roomNamesFromTable = tableData.value
    .filter(item => item.conferenceRoom) // 过滤掉没有会议室名称的数据
    .map(item => item.conferenceRoom) // 提取会议室名称
  
  // 当前下拉列表中的会议室名称
  const existingRoomNames = roomOptions.value.map(item => item.name)
  
  // 找出表格中存在但下拉列表中不存在的会议室名称
  const newRoomNames = [...new Set(roomNamesFromTable)].filter(
    name => !existingRoomNames.includes(name)
  )
  
  // 将新的会议室名称添加到下拉列表中
  if (newRoomNames.length > 0) {
    newRoomNames.forEach(name => {
      roomOptions.value.push({
        id: 'table_' + name, // 使用前缀区分从表格中提取的数据
        name: name
      })
    })
    
    // 按名称排序
    roomOptions.value.sort((a, b) => a.name.localeCompare(b.name))
    
  }
}

// 格式化数据项
const formatItem = (item) => {
  return {
    ...item,
    setupTime: item.setupTime ? Number(item.setupTime) : null,
    startTime: item.startTime ? Number(item.startTime) : null,
    endTime: item.endTime ? Number(item.endTime) : null,
    departmentApprovalDate: item.departmentApprovalDate ? Number(item.departmentApprovalDate) : null,
    adminApprovalDate: item.adminApprovalDate ? Number(item.adminApprovalDate) : null,
    createTime: item.createTime ? Number(item.createTime) : null
  }
}

// 格式化日期时间
const formatDateTime = (row, column, cellValue) => {
  if (!cellValue) return ''
  const timestamp = Number(cellValue)
  if (isNaN(timestamp)) return ''
  const date = timestamp.toString().length === 10 ? new Date(timestamp * 1000) : new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 获取申请列表
const getList = async () => {
  try {
    loading.value = true
    const res = await RoomApplyApi.getAdminApply(queryParams)
    tableData.value = res.list 
    total.value = res.total || 0
    updateRoomOptionsFromTableData()
  } catch (error) {
    ElMessage.error('获取申请列表失败: ' + (error.message || '未知错误'))
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理会议室筛选
const handleFilter = () => {
  queryParams.pageNo = 1
  if (queryParams.roomName) {
    queryParams.conferenceRoom = queryParams.roomName
  } else {
    queryParams.conferenceRoom = undefined
  }
  getList()
}

// 处理状态筛选
const handleStatusFilter = () => {
  queryParams.pageNo = 1
  getList()
}

// 处理每页显示数量变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  queryParams.pageNo = page
  getList()
}

const handleReview = (row) => {
  sessionStorage.setItem('currentApplyData', JSON.stringify(row))
  const baseUrl = window.location.origin
  const reviewUrl = `${baseUrl}/meeting/review?id=${row.id}&hideLayout=true&_=${Date.now()}`
  const windowFeatures = 'width=1000,height=800,top=100,left=100,scrollbars=yes,resizable=yes,status=yes'

  const windowName = `review_${row.id}_${Date.now()}`

  const newWindow = window.open(reviewUrl, windowName, windowFeatures)

  if (newWindow) {
    newWindow.focus()

    setTimeout(() => {
      try {
        newWindow.document.documentElement.style.overflow = 'auto'
        newWindow.document.body.style.overflow = 'auto'
        newWindow.focus()
      } catch (e) {
        console.log('无法直接修改新窗口样式，这是正常的安全限制')
      }
    }, 1000)
  }
}
const setupGlobalRefreshFunction = () => {
  window.refreshApplyList = () => {
    getList()
  }
}

// 初始化数据
onMounted(() => {
  getList()
  getRoomList()
  setupGlobalRefreshFunction()
})

// 表格样式
const headerCellStyle = {
  backgroundColor: '#0d3a8c',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'center'
}

const cellStyle = {
  padding: '5px',
  fontSize: '13px',
  textAlign: 'center'
}
</script>

<style>
.booking-system-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
}

.title-section h1 {
  margin: 0;
  margin-right: 20px;
  font-size: 24px;
  letter-spacing: 4px;
}

.room-filter, .status-filter {
  width: 200px;
  margin-left: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.pagination-container {
  padding: 16px 0;
  text-align: right;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  position: fixed;
  bottom: 0;
  right: 20px;
  left: 200px; /* 根据您的侧边栏宽度调整 */
  z-index: 10;
}

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: #dcdfe6;
  --el-table-header-bg-color: #0d3a8c;
  --el-table-header-text-color: white;
  --el-table-row-hover-bg-color: #f0f7ff;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f5f7fa;
}

:deep(.el-table .cell) {
  padding: 5px;
}

:deep(.el-button--small) {
  padding: 5px 10px;
  font-size: 12px;
}
</style>

<template>
  <div class="booking-system-container">
    <div class="header">
      <div class="title-section">
        <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="100px">
          <el-form-item label="审核状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="审核状态"
              class="!w-240px"
              clearable
            >
              <el-option label="全部" :value="undefined" />
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="2" />
              <el-option label="已拒绝" :value="3" />
              <el-option label="已取消" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="会议室" prop="roomName">
            <el-select
              v-model="queryParams.roomName"
              placeholder="全部会议室"
              class="!w-240px"
              clearable
              filterable
            >
              <el-option
                v-for="room in roomOptions"
                :key="room.id"
                :label="room.name"
                :value="room.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleQuery">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="content-card">
      <el-table
        :data="tableData"
        border
        stripe
        size="small"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
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
            <el-tag :type="getStatusType(row.status)" size="small">
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
              type="success"
              size="small"
              @click="handleReview(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="table-footer">
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
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
import { useUserStoreWithOut } from '@/store/modules/user'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const roomOptions = ref([])
const queryFormRef = ref()
const userStore = useUserStoreWithOut()

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
  2: { text: '已通过', type: 'success' },
  3: { text: '已拒绝', type: 'danger' },
  4: { text: '已取消', type: 'info' }
}

// 当前用户是否具备管理员查看权限
const isAdminUser = () => {
  const roles = userStore.getRoles || []
  return Array.isArray(roles) && (
    roles.includes('admin') ||
    roles.includes('super_admin') ||
    roles.includes('meeting_admin')
  )
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
    const tryParams = { pageNo: 1, pageSize: 100 }
    let list = []

    // 1) 管理接口（不带 my）
    try {
      const resAdmin = await RoomApplyApi.getAdminApply({ ...tryParams })
      list = Array.isArray(resAdmin?.list) ? resAdmin.list : []
    } catch {}

    // 2) 普通分页 my:0（全量）
    if (!list || list.length === 0) {
      try {
        const resAll = await RoomApplyApi.getRoomApplyPage({ ...tryParams, my: 0 })
        list = Array.isArray(resAll?.list) ? resAll.list : []
      } catch {}
    }

    // 3) 普通分页 my:1（仅本人）
    if (!list || list.length === 0) {
      try {
        const resMy = await RoomApplyApi.getRoomApplyPage({ ...tryParams, my: 1 })
        list = Array.isArray(resMy?.list) ? resMy.list : []
      } catch {}
    }

    roomOptions.value = (list || [])
      .filter(item => item && item.conferenceRoom)
      .map(item => ({ id: item.id, name: item.conferenceRoom }))
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
const normalizeParams = (raw) => {
  const p = { ...raw }
  // 统一状态参数：空值不传
  if (p.status === '' || p.status === null || p.status === undefined) delete p.status
  // 统一会议室参数：使用后端认可的 conferenceRoom
  if (p.roomName) p.conferenceRoom = p.roomName
  delete p.roomName // 仅保留 conferenceRoom
  // 清理空值字段，避免传 "undefined" 导致后端过滤
  Object.keys(p).forEach((k) => {
    const v = p[k]
    if (v === '' || v === undefined || v === null) {
      delete p[k]
    }
  })
  return p
}

const getList = async () => {
  try {
    loading.value = true
    const baseParams = normalizeParams({ ...queryParams })

    let list = []
    let totalCount = 0

    // 1) 管理接口（不带 my）
    try {
      const resAdmin = await RoomApplyApi.getAdminApply({ ...baseParams })
      list = Array.isArray(resAdmin?.list) ? resAdmin.list : []
      totalCount = typeof resAdmin?.total === 'number' ? resAdmin.total : 0
    } catch {}

    // 2) 普通分页 my:0（全量）
    if (!list || list.length === 0) {
      try {
        const resAll = await RoomApplyApi.getRoomApplyPage({ ...baseParams, my: 0 })
        list = Array.isArray(resAll?.list) ? resAll.list : list
        totalCount = typeof resAll?.total === 'number' ? resAll.total : totalCount
      } catch {}
    }

    // 3) 普通分页 my:1（仅本人）
    if (!list || list.length === 0) {
      try {
        const resMy = await RoomApplyApi.getRoomApplyPage({ ...baseParams, my: 1 })
        list = Array.isArray(resMy?.list) ? resMy.list : list
        totalCount = typeof resMy?.total === 'number' ? resMy.total : totalCount
      } catch {}
    }

    // 4) 如果仍为空，逐步放宽筛选条件再尝试一次
    if ((!list || list.length === 0) && (baseParams.conferenceRoom || baseParams.status !== undefined)) {
      const relaxedParamsList = []
      const withoutRoom = { ...baseParams }
      delete withoutRoom.conferenceRoom
      relaxedParamsList.push(withoutRoom)

      const withoutStatus = { ...baseParams }
      delete withoutStatus.status
      relaxedParamsList.push(withoutStatus)

      const withoutBoth = { ...baseParams }
      delete withoutBoth.conferenceRoom
      delete withoutBoth.status
      relaxedParamsList.push(withoutBoth)

      for (const p of relaxedParamsList) {
        try {
          const resAdmin2 = await RoomApplyApi.getAdminApply({ ...p })
          const l2 = Array.isArray(resAdmin2?.list) ? resAdmin2.list : []
          if (l2.length > 0) { list = l2; totalCount = typeof resAdmin2?.total === 'number' ? resAdmin2.total : l2.length; break }
        } catch {}
        try {
          const resAll2 = await RoomApplyApi.getRoomApplyPage({ ...p, my: 0 })
          const l3 = Array.isArray(resAll2?.list) ? resAll2.list : []
          if (l3.length > 0) { list = l3; totalCount = typeof resAll2?.total === 'number' ? resAll2.total : l3.length; break }
        } catch {}
        try {
          const resMy2 = await RoomApplyApi.getRoomApplyPage({ ...p, my: 1 })
          const l4 = Array.isArray(resMy2?.list) ? resMy2.list : []
          if (l4.length > 0) { list = l4; totalCount = typeof resMy2?.total === 'number' ? resMy2.total : l4.length; break }
        } catch {}
      }
    }

    tableData.value = list || []
    total.value = totalCount || 0
    updateRoomOptionsFromTableData()
  } catch (error) {
    ElMessage.error('获取申请列表失败: ' + (error?.message || '未知错误'))
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

// 搜索与重置（表单风格对齐）
const handleQuery = () => {
  queryParams.pageNo = 1
  handleFilter()
  getList()
}

const resetQuery = () => {
  if (queryFormRef?.value?.resetFields) {
    queryFormRef.value.resetFields()
  } else {
    queryParams.roomName = undefined
    queryParams.conferenceRoom = undefined
    queryParams.status = undefined
  }
  queryParams.pageNo = 1
  getList()
}

// const handleReview = (row) => {
//   sessionStorage.setItem('currentApplyData', JSON.stringify(row))
//   const baseUrl = window.location.origin
//   const reviewUrl = `${baseUrl}/meetingroom/review?id=${row.id}&hideLayout=true&_=${Date.now()}`
//   const windowFeatures = 'width=1000,height=800,top=100,left=100,scrollbars=yes,resizable=yes,status=yes'

//   const windowName = `review_${row.id}_${Date.now()}`

//   const newWindow = window.open(reviewUrl, windowName, windowFeatures)

//   if (newWindow) {
//     newWindow.focus()

//     setTimeout(() => {
//       try {
//         newWindow.document.documentElement.style.overflow = 'auto'
//         newWindow.document.body.style.overflow = 'auto'
//         newWindow.focus()
//       } catch (e) {
//         console.log('无法直接修改新窗口样式，这是正常的安全限制')
//       }
//     }, 1000)
//   }
// }

const handleReview = (row) => {
  try {
    // 跳转到详情页面，传递ID参数
    router.push({
      path: '/bpm/process-instance/detail',
      query: { id: row.processInstanceId }
    });
  } catch (error) {
    console.error('跳转失败:', error);
    ElMessage.error('查看详情失败，请重试');
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
  backgroundColor: '#f8f9fa',
  color: '#495057',
  fontWeight: '600',
  fontSize: '13px',
  padding: '8px 6px',
  textAlign: 'center',
  borderBottom: '1px solid #e8e8e8'
}

const cellStyle = {
  padding: '8px 6px',
  fontSize: '13px',
  textAlign: 'center',
  borderBottom: '1px solid #f0f0f0'
}
</script>

<style>
.booking-system-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: "Microsoft YaHei", sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 标题已移除，保留样式占位避免抖动 */

.room-filter, .status-filter { width: 200px; }

.ml-12 { margin-left: 12px; }
.ml-8 { margin-left: 8px; }

/* 选择器保持默认浅灰边框，移除定制色，风格与参考一致 */

.action-buttons {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  position: fixed;
  bottom: 0;
  right: 20px;
  left: 200px; /* 根据您的侧边栏宽度调整 */
  z-index: 10;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination {
  display: flex;
  align-items: center;
}

.content-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 8px;
}

/* 分页器样式统一 */
::deep(.el-pagination .el-pager li.is-active) {
  background-color: #4a90e2;
  color: white;
}

::deep(.el-pagination .btn-prev:hover),
::deep(.el-pagination .btn-next:hover) {
  color: #4a90e2;
}

/* 表格样式 */
::deep(.el-table) {
  --el-table-border-color: #e9ecef;
  --el-table-header-bg-color: #f8f9fa;
  --el-table-header-text-color: #495057;
  --el-table-row-hover-bg-color: #e3f2fd;
}

::deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f5f7fa;
}

::deep(.el-table .cell) {
  padding: 8px 6px;
}

::deep(.el-button--small) {
  padding: 5px 10px;
  font-size: 12px;
}

/* 按钮样式统一 */
::deep(.el-button--primary) {
  background-color: #4a90e2;
  border-color: #4a90e2;
}

::deep(.el-button--primary:hover) {
  background-color: #357abd;
  border-color: #357abd;
}

::deep(.el-button--primary:active) {
  background-color: #2e6da4;
  border-color: #2e6da4;
}
</style>

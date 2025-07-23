<template>
  <div class="supervision-management">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">>" class="breadcrumb">
      <el-breadcrumb-item>当前位置: 督查督办</el-breadcrumb-item>
      <el-breadcrumb-item>工作督办</el-breadcrumb-item>
      <!-- <el-breadcrumb-item>上级部门督办</el-breadcrumb-item> -->
    </el-breadcrumb>

    <div class="content-wrapper">
      <!-- 操作按钮区域 -->
      <div class="action-bar">
        <div class="action-buttons">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建</el-button>
          <el-button :icon="Edit">修改</el-button>
          <el-button :icon="Delete" type="danger">删除</el-button>
          <el-button :icon="Download">导出</el-button>
          <el-button :icon="Bell" type="warning">提醒</el-button>
        </div>
        
        <div class="search-area">
          <div class="search-item">
            <span class="search-label">督办内容:</span>
            <el-input v-model="searchForm.content" placeholder="请输入" style="width: 150px;" />
          </div>
          <div class="search-item">
            <span class="search-label">督办编号:</span>
            <el-input v-model="searchForm.number" placeholder="请输入" style="width: 150px;" />
          </div>
          <div class="search-item">
            <span class="search-label">承办单位:</span>
            <el-select
              v-model="searchForm.unit"
              placeholder="全部"
              style="width: 180px;"
              popper-class="dept-select-dropdown"
              :teleported="false"
            >
              <el-option label="全部" value="all" />
              <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
              />
            </el-select>
          </div>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
      </div>

      <!-- 标签页和排序 -->
      <div class="tab-sort-area">
        <el-tabs v-model="activeTab" class="tabs custom-tabs">
          <el-tab-pane label="流程中" name="processing" />
          <el-tab-pane label="结办文件" name="completed" />
          <el-tab-pane label="否决文件" name="rejected" />
        </el-tabs>
        
        <div class="sort-area">
          <div class="sort-item">
            <span>排序字段:</span>
            <el-select v-model="sortField" style="width: 120px;">
              <el-option label="创建时间" value="createTime" />
              <el-option label="完成期限" value="deadline" />
              <el-option label="督办编号" value="number" />
            </el-select>
          </div>
          <div class="sort-item">
            <span>排序方式:</span>
            <el-select v-model="sortOrder" style="width: 100px;">
              <el-option label="倒序" value="desc" />
              <el-option label="正序" value="asc" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="currentPageData" style="width: 100%" @selection-change="handleSelectionChange" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="orderCode" label="督办编号" min-width="120" />
        <el-table-column prop="orderTitle" label="督办内容" min-width="150" />
        <el-table-column label="承办单位" min-width="100">
          <template #default="{ row }">
            {{ getDeptName(row.leadDept) }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="完成期限" min-width="120">
          <template #default="{ row }">
            {{ row.deadline ? formatDate(row.deadline) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="登记日期" min-width="100">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="处理用户" min-width="120">
          <template #default="{ row }">
            {{ getParticipantUsers(row.participantUsers) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default>
            <el-button type="primary" link>详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          共 {{ currentTabTotal }} 条记录 第 {{ pagination.pageNo }} / {{ Math.ceil(currentTabTotal / pagination.pageSize) || 1 }} 页
        </div>
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="prev, pager, next, sizes, jumper"
          :total="currentTabTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
        <div class="pagination-actions">
          <el-button type="primary" @click="handleSearch">刷新</el-button>
          <el-button @click="pagination.pageNo = 1; handleCurrentChange(1)">回到第一页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus, Edit, Delete, Download, Bell } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { OrderApi } from '@/api/supervision'
import type { OrderPageReqVO, OrderRespVO } from '@/api/supervision'
import { getSimpleDeptList, type DeptVO } from '@/api/system/dept'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 搜索表单
const
  searchForm = reactive({
  content: '',
  number: '',
  unit: 'all'
})

// 当前激活的标签页
const activeTab = ref('processing')

// 排序
const sortField = ref('createTime')
const sortOrder = ref('desc')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 数据加载状态
const loading = ref(false)

// 部门列表
const deptList = ref<DeptVO[]>([])

// 日期格式化函数
const formatDate = (timestamp: number | string) => {
  if (!timestamp) return '-'
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 根据部门ID获取部门名称
const getDeptName = (deptId: number | null) => {
  if (!deptId) return '未分配'
  const dept = deptList.value.find(item => item.id === deptId)
  return dept?.name || '未知部门'
}

// 获取处理用户显示文本
const getParticipantUsers = (participantUsers: any[]) => {
  if (!participantUsers || participantUsers.length === 0) {
    return '无处理用户'
  }

  // 提取所有用户的nickname并用逗号连接
  const nicknames = participantUsers.map(user => user.nickname).filter(Boolean)

  if (nicknames.length === 0) {
    return '无处理用户'
  }

  // 如果用户较多，只显示前3个，后面用省略号
  if (nicknames.length > 3) {
    return nicknames.slice(0, 3).join(', ') + '...'
  }

  return nicknames.join(', ')
}

// 所有数据
const allData = ref<OrderRespVO[]>([])

// 分页信息
const pagination = reactive({
  total: 0,
  pageNo: 1,
  pageSize: 20
})

// 获取部门列表
const fetchDeptList = async () => {
  try {
    deptList.value = await getSimpleDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  }
}

// 获取督办单数据
const fetchOrderData = async () => {
  try {
    loading.value = true

    const params: OrderPageReqVO = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      type: 1 // 工作督办类型
    }

    // 添加搜索条件
    if (searchForm.content) {
      params.content = searchForm.content
    }
    if (searchForm.number) {
      params.orderCode = searchForm.number
    }
    if (searchForm.unit && searchForm.unit !== 'all') {
      params.leadDept = searchForm.unit
    }

    // 不向后端传递状态过滤参数，在前端处理

    const response = await OrderApi.getOrderPage(params)

    if (response && response.list) {
      allData.value = response.list
      pagination.total = response.total || 0
    } else {
      allData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取督办单数据失败:', error)
    ElMessage.error('获取数据失败')
    allData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 根据状态过滤数据（前端过滤）
const getDataByStatus = (status: string) => {
  const statusMap = {
    'processing': '流程中',
    'completed': '结办文件',
    'rejected': '否决文件'
  }
  return allData.value.filter(item => {
    return item.supervisionStatus === statusMap[status]
  })
}

// 根据当前标签页显示对应数据
const currentTableData = computed(() => {
  return getDataByStatus(activeTab.value)
})

// 当前标签页的分页数据
const currentPageData = computed(() => {
  const filteredData = currentTableData.value
  const startIndex = (pagination.pageNo - 1) * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  return filteredData.slice(startIndex, endIndex)
})

// 当前标签页的总数据量
const currentTabTotal = computed(() => {
  return currentTableData.value.length
})

// 选中的行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 处理页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  pagination.pageSize = size
  pagination.pageNo = 1
  // 不需要重新获取数据，只需要重新计算分页
}

// 处理当前页变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  pagination.pageNo = page
  // 不需要重新获取数据，只需要重新计算分页
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchOrderData()
}

// 处理新建督办单
const handleCreate = () => {
  router.push({
    path: '/supervision/create',
    query: {
      from: 'work_supervision',
      type: 'work'
    }
  })
}

// 监听标签页变化
watch(activeTab, () => {
  // 标签页变化时重置到第一页
  pagination.pageNo = 1
})

// 组件挂载时获取数据
onMounted(async () => {
  await fetchDeptList()
  await fetchOrderData()
})
</script>

<style scoped>
.supervision-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
  color: #999;
}

.content-wrapper {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.search-label {
  white-space: nowrap;
  color: #666;
}

.tab-sort-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.tabs {
  flex: 1;
}

.sort-area {
  display: flex;
  gap: 20px;
  align-items: center;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

/* 自定义标签页样式 - 加大加粗字体 */
:deep(.custom-tabs .el-tabs__item) {
  font-size: 16px !important;
  font-weight: bold !important;
  padding: 0 20px !important;
  height: 50px !important;
  line-height: 50px !important;
}

:deep(.custom-tabs .el-tabs__nav) {
  height: 50px !important;
}

:deep(.custom-tabs .el-tabs__active-bar) {
  height: 3px !important;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  width: 100% !important;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

/* 修复承办单位下拉框定位问题 */
:deep(.dept-select-dropdown) {
  z-index: 9999 !important;
}

:deep(.el-select-dropdown) {
  z-index: 9999 !important;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-area {
    justify-content: center;
  }
  
  .tab-sort-area {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .sort-area {
    justify-content: center;
  }
  
  .pagination-wrapper {
    flex-direction: column;
    align-items: center;
  }

  :deep(.custom-tabs .el-tabs__item) {
    font-size: 14px !important;
    padding: 0 15px !important;
  }
}
</style>

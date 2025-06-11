<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />

    <div class="content-body">
      
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" />
      
      <el-empty description="暂无请假文件" v-if="!loading && leaveDocs.length === 0" />
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-if="!loading && leaveDocs.length > 0">
        <el-table :data="leaveDocs" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="leaveType" label="请假类型" width="100" align="center" />
          <el-table-column prop="startTime" label="开始时间" width="160" align="center" />
          <el-table-column prop="endTime" label="结束时间" width="160" align="center" />
          <el-table-column prop="duration" label="时长" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="approver" label="审批人" width="100" align="center" />
          <el-table-column prop="submitTime" label="提交时间" width="160" align="center" />
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from './NavBar.vue'
import SearchBar from './SearchBar.vue'
import circulationApi from '../../api/circulation'

const currentComponent = ref('LeaveDocComponent')

// 分页相关状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  loadLeaveDocs()
}

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置到第一页
  loadLeaveDocs()
}

// 处理组件切换
const handleComponentChange = (componentName: string) => {
  console.log('切换到组件：', componentName)
  currentComponent.value = componentName
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '待审批': 'warning',
    '已批准': 'success',
    '已拒绝': 'danger',
    '已撤回': 'info'
  }
  return typeMap[status] || 'info'
}

const leaveDocs = ref<any[]>([])

// 请假文件数据状态
const loading = ref(false)

// 搜索参数
const searchParams = ref({
  fileName: ''
})

// 处理搜索
const handleSearch = (params: any) => {
  console.log('搜索参数:', params)
  searchParams.value = params
  pagination.value.currentPage = 1 // 搜索时重置到第一页
  loadLeaveDocs()
}

// 处理重置
const handleReset = () => {
  searchParams.value = {
    fileName: ''
  }
  loadLeaveDocs()
}

// 加载请假文件数据
const loadLeaveDocs = async () => {
  loading.value = true
  try {
    // 从 API 获取数据
    const { currentPage, pageSize } = pagination.value
    
    const res = await circulationApi.getLeaveDocuments({
      pageNo: currentPage,
      pageSize: pageSize
    })
    
    if (res.code === 0 && res.data) {
      leaveDocs.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      console.error('获取请假文件失败:', res.message)
      leaveDocs.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('获取请假文件失败:', error)
    leaveDocs.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLeaveDocs()
})
</script>

<style scoped>
.content-section {
  margin-top: 3px;
}

.content-body {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.component-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.loading-container {
  padding: 20px 0;
}
</style>

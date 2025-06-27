<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />
    <div class="content-body">
     
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" />
      
      <el-empty description="暂无校内文件" v-if="!loading && internalDocs.length === 0" />
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-if="!loading && internalDocs.length > 0">
        <el-table :data="internalDocs" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="文件名称" min-width="200" show-overflow-tooltip>
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="handleProcess(scope.row)"
              >
                {{ scope.row.documentName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="流转状态" width="260">
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="viewCirculationHistory(scope.row)"
              >
                {{ scope.row.typeName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="来文单位" width="150" align="center" />
          <el-table-column prop="userName" label="联系人" width="100" align="center">
            <template #default="scope">
              {{ scope.row.userName || '无' }}
            </template>
          </el-table-column>
          <el-table-column prop="mobile" label="电话" width="120" align="center">
            <template #default="scope">
              {{ scope.row.mobile || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="提交时间" width="160" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.startTime) }}
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleProcess(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
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
import NavBar from '@/components/document/NavBar.vue'
import SearchBar from '@/components/document/SearchBar.vue'
import * as circulationApi from '@/api/document/circulation'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 格式化日期的工具函数
const formatDate = (timestamp: number) => {
  if (!timestamp) return '无';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const currentComponent = ref('InternalDocComponent')

// 分页相关状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchInternalDocs()
}

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置到第一页
  fetchInternalDocs()
}

// 处理组件切换
const handleComponentChange = (componentName: string) => {
  console.log('切换到组件：', componentName)
  
  // 如果是当前组件，不做任何操作
  if (componentName === currentComponent.value) {
    return
  }
  
  // 根据组件名称进行路由跳转
  switch (componentName) {
    case 'TodoComponent':
      router.push({ name: 'gwlztodo' })
      break
    case 'AllDocComponent':
      router.push({ name: 'mygwlzall' })
      break
    case 'InternalDocComponent':
      router.push({ name: 'myxiaonei' })
      break
    case 'ExternalDocComponent':
      router.push({ name: 'myxiaowai' })
      break
    case 'SchoolDocComponent':
      router.push({ name: 'myxuexiao' })
      break
    case 'LeaveDocComponent':
      router.push({ name: 'myqingjia' })
      break
    case 'DeptDocComponent':
      router.push({ name: 'mydept' })
      break
    case 'FavoriteDocComponent':
      router.push({ name: 'myfactvion' })
      break
    default:
      // 默认跳转到待办组件
      router.push({ name: 'gwlztodo' })
  }
}

// 校内文件数据
const internalDocs = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 搜索参数
const searchParams = ref({
  fileName: '',
  sourceUnit: '',
  contact: '',
  phone: '',
  searchType: 'fuzzy' // 默认为模糊搜索
})

// 处理搜索
const handleSearch = (params: any) => {
  console.log('搜索参数:', params)
  
  // 更新搜索参数
  searchParams.value = { ...params }
  
  // 重置分页到第一页
  pagination.value.currentPage = 1
  
  // 加载数据（会带上搜索参数）
  fetchInternalDocs()
}

// 处理重置
const handleReset = () => {
  console.log('重置搜索')
  
  // 重置搜索参数
  searchParams.value = {
    fileName: '',
    sourceUnit: '',
    contact: '',
    phone: '',
    searchType: 'fuzzy'
  }
  
  // 重置分页
  pagination.value.currentPage = 1
  
  // 重新加载数据
  fetchInternalDocs()
}

// 获取校内文件数据
const fetchInternalDocs = async () => {
  loading.value = true
  try {
    // 从 API 获取数据
    const { currentPage, pageSize } = pagination.value
    
    // 构建API请求参数
    const params: any = {
      pageNo: currentPage,
      pageSize: pageSize
    }
    
    // 添加搜索参数（如果有）
    if (searchParams.value.fileName) {
      params.documentName = searchParams.value.fileName
    }
    
    if (searchParams.value.sourceUnit) {
      params.deptName = searchParams.value.sourceUnit
    }
    
    if (searchParams.value.contact) {
      params.userName = searchParams.value.contact
    }
    
    if (searchParams.value.phone) {
      params.mobile = searchParams.value.phone
    }
    
    // 如果需要，可以添加搜索类型参数
    if (searchParams.value.searchType) {
      params.type = searchParams.value.searchType === 'exact' ? 3 : 1
    }
    
    console.log('发送请求参数:', params)
    
    const res = await circulationApi.getSchoolDocuments(params)
    
    
      internalDocs.value = res.list || []
      pagination.value.total = res.total || 0
      
      console.log('获取到的校内文件列表：', internalDocs.value)
    
      
    
  } catch (error) {
    console.error('获取校内文件失败:', error)
    ElMessage.error('获取校内文件失败')
    internalDocs.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// 处理文件处理操作，在新窗口打开DocumentApproval.vue页面
const router = useRouter()

const handleProcess = (row: any) => {
  // 方案1：直接使用路由的完整路径
  const fullPath = router.resolve({
    name: 'documentApproval',
    query: { id: row.id, type: 2 }
  }).href
  
  // 方案2：或者使用相对路径（如果应用部署在根目录）
  const relativePath = `/documentApproval?id=${row.id}&type=2`
  
  try {
    console.log('尝试打开路径:', fullPath)
    
    const newWindow = window.open(
      fullPath, 
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口或检查浏览器设置')
      // 备选方案：在当前窗口打开
      router.push({ name: 'documentApproval', query: { id: row.id, type: 2 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('打开失败，请重试')
  }
}

// 查看流转历史的函数
const viewCirculationHistory = (row: any) => {
  console.log('查看流转历史:', row)
  
  try {
    // 根据路由配置生成完整路径
    const fullPath = router.resolve({
      path: '/document/history',
      query: { 
        documentId: row.id,
        circulationId: row.circulationId
      }
    }).href
    
    // 在新窗口打开流转历史页面
    const newWindow = window.open(
      fullPath, 
      '_blank',
      'width=1000,height=700,left=150,top=150,resizable=yes,scrollbars=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口或检查浏览器设置')
      // 备选方案：在当前窗口打开
      router.push({ 
        path: '/document/history',
        query: { 
          documentId: row.id,
          circulationId: row.circulationId
        }
      })
    }
  } catch (error) {
    console.error('打开流转历史失败:', error)
    ElMessage.error('打开流转历史失败，请重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchInternalDocs()
})
  </script>

<style scoped>
.content-section {
  margin-top: 3px;
}

.content-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
}

.content-body {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

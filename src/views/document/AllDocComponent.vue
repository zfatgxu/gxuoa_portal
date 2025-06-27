<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />
    
    <!-- 根据当前选中的组件显示不同的内容 -->
    <div v-if="currentComponent === 'AllDocComponent'" class="content-body">
     
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" :loading="loading" />

      <!-- 搜索后无结果时显示提示 -->
      <div v-if="hasSearched && allDocs.length === 0 && !loading" class="no-result">
        <el-empty description="暂无匹配的搜索结果" />
      </div>
      
      <!-- 未搜索但公文列表为空 -->
      <el-empty description="暂无公文数据" v-else-if="!hasSearched && allDocs.length === 0" />
      
      <!-- 有公文数据时显示列表 -->
      <div v-else>
        <el-table :data="allDocs" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="文件名称" min-width="200" show-overflow-tooltip>
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="handleView(scope.row)"
              >
                {{ scope.row.documentName }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="deptName" label="来源单位" width="120" align="center" />
          <el-table-column prop="typeName" label="流转状态" width="150" align="center">
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="viewCirculationHistory(scope.row)"
              >
                {{ scope.row.typeName || '无' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="联系人" width="120" align="center">
            <template #default="scope">
              {{ scope.row.userName || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="电话" width="120" align="center">
            <template #default="scope">
              {{ scope.row.mobile || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
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
            :pager-count="5"
          />
        </div>
      </div>
    </div>
    
    <!-- 其他组件的占位内容 -->
    <div v-else class="content-body">
      <h3 class="component-title">{{ getComponentTitle() }}</h3>
      <el-empty :description="`暂无${getComponentTitle()}数据`" />
    </div>
  </div>  
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/document/NavBar.vue'
import SearchBar from '@/components/document/SearchBar.vue'
import * as circulationApi from '@/api/document/circulation'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 当前选中的组件
const currentComponent = ref('AllDocComponent')

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

// 获取组件标题
const getComponentTitle = () => {
  switch (currentComponent.value) {
    case 'AllDocComponent':
      return '全部公文'
    case 'DraftComponent':
      return '草稿箱'
    case 'DoneComponent':
      return '已办公文'
    case 'SendComponent':
      return '发文管理'
    default:
      return '公文'
  }
}

const router = useRouter()

// 处理查看文件
// 查看文件详情
const handleView = (doc: any) => {
  console.log('查看文件：', doc)
  
  // 构建完整路径
  const fullPath = router.resolve({
    name: 'documentApproval',
    query: { id: doc.id }
  }).href
  
  try {
    console.log('尝试打开路径:', fullPath)
    
    // 在新窗口打开
    const newWindow = window.open(
      fullPath, 
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes'
    )
    
    // 检查是否成功打开新窗口
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口或检查浏览器设置')
      // 备选方案：在当前窗口打开
      router.push({ name: 'documentApproval', query: { id: doc.id } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('打开失败，请重试')
  }
}

// 查看流转历史记录
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
    console.error('打开流转历史页面失败:', error)
    ElMessage.error('打开流转历史页面失败，请重试')
  }
}

// 分页相关状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索参数
const searchParams = ref({
  fileName: '',
  sourceUnit: '',
  contact: '',
  phone: '',
  searchType: 'fuzzy' // 默认为模糊搜索
})

// 标记是否已经搜索过
const hasSearched = ref(false)

// 是否正在加载
const loading = ref(false)

// 原始数据列表（从后端获取的完整数据）
const originalAllDocs = ref([])

// 显示的数据列表（经过过滤的数据）
const allDocs = ref([])

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  loadAllDocs()
}

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置到第一页
  loadAllDocs()
}

// 处理搜索
const handleSearch = (params: any) => {
  console.log('搜索参数:', params)
  
  // 更新搜索参数
  searchParams.value = { ...params }
  
  // 标记已经搜索过
  hasSearched.value = true
  
  // 重置分页到第一页
  pagination.value.currentPage = 1
  
  // 加载数据（会带上搜索参数）
  loadAllDocs()
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
  
  // 重置搜索状态
  hasSearched.value = false
  
  // 重置分页
  pagination.value.currentPage = 1
  
  // 重新加载数据
  loadAllDocs()
}

// 加载全部公文数据
const loadAllDocs = async () => {
  loading.value = true // 开始加载
  try {
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
    
    // // 如果需要，可以添加搜索类型参数
    // if (searchParams.value.searchType) {
    //   params.type = searchParams.value.searchType === 'exact' ? 3 : 1
    // }
    
    console.log('发送请求参数:', params)
    
    // 调用获取全部公文的API
    const res = await circulationApi.getAllSchoolDocuments(params)
    
    // 处理响应数据
    
      // 更新数据列表和总数
      allDocs.value = res.list || []
      pagination.value.total = res.total || 0
      
      console.log('获取到的公文列表：', allDocs.value)
    
      
    
  } catch (error) {
    // 处理异常情况
    console.error('获取全部公文失败:', error)
    allDocs.value = []
    pagination.value.total = 0
    
    // 显示错误消息
    ElMessage.error('获取公文列表失败，请稍后重试')
  } finally {
    loading.value = false // 结束加载
  }
}

onMounted(() => {
  loadAllDocs()
  
  // 添加消息监听，用于接收子窗口的刷新请求
  window.addEventListener('message', handleWindowMessage)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('message', handleWindowMessage)
})

// 处理窗口消息
const handleWindowMessage = (event) => {
  console.log('收到窗口消息:', event.data)
  
  // 检查消息类型
  if (event.data && event.data.type === 'refreshAllDocList') {
    console.log('收到刷新公文列表的请求，正在刷新...')
    // 刷新公文列表
    loadAllDocs()
  }
}
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
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.component-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.no-result {
  margin: 20px 0;
  text-align: center;
}
</style>

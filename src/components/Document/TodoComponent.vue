<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />
    
    <!-- 根据当前选中的组件显示不同的内容 -->
    <div v-if="currentComponent === 'TodoComponent'" class="content-body">
      <h3 class="component-title">我的待办</h3>
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" />
      
      <el-empty description="暂无待办事项" v-if="todoList.length === 0" />
      <div v-else>
        <el-table :data="todoList" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="文件名称" min-width="180" show-overflow-tooltip>
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="handleProcess(scope.row)"
              >
                {{ scope.row.documentName }}
              </span>
              <el-tag v-if="scope.row.isUrgent" type="danger" size="small" effect="plain" style="margin-left: 5px">急</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="到达时间" width="150" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.startTime || scope.row.updateTime) }}
            </template>
          </el-table-column>
          <!-- 流转状态列已移除 -->
          <el-table-column label="流转类型" width="300" align="center">
            <template #default="scope">
              <span 
                style="cursor: pointer; color: #409EFF; text-decoration: underline;" 
                @click="viewCirculationHistory(scope.row)"
              >
                {{ scope.row.typeName || getCirculationTypeName(scope.row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="来文单位" width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="userName" label="联系人" width="100" align="center">
            <template #default="scope">
              {{ scope.row.userName || '无' }}
            </template>
          </el-table-column>
          <el-table-column label="电话" width="120" align="center">
            <template #default="scope">
              {{ scope.row.mobile || '无' }}
            </template>
          </el-table-column>
          <!-- 紧急程度已移至文件名称后 -->
          <!-- 文件编号列已移除 -->
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleProcess(scope.row)">处理</el-button>
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
import NavBar from './NavBar.vue'
import SearchBar from './SearchBar.vue'
import circulationApi from '@/api/circulation'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'



const currentComponent = ref('TodoComponent')

// 处理组件切换
const handleComponentChange = (componentName: string) => {
  console.log('切换到组件：', componentName)
  currentComponent.value = componentName
}

// 获取组件标题
const getComponentTitle = () => {
  const titleMap: Record<string, string> = {
    'TodoComponent': '我的待办',
    'MeetingDocComponent': '拟上会文件',
    'InternalDocComponent': '已签校内文件',
    'ExternalDocComponent': '已签校外文件',
    'SchoolDocComponent': '已签学校发文',
    'LeaveDocComponent': '请假文件',
    'AllDocComponent': '全部公文',
    'FavoriteDocComponent': '我的收藏'
  }
  return titleMap[currentComponent.value] || '未知组件'
}

// 定义与后端返回数据匹配的类型
interface TodoItem {
  id: number               // 待办事项ID
  documentName: string     // 文档名称
  startTime: number        // 开始时间
  status: number           // 状态（0：待处理，1：已处理）
  deptName: string         // 部门名称
  userName: string | null  // 联系人
  mobile: number | null    // 手机号
  typeName: string         // 流转类型
  circulationId: number    // 流转记录ID
  circulationList: any[]   // 流转列表
}

// 获取状态类型
const getStatusType = (status: number) => {
  // 0：待处理，1：已处理
  const typeMap: Record<number, string> = {
    0: 'warning',  // 待处理
    1: 'success'   // 已处理
  }
  return typeMap[status] || 'info'
}

// 获取流转状态类型
const getCirculationStatus = (row: any) => {
  // 直接使用status字段
  return row.status === 0 ? 'warning' : 'success'
}

// 获取流转状态文本
const getCirculationStatusText = (row: any) => {
  return row.status === 0 ? '待处理' : '已处理'
}

// 获取流转类型名称
const getCirculationTypeName = (row: any) => {
  // 优先使用后端返回的typeName
  if (row.typeName) {
    return row.typeName
  }
  
  // 如果没有typeName，根据类型编码显示
  const typeMap: Record<number, string> = {
    0: '校党政领导批示',
    1: '校长办公会议',
    2: '校党委会议',
    3: '校党委常委会议',
    4: '校长办公会议',
    5: '部门正职领导',
    6: '部门副职领导',
    7: '办公室主任',
    8: '办公室副主任',
    9: '办公室工作人员',
    10: '其他'
  }
  return typeMap[row.type] || `类型${row.type}`
}

// 格式化日期
const formatDate = (timestamp: number) => {
  if (!timestamp) return '无'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

const router = useRouter()

// 处理文件处理操作
const handleProcess = (row: any) => {
  // 使用 router.resolve 获取完整路径
  const path = router.resolve({
    name: 'documentApproval',
    query: { id: row.id, type: 3, isTodo: 1 }
  }).href
  
  try {
    console.log('打开路径:', path)
    
    const newWindow = window.open(
      path,
      '_blank',
      'width=1200,height=800,left=100,top=100,resizable=yes'
    )
    
    if (!newWindow) {
      ElMessage.warning('请允许弹出窗口')
      // 备选方案：在当前页打开
      router.push({ name: 'documentApproval', query: { id: row.id, type: 3, isTodo: 1 } })
    }
  } catch (error) {
    console.error('打开失败:', error)
    ElMessage.error('处理失败')
  }
}

// 查看流转历史记录
const viewCirculationHistory = (row: any) => {
  console.log('查看流转历史:', row)
  
  try {
    // 根据路由配置生成完整路径
    const fullPath = router.resolve({
      path: '/document/circulation/history',
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
        path: '/document/circulation/history',
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
  phone: ''
})

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchTodoList()
}

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置到第一页
  fetchTodoList()
}

// 处理搜索
const handleSearch = (params: any) => {
  console.log('搜索参数:', params)
  searchParams.value = params
  pagination.value.currentPage = 1 // 搜索时重置到第一页
  fetchTodoList()
}

// 处理重置
const handleReset = () => {
  searchParams.value = {
    fileName: '',
    sourceUnit: '',
    contact: '',
    phone: ''
  }
  fetchTodoList()
}

// 待办列表数据
const todoList = ref<TodoItem[]>([])

// 示例数据（作为加载失败时的备选）
const fallbackData: TodoItem[] = [
  {
    fileName: '关于2025年度项目经费预算申请的报告',
    arrivalTime: '2025-05-28 09:30',
    flowStatus: '待处理',
    flowPath: '财务处 -> 校长办',
    sourceUnit: '财务处',
    contact: '王经理',
    phone: '13812345678'
  },
  {
    fileName: '关于组织开展教学质量评估工作的通知',
    arrivalTime: '2025-05-27 14:15',
    flowStatus: '待审核',
    flowPath: '教务处 -> 各学院',
    sourceUnit: '教务处',
    contact: '李主任',
    phone: '13987654321'
  },
  {
    fileName: '关于加强校园安全管理的紧急通知',
    arrivalTime: '2025-05-26 16:45',
    flowStatus: '已处理',
    flowPath: '保卫处 -> 各部门',
    sourceUnit: '保卫处',
    contact: '张阜长',
    phone: '13765432198'
  },
  {
    fileName: '关于组织参加第十二届大学生创新创业大赛的通知',
    arrivalTime: '2025-05-25 10:20',
    flowStatus: '待处理',
    flowPath: '团委 -> 各学院',
    sourceUnit: '团委',
    contact: '陈书记',
    phone: '13609876543'
  }
]

// 获取数据
const fetchTodoList = async () => {
  try {
    const res = await circulationApi.getTodoPage({
      pageNo: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      // 搜索参数可以根据需要添加
      ...(searchParams.value.fileName ? { fileName: searchParams.value.fileName } : {}),
      ...(searchParams.value.sourceUnit ? { sourceUnit: searchParams.value.sourceUnit } : {}),
      ...(searchParams.value.contact ? { contact: searchParams.value.contact } : {}),
      ...(searchParams.value.phone ? { phone: searchParams.value.phone } : {})
    })
    
    console.log('获取待办事项响应：', res)
    
    if (res.code === 0 && res.data) {
      // 处理返回的数据
      todoList.value = res.data.list || []
      pagination.value.total = res.data.total || 0
      
      // 处理日期格式
      todoList.value.forEach(item => {
        // 处理到达时间
        if (item.startTime && typeof item.startTime === 'number') {
          item.startTime = formatDate(item.startTime)
        }
        if (item.updateTime && typeof item.updateTime === 'number') {
          item.updateTime = formatDate(item.updateTime)
        }
        
        // 添加紧急标记（如果后端没有返回）
        if (item.isUrgent === undefined) {
          item.isUrgent = false // 默认为非紧急
        }
      })
      
      console.log('处理后的待办列表：', todoList.value)
    } else {
      ElMessage.error(res.msg || '获取待办数据失败')
      console.error('获取待办数据失败，响应格式不正确:', res)
      todoList.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    ElMessage.error('获取待办数据失败')
    console.error('获取待办数据失败:', error)
    todoList.value = []
    pagination.value.total = 0
  }
}

onMounted(() => {
  fetchTodoList()
  
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
  if (event.data && event.data.type === 'refreshTodoList') {
    console.log('收到刷新待办列表的请求，正在刷新...')
    // 刷新待办列表
    fetchTodoList()
  }
}
</script>

<style scoped>
.content-section {
  margin-top: 20px;
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
</style>

<template>
  <div class="content-section">
    <!-- <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" /> -->

    <!-- 根据当前选中的组件显示不同的内容 -->
    <div v-if="currentComponent === 'TodoComponent'" class="content-body">


      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" :loading="loading" />

      <!-- 搜索后无结果时显示提示 -->
      <div v-if="hasSearched && todoList.length === 0 && !loading" class="no-result">
        <el-empty description="暂无匹配的搜索结果" />
      </div>

      <!-- 未搜索但待办列表为空 -->
      <el-empty description="暂无待办事项" v-else-if="!hasSearched && todoList.length === 0" />

      <!-- 有待办事项时显示列表 -->
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
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleProcess(scope.row)">处理</el-button>
              <el-button size="small" type="primary" @click="handleBack(scope.row)">退回</el-button>
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
// import NavBar from '@/components/Document/NavBar.vue'
import SearchBar from '@/components/Document/SearchBar.vue'
import * as circulationApi from '@/api/document/circulation'
import * as circulationPostApi from '@/api/document/circulationPost'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as DocumentApi from '@/api/document/document'
import { eventBus, EVENT_NAMES } from '@/utils/eventBus'

// 当前选中的组件
const currentComponent = ref('TodoComponent')

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

// 加载状态
const loading = ref(false)

// 是否已经搜索
const hasSearched = ref(false)

// 原始数据列表（从后端获取的完整数据）
const originalTodoList = ref<TodoItem[]>([])

// 显示的数据列表（经过过滤的数据）
const todoList = ref<TodoItem[]>([])

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

  // 更新搜索参数
  searchParams.value = { ...params }

  // 标记已经搜索过
  hasSearched.value = true

  // 重置分页到第一页
  pagination.value.currentPage = 1

  // 加载数据（会带上搜索参数）
  fetchTodoList()
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
    searchType: 'fuzzy' // 默认为模糊搜索
  }

  // 重置搜索状态
  hasSearched.value = false

  // 重置分页
  pagination.value.currentPage = 1

  // 重新加载数据
  fetchTodoList()
}

// 在前端过滤数据
const filterTodoList = () => {
  // 此函数不再需要，因为我们将直接使用后端过滤
  // 保留函数以避免其他地方可能的引用错误
  console.log('前端过滤功能已禁用，改为使用后端过滤')
}

// 获取数据
const fetchTodoList = async () => {
  loading.value = true // 开始加载
  try {
    // 构建API请求参数
    const params: any = {
      pageNo: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
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

    const res = await circulationApi.getTodoPage(params)

    console.log('获取待办事项响应：', res)


      // 处理返回的数据
      todoList.value = res.list || []
      pagination.value.total = res.total || 0

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

  } catch (error) {
    ElMessage.error('获取待办数据失败')
    console.error('获取待办数据失败:', error)
    todoList.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false // 结束加载
  }
}

onMounted(() => {
  fetchTodoList()

  // 添加消息监听，用于接收子窗口的刷新请求
  window.addEventListener('message', handleWindowMessage)

  // 监听刷新待办列表事件
  eventBus.on(EVENT_NAMES.REFRESH_TODO_LIST, () => {
    console.log('收到刷新待办列表事件，正在刷新...')
    fetchTodoList()
  })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('message', handleWindowMessage)

  // 移除刷新待办列表事件监听
  eventBus.off(EVENT_NAMES.REFRESH_TODO_LIST)
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

// 处理退回操作
/** 退回待办操作 */
const handleBack = async (row: any) => {
  try {
    // 弹出带输入框的确认对话框
    const { value: message } = await ElMessageBox.prompt('请输入退回原因', '退回待办', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入退回原因',
      type: 'warning'
    })

    // 调用退回待办接口
    await DocumentApi.cancelCirculation({
      id: row.id,
      circulationId: row.circulationId,
      message: message
    })
    ElMessage.success('退回成功')
    // 刷新列表
    fetchTodoList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退回失败:', error)
      ElMessage.error('退回失败')
    }
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
</style>

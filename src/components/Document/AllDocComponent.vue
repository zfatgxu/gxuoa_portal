<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />

    <div class="content-body">
      <h3 class="component-title">全部公文</h3>
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" />
      
      <el-empty description="暂无公文数据" v-if="allDocs.length === 0" />
      <div v-else>
        <el-table :data="allDocs" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="documentName" label="文件名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="typeName" label="文件类型" width="120" align="center" show-overflow-tooltip />
          <el-table-column prop="deptName" label="来源单位" width="120" align="center" />
          <el-table-column label="联系人" width="120" align="center">
            <template #default="scope">
              {{ scope.row.userName || '暂无' }}
            </template>
          </el-table-column>
          <el-table-column label="联系电话" width="120" align="center">
            <template #default="scope">
              {{ scope.row.mobile || '暂无' }}
            </template>
          </el-table-column>
          
          <el-table-column label="提交时间" width="160" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.startTime) }}
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
import circulationApi from '@/api/circulation'

const currentComponent = ref('AllDocComponent')

// 分页相关状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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

// 处理组件切换
const handleComponentChange = (componentName: string) => {
  console.log('切换到组件：', componentName)
  currentComponent.value = componentName
}

// 获取状态类型
const getStatusType = (status: number) => {
  // 根据状态值返回对应的样式类型
  const typeMap: Record<number, string> = {
    0: 'warning', // 待处理
    1: 'success', // 已处理
    2: 'danger',  // 已拒绍
    3: 'info'     // 已撤回
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  // 根据状态值返回对应的文本
  const textMap: Record<number, string> = {
    0: '待处理',
    1: '已处理',
    2: '已拒绍',
    3: '已撤回'
  }
  return textMap[status] || '未知状态'
}

// 日期格式化函数
const formatDate = (timestamp: number) => {
  if (!timestamp) return '暂无'
  
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 查看文件详情
const handleView = (doc: any) => {
  console.log('查看文件详情：', doc)
  // TODO: 实现查看文件详情功能
}

const allDocs = ref<any[]>([])

// 所有公文数据
const allDocsData = [
  {
    fileName: '关于2025学年第一学期教学工作安排的通知',
    docType: '学校发文',
    flowPath: '教务处 ➝ 各学院',
    sourceUnit: '教务处',
    status: '已处理',
    submitTime: '2025-05-20 10:30'
  },
  {
    fileName: '关于开展2025年度教师评优活动的通知',
    docType: '校内文件',
    flowPath: '人事处 ➝ 各学院',
    sourceUnit: '人事处',
    status: '待处理',
    submitTime: '2025-05-18 09:15'
  },
  {
    fileName: '关于组织参加第十二届大学生创新创业大赛的通知',
    docType: '校外文件',
    flowPath: '团委 ➝ 各学院',
    sourceUnit: '团委',
    status: '待处理',
    submitTime: '2025-05-25 10:20'
  },
  {
    fileName: '王明-事假申请',
    docType: '请假文件',
    flowPath: '学生 ➝ 辅导员 ➝ 院长',
    sourceUnit: '计算机学院',
    status: '已处理',
    submitTime: '2025-05-25 10:30'
  },
  {
    fileName: '关于加强实验室安全管理的规定',
    docType: '学校发文',
    flowPath: '实验室管理处 ➝ 各学院',
    sourceUnit: '实验室管理处',
    status: '已处理',
    submitTime: '2025-05-15 11:45'
  },
  {
    fileName: '关于组织开展2025年春季运动会的通知',
    docType: '学校发文',
    flowPath: '体育部 ➝ 各学院及部门',
    sourceUnit: '体育部',
    status: '已处理',
    submitTime: '2025-05-12 16:30'
  },
  {
    fileName: '关于开展大学生心理健康教育的通知',
    docType: '学校发文',
    flowPath: '学生处 ➝ 各学院',
    sourceUnit: '学生处',
    status: '待处理',
    submitTime: '2025-05-10 09:20'
  },
  {
    fileName: '张华-病假申请',
    docType: '请假文件',
    flowPath: '学生 ➝ 辅导员 ➝ 院长',
    sourceUnit: '物理学院',
    status: '待处理',
    submitTime: '2025-05-27 14:15'
  }
]

// 搜索参数
const searchParams = ref({
  fileName: '',
  sourceUnit: '',
  contact: '',
  phone: ''
})

// 处理搜索
const handleSearch = (params: any) => {
  console.log('搜索参数:', params)
  searchParams.value = params
  pagination.value.currentPage = 1 // 搜索时重置到第一页
  loadAllDocs()
}

// 处理重置
const handleReset = () => {
  searchParams.value = {
    fileName: '',
    sourceUnit: '',
    contact: '',
    phone: ''
  }
  loadAllDocs()
}

// 加载全部公文数据
const loadAllDocs = async () => {
  try {
    const { currentPage, pageSize } = pagination.value
    const { fileName, sourceUnit, contact, phone } = searchParams.value
    
    // 使用API请求获取数据
    const params = {
      pageNo: currentPage,
      pageSize: pageSize,
      title: fileName, // 文件名称对应后端的title字段
      sourceUnit: sourceUnit, // 来源单位
      contactPerson: contact, // 联系人
      contactPhone: phone // 联系电话
    }
    
    // 调用获取全部公文的API
    const res = await circulationApi.getAllSchoolDocuments(params)
    
    // 处理响应数据
    if (res.code === 0 && res.data) {
      // 更新数据列表和总数
      allDocs.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      // 如果请求成功但没有数据或者请求失败
      console.error('获取全部公文失败:', res.msg || '服务器响应异常')
      allDocs.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    // 处理异常情况
    console.error('获取全部公文失败:', error)
    allDocs.value = []
    pagination.value.total = 0
  }
}

onMounted(() => {
  loadAllDocs()
})
</script>

<style scoped>
.content-section {
  margin-top: 20px;
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
</style>

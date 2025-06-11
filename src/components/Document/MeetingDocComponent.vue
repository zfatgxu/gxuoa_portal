<template>
  <div class="content-section">
    <NavBar :modelValue="currentComponent" @update:modelValue="handleComponentChange" />

    <div class="content-body">
      
      
      <!-- 搜索组件 -->
      <SearchBar @search="handleSearch" @reset="handleReset" />
      
      <el-empty description="暂无拟上会文件" v-if="meetingDocs.length === 0" />
      <div v-else>
        <el-table :data="meetingDocs" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center">
            <template #default="scope">
              {{ (pagination.currentPage - 1) * pagination.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="flowPath" label="流转状态" width="180" show-overflow-tooltip />
          <el-table-column prop="sourceUnit" label="来文单位" width="150" align="center" />
          <el-table-column prop="contact" label="联系人" width="100" align="center" />
          <el-table-column prop="phone" label="电话" width="120" align="center" />
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
import axios from 'axios'

const currentComponent = ref('MeetingDocComponent')

// 分页相关状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  loadMeetingDocs()
}

// 处理每页条数变化
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1 // 重置到第一页
  loadMeetingDocs()
}

// 处理组件切换
const handleComponentChange = (componentName: string) => {
  console.log('切换到组件：', componentName)
  currentComponent.value = componentName
}

const meetingDocs = ref<any[]>([])

// 所有拟上会文件数据
const allMeetingDocs = [
  {
    fileName: '关于2025年度工作计划的通知',
    flowPath: '校办公室 ➝ 校领导',
    sourceUnit: '校办公室',
    contact: '王主任',
    phone: '13812345678',
    submitTime: '2025-05-20 10:30'
  },
  {
    fileName: '关于教师节活动安排的通知',
    flowPath: '人事处 ➝ 教师发展中心',
    sourceUnit: '人事处',
    contact: '张老师',
    phone: '13987654321',
    submitTime: '2025-05-18 09:15'
  },
  {
    fileName: '关于学校安全管理工作会议的通知',
    flowPath: '保卫处 ➝ 各部门',
    sourceUnit: '保卫处',
    contact: '李处长',
    phone: '13765432198',
    submitTime: '2025-05-16 14:30'
  },
  {
    fileName: '关于拟定2025年度项目预算的会议通知',
    flowPath: '财务处 ➝ 各学院',
    sourceUnit: '财务处',
    contact: '王经理',
    phone: '13609876543',
    submitTime: '2025-05-15 09:45'
  },
  {
    fileName: '关于校园网络升级改造工作会议的通知',
    flowPath: '信息中心 ➝ 各部门',
    sourceUnit: '信息中心',
    contact: '陈主任',
    phone: '13512345678',
    submitTime: '2025-05-12 16:20'
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
  loadMeetingDocs()
}

// 处理重置
const handleReset = () => {
  searchParams.value = {
    fileName: '',
    sourceUnit: '',
    contact: '',
    phone: ''
  }
  loadMeetingDocs()
}

// 加载拟上会文件数据
const loadMeetingDocs = () => {
  // 模拟分页数据获取
  const { currentPage, pageSize } = pagination.value
  const { fileName, sourceUnit, contact, phone } = searchParams.value
  
  // 先过滤数据
  const filteredData = allMeetingDocs.filter(item => {
    return (!fileName || item.fileName.includes(fileName)) &&
           (!sourceUnit || item.sourceUnit.includes(sourceUnit)) &&
           (!contact || (item.contact && item.contact.includes(contact))) &&
           (!phone || (item.phone && item.phone.includes(phone)))
  })
  
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  
  // 设置总数据量
  pagination.value.total = filteredData.length
  
  // 获取当前页的数据
  meetingDocs.value = filteredData.slice(start, end)
  
  // 实际项目中应该从 API 获取数据
  // try {
  //   const res = await axios.get('/api/meeting-docs', {
  //     params: {
  //       pageNo: pagination.value.currentPage,
  //       pageSize: pagination.value.pageSize
  //     }
  //   })
  //   
  //   if (res.data && res.data.code === 0) {
  //     meetingDocs.value = res.data.data.list || []
  //     pagination.value.total = res.data.data.total || 0
  //   }
  // } catch (error) {
  //   console.error('获取拟上会文件失败:', error)
  //   meetingDocs.value = []
  //   pagination.value.total = 0
  // }
}

onMounted(() => {
  loadMeetingDocs()
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
</style>

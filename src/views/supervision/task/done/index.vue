<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入任务名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
      </el-form-item>
      <el-form-item label="" prop="category" class="absolute right-130px">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择督办类型"
          clearable
          class="!w-155px"
          @change="handleQuery"
        >
          <el-option label="工作督办" value="1" />
          <el-option label="专项督办" value="2" />
        </el-select>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @row-click="handleRowClick" :highlight-current-row="true">
      <el-table-column align="center" label="督办编号" prop="orderCode" width="150" />
      <el-table-column align="center" label="督办内容" prop="orderTitle" min-width="200" />
      <el-table-column align="center" label="督办类型" prop="typeName" width="100" />
      <el-table-column align="center" label="发起人" prop="startUserName" width="100" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="发起时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" label="任务名称" prop="taskName" width="150" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="完成时间"
        prop="endTime"
        width="180"
      />
      <el-table-column align="center" label="操作" fixed="right" width="80">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 督办单详情抽屉 -->
  <el-drawer
    v-model="drawerVisible"
    title="督办单详情"
    direction="ltr"
    size="60%"
    :before-close="handleDrawerClose"
  >
    <div class="drawer-content" v-loading="detailLoading">
      <div class="supervision-detail">
        <!-- 督办单基本信息 -->
        <div class="detail-header">
          <h2 class="detail-title">{{ orderDetail.typeName || '督办单' }}</h2>
          <div class="order-code">督办编号：{{ orderDetail.orderCode }}</div>
        </div>

        <!-- 督办单表单信息（只读） -->
        <el-form :model="orderDetail" label-width="120px" class="detail-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="督办内容：">
                <span class="form-text">{{ orderDetail.orderTitle }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="督办类型：">
                <span class="form-text">{{ orderDetail.typeName }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="督办依据：">
                <span class="form-text">{{ orderDetail.reasonName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急程度：">
                <span class="form-text">{{ orderDetail.priorityName }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="重要程度：">
                <span class="form-text">{{ orderDetail.significanceName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="完成期限：">
                <span class="form-text">{{ formatDate(orderDetail.deadline) }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="牵头单位：">
                <span class="form-text">{{ orderDetail.leadDeptName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="督办人：">
                <span class="form-text">{{ orderDetail.supervisorName }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="协办单位：">
                <span class="form-text">{{ orderDetail.coDeptNames }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="主要内容：">
                <div class="content-text">{{ orderDetail.content }}</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="承办事项：">
                <div class="content-text">{{ orderDetail.undertakeMatter }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 审批流程时间线 -->
        <div class="timeline-section">
          <h3>审批流程</h3>
          <ProcessInstanceTimeline :activity-nodes="activityNodes" />
        </div>
      </div>
    </div>

    <!-- 抽屉底部操作按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleDrawerClose">关闭</el-button>
        <el-button type="primary" @click="handleViewProcess" v-if="currentTask">
          查看流程
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import { SupervisionTaskApi } from '@/api/supervision/index'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'

defineOptions({ name: 'SupervisionDoneTask' })

const { push } = useRouter() // 路由

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  category: undefined
})
const queryFormRef = ref() // 搜索的表单

// 抽屉相关
const drawerVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref({})
const currentTask = ref(null)
const activityNodes = ref([])

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    // 调用督办已办任务列表API
    const data = await SupervisionTaskApi.getDoneTaskPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 行点击事件 */
const handleRowClick = (row: any) => {
  showOrderDetail(row)
}

/** 显示督办单详情 */
const showOrderDetail = async (row: any) => {
  drawerVisible.value = true
  detailLoading.value = true
  currentTask.value = row
  
  try {
    // 调用督办单详情API
    const orderData = await SupervisionTaskApi.getOrderDetailForTask(row.orderId)
    orderDetail.value = orderData
    
    // 获取审批流程时间线
    if (row.processInstanceId) {
      const timelineData = await TaskApi.getProcessInstanceActivityList(row.processInstanceId)
      activityNodes.value = timelineData
    }
  } catch (error) {
    console.error('获取督办单详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

/** 查看按钮 */
const handleView = (row: any) => {
  showOrderDetail(row)
}

/** 查看流程 */
const handleViewProcess = () => {
  if (currentTask.value) {
    push({
      name: 'BpmProcessInstanceDetail',
      query: {
        id: currentTask.value.processInstanceId
      }
    })
  }
}

/** 关闭抽屉 */
const handleDrawerClose = () => {
  drawerVisible.value = false
  orderDetail.value = {}
  currentTask.value = null
  activityNodes.value = []
}

/** 格式化日期 */
const formatDate = (date: any) => {
  if (!date) return ''
  return dateFormatter(null, null, date)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.supervision-detail {
  padding: 20px;
}

.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 10px 0;
}

.order-code {
  font-size: 14px;
  color: #909399;
}

.detail-form {
  margin-bottom: 30px;
}

.form-text {
  color: #606266;
  font-size: 14px;
}

.content-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.timeline-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.timeline-section h3 {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.drawer-footer {
  text-align: center;
  padding: 20px;
}
</style>

<template>
  <div class="task-dashboard">
    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">
        <el-icon class="title-icon"><DataAnalysis /></el-icon>
        本月任务情况
      </h3>
      <div class="stats-cards">
        <el-card class="stat-card my-tasks">
          <div class="stat-content">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-label">我的任务</div>
              <div class="stat-number">{{ statistics.myTaskCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card ongoing">
          <div class="stat-content">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-number">{{ statistics.ongoingCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card completed">
          <div class="stat-content">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-number">{{ statistics.completedCount }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card overdue">
          <div class="stat-content">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">超时提醒</div>
              <div class="stat-number">{{ statistics.overdueCount }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Task Management Section -->
    <div class="task-section">
      <div class="task-header-controls">
        <el-tabs v-model="activeTab" class="inline-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="我的任务" name="my-tasks" />
          <el-tab-pane label="协办任务" name="collaborative-tasks" />
          <el-tab-pane label="已完成" name="completed-tasks" />
        </el-tabs>
        <div class="task-controls">
          <el-input
            v-model="taskSearch"
            placeholder="输入搜索关键词"
            class="task-search"
            :prefix-icon="Search"
            @input="handleFilterChange"
          />
          <el-select v-model="taskDept" placeholder="全部部门" class="task-filter" @change="handleFilterChange">
            <el-option label="全部部门" value="all" />
            <el-option label="学生处" value="学生处" />
            <el-option label="后勤处" value="后勤处" />
            <el-option label="保卫处" value="保卫处" />
            <el-option label="教务处" value="教务处" />
            <el-option label="人事处" value="人事处" />
            <el-option label="基建处" value="基建处" />
          </el-select>
          <el-select v-model="taskStatus" placeholder="全部状态" class="task-filter" @change="handleFilterChange">
            <el-option label="全部状态" value="all" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="超时" value="超时" />
          </el-select>
          <el-button :icon="Bell">一键提醒</el-button>
          <el-button type="text" class="more-btn">更多 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <el-card
          v-for="task in taskList"
          :key="task.id"
          class="task-item"
          shadow="hover"
        >
          <div class="task-header">
            <h4 class="task-title" @click="viewTaskDetail(task)">{{ task.title }}</h4>
            <div class="task-actions">
              <el-tag :type="getPriorityType(task.priority)" size="small">{{ task.priority }}</el-tag>
              <el-tag :type="getStatusType(task.status)" size="small">{{ task.status }}</el-tag>
            </div>
          </div>
          <div class="task-description" v-if="task.description">
            <p class="description-text">{{ task.description }}</p>
          </div>
          <div class="leadership-instruction" v-if="task.instruction">
            <el-alert
              :title="task.instruction"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
          <div class="task-content">
            <div class="task-details">
              <div class="detail-row">
                <el-icon><OfficeBuilding /></el-icon>
                <span>下发单位：</span>
                <span>{{ task.issuer }}</span>
                <el-icon><User /></el-icon>
                <span>协办部门：</span>
                <span>{{ task.collaborators.join('、') }}</span>
                <el-icon><User /></el-icon>
                <span>分管领导：</span>
                <span class="supervisor">{{ task.supervisor }}</span>
                <span class="deadline">截止时间：<span class="deadline-date">{{ task.deadline }}</span></span>
              </div>
              <div class="detail-row">
                <span>创建时间：{{ task.createTime }}</span>
                <span class="remaining-days">剩余{{ task.remainingDays }}天</span>
              </div>
            </div>
            <div class="task-buttons">
              <el-button size="small" @click="viewTaskDetail(task)">查看详情</el-button>
              <el-button size="small" type="primary" @click="addProgress(task)">添加进度</el-button>
            </div>
          </div>
        </el-card>
        <div v-if="taskList.length === 0" class="no-tasks-message">
          暂无相关任务。
        </div>
        <el-pagination
          v-if="pagination.total > 0"
          background
          layout="prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.pageNo"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 督办详情弹窗 -->
    <SupervisionDetailDialog
      v-model="detailDialogVisible"
      :task-data="selectedTask"
      @close="handleDetailClose"
    />

    <!-- Add Progress Dialog -->
    <el-dialog
      v-model="progressDialogVisible"
      title="添加进度"
      width="50%"
    >
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="进度描述">
          <el-input
            v-model="progressForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入进度描述"
          />
        </el-form-item>
        <el-form-item label="完成百分比">
          <el-slider v-model="progressForm.percentage" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Search, Bell, DataAnalysis, Document, Clock, CircleCheck, Warning,
  ArrowRight, OfficeBuilding, User
} from '@element-plus/icons-vue'
import SupervisionDetailDialog from '../components/SupervisionDetailDialog.vue'
import * as DeptApi from '@/api/system/dept'
import { mockDeptStatistics, mockDeptTaskPage, mockDeptTaskDetail, mockAddTaskProgress } from '@/api/supervision/mock'
import { ElMessage } from 'element-plus'

// 响应式数据
const activeTab = ref('my-tasks') // 默认激活"我的任务"
const taskSearch = ref('')
const taskDept = ref('all')
const taskStatus = ref('all')
const detailDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const selectedTask = ref(null)
const loading = ref(false)

// 统计数据
const statistics = reactive({
  myTaskCount: 0,
  ongoingCount: 0,
  completedCount: 0,
  overdueCount: 0
})

// 任务列表数据
const taskList = ref([])

// 分页相关
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 进度表单
const progressForm = reactive({
  description: '',
  percentage: 0
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const data = await mockDeptStatistics()
    statistics.myTaskCount = data.myTaskCount
    statistics.ongoingCount = data.ongoingCount
    statistics.completedCount = data.completedCount
    statistics.overdueCount = data.overdueCount
  } catch (error) {
    console.error('加载统计数据失败', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      keyword: taskSearch.value || undefined,
      department: taskDept.value !== 'all' ? taskDept.value : undefined,
      status: taskStatus.value !== 'all' ? taskStatus.value : undefined,
      tab: activeTab.value
    }
    
    const result = await mockDeptTaskPage(params)
    taskList.value = result.list
    pagination.total = result.total
    pagination.pageNo = result.pageNo
    pagination.pageSize = result.pageSize
  } catch (error) {
    console.error('加载任务列表失败', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变更
const handlePageChange = (page) => {
  pagination.pageNo = page
  loadTaskList()
}

// 处理筛选条件变更
const handleFilterChange = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 处理标签页切换
const handleTabChange = () => {
  pagination.pageNo = 1 // 重置为第一页
  loadTaskList()
}

// 样式辅助方法
const getPriorityType = (priority) => {
  const types = {
    '高优先级': 'danger',
    '中优先级': 'warning',
    '一般优先': 'info'
  }
  return types[priority] || 'info'
}

const getStatusType = (status) => {
  const types = {
    '进行中': 'warning',
    '已完成': 'success',
    '超时': 'danger'
  }
  return types[status] || 'info'
}

// 任务详情相关
const viewTaskDetail = async (task) => {
  try {
    const taskDetail = await mockDeptTaskDetail(task.id)
    if (taskDetail) {
      selectedTask.value = taskDetail
      detailDialogVisible.value = true
    } else {
      ElMessage.warning('找不到任务详情')
    }
  } catch (error) {
    console.error('获取任务详情失败', error)
    ElMessage.error('获取任务详情失败')
  }
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedTask.value = null
}

// 添加进度相关
const addProgress = (task) => {
  selectedTask.value = task
  progressDialogVisible.value = true
}

const submitProgress = async () => {
  if (!progressForm.description) {
    ElMessage.warning('请输入进度描述')
    return
  }
  
  try {
    await mockAddTaskProgress(selectedTask.value.id, {
      description: progressForm.description,
      percentage: progressForm.percentage
    })
    
    ElMessage.success('进度添加成功')
    progressDialogVisible.value = false
    progressForm.description = ''
    progressForm.percentage = 0
    
    // 刷新任务列表
    loadTaskList()
  } catch (error) {
    console.error('添加进度失败', error)
    ElMessage.error('添加进度失败')
  }
}

// 初始化
onMounted(() => {
  // 加载统计数据
  loadStatistics()
  // 加载任务列表
  loadTaskList()
})
</script>

<style scoped>
.task-dashboard {
  padding: 20px;
}

.stats-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-bottom: 16px;
  color: #303133;
}

.title-icon {
  margin-right: 8px;
  font-size: 20px;
  color: #409eff;
}

.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
  padding: 12px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.my-tasks .stat-icon {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.ongoing .stat-icon {
  color: #e6a23c;
  background-color: rgba(230, 162, 60, 0.1);
}

.completed .stat-icon {
  color: #67c23a;
  background-color: rgba(103, 194, 58, 0.1);
}

.overdue .stat-icon {
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.task-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.task-header-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.inline-tabs {
  min-width: 300px;
}

.task-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.task-search {
  width: 220px;
}

.task-filter {
  width: 130px;
}

.more-btn {
  display: flex;
  align-items: center;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  margin-bottom: 16px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  cursor: pointer;
  color: #303133;
  transition: color 0.3s;
}

.task-title:hover {
  color: #409eff;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-description {
  margin-bottom: 12px;
}

.description-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.leadership-instruction {
  margin-bottom: 12px;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
}

.task-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.detail-row .el-icon {
  font-size: 14px;
  color: #909399;
}

.supervisor {
  font-weight: 500;
}

.deadline {
  margin-left: auto;
}

.deadline-date {
  color: #409eff;
  font-weight: 500;
}

.remaining-days {
  color: #67c23a;
}

.task-buttons {
  display: flex;
  gap: 8px;
}

.no-tasks-message {
  padding: 40px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .task-header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-controls {
    margin-top: 12px;
    width: 100%;
  }
  
  .task-search, .task-filter {
    width: 100%;
  }
  
  .task-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-buttons {
    margin-top: 16px;
  }
}
</style>

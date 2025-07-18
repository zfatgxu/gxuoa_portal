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
              <div class="stat-number">{{ filteredTaskListByTab('my-tasks').length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card ongoing">
          <div class="stat-content">
            <el-icon class="stat-icon"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-label">进行中</div>
              <div class="stat-number">{{ filteredTaskListByStatus('进行中').length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card completed">
          <div class="stat-content">
            <el-icon class="stat-icon"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-label">已完成</div>
              <div class="stat-number">{{ filteredTaskListByStatus('已完成').length }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card overdue">
          <div class="stat-content">
            <el-icon class="stat-icon"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-label">超时提醒</div>
              <div class="stat-number">{{ filteredTaskListByStatus('超时').length }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Task Management Section -->
    <div class="task-section">
      <div class="task-header-controls">
        <el-tabs v-model="activeTab" class="inline-tabs">
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
          />
          <el-select v-model="taskDept" placeholder="全部部门" class="task-filter">
            <el-option label="全部部门" value="all" />
            <el-option label="学生处" value="学生处" />
            <el-option label="后勤处" value="后勤处" />
            <el-option label="保卫处" value="保卫处" />
            <el-option label="教务处" value="教务处" />
            <el-option label="人事处" value="人事处" />
            <el-option label="基建处" value="基建处" />
          </el-select>
          <el-select v-model="taskStatus" placeholder="全部状态" class="task-filter">
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
          v-for="task in filteredTaskList"
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
        <div v-if="filteredTaskList.length === 0" class="no-tasks-message">
          暂无相关任务。
        </div>
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
import { ref, reactive, computed } from 'vue'
import {
  Search, Bell, DataAnalysis, Document, Clock, CircleCheck, Warning,
  ArrowRight, OfficeBuilding, User
} from '@element-plus/icons-vue'
import SupervisionDetailDialog from '../components/SupervisionDetailDialog.vue'

// Reactive data
const activeTab = ref('my-tasks') // 默认激活“我的任务”
const taskSearch = ref('')
const taskDept = ref('all')
const taskStatus = ref('all')
const detailDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const selectedTask = ref(null)

const progressForm = reactive({
  description: '',
  percentage: 0
})

// 模拟当前用户的部门，用于“协办任务”过滤
const currentUserDepartment = '学生处';
// 模拟当前用户的分管领导，用于“我的任务”过滤
const currentUserSupervisor = '张副校长';

// Mock data
const taskList = ref([
  {
    id: 1,
    title: '关于加强校园管理工作的督察',
    description: '追踪校园安全管理，确保师生安全和校园内各项安全措施的有效实施及安全工作的落实',
    instruction: '张副校长批示：落实校园安全管理，确保在前期内完成校园安全全面的排查整改工作。',
    issuer: '校务督办',
    collaborators: ['学生处', '后勤处'],
    supervisor: '张副校长',
    deadline: '2025-08-24',
    createTime: '2025-06-30',
    remainingDays: 15,
    priority: '高优先级',
    status: '进行中',
    mainContent: '针对近期校园安全事件，要求各部门加强安全意识，完善应急预案，确保师生人身财产安全。重点检查宿舍区域、教学楼、实验室等重点场所的安全设施配备情况，建立健全安全管理制度。',
    undertakingContent: '1. 学生处负责学生安全教育和宿舍管理，制定学生安全教育计划，定期开展安全教育活动；2. 后勤处负责校园基础设施安全检查，定期检查教学楼、宿舍楼等建筑物的安全设施；3. 保卫处负责校园安全巡逻和应急处置，建立24小时值班制度；4. 各学院配合做好学生安全教育工作。'
  },
  {
    id: 2,
    title: '学生宿舍管理规范化整治',
    description: '加强学生宿舍日常管理，完善管理制度，改善住宿环境，提升学生满意度和安全保障水平...',
    instruction: '李校长批示：此项工作关系学生切身利益，各部门要高度重视，确保按时完成整改任务。',
    issuer: '校务督办',
    collaborators: ['学生处', '后勤处'],
    supervisor: '张副校长',
    deadline: '2025-08-24',
    createTime: '2025-06-30',
    remainingDays: 15,
    priority: '中优先级',
    status: '已完成', // 已完成任务
    mainContent: '加强学生宿舍日常管理，完善管理制度，改善住宿环境，提升学生满意度和安全保障水平。',
    undertakingContent: '规范宿舍管理流程，加强宿舍安全检查，改善宿舍硬件设施，建立宿舍文化建设体系。'
  },
  {
    id: 3,
    title: '食堂卫生检查与整改',
    description: '定期对食堂卫生进行检查，确保食品安全，提升师生用餐体验。',
    issuer: '后勤处',
    collaborators: ['学生处'], // 协办任务
    supervisor: '王主任',
    deadline: '2025-07-30',
    createTime: '2025-07-01',
    remainingDays: 10,
    priority: '高优先级',
    status: '进行中',
    mainContent: '对食堂的食品采购、储存、加工、销售全流程进行严格把控，确保食品安全。',
    undertakingContent: '1. 后勤处负责制定详细检查计划；2. 学生处负责收集学生反馈；3. 卫生部门进行定期抽检。'
  },
  {
    id: 4,
    title: '校园绿化美化项目',
    description: '对校园绿化进行规划和实施，提升校园环境美观度。',
    issuer: '基建处',
    collaborators: ['后勤处'],
    supervisor: '赵副校长',
    deadline: '2025-09-15',
    createTime: '2025-07-05',
    remainingDays: 60,
    priority: '一般优先',
    status: '进行中',
    mainContent: '对校园内现有绿植进行修剪、养护，并规划新增绿化区域。',
    undertakingContent: '1. 基建处负责整体规划和施工；2. 后勤处负责日常养护。'
  },
  {
    id: 5,
    title: '教职工培训计划制定',
    description: '制定年度教职工专业技能和职业素养培训计划。',
    issuer: '人事处',
    collaborators: [],
    supervisor: '李校长',
    deadline: '2025-07-20',
    createTime: '2025-06-25',
    remainingDays: 5,
    priority: '高优先级',
    status: '进行中',
    mainContent: '根据学校发展需求和教职工个人发展意愿，制定全面的培训方案。',
    undertakingContent: '1. 人事处负责需求调研和方案起草；2. 各部门配合组织培训。'
  },
  {
    id: 6,
    title: '实验室安全隐患排查',
    description: '对全校实验室进行安全隐患排查，确保实验教学安全。',
    issuer: '教务处',
    collaborators: ['保卫处'],
    supervisor: '张副校长',
    deadline: '2025-08-10',
    createTime: '2025-07-01',
    remainingDays: 20,
    priority: '高优先级',
    status: '已完成', // 已完成任务
    mainContent: '对所有实验室的设备、化学品、消防设施等进行全面检查。',
    undertakingContent: '1. 教务处牵头组织；2. 保卫处提供安全指导；3. 各学院实验室自查。'
  },
  {
    id: 7,
    title: '校园网络安全升级',
    description: '升级校园网络基础设施，提升网络安全防护能力。',
    issuer: '信息中心',
    collaborators: ['保卫处'],
    supervisor: '王主任',
    deadline: '2025-07-15',
    createTime: '2025-06-20',
    remainingDays: -5, // 模拟超时
    priority: '高优先级',
    status: '超时', // 超时任务
    mainContent: '部署新的防火墙和入侵检测系统，加强网络监控。',
    undertakingContent: '1. 信息中心负责技术实施；2. 保卫处负责安全策略指导。'
  }
])

// Computed property for filtered task list based on active tab and filters
const filteredTaskList = computed(() => {
  let filtered = taskList.value;

  // 1. Filter by active tab
  if (activeTab.value === 'my-tasks') {
    // 假设“我的任务”是分管领导为当前用户分管领导的任务
    filtered = filtered.filter(task => task.supervisor === currentUserSupervisor);
  } else if (activeTab.value === 'collaborative-tasks') {
    // “协办任务”显示当前用户部门（模拟为“学生处”）参与协办的任务
    filtered = filtered.filter(task => task.collaborators.includes(currentUserDepartment));
  } else if (activeTab.value === 'completed-tasks') {
    // “已完成”显示状态为“已完成”的任务
    filtered = filtered.filter(task => task.status === '已完成');
  }

  // 2. Apply search filter
  if (taskSearch.value) {
    const searchLower = taskSearch.value.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      (task.instruction && task.instruction.toLowerCase().includes(searchLower))
    );
  }

  // 3. Apply department filter
  if (taskDept.value !== 'all') {
    filtered = filtered.filter(task =>
      task.issuer === taskDept.value || task.collaborators.includes(taskDept.value)
    );
  }

  // 4. Apply status filter
  if (taskStatus.value !== 'all') {
    filtered = filtered.filter(task => task.status === taskStatus.value);
  }

  return filtered;
})

// Methods
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

const viewTaskDetail = (task) => {
  selectedTask.value = task
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedTask.value = null
}

const addProgress = (task) => {
  selectedTask.value = task
  progressDialogVisible.value = true
}

const submitProgress = () => {
  console.log('Progress submitted:', progressForm)
  progressDialogVisible.value = false
  progressForm.description = ''
  progressForm.percentage = 0
}

const showMoreHistory = () => {
  console.log('Show more history')
}

// Helper computed properties for statistics cards
const filteredTaskListByTab = (tabName) => {
  let filtered = taskList.value;
  if (tabName === 'my-tasks') {
    filtered = filtered.filter(task => task.supervisor === currentUserSupervisor);
  } else if (tabName === 'collaborative-tasks') {
    filtered = filtered.filter(task => task.collaborators.includes(currentUserDepartment));
  } else if (tabName === 'completed-tasks') {
    filtered = filtered.filter(task => task.status === '已完成');
  }
  return filtered;
};

const filteredTaskListByStatus = (status) => {
  return taskList.value.filter(task => task.status === status);
};
</script>

<style scoped>
.task-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.stats-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
}

.title-icon {
  color: #409eff;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.my-tasks {
  border-left: 4px solid #409eff;
}

.stat-card.ongoing {
  border-left: 4px solid #e6a23c;
}

.stat-card.completed {
  border-left: 4px solid #67c23a;
}

.stat-card.overdue {
  border-left: 4px solid #f56c6c;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 28px;
}

.stat-card.my-tasks .stat-icon {
  color: #409eff;
}

.stat-card.ongoing .stat-icon {
  color: #e6a23c;
}

.stat-card.completed .stat-icon {
  color: #67c23a;
}

.stat-card.overdue .stat-icon {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.task-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.inline-tabs {
  flex-shrink: 0;
}

.task-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.task-search {
  width: 250px;
}

.task-filter {
  width: 110px;
}

.more-btn {
  margin-left: auto;
  color: #409eff;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  cursor: pointer;
  margin: 0;
  transition: color 0.3s ease;
}

.task-title:hover {
  color: #409eff;
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* 普通内容描述样式 */
.task-description {
  margin-bottom: 15px;
}

.description-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 领导批示高亮样式 */
.leadership-instruction {
  margin-bottom: 15px;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.task-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.detail-row .el-icon {
  color: #909399;
  font-size: 16px;
}

.supervisor {
  color: #409eff; /* 蓝色样式 */
  font-weight: 500;
}

.deadline {
  margin-left: auto;
  color: #303133;
}

.deadline-date {
  color: #f56c6c; /* 红色样式 */
  font-weight: 500;
}

.remaining-days {
  color: #e6a23c;
  font-weight: 500;
}

.task-buttons {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}



.no-tasks-message {
  text-align: center;
  padding: 50px;
  color: #909399;
  font-size: 16px;
}

/* Element Plus 深度选择器 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 0; /* 确保标签页头部没有额外底部间距 */
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 0; /* 确保标签页导航包裹器没有额外底部间距 */
}

:deep(.el-alert) {
  margin: 0;
  border-radius: 6px;
}

:deep(.el-alert__content) {
  font-size: 13px;
}

:deep(.el-alert--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
}

:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}
</style>

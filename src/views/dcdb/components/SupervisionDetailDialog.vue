<template>
  <el-dialog
    v-model="dialogVisible"
    width="60%"
    :before-close="handleClose"
    class="supervision-detail-dialog"
  >
    <template #header>
      <div class="custom-dialog-title">{{ orderDetail.title }}</div>
    </template>
    <div class="supervision-detail" v-if="orderDetail">
      <!-- 标题下状态栏 -->
      <div class="status-bar">
        <div class="status-tags">
          <span class="status-tag priority-tag">{{ orderDetail.priority }}</span>
          <span class="status-tag status-tag-item">{{ getStatusText(orderDetail.status) }}</span>
          <span class="status-tag category-tag">{{ orderDetail.category }}</span>
        </div>
        <div class="doc-number">
          <span>督办编号：{{ orderDetail.orderNumber }}</span>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <el-row :gutter="20" class="main-content">
        <!-- 左侧：任务信息 -->
        <el-col :span="16">
          <div class="info-section">
            <h3 class="section-title">任务信息</h3>
            <div class="task-info-container">
              <div class="task-info-row">
                <div class="task-info-col">
                  <div class="info-group">
                    <div class="group-title">下发单位</div>
                    <div class="info-item-new">
                      <Icon icon="ep:office-building" class="item-icon" />
                      <span class="item-text">{{ orderDetail.issueUnit }}</span>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">牵头部门</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.leadDept }}</span>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">协办部门</div>
                    <div class="info-item-new">
                      <Icon icon="ep:office-building" class="item-icon" />
                      <span class="item-text">{{ orderDetail.collaborateDepts.join('、') }}</span>
                    </div>
                  </div>
                </div>

                <div class="task-info-col">
                  <div class="info-group">
                    <div class="group-title">下发人</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.issuer }}</span>
                      <span class="contact-info">联系电话</span>
                      <span class="phone-number">{{ orderDetail.issuerPhone }}</span>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">负责人</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.supervisorName }}</span>
                      <span class="contact-info">联系电话</span>
                      <span class="phone-number">{{ orderDetail.phone }}</span>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">分管领导</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.leader }}</span>
                      <span class="contact-info">联系电话</span>
                      <span class="phone-number">{{ orderDetail.leaderPhone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧：时间信息 -->
        <el-col :span="8">
          <div class="time-section">
            <div class="time-header">
              <h3 class="section-title">时间信息</h3>
              <el-button size="small" type="primary">编辑时间</el-button>
            </div>
            <div class="time-list">
              <div class="time-item">
                <Icon icon="ep:calendar" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">创建时间</div>
                  <div class="time-value">{{ formatTime(orderDetail.createTime) }}</div>
                </div>
              </div>
              <div class="time-item">
                <Icon icon="ep:clock" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">截止时间</div>
                  <div class="time-value deadline">{{ formatTime(orderDetail.deadline) }}</div>
                </div>
              </div>
              <div class="time-item">
                <Icon icon="ep:refresh" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">最后更新</div>
                  <div class="time-value">{{ formatTime(orderDetail.updateTime) }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 进度更新记录 -->
      <div class="section-block">
        <h3 class="section-title">进度更新记录</h3>
        <div class="progress-records">
          <div v-for="(record, index) in progressRecords" :key="index" class="progress-item">
            <div class="progress-dot"></div>
            <div class="progress-content">
              <div class="progress-header">
                <span class="progress-title">{{ record.title }}</span>
                <span class="progress-name">{{ record.handler }}</span>
                <span class="progress-time">预计完成时间：{{ record.expectedTime }}</span>
              </div>
              <div class="progress-description">{{ record.description }}</div>
              <div v-if="record.attachments" class="progress-attachments">
                <div v-for="file in record.attachments" :key="file.name" class="attachment-item">
                  <Icon icon="ep:document" class="attachment-icon" />
                  <span class="attachment-name">{{ file.name }}</span>
                  <span class="attachment-date">{{ record.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 更多历史记录按钮 -->
        <div class="more-records-container">
          <el-button type="text" @click="showAllRecords" class="more-records-btn">
            更多历史记录
          </el-button>
        </div>
      </div>

      <!-- 底部内容区域 -->
      <el-row :gutter="20" class="bottom-content">
        <!-- 左侧：主要内容和承办事项 -->
        <el-col :span="16">
          <!-- 主要内容 -->
          <div class="section-block">
            <h3 class="section-title">主要内容</h3>
            <div class="content-box">
              {{ orderDetail.content }}
            </div>
          </div>

          <!-- 承办事项 -->
          <div class="section-block">
            <h3 class="section-title">承办事项</h3>
            <div class="content-box">
              {{ orderDetail.tasks }}
            </div>
          </div>
        </el-col>

        <!-- 右侧：所有文件 -->
        <el-col :span="8">
          <div class="section-block">
            <div class="section-header">
              <h3 class="section-title">所有文件</h3>
              <el-button size="small" type="primary">上传文件</el-button>
            </div>
            <div class="files-container">
              <div v-for="file in attachments" :key="file.id" class="file-row">
                <div class="file-icon-wrapper">
                  <Icon :icon="getFileIcon(file.type)" class="file-type-icon" :class="getFileIconClass(file.type)" />
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ file.size }} · {{ file.uploader }} · {{ formatTime(file.uploadTime) }}</div>
                </div>
                <div class="file-actions">
                  <Icon icon="ep:view" class="action-btn" @click="previewFile(file)" />
                  <Icon icon="ep:download" class="action-btn" @click="downloadFile(file)" />
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 流转记录 -->
      <div class="section-block">
        <h3 class="section-title">流转记录</h3>
        <div class="flow-timeline">
          <div v-for="(record, index) in circulationRecords" :key="index" class="flow-item">
            <div class="flow-dot" :class="record.completed ? 'completed' : 'pending'"></div>
            <div class="flow-line" v-if="index < circulationRecords.length - 1"></div>
            <div class="flow-content">
              <div class="flow-header">
                <span class="flow-action-badge">{{ record.action }}</span>
                <span class="flow-dept-badge">{{ record.fromDept }}</span>
                <span v-if="record.fromDept !== record.toDept" class="flow-arrow">→</span>
                <span v-if="record.fromDept !== record.toDept" class="flow-target-badge">{{ record.toDept }}</span>
              </div>
              <div class="flow-details">
                <span class="flow-handler">操作人：{{ record.handler }}</span>
                <span v-if="record.message" class="flow-message">{{ record.message }}</span>
              </div>
              <div class="flow-time">{{ record.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 历史记录弹窗 -->
  <el-dialog
    v-model="historyDialogVisible"
    title="进度更新记录"
    width="50%"
    class="history-dialog"
  >
    <div class="history-content">
      <div v-for="(record, index) in allProgressRecords" :key="index" class="history-item">
        <div class="history-dot"></div>
        <div class="history-info">
          <div class="history-header">
            <span class="history-title">{{ record.title }}</span>
            <span class="history-name">{{ record.handler }}</span>
            <span class="history-time">{{ record.time }}</span>
          </div>
          <div class="history-description">{{ record.description }}</div>
          <div v-if="record.attachments" class="history-attachments">
            <div v-for="file in record.attachments" :key="file.name" class="history-attachment">
              <Icon icon="ep:document" class="attachment-icon" />
              <span class="attachment-name">{{ file.name }}</span>
            </div>
          </div>
          <div v-if="record.expectedTime" class="expected-time">
            预计完成时间：{{ record.expectedTime }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'

interface Props {
  modelValue: boolean
  taskData: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// 弹框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 历史记录弹窗状态
const historyDialogVisible = ref(false)

// 督办单详情数据
const orderDetail = reactive({
  id: 1,
  orderNumber: 'FDSS41F74542',
  title: '关于加强校园管理工作的督查',
  category: '工作督办',
  priority: '高优先级',
  status: 2, // 0-草稿 1-已发布 2-进行中 3-已完成 4-已取消
  issueUnit: '校务督查室',
  issuer: '庞主任',
  issuerPhone: '1234567890',
  leadDept: '保卫处',
  supervisorName: '张处长',
  phone: '1234567890',
  collaborateDepts: ['学生处', '后勤处'],
  leader: '李副校长',
  leaderPhone: '1234567890',
  content: '根据上级部门要求，为进一步加强校园管理工作，确保校园安全稳定，现对相关工作进行督查。请各相关部门高度重视，认真落实各项措施，确保工作取得实效。',
  tasks: '1. 完善校园安全管理制度\n2. 加强校园巡查力度\n3. 建立应急响应机制\n4. 定期开展安全教育活动',
  createTime: '2025-07-15',
  deadline: '2025-08-15',
  updateTime: '2025-07-21 15:30'
})

// 进度更新记录
const progressRecords = ref([
  {
    title: '保卫处',
    handler: '张处长',
    description: '已完成教学楼、办公楼消防设施检查，发现问题15处，正在制定整改方案。',
    expectedTime: '2025-07-23 15:00',
    time: '2025-07-21 15:00',
    attachments: [
      { name: '消防检查报告.pdf' },
      { name: '问题清单.xlsx' }
    ]
  },
  {
    title: '后勤处',
    handler: '',
    description: '已完成主要建筑结构安全检查，发现轻微问题3处，已安排维修。',
    expectedTime: '2025-07-20 15:00',
    time: '2025-07-19 15:00',
    attachments: [
      { name: '建筑检查报告.pdf' }
    ]
  }
])

// 所有进度更新记录（包含更多历史记录）
const allProgressRecords = ref([
  {
    title: '保卫处',
    handler: '张处长',
    description: '已完成教学楼、办公楼消防设施检查，发现问题15处，正在制定整改方案。预计本周内完成整改。',
    expectedTime: '2025-07-23 15:00',
    time: '2025-07-21 15:00',
    attachments: [
      { name: '消防检查报告.pdf' },
      { name: '问题清单.xlsx' }
    ]
  },
  {
    title: '后勤处',
    handler: '',
    description: '已完成主要建筑结构安全检查，发现轻微问题3处，已安排维修。',
    expectedTime: '2025-07-20 15:00',
    time: '2025-07-19 15:00',
    attachments: [
      { name: '建筑检查报告.pdf' }
    ]
  },
  {
    title: '李副校长添加批示',
    handler: '',
    description: '请加快整改进度，确保按时完成。',
    time: '2025-07-16 15:00'
  },
  {
    title: '后勤处',
    handler: '',
    description: '已完成主要建筑结构安全检查，发现轻微问题3处，已安排维修。',
    time: '2025-07-19 15:00',
    attachments: [
      { name: '建筑检查报告.pdf' }
    ]
  },
  {
    title: '李副校长添加批示',
    handler: '',
    description: '请加快整改进度，确保按时完成。',
    expectedTime: '2025-07-20 15:00',
    time: '2025-07-16 15:00'
  }
])

// 附件列表
const attachments = ref([
  {
    id: 1,
    name: '校园管理工作方案.pdf',
    type: 'pdf',
    size: '2.5MB',
    uploader: '张三',
    uploadTime: '2025-07-15 09:30'
  },
  {
    id: 2,
    name: '校园管理工作方案.docx',
    type: 'docx',
    size: '1.2MB',
    uploader: '李四',
    uploadTime: '2025-07-15 10:00'
  },
  {
    id: 3,
    name: '校园管理工作方案二期.docx',
    type: 'docx',
    size: '2.8MB',
    uploader: '王五',
    uploadTime: '2025-07-16 09:00'
  },
  {
    id: 4,
    name: '消防检查报告.pdf',
    type: 'pdf',
    size: '3.2MB',
    uploader: '赵六',
    uploadTime: '2025-07-16 14:30'
  }
])

// 流转记录 - 根据任务信息动态生成
const circulationRecords = computed(() => {
  const records = []
  const baseTime = new Date(orderDetail.createTime + ' 10:00')

  // 1. 督办单起草
  records.push({
    action: '督办单起草',
    fromDept: orderDetail.issueUnit,
    toDept: orderDetail.issueUnit,
    handler: orderDetail.issuer,
    message: '请认真落实相关要求',
    time: formatDateTime(baseTime),
    completed: true
  })

  // 2. 督办单审核
  const reviewTime = new Date(baseTime.getTime() + 0 * 60 * 60 * 1000) // 同时进行
  records.push({
    action: '督办单审核',
    fromDept: orderDetail.issueUnit,
    toDept: orderDetail.issueUnit,
    handler: orderDetail.issuer,
    message: '审核通过',
    time: formatDateTime(reviewTime),
    completed: true
  })

  // 3. 移交督办
  const transferTime = new Date(baseTime.getTime() + 0 * 60 * 60 * 1000) // 同时进行
  records.push({
    action: '移交督办',
    fromDept: orderDetail.issueUnit,
    toDept: orderDetail.leadDept,
    handler: orderDetail.issuer,
    message: '',
    time: formatDateTime(transferTime),
    completed: true
  })

  // 4. 协办流转 - 指定协办部门
  const collaborateTime1 = new Date(baseTime.getTime() + 23 * 60 * 60 * 1000) // 23小时后
  records.push({
    action: '协办流转',
    fromDept: orderDetail.leadDept,
    toDept: orderDetail.collaborateDepts.join('、'),
    handler: orderDetail.supervisorName,
    message: `指定协办部门：${orderDetail.collaborateDepts.join('、')}`,
    time: formatDateTime(collaborateTime1),
    completed: true
  })

  // 5. 协办流转 - 工作提交复核（根据状态判断）
  const collaborateTime2 = new Date(baseTime.getTime() + 23.5 * 60 * 60 * 1000) // 23.5小时后
  const isInProgress = orderDetail.status === 2 // 进行中
  records.push({
    action: '协办流转',
    fromDept: orderDetail.collaborateDepts[1] || '后勤处',
    toDept: orderDetail.leadDept,
    handler: '张三三',
    message: isInProgress ? '工作内容提交复核' : '工作已完成提交复核',
    time: formatDateTime(collaborateTime2),
    completed: !isInProgress
  })

  return records
})

// 监听任务数据变化，更新详情
watch(() => props.taskData, (newTaskData) => {
  if (newTaskData) {
    // 根据传入的任务数据更新详情
    orderDetail.title = newTaskData.title || orderDetail.title
    orderDetail.content = newTaskData.description || newTaskData.mainContent || orderDetail.content
    orderDetail.tasks = newTaskData.undertakingContent || orderDetail.tasks
    orderDetail.leadDept = newTaskData.leadDepartment || '保卫处' // 默认牵头部门
    orderDetail.collaborateDepts = newTaskData.assistDepartments || newTaskData.collaborators || orderDetail.collaborateDepts
    orderDetail.supervisorName = newTaskData.supervisor || orderDetail.supervisorName
    orderDetail.leader = newTaskData.supervisor || orderDetail.leader
    orderDetail.deadline = newTaskData.deadline || orderDetail.deadline
    orderDetail.createTime = newTaskData.createdDate || newTaskData.createTime || orderDetail.createTime
    orderDetail.urgencyLevel = newTaskData.priority === '高优先级' ? 3 : newTaskData.priority === '中优先级' ? 2 : 1
    orderDetail.status = newTaskData.status === '进行中' ? 2 : newTaskData.status === '已完成' ? 3 : 1
    orderDetail.issuer = newTaskData.issuer || orderDetail.issuer
  }
}, { immediate: true })

// 方法
const handleClose = () => {
  dialogVisible.value = false
}

// 显示所有历史记录
const showAllRecords = () => {
  historyDialogVisible.value = true
}

const handleEdit = () => {
  ElMessage.info('编辑功能开发中...')
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleFileUpload = () => {
  ElMessage.info('文件上传功能开发中...')
}

const previewFile = (file: any) => {
  ElMessage.info(`预览文件：${file.name}`)
}

const downloadFile = (file: any) => {
  ElMessage.success(`下载文件：${file.name}`)
}

const getPriorityType = (priority: string) => {
  const types = {
    '高优先级': 'danger',
    '中优先级': 'warning',
    '一般优先': ''
  }
  return types[priority as keyof typeof types] || ''
}

const getStatusType = (status: number) => {
  const types = { 0: 'info', 1: 'primary', 2: 'warning', 3: 'success', 4: 'danger' }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: number) => {
  const texts = { 0: '草稿', 1: '已发布', 2: '进行中', 3: '已完成', 4: '已取消' }
  return texts[status as keyof typeof texts] || '未知'
}

const getUrgencyType = (level: number) => {
  const types = { 1: '', 2: 'warning', 3: 'danger' }
  return types[level as keyof typeof types] || ''
}

const getUrgencyText = (level: number) => {
  const texts = { 1: '一般', 2: '紧急', 3: '特急' }
  return texts[level as keyof typeof texts] || '一般'
}

const getFileIcon = (type: string) => {
  const icons = {
    pdf: 'ep:document',
    docx: 'ep:document',
    doc: 'ep:document',
    xlsx: 'ep:document',
    xls: 'ep:document',
    pptx: 'ep:document',
    ppt: 'ep:document'
  }
  return icons[type as keyof typeof icons] || 'ep:document'
}

const getFileIconClass = (type: string) => {
  const classes = {
    pdf: 'pdf-icon',
    docx: 'word-icon',
    doc: 'word-icon',
    xlsx: 'excel-icon',
    xls: 'excel-icon',
    pptx: 'ppt-icon',
    ppt: 'ppt-icon'
  }
  return classes[type as keyof typeof classes] || 'default-icon'
}

const formatTime = (time: string) => {
  if (!time) return ''
  return time.replace(/:\d{2}$/, '') // 移除秒数，只显示到分钟
}

const formatDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.supervision-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

.supervision-detail-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.supervision-detail-dialog :deep(.el-dialog__title) {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

/* 额外的选择器确保样式生效 */
.el-dialog.supervision-detail-dialog .el-dialog__header .el-dialog__title {
  font-size: 40px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

/* 全局选择器作为备用 */
.el-dialog__title {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

/* 自定义标题样式 */
.custom-dialog-title {
  font-size: 20px;
  font-weight: 550;
  color: #303133;
  margin: 0;
  padding: 0 20px;
}

.supervision-detail {
  padding: 20px;
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.status-tags {
  display: flex;
  gap: 16px;
}

.status-tag {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid;
}

.priority-tag {
  background-color: #fef0f0;
  color: #f56c6c;
  border-color: #fbc4c4;
}

.status-tag-item {
  background-color: #f0f9ff;
  color: #409eff;
  border-color: #b3d8ff;
}

.category-tag {
  background-color: #f4f4f5;
  color: #909399;
  border-color: #d3d4d6;
}

.doc-number {
  color: #909399;
  font-size: 14px;
}

/* 主要内容区域 */
.main-content {
  margin-bottom: 20px;
}

.main-content .el-col {
  display: flex;
  flex-direction: column;
}

.info-section,
.time-section {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bottom-content {
  margin-bottom: 20px;
}

.bottom-content .el-col {
  display: flex;
  flex-direction: column;
}

.bottom-content .el-col:first-child {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bottom-content .section-block {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 信息区块样式 */
.info-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

/* 任务信息容器样式 */
.task-info-container {
  padding: 16px;
}

.task-info-row {
  display: flex;
  gap: 40px;
  align-items: stretch;
}

.task-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
  justify-content: flex-start;
}

.group-title {
  color: #909399;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.info-item-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  min-height: 40px;
}

.item-icon {
  color: #409eff;
  font-size: 16px;
}

.item-text {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.contact-info {
  color: #909399;
  font-size: 14px;
  margin-left: 16px;
}

.phone-number {
  color: #303133;
  font-size: 16px;
  margin-left: 4px;
}

/* 时间信息样式 */
.time-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.time-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-icon {
  color: #409eff;
  font-size: 16px;
}

.time-content {
  flex: 1;
}

.time-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.time-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.time-value.deadline {
  color: #f56c6c;
}

/* 区块样式 */
.section-block {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-box {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  color: #303133;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-line;
  min-height: 80px;
}

/* 进度更新记录样式 */
.progress-records {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  margin-top: 6px;
  flex-shrink: 0;
}

.progress-content {
  flex: 1;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.progress-name {
  color: #606266;
  font-size: 16px;
}

.progress-time {
  color: #f56c6c;
  font-size: 14px;
  margin-left: auto;
}

.progress-description {
  color: #606266;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.progress-attachments {
  display: flex;
  gap: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 16px;
}

.attachment-icon {
  font-size: 18px;
}

.attachment-name {
  color: #409eff;
}

.attachment-date {
  color: #909399;
  font-size: 14px;
  margin-left: 8px;
}

/* 更多历史记录按钮样式 */
.more-records-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.more-records-btn {
  color: #409eff;
  font-size: 16px;
  text-decoration: none;
}

.more-records-btn:hover {
  color: #66b1ff;
}

/* 历史记录弹窗样式 */
.history-dialog :deep(.el-dialog__body) {
  max-height: 500px;
  overflow-y: auto;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
}

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  margin-top: 6px;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.history-title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.history-name {
  color: #606266;
  font-size: 16px;
}

.history-time {
  color: #909399;
  font-size: 14px;
  margin-left: auto;
}

.history-description {
  color: #606266;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.history-attachments {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.history-attachment {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 16px;
}

.expected-time {
  color: #f56c6c;
  font-size: 14px;
}

/* 文件列表样式 */
.files-container {
  max-height: 300px;
  overflow-y: auto;
}

.file-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.file-row:last-child {
  border-bottom: none;
}

.file-icon-wrapper {
  flex-shrink: 0;
}

.file-type-icon {
  font-size: 20px;
}

.pdf-icon {
  color: #f56c6c;
}

.word-icon {
  color: #409eff;
}

.excel-icon {
  color: #67c23a;
}

.ppt-icon {
  color: #e6a23c;
}

.default-icon {
  color: #909399;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 2px;
  word-break: break-all;
}

.file-meta {
  font-size: 12px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  padding: 4px;
}

.action-btn:hover {
  color: #409eff;
}

/* 流转记录样式 */
.flow-timeline {
  position: relative;
}

.flow-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.flow-item:last-child {
  border-bottom: none;
}

.flow-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
  z-index: 2;
}

.flow-dot.completed {
  background: #409eff;
  border: 2px solid #409eff;
}

.flow-dot.pending {
  background: #e6a23c;
  border: 2px solid #e6a23c;
}

.flow-line {
  position: absolute;
  left: 5px;
  top: 20px;
  bottom: -16px;
  width: 2px;
  background: #e4e7ed;
  z-index: 1;
}

.flow-content {
  flex: 1;
  min-width: 0;
}

.flow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.flow-action-badge {
  background: #e1f3ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.flow-dept-badge {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.flow-arrow {
  color: #909399;
  font-size: 14px;
  margin: 0 4px;
}

.flow-target-badge {
  background: #e8f5e8;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.flow-details {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.flow-handler {
  color: #606266;
  font-size: 14px;
}

.flow-message {
  color: #606266;
  font-size: 14px;
}

.flow-time {
  color: #909399;
  font-size: 14px;
}

/* 底部内容区域 */
.bottom-content {
  margin-top: 20px;
}
</style>

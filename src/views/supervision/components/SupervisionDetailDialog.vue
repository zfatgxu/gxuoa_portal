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
          <span :class="['status-tag', 'priority-tag', `priority-${orderDetail.priorityType}`]">{{ orderDetail.priority }}</span>
          <span class="status-tag status-tag-item">{{ getStatusText() }}</span>
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
                      <span class="item-text">{{ orderDetail.collaborateDepts.length > 0 ? orderDetail.collaborateDepts.join('、') : '' }}</span>
                    </div>
                  </div>
                </div>

                <div class="task-info-col">
                  <div class="info-group">
                    <div class="group-title">下发人</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.issuer }}</span>
                      <template v-if="orderDetail.issuerPhone">
                        <span class="contact-info-inline">联系电话</span>
                        <span class="phone-number">{{ orderDetail.issuerPhone }}</span>
                      </template>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">负责人</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.supervisorName }}</span>
                      <template v-if="orderDetail.phone">
                        <span class="contact-info-inline">联系电话</span>
                        <span class="phone-number">{{ orderDetail.phone }}</span>
                      </template>
                    </div>
                  </div>

                  <div class="info-group">
                    <div class="group-title">分管领导</div>
                    <div class="info-item-new">
                      <Icon icon="ep:user" class="item-icon" />
                      <span class="item-text">{{ orderDetail.leader }}</span>
                      <template v-if="orderDetail.leaderPhone">
                        <span class="contact-info-inline">联系电话</span>
                        <span class="phone-number">{{ orderDetail.leaderPhone }}</span>
                      </template>
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
            </div>
            <div class="time-list">
              <div class="time-item">
                <Icon icon="ep:calendar" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">创建时间</div>
                  <div class="time-value">{{ orderDetail.createTime }}</div>
                </div>
              </div>
              <div class="time-item">
                <Icon icon="ep:clock" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">截止时间</div>
                  <div :class="getDeadlineTimeClass()">{{ orderDetail.deadline }}</div>
                </div>
              </div>
              <div class="time-item">
                <Icon icon="ep:refresh" class="time-icon" />
                <div class="time-content">
                  <div class="time-label">最后更新</div>
                  <div class="time-value">{{ orderDetail.updateTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 进度更新记录 -->
      <div class="section-block">
        <div class="section-header">
          <h3 class="section-title">进度更新记录</h3>
          <el-button
            v-if="!isSupervisionEnded"
            type="primary"
            @click="showAddProgressDialog"
          >
            <Icon icon="ep:plus" />
            添加更新
          </el-button>
        </div>



        <div class="progress-records" v-if="progressRecords.length > 0">
          <div v-for="(record, index) in progressRecords" :key="index" class="progress-item">
            <div class="progress-dot"></div>
            <div class="progress-content">
              <div class="progress-header">
                <div class="progress-left">
                  <span class="progress-title">{{ record.title }}</span>
                  <span class="progress-name" v-if="record.handler">{{ record.handler }}</span>
                </div>
                <div class="progress-right">
                  <span class="progress-time">预计完成时间：{{ record.expectedTime || '未设置' }}</span>
                </div>
              </div>
              <div class="progress-description" v-if="record.description && record.description !== '暂无详细信息'">{{ record.description }}</div>
              <div v-if="record.attachments && record.attachments.length > 0" class="progress-attachments">
                <div v-for="file in record.attachments" :key="file.id || file.name" class="attachment-item">
                  <Icon icon="ep:document" class="attachment-icon" />
                  <span class="attachment-name" @click="downloadProgressFile(file)" style="cursor: pointer;">{{ file.name }}</span>
                </div>
                <div class="attachment-time" v-if="record.time">{{ record.time }}</div>
              </div>
              <div v-else-if="record.time" class="attachment-time">{{ record.time }}</div>
            </div>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-else class="empty-records">
          <el-empty description="暂无进度更新记录" :image-size="80" />
        </div>

        <!-- 更多历史记录按钮 -->
        <div class="more-records-container" v-if="hasMoreRecords">
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
            </div>
            <div class="files-container">
              <div v-if="attachments.length === 0" class="empty-state">
                <p>暂无附件</p>
              </div>
              <div v-for="file in attachments" :key="file.id" class="file-row">
                <div class="file-icon-wrapper">
                  <Icon :icon="getFileIcon(file.type)" class="file-type-icon" :class="getFileIconClass(file.type)" />
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ file.size }} · {{ file.uploader }} · {{ file.uploadTime }}</div>
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

      <!-- 流转记录 - 使用真实工作流数据 -->
      <div class="section-block">
        <h3 class="section-title">流转记录</h3>
        <div v-loading="loading" class="workflow-timeline">
          <el-timeline class="workflow-timeline-content">
            <!-- 遍历每个审批节点 -->
            <el-timeline-item
              v-for="(activity, index) in activityNodes"
              :key="index"
              size="large"
              :icon="getApprovalNodeIcon(activity.status, activity.nodeType)"
              :color="getApprovalNodeColor(activity.status)"
            >
              <template #dot>
                <div class="workflow-node-container">
                  <img class="workflow-node-img" :src="getApprovalNodeImg(activity.nodeType)" alt="" />
                  <div
                    class="workflow-node-status"
                    :style="{ backgroundColor: getApprovalNodeColor(activity.status) }"
                  >
                    <el-icon :size="11" color="#fff">
                      <component :is="getApprovalNodeIcon(activity.status, activity.nodeType)" />
                    </el-icon>
                  </div>
                </div>
              </template>
              <div class="workflow-activity-content">
                <!-- 第一行：节点名称、时间 -->
                <div class="workflow-activity-header">
                  <div class="workflow-activity-name">{{ activity.name }}</div>
                  <!-- 信息：时间 -->
                  <div
                    v-if="activity.status !== TaskStatusEnum.NOT_START"
                    class="workflow-activity-time"
                  >
                    {{ getApprovalNodeTime(activity) }}
                  </div>
                </div>
                <div class="workflow-activity-tasks">
                  <!-- 遍历每个审批节点下的task任务 -->
                  <div v-for="(task, idx) in activity.tasks" :key="idx" class="workflow-task-item">
                    <div
                      class="workflow-task-user"
                      v-if="task.assigneeUser || task.ownerUser"
                    >
                      <!-- 信息：头像昵称 -->
                      <div class="workflow-user-info">
                        <template v-if="task.assigneeUser?.avatar || task.assigneeUser?.nickname">
                          <el-avatar
                            class="workflow-user-avatar"
                            :size="28"
                            v-if="task.assigneeUser?.avatar"
                            :src="task.assigneeUser?.avatar"
                          />
                          <el-avatar class="workflow-user-avatar" :size="28" v-else>
                            {{ task.assigneeUser?.nickname.substring(0, 1) }}
                          </el-avatar>
                          <span class="workflow-user-name">{{ task.assigneeUser?.nickname }}</span>
                        </template>
                        <template v-else-if="task.ownerUser?.avatar || task.ownerUser?.nickname">
                          <el-avatar
                            class="workflow-user-avatar"
                            :size="28"
                            v-if="task.ownerUser?.avatar"
                            :src="task.ownerUser?.avatar"
                          />
                          <el-avatar class="workflow-user-avatar" :size="28" v-else>
                            {{ task.ownerUser?.nickname.substring(0, 1) }}
                          </el-avatar>
                          <span class="workflow-user-name">{{ task.ownerUser?.nickname }}</span>
                        </template>
                      </div>
                    </div>
                    <!-- 审批意见 -->
                    <div
                      v-if="task.reason && [NodeType.USER_TASK_NODE, NodeType.END_EVENT_NODE].includes(activity.nodeType)"
                      class="workflow-task-reason"
                    >
                      审批意见：{{ task.reason }}
                    </div>
                  </div>
                  <!-- 候选用户 -->
                  <div
                    v-for="(user, idx1) in activity.candidateUsers"
                    :key="idx1"
                    class="workflow-candidate-user"
                  >
                    <el-avatar class="workflow-user-avatar" :size="28" v-if="user.avatar" :src="user.avatar" />
                    <el-avatar class="workflow-user-avatar" :size="28" v-else>
                      {{ user.nickname.substring(0, 1) }}
                    </el-avatar>
                    <span class="workflow-user-name">{{ user.nickname }}</span>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
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
    <div class="history-content" v-loading="historyLoading">
      <div v-if="allProgressRecords.length > 0">
        <div v-for="(record, index) in allProgressRecords" :key="index" class="history-item">
          <div class="history-dot"></div>
          <div class="history-info">
            <div class="history-header">
              <div class="history-left">
                <span class="history-title">{{ record.title }}</span>
                <span class="history-name" v-if="record.handler">{{ record.handler }}</span>
              </div>
              <div class="history-right">
                <span class="history-expected-time">预计完成时间：{{ record.expectedTime || '未设置' }}</span>
              </div>
            </div>
            <div class="history-description" v-if="record.description && record.description !== '暂无详细信息'">{{ record.description }}</div>
            <div v-if="record.attachments && record.attachments.length > 0" class="history-attachments">
              <div v-for="file in record.attachments" :key="file.id || file.name" class="history-attachment">
                <Icon icon="ep:document" class="attachment-icon" />
                <span class="attachment-name" @click="downloadProgressFile(file)" style="cursor: pointer;">{{ file.name }}</span>
              </div>
              <div class="history-time" v-if="record.time">{{ record.time }}</div>
            </div>
            <div v-else-if="record.time" class="history-time">{{ record.time }}</div>
          </div>
        </div>
      </div>
      <div v-else-if="!historyLoading" class="empty-history">
        <el-empty description="暂无历史记录" :image-size="80" />
      </div>
    </div>
  </el-dialog>

  <!-- 添加进度更新弹窗 -->
  <el-dialog
    v-model="addProgressDialogVisible"
    title="添加进度更新"
    width="50%"
    class="add-progress-dialog"
  >
    <el-form :model="progressForm" :rules="progressRules" ref="progressFormRef" label-width="120px">
      <el-form-item label="当前进度：" prop="deptDetail">
        <el-input
          v-model="progressForm.deptDetail"
          type="textarea"
          :rows="4"
          placeholder="请输入当前进度情况"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="预计完成时间：" prop="planTime">
        <el-date-picker
          v-model="progressForm.planTime"
          type="datetime"
          placeholder="选择预计完成时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="上传附件：">
        <el-upload
          ref="uploadRef"
          v-model:file-list="progressForm.fileList"
          :http-request="customUpload"
          :limit="10"
          :multiple="true"
          :auto-upload="true"
          :show-file-list="true"
          :on-error="handleCustomUploadError"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
          action="#"
        >
          <el-button type="primary">选取文件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持上传 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式文件，单个文件不超过10MB，最多上传10个文件
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelAddProgress">取消</el-button>
        <el-button type="primary" @click="submitAddProgress">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { formatDate } from '@/utils/formatTime'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { TaskStatusEnum } from '@/api/bpm/task'
import { NodeType, CandidateStrategy } from '@/components/SimpleProcessDesignerV2/src/consts'
import { isEmpty } from '@/utils/is'
import { Check, Close, Loading, Clock, Minus, Delete } from '@element-plus/icons-vue'
import { OrderApi } from '@/api/supervision'
import * as FileApi from '@/api/infra/file'
import { KKFileView } from '@/components/KKFileView'
import starterSvg from '@/assets/svgs/bpm/starter.svg'
import auditorSvg from '@/assets/svgs/bpm/auditor.svg'
import copySvg from '@/assets/svgs/bpm/copy.svg'
import conditionSvg from '@/assets/svgs/bpm/condition.svg'
import parallelSvg from '@/assets/svgs/bpm/parallel.svg'
import finishSvg from '@/assets/svgs/bpm/finish.svg'
import transactorSvg from '@/assets/svgs/bpm/transactor.svg'
import childProcessSvg from '@/assets/svgs/bpm/child-process.svg'

interface Props {
  modelValue: boolean
  taskData: any
  processInstanceId?: string  // 新增：流程实例ID
  supervisionStatus?: string  // 新增：督办状态（从首页传递）
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// 弹框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 判断督办是否已结束（不能再添加更新）
const isSupervisionEnded = computed(() => {
  // 根据督办状态判断，支持前端显示状态和后端原始状态
  return props.supervisionStatus === '办结文件' ||
         props.supervisionStatus === '否决文件' ||
         props.supervisionStatus === '已结束'
})

// 历史记录弹窗状态
const historyDialogVisible = ref(false)
const historyLoading = ref(false)

// 添加进度更新弹窗状态
const addProgressDialogVisible = ref(false)
const progressFormRef = ref()

// 进度更新表单数据
const progressForm = reactive({
  deptDetail: '',
  planTime: '',
  fileList: [] as Array<{
    id?: number
    name: string
    url: string
    size?: string
    raw?: File
    uid?: string | number
  }>
})

// 进度更新表单验证规则
const progressRules = {
  deptDetail: [
    { required: true, message: '请输入当前进度情况', trigger: 'blur' }
  ]
}

// 进度更新记录相关状态
const hasMoreRecords = ref(false)

// 工作流相关数据
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([])
const loading = ref(false)

// 督办单详情数据（从API获取）
const orderDetailData = ref<any>({})
// 附件数据（从API获取）
const attachmentData = ref<any[]>([])

// 工作流状态映射
const statusIconMap = {
  // 审批未开始
  '-1': { color: '#909398', icon: Clock },
  '0': { color: '#00b32a', icon: Clock },
  // 审批中
  '1': { color: '#448ef7', icon: Loading },
  // 审批通过
  '2': { color: '#00b32a', icon: Check },
  // 审批不通过
  '3': { color: '#f46b6c', icon: Close },
  // 已取消
  '4': { color: '#cccccc', icon: Delete },
  // 退回
  '5': { color: '#f46b6c', icon: Minus },
  // 委派中
  '6': { color: '#448ef7', icon: Loading },
  // 审批通过中
  '7': { color: '#00b32a', icon: Check }
}

const nodeTypeSvgMap = {
  // 结束节点
  [NodeType.END_EVENT_NODE]: { color: '#909398', svg: finishSvg },
  // 发起人节点
  [NodeType.START_USER_NODE]: { color: '#909398', svg: starterSvg },
  // 审批人节点
  [NodeType.USER_TASK_NODE]: { color: '#ff943e', svg: auditorSvg },
  // 办理人节点
  [NodeType.TRANSACTOR_NODE]: { color: '#ff943e', svg: transactorSvg },
  // 抄送人节点
  [NodeType.COPY_TASK_NODE]: { color: '#3296fb', svg: copySvg },
  // 条件分支节点
  [NodeType.CONDITION_NODE]: { color: '#14bb83', svg: conditionSvg },
  // 并行分支节点
  [NodeType.PARALLEL_BRANCH_NODE]: { color: '#14bb83', svg: parallelSvg },
  // 子流程节点
  [NodeType.CHILD_PROCESS_NODE]: { color: '#14bb83', svg: childProcessSvg }
}

// 工作流相关方法
const getApprovalNodeImg = (nodeType: NodeType) => {
  return nodeTypeSvgMap[nodeType]?.svg
}

const getApprovalNodeIcon = (taskStatus: number, nodeType: NodeType) => {
  if (taskStatus == TaskStatusEnum.NOT_START) {
    return statusIconMap[taskStatus]?.icon
  }

  if (
    nodeType === NodeType.START_USER_NODE ||
    nodeType === NodeType.USER_TASK_NODE ||
    nodeType === NodeType.TRANSACTOR_NODE ||
    nodeType === NodeType.CHILD_PROCESS_NODE ||
    nodeType === NodeType.END_EVENT_NODE
  ) {
    return statusIconMap[taskStatus]?.icon
  }
}

const getApprovalNodeColor = (taskStatus: number) => {
  return statusIconMap[taskStatus]?.color
}

const getApprovalNodeTime = (node: ProcessInstanceApi.ApprovalNodeInfo) => {
  if (node.nodeType === NodeType.START_USER_NODE && node.startTime) {
    return `${formatDate(node.startTime)}`
  }
  if (node.endTime) {
    return `${formatDate(node.endTime)}`
  }
  if (node.startTime) {
    return `${formatDate(node.startTime)}`
  }
}

// 获取督办单详情数据
const getSupervisionOrderDetail = async (processInstanceId: string) => {
  if (!processInstanceId) return

  try {
    const data = await OrderApi.getSupervisionOrderTaskDetail(processInstanceId)

    if (data) {
      // 判断data是否直接包含orderCode字段
      const apiData: any = data.orderCode ? data : data.data

      if (apiData) {
        orderDetailData.value = apiData

        // 处理协办部门
        const coDeptNames: string[] = []
        if (apiData.coDeptNameMap) {
          for (const key in apiData.coDeptNameMap) {
            coDeptNames.push(apiData.coDeptNameMap[key])
          }
        }

        // 格式化时间函数（不显示秒数）
        const formatTime = (timestamp: number) => {
          if (!timestamp) return ''
          const date = new Date(timestamp)
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '/').replace(',', '')
        }

        // 更新督办单详情
        orderDetail.orderNumber = apiData.orderCode || ''
        orderDetail.title = apiData.orderTitle || ''
        orderDetail.category = getSupervisionTypeText(apiData.type)
        orderDetail.priority = getPriorityText(apiData.priority)
        orderDetail.priorityType = getPriorityType(apiData.priority)
        orderDetail.issueUnit = apiData.creatorDeptName || ''
        orderDetail.issuer = apiData.creatorNickName || ''
        orderDetail.issuerPhone = apiData.creatorPhone || ''
        orderDetail.leadDept = apiData.leadDeptName || ''
        orderDetail.supervisorName = apiData.leaderNickname || ''
        orderDetail.phone = apiData.leaderPhone || ''
        orderDetail.collaborateDepts = coDeptNames
        orderDetail.leader = apiData.leaderNickname || ''
        orderDetail.leaderPhone = apiData.leaderPhone || ''
        orderDetail.content = apiData.content || ''
        orderDetail.tasks = apiData.undertakeMatter || ''
        orderDetail.createTime = formatTime(apiData.createTime)
        orderDetail.deadline = formatTime(apiData.deadline)
        orderDetail.updateTime = formatTime(apiData.lastTime)
      }
    }
  } catch (error) {
    ElMessage.error('获取督办单详情失败')
  }
}

// 获取附件列表
const getAttachmentList = async (processInstanceId: string) => {
  if (!processInstanceId) return

  try {
    const data = await OrderApi.getAttachments(processInstanceId)

    let attachmentList: any[] = []

    // 处理各种可能的响应格式
    if (data && data.data && Array.isArray(data.data)) {
      attachmentList = data.data
    } else if (data && Array.isArray(data)) {
      attachmentList = data
    } else if (data && data.code === 0 && data.data) {
      attachmentList = Array.isArray(data.data) ? data.data : []
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      // 尝试找到数组字段
      const possibleArrayFields = ['list', 'items', 'files', 'attachments']
      for (const field of possibleArrayFields) {
        if (data[field] && Array.isArray(data[field])) {
          attachmentList = data[field]
          break
        }
      }
    }

    if (attachmentList.length > 0) {
      attachmentData.value = attachmentList
      updateAttachmentsFromAPI(attachmentList)
    } else {
      attachments.value = []
    }
  } catch (error) {
    ElMessage.error('获取附件列表失败')
  }
}

// 获取工作流审批详情
const getWorkflowDetail = async (processInstanceId: string) => {
  if (!processInstanceId) return

  try {
    const param = {
      processInstanceId: processInstanceId,
      activityId: undefined,
      taskId: undefined
    }
    const data = await ProcessInstanceApi.getApprovalDetail(param)
    if (data && data.activityNodes) {
      activityNodes.value = data.activityNodes
    }
  } catch (error) {
    ElMessage.error('获取工作流详情失败')
    throw error
  }
}

// 获取进度更新记录
const getProgressRecords = async (processInstanceId: string, showAll: boolean = false) => {
  if (!processInstanceId) return

  try {
    const data = await OrderApi.getSupervisionTaskDetail(processInstanceId, showAll)

    // 处理不同的响应格式
    let apiData: any
    if (data && data.data) {
      apiData = data.data
    } else if (data && data.code === 0) {
      // 如果响应格式是 { code: 0, data: {...}, msg: "" }
      apiData = data.data
    } else if (data) {
      // 如果直接返回数据
      apiData = data
    }

    if (apiData) {
      // 根据showAll参数决定使用哪个数据源
      let recordsToProcess: any[] = []

      if (showAll) {
        // 显示全部记录时，优先使用allRecords，如果没有则使用latestRecords
        recordsToProcess = apiData.allRecords || apiData.latestRecords || []
      } else {
        // 默认显示时，使用latestRecords
        recordsToProcess = apiData.latestRecords || []
      }

      if (Array.isArray(recordsToProcess) && recordsToProcess.length > 0) {
        const formattedRecords = recordsToProcess.map((record: any) => {
          return {
            title: record.creatorDeptName || '未知部门',
            handler: record.creatorNickName || '',
            description: record.deptDetail || '暂无详细信息',
            expectedTime: record.planTime ? formatTimestamp(record.planTime) : '',
            time: record.createTime ? formatTimestamp(record.createTime) : (record.planTime ? formatTimestamp(record.planTime) : ''),
            attachments: record.fileList && Array.isArray(record.fileList) ? record.fileList : []
          }
        })

        if (showAll) {
          // 如果是显示全部记录，更新allProgressRecords
          allProgressRecords.value = formattedRecords
        } else {
          // 如果是默认显示，更新progressRecords
          progressRecords.value = formattedRecords
          // 设置是否有更多记录
          hasMoreRecords.value = apiData.hasMore || false
        }
      } else {
        if (showAll) {
          allProgressRecords.value = []
        } else {
          progressRecords.value = []
          hasMoreRecords.value = false
        }
      }
    }
  } catch (error) {
    ElMessage.error('获取进度更新记录失败')
  }
}

// 更新附件列表数据
const updateAttachmentsFromAPI = (apiData: any[]) => {
  if (!Array.isArray(apiData)) {
    attachments.value = []
    return
  }

  attachments.value = apiData.map(item => ({
    id: item.id,
    name: item.name,
    type: getFileTypeFromUrl(item.url),
    size: formatFileSize(item.size),
    uploader: item.creatorName || '未知',
    uploadTime: formatTimestamp(item.createTime),
    url: item.url
  }))
}

// 督办单详情数据
const orderDetail = reactive({
  id: 1,
  orderNumber: '',
  title: '',
  category: '工作督办',
  priority: '一般优先',
  priorityType: 'info',
  // status 字段已移除，直接使用传递的督办状态
  issueUnit: '',
  issuer: '',
  issuerPhone: '',
  leadDept: '',
  supervisorName: '',
  phone: '',
  collaborateDepts: [],
  leader: '',
  leaderPhone: '',
  content: '',
  tasks: '',
  createTime: '',
  deadline: '',
  updateTime: ''
})

// 进度更新记录
const progressRecords = ref<any[]>([])

// 所有进度更新记录（包含更多历史记录）
const allProgressRecords = ref<any[]>([])

// 附件列表
const attachments = ref<any[]>([])


// 加载所有数据的统一方法
const loadAllData = async (processInstanceId: string) => {
  if (!processInstanceId) return

  loading.value = true
  try {
    // 并行获取所有数据，即使某个请求失败也不影响其他请求
    const [orderResult, attachmentResult, workflowResult, progressResult] = await Promise.allSettled([
      getSupervisionOrderDetail(processInstanceId),
      getAttachmentList(processInstanceId),
      getWorkflowDetail(processInstanceId),
      getProgressRecords(processInstanceId, false) // 默认只获取最新的几条记录
    ])

    // 检查各个请求的结果
    if (orderResult.status === 'rejected') {
      console.error('获取督办单详情失败:', orderResult.reason)
    }
    if (attachmentResult.status === 'rejected') {
      console.error('获取附件列表失败:', attachmentResult.reason)
    }
    if (workflowResult.status === 'rejected') {
      console.error('获取工作流详情失败:', workflowResult.reason)
    }
    if (progressResult.status === 'rejected') {
      console.error('获取进度更新记录失败:', progressResult.reason)
    }
  } catch (error) {
    console.error('加载数据时发生错误:', error)
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态，当弹窗打开时获取所有数据
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.processInstanceId) {
    loadAllData(props.processInstanceId)
  }
}, { immediate: true })

// 监听 processInstanceId 变化
watch(() => props.processInstanceId, (newProcessInstanceId) => {
  if (newProcessInstanceId && props.modelValue) {
    loadAllData(newProcessInstanceId)
  }
}, { immediate: true })

// 优先级判断方法（与其他页面保持一致）
const getPriorityType = (priority) => {
  if (priority === 1) return 'info'    // 一般优先级
  if (priority === 2) return 'warning' // 中优先级
  if (priority === 3) return 'danger'  // 高优先级
  return 'info' // 一般优先级
}

const getPriorityText = (priority) => {
  if (priority === 1) return '一般优先'
  if (priority === 2) return '中优先级'
  if (priority === 3) return '高优先级'
  return '一般优先'
}

// 根据type字段获取督办类型文本
const getSupervisionTypeText = (type: number) => {
  switch (type) {
    case 1: return '工作督办'
    case 2: return '专项督办'
    default: return ' '
  }
}

// 方法
const handleClose = () => {
  dialogVisible.value = false
}

// 显示所有历史记录
const showAllRecords = async () => {
  if (!props.processInstanceId) return

  historyDialogVisible.value = true
  historyLoading.value = true

  try {
    // 获取全部进度更新记录
    await getProgressRecords(props.processInstanceId, true)
  } catch (error) {
    console.error('获取全部进度记录失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 显示添加进度更新弹窗
const showAddProgressDialog = () => {
  addProgressDialogVisible.value = true
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
}

// 取消添加进度更新
const cancelAddProgress = () => {
  addProgressDialogVisible.value = false
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
}

// 文件上传相关方法
const uploadRef = ref()

// 自定义上传方法
const customUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 调用文件上传API
    const result = await FileApi.updateFile(formData)

    // 检查响应结果
    if (result.code === 0) {
      // 上传成功，设置文件URL
      file.url = result.data

      // 更新文件列表中对应文件的URL
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList[index].url = file.url
      }

      // 调用成功回调
      onSuccess(result)
      ElMessage.success(`文件 ${file.name} 上传成功`)
    } else {
      // 上传失败
      const error = new Error(result.msg || '文件上传失败')

      // 从文件列表中移除失败的文件
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList.splice(index, 1)
      }

      onError(error)
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)

    // 从文件列表中移除失败的文件
    const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      progressForm.fileList.splice(index, 1)
    }

    onError(error)
    ElMessage.error('文件上传失败，请重试')
  }
}

// 处理自定义上传失败
const handleCustomUploadError = (error: any, file: any) => {
  console.error('自定义上传失败:', error, file)
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
}

// 文件移除处理
const handleFileRemove = async (file: any) => {
  try {
    // 从文件列表中移除
    const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      progressForm.fileList.splice(index, 1)
      ElMessage.success('文件已移除')
    }
  } catch (error) {
    console.error('删除附件失败:', error)
    ElMessage.error('删除附件失败')
  }
}

// 上传前验证
const beforeUpload = (file: File) => {
  // 检查文件数量限制
  if (progressForm.fileList.length >= 10) {
    ElMessage.error('上传文件数量不能超过10个!')
    return false
  }

  // 检查文件类型
  const allowedTypes = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt']
  let fileExtension = ''
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
  }

  const isValidType = allowedTypes.includes(fileExtension) ||
    allowedTypes.some(type => file.type.toLowerCase().includes(type))

  if (!isValidType) {
    ElMessage.error(`文件格式不正确, 请上传 ${allowedTypes.join('/')} 格式文件!`)
    return false
  }

  // 检查文件大小 (10MB)
  const isValidSize = file.size < 10 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过10MB!')
    return false
  }

  ElMessage.success('正在上传文件，请稍候...')
  return true
}

// 提交添加进度更新
const submitAddProgress = async () => {
  if (!progressFormRef.value) return

  try {
    // 验证表单
    await progressFormRef.value.validate()

    // 处理文件列表，只包含已成功上传的文件
    const fileList = progressForm.fileList
      .filter(file => file.url && file.url !== '') // 只包含有URL的文件
      .map(file => ({
        name: file.name,
        url: file.url,
        size: file.size || ''
        // 新上传的文件不需要传id，后端会自动生成
      }))

    // 调用API添加进度更新记录
    const params = {
      processInstanceId: props.processInstanceId || '',
      deptDetail: progressForm.deptDetail,
      planTime: progressForm.planTime || undefined,
      fileList: fileList.length > 0 ? fileList : undefined
    }

    await OrderApi.insertSupervisionOrderTaskNew(params)

    ElMessage.success('进度更新添加成功')
    addProgressDialogVisible.value = false

    // 重新加载进度记录
    if (props.processInstanceId) {
      await getProgressRecords(props.processInstanceId)
    }

    // 重置表单
    progressForm.deptDetail = ''
    progressForm.planTime = ''
    progressForm.fileList = []
  } catch (error) {
    console.error('添加进度更新失败:', error)
    ElMessage.error('添加进度更新失败')
  }
}

const previewFile = (file: any) => {
  if (file.url) {
    // 使用KKFileView进行文件预览
    KKFileView.preview(file.url, file.name)
  } else {
    ElMessage.warning('文件链接不存在，无法预览')
  }
}

const downloadFile = (file: any) => {
  if (file.url) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success(`正在下载：${file.name}`)
  } else {
    ElMessage.success(`下载文件：${file.name}`)
  }
}

// 下载进度记录中的附件
const downloadProgressFile = (file: any) => {
  if (file.url) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success(`正在下载：${file.name}`)
  } else {
    ElMessage.info(`文件：${file.name}`)
  }
}

const getStatusType = () => {
  // 根据传递的督办状态直接映射状态样式
  const statusTypeMap = {
    '进行中': 'warning',
    '已超时': 'danger',
    '已结束': 'success'
  }
  return statusTypeMap[props.supervisionStatus] || 'info'
}

const getStatusText = () => {
  // 直接使用传递的督办状态
  return props.supervisionStatus || ' '
}

// 根据状态获取截止时间的样式类
const getDeadlineTimeClass = () => {
  // 直接使用从外部页面传递过来的督办状态
  const status = props.supervisionStatus || ' '

  if (status === '已超时') {
    return 'time-value deadline-overdue' // 红色
  } else if (status === '已结束') {
    return 'time-value deadline-finished' // 黑色
  } else if (status === '进行中') {
    return 'time-value deadline-processing' // 橙色
  }
  return 'time-value deadline' // 默认颜色
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

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return formatDateTime(date)
}

// 从URL获取文件类型
const getFileTypeFromUrl = (url: string) => {
  if (!url) return 'unknown'
  const extension = url.split('.').pop()?.toLowerCase()
  return extension || 'unknown'
}

// 格式化文件大小
const formatFileSize = (size: number | null) => {
  if (!size) return '未知大小'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  return (size / (1024 * 1024)).toFixed(1) + 'MB'
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
  font-size: 25px;
  font-weight: 550;
  color: #303133;
  margin: 0;
  padding: 0 20px;
}

.supervision-detail {
  padding: 20px;
  padding-top: 5px; /* 进一步减少顶部间距 */
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0; /* 增加内边距 */
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
  margin-top: 2px; /* 进一步减少与标题的间距 */
}

.status-tags {
  display: flex;
  gap: 12px;
}

.status-tag {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid;
}



.status-tag-item {
  background-color: #f0f9ff;
  color: #409eff;
  border-color: #b3d8ff;
}

.priority-tag {
  background-color: #f0f9ff;
  color: #409eff;
  border-color: #b3d8ff;
}

/* 高优先级 - 红色 */
.priority-danger {
  background-color: #fef0f0;
  color: #f56c6c;
  border-color: #fbc4c4;
}

/* 中优先级 - 黄色 */
.priority-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border-color: #f5dab1;
}

/* 一般优先级 - 绿色 */
.priority-info {
  background-color: #f0f9ff;
  color: #67c23a;
  border-color: #c2e7b0;
}

.category-tag {
  background-color: #f4f4f5;
  color: #909399;
  border-color: #d3d4d6;
}

.doc-number {
  color: #303133; /* 改为黑色 */
  font-size: 16px;
  font-weight: 500;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  grid-template-rows: auto auto auto; /* 三行布局 */
}

.task-info-col {
  display: contents; /* 让子元素直接参与grid布局 */
}

/* 左列：下发单位、牵头部门、协办部门 */
.task-info-col:first-child .info-group:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
}

.task-info-col:first-child .info-group:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
}

.task-info-col:first-child .info-group:nth-child(3) {
  grid-column: 1;
  grid-row: 3;
}

/* 右列：下发人、负责人、分管领导 */
.task-info-col:last-child .info-group:nth-child(1) {
  grid-column: 2;
  grid-row: 1;
}

.task-info-col:last-child .info-group:nth-child(2) {
  grid-column: 2;
  grid-row: 2;
}

.task-info-col:last-child .info-group:nth-child(3) {
  grid-column: 2;
  grid-row: 3;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px; /* 增加最小高度以适应换行 */
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
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  min-height: 40px;
  position: relative;
}

.item-icon {
  color: #409eff;
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.item-text {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  line-height: 1.4;
  max-width: calc(100% - 180px); /* 限制最大宽度，为联系电话预留空间 */
}

.contact-info {
  color: #909399;
  font-size: 14px;
  margin-left: 16px;
}

.contact-info-inline {
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 4px;
}

.phone-number {
  color: #303133;
  font-size: 16px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 110px;
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

/* 截止时间颜色样式 */
.time-value.deadline-overdue {
  color: #F56C6C; /* 红色 - 已超时 */
  font-size: 16px;
  font-weight: 500;
}

.time-value.deadline-finished {
  color: #303133; /* 黑色 - 已结束 */
  font-size: 16px;
  font-weight: 500;
}

.time-value.deadline-processing {
  color: #E6A23C; /* 橙色 - 进行中 */
  font-size: 16px;
  font-weight: 500;
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.progress-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-right {
  color: #ff6b6b;
  font-size: 14px;
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
  color: #ff6b6b;
  font-size: 14px;
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

.attachment-time {
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
  text-align: left;
}

/* 空状态样式 */
.empty-records {
  padding: 40px 0;
  text-align: center;
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

.empty-history {
  padding: 40px 0;
  text-align: center;
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-right {
  color: #ff6b6b;
  font-size: 14px;
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
  margin-top: 8px;
  text-align: left;
}

.history-expected-time {
  color: #ff6b6b;
  font-size: 14px;
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

/* 工作流时间线样式 */
.workflow-timeline {
  position: relative;
}

.workflow-timeline .el-timeline {
  padding-left: 0;
}

.workflow-timeline-content {
  padding-top: 20px;
}

.workflow-timeline .el-timeline-item__wrapper {
  position: relative;
  padding-left: 28px;
  padding-bottom: 20px;
}

.workflow-timeline .el-timeline-item__tail {
  position: absolute;
  left: 4px;
  height: calc(100% - 10px);
  border-left: 2px solid #e4e7ed;
}

.workflow-timeline .el-timeline-item__node {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.workflow-timeline .el-timeline-item__content {
  color: #303133;
}

/* 工作流节点样式 */
.workflow-node-container {
  position: absolute;
  left: -10px;
  top: -6px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #dedede;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #3f73f7;
  padding: 5px;
}

.workflow-node-img {
  width: 100%;
  height: 100%;
}

.workflow-node-status {
  position: absolute;
  top: 17px;
  left: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  padding: 1px;
  border: 2px solid white;
}

/* 工作流活动内容样式 */
.workflow-activity-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.workflow-activity-header {
  display: flex;
  width: 100%;
}

.workflow-activity-name {
  font-weight: bold;
}

.workflow-activity-time {
  color: #a5a5a5;
  font-size: 13px;
  margin-top: 4px;
  margin-left: auto;
}

.workflow-activity-tasks {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
  gap: 8px;
}

/* 工作流任务样式 */
.workflow-task-item {
  display: flex;
  flex-direction: column;
  padding-right: 8px;
  gap: 8px;
}

.workflow-task-user {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-user-info {
  background-color: #f5f5f5;
  height: 35px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding-right: 8px;
  position: relative;
}

.workflow-user-avatar {
  margin: 5px;
}

.workflow-user-name {
  margin-left: 4px;
}

.workflow-task-reason {
  color: #a5a5a5;
  font-size: 13px;
  margin-top: 4px;
  width: 100%;
  background-color: #f8f8fa;
  padding: 8px;
  border-radius: 6px;
}

.workflow-candidate-user {
  background-color: #f5f5f5;
  height: 35px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding-right: 8px;
  position: relative;
}

/* 保留原有的流转记录样式作为备用 */
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

/* 进度更新记录标题区域 */
.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

/* 文件上传样式 */
.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}

.section-header .section-title {
  margin: 0;
  flex: 1;
}

/* 添加进度更新弹窗样式 */
.add-progress-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.add-progress-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

.add-progress-dialog :deep(.el-textarea__inner) {
  resize: vertical;
}

.dialog-footer {
  text-align: right;
}

/* 文件上传样式 */
.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 16px;
}

.upload-demo :deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.upload-demo :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.upload-demo :deep(.el-upload__tip) {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}
</style>

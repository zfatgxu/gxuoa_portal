<template>
  <ContentWrap>
    <div class="supervision-order-detail">
      <!-- 页面标题 - 移到表格外面 -->
      <div class="page-header-outside">
        <h1 class="form-title">{{ getPageTitle() }}</h1>
      </div>



      <!-- 督办单详情表单 -->
      <div class="order-form-container" v-loading="loading" element-loading-text="正在加载数据...">
        <!-- 表单主体 -->
        <el-form
          :model="orderDetail"
          class="order-form"
        >
          <!-- 表格式布局 -->
          <div class="form-table">
            <!-- 督办编号行 -->
            <div class="form-row">
              <div class="form-content full-width order-number-content">
                <span class="order-number-label">{{ getOrderNumberLabel() }}：</span>
                <span class="order-number-display">{{ orderDetail.orderCode || '未生成' }}</span>
              </div>
            </div>

            <!-- 督办事项 -->
            <div class="form-row">
              <div class="form-label">督办事项</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.orderTitle" readonly />
              </div>
            </div>

            <!-- 主要内容 -->
            <div class="form-row">
              <div class="form-label">主要内容</div>
              <div class="form-content full-width">
                <el-input
                  type="textarea"
                  :value="orderDetail.content"
                  readonly
                  :rows="4"
                />
              </div>
            </div>

            <!-- 督办分类和督办依据 -->
            <div class="form-row">
              <div class="form-label">督办分类</div>
              <div class="form-content half-width">
                <el-input :value="orderDetail.detailType || getTypeName(orderDetail.type)" readonly />
              </div>
              <div class="form-label">督办依据</div>
              <div class="form-content half-width">
                <el-input :value="getReasonName(orderDetail.reason)" readonly />
              </div>
            </div>

            <!-- 紧急程度和完成期限 -->
            <div class="form-row">
              <div class="form-label">紧急程度</div>
              <div class="form-content half-width">
                <el-input :value="getPriorityName(orderDetail.priority)" readonly />
              </div>
              <div class="form-label">完成期限</div>
              <div class="form-content half-width">
                <div class="deadline-container">
                  <el-input :value="formatDate(orderDetail.deadline)" readonly class="deadline-display" />
                  <el-input :value="getReportFrequencyName(orderDetail.reportFrequency)" readonly class="report-frequency-display" />
                </div>
              </div>
            </div>

            <!-- 分管校领导和其他校领导 -->
            <div class="form-row">
              <div class="form-label">分管校领导</div>
              <div class="form-content half-width">
                <el-input :value="getLeadLeaderDisplay()" readonly />
              </div>
              <div class="form-label">其他校领导</div>
              <div class="form-content half-width">
                <el-input :value="getOtherLeadersDisplay()" readonly />
              </div>
            </div>

            <!-- 牵头单位和协办单位 -->
            <div class="form-row">
              <div class="form-label">牵头单位</div>
              <div class="form-content half-width">
                <!-- 督办人可编辑 -->
                <el-select
                  v-if="canEditLeadDept"
                  v-model="editForm.leadDept"
                  multiple
                  filterable
                  placeholder="请选择牵头单位（可多选）"
                  style="width: 100%"
                  @change="handleLeadDeptChange"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.id"
                  />
                </el-select>
                <!-- 只读模式 -->
                <template v-else>
                  <el-input
                    v-if="!orderDetail.leadDept || getLeadDeptNames().length === 0"
                    value="待督办人选择"
                    readonly
                  />
                  <div v-else class="readonly-tags">
                    <el-tag
                      v-for="deptName in getLeadDeptNames()"
                      :key="deptName"
                      type="primary"
                      class="dept-tag"
                    >
                      {{ deptName }}
                    </el-tag>
                  </div>
                </template>
              </div>
              <div class="form-label">协办单位</div>
              <div class="form-content half-width">
                <!-- 牵头单位可编辑 -->
                <el-select
                  v-if="canEditCollaborateDepts"
                  v-model="editForm.collaborateDepts"
                  multiple
                  filterable
                  placeholder="请选择协办单位"
                  style="width: 100%"
                  @change="handleCollaborateDeptsChange"
                >
                  <el-option
                    v-for="dept in deptList"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.name"
                  />
                </el-select>
                <!-- 只读模式 -->
                <template v-else>
                  <el-input
                    v-if="!orderDetail.coDept"
                    value="待牵头单位选择"
                    readonly
                  />
                  <div v-else class="readonly-tags">
                    <el-tag
                      v-for="dept in getCollaborateDepts(orderDetail.coDept)"
                      :key="dept"
                      type="success"
                      class="dept-tag"
                    >
                      {{ dept }}
                    </el-tag>
                  </div>
                </template>
              </div>
            </div>

            <!-- 督办人和联系电话 -->
            <div class="form-row">
              <div class="form-label">督办人</div>
              <div class="form-content half-width">
                <el-input :value="getSupervisorNames()" readonly />
              </div>
              <div class="form-label">联系电话</div>
              <div class="form-content half-width">
                <el-input :value="getSupervisorPhones()" readonly />
              </div>
            </div>

            <!-- 工作推进情况 -->
            <div class="form-row">
              <div class="form-label">工作推进情况</div>
              <div class="form-content full-width">
                <div class="work-progress-content">
                  <!-- 最新动态区域 -->
                  <div v-if="progressRecords.length > 0 && progressRecords[0].isLatest" class="latest-progress-section">
                    <div class="latest-progress-header">
                      <Icon icon="ep:star-filled" class="header-icon" />
                      最新动态
                      <span v-if="progressRecords[0].isPending" class="pending-badge">待提交</span>
                    </div>
                    <div class="latest-progress-item">
                      <div class="latest-progress-dot">
                        <div class="dot-inner" :class="{ 'pending-dot': progressRecords[0].isPending }"></div>
                      </div>
                      <div class="latest-progress-content">
                        <div class="latest-progress-header-row">
                          <div class="latest-progress-title">
                            <Icon icon="ep:user" class="user-icon" />
                            {{ progressRecords[0].title }}
                            <span class="latest-progress-handler" v-if="progressRecords[0].handler">{{ progressRecords[0].handler }}</span>
                            <el-button
                              v-if="progressRecords[0].isPending && hasEditPermission"
                              type="primary"
                              size="small"
                              @click="editPendingProgress"
                              class="edit-pending-btn"
                            >
                              编辑
                            </el-button>
                          </div>
                          <div v-if="progressRecords[0].expectedTime" class="latest-progress-expected-time-right">
                            <Icon icon="ep:calendar" class="calendar-icon" />
                            预计完成时间：{{ progressRecords[0].expectedTime }}
                          </div>
                        </div>
                        <div class="latest-progress-time">
                          <Icon icon="ep:clock" class="time-icon" />
                          {{ progressRecords[0].time }}
                        </div>
                        <div class="latest-progress-description" v-if="progressRecords[0].description && progressRecords[0].description !== '暂无详细信息'">
                          {{ progressRecords[0].description }}
                        </div>
                        <div v-if="progressRecords[0].attachments && progressRecords[0].attachments.length > 0" class="latest-progress-attachments">
                          <div class="attachments-list">
                            <div v-for="file in progressRecords[0].attachments" :key="file.id || file.name" class="latest-attachment-item">
                              <Icon icon="ep:document" class="attachment-icon" />
                              <span class="attachment-name" @click="downloadProgressFile(file)">{{ file.name }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 操作按钮区域 -->
                  <div class="timeline-actions-section">
                    <div class="timeline-actions">
                      <el-button
                        v-if="hasEditPermission"
                        type="primary"
                        size="small"
                        @click="showAddProgressDialog"
                      >
                        添加工作推进
                      </el-button>
                      <el-button
                        v-if="progressRecords.length > 0"
                        type="warning"
                        size="small"
                        @click="sortProgressRecords('asc')"
                      >
                        时间正序
                      </el-button>
                      <el-button
                        v-if="progressRecords.length > 0"
                        type="warning"
                        size="small"
                        @click="sortProgressRecords('desc')"
                      >
                        时间倒序
                      </el-button>
                      <el-button
                        v-if="hasMoreRecords"
                        type="info"
                        size="small"
                        :loading="isToggling"
                        @click="toggleProgressRecords"
                      >
                        {{ isExpanded ? '折叠' : '展开' }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 进度记录列表（除了最新的） -->
                  <div class="progress-timeline" v-if="progressRecords.length > 1">
                    <div
                      v-for="(record, index) in displayedProgressRecords"
                      :key="index"
                      class="progress-record-item"
                    >
                      <div class="progress-record-dot">
                        <div class="dot-inner"></div>
                      </div>
                      <div class="progress-record-content">
                        <div class="progress-record-title">
                          <Icon icon="ep:user" class="user-icon" />
                          {{ record.title }}
                          <span class="progress-record-handler" v-if="record.handler">{{ record.handler }}</span>
                        </div>
                        <div class="progress-record-time">
                          <Icon icon="ep:clock" class="time-icon" />
                          {{ record.time }}
                        </div>
                        <div class="progress-record-description" v-if="record.description && record.description !== '暂无详细信息'">
                          {{ record.description }}
                        </div>
                        <div v-if="record.attachments && record.attachments.length > 0" class="progress-record-attachments">
                          <div class="attachments-list">
                            <div v-for="file in record.attachments" :key="file.id || file.name" class="progress-attachment-item">
                              <Icon icon="ep:document" class="attachment-icon" />
                              <span class="attachment-name" @click="downloadProgressFile(file)">{{ file.name }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <div v-else-if="progressRecords.length === 0" class="empty-progress">
                    <div class="empty-text">暂无进度更新记录</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 是否立项督办 -->
            <div class="form-row">
              <div class="form-label">是否立项督办</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.isProjectSupervision ? '是' : '否'" readonly />
              </div>
            </div>

            <!-- 是否结束督办 -->
            <div class="form-row">
              <div class="form-label">是否结束督办</div>
              <div class="form-content full-width">
                <el-input :value="orderDetail.isSupervisionClosed ? '是' : '否'" readonly />
              </div>
            </div>

            <!-- 概述 -->
            <div class="form-row">
              <div class="form-label">概述</div>
              <div class="form-content full-width">
                <div class="summary-content-inline">
                  <div v-if="parsedSummary && parsedSummary.length > 0">
                    <div v-for="(item, index) in parsedSummary" :key="index" class="summary-item-inline">
                      <strong>{{ item.label }}：</strong>{{ item.value }}
                    </div>
                  </div>
                  <div v-else class="no-summary-inline">
                    暂无概述信息
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>

    </div>

    <!-- 添加进度更新弹窗 -->
    <el-dialog
      v-model="addProgressDialogVisible"
      title="添加进度更新"
      width="600px"
      class="add-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="progress-dialog-content">
        <el-form :model="progressForm" :rules="progressRules" ref="progressFormRef" label-width="140px" class="progress-form">
          <el-form-item label="当前进度情况" prop="deptDetail" class="form-item-custom">
            <el-input
              v-model="progressForm.deptDetail"
              type="textarea"
              :rows="5"
              placeholder="请详细描述当前工作进度、已完成的任务、遇到的问题等..."
              maxlength="500"
              show-word-limit
              class="textarea-custom"
            />
          </el-form-item>

          <el-form-item label="预计完成时间" prop="planTime" class="form-item-custom">
            <el-date-picker
              v-model="progressForm.planTime"
              type="datetime"
              placeholder="请选择预计完成时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              class="date-picker-custom"
              :disabled-date="disabledProgressDate"
              :disabled-hours="disabledProgressHours"
              :disabled-minutes="disabledProgressMinutes"
              :default-time="defaultProgressTime"
            />
          </el-form-item>

          <el-form-item label="相关附件" class="form-item-custom upload-item">
            <div class="upload-container">
              <el-upload
                ref="progressUploadRef"
                v-model:file-list="progressForm.fileList"
                :http-request="customProgressUpload"
                :limit="10"
                :multiple="true"
                :auto-upload="true"
                :show-file-list="true"
                :on-error="handleProgressUploadError"
                :on-remove="handleProgressFileRemove"
                :before-upload="beforeProgressUpload"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                action="#"
                class="upload-custom"
              >
                <el-button type="primary" class="upload-btn">
                  <Icon icon="ep:upload" class="upload-icon" />
                  选择文件
                </el-button>
              </el-upload>
              <div class="upload-tip">
                <Icon icon="ep:info-filled" class="tip-icon" />
                支持 doc、docx、pdf、xls、xlsx、jpg、jpeg、png、txt 格式，单个文件不超过10MB，最多10个文件
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer-custom">
          <el-button @click="cancelAddProgress" class="cancel-btn">
            <Icon icon="ep:close" class="btn-icon" />
            取消
          </el-button>
          <el-button type="primary" @click="submitAddProgress" class="submit-btn">
            <Icon icon="ep:check" class="btn-icon" />
            添加更新
          </el-button>
        </div>
      </template>
    </el-dialog>


  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { OrderApi, type OrderRespVO, type OrderSaveReqVO, type OrderWorkflowUpdateReqVO, type AttachmentFileInfo, type AttachmentRespVO } from '@/api/supervision'
import { getSimpleDeptList, getDept, type DeptVO } from '@/api/system/dept'
import { getSimpleUserList, type UserVO } from '@/api/system/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate as utilFormatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox, type UploadUserFile } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { UploadFile } from '@/components/UploadFile'
import { Icon } from '@/components/Icon'
import * as FileApi from '@/api/infra/file'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'

defineOptions({ name: 'SupervisionOrderDetail' })

// 定义props，支持从父组件传递参数
const props = defineProps<{
  id?: string | number  // 可以是督办单ID或流程实例ID
  activityNodes?: any[]
  applyUser?: string
  applyTime?: string
  status?: number
}>()

const route = useRoute()
const loading = ref(false)
const userStore = useUserStore()

// 部门列表
const deptList = ref<DeptVO[]>([])

// 用户列表
const userList = ref<UserVO[]>([])




// 进度更新记录相关状态
const progressRecords = ref<any[]>([])           // 进度记录列表
const hasMoreRecords = ref(false)                // 是否有更多记录
const isExpanded = ref(true)                     // 当前是否为展开状态
const isToggling = ref(false)                    // 是否正在切换状态（防止频繁点击）
const addProgressDialogVisible = ref(false)     // 添加进度弹窗状态
const progressSortOrder = ref<'asc' | 'desc'>('desc') // 进度记录排序方式，默认倒序（最新在前）
const pendingProgressUpdate = ref<any>(null)    // 待提交的进度更新数据
const isEditingPendingProgress = ref(false)     // 是否正在编辑待提交的进度

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
  ],
  planTime: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback()
          return
        }

        const selectedDateTime = new Date(value)
        const now = new Date()

        if (selectedDateTime.getTime() <= now.getTime()) {
          callback(new Error('预计完成时间不能早于当前时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 判断督办是否已结束
const isSupervisionEnded = computed(() => {
  // 这里可以根据实际的督办状态字段来判断
  // 暂时返回false，后续可以根据实际业务逻辑调整
  return false
})

// 计算显示的进度记录（除了最新的，并按排序方式显示）
const displayedProgressRecords = computed(() => {
  if (progressRecords.value.length <= 1) return []

  const records = progressRecords.value.slice(1) // 排除最新的记录

  // 根据排序方式排序
  return records.sort((a, b) => {
    const timeA = a.createTime || 0
    const timeB = b.createTime || 0

    if (progressSortOrder.value === 'asc') {
      return timeA - timeB // 正序：时间早的在前
    } else {
      return timeB - timeA // 倒序：时间晚的在前
    }
  })
})

// 进度记录排序方法
const sortProgressRecords = (order: 'asc' | 'desc') => {
  progressSortOrder.value = order
}

// 督办单详情数据
const orderDetail = ref<OrderRespVO>({
  id: 0,
  orderCode: '',
  orderTitle: '',
  type: 1,
  detailType: '',
  reason: 1,
  priority: 1,
  deadline: 0,
  leadDept: null as string | null,
  coDept: '',
  supervisors: [], // 督办人数组
  leadLeaders: [], // 分管领导和其他校领导数组
  content: '',
  deptDetail: null, // 工作推进情况
  reportFrequency: undefined, // 汇报频次
  isProjectSupervision: null, // 是否立项督办
  isSupervisionClosed: null, // 是否结束督办
  summary: '',
  processInstanceId: '',
  createTime: 0
})

// 编辑表单数据
const editForm = ref({
  leadDept: [] as number[], // 牵头单位ID数组（支持多选）
  leadDeptNames: [] as string[], // 牵头单位名称数组（用于显示）
  coDept: '', // 协办单位ID字符串（逗号分隔）
  collaborateDepts: [] as string[], // 协办单位名称数组（用于显示）
  collaborateDeptIds: [] as number[], // 协办单位ID数组（用于提交）
  leadDeptDetail: '' // 牵头单位工作推进情况
})



// 获取部门列表
const getDeptList = async () => {
  try {
    deptList.value = await getSimpleDeptList()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    userList.value = await getSimpleUserList()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 根据部门ID获取部门名称
const getDeptName = (deptId: number | null) => {
  if (!deptId || deptId === 0) return '待督办人选择'
  const dept = deptList.value.find(item => item.id === deptId)
  return dept?.name || `未知部门(${deptId})`
}

// 获取牵头单位名称列表（支持单选和多选兼容）
const getLeadDeptNames = () => {
  const leadDept = orderDetail.value.leadDept
  if (!leadDept) return []

  // 兼容处理：支持单个ID或ID数组
  let deptIds: number[] = []
  if (Array.isArray(leadDept)) {
    deptIds = leadDept
  } else if (typeof leadDept === 'number') {
    deptIds = [leadDept]
  } else if (typeof leadDept === 'string') {
    // 支持逗号分隔的字符串格式
    deptIds = leadDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
  }

  return deptIds.map(deptId => {
    const dept = deptList.value.find(item => item.id === deptId)
    return dept?.name || `未知部门(${deptId})`
  })
}

// 将牵头单位数据转换为统一格式（数组）
const normalizeLeadDept = (leadDept: any): number[] => {
  if (!leadDept) return []
  if (Array.isArray(leadDept)) return leadDept
  if (typeof leadDept === 'number') return [leadDept]
  if (typeof leadDept === 'string') {
    return leadDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
  }
  return []
}



// 根据流程实例ID获取督办单详情
const getOrderDetail = async (processInstanceId: string) => {
  try {
    loading.value = true
    const data = await OrderApi.getOrderByProcessInstanceId(processInstanceId)

    if (!data) {
      throw new Error('API返回的数据为空')
    }

    if (!data.id) {
      throw new Error('督办单数据无效：缺少ID字段')
    }

    // 直接使用新的API数据结构
    orderDetail.value = {
      ...data,
      // 确保数组字段正确初始化
      supervisors: data.supervisors || [],
      leadLeaders: data.leadLeaders || [],
      // 确保其他字段正确处理null值
      coDept: data.coDept || '',
      leadDept: data.leadDept || null,
      deptDetail: data.deptDetail || null
    }

    // 初始化编辑表单数据
    editForm.value.leadDept = normalizeLeadDept(data.leadDept)
    editForm.value.leadDeptNames = getLeadDeptNames()
    editForm.value.coDept = data.coDept || ''
    editForm.value.collaborateDepts = getCollaborateDepts(data.coDept)
    editForm.value.leadDeptDetail = data.deptDetail || ''
    
  } catch (error) {
    console.error('根据流程实例ID获取督办单详情失败:', error)
    // 显示错误信息给用户
    ElMessage.error('获取督办单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (timestamp: number | string | null) => {
  if (!timestamp) return '未设置'
  
  let time: number
  if (typeof timestamp === 'string') {
    time = parseInt(timestamp)
  } else {
    time = timestamp
  }
  
  if (isNaN(time) || time <= 0) return '未设置'
  
  return utilFormatDate(new Date(time), 'YYYY/MM/DD HH:mm')
}

// 获取页面标题
const getPageTitle = () => {
  if (!orderDetail.value.type) {
    return '督办单详情'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '广西大学工作督办单'
  } else if (orderDetail.value.type === 2) {
    return '广西大学专项督办单'
  } else {
    return '广西大学督办单'
  }
}

// 获取督办编号标签
const getOrderNumberLabel = () => {
  if (!orderDetail.value.type) {
    return '督办编号'
  }

  // type: 1=工作督办, 2=专项督办
  if (orderDetail.value.type === 1) {
    return '督办编号'  // 工作督办单显示"督办编号"
  } else if (orderDetail.value.type === 2) {
    return '督查编号'  // 专项督办单显示"督查编号"
  } else {
    return '督办编号'
  }
}

// 获取汇报频次名称
const getReportFrequencyName = (frequency: number | undefined) => {
  if (!frequency) return '未设置'

  // 从字典中获取汇报频次选项
  const frequencyOptions = getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY)
  const option = frequencyOptions.find(item => item.value === frequency)

  if (option) {
    // 如果字典中的label已经包含"汇报"，直接返回
    if (option.label.includes('汇报')) {
      return option.label
    }
    // 如果不包含"汇报"，则拼接
    return `汇报${option.label}`
  }

  return '未知频次'
}

// 获取分管校领导显示文本
const getLeadLeaderDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '待牵头单位确定后自动生成'
  }

  // 匹配实际的数据类型：分管领导、牵头领导、督办领导
  const leadLeaders = orderDetail.value.leadLeaders.filter(leader =>
    leader.type === '分管领导' ||
    leader.type === '牵头领导' ||
    leader.type === '督办领导'
  )
  if (leadLeaders.length === 0) {
    return '待牵头单位确定后自动生成'
  }

  return leadLeaders.map(leader => leader.name).join('、')
}

// 获取其他校领导显示文本
const getOtherLeadersDisplay = () => {
  if (!orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return '无'
  }

  const otherLeaders = orderDetail.value.leadLeaders.filter(leader => leader.type === '其他分管领导')
  if (otherLeaders.length === 0) {
    return '无'
  }

  return otherLeaders.map(leader => leader.name).join('、')
}

// 获取督办分类名称
const getTypeName = (type: number) => {
  const typeOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_TYPE)
  const option = typeOptions.find(item => item.value === type)
  return option?.label || '未知分类'
}

// 获取督办依据名称
const getReasonName = (reason: number) => {
  const reasonOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_REASON)
  const option = reasonOptions.find(item => item.value === reason)
  return option?.label || '未知依据'
}

// 获取紧急程度名称
const getPriorityName = (priority: number) => {
  const priorityOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE)
  const option = priorityOptions.find(item => item.value === priority)
  return option?.label || '未知程度'
}

// 获取重要程度名称
const getSignificanceName = (significance: number) => {
  const significanceOptions = getIntDictOptions(DICT_TYPE.SUPERVISION_SIGNIFICANCE_TYPE)
  const option = significanceOptions.find(item => item.value === significance)
  return option?.label || '未知程度'
}

// 获取协办单位列表（根据ID获取部门名称）
const getCollaborateDepts = (coDept: string | null) => {
  if (!coDept || coDept.trim() === '') return []

  // 将逗号分隔的ID字符串转换为部门名称数组
  const deptIds = coDept.split(',').filter(id => id.trim())
  return deptIds.map(deptId => {
    const id = parseInt(deptId.trim())
    if (isNaN(id)) return deptId.trim() // 如果不是数字，直接返回原值

    const dept = deptList.value.find(item => item.id === id)
    return dept?.name || `未知部门(${id})`
  })
}

// 获取督办人列表
const getSupervisorNames = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未分配'
  }

  if (orderDetail.value.supervisors.length === 0) {
    return '未分配'
  }

  const supervisorNames = orderDetail.value.supervisors.map(s => s.name).filter(name => name)
  return supervisorNames.length > 0 ? supervisorNames.join('、') : '未分配'
}

// 获取督办人联系电话
const getSupervisorPhones = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未设置'
  }

  if (orderDetail.value.supervisors.length === 0) {
    return '未设置'
  }

  // 如果只有一个督办人，显示其电话
  if (orderDetail.value.supervisors.length === 1) {
    return orderDetail.value.supervisors[0].phone || '未设置'
  }

  // 如果有多个督办人，显示所有电话（用、分隔）
  const phones = orderDetail.value.supervisors
    .map(s => s.phone)
    .filter(phone => phone)

  return phones.length > 0 ? phones.join('、') : '未设置'
}



// 权限状态
const canEditLeadDept = ref(false)           // 牵头单位编辑权限
const canEditCollaborateDepts = ref(false)   // 协办单位编辑权限
const canEditLeadDeptDetail = ref(false)     // 工作推进情况编辑权限

// 完整的活动节点数据（从审批详情API获取）
const fullActivityNodes = ref<any[]>([])

// 获取完整的审批详情（包含完整的活动节点信息）
const getFullApprovalDetail = async (processInstanceId: string) => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processInstanceId: processInstanceId
    })

    if (data && data.activityNodes) {
      fullActivityNodes.value = data.activityNodes
    }
  } catch (error) {
    console.error('获取完整审批详情失败:', error)
  }
}

// 获取当前工作流节点（可能有多个并行节点）
const getCurrentWorkflowNodes = () => {
  if (fullActivityNodes.value && fullActivityNodes.value.length > 0) {
    const runningNodes = fullActivityNodes.value.filter(node => node.status === 1)
    return runningNodes.map(node => node.id || node.taskDefinitionKey || node.activityId).filter(id => id)
  }
  return []
}

// 节点权限配置映射表
const NODE_PERMISSIONS = {
  'select_leaddept': {
    leadDept: true,           //  督办人可编辑牵头单位
    collaborateDepts: false,  // 
    leadDeptDetail: false,    // 
    attachments: true         //如有编辑权限可上传附件
  },
  'implement_plan': {
    leadDept: false,          // 
    collaborateDepts: true,   // 牵头单位负责人可编辑协办单位
    leadDeptDetail: true,     //牵头/协办负责人可编辑工作推进情况
    attachments: true         // 如有编辑权限可上传附件
  },
  'upload_plan': {
    leadDept: false,          // 
    collaborateDepts: false,  // 
    leadDeptDetail: true,     //  牵头/协办负责人可编辑工作推进情况
    attachments: true         //  如有编辑权限可上传附件
  },
  'co_dept': {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: true,     // 协办负责人可编辑工作推进情况
    attachments: true
  }
}

// 检查当前用户的所有编辑权限
const checkCurrentUserPermissions = () => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !fullActivityNodes.value.length) {
    return { leadDept: false, collaborateDepts: false, leadDeptDetail: false, attachments: false }
  }

  const permissions = {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: false,
    attachments: false
  }

  // 遍历所有运行中的活动节点
  fullActivityNodes.value.forEach(node => {
    if (node.status !== 1) return // 只处理运行中的节点

    const nodeId = node.id || node.taskDefinitionKey || node.activityId
    let hasAccess = false

    // 检查节点的tasks中是否有当前用户
    if (node.tasks && node.tasks.length > 0) {
      hasAccess = node.tasks.some(task =>
        (task.assigneeUser && task.assigneeUser.id === currentUserId) ||
        (task.ownerUser && task.ownerUser.id === currentUserId)
      )
    }

    // 检查candidateUsers
    if (!hasAccess && node.candidateUsers && node.candidateUsers.length > 0) {
      hasAccess = node.candidateUsers.some(user => user.id === currentUserId)
    }

    if (!hasAccess) return

    // 根据节点ID获取权限配置
    const nodePermissions = NODE_PERMISSIONS[nodeId]
    if (nodePermissions) {
      Object.keys(nodePermissions).forEach(key => {
        if (nodePermissions[key]) {
          permissions[key] = true
        }
      })
    }
  })

  return permissions
}

// 统一权限检查（替换原有的三个权限检查方法）
const checkAllPermissions = async () => {
  const permissions = checkCurrentUserPermissions()

  // 更新权限状态
  canEditLeadDept.value = permissions.leadDept
  canEditCollaborateDepts.value = permissions.collaborateDepts
  canEditLeadDeptDetail.value = permissions.leadDeptDetail

  // 附件权限基于是否有任何编辑权限
  const hasAnyEditPermission = permissions.leadDept ||
                               permissions.collaborateDepts ||
                               permissions.leadDeptDetail
  // 这里可以根据实际需求调整附件权限逻辑
}

const hasEditPermission = computed(() => {
  return canEditLeadDept.value || canEditCollaborateDepts.value || canEditLeadDeptDetail.value
})

// 监听督办单数据变化，重新检查权限
watch(
  () => [orderDetail.value.supervisors, orderDetail.value.leadDept, orderDetail.value.coDept],
  async () => {
    if (orderDetail.value.id) {
      await checkAllPermissions()
    }
  },
  { deep: true }
)

// 解析概述信息
const parsedSummary = computed(() => {
  const summary = orderDetail.value.summary || ''
  if (!summary) return []

  // 如果是字符串格式，按行分割并解析
  if (typeof summary === 'string') {
    return summary.split('\n').filter(line => line.trim()).map(line => {
      const colonIndex = line.indexOf('：')
      if (colonIndex === -1) {
        return {
          label: line.trim(),
          value: ''
        }
      }
      return {
        label: line.substring(0, colonIndex).trim(),
        value: line.substring(colonIndex + 1).trim()
      }
    })
  }

  return []
})

// 获取督办单工作流更新数据（只传递修改的字段）
const getSupervisionWorkflowUpdateData = async (startLeaderSelectAssignees?: Record<string, number[]>) => {
  const updateData: OrderWorkflowUpdateReqVO = {
    id: orderDetail.value.id // 督办单ID必传
  }

  // 获取协办单位数据 - 优先使用编辑表单的数据，其次使用原始数据
  let coDeptSource = ''
  if (canEditCollaborateDepts.value && editForm.value.coDept) {
    coDeptSource = editForm.value.coDept
  } else if (orderDetail.value.coDept) {
    coDeptSource = orderDetail.value.coDept
  }
  // 处理协办单位数据
  if (coDeptSource) {
    const { coDeptString, coDeptArray } = ensureDataConsistency(coDeptSource)
    updateData.coDept = coDeptString

    // 工作流审批人配置由后端自动设置，前端不需要处理
  }
  // 处理牵头单位（督办人可编辑）
  if (canEditLeadDept.value && editForm.value.leadDept.length > 0) {
    // 将数组转换为逗号分隔的字符串（与协办单位格式保持一致）
    updateData.leadDept = editForm.value.leadDept.join(',')
  } else if (orderDetail.value.leadDept) {
    // 兼容现有数据格式
    if (Array.isArray(orderDetail.value.leadDept)) {
      updateData.leadDept = orderDetail.value.leadDept.join(',')
    } else {
      updateData.leadDept = String(orderDetail.value.leadDept)
    }
  }
  // 处理工作推进情况
  if (canEditLeadDeptDetail.value && editForm.value.leadDeptDetail) {
    updateData.deptDetail = editForm.value.leadDeptDetail
  }
  return updateData
}
// 更新督办单数据（供工作流调用）
const updateSupervisionOrder = async (startLeaderSelectAssignees?: Record<string, number[]>) => {
  try {
    // 先提交待处理的进度更新（如果有）
    if (pendingProgressUpdate.value) {
      try {
        // 获取processInstanceId（在清空数据之前）
        const processInstanceId = pendingProgressUpdate.value.processInstanceId ||
                                 props.id?.toString() ||
                                 route.query.processInstanceId as string ||
                                 route.params.id as string ||
                                 route.query.id as string

        await OrderApi.insertSupervisionOrderTaskNew(pendingProgressUpdate.value)
        ElMessage.success('进度更新提交成功')

        // 移除界面上的待提交标记
        if (progressRecords.value.length > 0 && progressRecords.value[0].isPending) {
          progressRecords.value[0].isPending = false
        }

        // 清空待处理的进度更新数据
        pendingProgressUpdate.value = null

        // 重新加载进度记录，保持当前的展开/折叠状态
        if (processInstanceId) {
          await getProgressRecords(processInstanceId, isExpanded.value)
        }
      } catch (progressError) {
        console.error('提交进度更新失败:', progressError)
        ElMessage.error('提交进度更新失败，审批流程已终止')
        return {
          success: false,
          data: null
        }
      }
    }

    const updateData = await getSupervisionWorkflowUpdateData(startLeaderSelectAssignees)

    // 只有当有实际修改的字段时才调用接口
    const hasChanges = (updateData.leadDept !== undefined) ||
                      (updateData.coDept !== undefined) ||
                      (updateData.deptDetail !== undefined)

    if (hasChanges) {
      await OrderApi.updateOrderInWorkflow(updateData)

      // 更新本地数据
      if (updateData.leadDept !== undefined) {
        // 更新本地数据为数组格式
        orderDetail.value.leadDept = editForm.value.leadDept
      }
      if (canEditCollaborateDepts.value && updateData.coDept !== undefined) {
        orderDetail.value.coDept = editForm.value.coDept
      }
      if (canEditLeadDeptDetail.value && updateData.deptDetail !== undefined) {
        orderDetail.value.deptDetail = editForm.value.leadDeptDetail
      }
    }
    // 返回更新的数据，供工作流使用
    return {
      success: true,
      data: updateData
    }
  } catch (error) {
    console.error('更新督办单失败:', error)
    ElMessage.error('更新督办单失败')
    return {
      success: false,
      data: null
    }
  }
}

// 处理牵头单位变化
const handleLeadDeptChange = (deptIds: number[]) => {
  editForm.value.leadDept = deptIds || []
  // 更新牵头单位名称显示
  editForm.value.leadDeptNames = deptIds.map(deptId => {
    const dept = deptList.value.find(item => item.id === deptId)
    return dept?.name || `未知部门(${deptId})`
  })
  // 牵头单位变化时，清空协办单位选择（因为协办单位的选择权限可能会变化）
  editForm.value.collaborateDepts = []
  editForm.value.collaborateDeptIds = []
  editForm.value.coDept = ''
}

// 处理协办单位变化
const handleCollaborateDeptsChange = (deptNames: string[]) => {
  editForm.value.collaborateDeptIds = []
  deptNames.forEach(name => {
    const dept = deptList.value.find(d => d.name === name)
    if (dept) {
      editForm.value.collaborateDeptIds.push(dept.id)
    }
  })
  editForm.value.coDept = editForm.value.collaborateDeptIds.join(',')
}



// 确保协办单位数据格式一致性的辅助函数
const ensureDataConsistency = (coDeptString: string): { coDeptString: string, coDeptArray: number[] } => {
  if (!coDeptString || coDeptString.trim() === '') {
    return { coDeptString: '', coDeptArray: [] }
  }

  // 处理字符串，分割并转换为数字
  const coDeptArray = coDeptString.split(',')
    .map(id => {
      const trimmed = id.trim()
      const parsed = parseInt(trimmed)
      return parsed
    })
    .filter(id => !isNaN(id))

  const consistentString = coDeptArray.join(',')

  return {
    coDeptString: consistentString,
    coDeptArray: coDeptArray
  }
}

// 进度更新记录相关方法
// 获取进度更新记录
const getProgressRecords = async (processInstanceId: string, showAll: boolean = true) => {
  if (!processInstanceId) return

  try {
    const data = await OrderApi.getSupervisionTaskDetail(processInstanceId, showAll)

    // 处理不同的响应格式
    let apiData: any
    if (data && data.data) {
      apiData = data.data
    } else if (data && data.code === 0) {
      apiData = data.data
    } else if (data) {
      apiData = data
    }

    if (apiData) {
      // 根据showAll参数决定使用哪个数据源
      let recordsToProcess: any[] = []

      if (showAll) {
        recordsToProcess = apiData.allRecords || apiData.latestRecords || []
      } else {
        recordsToProcess = apiData.latestRecords || []
      }

      if (Array.isArray(recordsToProcess) && recordsToProcess.length > 0) {
        const formattedRecords = recordsToProcess.map((record: any, index: number) => {
          return {
            title: record.creatorDeptName || '未知部门',
            handler: record.creatorNickName || '',
            description: record.deptDetail || '暂无详细信息',
            expectedTime: record.planTime ? formatTimestamp(record.planTime) : '',
            time: record.createTime ? formatTimestamp(record.createTime) : (record.planTime ? formatTimestamp(record.planTime) : ''),
            attachments: record.fileList && Array.isArray(record.fileList) ? record.fileList : [],
            createTime: record.createTime || 0,
            isLatest: false
          }
        })

        // 按时间排序：最新的在前面
        formattedRecords.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))

        // 标记最新的记录
        if (formattedRecords.length > 0) {
          formattedRecords[0].isLatest = true

          if (formattedRecords.length > 1) {
            const latestRecord = formattedRecords[0]
            const otherRecords = formattedRecords.slice(1)
            otherRecords.sort((a, b) => (a.createTime || 0) - (b.createTime || 0))
            formattedRecords.splice(0, formattedRecords.length, latestRecord, ...otherRecords)
          }
        }

        progressRecords.value = formattedRecords
        hasMoreRecords.value = apiData.hasMore || false
      } else {
        progressRecords.value = []
        hasMoreRecords.value = false
      }
    }
  } catch (error) {
    console.error('获取进度更新记录失败:', error)
    ElMessage.error('获取进度更新记录失败')
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
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

// 预计完成时间选择限制相关方法
// 计算默认时间（当前时间的下一个小时）
const getDefaultProgressTime = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour
}

// 设置默认时间
const defaultProgressTime = ref(getDefaultProgressTime())

// 禁用今日之前的日期
const disabledProgressDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 设置为今天的开始时间
  return time.getTime() < today.getTime()
}

// 禁用小时
const disabledProgressHours = () => {
  const now = new Date()
  const selectedDate = progressForm.planTime ? new Date(progressForm.planTime) : null

  // 如果选择的是今天，则禁用当前小时之前的小时
  if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
    const hours = []
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
    return hours
  }
  return []
}

// 禁用分钟
const disabledProgressMinutes = (hour: number) => {
  const now = new Date()
  const selectedDate = progressForm.planTime ? new Date(progressForm.planTime) : null

  // 如果选择的是今天且是当前小时，则禁用当前分钟之前的分钟
  if (selectedDate && selectedDate.toDateString() === now.toDateString() && hour === now.getHours()) {
    const minutes = []
    for (let i = 0; i <= now.getMinutes(); i++) {
      minutes.push(i)
    }
    return minutes
  }
  return []
}

// 显示添加进度更新弹窗
const showAddProgressDialog = () => {
  addProgressDialogVisible.value = true
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
}

// 切换进度记录显示状态（折叠/展开）
const toggleProgressRecords = async () => {
  if (isToggling.value) return // 防止频繁点击

  const processInstanceId = props.id?.toString() ||
                           route.query.processInstanceId as string ||
                           route.params.id as string ||
                           route.query.id as string

  if (!processInstanceId) return

  try {
    isToggling.value = true

    // 切换状态
    isExpanded.value = !isExpanded.value

    // 根据新状态调用接口
    await getProgressRecords(processInstanceId, isExpanded.value)

  } catch (error) {
    console.error('切换进度记录显示状态失败:', error)
    ElMessage.error('切换显示状态失败')
    // 发生错误时恢复原状态
    isExpanded.value = !isExpanded.value
  } finally {
    isToggling.value = false
  }
}

// 下载进度记录中的附件
const downloadProgressFile = (file: any) => {
  if (file.url) {
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

// 进度更新弹窗相关方法
const progressFormRef = ref()
const progressUploadRef = ref()

// 取消添加进度更新
const cancelAddProgress = () => {
  addProgressDialogVisible.value = false

  // 如果是编辑模式，恢复原来的数据，不清空待提交记录
  if (isEditingPendingProgress.value) {
    isEditingPendingProgress.value = false
    // 重置表单但不清空待处理的进度更新数据
    progressForm.deptDetail = ''
    progressForm.planTime = ''
    progressForm.fileList = []
  } else {
    // 如果是新增模式，清空所有数据
    pendingProgressUpdate.value = null
    // 移除界面上的待提交记录（如果有）
    if (progressRecords.value.length > 0 && progressRecords.value[0].isPending) {
      progressRecords.value.shift()
      // 如果还有其他记录，将第一个标记为最新
      if (progressRecords.value.length > 0) {
        progressRecords.value[0].isLatest = true
      }
    }
    // 重置表单
    progressForm.deptDetail = ''
    progressForm.planTime = ''
    progressForm.fileList = []
  }
}

// 编辑待提交的进度更新
const editPendingProgress = () => {
  if (pendingProgressUpdate.value) {
    // 将待提交的数据重新填入表单
    progressForm.deptDetail = pendingProgressUpdate.value.deptDetail
    progressForm.planTime = pendingProgressUpdate.value.planTime || ''
    progressForm.fileList = pendingProgressUpdate.value.fileList || []

    // 标记为编辑模式，但不移除界面上的待提交记录
    isEditingPendingProgress.value = true

    // 打开编辑弹窗
    addProgressDialogVisible.value = true
  }
}

// 自定义进度更新文件上传方法
const customProgressUpload = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await FileApi.updateFile(formData)

    if (result.code === 0) {
      file.url = result.data
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList[index].url = file.url
      }
      onSuccess(result)
      ElMessage.success(`文件 ${file.name} 上传成功`)
    } else {
      const error = new Error(result.msg || '文件上传失败')
      const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        progressForm.fileList.splice(index, 1)
      }
      onError(error)
      ElMessage.error(result.msg || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    const index = progressForm.fileList.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      progressForm.fileList.splice(index, 1)
    }
    onError(error)
    ElMessage.error('文件上传失败，请重试')
  }
}

// 处理进度更新文件上传失败
const handleProgressUploadError = (error: any, file: any) => {
  console.error('进度更新文件上传失败:', error, file)
  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
}

// 进度更新文件移除处理
const handleProgressFileRemove = async (file: any) => {
  try {
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

// 进度更新文件上传前验证
const beforeProgressUpload = (file: File) => {
  if (progressForm.fileList.length >= 10) {
    ElMessage.error('上传文件数量不能超过10个!')
    return false
  }

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

  const isValidSize = file.size < 10 * 1024 * 1024
  if (!isValidSize) {
    ElMessage.error('上传文件大小不能超过10MB!')
    return false
  }

  ElMessage.success('正在上传文件，请稍候...')
  return true
}

// 提交添加进度更新（立即显示在界面上，并暂存数据等待工作流审批通过时一并提交）
const submitAddProgress = async () => {
  if (!progressFormRef.value) return

  try {
    await progressFormRef.value.validate()

    const fileList = progressForm.fileList
      .filter(file => file.url && file.url !== '')
      .map(file => ({
        name: file.name,
        url: file.url,
        size: file.size || ''
      }))

    const processInstanceId = props.id?.toString() ||
                             route.query.processInstanceId as string ||
                             route.params.id as string ||
                             route.query.id as string

    // 暂存进度更新数据，等待工作流审批通过时一并提交
    pendingProgressUpdate.value = {
      processInstanceId: processInstanceId || '',
      deptDetail: progressForm.deptDetail,
      planTime: progressForm.planTime || undefined,
      fileList: fileList.length > 0 ? fileList : undefined
    }

    // 如果是编辑模式，更新现有记录
    if (isEditingPendingProgress.value) {
      // 更新界面上的待提交记录
      if (progressRecords.value.length > 0 && progressRecords.value[0].isPending) {
        progressRecords.value[0].description = progressForm.deptDetail
        progressRecords.value[0].expectedTime = progressForm.planTime ? formatTimestamp(new Date(progressForm.planTime).getTime()) : ''
        progressRecords.value[0].attachments = fileList
        progressRecords.value[0].time = formatTimestamp(Date.now()) // 更新时间
      }
      isEditingPendingProgress.value = false
      ElMessage.success('进度更新已修改，将在审批通过时正式提交')
    } else {
      // 新增模式：立即在界面上显示新添加的进度记录
      const newProgressRecord = {
        title: userStore.getUser?.dept?.name || '当前部门',
        handler: userStore.getUser?.nickname || '当前用户',
        description: progressForm.deptDetail,
        expectedTime: progressForm.planTime ? formatTimestamp(new Date(progressForm.planTime).getTime()) : '',
        time: formatTimestamp(Date.now()),
        attachments: fileList,
        createTime: Date.now(),
        isLatest: true,
        isPending: true // 标记为待提交状态
      }

      // 将之前的最新记录标记为非最新
      if (progressRecords.value.length > 0 && progressRecords.value[0].isLatest) {
        progressRecords.value[0].isLatest = false
      }

      // 将新记录添加到最前面
      progressRecords.value.unshift(newProgressRecord)
      ElMessage.success('进度更新已添加，将在审批通过时正式提交')
    }

    addProgressDialogVisible.value = false

    // 重置表单
    progressForm.deptDetail = ''
    progressForm.planTime = ''
    progressForm.fileList = []
  } catch (error) {
    console.error('添加进度更新失败:', error)
    ElMessage.error('添加进度更新失败')
  }
}

// 初始化
onMounted(async () => {
  // 先获取部门列表和用户列表，确保字段映射能正确工作
  await Promise.all([
    getDeptList(),
    getUserList()
  ])

  // 获取流程实例ID，优先使用props传递的参数，然后使用路由参数
  const processInstanceId = props.id?.toString() ||
                           route.query.processInstanceId as string ||
                           route.params.id as string ||
                           route.query.id as string

  if (processInstanceId) {
    // 获取完整的审批详情（包含完整的活动节点信息）
    await getFullApprovalDetail(processInstanceId)

    // 直接使用流程实例ID获取督办单详情（包含附件信息）
    await getOrderDetail(processInstanceId)

    // 获取进度更新记录
    await getProgressRecords(processInstanceId)

    // 数据加载完成后，检查权限
    await checkAllPermissions()
  } else {
    console.error('缺少流程实例ID参数')
  }
})

// 获取督办单详情数据（用于外部调用）
const getOrderDetailData = () => {
  return orderDetail.value
}

// 获取编辑表单数据
const getEditFormData = () => {
  return editForm.value
}

// 清理待提交的进度更新数据
const clearPendingProgressUpdate = () => {
  pendingProgressUpdate.value = null
  // 移除界面上的待提交记录（如果有）
  if (progressRecords.value.length > 0 && progressRecords.value[0].isPending) {
    progressRecords.value.shift()
    // 如果还有其他记录，将第一个标记为最新
    if (progressRecords.value.length > 0) {
      progressRecords.value[0].isLatest = true
    }
  }
}

// 暴露方法供外部调用
defineExpose({
  updateSupervisionOrder,
  hasEditPermission: computed(() => hasEditPermission.value),
  pendingProgressUpdate: computed(() => pendingProgressUpdate.value),
  clearPendingProgressUpdate,
  cancelAddProgress,
  getOrderDetailData,
  getEditFormData,
  canEditLeadDept: computed(() => canEditLeadDept.value),
  canEditCollaborateDepts: computed(() => canEditCollaborateDepts.value),
  canEditLeadDeptDetail: computed(() => canEditLeadDeptDetail.value)
})
</script>

<style scoped>
.supervision-order-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 页面标题样式 - 与创建页面一致 */
.page-header-outside {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 2px;
  line-height: 1.4;
  margin: 0;
  font-family: "STXiaobiao", "SimSun", "Microsoft YaHei", serif;
}

/* 表单容器样式 - 与创建页面一致 */
.order-form-container {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
  max-width: 1000px;
}

/* 督办编号样式 - 与创建页面一致 */
.order-number-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  gap: 5px;
}

.order-number-label {
  font-size: 15px;
  color: #d32f2f;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.order-number-display {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

/* 表单样式 - 与创建页面一致 */
.order-form {
  padding: 0;
}

.form-table {
  width: 100%;
}

.form-row {
  display: flex;
  border-bottom: 1px solid #e8eaed;
  min-height: 50px;
  align-items: stretch;
  transition: background-color 0.2s ease;
}

.form-row:hover {
  background-color: #fafafa;
}

.form-row:last-child {
  border-bottom: none;
}

.form-label {
  background: white;
  color: #d32f2f;
  border-right: 1px solid #e8eaed;
  padding: 12px 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  min-width: 120px;
  width: 120px;
  font-size: 15px;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

/* 确保第二个标签有左边框 */
.form-row .form-label:nth-child(3) {
  border-left: 1px solid #e8eaed;
}

.form-content {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  flex: 1;
  background: white;
  transition: all 0.2s ease;
}

.form-content.full-width {
  flex: 1;
}

.form-content.half-width {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #e8eaed;
}

.form-content.half-width:first-child {
  flex: 0.8;
}

.form-content.half-width:last-child {
  flex: 1.2;
  border-right: none;
}

/* 移除Element Plus默认样式 */
:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  display: none;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaed;
  background: white;
  transition: all 0.2s ease;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  resize: none;
  transition: all 0.2s ease;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.2s ease;
}

/* 完成期限容器样式 */
.deadline-container {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
}

.deadline-display {
  flex: 1;
}

.report-frequency-display {
  width: 130px;
}

/* 只读标签样式 */
.readonly-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}

.readonly-tags .el-tag {
  margin: 0;
}

/* 内联概述样式 */
.summary-content-inline {
  width: 100%;
}

.summary-item-inline {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 14px;
}

.summary-item-inline strong {
  color: #303133;
  margin-right: 8px;
}

.no-summary-inline {
  color: #909399;
  font-style: italic;
  font-size: 14px;
}

/* 附件部分样式 */
.attachment-section {
  background: white;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1000px;
  padding: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #d32f2f;
  letter-spacing: 1px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8eaed;
}

.upload-section {
  margin-bottom: 30px;
}

.existing-attachments {
  margin-top: 20px;
}

.attachment-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 15px;
}

/* 部门标签样式 */
.dept-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}
/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

/* 确保只读状态下的样式 */
:deep(.el-input__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}

:deep(.el-textarea__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .supervision-order-detail {
    padding: 10px;
  }

  .order-form-container, .attachment-section {
    margin: 10px 0;
    max-width: none;
    border-width: 1px;
    padding: 20px;
  }

  .form-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .form-row {
    flex-direction: column;
    min-height: auto;
  }

  .form-label {
    width: 100%;
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #e8eaed;
    justify-content: flex-start;
    padding: 10px 16px;
  }

  .form-content {
    width: 100%;
    padding: 12px 16px;
  }

  .form-content.half-width {
    flex: 1;
    border-right: none;
  }
}

/* 工作推进情况内容区域样式 */
.work-progress-content {
  width: 100%;
  padding: 0;
}

/* 操作按钮区域样式 */
.timeline-actions-section {
  margin: 12px 0;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

/* 最新动态区域样式 */
.latest-progress-section {
  margin-bottom: 12px;
}

.latest-progress-header {
  font-size: 15px;
  font-weight: bold;
  color: #d32f2f;
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  letter-spacing: 0.5px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 待提交状态样式 */
.pending-badge {
  background: #f56c6c;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 10px;
}

.pending-dot {
  background: #f56c6c !important;
}

.edit-pending-btn {
  margin-left: 10px;
  font-size: 12px;
  padding: 4px 8px;
}

.latest-progress-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.latest-progress-expected-time-right {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  margin-left: 20px;
  flex-shrink: 0;
}

.calendar-icon {
  margin-right: 5px;
  color: #409eff;
}

.header-icon {
  color: #ffa726;
  font-size: 14px;
}

.latest-progress-item {
  position: relative;
  padding-left: 24px;
  background: #f0f7ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 17px 17px 17px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.latest-progress-item:hover {
  background: #f0f7ff;
  border-color: #b3d8ff;
}

.latest-progress-dot {
  position: absolute;
  left: 12px;
  top: 18px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #1890ff;
}



.latest-progress-content {
  width: 100%;
}

.latest-progress-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.user-icon {
  color: #1890ff;
  font-size: 14px;
}

.latest-progress-handler {
  font-size: 13px;
  color: #6c757d;
  margin-left: 6px;
  font-weight: normal;
}

.latest-progress-time {
  font-size: 13px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.time-icon {
  color: #1890ff;
  font-size: 12px;
}

.latest-progress-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.latest-progress-attachments {
  margin-top: 8px;
}

.attachments-header {
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.paperclip-icon {
  color: #1890ff;
  font-size: 12px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.latest-attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 13px;
}

.latest-attachment-item:hover {
  background: #e9ecef;
  border-color: #1890ff;
}

/* 操作按钮区域 */
.timeline-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

/* 进度时间线样式 - 与最新动态区域保持一致 */
.progress-timeline {
  margin-top: 12px;
}

.progress-record-item {
  position: relative;
  padding-left: 24px;
  background: #fafbfc;
  border: 1px solid #e1e8f0;
  border-radius: 6px;
  padding: 17px 17px 17px 32px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.progress-record-item:last-child {
  margin-bottom: 0;
}

.progress-record-item:hover {
  background: #f0f7ff;
  border-color: #b3d8ff;
}

.progress-record-dot {
  position: absolute;
  left: 12px;
  top: 18px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #1890ff;
}

.progress-record-content {
  width: 100%;
}

.progress-record-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.progress-record-handler {
  font-size: 13px;
  color: #6c757d;
  margin-left: 6px;
  font-weight: normal;
}

.progress-record-time {
  font-size: 13px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.progress-record-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.progress-record-attachments {
  margin-top: 8px;
}

.progress-attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-right: 6px;
  margin-bottom: 4px;
  font-size: 13px;
}

.progress-attachment-item:hover {
  background: #e9ecef;
  border-color: #1890ff;
}

/* 通用附件样式 */
.attachment-icon {
  color: #1890ff;
  font-size: 12px;
}

.attachment-name {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.attachment-name:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* 空状态样式 */
.empty-progress {
  text-align: center;
  padding: 20px 16px;
  color: #6c757d;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 6px;
}

.empty-text {
  font-size: 14px;
}



/* 添加进度更新弹窗样式 */
.add-progress-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.add-progress-dialog :deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-progress-dialog :deep(.el-dialog__header) {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #e9ecef;
}

.add-progress-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.add-progress-dialog :deep(.el-dialog__headerbtn) {
  top: 16px;
  right: 16px;
}

.add-progress-dialog :deep(.el-dialog__close) {
  color: #6c757d;
  font-size: 16px;
}

.add-progress-dialog :deep(.el-dialog__close):hover {
  color: #495057;
}

.add-progress-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: white;
}

.progress-dialog-content {
  padding: 20px;
}

.progress-form {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: none;
  border: 1px solid #f0f0f0;
}

.form-item-custom {
  margin-bottom: 20px;
}

.form-item-custom :deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.5;
}

.textarea-custom :deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s ease;
  resize: none;
}

.textarea-custom :deep(.el-textarea__inner):focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.date-picker-custom :deep(.el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s ease;
}

.date-picker-custom :deep(.el-input__wrapper):hover,
.date-picker-custom :deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.upload-item {
  margin-bottom: 16px;
}

.upload-container {
  width: 100%;
}

.upload-custom :deep(.el-upload) {
  width: 100%;
}

.upload-btn {
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  background: #1890ff;
  border: none;
  color: white;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.upload-icon {
  margin-right: 6px;
  font-size: 14px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.tip-icon {
  color: #909399;
  margin-right: 4px;
  font-size: 12px;
}

.dialog-footer-custom {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  background: white;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #adb5bd;
  color: #495057;
}

.submit-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background: #1890ff;
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
}

.btn-icon {
  margin-right: 4px;
  font-size: 14px;
}
</style>

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
                <el-input 
                  v-if="canEditOrderTitle"
                  v-model="editForm.orderTitle"
                  placeholder="请输入督办事项"
                  maxlength="100"
                  show-word-limit
                />
                <el-input v-else :value="orderDetail.orderTitle" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 主要内容 -->
            <div class="form-row">
              <div class="form-label">主要内容</div>
              <div class="form-content full-width">
                <el-input
                  v-if="canEditContent"
                  v-model="editForm.content"
                  type="textarea"
                  placeholder="请输入主要内容"
                  :autosize="{ minRows: 4 }"
                  maxlength="2000"
                  show-word-limit
                />
                <el-input
                  v-else
                  type="textarea"
                  :model-value="orderDetail.content"
                  readonly
                  class="readonly-display"
                  :autosize="{ minRows: 4 }"
                />
              </div>
            </div>

            <!-- 督办分类和紧急程度 -->
            <div class="form-row">
              <div class="form-label">督办分类</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditType"
                  v-model="editForm.detailType"
                  placeholder="请选择督办分类"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in typeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getDetailTypeName()" readonly class="readonly-display" />
              </div>
              <div class="form-label">紧急程度</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditPriority"
                  v-model="editForm.priority"
                  placeholder="请选择紧急程度"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getPriorityName(orderDetail.priority)" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 完成期限和汇报频次 -->
            <div class="form-row">
              <div class="form-label">完成期限</div>
              <div class="form-content half-width">
                <el-date-picker
                  v-if="canEditDeadline"
                  v-model="editForm.deadline"
                  type="datetime"
                  placeholder="请选择完成期限"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledDeadlineDate"
                  :disabled-hours="disabledDeadlineHours"
                  :disabled-minutes="disabledDeadlineMinutes"
                  :default-time="defaultDeadlineTime"
                />
                <el-input v-else :value="formatDate(orderDetail.deadline)" readonly class="readonly-display" />
              </div>
              <div class="form-label">汇报频次</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditReportFrequency"
                  v-model="editForm.reportFrequency"
                  placeholder="请选择汇报频次"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="option in reportFrequencyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-input v-else :value="getReportFrequencyName(orderDetail.reportFrequency)" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 分管校领导和其他校领导 -->
            <div class="form-row">
              <div class="form-label">分管校领导</div>
              <div class="form-content half-width">
                <el-input :value="getLeadLeaderDisplay()" readonly class="readonly-display" />
              </div>
              <div class="form-label">其他校领导</div>
              <div class="form-content half-width">
                <el-select
                  v-if="canEditOtherLeaders"
                  v-model="editForm.otherLeaderIds"
                  multiple
                  placeholder="请选择其他校领导"
                  :collapse-tags="true"
                  :max-collapse-tags="3"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.id"
                  />
                </el-select>
                <el-input v-else :value="getOtherLeadersDisplay()" readonly class="readonly-display" />
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
                    class="readonly-display"
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
                    v-if="shouldShowCoDeptPlaceholder || !orderDetail.coDept"
                    value="待牵头单位选择"
                    readonly
                    class="readonly-display"
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
                <el-select
                  v-if="canEditSupervisors"
                  v-model="editForm.supervisorIds"
                  multiple
                  placeholder="请选择督办人"
                  :collapse-tags="true"
                  :max-collapse-tags="3"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="user in userList"
                    :key="user.id"
                    :label="user.nickname || user.username"
                    :value="user.id"
                  />
                </el-select>
                <el-input v-else :value="getSupervisorDisplay()" readonly class="readonly-display" />
              </div>
              <div class="form-label">联系电话</div>
              <div class="form-content half-width">
                <el-input
                  v-if="canEditOfficePhone"
                  v-model="editForm.officePhone"
                  placeholder="请输入联系电话"
                  maxlength="20"
                />
                <el-input v-else :value="orderDetail.officePhone || '未设置'" readonly class="readonly-display" />
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
                    </div>
                    <div class="latest-progress-item">
                      <div class="latest-progress-dot">
                        <div class="dot-inner"></div>
                      </div>
                      <div class="latest-progress-content">
                        <div class="latest-progress-header-row">
                          <div class="latest-progress-title">
                            <Icon icon="ep:user" class="user-icon" />
                            {{ progressRecords[0].title }}
                            <span class="latest-progress-handler" v-if="progressRecords[0].handler">{{ progressRecords[0].handler }}</span>
                            <!-- 移除了编辑待提交进度的按钮 -->
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
                        <div class="latest-progress-description" v-if="progressRecords[0].description">
                          {{ progressRecords[0].description }}
                        </div>
                        <div class="latest-progress-description" v-if="progressRecords[0].remark">
                          <strong>领导批示：</strong>{{ progressRecords[0].remark }}
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
                        v-if="canEditLeadDeptDetail"
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
                        v-if="isCurrentUserLeader && !isSupervisionEnded"
                        type="success"
                        size="small"
                        @click="showAddRemarkDialog"
                      >
                        新增批示
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
                        <div class="progress-record-description" v-if="record.description">
                          {{ record.description }}
                        </div>
                        <div class="progress-record-description" v-if="record.remark">
                          <strong>领导批示：</strong>{{ record.remark }}
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
                <el-select
                  v-if="canEditIsProjectSupervision"
                  v-model="editForm.isProjectSupervision"
                  placeholder="请选择是否立项督办"
                  style="width: 100%"
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
                <el-input v-else :value="projectApprovalText" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 是否结束督办 -->
            <div class="form-row">
              <div class="form-label">是否结束督办</div>
              <div class="form-content full-width">
                <el-input :value="closeApprovalText" readonly class="readonly-display" />
              </div>
            </div>

            <!-- 概述 -->
            <div class="form-row" v-if="false">
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
          <el-button type="primary" @click="submitAddProgress" :loading="progressSubmitting" :disabled="progressSubmitting" class="submit-btn">
            <Icon icon="ep:check" class="btn-icon" />
            添加更新
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加批示弹窗 -->
    <el-dialog
      v-model="addRemarkDialogVisible"
      title="新增批示"
      width="600px"
      class="add-progress-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="progress-dialog-content">
        <el-form :model="remarkForm" :rules="remarkRules" ref="remarkFormRef" label-width="140px" class="progress-form">
          <el-form-item label="批示内容" prop="remark" class="form-item-custom">
            <el-input
              v-model="remarkForm.remark"
              type="textarea"
              :rows="6"
              placeholder="请输入批示内容..."
              maxlength="500"
              show-word-limit
              class="textarea-custom"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer-custom">
          <el-button @click="cancelAddRemark" class="cancel-btn">
            <Icon icon="ep:close" class="btn-icon" />
            取消
          </el-button>
          <el-button type="primary" @click="submitAddRemark" class="submit-btn">
            <Icon icon="ep:check" class="btn-icon" />
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>


  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive, nextTick, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { OrderApi, LeaderRemarkApi, type OrderRespVO, type OrderSaveReqVO, type OrderWorkflowUpdateReqVO, type AttachmentFileInfo, type AttachmentRespVO } from '@/api/supervision'
import { getSimpleDeptList, getDept, type DeptVO } from '@/api/system/dept'
import { getSimpleUserList, type UserVO } from '@/api/system/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { utilFormatDate } from '@/utils/dateUtil'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox, type UploadUserFile } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { UploadFile } from '@/components/UploadFile'
import { Icon } from '@/components/Icon'
import * as DeptApi from '@/api/system/dept'
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

// 督办分类选项
const typeOptions = ref<Array<{value: number | string, label: string, id?: number}>>([])

// 紧急程度选项
const priorityOptions = computed(() => getIntDictOptions(DICT_TYPE.SUPERVISION_PRIORITY_TYPE))

// 汇报频次选项
const reportFrequencyOptions = computed(() => getIntDictOptions(DICT_TYPE.REPORT_FREQUENCY))




// 进度更新记录相关状态
const progressRecords = ref<any[]>([])           // 进度记录列表
const hasMoreRecords = ref(false)                // 是否有更多记录
const isExpanded = ref(true)                     // 当前是否为展开状态
const isToggling = ref(false)                    // 是否正在切换状态（防止频繁点击）
const addProgressDialogVisible = ref(false)     // 添加进度弹窗状态
const addRemarkDialogVisible = ref(false)       // 添加批示弹窗状态
const progressSubmitting = ref(false)           // 进度提交中状态
const hasNewProgressInThisSession = ref(false)  // 本会话是否新增过进度记录
const progressSortOrder = ref<'asc' | 'desc'>('desc') // 进度记录排序方式，默认倒序（最新在前）
// 移除了 pendingProgressUpdate 和 isEditingPendingProgress 相关逻辑

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

// 批示表单数据
const remarkForm = reactive({
  remark: ''
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

// 批示表单验证规则
const remarkRules = {
  remark: [
    { required: true, message: '请输入批示内容', trigger: 'blur' }
  ]
}

// 判断督办是否已结束（基于后端字段 isSupervisionClosed）
const isSupervisionEnded = computed(() => {
  const closed = orderDetail.value?.isSupervisionClosed
  // 后端该字段定义为 boolean | null，这里进行显式布尔化
  return !!closed
})

// 判断当前用户是否为领导（有批示权限）
const isCurrentUserLeader = computed(() => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !orderDetail.value.leadLeaders || !Array.isArray(orderDetail.value.leadLeaders)) {
    return false
  }
  
  return orderDetail.value.leadLeaders.some(leader => leader.id === currentUserId)
})

// 牵头单位负责人数据是否就绪
const isLeadDeptLeaderReady = computed(() => {
  const hasOrderId = !!orderDetail.value.id
  const hasLeadDeptLeaderIds = Array.isArray(orderDetail.value.leadDeptLeaderIds)
  
  return hasOrderId && hasLeadDeptLeaderIds
})

// 判断当前用户是否为牵头单位负责人
const isLeadDeptLeader = computed(() => {
  const currentUserId = userStore.getUser?.id
  const currentUserIdNum = Number(currentUserId)
  
  if (!currentUserId || !isLeadDeptLeaderReady.value) {
    return false
  }
  
  // 直接使用后端返回的 leadDeptLeaderIds 进行判断
  const leadDeptLeaderIds = orderDetail.value.leadDeptLeaderIds || []
  const isLeader = leadDeptLeaderIds.some(leaderId => Number(leaderId) === currentUserIdNum)
  
  return isLeader
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
  leadDeptDetail: '', // 牵头单位工作推进情况
  orderTitle: '', // 督办事项
  content: '', // 主要内容
  type: 1, // 督办分类
  detailType: '' as string | number, // 督办分类详细类型
  priority: 1, // 紧急程度
  deadline: '', // 完成期限
  reportFrequency: undefined as number | undefined, // 汇报频次
  otherLeaderIds: [] as number[], // 其他校领导ID数组
  supervisorIds: [] as number[], // 督办人ID数组
  officePhone: '' // 联系电话
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

// 提取错误信息的通用函数
const extractErrorMessage = (error: any): string => {
  // 优先级：后端响应消息 > Error对象消息 > 字符串化错误
  if (error?.response?.data?.msg) {
    return error.response.data.msg
  }
  if (error?.data?.msg) {
    return error.data.msg
  }
  if (error?.message) {
    return error.message
  }
  return String(error) || '操作失败'
}

// 获取督办分类选项
const getTypeOptions = async () => {
  try {
    // 根据当前督办单类型获取分类选项
    const supervisionOrderType = orderDetail.value.type || 1
    const result = await OrderApi.getSupervisionDetailTypes(supervisionOrderType)
    
    // 处理返回的数据格式，与 create.vue 保持一致
    if (result && Array.isArray(result)) {
      // 检查返回的是对象数组还是字符串数组
      if (result.length > 0 && typeof result[0] === 'object' && result[0].id) {
        // 新格式：对象数组，包含id和type字段
        typeOptions.value = result.map((item) => ({
          id: item.id, // 保存ID用于删除
          value: item.id, // 使用id作为值（数字）
          label: item.type // type字段作为显示标签
        }))
      } else {
        // 旧格式：字符串数组
        typeOptions.value = result.map((item) => ({
          value: item, // 使用字符串本身作为值
          label: item // 字符串作为显示标签
        }))
      }
    } else {
      typeOptions.value = []
    }
    
    // 映射 detailType 值以确保下拉框正确回显
    if (typeOptions.value.length > 0 && (!editForm.value.detailType || typeof editForm.value.detailType === 'string')) {
      const detailTypeName = orderDetail.value.detailTypeName || editForm.value.detailType
      if (detailTypeName) {
        const matchedOption = typeOptions.value.find(option => option.label === detailTypeName)
        if (matchedOption) {
          editForm.value.detailType = matchedOption.value
        }
      }
    }
  } catch (error) {
    console.error('获取督办分类选项失败:', error)
    // 失败时使用字典兜底
    try {
      if (orderDetail.value.type === 2) {
        typeOptions.value = getIntDictOptions(DICT_TYPE.SPECIAL_SUPERVISION_TYPE)
      } else {
        typeOptions.value = getIntDictOptions(DICT_TYPE.WORK_SUPERVISION_TYPE)
      }
    } catch (dictError) {
      console.error('字典兜底失败:', dictError)
      typeOptions.value = []
    }
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
      leadLeaders: data.leadLeaders || []
    }
    
    // 时间显示现在直接基于活动节点数据，无需初始化冻结时间
    // 初始化编辑表单数据
    editForm.value.leadDept = data.leadDept ? data.leadDept.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
    editForm.value.leadDeptNames = getLeadDeptNames()
    editForm.value.coDept = data.coDept || ''
    editForm.value.collaborateDepts = getCollaborateDepts(data.coDept)
    editForm.value.leadDeptDetail = data.deptDetail || ''
    editForm.value.orderTitle = data.orderTitle || ''
    editForm.value.content = data.content || ''
    editForm.value.type = data.type || 1
    editForm.value.detailType = data.detailType || ''
    editForm.value.priority = data.priority || 1
    editForm.value.deadline = data.deadline ? utilFormatDate(new Date(data.deadline), 'YYYY-MM-DD HH:mm:ss') : ''
    editForm.value.reportFrequency = data.reportFrequency
    // 初始化其他校领导ID数组
    editForm.value.otherLeaderIds = data.leadLeaders ? 
      data.leadLeaders.filter(leader => leader.type === '其他分管领导').map(leader => leader.id) : []
    // 初始化督办人ID数组
    editForm.value.supervisorIds = data.supervisors ? data.supervisors.map(supervisor => supervisor.id) : []
    // 初始化联系电话
    editForm.value.officePhone = data.officePhone || ''
    
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
  
  return utilFormatDate(new Date(time), 'YYYY年MM月DD日 HH:mm')
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

// 获取督办分类详细名称（优先使用后端返回的 detailType）
const getDetailTypeName = () => {
  // 1. 优先使用后端返回的 detailType（如果是字符串直接返回，如果是数字ID则查找对应名称）
  if (orderDetail.value.detailType) {
    // 如果 detailType 是字符串，直接返回
    if (typeof orderDetail.value.detailType === 'string') {
      return orderDetail.value.detailType
    }
    // 如果 detailType 是数字ID，从 typeOptions 中查找对应名称
    if (typeof orderDetail.value.detailType === 'number' && typeOptions.value.length > 0) {
      const option = typeOptions.value.find(item => item.value === orderDetail.value.detailType)
      if (option) {
        return option.label
      }
    }
  }
  
  // 2. 从本地 typeOptions 中根据 orderDetail.type 匹配
  if (orderDetail.value.type && typeOptions.value.length > 0) {
    const option = typeOptions.value.find(item => item.value === orderDetail.value.type)
    if (option) {
      return option.label
    }
  }
  
  // 3. 兜底使用字典
  return getTypeName(orderDetail.value.type)
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


// 获取督办人显示文本（用于只读模式）
const getSupervisorDisplay = () => {
  if (!orderDetail.value.supervisors || !Array.isArray(orderDetail.value.supervisors)) {
    return '未设置'
  }
  
  return orderDetail.value.supervisors
    .map(supervisor => supervisor.name || supervisor.nickname || supervisor.username || '未知')
    .join('、')
}


// 权限状态
const canEditLeadDept = ref(false)           // 牵头单位编辑权限
const canEditCollaborateDepts = ref(false)   // 协办单位编辑权限
const canEditLeadDeptDetail = ref(false)     // 工作推进情况编辑权限
const canEditOrderTitle = ref(false)         // 督办事项编辑权限
const canEditContent = ref(false)            // 主要内容编辑权限
const canEditType = ref(false)               // 督办分类编辑权限
const canEditPriority = ref(false)           // 紧急程度编辑权限
const canEditDeadline = ref(false)           // 完成期限编辑权限
const canEditReportFrequency = ref(false)    // 汇报频次编辑权限
const canEditOtherLeaders = ref(false)       // 其他校领导编辑权限
const canEditSupervisors = ref(false)        // 督办人编辑权限
const canEditOfficePhone = ref(false)        // 联系电话编辑权限

// 创建必填字段配置
const CREATION_REQUIRED_FIELDS = [
  'orderTitle',      // 督办事项
  'content',         // 主要内容
  'detailType',      // 督办分类
  'priority',        // 紧急程度
  'deadline',        // 完成期限
  'reportFrequency', // 汇报频次
  'supervisors',     // 督办人
  'officePhone'      // 联系电话
]

// 字段中文名映射
const FIELD_LABEL_MAP: Record<string, string> = {
  orderTitle: '督办事项',
  content: '主要内容',
  detailType: '督办分类',
  priority: '紧急程度',
  deadline: '完成期限',
  reportFrequency: '汇报频次',
  supervisors: '督办人',
  officePhone: '联系电话',
  leadDept: '牵头单位',
  leadDeptDetail: '工作推进情况'
}

// 字段权限映射
const FIELD_PERM_MAP: Record<string, string> = {
  orderTitle: 'canEditOrderTitle',
  content: 'canEditContent',
  detailType: 'canEditType',
  priority: 'canEditPriority',
  deadline: 'canEditDeadline',
  reportFrequency: 'canEditReportFrequency',
  supervisors: 'canEditSupervisors',
  officePhone: 'canEditOfficePhone',
  leadDept: 'canEditLeadDept',
  leadDeptDetail: 'canEditLeadDeptDetail'
}

// 完整的活动节点数据（从审批详情API获取）
const fullActivityNodes = ref<any[]>([])

// 获取工作流详情（补充缺失的函数）
const getWorkflowDetail = async (processInstanceId: string) => {
  // 为保持兼容性，这里可以是空实现或调用相同接口
  // 主要的节点数据由 getFullApprovalDetail 负责获取
}

// 获取完整的审批详情（包含完整的活动节点信息）
const getFullApprovalDetail = async (processInstanceId: string) => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processInstanceId: processInstanceId
    })

    if (data && data.activityNodes) {
      fullActivityNodes.value = data.activityNodes
      
      // 立即刷新权限，确保权限状态及时更新
      await checkAllPermissions()
    } else {
      console.warn('[approval] 未获取到有效的活动节点数据', { data })
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
    leadDept: true,           // 督办人可编辑牵头单位
    collaborateDepts: false,  // 
    leadDeptDetail: false,    // 
    attachments: true         //如有编辑权限可上传附件
  },
  'implement_plan': {
    leadDept: false,          // 
    collaborateDepts: false,  // 协办单位不可编辑
    leadDeptDetail: true,     //牵头/协办负责人可编辑工作推进情况
    attachments: true         // 如有编辑权限可上传附件
  },
  'upload_plan': {
    leadDept: false,          // 
    collaborateDepts: true,   // 牵头单位负责人可编辑协办单位
    leadDeptDetail: true,     // 牵头/协办负责人可编辑工作推进情况
    attachments: true         //  如有编辑权限可上传附件
  },
  'co_dept': {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: true,     // 协办负责人可编辑工作推进情况
    attachments: true
  },
  'update_materials': {
    orderTitle: true,         // 可编辑督办事项
    content: true,            // 可编辑主要内容
    type: true,               // 可编辑督办分类
    priority: true,           // 可编辑紧急程度
    deadline: true,           // 可编辑完成期限
    reportFrequency: true,    // 可编辑汇报频次
    otherLeaders: true,       // 可编辑其他校领导
    supervisors: true,        // 可编辑督办人
    officePhone: true,        // 可编辑联系电话
    attachments: true         // 可上传附件
  }
}

// 检查当前用户的所有编辑权限
const checkCurrentUserPermissions = () => {
  const currentUserId = userStore.getUser?.id
  if (!currentUserId || !fullActivityNodes.value.length) {
    console.warn('[perm] 缺少用户ID或活动节点为空', { currentUserId, nodes: fullActivityNodes.value?.length || 0 })
    return { 
      leadDept: false, 
      collaborateDepts: false, 
      leadDeptDetail: false, 
      attachments: false,
      orderTitle: false,
      content: false,
      type: false,
      priority: false,
      deadline: false,
      reportFrequency: false,
      otherLeaders: false,
      supervisors: false,
      officePhone: false
    }
  }

  const permissions = {
    leadDept: false,
    collaborateDepts: false,
    leadDeptDetail: false,
    attachments: false,
    orderTitle: false,
    content: false,
    type: false,
    priority: false,
    deadline: false,
    reportFrequency: false,
    otherLeaders: false,
    supervisors: false,
    officePhone: false
  }

  // 遍历所有运行中的活动节点
  fullActivityNodes.value.forEach(node => {
    if (node.status !== 1) return // 只处理运行中的节点

    const nodeId = node.id || node.taskDefinitionKey || node.activityId
    let hasAccess = false

    // 检查节点的tasks中是否有当前用户
    if (node.tasks && node.tasks.length > 0) {
      hasAccess = node.tasks.some(task =>
        (task.assigneeUser && Number(task.assigneeUser.id) === Number(currentUserId)) ||
        (task.ownerUser && Number(task.ownerUser.id) === Number(currentUserId))
      )
    }

    // 检查candidateUsers
    if (!hasAccess && node.candidateUsers && node.candidateUsers.length > 0) {
      hasAccess = node.candidateUsers.some(user => Number(user.id) === Number(currentUserId))
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
  canEditOrderTitle.value = permissions.orderTitle
  canEditContent.value = permissions.content
  canEditType.value = permissions.type
  canEditPriority.value = permissions.priority
  canEditDeadline.value = permissions.deadline
  canEditReportFrequency.value = permissions.reportFrequency
  canEditOtherLeaders.value = permissions.otherLeaders
  canEditSupervisors.value = permissions.supervisors
  canEditOfficePhone.value = permissions.officePhone

  // 附件权限基于是否有任何编辑权限
  const hasAnyEditPermission = permissions.leadDept ||
                               permissions.collaborateDepts ||
                               permissions.leadDeptDetail ||
                               permissions.orderTitle ||
                               permissions.content ||
                               permissions.type ||
                               permissions.priority ||
                               permissions.deadline ||
                               permissions.reportFrequency ||
                               permissions.otherLeaders ||
                               permissions.supervisors ||
                               permissions.officePhone
  // 这里可以根据实际需求调整附件权限逻辑

}

const hasEditPermission = computed(() => {
  return canEditLeadDept.value || canEditCollaborateDepts.value || canEditLeadDeptDetail.value ||
         canEditOrderTitle.value || canEditContent.value || canEditType.value ||
         canEditPriority.value || canEditDeadline.value || canEditReportFrequency.value ||
         canEditOtherLeaders.value || canEditSupervisors.value || canEditOfficePhone.value
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
  const updateData: any = {
    id: orderDetail.value.id // 督办单ID必传
  }

  // 处理督办事项
  if (canEditOrderTitle.value && editForm.value.orderTitle !== orderDetail.value.orderTitle) {
    updateData.orderTitle = editForm.value.orderTitle
  }

  // 处理主要内容
  if (canEditContent.value && editForm.value.content !== orderDetail.value.content) {
    updateData.content = editForm.value.content
  }

  // 处理督办分类
  if (canEditType.value && editForm.value.detailType !== orderDetail.value.detailType) {
    updateData.detailType = editForm.value.detailType
  }

  // 处理紧急程度
  if (canEditPriority.value && editForm.value.priority !== orderDetail.value.priority) {
    updateData.priority = editForm.value.priority
  }

  // 处理完成期限
  if (canEditDeadline.value && editForm.value.deadline) {
    // 统一转换为毫秒时间戳进行比较
    const newDeadlineMillis = new Date(editForm.value.deadline).getTime()
    const oldDeadlineMillis = orderDetail.value.deadline || 0
    
    if (newDeadlineMillis !== oldDeadlineMillis) {
      // 发送给后端时使用字符串格式（yyyy-MM-dd HH:mm:ss）
      updateData.deadline = editForm.value.deadline
    }
  }

  // 处理汇报频次
  if (canEditReportFrequency.value && editForm.value.reportFrequency !== orderDetail.value.reportFrequency) {
    updateData.reportFrequency = editForm.value.reportFrequency
  }

  // 处理其他校领导
  if (canEditOtherLeaders.value) {
    const currentOtherLeaderIds = orderDetail.value.leadLeaders ? 
      orderDetail.value.leadLeaders.filter(leader => leader.type === '其他分管领导').map(leader => leader.id) : []
    const newOtherLeaderIds = editForm.value.otherLeaderIds || []
    
    // 比较数组是否有变化
    const hasChanged = currentOtherLeaderIds.length !== newOtherLeaderIds.length ||
      !currentOtherLeaderIds.every(id => newOtherLeaderIds.includes(id))
    
    if (hasChanged) {
      updateData.otherLeaders = newOtherLeaderIds.join(',')
    }
  }

  // 处理督办人
  if (canEditSupervisors.value) {
    const currentSupervisorIds = orderDetail.value.supervisors ? 
      orderDetail.value.supervisors.map(supervisor => supervisor.id) : []
    const newSupervisorIds = editForm.value.supervisorIds || []
    
    // 比较数组是否有变化
    const hasChanged = currentSupervisorIds.length !== newSupervisorIds.length ||
      !currentSupervisorIds.every(id => newSupervisorIds.includes(id))
    
    if (hasChanged) {
      updateData.supervisors = newSupervisorIds.join(',')
    }
  }

  // 处理联系电话
  if (canEditOfficePhone.value && editForm.value.officePhone !== (orderDetail.value.officePhone || '')) {
    updateData.officePhone = editForm.value.officePhone
  }

  // 处理协办单位数据
  if (canEditCollaborateDepts.value) {
    // 在 upload_plan 节点，总是提交协办单位数据（包括清空的情况）
    const coDeptSource = editForm.value.coDept || ''
    if (coDeptSource) {
      const { coDeptString, coDeptArray } = ensureDataConsistency(coDeptSource)
      updateData.coDept = coDeptString
    } else {
      // 支持清空协办单位
      updateData.coDept = ''
    }
    // 工作流审批人配置由后端自动设置，前端不需要处理
  } else if (orderDetail.value.coDept) {
    // 无编辑权限时，保持原有数据
    const { coDeptString, coDeptArray } = ensureDataConsistency(orderDetail.value.coDept)
    updateData.coDept = coDeptString
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
// 获取字段有效值
const getEffectiveValue = (field: string): any => {
  // 优先取编辑表单的值，否则取详情数据的值
  const editValue = (editForm.value as any)[field]
  const detailValue = (orderDetail.value as any)[field]
  return editValue !== undefined && editValue !== null ? editValue : detailValue
}

// 判断字段是否可编辑
const isEditable = (field: string): boolean => {
  const permKey = FIELD_PERM_MAP[field]
  if (!permKey) return false
  
  // 通过权限映射获取对应的权限标志
  const permMap: Record<string, any> = {
    canEditOrderTitle: canEditOrderTitle.value,
    canEditContent: canEditContent.value,
    canEditType: canEditType.value,
    canEditPriority: canEditPriority.value,
    canEditDeadline: canEditDeadline.value,
    canEditReportFrequency: canEditReportFrequency.value,
    canEditSupervisors: canEditSupervisors.value,
    canEditOfficePhone: canEditOfficePhone.value,
    canEditLeadDept: canEditLeadDept.value,
    canEditLeadDeptDetail: canEditLeadDeptDetail.value
  }
  
  return !!permMap[permKey]
}

// 通用空值判断
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'number') return false // 数字0也是有效值
  return false
}

// 联系电话格式校验
const validatePhone = (value: string): boolean => {
  if (!value || !value.trim()) return false
  const phone = value.trim()
  // 手机号格式：11位数字，1开头
  const mobilePattern = /^1[3-9]\d{9}$/
  // 座机格式：区号-号码 或 纯数字座机
  const landlinePattern = /^(0\d{2,3}-?\d{7,8}|\d{7,8})$/
  return mobilePattern.test(phone) || landlinePattern.test(phone)
}

// 统一校验入口
const validateBeforeUpdate = async (contextTaskKey?: string): Promise<void> => {
  // 通用规则：有"添加工作推进"按钮权限时，必须在本会话新增一条进度记录
  if (canEditLeadDeptDetail.value && !hasNewProgressInThisSession.value) {
    throw new Error('请先新增一条工作推进记录再提交')
  }
  
  // 节点特定规则校验
  if (contextTaskKey) {
    switch (contextTaskKey) {
      case 'select_leaddept':
        // 督办人选择牵头部门节点 - 检查牵头单位
        const leadDeptValue = getEffectiveValue('leadDept')
        if (isEmpty(leadDeptValue)) {
          throw new Error('请先选择牵头部门')
        }
        break
        
      case 'implement_plan':
      case 'upload_plan':
      case 'co_dept':
        // 需要填写工作推进情况的节点：改为仅检查是否存在至少一条进度记录
        const hasProgressRecords = Array.isArray(progressRecords.value) && progressRecords.value.length > 0
        if (!hasProgressRecords) {
          throw new Error('请通过"添加工作推进"功能填写工作推进情况')
        }
        break
    }
  }
  
  // 创建必填字段校验（仅校验当前可编辑的字段）
  for (const field of CREATION_REQUIRED_FIELDS) {
    if (isEditable(field)) {
      const value = getEffectiveValue(field)
      const fieldLabel = FIELD_LABEL_MAP[field] || field
      
      if (isEmpty(value)) {
        throw new Error(`请填写${fieldLabel}`)
      }
      
      // 联系电话额外格式校验
      if (field === 'officePhone' && typeof value === 'string' && !validatePhone(value)) {
        throw new Error('请输入正确的手机号或座机号码')
      }
    }
  }
  
  // 协办单位提醒（仅当有编辑权限时）
  if (canEditCollaborateDepts.value) {
    const collaborateDeptIds = editForm.value.collaborateDeptIds || []
    const coDept = editForm.value.coDept || ''
    
    if (collaborateDeptIds.length === 0 && coDept.trim() === '') {
      try {
        await ElMessageBox.confirm(
          '您未选择协办单位，如确无需要可直接继续提交。是否继续？',
          '温馨提示',
          {
            confirmButtonText: '继续提交',
            cancelButtonText: '返回选择',
            type: 'warning',
            center: true
          }
        )
      } catch (error) {
        // 用户选择返回选择，抛出特殊错误码
        throw new Error('USER_CANCELLED_COLLABORATE_DEPT_SELECTION')
      }
    }
  }
}

// 更新督办单数据（供工作流调用）
const updateSupervisionOrder = async (startLeaderSelectAssignees?: Record<string, number[]>, contextTaskKey?: string) => {
  try {
    // 统一校验入口
    await validateBeforeUpdate(contextTaskKey)
    
    // 移除了待提交进度更新的逻辑，现在进度更新直接提交

    const updateData = await getSupervisionWorkflowUpdateData(startLeaderSelectAssignees)

    // 只有当有实际修改的字段时才调用接口
    const hasChanges = (updateData.leadDept !== undefined) ||
                      (updateData.coDept !== undefined) ||
                      (updateData.deptDetail !== undefined) ||
                      (updateData.orderTitle !== undefined) ||
                      (updateData.content !== undefined) ||
                      (updateData.type !== undefined) ||
                      (updateData.priority !== undefined) ||
                      (updateData.deadline !== undefined) ||
                      (updateData.reportFrequency !== undefined) ||
                      (updateData.otherLeaders !== undefined) ||
                      (updateData.supervisors !== undefined) ||
                      (updateData.officePhone !== undefined)

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
      if (canEditOrderTitle.value && updateData.orderTitle !== undefined) {
        orderDetail.value.orderTitle = editForm.value.orderTitle
      }
      if (canEditContent.value && updateData.content !== undefined) {
        orderDetail.value.content = editForm.value.content
      }
      if (canEditType.value && updateData.type !== undefined) {
        orderDetail.value.type = editForm.value.type
      }
      if (canEditPriority.value && updateData.priority !== undefined) {
        orderDetail.value.priority = editForm.value.priority
      }
      if (canEditDeadline.value && updateData.deadline !== undefined) {
        orderDetail.value.deadline = updateData.deadline
      }
      if (canEditReportFrequency.value && updateData.reportFrequency !== undefined) {
        orderDetail.value.reportFrequency = editForm.value.reportFrequency
      }
      // 更新其他校领导本地数据
      if (canEditOtherLeaders.value && updateData.otherLeaders !== undefined) {
        // 更新leadLeaders数组中的其他分管领导
        const otherLeaderUsers = userList.value.filter(user => editForm.value.otherLeaderIds.includes(user.id))
        const existingLeaders = orderDetail.value.leadLeaders ? 
          orderDetail.value.leadLeaders.filter(leader => leader.type !== '其他分管领导') : []
        const newOtherLeaders = otherLeaderUsers.map(user => ({
          id: user.id,
          name: user.nickname,
          type: '其他分管领导'
        }))
        orderDetail.value.leadLeaders = [...existingLeaders, ...newOtherLeaders]
      }
      // 更新督办人本地数据
      if (canEditSupervisors.value && updateData.supervisors !== undefined) {
        const supervisorUsers = userList.value.filter(user => editForm.value.supervisorIds.includes(user.id))
        orderDetail.value.supervisors = supervisorUsers.map(user => ({
          id: user.id,
          name: user.nickname,
          phone: user.mobile || ''
        }))
      }
      // 更新联系电话本地数据
      if (canEditOfficePhone.value && updateData.officePhone !== undefined) {
        orderDetail.value.officePhone = editForm.value.officePhone
      }
    }
    // 返回更新的数据，供工作流使用
    return {
      success: true,
      data: updateData
    }
  } catch (error) {
    console.error('更新督办单失败:', error)
    // 提取具体错误信息
    const errorMessage = extractErrorMessage(error)
    
    // 如果是用户取消协办单位选择，静默返回，不显示错误
    if (errorMessage === 'USER_CANCELLED_COLLABORATE_DEPT_SELECTION') {
      return {
        success: false,
        data: null
      }
    }
    
    // 向上抛出具体错误，避免上层显示通用错误
    throw new Error(errorMessage)
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
            description: record.deptDetail || '', // 不再默认显示'暂无详细信息'
            remark: record.remark || '', // 保留批示字段
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
  return utilFormatDate(date, 'YYYY年MM月DD日 HH:mm')
}

// 根据节点key获取指定节点的通过时间
const getNodePassTimeByKey = (taskDefinitionKey: string): number | null => {
  if (!fullActivityNodes.value || fullActivityNodes.value.length === 0) {
    return null
  }
  
  // 查找已完成的指定节点 (status === 2)，使用 id 字段匹配
  const targetNode = fullActivityNodes.value.find(node => 
    node.status === 2 && node.id === taskDefinitionKey
  )
  
  if (targetNode && targetNode.endTime) {
    return Number(targetNode.endTime)
  }
  
  return null
}

// 获取督查办主任审核通过时间（立项督办）
const getDirectorCheckPassTime = (): number | null => {
  return getNodePassTimeByKey('director_check')
}

// 获取督查办主任复核通过时间（结束督办）
const getDirectorRecheckPassTime = (): number | null => {
  return getNodePassTimeByKey('director_recheck')
}

// 获取审批通过时间
const getApprovalPassTime = (preferType?: 'project' | 'close'): number | null => {
  // 优先级1: 从流程节点中查找通过节点的 endTime
  if (fullActivityNodes.value && fullActivityNodes.value.length > 0) {
    // 查找已完成的节点 (status === 2)
    const completedNodes = fullActivityNodes.value.filter(node => node.status === 2)
    
    if (completedNodes.length > 0) {
      // 按完成时间倒序排列，取最新的完成节点
      const sortedNodes = completedNodes.sort((a, b) => {
        const endTimeA = a.endTime || 0
        const endTimeB = b.endTime || 0
        return endTimeB - endTimeA
      })
      
      const latestCompletedNode = sortedNodes[0]
      if (latestCompletedNode.endTime) {
        return latestCompletedNode.endTime
      }
    }
  }
  
  // 优先级2: 使用 props.applyTime
  if (props.applyTime) {
    const applyTimeNum = typeof props.applyTime === 'string' ? 
      new Date(props.applyTime).getTime() : 
      Number(props.applyTime)
    if (!isNaN(applyTimeNum) && applyTimeNum > 0) {
      return applyTimeNum
    }
  }
  
  // 优先级3: 返回 null（无时间）
  return null
}

// 计算属性：立项督办审批状态文本（使用督查办主任审核通过时间）
const projectApprovalText = computed(() => {
  // 未通过或未审批：显示空白
  if (!orderDetail.value.isProjectSupervision) {
    return ''
  }
  
  // 获取督查办主任审核通过时间
  const passTime = getDirectorCheckPassTime()
  if (passTime) {
    const formattedTime = utilFormatDate(new Date(passTime), 'YYYY年MM月DD日 HH:mm')
    return `同意督办 ${formattedTime}`
  }
  
  // 找不到时间：只显示"同意督办"
  return '同意督办'
})

// 计算属性：结束督办审批状态文本（使用督查办主任复核通过时间）
const closeApprovalText = computed(() => {
  // 未通过或未审批：显示空白
  if (!orderDetail.value.isSupervisionClosed) {
    return ''
  }
  
  // 获取督查办主任复核通过时间
  const passTime = getDirectorRecheckPassTime()
  if (passTime) {
    const formattedTime = utilFormatDate(new Date(passTime), 'YYYY年MM月DD日 HH:mm')
    return `同意结束督办 ${formattedTime}`
  }
  
  // 找不到时间：只显示"同意结束督办"
  return '同意结束督办'
})

// 时间选择限制通用工具函数
// 计算默认时间（当前时间的下一个小时）
const getNextHourDefaultTime = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)
  return nextHour
}

// 构建禁用日期函数
const buildDisabledDate = (getSelectedStr: () => string) => {
  return (time: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 设置为今天的开始时间
    return time.getTime() < today.getTime()
  }
}

// 构建禁用小时函数
const buildDisabledHours = (getSelectedStr: () => string) => {
  return () => {
    const now = new Date()
    const selectedStr = getSelectedStr()
    const selectedDate = selectedStr ? new Date(selectedStr) : null

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
}

// 构建禁用分钟函数
const buildDisabledMinutes = (getSelectedStr: () => string) => {
  return (hour: number) => {
    const now = new Date()
    const selectedStr = getSelectedStr()
    const selectedDate = selectedStr ? new Date(selectedStr) : null

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
}

// 完成期限时间选择限制
const defaultDeadlineTime = ref(getNextHourDefaultTime())
const disabledDeadlineDate = buildDisabledDate(() => editForm.value.deadline)
const disabledDeadlineHours = buildDisabledHours(() => editForm.value.deadline)
const disabledDeadlineMinutes = buildDisabledMinutes(() => editForm.value.deadline)

// 预计完成时间选择限制
const defaultProgressTime = ref(getNextHourDefaultTime())
const disabledProgressDate = buildDisabledDate(() => progressForm.planTime)
const disabledProgressHours = buildDisabledHours(() => progressForm.planTime)
const disabledProgressMinutes = buildDisabledMinutes(() => progressForm.planTime)

// 显示添加进度更新弹窗
const showAddProgressDialog = () => {
  addProgressDialogVisible.value = true
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
}

// 显示添加批示弹窗
const showAddRemarkDialog = () => {
  addRemarkDialogVisible.value = true
  // 重置表单
  remarkForm.remark = ''
}

// 取消添加批示
const cancelAddRemark = () => {
  addRemarkDialogVisible.value = false
  remarkForm.remark = ''
}

// 提交批示
const submitAddRemark = async () => {
  if (!remarkFormRef.value) return

  try {
    await remarkFormRef.value.validate()

    const processInstanceId = props.id?.toString() ||
                             route.query.processInstanceId as string ||
                             route.params.id as string ||
                             route.query.id as string

    // 调用批示创建接口
    const remarkData = {
      processInstanceId: processInstanceId || '',
      remark: remarkForm.remark
    }
    // 实际调用后端批示创建接口
    await LeaderRemarkApi.insertLeaderRemark(remarkData)
    
    ElMessage.success('批示添加成功')
    addRemarkDialogVisible.value = false
    remarkForm.remark = ''

    // 刷新进度记录列表
    if (refreshProcessInstanceId) {
      await getProgressRecords(refreshProcessInstanceId, isExpanded.value)
    }
  } catch (error) {
    console.error('添加批示失败:', error)
    ElMessage.error('添加批示失败')
  }
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
const remarkFormRef = ref()

// 取消添加进度更新
const cancelAddProgress = () => {
  addProgressDialogVisible.value = false
  
  // 重置表单
  progressForm.deptDetail = ''
  progressForm.planTime = ''
  progressForm.fileList = []
}

// 移除了编辑待提交进度的功能

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

// 检查是否有文件正在上传
const checkUploadStatus = () => {
  const uploadingFiles = progressForm.fileList.filter(file => 
    file.status === 'uploading' || 
    (file.raw && !file.url) // 文件存在但还没有URL，说明还在上传
  )
  
  const failedFiles = progressForm.fileList.filter(file => 
    file.status === 'fail'
  )
  
  return {
    hasUploading: uploadingFiles.length > 0,
    hasFailed: failedFiles.length > 0,
    uploadingCount: uploadingFiles.length,
    failedCount: failedFiles.length
  }
}

// 提交添加进度更新（直接调用后端接口立即新增进度记录）
const submitAddProgress = async () => {
  if (!progressFormRef.value) return
  
  // 防止重复提交
  if (progressSubmitting.value) return

  // 检查文件上传状态
  const uploadStatus = checkUploadStatus()
  
  if (uploadStatus.hasUploading) {
    ElMessage.warning(`还有 ${uploadStatus.uploadingCount} 个文件正在上传中，请等待上传完成后再提交`)
    return
  }
  
  if (uploadStatus.hasFailed) {
    ElMessage.error(`有 ${uploadStatus.failedCount} 个文件上传失败，请先移除失败的文件或重新上传`)
    return
  }

  try {
    // 表单验证
    await progressFormRef.value.validate()
    
    // 二次确认弹窗
    await ElMessageBox.confirm(
      '确认提交该工作进度吗？',
      '二次确认',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
    
    // 开始提交
    progressSubmitting.value = true

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

    // 直接调用后端接口新增进度记录
    const progressData = {
      processInstanceId: processInstanceId || '',
      deptDetail: progressForm.deptDetail,
      planTime: progressForm.planTime || undefined,
      fileList: fileList.length > 0 ? fileList : undefined
    }

    await OrderApi.insertSupervisionOrderTaskNew(progressData)
    
    // 标记本会话已新增进度记录
    hasNewProgressInThisSession.value = true
    
    ElMessage.success('进度记录已成功添加')
    addProgressDialogVisible.value = false

    // 重置表单
    progressForm.deptDetail = ''
    progressForm.planTime = ''
    progressForm.fileList = []

    // 刷新进度记录列表
    const refreshProcessInstanceId = props.id?.toString() ||
                                   route.query.processInstanceId as string ||
                                   route.params.id as string ||
                                   route.query.id as string
    if (refreshProcessInstanceId) {
      await getProgressRecords(refreshProcessInstanceId, isExpanded.value)
    }
  } catch (error) {
    // 用户取消确认时，error 是字符串 'cancel' 或 'close'，不显示错误信息
    if (error === 'cancel' || error === 'close') {
      // 用户取消，静默处理
      return
    }
    
    console.error('添加进度更新失败:', error)
    ElMessage.error('添加进度更新失败')
  } finally {
    progressSubmitting.value = false
  }
}

// 初始化
onMounted(async () => {
  // 获取基础数据
  await Promise.all([
    getDeptList(),
    getUserList(),
    getTypeOptions()
  ])
  
  // 获取流程实例ID
  const processInstanceId = props.id?.toString() || 
                           route.query.processInstanceId as string || 
                           route.params.id as string || 
                           route.query.id as string

  if (processInstanceId) {
    try {
      // 并行获取督办单详情和进度记录
      await Promise.all([
        getOrderDetail(processInstanceId),
        getProgressRecords(processInstanceId, isExpanded.value)
      ])
    } catch (error) {
      console.error('❌ 详情接口调用失败:', error)
    }
    
    // 获取工作流详情
    await getWorkflowDetail(processInstanceId)
    
    // 获取完整审批详情（包含活动节点信息）
    await getFullApprovalDetail(processInstanceId)
    
    // 获取督办分类选项
    await getTypeOptions()
    
    // 检查权限
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

// 移除冻结时间相关逻辑，现在直接基于指定节点的通过时间显示


// 移除了清理待提交进度更新数据的功能

// 暴露方法供外部调用
defineExpose({
  updateSupervisionOrder,
  hasEditPermission: computed(() => hasEditPermission.value),
  // 移除了 pendingProgressUpdate 相关的暴露接口
  cancelAddProgress,
  showAddProgressDialog,
  getOrderDetailData,
  getEditFormData,
  canEditLeadDept: computed(() => canEditLeadDept.value),
  canEditCollaborateDepts: computed(() => canEditCollaborateDepts.value),
  canEditLeadDeptDetail: computed(() => canEditLeadDeptDetail.value),
  // 新增：牵头单位负责人权限判断
  isLeadDeptLeaderReady: computed(() => isLeadDeptLeaderReady.value),
  isLeadDeptLeader: computed(() => isLeadDeptLeader.value)
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
  color: #606266;
  cursor: default;
}

:deep(.el-textarea__inner[readonly]) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: default;
}

/* 更高优先级：覆盖全局只读的灰底设置 */
.order-form :deep(.readonly-display .el-input__inner[readonly]) {
  background: transparent !important;
}

.order-form :deep(.readonly-display .el-textarea__inner[readonly]) {
  background: transparent !important;
}

.order-form :deep(.readonly-display input[readonly]),
.order-form :deep(.readonly-display .el-textarea__inner[readonly]) {
  color: var(--el-text-color-regular);
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

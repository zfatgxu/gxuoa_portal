<template>
  <div ref="containerRef" class="list-operation-button has-anchor">
    <el-button 
      v-if="shouldShowApprove" 
      type="success" 
      size="default" 
      ref="approveBtnRef"
      @click.stop="handleApprove"
      :loading="approveLoading"
      :style="{ backgroundColor: '#81B337', borderColor: '#81B337' }"
    >
      通过
    </el-button>
    <el-button 
      v-if="shouldShowReject" 
      type="danger" 
      size="default" 
      ref="rejectBtnRef"
      @click.stop="handleReject"
      :loading="rejectLoading"
      class="ml-2"
      :style="{ backgroundColor: '#F44336', borderColor: '#F44336' }"
    >
      拒绝
    </el-button>
    <el-button 
      v-if="shouldShowTerminate" 
      type="danger" 
      size="default" 
      @click.stop="handleTerminate"
      :loading="terminateLoading"
      class="ml-2"
      :style="{ backgroundColor: '#F44336', borderColor: '#F44336' }"
    >
      终止督办
    </el-button>
    <el-button 
      v-if="shouldShowDelegate" 
      type="warning" 
      size="default" 
      ref="delegateBtnRef"
      @click.stop="openDelegatePopover"
      :loading="delegateLoading"
      class="ml-2"
    >
      代管
    </el-button>
    <el-button 
      v-if="shouldShowCancelDelegate" 
      type="info" 
      size="default" 
      @click.stop="handleCancelDelegate"
      :loading="cancelDelegateLoading"
      class="ml-2"
    >
      取消代管
    </el-button>
    <el-button 
      v-if="shouldShowSuspend" 
      type="warning" 
      size="default" 
      @click.stop="handleSuspend"
      :loading="suspendLoading"
      class="ml-2"
      :style="{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }"
    >
      中止
    </el-button>
    <el-button 
      v-if="shouldShowResume" 
      type="success" 
      size="default" 
      @click.stop="handleResume"
      :loading="resumeLoading"
      class="ml-2"
      :style="{ backgroundColor: '#10B981', borderColor: '#10B981' }"
    >
      恢复
    </el-button>
  </div>
  
  <!-- 审批弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    @close="resetDialog"
    @click.stop
  >
    <div v-if="dialogLoading" class="text-center py-4">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span class="ml-2">加载中...</span>
    </div>
    <div v-else-if="dialogError" class="text-center py-4 text-red-500">
      {{ dialogError }}
    </div>
    <SupervisionOperationButton
      v-else
      ref="operationButtonRef"
      :process-instance="processInstance"
      :process-definition="processDefinition"
      :user-options="userOptions"
      :normal-form="detailForm"
      :normal-form-api="fApi"
      :writable-fields="writableFields"
      :lead-dept-leader-ids="leadDeptLeaderIdsRef"
      :use-dialog="true"
      :dialog-type="dialogType"
      @success="handleSuccess"
      @dialog-cancel="resetDialog"
    />
  </el-dialog>

  <!-- 代管弹窗 -->
  <el-popover
    v-model:visible="popOverVisible.delegate"
    placement="top"
    :width="420"
    trigger="manual"
    teleported
    :virtual-triggering="true"
    :virtual-ref="delegateBtnRef"
    :popper-options="{ strategy: 'fixed' }"
    popper-class="supervision-delegate-popper"
    :hide-after="0"
    :auto-close="0"
    persistent
  >
    <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="delegateLoading" @click.stop>
      <el-form
        label-position="top"
        class="mb-auto"
        ref="delegateFormRef"
        :model="delegateForm"
        :rules="delegateFormRule"
        label-width="100px"
      >
        <el-form-item label="代管人员" prop="delegateUserId">
          <el-select v-model="delegateForm.delegateUserId" clearable style="width: 100%" filterable :teleported="false" @click.stop>
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.nickname"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="代管理由" prop="reason">
          <el-input
            v-model="delegateForm.reason"
            clearable
            placeholder="请输入代管理由（可选）"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item>
          <el-button :disabled="delegateLoading" type="primary" @click="handleDelegateConfirm">
            确认代管
          </el-button>
          <el-button @click="closeDelegatePopover"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-popover>

    <!-- 中止确认弹窗 -->
    <el-dialog
      v-model="suspendDialogVisible"
      title="中止督办"
      width="400px"
      :close-on-click-modal="false"
      @close="resetSuspendDialog"
    >
      <div class="text-gray-600">
        确认中止此督办吗？中止后，此督办将对除主任、副主任、管理员外的所有人不可见，且无法提交进度。
      </div>
      <template #footer>
        <el-button @click="resetSuspendDialog">取消</el-button>
        <el-button type="warning" @click="confirmSuspend" :loading="suspendLoading">
          确认中止
        </el-button>
      </template>
    </el-dialog>

  <!-- 恢复确认弹窗 -->
  <el-dialog
    v-model="resumeDialogVisible"
    title="恢复督办"
    width="400px"
    :close-on-click-modal="false"
    @close="resetResumeDialog"
  >
    <div class="text-gray-600">
      确认恢复此督办吗？恢复后此督办将对相关人员可见并可继续推进。
    </div>
    <template #footer>
      <el-button @click="resetResumeDialog">取消</el-button>
      <el-button type="success" @click="confirmResume" :loading="resumeLoading">
        确认恢复
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType, BpmProcessInstanceStatus } from '@/utils/constants'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as UserApi from '@/api/system/user'
import * as TaskApi from '@/api/bpm/task'
import { SupervisionProcessApi, SupervisionTaskOperationApi, OrderApi } from '@/api/supervision/index'
import { checkRole } from '@/utils/permission'
import { canSuspendResume } from '../components/permissions'
import SupervisionOperationButton from './SupervisionOperationButton.vue'
import { useUserStore } from '@/store/modules/user'

const emit = defineEmits(['success'])
const userStore = useUserStore()

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

// 组件根元素引用
const containerRef = ref<HTMLElement>()
// IntersectionObserver 实例
let observer: IntersectionObserver | null = null
// 是否已经加载过审批详情
const hasLoadedDetail = ref(false)
// 审批详情加载状态
const detailLoading = ref(false)
// 当前运行中的任务（来自审批详情）
const runningTask = ref<any>(null)
// 是否有进行中的终止流程（来自审批详情顶层字段）
const terminateRunningRef = ref(false)
// 被代管中的任务ID（用于原办理人取消代管）
const delegatedTaskIdRef = ref<string | null>(null)

// 按钮状态
const approveLoading = ref(false)
const rejectLoading = ref(false)
const terminateLoading = ref(false)
const delegateLoading = ref(false)
const cancelDelegateLoading = ref(false)
const suspendLoading = ref(false)
const resumeLoading = ref(false)

// 添加错误状态
const detailError = ref('')
// 审批详情数据（仅在点击时加载）
const processInstance = ref<any>(null)
const processDefinition = ref<any>(null)
const operationButtonRef = ref()
const approveBtnRef = ref<HTMLElement | null>(null)
const rejectBtnRef = ref<HTMLElement | null>(null)
// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const dialogError = ref('')
const dialogType = ref<'approve' | 'reject' | null>(null)
const fApi = ref<any>()
const detailForm = ref<any>({ rule: [], option: {}, value: {} })
const writableFields: string[] = []
const userOptions = ref<UserApi.UserVO[]>([])
const leadDeptLeaderIdsRef = ref<number[]>([])

// 代管相关状态
const delegateBtnRef = ref<HTMLElement>()
const delegateFormRef = ref()
const popOverVisible = ref({
  delegate: false
})
const delegateForm = ref({
  delegateUserId: undefined,
  reason: ''
})
const delegateFormRule = ref({
  delegateUserId: [{ required: true, message: '接收人不能为空', trigger: 'change' }],
  reason: [{ required: false, message: '代管理由', trigger: 'blur' }]
})

// 中止和恢复相关状态
const suspendDialogVisible = ref(false)
const resumeDialogVisible = ref(false)

// 锚点定位样式（用于将 Popover 的 reference 放到点击按钮附近）
const anchorStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })

// 将锚点移动到目标元素的位置（相对 containerRef）
const moveAnchorTo = (el: HTMLElement | null) => {
  if (!el || !containerRef.value) return
  const btnRect = el.getBoundingClientRect()
  const containerRect = (containerRef.value as HTMLElement).getBoundingClientRect()
  // 将锚点移动到“按钮右侧 12px、垂直居中”的位置
  const left = btnRect.right - containerRect.left + 12
  const top = btnRect.top - containerRect.top + (btnRect.height / 2)
  anchorStyle.value = {
    left: left + 'px',
    top: top + 'px'
  }
}


// 与详情页完全一致的任务状态判断
const isHandleTaskStatus = () => {
  if (!runningTask.value) return false
  return runningTask.value.status === TaskApi.TaskStatusEnum.RUNNING
}

// 与详情页完全一致的按钮显示判断
const isShowButton = (btnType: string): boolean => {
  if (!runningTask.value) return false
  
  let isShow = true
  if (runningTask.value.buttonsSetting && runningTask.value.buttonsSetting[btnType]) {
    isShow = runningTask.value.buttonsSetting[btnType].enable
  }

  // 获取当前节点key
  const currentTaskKey = runningTask.value.taskDefinitionKey
  
  // 督办系统特殊逻辑：节点+身份规则控制按钮可见性（与详情页一致）
  if (btnType === 'REJECT') {
    // select_leaddept、implement_plan、update_materials 节点不显示拒绝按钮
    if (currentTaskKey === 'select_leaddept' || currentTaskKey === 'implement_plan' || currentTaskKey === 'update_materials') {
      isShow = false
    }
  }
  
  // implement_plan 节点的通过按钮：仅督办人可见（注：实际被全局拦截覆盖，强制去详情页办理）
  if (btnType === 'APPROVE' && currentTaskKey === 'implement_plan') {
    const currentUserId = userStore.getUser.id
    
    // 获取督办人列表（与详情页逻辑保持一致）
    const orderData = orderDetailRef.value?.getOrderDetailData?.()
    const supervisors = orderData?.supervisors || []
    
    // 只有当前用户在督办人列表中才显示通过按钮
    isShow = supervisors.some(supervisor => supervisor.id === Number(currentUserId))
  }

  return isShow
}

// 按钮显示逻辑：与详情页完全一致
const shouldShowButtons = computed(() => {
  const task = props.task
  // 基本条件：任务存在且有流程实例ID
  if (!task || !getProcessInstanceId(task)) return false
  
  // 必须已加载审批详情且有运行中任务
  if (!hasLoadedDetail.value || !runningTask.value) return false
  
  // 特殊节点：upload_plan 和 implement_plan 在列表页不显示任何按钮，强制去详情页办理
  const currentTaskKey = runningTask.value.taskDefinitionKey
  if (currentTaskKey === 'upload_plan' || currentTaskKey === 'implement_plan') {
    return false
  }
  
  // 使用与详情页相同的判断逻辑
  return isHandleTaskStatus()
})

// 显示通过按钮（与详情页一致）
const shouldShowApprove = computed(() => {
  if (!shouldShowButtons.value) return false
  return isShowButton('APPROVE')
})

// 显示拒绝按钮（与详情页一致）
const shouldShowReject = computed(() => {
  if (!shouldShowButtons.value) return false
  return isShowButton('REJECT')
})

// 显示终止督办按钮（与详情页一致）
const shouldShowTerminate = computed(() => {
  try {
    // 1. 当前用户必须是督查办管理员
    if (!checkRole(['dcb_gly'])) {
      return false
    }

    // 2. 必须已加载审批详情且有流程实例数据
    if (!hasLoadedDetail.value || !processInstance.value) {
      return false
    }

    // 3. 主流程必须未结束（检查 endTime 和 status）
    if (processInstance.value.endTime) {
      // 如果有结束时间，说明主流程已结束，不应显示终止按钮
      return false
    }
    
    // 检查流程状态是否为终态（已通过、已拒绝、已取消）
    if (processInstance.value.status === BpmProcessInstanceStatus.APPROVE ||
        processInstance.value.status === BpmProcessInstanceStatus.REJECT ||
        processInstance.value.status === BpmProcessInstanceStatus.CANCEL) {
      return false
    }

    // 4. 当前不能已有进行中的终止流程
    if (terminateRunningRef.value === true) {
      return false
    }

    return true
  } catch (error) {
    console.warn('[shouldShowTerminate] 判断终止按钮显示失败:', error)
    return false
  }
})

// ========== 代管相关计算属性 ==========
/** 判断当前任务是否处于代管状态 */
const isDelegated = computed(() => {
  if (!runningTask.value) return false
  
  // 检查是否有 ownerUser 且与 assigneeUser 不同
  const ownerUser = runningTask.value.ownerUser
  const assigneeUser = runningTask.value.assigneeUser
  
  if (ownerUser && assigneeUser && ownerUser.id !== assigneeUser.id) {
    return true
  }
  
  // 检查 delegationState 字段（如果后端提供）
  if (runningTask.value.delegationState === 'PENDING') {
    return true
  }
  
  return false
})

/** 是否显示代管按钮 */
const shouldShowDelegate = computed(() => {
  if (!runningTask.value || !shouldShowButtons.value) return false
  
  // 如果已经是代管状态，不能再次代管
  if (isDelegated.value) return false
  
  // 检查当前用户是否是任务的办理人
  const currentUserId = userStore.getUser.id
  const assigneeUserId = runningTask.value.assigneeUser?.id
  
  return currentUserId === assigneeUserId
})

/** 是否显示取消代管按钮 */
const shouldShowCancelDelegate = computed(() => {
  // 方法1：通过 delegatedTaskIdRef 判断（优先）
  if (delegatedTaskIdRef.value) {
    return true // 如果有 delegatedTaskIdRef，说明当前用户是原办理人且任务被代管中
  }
  
  // 方法2：通过 runningTask 判断（兜底）
  if (!runningTask.value || !isDelegated.value) return false
  
  // 检查当前用户是否是原始办理人（ownerUser）
  const currentUserId = userStore.getUser.id
  const ownerUserId = runningTask.value.ownerUser?.id
  
  return currentUserId === ownerUserId
})

// 显示中止按钮
const shouldShowSuspend = computed(() => {
  try {
    // 1. 当前用户必须是主任或副主任
    if (!canSuspendResume()) {
      return false
    }

    // 2. 督办状态不能是已中止
    const supervisionStatus = props.task.supervisionStatus || props.task.supervisionPageVOData?.supervisionStatus
    if (supervisionStatus === 6) {
      return false
    }

    return true
  } catch (error) {
    console.warn('[shouldShowSuspend] 判断中止按钮显示失败:', error)
    return false
  }
})

// 显示恢复按钮
const shouldShowResume = computed(() => {
  try {
    // 1. 当前用户必须是主任或副主任
    if (!canSuspendResume()) {
      return false
    }

    // 2. 督办状态必须是已中止
    const supervisionStatus = props.task.supervisionStatus || props.task.supervisionPageVOData?.supervisionStatus
    if (supervisionStatus !== 6) {
      return false
    }

    return true
  } catch (error) {
    console.warn('[shouldShowResume] 判断恢复按钮显示失败:', error)
    return false
  }
})

// 获取流程实例ID
const getProcessInstanceId = (task) => {
  const id = task.processInstanceId || task.processInstance?.id || task.processInstanceID || task.id
  // 确保返回字符串类型
  return id ? String(id) : null
}

// 加载审批详情（用于判断按钮显示）
const loadApprovalDetailForDisplay = async () => {
  if (hasLoadedDetail.value || detailLoading.value) return
  
  const processInstanceId = getProcessInstanceId(props.task)
  if (!processInstanceId) return
  
  detailLoading.value = true
  
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({ processInstanceId })
    
    if (data) {
      // 始终保存流程实例信息（用于终止按钮判断），不依赖 todoTask 是否存在
      processInstance.value = data.processInstance
      
      // 保存顶层的 terminateRunning 字段（正确的字段路径）
      terminateRunningRef.value = !!data.terminateRunning
      
      // 仅在有 todoTask 时保存运行中的任务信息
      if (data.todoTask) {
        runningTask.value = data.todoTask
      }
      
      // 同步牵头单位负责人ID
      try {
        const ids = data?.businessData?.leadDeptLeaderIds || []
        leadDeptLeaderIdsRef.value = Array.isArray(ids) ? ids : []
      } catch { /* ignore */ }

      // 查询被代管的任务（用于原办理人取消代管）
      await findDelegatedTaskForList()
    }
    
    hasLoadedDetail.value = true
  } catch (error) {
    // 静默处理错误，不显示按钮
    console.warn('加载审批详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

/** 查询被代管的任务（列表页版本） */
const findDelegatedTaskForList = async () => {
  try {
    if (!processInstance.value?.id) return
    
    // 获取当前流程实例的所有运行任务
    const tasks = await TaskApi.getTaskListByProcessInstanceId(processInstance.value.id)
    if (!tasks || !Array.isArray(tasks)) return
    
    const currentUserId = userStore.getUser.id
    
    // 查找当前用户作为原办理人的被代管任务
    const delegatedTask = tasks.find(task => {
      // 方法1：通过 delegationState 判断
      if (task.delegationState === 'PENDING' && task.ownerUser?.id === currentUserId) {
        return true
      }
      
      // 方法2：通过 ownerUser 和 assigneeUser 不同判断
      if (task.ownerUser?.id === currentUserId && 
          task.assigneeUser?.id && 
          task.ownerUser.id !== task.assigneeUser.id) {
        return true
      }
      
      return false
    })
    
    if (delegatedTask) {
      delegatedTaskIdRef.value = delegatedTask.id
      console.log('列表页找到被代管的任务:', delegatedTask.id)
    } else {
      delegatedTaskIdRef.value = null
    }
  } catch (error) {
    console.warn('列表页查询被代管任务失败:', error)
    delegatedTaskIdRef.value = null
  }
}

// 加载完整审批详情（仅在点击按钮时调用）
const loadFullApprovalDetail = async () => {
  const processInstanceId = getProcessInstanceId(props.task)
  if (!processInstanceId) {
    throw new Error('缺少流程实例ID')
  }

  const data = await ProcessInstanceApi.getApprovalDetail({ processInstanceId })
  
  if (!data || !data.processInstance || !data.processDefinition) {
    throw new Error('审批详情数据不完整')
  }
  
  processInstance.value = data.processInstance
  processDefinition.value = data.processDefinition

  // 同步牵头单位负责人ID
  try {
    const ids = data?.businessData?.leadDeptLeaderIds || []
    leadDeptLeaderIdsRef.value = Array.isArray(ids) ? ids : []
  } catch { /* ignore */ }

  // 表单准备（仅 NORMAL 表单需要）
  if (processDefinition.value.formType === BpmModelFormType.NORMAL) {
    const formFieldsPermission = data.formFieldsPermission || {}
    writableFields.splice(0)
    
    setConfAndFields2(
      detailForm,
      processDefinition.value.formConf,
      processDefinition.value.formFields,
      processInstance.value.formVariables
    )
    
    await nextTick()
    try {
      fApi.value?.btn?.show(false)
      fApi.value?.resetBtn?.show(false)
      fApi.value?.disabled?.(true)
    } catch { /* ignore */ }
    
    // 收集可写字段
    Object.keys(formFieldsPermission).forEach((field) => {
      if (formFieldsPermission[field] === 'WRITE') {
        writableFields.push(field)
      }
    })
  }

  // 加载运行中的任务到操作按钮组件
  if (data.todoTask) {
    await nextTick()
    operationButtonRef.value?.loadTodoTask(data.todoTask)
  }
  
  // 加载用户选项
  if (userOptions.value.length === 0) {
    userOptions.value = await UserApi.getSimpleUserList()
  }

  // 返回审批详情，便于调用方使用 todoTask 等字段
  return data
}

// 处理通过操作
const handleApprove = async () => {
  approveLoading.value = true
  dialogTitle.value = '审批通过'
  dialogType.value = 'approve'
  dialogVisible.value = true
  dialogLoading.value = true
  dialogError.value = ''
  
  try {
    const detail = await loadFullApprovalDetail()
    
    // 先结束加载状态，让子组件渲染
    dialogLoading.value = false
    
    // 等待子组件渲染完成
    await nextTick()
    await nextTick() // 双重等待确保子组件完全挂载
    
    // 加载任务数据
    if (detail?.todoTask && operationButtonRef.value?.loadTodoTask) {
      operationButtonRef.value.loadTodoTask(detail.todoTask)
    }
  } catch (error) {
    dialogError.value = error.message || '加载审批详情失败'
    dialogLoading.value = false
  } finally {
    approveLoading.value = false
  }
}

// 处理拒绝操作
const handleReject = async () => {
  rejectLoading.value = true
  dialogTitle.value = '审批拒绝'
  dialogType.value = 'reject'
  dialogVisible.value = true
  dialogLoading.value = true
  dialogError.value = ''
  
  try {
    const detail = await loadFullApprovalDetail()
    
    // 先结束加载状态，让子组件渲染
    dialogLoading.value = false
    
    // 等待子组件渲染完成
    await nextTick()
    await nextTick() // 双重等待确保子组件完全挂载
    
    // 加载任务数据
    if (detail?.todoTask && operationButtonRef.value?.loadTodoTask) {
      operationButtonRef.value.loadTodoTask(detail.todoTask)
    }
  } catch (error) {
    dialogError.value = error.message || '加载审批详情失败'
    dialogLoading.value = false
  } finally {
    rejectLoading.value = false
  }
}

// 处理终止督办操作
const handleTerminate = async () => {
  try {
    // 二次确认
    await ElMessageBox.confirm(
      '确定要终止当前督办吗？终止后将无法恢复。',
      '终止督办确认',
      {
        confirmButtonText: '确定终止',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    terminateLoading.value = true

    // 获取 orderId
    let orderId: number | null = null
    
    // 优先从 businessKey 获取
    if (processInstance.value?.businessKey) {
      try {
        orderId = parseInt(processInstance.value.businessKey, 10)
      } catch (e) {
        console.warn('解析 businessKey 失败:', e)
      }
    }

    if (!orderId) {
      ElMessage.error('无法获取督办单ID，请刷新页面重试')
      return
    }

    // 获取当前用户ID
    const currentUserId = userStore.getUser.id

    // 调用终止流程发起接口
    const variables = {
      orderId: orderId,
      applyUserId: currentUserId
    }

    await SupervisionProcessApi.createProcessInstanceByKey({
      processDefinitionKey: 'supervision_terminate',
      businessKey: String(orderId),
      variables: variables
    })

    ElMessage.success('终止督办流程已发起，请等待审批')
    
    // 刷新按钮状态
    handleSuccess()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('终止督办失败:', error)
      ElMessage.error('终止督办失败，请重试')
    }
  } finally {
    terminateLoading.value = false
  }
}

// 记录督办进度
const logSupervisionProgress = async (content: string) => {
  try {
    const processInstanceId = getProcessInstanceId(props.task) || processInstance.value?.id
    if (!processInstanceId) {
      console.warn('无法获取流程实例ID，跳过进度记录')
      return
    }

    await OrderApi.insertSupervisionOrderTaskNew({
      processInstanceId: processInstanceId,
      deptDetail: content
    })
  } catch (error) {
    console.warn('记录督办进度失败:', error)
    // 静默失败，不影响主流程
  }
}

// 打开代管弹窗
const openDelegatePopover = async () => {
  try {
    // 确保有运行中的任务
    if (!runningTask.value) {
      ElMessage.error('任务信息未加载，请刷新页面重试')
      return
    }

    // 加载用户列表
    if (userOptions.value.length === 0) {
      userOptions.value = await UserApi.getSimpleUserList()
    }

    // 显示弹窗
    popOverVisible.value.delegate = true
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败，请重试')
  }
}

// 关闭代管弹窗
const closeDelegatePopover = () => {
  popOverVisible.value.delegate = false
  if (delegateFormRef.value) {
    delegateFormRef.value.resetFields()
  }
  delegateForm.value.delegateUserId = undefined
  delegateForm.value.reason = ''
}

// 确认代管
const handleDelegateConfirm = async () => {
  try {
    // 表单验证
    if (!delegateFormRef.value) return
    await delegateFormRef.value.validate()

    delegateLoading.value = true

    // 调用委派接口
    const data = {
      id: runningTask.value.id,
      reason: delegateForm.value.reason || '代管任务',
      delegateUserId: delegateForm.value.delegateUserId
    }

    await TaskApi.delegateTask(data)
    
    // 记录代管进度
    const operatorName = userStore.getUser.nickname || userStore.getUser.id
    const delegateUser = userOptions.value.find(user => user.id === delegateForm.value.delegateUserId)
    const delegateName = delegateUser?.nickname || delegateForm.value.delegateUserId
    const reason = delegateForm.value.reason || '无'
    const progressContent = `【代管】${operatorName} 将任务代管给 ${delegateName}。理由：${reason}`
    
    await logSupervisionProgress(progressContent)
    
    ElMessage.success('代管成功')
    
    // 关闭弹窗并刷新状态
    closeDelegatePopover()
    handleSuccess()

  } catch (error) {
    console.error('代管失败:', error)
    ElMessage.error('代管失败，请重试')
  } finally {
    delegateLoading.value = false
  }
}

// 处理取消代管操作
const handleCancelDelegate = async () => {
  try {
    // 获取任务ID（优先使用 delegatedTaskIdRef）
    const taskId = delegatedTaskIdRef.value || runningTask.value?.id
    if (!taskId) {
      ElMessage.error('任务信息未加载，请刷新页面重试')
      return
    }

    // 二次确认
    await ElMessageBox.confirm(
      '确定要取消代管吗？任务将回到您的待办列表。',
      '取消代管确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    cancelDelegateLoading.value = true

    // 使用专用的撤回代管接口
    const data = {
      taskId: taskId,
      reason: '取消代管'
    }

    await SupervisionTaskOperationApi.revokeTaskDelegation(data)
    
    // 记录取消代管进度
    const operatorName = userStore.getUser.nickname || userStore.getUser.id
    const reason = '取消代管'
    const progressContent = `【取消代管】${operatorName} 撤回代管，任务回到原办理人。理由：${reason}`
    
    await logSupervisionProgress(progressContent)
    
    ElMessage.success('取消代管成功')
    
    // 刷新按钮状态
    handleSuccess()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消代管失败:', error)
      // 提取错误信息
      const errorMsg = error?.response?.data?.msg || error?.data?.msg || error?.message || '取消代管失败，请重试'
      ElMessage.error(errorMsg)
    }
  } finally {
    cancelDelegateLoading.value = false
  }
}

// 处理中止操作
const handleSuspend = () => {
  suspendDialogVisible.value = true
}

// 重置中止弹窗
const resetSuspendDialog = () => {
  suspendDialogVisible.value = false
}

// 确认中止
const confirmSuspend = async () => {
  try {
    suspendLoading.value = true

    // 获取督办单ID
    const orderId = props.task.id || props.task.supervisionPageVOData?.id
    if (!orderId) {
      ElMessage.error('无法获取督办单ID')
      return
    }

    // 调用中止接口
    await OrderApi.suspendOrder(orderId)
    
    ElMessage.success('已中止督办，只有主任/副主任/管理员可见')
    
    // 关闭弹窗并刷新状态
    resetSuspendDialog()
    handleSuccess()

  } catch (error) {
    console.error('中止督办失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.data?.msg || error?.message || '中止督办失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    suspendLoading.value = false
  }
}

// 处理恢复操作
const handleResume = () => {
  resumeDialogVisible.value = true
}

// 重置恢复弹窗
const resetResumeDialog = () => {
  resumeDialogVisible.value = false
}

// 确认恢复
const confirmResume = async () => {
  try {
    resumeLoading.value = true

    // 获取督办单ID
    const orderId = props.task.id
    if (!orderId) {
      ElMessage.error('无法获取督办单信息')
      return
    }

    // 调用恢复接口
    await OrderApi.resumeOrder(orderId)
    
    ElMessage.success('已恢复督办，相关人员现在可以看到此督办')
    
    // 关闭弹窗并刷新状态
    resetResumeDialog()
    handleSuccess()

  } catch (error) {
    console.error('恢复督办失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.data?.msg || error?.message || '恢复督办失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    resumeLoading.value = false
  }
}

// 重置弹窗
const resetDialog = () => {
  dialogVisible.value = false
  dialogLoading.value = false
  dialogError.value = ''
  dialogType.value = null
  processInstance.value = null
  processDefinition.value = null
}

// 处理成功回调
const handleSuccess = () => {
  resetDialog()
  emit('success')
  // 重置并立即刷新本组件的按钮显示状态，避免旧的 runningTask 缓存导致按钮不变化
  hasLoadedDetail.value = false
  runningTask.value = null
  processInstance.value = null // 重置流程实例数据
  terminateRunningRef.value = false // 重置终止流程状态
  // 重置代管相关状态
  delegateLoading.value = false
  cancelDelegateLoading.value = false
  delegatedTaskIdRef.value = null
  nextTick(() => {
    loadApprovalDetailForDisplay()
  })
}

// IntersectionObserver 回调
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hasLoadedDetail.value) {
      loadApprovalDetailForDisplay()
    }
  })
}

// 组件挂载时设置观察器并立即加载
onMounted(async () => {
  await nextTick()
  
  // 立即加载一次，确保首屏可见项无需等待 observer
  loadApprovalDetailForDisplay()
  
  if (containerRef.value) {
    observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1
    })
    observer.observe(containerRef.value)
  }
})

// 组件卸载时清理观察器
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.list-operation-button {
  margin-top: 8px;
}

/* 代管弹层样式 */
:deep(.supervision-delegate-popper) {
  z-index: 3000 !important;
}
</style>

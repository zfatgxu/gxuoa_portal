<template>
  <!-- 弹窗模式：直接渲染表单面板 -->
  <div v-if="props.useDialog && props.dialogType" class="dialog-form-panel" @click.stop>
    <!-- 通过表单 -->
    <div v-if="props.dialogType === 'approve'" class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
      <el-form
        label-position="top"
        class="mb-auto"
        ref="approveFormRef"
        :model="approveReasonForm"
        :rules="approveReasonRule"
        label-width="100px"
      >
        <el-card v-if="runningTask?.formId > 0" class="mb-15px !-mt-10px">
          <template #header>
            <span class="el-icon-picture-outline"> 填写表单【{{ runningTask?.formName }}】 </span>
          </template>
          <form-create
            v-model="approveForm.value"
            v-model:api="approveFormFApi"
            :option="approveForm.option"
            :rule="approveForm.rule"
          />
        </el-card>
        <el-form-item :label="`${nodeTypeName}意见`" prop="reason">
          <el-input
            v-model="approveReasonForm.reason"
            :placeholder="`请输入${nodeTypeName}意见`"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item
          label="下一个节点的审批人"
          prop="nextAssignees"
          v-if="nextAssigneesActivityNode.length > 0"
        >
          <div class="ml-10px -mt-15px -mb-35px">
            <ProcessInstanceTimeline
              :activity-nodes="nextAssigneesActivityNode"
              :show-status-icon="false"
              @select-user-confirm="selectNextAssigneesConfirm"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-if="runningTask?.signEnable"
          label="签名"
          prop="signPicUrl"
          ref="approveSignFormRef"
        >
          <el-button @click="signRef.open()">点击签名</el-button>
          <el-image
            class="w-90px h-40px ml-5px"
            v-if="approveReasonForm.signPicUrl"
            :src="approveReasonForm.signPicUrl"
            :preview-src-list="[approveReasonForm.signPicUrl]"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="formLoading"
            type="success"
            @click="handleAudit(true, approveFormRef)"
          >
            {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
          </el-button>
          <el-button @click="handleDialogCancel('approve')"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 拒绝表单 -->
    <div v-if="props.dialogType === 'reject'" class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
      <el-form
        label-position="top"
        class="mb-auto"
        ref="rejectFormRef"
        :model="rejectReasonForm"
        :rules="rejectReasonRule"
        label-width="100px"
      >
        <el-form-item v-if="showRejectTarget" label="驳回目标" prop="rejectTarget">
          <el-radio-group v-model="rejectReasonForm.rejectTarget">
            <el-radio label="implement_plan">仅驳回修改的请求（回 implement_plan）</el-radio>
            <el-radio label="upload_plan">驳回整套工作计划（回 upload_plan）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="reason">
          <el-input
            v-model="rejectReasonForm.reason"
            placeholder="请输入审批意见"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="formLoading"
            type="danger"
            @click="handleAudit(false, rejectFormRef)"
          >
            {{ getButtonDisplayName(OperationButtonType.REJECT) }}
          </el-button>
          <el-button @click="handleDialogCancel('reject')"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 批示意见表单 -->
    <div v-if="props.dialogType === 'comment'" class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
      <el-form
        label-position="top"
        class="mb-auto"
        ref="commentFormRef"
        :model="commentForm"
        :rules="commentFormRule"
        label-width="100px"
      >
        <el-form-item label="批示意见" prop="commentContent">
          <el-input
            v-model="commentForm.commentContent"
            placeholder="请输入批示意见"
            type="textarea"
            :rows="6"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="formLoading"
            type="primary"
            @click="handleComment"
          >
            提交批示
          </el-button>
          <el-button @click="handleDialogCancel('comment')"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
  
  <!-- 详情页模式：保持原有 Popover -->
  <div
    v-else
    class="h-50px bottom-10 text-14px flex items-center color-#32373c dark:color-#fff font-bold btn-container"
  >
    <!-- 【通过】按钮 -->
    <el-popover
      v-model:visible="popOverVisible.approve"
      placement="top-end"
      :width="420"
      trigger="manual"
      :virtual-triggering="!!approveVirtualRef"
      :virtual-ref="approveVirtualRef"
      :teleported="!!approveVirtualRef"
      :popper-options="approveVirtualRef ? { strategy: 'fixed' } : undefined"
      v-if="runningTask && isHandleTaskStatus() && (isShowButton(OperationButtonType.APPROVE) || !!approveVirtualRef)"
    >
      <template #reference>
        <el-button plain type="success" @click="openPopover('approve')" v-if="!approveVirtualRef">
          <Icon icon="ep:select" />&nbsp; {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
        </el-button>
      </template>
      <!-- 审批表单 -->
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="approveFormRef"
          :model="approveReasonForm"
          :rules="approveReasonRule"
          label-width="100px"
        >
          <el-card v-if="runningTask?.formId > 0" class="mb-15px !-mt-10px">
            <template #header>
              <span class="el-icon-picture-outline"> 填写表单【{{ runningTask?.formName }}】 </span>
            </template>
            <form-create
              v-model="approveForm.value"
              v-model:api="approveFormFApi"
              :option="approveForm.option"
              :rule="approveForm.rule"
            />
          </el-card>
          <el-form-item :label="`${nodeTypeName}意见`" prop="reason">
            <el-input
              v-model="approveReasonForm.reason"
              :placeholder="`请输入${nodeTypeName}意见`"
              type="textarea"
              :rows="4"
            />
          </el-form-item>
          <el-form-item
            label="下一个节点的审批人"
            prop="nextAssignees"
            v-if="nextAssigneesActivityNode.length > 0"
          >
            <div class="ml-10px -mt-15px -mb-35px">
              <ProcessInstanceTimeline
                :activity-nodes="nextAssigneesActivityNode"
                :show-status-icon="false"
                @select-user-confirm="selectNextAssigneesConfirm"
              />
            </div>
          </el-form-item>
          <el-form-item
            v-if="runningTask.signEnable"
            label="签名"
            prop="signPicUrl"
            ref="approveSignFormRef"
          >
            <el-button @click="signRef.open()">点击签名</el-button>
            <el-image
              class="w-90px h-40px ml-5px"
              v-if="approveReasonForm.signPicUrl"
              :src="approveReasonForm.signPicUrl"
              :preview-src-list="[approveReasonForm.signPicUrl]"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :disabled="formLoading"
              type="success"
              @click="handleAudit(true, approveFormRef)"
            >
              {{ getButtonDisplayName(OperationButtonType.APPROVE) }}
            </el-button>
            <el-button @click="closePopover('approve', approveFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>
    
    <!-- 【批示意见】按钮 -->
    <el-popover
      v-model:visible="popOverVisible.comment"
      placement="top-end"
      :width="420"
      trigger="manual"
      :virtual-triggering="!!commentVirtualRef"
      :virtual-ref="commentVirtualRef"
      :teleported="!!commentVirtualRef"
      :popper-options="commentVirtualRef ? { strategy: 'fixed' } : undefined"
      v-if="runningTask && isHandleTaskStatus()"
    >
      <template #reference>
        <el-button plain type="primary" @click="openPopover('comment')" v-if="!commentVirtualRef">
          <Icon icon="ep:edit" />&nbsp; 批示意见
        </el-button>
      </template>
      <!-- 批示意见表单 -->
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="commentFormRef"
          :model="commentForm"
          :rules="commentFormRule"
          label-width="100px"
        >
          <el-form-item label="批示意见" prop="commentContent">
            <el-input
              v-model="commentForm.commentContent"
              placeholder="请输入批示意见"
              type="textarea"
              :rows="6"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :disabled="formLoading"
              type="primary"
              @click="handleComment"
            >
              提交批示
            </el-button>
            <el-button @click="closePopover('comment', commentFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>

    <!-- 【拒绝】按钮 -->
    <el-popover
      v-model:visible="popOverVisible.reject"
      placement="top-end"
      :width="420"
      trigger="manual"
      :virtual-triggering="!!rejectVirtualRef"
      :virtual-ref="rejectVirtualRef"
      :teleported="!!rejectVirtualRef"
      :popper-options="rejectVirtualRef ? { strategy: 'fixed' } : undefined"
      v-if="runningTask && isHandleTaskStatus() && (isShowButton(OperationButtonType.REJECT) || !!rejectVirtualRef)"
    >
      <template #reference>
        <el-button class="mr-20px" plain type="danger" @click="openPopover('reject')" v-if="!rejectVirtualRef">
          <Icon icon="ep:close" />&nbsp; {{ getButtonDisplayName(OperationButtonType.REJECT) }}
        </el-button>
      </template>
      <!-- 审批表单 -->
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="rejectFormRef"
          :model="rejectReasonForm"
          :rules="rejectReasonRule"
          label-width="100px"
        >
          <el-form-item v-if="showRejectTarget" label="驳回目标" prop="rejectTarget">
            <el-radio-group v-model="rejectReasonForm.rejectTarget">
              <el-radio label="implement_plan">仅驳回修改的请求（回 implement_plan）</el-radio>
              <el-radio label="upload_plan">驳回整套工作计划（回 upload_plan）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="rejectReasonForm.reason"
              placeholder="请输入审批意见"
              type="textarea"
              :rows="4"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :disabled="formLoading"
              type="danger"
              @click="handleAudit(false, rejectFormRef)"
            >
              {{ getButtonDisplayName(OperationButtonType.REJECT) }}
            </el-button>
            <el-button @click="closePopover('reject', rejectFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>
  </div>
  <SignDialog ref="signRef" @success="handleSignFinish" />

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
      确认恢复此督办吗？恢复后，相关人员将重新能够看到此督办并可以提交进度。
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
import { ref, reactive, computed, nextTick, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStoreWithOut } from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '@/hooks/web/useMessage'
import * as TaskApi from '@/api/bpm/task'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as UserApi from '@/api/system/user'
import { SupervisionIndexApi, SupervisionProcessApi, SupervisionTaskOperationApi, OrderApi, PlanEntryApi } from '@/api/supervision/index'
import { checkRole } from '@/utils/permission'
import {
  NodeType,
  OPERATION_BUTTON_NAME,
  OperationButtonType,
  CandidateStrategy
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { BpmModelFormType, BpmProcessInstanceStatus } from '@/utils/constants'
import type { FormInstance, FormRules } from 'element-plus'
import SignDialog from '@/views/bpm/processInstance/detail/SignDialog.vue'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import { isEmpty } from '@/utils/is'
import * as PetitionApi from '@/api/petition'

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

defineOptions({ name: 'SupervisionOperationButton' })

const router = useRouter() // 路由
const route = useRoute()
const message = useMessage() // 消息弹窗
const userStore = useUserStoreWithOut() // 用户store
const emit = defineEmits(['success', 'dialog-cancel']) // 定义事件：操作成功、弹窗取消回调

const props = defineProps<{
  processInstance: any
  processDefinition: any
  userOptions: UserApi.UserVO[]
  normalForm: any
  normalFormApi: any
  writableFields: string[]
  leadDeptLeaderIds: number[]
  supervisionDetailRef?: any
  // 弹窗模式（用于列表页）
  useDialog?: boolean
  dialogType?: 'approve' | 'reject' | null
  // 是否有进行中的终止流程（来自审批详情顶层字段）
  terminateRunning?: boolean
  // 被代管中的任务ID（用于原办理人取消代管）
  delegatedTaskId?: string | null
}>()

const formLoading = ref(false) // 表单加载中
const popOverVisible = ref({
  approve: false,
  reject: false,
  comment: false,
  transfer: false,
  delegate: false,
  addSign: false,
  return: false,
  copy: false,
  cancel: false,
  deleteSign: false
}) // 气泡卡是否展示

// 虚拟锚点支持
const approveVirtualRef = ref<HTMLElement | null>(null)
const rejectVirtualRef = ref<HTMLElement | null>(null)
const returnList = ref([] as any) // 退回节点

// ========== 审批信息 ==========
const runningTask = ref<any>() // 运行中的任务
const approveForm = ref<any>({}) // 审批通过时，额外的补充信息
const approveFormFApi = ref<any>({}) // approveForms 的 fAPi
const nodeTypeName = ref('审批') // 节点类型名称

// ========== 中止/恢复督办 ==========
const localSupervisionStatus = ref<number | null>(null) // 本地覆盖状态，用于即时UI更新

// 审批通过意见表单
const reasonRequire = ref()
const approveFormRef = ref<FormInstance>()
const signRef = ref()
const approveSignFormRef = ref()
const nextAssigneesActivityNode = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 下一个审批节点信息
const approveReasonForm = reactive({
  reason: '',
  signPicUrl: '',
  nextAssignees: {}
})
const approveReasonRule = computed(() => {
  return {
    reason: [
      { required: reasonRequire.value, message: nodeTypeName.value + '意见不能为空', trigger: 'blur' }
    ],
    signPicUrl: [{ required: true, message: '签名不能为空', trigger: 'change' }],
    nextAssignees: [{ required: true, message: '审批人不能为空', trigger: 'blur' }]
  }
})

// 拒绝表单
const rejectFormRef = ref<FormInstance>()
const rejectReasonForm = reactive({
  reason: '',
  rejectTarget: null as 'upload_plan' | 'implement_plan' | null
})
const rejectReasonRule = computed(() => {
  return {
    reason: [{ required: reasonRequire.value, message: '审批意见不能为空', trigger: 'blur' }],
    // 仅当展示“驳回目标”时才必填
    rejectTarget: [{ required: showRejectTarget.value, message: '请选择驳回目标', trigger: 'change' }]
  }
})

// 判断当前是否为三节点之一（supervisor_review、de_director_check、director_check）
// 这三个节点在 upload_plan 变更场景下需要统一支持驳回目标选择
const isTriadNode = computed(() => {
  const triadNodes = ['supervisor_review', 'de_director_check', 'director_check']
  return triadNodes.includes(runningTask.value?.taskDefinitionKey)
})

// 兼容旧代码：保留 isSupervisorReviewNode 别名
const isSupervisorReviewNode = isTriadNode

// 仅在已上传整套计划（template 版本记录存在）时，展示“驳回目标”
const showRejectTarget = ref(false)
const hasUploadedTemplatePlan = ref(false)

// 通过流程实例ID检测是否存在 template 版本的整套计划
const refreshTemplatePlanFlag = async () => {
  try {
    const pid = props.processInstance?.id
    if (!pid) {
      hasUploadedTemplatePlan.value = false
      return
    }
    const list = await PlanEntryApi.listByVersionType(pid, 'template')
    hasUploadedTemplatePlan.value = Array.isArray(list) && list.length > 0
  } catch (e) {
    hasUploadedTemplatePlan.value = false
  }
}

const updateShowRejectTarget = () => {
  showRejectTarget.value = isSupervisorReviewNode.value && hasUploadedTemplatePlan.value
}

// 监听流程实例变化与节点类型变化，更新展示逻辑
watch(() => props.processInstance?.id, async () => {
  await refreshTemplatePlanFlag()
  updateShowRejectTarget()
})
watch(isSupervisorReviewNode, () => {
  updateShowRejectTarget()
})

// 委派表单
const delegateFormRef = ref<FormInstance>()
const delegateBtnRef = ref<HTMLElement>() // 代管按钮的 DOM 引用
const delegateForm = reactive({
  delegateUserId: undefined,
  reason: ''
})
const delegateFormRule = reactive<FormRules<typeof delegateForm>>({
  delegateUserId: [{ required: true, message: '接收人不能为空', trigger: 'change' }],
  reason: [{ required: false, message: '审批意见不能为空', trigger: 'blur' }] // 代管时理由改为可选
})

// 批示意见表单
const commentFormRef = ref<FormInstance>()
const commentVirtualRef = ref<HTMLElement | null>(null)
const commentForm = reactive({
  commentContent: ''
})
const commentFormRule = reactive<FormRules<typeof commentForm>>({
  commentContent: [
    { required: true, message: '批示意见不能为空', trigger: 'blur' },
    { min: 1, message: '批示意见至少1个字符', trigger: 'blur' },
    { max: 1000, message: '批示意见最多1000个字符', trigger: 'blur' }
  ]
})

// ========== 代管状态判断 ==========
/** 判断当前任务是否处于代管状态 */
const isDelegated = computed(() => {
  if (!runningTask.value) return false
  
  // 方法1：检查是否有 ownerUser 且与 assigneeUser 不同
  const ownerUser = runningTask.value.ownerUser
  const assigneeUser = runningTask.value.assigneeUser
  
  if (ownerUser && assigneeUser && ownerUser.id !== assigneeUser.id) {
    return true
  }
  
  // 方法2：检查 delegationState 字段（如果后端提供）
  if (runningTask.value.delegationState === 'PENDING') {
    return true
  }
  
  return false
})

/** 监听 approveFormFApis，实现它对应的 form-create 初始化后，隐藏掉对应的表单提交按钮 */
watch(
  () => approveFormFApi.value,
  (val) => {
    val?.btn?.show(false)
    val?.resetBtn?.show(false)
  },
  {
    deep: true
  }
)

/** 弹出气泡卡 */
const openPopover = async (type: string) => {
  // 清空虚拟锚点，确保使用底部按钮作为锚点
  if (type === 'approve') {
    approveVirtualRef.value = null
    // 校验流程表单
    const valid = await validateNormalForm()
    if (!valid) {
      message.warning('表单校验不通过，请先完善表单!!')
      return
    }
    initNextAssigneesFormField()
  }
  if (type === 'reject') {
    rejectVirtualRef.value = null
    // 刷新整套计划存在性标志，确保"驳回目标"显示逻辑实时
    await refreshTemplatePlanFlag()
    updateShowRejectTarget()
  }
  if (type === 'return') {
    // 获取退回节点
    returnList.value = await TaskApi.getTaskListByReturn(runningTask.value?.id)
    if (returnList.value.length === 0) {
      message.warning('当前没有可退回的节点')
      return
    }
  }
  Object.keys(popOverVisible.value).forEach((item) => {
    popOverVisible.value[item] = item === type
  })
  // await nextTick()
  // formRef.value.resetFields()
}

/** 关闭气泡卡 */
const closePopover = (type: string, formRef: FormInstance | undefined) => {
  if (formRef) {
    formRef.resetFields()
  }
  popOverVisible.value[type] = false
  nextAssigneesActivityNode.value = []
  
  // 清理虚拟锚点
  if (type === 'approve') {
    approveVirtualRef.value = null
  } else if (type === 'reject') {
    rejectVirtualRef.value = null
    // 清理驳回目标选择
    rejectReasonForm.rejectTarget = null
  }
}

/** 弹窗模式取消 */
const handleDialogCancel = (type: string) => {
  const formRef = type === 'approve' ? approveFormRef.value : rejectFormRef.value
  if (formRef) {
    formRef.resetFields()
  }
  nextAssigneesActivityNode.value = []
  
  // 清理驳回目标选择
  if (type === 'reject') {
    rejectReasonForm.rejectTarget = null
  }
  
  emit('dialog-cancel')
}

/** 流程通过时，根据表单变量查询新的流程节点，判断下一个节点类型是否为自选审批人 */
const initNextAssigneesFormField = async () => {
  // 获取修改的流程变量, 暂时只支持流程表单
  const variables = getUpdatedProcessInstanceVariables()
  const data = await ProcessInstanceApi.getNextApprovalNodes({
    processInstanceId: props.processInstance.id,
    taskId: runningTask.value?.id,
    processVariablesStr: JSON.stringify(variables)
  })
  if (data && data.length > 0) {
    data.forEach((node: any) => {
      if (
        // 情况一：当前节点没有审批人，并且是发起人自选
        (isEmpty(node.tasks) &&
          isEmpty(node.candidateUsers) &&
          CandidateStrategy.START_USER_SELECT === node.candidateStrategy) ||
        // 情况二：当前节点是审批人自选
        CandidateStrategy.APPROVE_USER_SELECT === node.candidateStrategy
      ) {
        nextAssigneesActivityNode.value.push(node)
      }
    })
  }
}

/** 选择下一个节点的审批人 */
const selectNextAssigneesConfirm = (id: string, userList: any[]) => {
  approveReasonForm.nextAssignees[id] = userList?.map((item: any) => item.id)
}
/** 审批通过时，校验每个自选审批人的节点是否都已配置了审批人 */
const validateNextAssignees = () => {
  if (Object.keys(nextAssigneesActivityNode.value).length === 0) {
    return true
  }
  // 如果需要自选审批人，则校验每个节点是否都已配置审批人
  for (const item of nextAssigneesActivityNode.value) {
    if (isEmpty(approveReasonForm.nextAssignees[item.id])) {
      message.warning('下一个节点的审批人不能为空!')
      return false
    }
  }
  return true
}

/** 处理审批通过和不通过的操作 */
const handleAudit = async (pass: boolean, formRef: FormInstance | undefined) => {
  formLoading.value = true
  try {
    // 检查 runningTask 是否存在
    if (!runningTask.value) {
      message.error('任务信息未加载，请稍后重试')
      return
    }
    
    // 校验表单
    if (!formRef) return
    await formRef.validate()
    
    // 获取当前用户信息（统一声明，避免重复）
    const userStore = useUserStoreWithOut()
    const currentUserId = userStore.getUser.id
    
    // 获取当前节点key
    const currentTaskKey = runningTask.value?.taskDefinitionKey
    
    // 终止流程督查办主任审核节点：跳过流程表单校验
    // 说明：不强依赖 processDefinitionKey，以免父组件传入的是主流程实例对象
    const isTerminateDirectorNode =
      currentTaskKey === 'supervision_terminate_director_approve' ||
      (runningTask.value?.name && runningTask.value.name.includes('督查办主任审核'))
    
    if (!isTerminateDirectorNode) {
      // 校验流程表单必填字段
      const valid = await validateNormalForm()
      if (!valid) {
        message.warning('表单校验不通过，请先完善表单!!')
        return
      }
    }

    if (pass) {
      const nextAssigneesValid = validateNextAssignees()
      if (!nextAssigneesValid) return      
      // 审批通过数据
      // 获取当前用户信息
      const userStore = useUserStoreWithOut()
      const currentUser = userStore.getUser
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      // 构建审批意见
      let finalReason = ''
      if (approveReasonForm.reason && approveReasonForm.reason.trim()) {
        // 有填写意见的情况：同意，意见内容，审批人名字和时间在下一行右侧
        finalReason = `同意，${approveReasonForm.reason.trim()}\n                                                    ${currentUser.nickname} ${currentTime}`
      } else {
        // 没有填写意见的情况：同意，审批人名字和时间在下一行右侧
        finalReason = `同意\n                                                    ${currentUser.nickname} ${currentTime}`
      }

      console.log("idddd" + runningTask.value?.id)
      
      const data = {
        id: runningTask.value?.id,
        reason: finalReason,
        // variables, // 审批通过, 把修改的字段值赋于流程实例变量
        nextAssignees: approveReasonForm.nextAssignees // 下个自选节点选择的审批人信息
      } as any
      
      console.log('[submit] final payload =', data)
      // 签名
      if (runningTask.value.signEnable) {
        data.signPicUrl = approveReasonForm.signPicUrl
      }
      // 多表单处理，并且有额外的 approveForm 表单，需要校验 + 拼接到 data 表单里提交
      // TODO 芋艿 任务有多表单这里要如何处理，会和可编辑的字段冲突
      const formCreateApi = approveFormFApi.value
      if (Object.keys(formCreateApi)?.length > 0) {
        await formCreateApi.validate()
        // @ts-ignore
        data.variables = approveForm.value.value
      }
      if (currentTaskKey === 'zr_review') {
        console.log(1)
        await PetitionApi.updatePetition({
          id: route.query.id,
          status: 1
        })
      }
      await TaskApi.approveTask(data)
      popOverVisible.value.approve = false
      nextAssigneesActivityNode.value = []
      message.success('审批通过')
    } else {
      // 移除了审批拒绝时清理待处理进度更新数据的逻辑，因为现在进度更新直接提交

      // 审批不通过数据
      const rejectVariables = {
        auditResult: 'reject',
        auditComment: rejectReasonForm.reason?.trim() || ''
      }
      
      // 添加当前审批人ID，用于审计记录
      rejectVariables.auditUserId = currentUserId
      
      const data = {
        id: runningTask.value?.id,
        reason: rejectReasonForm.reason || '拒绝', // 如果没有填写意见，默认为"拒绝"
        variables: rejectVariables // 添加监听器所需的变量
      }
      console.log('[submit] final payload =', data)
      await TaskApi.rejectTask(data)
      popOverVisible.value.reject = false
      message.error('审批不通过')
    }
    // 重置表单
    formRef.resetFields()
    // 加载最新数据
    window.location.reload()
  } finally {
    formLoading.value = false
  }
}


/** 任务是否为处理中状态 */
const isHandleTaskStatus = () => {
  let canHandle = false
  if (TaskApi.TaskStatusEnum.RUNNING === runningTask.value?.status) {
    canHandle = true
  }
  return canHandle
}

// 计算属性：是否有变更预览
const hasChangePreview = computed(() => {
  try {
    return props.supervisionDetailRef?.hasChangePreview || false
  } catch {
    return false
  }
})

/** 是否显示按钮 */
const isShowButton = (btnType: OperationButtonType): boolean => {
  let isShow = true
  if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
    isShow = runningTask.value.buttonsSetting[btnType].enable
  }

  // 获取当前节点key
  const currentTaskKey = runningTask.value?.taskDefinitionKey
  
  // 督办系统特殊逻辑：节点+身份规则控制按钮可见性
  if (btnType === OperationButtonType.REJECT) {
    // select_leaddept 和 implement_plan 节点不显示拒绝按钮
    if (currentTaskKey === 'select_leaddept' || currentTaskKey === 'implement_plan') {
      isShow = false
    }
  }
  
  // implement_plan 节点的通过按钮：仅督办人可见
  if (btnType === OperationButtonType.APPROVE && currentTaskKey === 'implement_plan') {
    const userStore = useUserStoreWithOut()
    const currentUserId = userStore.getUser.id
    
    // 获取督办人列表
    const orderData = props.supervisionDetailRef?.getOrderDetailData?.()
    const supervisors = orderData?.supervisors || []
    
    // 只有当前用户在督办人列表中才显示通过按钮
    isShow = supervisors.some(supervisor => supervisor.id === Number(currentUserId))
  }

  // 终止流程督查办主任审核节点：显示通过/拒绝按钮
  // 说明：不强依赖 processDefinitionKey，以免父组件传入的是主流程实例对象
  if (
    currentTaskKey === 'supervision_terminate_director_approve' ||
    (runningTask.value?.name && runningTask.value.name.includes('督查办主任审核'))
  ) {
    // 对于终止流程的督查办主任审核节点，显示通过/拒绝按钮
    if (btnType === OperationButtonType.APPROVE || btnType === OperationButtonType.REJECT) {
      isShow = true
    }
  }

  // 新增：当有变更预览时，隐藏底部的通过/拒绝按钮
  if ((btnType === OperationButtonType.APPROVE || btnType === OperationButtonType.REJECT) && hasChangePreview.value) {
    isShow = false
  }

  return isShow
}

/** 获取按钮的显示名称 */
const getButtonDisplayName = (btnType: OperationButtonType) => {
  let displayName = OPERATION_BUTTON_NAME.get(btnType)
  if (runningTask.value?.buttonsSetting && runningTask.value?.buttonsSetting[btnType]) {
    displayName = runningTask.value.buttonsSetting[btnType].displayName
  }

  // 督办系统特殊逻辑：根据taskDefinitionKey修改按钮名称
  if (btnType === OperationButtonType.APPROVE) {
    const nodeType = getSupervisionNodeType()
    if (nodeType === 'first_approval') {
      displayName = '同意督办'
    } else if (nodeType === 'reapproval') {
      displayName = '同意办结'
    }
  }

  return displayName
}

const loadTodoTask = (task: any) => {
  approveForm.value = {}
  runningTask.value = task
  approveFormFApi.value = {}
  reasonRequire.value = task?.reasonRequire ?? false
  nodeTypeName.value = task?.nodeType === NodeType.TRANSACTOR_NODE ? '办理' : '审批'
  // 处理 approve 表单.
  if (task && task.formId && task.formConf) {
    const tempApproveForm = {}
    setConfAndFields2(tempApproveForm, task.formConf, task.formFields, task.formVariables)
    approveForm.value = tempApproveForm
  } else {
    approveForm.value = {} // 占位，避免为空
  }
}

/** 校验流程表单 */
const validateNormalForm = async () => {
  if (props.processDefinition?.formType === BpmModelFormType.NORMAL) {
    let valid = true
    try {
      await props.normalFormApi?.validate()
    } catch {
      valid = false
    }
    return valid
  }
  return true
}

/** 获取更新后的流程实例变量 */
const getUpdatedProcessInstanceVariables = (): Record<string, any> => {
  const variables: Record<string, any> = {}
  
  // 设置临时变更变量
  if (runningTask.value?.taskDefinitionKey) {
    // 【需求变更】de_director_check 节点无编辑权限，跳过临时变更检测
    if (runningTask.value.taskDefinitionKey !== 'de_director_check') {
      setTempChangeVariables(variables, runningTask.value.taskDefinitionKey)
    } else {
      console.log('🚫 [de_director_check] 节点无编辑权限，跳过临时变更变量设置')
    }
  }
  
  // 设置部门变更变量（统一识别部门类变更）
  // 【需求变更】de_director_check 节点无编辑权限，跳过部门变更检测
  if (runningTask.value?.taskDefinitionKey !== 'de_director_check') {
    setDeptChangeVariablesIfAny(variables)
  } else {
    console.log('🚫 [de_director_check] 节点无编辑权限，跳过部门变更检测')
  }
  
  return variables
}

/**
 * 根据当前节点配置设置临时变更变量
 */
const setTempChangeVariables = (variables: Record<string, any>, currentNodeKey: string): Record<string, any> => {
  console.log('[vars] setTempChangeVariables called with currentNodeKey =', currentNodeKey)
    // 获取当前节点的配置
  const nodeConfig = getNodeTempConfig(currentNodeKey)
  if (!nodeConfig) {
    return variables
  }

  try {
    // 检查 supervisionDetailRef 是否存在
    console.log('[vars] has supervisionDetailRef =', !!props.supervisionDetailRef)
    if (!props.supervisionDetailRef) {
      console.warn(`[${currentNodeKey}] supervisionDetailRef 不存在`)
      variables[nodeConfig.flagVar] = 2 // 兜底设为无变更
      return variables
    }

    // 获取当前表单数据和原始数据
    const currentData = props.supervisionDetailRef.getEditFormData()
    const originalData = props.supervisionDetailRef.getOrderDetailData()
    
    console.log('[vars] currentData =', currentData)
    console.log('[vars] originalData =', originalData)
    
    if (!currentData || !originalData) {
      console.warn(`[${currentNodeKey}] 无法获取表单数据或原始数据`)
      variables[nodeConfig.flagVar] = 2 // 兜底设为无变更
      return variables
    }

    // 检查各字段是否有变更
    let hasAnyChange = false
    const tempVariables: Record<string, any> = {}

    for (const field of nodeConfig.fields) {
      // 获取旧值，对特殊字段进行映射
      let oldVal = originalData[field.formField]
      
      // 修复 otherLeaderIds/supervisorIds 的旧值取值源
      if (field.formField === 'otherLeaderIds' && oldVal === undefined) {
        // 从 originalData.leadLeaders 中筛选其他分管领导
        const otherLeaders = originalData.leadLeaders || []
        oldVal = otherLeaders
          .filter(leader => leader.type === '其他分管领导')
          .map(leader => leader.id)
        console.log(`🔧 [${currentNodeKey}] otherLeaderIds 旧值映射: leadLeaders -> [${oldVal.join(',')}]`)
      }
      
      if (field.formField === 'supervisorIds' && oldVal === undefined) {
        // 从 originalData.supervisors 中提取 id 数组
        const supervisors = originalData.supervisors || []
        oldVal = supervisors.map(supervisor => supervisor.id)
        console.log(`🔧 [${currentNodeKey}] supervisorIds 旧值映射: supervisors -> [${oldVal.join(',')}]`)
      }
      
      const newVal = currentData[field.formField]
      
      // 关键打印：看"你改的字段"是否识别为 changed
      console.log(`📋 [${currentNodeKey}] 检查字段: ${field.formField} -> ${field.processVar}`)
      console.log('       oldVal =', oldVal, '(type:', typeof oldVal, ')')
      console.log('       newVal =', newVal, '(type:', typeof newVal, ')')
      
      // 特别关注督办分类字段
      if (field.formField === 'type') {
        console.log(`🎯 [督办分类特别调试] formField: ${field.formField}`)
        console.log(`🎯 [督办分类特别调试] oldVal: ${oldVal}, newVal: ${newVal}`)
        console.log(`🎯 [督办分类特别调试] processVar: ${field.processVar}`)
      }
      
      // 跳过未渲染/未绑定的字段（防止误判）
      if (newVal === undefined) {
        console.log(`⏭️  [${currentNodeKey}]   跳过：当前值为 undefined（字段未参与编辑）`)
        continue
      }
      
      // 跳过两个值都是 undefined 的情况
      if (newVal === undefined && oldVal === undefined) {
        console.log(`⏭️  [${currentNodeKey}]   跳过：两个值都是 undefined`)
        continue
      }
      
      // 使用改进的比较逻辑
      const hasChanged = field.comparator ? 
        field.comparator(oldVal, newVal) : 
        isFieldValueChanged(oldVal, newVal, field.formField)
      
      if (hasChanged) {
        console.log(`🚨 [${currentNodeKey}]   ✓ 检测到变更！`)
      } else {
        console.log(`✅ [${currentNodeKey}]   - 无变更`)
      }
      
      if (hasChanged) {
        hasAnyChange = true
        
        // 处理不同类型的值
        let processedValue = newVal
        console.log('       processedValue(before) =', processedValue)
        
        // 对 deadline 字段统一转换为毫秒数提交
        if (field.formField === 'deadline' && typeof newVal === 'string') {
          const parsedDate = new Date(newVal)
          if (!isNaN(parsedDate.getTime())) {
            processedValue = parsedDate.getTime()
            console.log(`🕐 [${currentNodeKey}] deadline 转换为毫秒:`, newVal, '->', processedValue)
          }
        }
        
        const isDeptField =
          field.formField === 'leadDept' ||
          field.formField === 'coDept' ||
          /LeadDept|CoDept/i.test(field.processVar)

        if (Array.isArray(newVal)) {
          // 如果是数组，提取ID，并转为数字
          processedValue = newVal
            .map((item: any) => (typeof item === 'object' && item !== null ? (item.id ?? item.value ?? item) : item))
            .map((v: any) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
            .filter((v: any) => !Number.isNaN(v))
        } else if (typeof newVal === 'string' && isDeptField) {
          // 字符串（如 "1,2,3"）拆分为数字ID数组
          processedValue = newVal
            .split(',')
            .map((s: string) => s.trim())
            .map((s: string) => parseInt(s, 10))
            .filter((n: number) => !Number.isNaN(n))
        } else if (isDeptField && typeof newVal === 'object' && newVal !== null) {
          // 单个对象，取 id/value
          const id = parseInt(String((newVal as any).id ?? (newVal as any).value ?? ''), 10)
          processedValue = Number.isNaN(id) ? [] : [id]
        }
        
        console.log('       processedValue(after)  =', processedValue)
        
        // 只有当处理后的值有效时才加入临时变量
        if (isValidProcessedValue(processedValue)) {
          tempVariables[field.processVar] = processedValue
          console.log(`✅ [${currentNodeKey}]   已加入临时变量: ${field.processVar}`)
        } else {
          console.log(`❌ [${currentNodeKey}]   跳过无效值: ${field.processVar} = ${processedValue}`)
        }
      }
    }

    // 设置变更标识和临时变量
    if (hasAnyChange && Object.keys(tempVariables).length > 0) {
      variables[nodeConfig.flagVar] = 1 // 有变更
      Object.assign(variables, tempVariables)
      console.log(`🔥 [${currentNodeKey}] 检测到变更，设置 ${nodeConfig.flagVar} = 1`)
      console.log(`🔥 [${currentNodeKey}] 临时变量:`, tempVariables)
      console.log(`🔥 [${currentNodeKey}] 变更字段数量: ${Object.keys(tempVariables).length}`)
    } else {
      variables[nodeConfig.flagVar] = 2 // 无变更
      console.log(`✅ [${currentNodeKey}] 无变更，设置 ${nodeConfig.flagVar} = 2`)
      console.log(`✅ [${currentNodeKey}] hasAnyChange=${hasAnyChange}, tempVariables数量=${Object.keys(tempVariables).length}`)
    }

  } catch (error) {
    console.warn(`[${currentNodeKey}] 设置临时变更变量失败:`, error)
    variables[nodeConfig.flagVar] = 2 // 兜底设为无变更
  }
  
  console.log('[vars] result variables =', variables)
  return variables
}

/**
 * 改进的字段值变更判断逻辑
 */
const isFieldValueChanged = (oldVal: any, newVal: any, fieldName: string): boolean => {
  console.log(`🔍 [${fieldName}] isFieldValueChanged 执行路径追踪:`, { oldVal, newVal, oldType: typeof oldVal, newType: typeof newVal })
  
  // 完全相等的情况
  if (oldVal === newVal) {
    console.log(`🔍 [${fieldName}] 完全相等，返回 false`)
    return false
  }
  
  // 处理 null/undefined 的情况
  if ((oldVal == null && newVal == null)) {
    console.log(`🔍 [${fieldName}] 都为 null/undefined，返回 false`)
    return false
  }
  if ((oldVal == null && newVal != null) || (oldVal != null && newVal == null)) {
    console.log(`🔍 [${fieldName}] 一个为 null 一个不为 null，返回 true`)
    return true
  }
  
  // 处理数组字段（如 leadDept, coDept, supervisorIds 等）
  const isArrayField = fieldName === 'leadDept' || fieldName === 'coDept' || fieldName.includes('Ids') || Array.isArray(oldVal) || Array.isArray(newVal)
  if (isArrayField) {
    console.log(`🔍 [${fieldName}] 识别为数组字段，调用 isArrayValueChanged`)
    return isArrayValueChanged(oldVal, newVal)
  }
  
  // 处理日期字段
  const isDateField = fieldName === 'deadline' || fieldName.includes('Time') || fieldName.includes('Date')
  if (isDateField) {
    console.log(`🔍 [${fieldName}] 识别为日期字段，调用 isDateValueChanged`)
    return isDateValueChanged(oldVal, newVal)
  }
  
  // 处理数字字段
  if (fieldName === 'type' || fieldName === 'priority' || fieldName === 'reportFrequency') {
    return isNumberValueChanged(oldVal, newVal)
  }
  
  // 处理字符串字段
  if (typeof oldVal === 'string' || typeof newVal === 'string') {
    return isStringValueChanged(oldVal, newVal)
  }
  
  // 其他情况使用 JSON 比较
  try {
    return JSON.stringify(oldVal) !== JSON.stringify(newVal)
  } catch {
    return String(oldVal) !== String(newVal)
  }
}

/**
 * 数组值变更判断
 */
const isArrayValueChanged = (oldVal: any, newVal: any): boolean => {
  // 统一转换为数字数组进行比较
  const normalizeArray = (val: any): number[] => {
    if (val == null) return []
    if (Array.isArray(val)) {
      return val
        .map(item => typeof item === 'object' ? (item.id ?? item.value ?? item) : item)
        .map(item => parseInt(String(item), 10))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b) // 排序以忽略顺序差异
    }
    if (typeof val === 'string') {
      return val.split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b)
    }
    const num = parseInt(String(val), 10)
    return isNaN(num) ? [] : [num]
  }
  
  const oldArray = normalizeArray(oldVal)
  const newArray = normalizeArray(newVal)
  
  console.log(`🔢 数组比较: oldArray=[${oldArray.join(',')}], newArray=[${newArray.join(',')}]`)
  
  if (oldArray.length !== newArray.length) {
    console.log(`🔢 数组长度不同: ${oldArray.length} vs ${newArray.length}`)
    return true
  }
  
  const isEqual = oldArray.every((val, index) => val === newArray[index])
  console.log(`🔢 数组内容比较结果: ${isEqual ? '相等' : '不相等'}`)
  return !isEqual
}

/**
 * 日期值变更判断 - 字符串语义等价优先，毫秒对比兜底
 */
const isDateValueChanged = (oldVal: any, newVal: any): boolean => {
  if (oldVal == null && newVal == null) return false
  if (oldVal == null || newVal == null) return true
  
  try {
    // 处理原始值（通常是数字时间戳）
    let oldTime: number
    let oldFormatted: string = ''
    
    if (typeof oldVal === 'number') {
      oldTime = oldVal
      // 将毫秒时间戳格式化为本地时区的 "yyyy-MM-dd HH:mm:ss" 格式
      const date = new Date(oldTime)
      oldFormatted = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0') + ' ' + 
        String(date.getHours()).padStart(2, '0') + ':' + 
        String(date.getMinutes()).padStart(2, '0') + ':' + 
        String(date.getSeconds()).padStart(2, '0')
    } else {
      oldTime = new Date(oldVal).getTime()
      oldFormatted = String(oldVal)
    }
    
    // 处理当前值（可能是 "yyyy-MM-dd HH:mm:ss" 格式字符串）
    let newTime: number
    let newFormatted: string = String(newVal)
    
    if (typeof newVal === 'number') {
      newTime = newVal
    } else if (typeof newVal === 'string') {
      // 显式解析 "yyyy-MM-dd HH:mm:ss" 格式
      const match = newVal.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
      if (match) {
        const [, year, month, day, hour, minute, second] = match
        // 注意：月份需要减1，因为 Date 构造函数的月份是从0开始的
        newTime = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10)
        ).getTime()
      } else {
        newTime = new Date(newVal).getTime()
      }
    } else {
      newTime = new Date(newVal).getTime()
    }
    
    // 先进行字符串语义等价判断
    const stringEqual = oldFormatted === newFormatted
    const timestampEqual = oldTime === newTime
    
    console.log(`🕐 日期比较详情:`)
    console.log(`🕐   原始值: ${oldVal} (${typeof oldVal}) → ${oldTime}ms → "${oldFormatted}"`)
    console.log(`🕐   当前值: ${newVal} (${typeof newVal}) → ${newTime}ms → "${newFormatted}"`)
    console.log(`🕐   字符串等价: ${stringEqual}`)
    console.log(`🕐   时间戳等价: ${timestampEqual}`)
    
    // 优先使用字符串等价判断，如果字符串相等则认为无变更
    if (stringEqual) {
      console.log(`🕐   判定结果: 无变更（字符串等价）`)
      return false
    }
    
    // 字符串不等时，使用时间戳判断
    const hasChanged = !timestampEqual
    console.log(`🕐   判定结果: ${hasChanged ? '有变更' : '无变更'}（时间戳比较）`)
    return hasChanged
  } catch (error) {
    console.warn('日期解析失败，使用字符串比较:', error)
    return String(oldVal) !== String(newVal)
  }
}

/**
 * 数字值变更判断
 */
const isNumberValueChanged = (oldVal: any, newVal: any): boolean => {
  const oldNum = oldVal == null ? null : Number(oldVal)
  const newNum = newVal == null ? null : Number(newVal)
  
  if (isNaN(oldNum) && isNaN(newNum)) return false
  if (isNaN(oldNum) || isNaN(newNum)) return true
  
  return oldNum !== newNum
}

/**
 * 字符串值变更判断
 */
const isStringValueChanged = (oldVal: any, newVal: any): boolean => {
  const oldStr = oldVal == null ? '' : String(oldVal).trim()
  const newStr = newVal == null ? '' : String(newVal).trim()
  return oldStr !== newStr
}

/**
 * 部门变更统一识别函数 - 多源权限融合
 */
const setDeptChangeVariablesIfAny = (variables: Record<string, any>): void => {
  console.log('🏢 [dept] 开始检查部门变更')
  
  if (!props.supervisionDetailRef) {
    console.log('🏢 [dept] supervisionDetailRef 不存在，跳过部门变更检查')
    return
  }
  
  const currentData = props.supervisionDetailRef.getEditFormData()
  const originalData = props.supervisionDetailRef.getOrderDetailData()
  
  if (!currentData || !originalData) {
    console.log('🏢 [dept] 无法获取表单数据或原始数据，跳过部门变更检查')
    return
  }
  
  // 多源权限融合策略
  const getPermission = (fieldName: string): boolean => {
    // Source A: supervisionDetailRef 的权限 ref
    const refPermissions = {
      leadDept: props.supervisionDetailRef.canEditLeadDept?.value,
      collaborateDepts: props.supervisionDetailRef.canEditCollaborateDepts?.value
    }
    
    // Source B: props.writableFields 包含检查
    const writableFieldsPermission = props.writableFields?.includes(fieldName) ||
      props.writableFields?.includes('coDept') ||
      props.writableFields?.includes('collaborateDeptIds')
    
    // Source C: 节点级兜底（基于当前任务节点）
    const nodePermission = runningTask.value?.taskDefinitionKey === 'de_director_check'
    
    // Source D: 渲染存在性兜底
    const renderPermission = fieldName === 'leadDept' ? 
      currentData.leadDept !== undefined :
      (currentData.coDept !== undefined || currentData.collaborateDeptIds !== undefined)
    
    const finalPermission = refPermissions[fieldName] || writableFieldsPermission || nodePermission || renderPermission
    
    console.log(`🏢 [dept] ${fieldName} 权限判断:`, {
      ref: refPermissions[fieldName],
      writableFields: writableFieldsPermission,
      node: nodePermission,
      render: renderPermission,
      final: finalPermission
    })
    
    return finalPermission
  }
  
  let hasAnyDeptChange = false
  const tempDeptVariables: Record<string, any> = {}
  
  // 检查办理单位变更
  const canEditLeadDept = getPermission('leadDept')
  if (canEditLeadDept) {
    const oldLeadDept = originalData.leadDept
    const newLeadDept = currentData.leadDept
    
    console.log('🏢 [dept] 办理单位比较:', { old: oldLeadDept, new: newLeadDept })
    
    if (isArrayValueChanged(oldLeadDept, newLeadDept)) {
      console.log('🏢 [dept] ✓ 办理单位有变更')
      hasAnyDeptChange = true
      
      // 归一化为数字数组
      const normalizedIds = Array.isArray(newLeadDept) ? 
        newLeadDept.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id)) :
        String(newLeadDept).split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id))
      
      tempDeptVariables.tempLeadDeptIds = normalizedIds
      console.log('🏢 [dept] 设置 tempLeadDeptIds:', normalizedIds)
    } else {
      console.log('🏢 [dept] 办理单位无变更')
    }
  } else {
    console.log('🏢 [dept] 无办理单位编辑权限，跳过检查')
  }
  
  // 检查协办单位变更
  const canEditCollaborateDepts = getPermission('collaborateDepts')
  if (canEditCollaborateDepts) {
    const oldCoDept = originalData.coDept || originalData.collaborateDeptIds
    const newCoDept = currentData.coDept || currentData.collaborateDeptIds
    
    console.log('🏢 [dept] 协办单位比较:', { old: oldCoDept, new: newCoDept })
    
    if (isArrayValueChanged(oldCoDept, newCoDept)) {
      console.log('🏢 [dept] ✓ 协办单位有变更')
      hasAnyDeptChange = true
      
      // 归一化为数字数组
      const normalizedIds = Array.isArray(newCoDept) ? 
        newCoDept.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id)) :
        String(newCoDept).split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id))
      
      tempDeptVariables.tempCoDeptIds = normalizedIds
      console.log('🏢 [dept] 设置 tempCoDeptIds:', normalizedIds)
    } else {
      console.log('🏢 [dept] 协办单位无变更')
    }
  } else {
    console.log('🏢 [dept] 无协办单位编辑权限，跳过检查')
  }
  
  // 设置部门变更标识和临时变量（按节点区分）
  if (hasAnyDeptChange) {
    const currentKey = runningTask.value?.taskDefinitionKey || ''
    
    if (currentKey === 'select_leaddept') {
      // select_leaddept 节点：使用旧变量名
      Object.assign(variables, tempDeptVariables)
      variables.selectLeadDeptChangedFlag = 1
      variables.deptChangeFlag = 1 // 兼容旧网关表达式
      console.log('🏢 [dept] ✓ select_leaddept 节点：设置 selectLeadDeptChangedFlag=1 & deptChangeFlag=1')
      console.log('🏢 [dept] 部门临时变量:', tempDeptVariables)
    } else if (currentKey === 'update_materials') {
      // update_materials 节点：使用新变量名
      const updateMaterialsVars: Record<string, any> = {}
      if (tempDeptVariables.tempLeadDeptIds) {
        updateMaterialsVars.latestTempUpdateMaterialsLeadDeptIds = tempDeptVariables.tempLeadDeptIds
      }
      if (tempDeptVariables.tempCoDeptIds) {
        updateMaterialsVars.latestTempUpdateMaterialsCoDeptIds = tempDeptVariables.tempCoDeptIds
      }
      Object.assign(variables, updateMaterialsVars)
      variables.otherNodeDeptChangedFlag = 1
      console.log('🏢 [dept] ✓ update_materials 节点：设置 otherNodeDeptChangedFlag=1')
      console.log('🏢 [dept] update_materials 部门临时变量:', updateMaterialsVars)
    } else {
      // 其他节点：使用旧变量名
      Object.assign(variables, tempDeptVariables)
      variables.otherNodeDeptChangedFlag = 1
      console.log('🏢 [dept] ✓ 非 select_leaddept 节点：设置 otherNodeDeptChangedFlag=1')
      console.log('🏢 [dept] 部门临时变量:', tempDeptVariables)
    }
  } else {
    console.log('✅ [dept] 无部门变更')
  }
}

/**
 * 检查处理后的值是否有效（用于临时变量）
 */
const isValidProcessedValue = (value: any): boolean => {
  if (value === undefined || value === null) return false
  if (Array.isArray(value) && value.length === 0) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return true
}

// ========== 中止/恢复功能 ==========
const handleSignFinish = (url: string) => {
  approveReasonForm.signPicUrl = url
  approveSignFormRef.value.validate('change')
}



/** 获取督办节点类型 */
const getSupervisionNodeType = (): string => {
  if (!runningTask.value) {
    return 'other'
  }

  const taskKey = runningTask.value.taskDefinitionKey || ''

  // 根据 taskDefinitionKey 判断节点类型
  if (taskKey === 'de_director_check' || taskKey === 'director_check') {
    return 'first_approval'
  }

  if (taskKey === 'de_director_recheck' || taskKey === 'director_recheck') {
    return 'reapproval'
  }

  // 其他节点（牵头单位、协办部门等）
  return 'other'
}

const handleComment = async () => {
  try {
    formLoading.value = true
    await PetitionApi.addPetitionComment({
      petitionId: Number(router.currentRoute.value.query.id),
      userId: userStore.user.id,
      note: commentForm.commentContent
    })
    ElMessage.success('批示意见提交成功')
    commentForm.commentContent = ''
    closePopover('comment', commentFormRef.value)
    
    // 触发全局刷新事件，供父组件监听
    window.dispatchEvent(new CustomEvent('petition-comment-submitted', {
      detail: {
        petitionId: Number(router.currentRoute.value.query.id),
        timestamp: Date.now()
      }
    }))
    
    emit('success')
  } catch (error) {
    console.error('提交批示意见失败:', error)
    const errorMsg = extractErrorMessage(error) || '提交批示意见失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    formLoading.value = false
  }
}

// 监听流程实例ID变化，重置本地覆盖状态，避免跨实例串值
watch(
  () => props.processInstance?.id,
  () => {
    localSupervisionStatus.value = null
  },
  { immediate: false }
)

// 暴露方法：打开审批对话框
const openApproveDialog = () => {
  if (runningTask.value && isHandleTaskStatus()) {
    openPopover('approve')
  }
}

// 暴露方法：打开拒绝对话框
const openRejectDialog = () => {
  if (runningTask.value && isHandleTaskStatus()) {
    openPopover('reject')
  }
}

// 暴露方法：在指定元素旁边打开审批对话框
const openApproveAt = async (el: HTMLElement) => {
  if (!runningTask.value || !isHandleTaskStatus()) return
  
  // 设置虚拟锚点
  approveVirtualRef.value = el
  
  // 执行与 openPopover('approve') 相同的逻辑
  // 校验流程表单
  const valid = await validateNormalForm()
  if (!valid) {
    message.warning('表单校验不通过，请先完善表单!!')
    return
  }
  initNextAssigneesFormField()
  
  // 显示 Popover
  popOverVisible.value.approve = true
}

// 暴露方法：在指定元素旁边打开拒绝对话框
const openRejectAt = async (el: HTMLElement) => {
  if (!runningTask.value || !isHandleTaskStatus()) return
  
  // 刷新 template 计划标志，确保"驳回目标"显示逻辑一致
  await refreshTemplatePlanFlag()
  updateShowRejectTarget()
  
  // 设置虚拟锚点
  rejectVirtualRef.value = el
  
  // 显示 Popover
  popOverVisible.value.reject = true
}

defineExpose({ 
  loadTodoTask, 
  openPopover,
  openApproveDialog,
  openRejectDialog,
  openApproveAt,
  openRejectAt
})

</script>

<style lang="scss" scoped>
:deep(.el-affix--fixed) {
  background-color: var(--el-bg-color);
}

.btn-container {
  > div {
    display: flex;
    margin: 0 8px;
    cursor: pointer;
    align-items: center;

    &:hover {
      color: #6db5ff;
    }
  }

  // 为 el-button 添加右间距，保持与其他按钮一致的间距
  :deep(.el-button) {
    margin-right: 12px;
  }
}

/* 代管弹层样式 */
:deep(.supervision-delegate-popper) {
  z-index: 3000 !important;
}
</style>

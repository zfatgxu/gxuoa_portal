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
        <el-form-item v-if="isSupervisorReviewNode" label="驳回目标" prop="rejectTarget">
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
          <el-form-item v-if="isSupervisorReviewNode" label="驳回目标" prop="rejectTarget">
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

    <!-- 【终止督办】按钮 -->
    <el-button 
      v-if="shouldShowTerminateButton()" 
      :loading="terminateLoading"
      type="danger" 
      @click="handleTerminateSupervision"
    >
      <Icon icon="ep:warning" />&nbsp; 终止督办
    </el-button>

    <!-- 【抄送】按钮 -->
<!--      <el-popover-->
<!--      :visible="popOverVisible.copy"-->
<!--      placement="top-start"-->
<!--      :width="420"-->
<!--      trigger="click"-->
<!--      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.COPY)"-->
<!--    >-->
<!--      <template #reference>-->
<!--        <div @click="openPopover('copy')" class="hover-bg-gray-100 rounded-xl p-6px">-->
<!--          <Icon :size="14" icon="svg-icon:send" />&nbsp;-->
<!--          {{ getButtonDisplayName(OperationButtonType.COPY) }}-->
<!--        </div>-->
<!--      </template>-->
<!--      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">-->
<!--        <el-form-->
<!--          label-position="top"-->
<!--          class="mb-auto"-->
<!--          ref="copyFormRef"-->
<!--          :model="copyForm"-->
<!--          :rules="copyFormRule"-->
<!--          label-width="100px"-->
<!--        >-->
<!--          <el-form-item label="抄送人" prop="copyUserIds">-->
<!--            <el-select-->
<!--              v-model="copyForm.copyUserIds"-->
<!--              clearable-->
<!--              style="width: 100%"-->
<!--              multiple-->
<!--              placeholder="请选择抄送人"-->
<!--            >-->
<!--              <el-option-->
<!--                v-for="item in userOptions"-->
<!--                :key="item.id"-->
<!--                :label="item.nickname"-->
<!--                :value="item.id"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="抄送意见" prop="copyReason">-->
<!--            <el-input-->
<!--              v-model="copyForm.copyReason"-->
<!--              clearable-->
<!--              placeholder="请输入抄送意见"-->
<!--              type="textarea"-->
<!--              :rows="3"-->
<!--            />-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-button :disabled="formLoading" type="primary" @click="handleCopy">-->
<!--              {{ getButtonDisplayName(OperationButtonType.COPY) }}-->
<!--            </el-button>-->
<!--            <el-button @click="closePopover('copy', copyFormRef)"> 取消 </el-button>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--      </div>-->
<!--    </el-popover>-->

    <!-- 【转办】按钮 -->
<!--    <el-popover-->
<!--      :visible="popOverVisible.transfer"-->
<!--      placement="top-start"-->
<!--      :width="420"-->
<!--      trigger="click"-->
<!--      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.TRANSFER)"-->
<!--    >-->
<!--      <template #reference>-->
<!--        <div @click="openPopover('transfer')" class="hover-bg-gray-100 rounded-xl p-6px">-->
<!--          <Icon :size="14" icon="fa:share-square-o" />&nbsp;-->
<!--          {{ getButtonDisplayName(OperationButtonType.TRANSFER) }}-->
<!--        </div>-->
<!--      </template>-->
<!--      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">-->
<!--        <el-form-->
<!--          label-position="top"-->
<!--          class="mb-auto"-->
<!--          ref="transferFormRef"-->
<!--          :model="transferForm"-->
<!--          :rules="transferFormRule"-->
<!--          label-width="100px"-->
<!--        >-->
<!--          <el-form-item label="新审批人" prop="assigneeUserId">-->
<!--            <el-select v-model="transferForm.assigneeUserId" clearable style="width: 100%">-->
<!--              <el-option-->
<!--                v-for="item in userOptions"-->
<!--                :key="item.id"-->
<!--                :label="item.nickname"-->
<!--                :value="item.id"-->
<!--              />-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="审批意见" prop="reason">-->
<!--            <el-input-->
<!--              v-model="transferForm.reason"-->
<!--              clearable-->
<!--              placeholder="请输入审批意见"-->
<!--              type="textarea"-->
<!--              :rows="3"-->
<!--            />-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-button :disabled="formLoading" type="primary" @click="handleTransfer()">-->
<!--              {{ getButtonDisplayName(OperationButtonType.TRANSFER) }}-->
<!--            </el-button>-->
<!--            <el-button @click="closePopover('transfer', transferFormRef)"> 取消 </el-button>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--      </div>-->
<!--    </el-popover>-->

    <!-- 【代管】按钮 -->
    <el-button 
      v-if="canDelegate" 
      type="warning" 
      ref="delegateBtnRef"
      @click="openDelegateDialog"
    >
      <Icon icon="ep:user" />&nbsp; 代管
    </el-button>

    <!-- 【取消代管】按钮 -->
    <el-button 
      v-if="canCancelDelegate" 
      type="info" 
      @click="handleCancelDelegate"
      :loading="formLoading"
    >
      <Icon icon="ep:refresh-left" />&nbsp; 取消代管
    </el-button>

    <!-- 【中止】按钮 -->
    <el-button 
      v-if="shouldShowSuspendButton" 
      type="warning" 
      @click="handleSuspend"
      :loading="suspendLoading"
    >
      <Icon icon="ep:warning-filled" />&nbsp; 中止
    </el-button>

    <!-- 【恢复】按钮 -->
    <el-button 
      v-if="shouldShowResumeButton" 
      type="success" 
      @click="handleResume"
      :loading="resumeLoading"
    >
      <Icon icon="ep:refresh" />&nbsp; 恢复
    </el-button>

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
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading" @click.stop>
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
            <el-button :disabled="formLoading" type="primary" @click="handleDelegate()">
              确认代管
            </el-button>
            <el-button @click="closePopover('delegate', delegateFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>

    <!-- 【加签】按钮 当前任务审批人为A，向前加签选了一个C，则需要C先审批，然后再是A审批，向后加签B，A审批完，需要B再审批完，才算完成这个任务节点 -->
    <!-- <el-popover
      :visible="popOverVisible.addSign"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.ADD_SIGN)"
    >
      <template #reference>
        <div @click="openPopover('addSign')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:plus" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="addSignFormRef"
          :model="addSignForm"
          :rules="addSignFormRule"
          label-width="100px"
        >
          <el-form-item label="加签处理人" prop="addSignUserIds">
            <el-select v-model="addSignForm.addSignUserIds" multiple clearable style="width: 100%">
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.nickname"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="addSignForm.reason"
              clearable
              placeholder="请输入审批意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handlerAddSign('before')">
              向前{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
            </el-button>
            <el-button :disabled="formLoading" type="primary" @click="handlerAddSign('after')">
              向后{{ getButtonDisplayName(OperationButtonType.ADD_SIGN) }}
            </el-button>
            <el-button @click="closePopover('addSign', addSignFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【减签】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.deleteSign"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask?.children.length > 0"
    >
      <template #reference>
        <div @click="openPopover('deleteSign')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:semi-select" />&nbsp; 减签
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="deleteSignFormRef"
          :model="deleteSignForm"
          :rules="deleteSignFormRule"
          label-width="100px"
        >
          <el-form-item label="减签人员" prop="deleteSignTaskId">
            <el-select v-model="deleteSignForm.deleteSignTaskId" clearable style="width: 100%">
              <el-option
                v-for="item in runningTask.children"
                :key="item.id"
                :label="getDeleteSignUserLabel(item)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="reason">
            <el-input
              v-model="deleteSignForm.reason"
              clearable
              placeholder="请输入审批意见"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handlerDeleteSign()">
              减签
            </el-button>
            <el-button @click="closePopover('deleteSign', deleteSignFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!-- 【退回】按钮 -->
    <!-- <el-popover
      :visible="popOverVisible.return"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="runningTask && isHandleTaskStatus() && isShowButton(OperationButtonType.RETURN)"
    >
      <template #reference>
        <div @click="openPopover('return')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="ep:back" />&nbsp;
          {{ getButtonDisplayName(OperationButtonType.RETURN) }}
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="returnFormRef"
          :model="returnForm"
          :rules="returnFormRule"
          label-width="100px"
        >
          <el-form-item label="退回节点" prop="targetTaskDefinitionKey">
            <el-select v-model="returnForm.targetTaskDefinitionKey" clearable style="width: 100%">
              <el-option
                v-for="item in returnList"
                :key="item.taskDefinitionKey"
                :label="item.name"
                :value="item.taskDefinitionKey"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="退回理由" prop="returnReason">
            <el-input
              v-model="returnForm.returnReason"
              clearable
              placeholder="请输入退回理由"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleReturn()">
              {{ getButtonDisplayName(OperationButtonType.RETURN) }}
            </el-button>
            <el-button @click="closePopover('return', returnFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->

    <!--【取消】按钮 这个对应发起人的取消, 只有发起人可以取消 -->
    <!-- <el-popover
      :visible="popOverVisible.cancel"
      placement="top-start"
      :width="420"
      trigger="click"
      v-if="
        userId === processInstance?.startUser?.id && !isEndProcessStatus(processInstance?.status)
      "
    >
      <template #reference>
        <div @click="openPopover('cancel')" class="hover-bg-gray-100 rounded-xl p-6px">
          <Icon :size="14" icon="fa:mail-reply" />&nbsp; 取消
        </div>
      </template>
      <div class="flex flex-col flex-1 pt-20px px-20px" v-loading="formLoading">
        <el-form
          label-position="top"
          class="mb-auto"
          ref="cancelFormRef"
          :model="cancelForm"
          :rules="cancelFormRule"
          label-width="100px"
        >
          <el-form-item label="取消理由" prop="cancelReason">
            <span class="text-#878c93 text-12px">&nbsp; 取消后，该审批流程将自动结束</span>
            <el-input
              v-model="cancelForm.cancelReason"
              clearable
              placeholder="请输入取消理由"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="handleCancel()">
              确认
            </el-button>
            <el-button @click="closePopover('cancel', cancelFormRef)"> 取消 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover> -->
    <!-- 【再次提交】 按钮-->
    <!-- <div
      @click="handleReCreate()"
      class="hover-bg-gray-100 rounded-xl p-6px"
      v-if="
        userId === processInstance?.startUser?.id &&
        isEndProcessStatus(processInstance?.status) &&
        processDefinition?.formType === 10
      "
    >
      <Icon :size="14" icon="ep:refresh" />&nbsp; 再次提交
    </div> -->
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
import { useRouter } from 'vue-router'
import { useMessage } from '@/hooks/web/useMessage'
import { BpmTaskApi } from '@/api/bpm/task'
import * as TaskApi from '@/api/bpm/task'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { getNodeTempConfig } from './nodeTempConfig'
import * as UserApi from '@/api/system/user'
import { SupervisionIndexApi, SupervisionProcessApi, SupervisionTaskOperationApi, OrderApi } from '@/api/supervision/index'
import { checkRole } from '@/utils/permission'
import { canSuspendResume } from '../components/permissions'
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

// ========== 终止督办 ==========
const terminateLoading = ref(false) // 终止督办按钮加载状态

// ========== 中止/恢复督办 ==========
const suspendDialogVisible = ref(false) // 中止弹窗显示状态
const resumeDialogVisible = ref(false) // 恢复弹窗显示状态
const suspendLoading = ref(false) // 中止操作加载状态
const resumeLoading = ref(false) // 恢复操作加载状态
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
    rejectTarget: [{ required: isSupervisorReviewNode.value, message: '请选择驳回目标', trigger: 'change' }]
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

// 抄送表单
const copyFormRef = ref<FormInstance>()
const copyForm = reactive({
  copyUserIds: [],
  copyReason: ''
})
const copyFormRule = reactive<FormRules<typeof copyForm>>({
  copyUserIds: [{ required: true, message: '抄送人不能为空', trigger: 'change' }]
})

// 转办表单
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  assigneeUserId: undefined,
  reason: ''
})
const transferFormRule = reactive<FormRules<typeof transferForm>>({
  assigneeUserId: [{ required: true, message: '新审批人不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
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

/** 判断是否可以发起代管 */
const canDelegate = computed(() => {
  if (!runningTask.value || !isHandleTaskStatus()) return false
  
  // 如果已经是代管状态，不能再次代管
  if (isDelegated.value) return false
  
  // 检查当前用户是否是任务的办理人
  const currentUserId = userStore.getUser.id
  const assigneeUserId = runningTask.value.assigneeUser?.id
  
  return currentUserId === assigneeUserId
})

/** 判断是否可以取消代管 */
const canCancelDelegate = computed(() => {
  // 方法1：通过 delegatedTaskId 判断（优先）
  if (props.delegatedTaskId) {
    return true // 如果有 delegatedTaskId，说明当前用户是原办理人且任务被代管中
  }
  
  // 方法2：通过 runningTask 判断（兜底）
  if (!runningTask.value || !isDelegated.value) return false
  
  // 检查当前用户是否是原始办理人（ownerUser）
  const currentUserId = userStore.getUser.id
  const ownerUserId = runningTask.value.ownerUser?.id
  
  return currentUserId === ownerUserId
})

// ========== 中止/恢复按钮显示逻辑 ==========
/** 统一获取当前督办状态 */
const currentSupervisionStatus = computed(() => {
  // 优先级：本地覆盖 > 督办详情组件 > 流程实例 > 运行任务
  const status = localSupervisionStatus.value ??
                 props.supervisionDetailRef?.getOrderDetailData?.()?.supervisionStatus ??
                 props.processInstance?.supervisionStatus ??
                 runningTask.value?.supervisionStatus
  
  // 统一转换为数字，避免字符串比较问题
  return status != null ? Number(status) : null
})

/** 判断是否显示中止按钮 */
const shouldShowSuspendButton = computed(() => {
  // 必须有权限且督办单不是已中止状态
  if (!canSuspendResume()) return false
  
  const status = currentSupervisionStatus.value
  // 状态不是6(已中止)时才显示中止按钮
  return status !== 6
})

/** 判断是否显示恢复按钮 */
const shouldShowResumeButton = computed(() => {
  // 必须有权限且督办单是已中止状态
  if (!canSuspendResume()) return false
  
  const status = currentSupervisionStatus.value
  // 状态是6(已中止)时才显示恢复按钮
  return status === 6
})

// 加签表单
const addSignFormRef = ref<FormInstance>()
const addSignForm = reactive({
  addSignUserIds: undefined,
  reason: ''
})
const addSignFormRule = reactive<FormRules<typeof addSignForm>>({
  addSignUserIds: [{ required: true, message: '加签处理人不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
})

// 减签表单
const deleteSignFormRef = ref<FormInstance>()
const deleteSignForm = reactive({
  deleteSignTaskId: undefined,
  reason: ''
})
const deleteSignFormRule = reactive<FormRules<typeof deleteSignForm>>({
  deleteSignTaskId: [{ required: true, message: '减签人员不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '审批意见不能为空', trigger: 'blur' }]
})

// 退回表单
const returnFormRef = ref<FormInstance>()
const returnForm = reactive({
  targetTaskDefinitionKey: undefined,
  returnReason: ''
})
const returnFormRule = reactive<FormRules<typeof returnForm>>({
  targetTaskDefinitionKey: [{ required: true, message: '退回节点不能为空', trigger: 'change' }],
  returnReason: [{ required: true, message: '退回理由不能为空', trigger: 'blur' }]
})

// 取消表单
const cancelFormRef = ref<FormInstance>()
const cancelForm = reactive({
  cancelReason: ''
})
const cancelFormRule = reactive<FormRules<typeof cancelForm>>({
  cancelReason: [{ required: true, message: '取消理由不能为空', trigger: 'blur' }]
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

      // 终止流程督查办主任审核节点：自动签收处理
      if (currentTaskKey === 'supervision_terminate_director_approve' || 
          (runningTask.value?.name && runningTask.value.name.includes('督查办主任审核'))) {
        // 检查是否需要先签收任务
        if (!runningTask.value.assigneeUser && runningTask.value.candidateUsers) {
          const isCandidate = runningTask.value.candidateUsers.some(user => 
            Number(user.id) === Number(currentUserId)
          )
          
          if (isCandidate) {
            try {
              console.log('🔄 自动签收终止流程督查办主任审核任务:', runningTask.value.id)
              await TaskApi.claimTask({ id: runningTask.value.id })
              // 更新任务状态
              runningTask.value.assigneeUser = { id: currentUserId }
            } catch (error) {
              console.error('自动签收失败:', error)
              message.error('签收任务失败，请重试')
              return
            }
          }
        }
      }

      // 提前计算流程变量（在本地数据更新之前）
      const variables = getUpdatedProcessInstanceVariables()
      
      // 添加监听器所需的变量
      variables.auditResult = 'approve'
      variables.auditComment = approveReasonForm.reason?.trim() || ''
      
      // 添加当前审批人ID，用于审计记录
      variables.auditUserId = currentUserId
      
      console.log('[submit] variables before submit =', variables)

      // 督办单专用逻辑：统一的数据更新流程
      if (props.supervisionDetailRef) {
        try {
          // 统一调用督办单数据更新流程（权限控制已在详情界面处理）
          await handleStandardSupervisionUpdate()
        } catch (error) {
          console.error('督办单业务逻辑处理失败:', error)
          // 提取具体错误信息
          const errorMessage = extractErrorMessage(error)
          message.error(errorMessage)
          return
        }
      }
      
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
      
      const data = {
        id: runningTask.value?.id,
        reason: finalReason,
        variables, // 审批通过, 把修改的字段值赋于流程实例变量
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


      await TaskApi.approveTask(data)

      popOverVisible.value.approve = false
      nextAssigneesActivityNode.value = []
      message.success('审批通过成功')
    } else {
      // 移除了审批拒绝时清理待处理进度更新数据的逻辑，因为现在进度更新直接提交

      // 督办系统特殊逻辑：先调用督办拒绝接口
      try {
        const processInstanceId = props.processInstance?.id
        if (processInstanceId) {
          await SupervisionIndexApi.supervisionReject(processInstanceId)
        }
      } catch (error) {
        console.error('调用督办拒绝接口失败:', error)
        message.error('督办拒绝处理失败，无法继续审批')
        return
      }

      // 审批不通过数据
      const rejectVariables = {
        auditResult: 'reject',
        auditComment: rejectReasonForm.reason?.trim() || ''
      }
      
      // 添加当前审批人ID，用于审计记录
      rejectVariables.auditUserId = currentUserId
      
      // supervisor_review 节点：添加驳回目标变量（若用户选择了）
      if (isSupervisorReviewNode.value && rejectReasonForm.rejectTarget) {
        rejectVariables.rejectTarget = rejectReasonForm.rejectTarget
        console.log('[handleAudit] supervisor_review 驳回目标:', rejectReasonForm.rejectTarget)
      }
      
      const data = {
        id: runningTask.value?.id,
        reason: rejectReasonForm.reason || '拒绝', // 如果没有填写意见，默认为"拒绝"
        variables: rejectVariables // 添加监听器所需的变量
      }
      await TaskApi.rejectTask(data)
      popOverVisible.value.reject = false
      message.success('审批不通过成功')
    }
    // 重置表单
    formRef.resetFields()
    // 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理抄送 */
const handleCopy = async () => {
  formLoading.value = true
  try {
    // 1. 校验表单
    if (!copyFormRef.value) return
    await copyFormRef.value.validate()
    // 2. 提交抄送
    const data = {
      id: runningTask.value?.id,
      reason: copyForm.copyReason,
      copyUserIds: copyForm.copyUserIds
    }
    await TaskApi.copyTask(data)
    copyFormRef.value.resetFields()
    popOverVisible.value.copy = false
    message.success('操作成功')
  } finally {
    formLoading.value = false
  }
}

/** 处理转交 */
const handleTransfer = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!transferFormRef.value) return
    await transferFormRef.value.validate()
    // 1.2 提交转交
    const data = {
      id: runningTask.value?.id,
      reason: transferForm.reason,
      assigneeUserId: transferForm.assigneeUserId
    }
    await TaskApi.transferTask(data)
    transferFormRef.value.resetFields()
    popOverVisible.value.transfer = false
    message.success('操作成功')
    // 2. 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 打开代管弹窗 */
const openDelegateDialog = () => {
  popOverVisible.value.delegate = true
}

/** 记录督办进度 */
const logSupervisionProgress = async (content: string) => {
  try {
    const processInstanceId = runningTask.value?.processInstanceId || props.processInstance?.id
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

/** 处理代管 */
const handleDelegate = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!delegateFormRef.value) return
    await delegateFormRef.value.validate()
    
    // 1.2 处理代管（使用委派接口）
    const data = {
      id: runningTask.value?.id,
      reason: delegateForm.reason || '代管任务',
      delegateUserId: delegateForm.delegateUserId
    }

    await TaskApi.delegateTask(data)
    
    // 1.3 记录代管进度
    const operatorName = userStore.getUser.nickname || userStore.getUser.id
    const delegateUser = props.userOptions.find(user => user.id === delegateForm.delegateUserId)
    const delegateName = delegateUser?.nickname || delegateForm.delegateUserId
    const reason = delegateForm.reason || '无'
    const progressContent = `【代管】${operatorName} 将任务代管给 ${delegateName}。理由：${reason}`
    
    await logSupervisionProgress(progressContent)
    
    popOverVisible.value.delegate = false
    delegateFormRef.value.resetFields()
    message.success('代管成功')
    // 2. 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理取消代管 */
const handleCancelDelegate = async () => {
  try {
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

    formLoading.value = true

    // 获取任务ID（优先使用 delegatedTaskId）
    const taskId = props.delegatedTaskId || runningTask.value?.id
    if (!taskId) {
      message.error('无法获取任务信息，请刷新页面重试')
      return
    }

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
    
    message.success('取消代管成功')
    // 重新加载数据
    reload()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消代管失败:', error)
      const errorMsg = extractErrorMessage(error)
      message.error(`取消代管失败：${errorMsg}`)
    }
  } finally {
    formLoading.value = false
  }
}

/** 处理加签 */
const handlerAddSign = async (type: string) => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!addSignFormRef.value) return
    await addSignFormRef.value.validate()
    // 1.2 提交加签
    const data = {
      id: runningTask.value?.id,
      type,
      reason: addSignForm.reason,
      userIds: addSignForm.addSignUserIds
    }
    await TaskApi.signCreateTask(data)
    message.success('操作成功')
    addSignFormRef.value.resetFields()
    popOverVisible.value.addSign = false
    // 2 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理退回 */
const handleReturn = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!returnFormRef.value) return
    await returnFormRef.value.validate()
    // 1.2 提交退回
    const data = {
      id: runningTask.value?.id,
      reason: returnForm.returnReason,
      targetTaskDefinitionKey: returnForm.targetTaskDefinitionKey
    }

    await TaskApi.returnTask(data)
    popOverVisible.value.return = false
    returnFormRef.value.resetFields()
    message.success('操作成功')
    // 2 重新加载数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理取消 */
const handleCancel = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!cancelFormRef.value) return
    await cancelFormRef.value.validate()
    // 1.2 提交取消
    await ProcessInstanceApi.cancelProcessInstanceByStartUser(
      props.processInstance.id,
      cancelForm.cancelReason
    )
    popOverVisible.value.return = false
    message.success('操作成功')
    cancelFormRef.value.resetFields()
    // 2 重新加载数据
    reload()
  } finally {
    formLoading.value = false
  }
}

/** 处理再次提交 */
const handleReCreate = async () => {
  // 跳转发起流程界面
  await router.push({
    name: 'BpmProcessInstanceCreate',
    query: { processInstanceId: props.processInstance?.id }
  })
}

/** 获取减签人员标签 */
const getDeleteSignUserLabel = (task: any): string => {
  const deptName = task?.assigneeUser?.deptName || task?.ownerUser?.deptName
  const nickname = task?.assigneeUser?.nickname || task?.ownerUser?.nickname
  return `${nickname} ( 所属部门：${deptName} )`
}
/** 处理减签 */
const handlerDeleteSign = async () => {
  formLoading.value = true
  try {
    // 1.1 校验表单
    if (!deleteSignFormRef.value) return
    await deleteSignFormRef.value.validate()
    // 1.2 提交减签
    const data = {
      id: deleteSignForm.deleteSignTaskId,
      reason: deleteSignForm.reason
    }
    await TaskApi.signDeleteTask(data)
    message.success('减签成功')
    deleteSignFormRef.value.resetFields()
    popOverVisible.value.deleteSign = false
    // 2 加载最新数据
    reload()
  } finally {
    formLoading.value = false
  }
}
/** 重新加载数据 */
const reload = () => {
  emit('success')
}

/** 判断是否显示终止督办按钮 */
const shouldShowTerminateButton = (): boolean => {
  try {
    // 1. 必须是督办流程
    if (!props.supervisionDetailRef) {
      return false
    }

    // 2. 当前用户必须是督查办管理员
    if (!checkRole(['dcb_gly'])) {
      return false
    }

    // 3. 主流程必须未结束（检查 endTime 和 status）
    const processInstance = props.processInstance
    if (processInstance?.endTime) {
      // 如果有结束时间，说明主流程已结束，不应显示终止按钮
      return false
    }
    
    // 检查流程状态是否为终态（已通过、已拒绝、已取消）
    if (processInstance?.status === BpmProcessInstanceStatus.APPROVE ||
        processInstance?.status === BpmProcessInstanceStatus.REJECT ||
        processInstance?.status === BpmProcessInstanceStatus.CANCEL) {
      return false
    }

    // 4. 督办单必须未终止（状态不为5）
    const orderData = props.supervisionDetailRef.getOrderDetailData?.()
    if (orderData?.status === 5) {
      return false
    }

    // 5. 当前不能已有进行中的终止流程
    // 优先使用 prop 传递的 terminateRunning 字段（正确的字段路径）
    if (props.terminateRunning === true) {
      return false
    }
    
    // 兜底：检查时间线中是否已有运行中的终止节点（保持向后兼容）
    if (processInstance?.activityNodes) {
      const hasRunningTerminateNode = processInstance.activityNodes.some(node => 
        node.status === 1 && // 运行中
        node.name && node.name.includes('[终止]')
      )
      if (hasRunningTerminateNode) {
        return false
      }
    }

    return true
  } catch (error) {
    console.warn('[shouldShowTerminateButton] 判断终止按钮显示失败:', error)
    return false
  }
}

/** 处理终止督办 */
const handleTerminateSupervision = async () => {
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
    if (props.processInstance?.businessKey) {
      try {
        orderId = parseInt(props.processInstance.businessKey, 10)
      } catch (e) {
        console.warn('解析 businessKey 失败:', e)
      }
    }
    
    // 兜底从督办详情获取
    if (!orderId && props.supervisionDetailRef) {
      const orderData = props.supervisionDetailRef.getOrderDetailData?.()
      if (orderData?.id) {
        orderId = orderData.id
      }
    }

    if (!orderId) {
      message.error('无法获取督办单ID，请刷新页面重试')
      return
    }

    // 获取当前用户ID
    const userStore = useUserStoreWithOut()
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

    message.success('终止督办流程已发起，请等待审批')
    
    // 刷新页面数据
    reload()
    
    // 轻量轮询确保终止节点立即出现（最多5次，每次400ms）
    let pollCount = 0
    const maxPolls = 5
    const pollInterval = 400
    
    const poll = () => {
      if (pollCount < maxPolls) {
        setTimeout(() => {
          reload()
          pollCount++
          poll()
        }, pollInterval)
      }
    }
    
    poll()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('终止督办失败:', error)
      message.error('终止督办失败，请重试')
    }
  } finally {
    terminateLoading.value = false
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

/** 流程状态是否为结束状态 */
const isEndProcessStatus = (status: number) => {
  let isEndStatus = false
  if (
    BpmProcessInstanceStatus.APPROVE === status ||
    BpmProcessInstanceStatus.REJECT === status ||
    BpmProcessInstanceStatus.CANCEL === status
  ) {
    isEndStatus = true
  }
  return isEndStatus
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
  console.log('[vars] nodeConfig exists =', !!nodeConfig, nodeConfig)
  
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


/**
 * 归一化部门ID数据为升序数字数组
 */
const normalizeDeptIds = (value: any): number[] => {
  if (value == null) return []
  
  if (Array.isArray(value)) {
    return value
      .map(item => typeof item === 'object' ? (item.id ?? item.value ?? item) : item)
      .map(item => parseInt(String(item), 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b)
  }
  
  if (typeof value === 'string') {
    return value.split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b)
  }
  
  const num = parseInt(String(value), 10)
  return isNaN(num) ? [] : [num]
}

/**
 * 比较两个数组是否相等（已排序）
 */
const arraysEqual = (arr1: number[], arr2: number[]): boolean => {
  if (arr1.length !== arr2.length) return false
  return arr1.every((val, index) => val === arr2[index])
}

/** 验证牵头单位和协办单位负责人的必填项 */
const validateLeadDeptRequirements = async (): Promise<boolean> => {
  try {
    // 检查 supervisionDetailRef 是否存在
    if (!props.supervisionDetailRef) {
      return true
    }

    // 检查当前用户身份
    const isLeadDeptLeader = await props.supervisionDetailRef?.checkIsLeadDeptLeader?.()
    const isCoDeptLeader = await props.supervisionDetailRef?.checkIsCoDeptLeader?.()

    // 如果既不是牵头单位负责人也不是协办单位负责人，无需验证
    if (!isLeadDeptLeader && !isCoDeptLeader) {
      return true
    }

    // 获取当前督办单数据
    const orderDetail = props.supervisionDetailRef?.getOrderDetailData?.()
    const editForm = props.supervisionDetailRef?.getEditFormData?.()

    if (!orderDetail) {
      console.warn('无法获取督办单详情数据')
      return true
    }

    // 检查工作推进情况是否已填写（牵头单位负责人和协办单位负责人都必须填写）
    const leadDeptDetail = editForm?.leadDeptDetail || orderDetail.leadDeptDetail

    console.log('牵头单位负责人验证:', {
      isLeadDeptLeader,
      isCoDeptLeader,
      leadDeptDetail,
      editFormLeadDeptDetail: editForm?.leadDeptDetail,
      orderDetailLeadDeptDetail: orderDetail.leadDeptDetail
    })

    if (!leadDeptDetail || leadDeptDetail.trim() === '') {
      if (isLeadDeptLeader) {
        message.error('作为牵头单位负责人，您必须通过"添加工作推进"功能填写工作推进情况后才能通过审批')
      } else if (isCoDeptLeader) {
        message.error('作为协办单位负责人，您必须通过"添加工作推进"功能填写工作推进情况后才能通过审批')
      }
      return false
    }

    // 只有牵头单位负责人才需要检查协办单位选择（可选但需要提醒）
    if (isLeadDeptLeader) {
      const coDept = editForm?.coDept || orderDetail.coDept
      if (!coDept || coDept.trim() === '') {
        try {
          await ElMessageBox.confirm(
            '您还未选择协办单位。协办单位可以协助处理督办事项，建议根据实际情况选择相关部门。\n\n是否确认不选择协办单位并继续审批？',
            '协办单位提醒',
            {
              confirmButtonText: '确认继续',
              cancelButtonText: '取消审批',
              type: 'warning',
              dangerouslyUseHTMLString: false
            }
          )
          return true // 用户确认继续
        } catch {
          return false // 用户取消审批
        }
      }
    }

    return true // 所有验证通过
  } catch (error) {
    console.error('验证牵头单位和协办单位负责人必填项时出错:', error)
    return true // 出错时允许继续，避免阻塞正常流程
  }
}

// ========== 中止/恢复功能 ==========
const handleSignFinish = (url: string) => {
  approveReasonForm.signPicUrl = url
  approveSignFormRef.value.validate('change')
}

// ========== 中止/恢复功能 ==========
/** 处理中止操作 */
const handleSuspend = () => {
  suspendDialogVisible.value = true
}

/** 重置中止弹窗 */
const resetSuspendDialog = () => {
  suspendDialogVisible.value = false
}

/** 确认中止 */
const confirmSuspend = async () => {
  try {
    suspendLoading.value = true

    // 获取督办单ID
    const orderId = props.processInstance?.supervisionOrderId || 
                   props.processInstance?.businessKey
    if (!orderId) {
      ElMessage.error('无法获取督办单ID')
      return
    }

    // 调用中止接口
    await OrderApi.suspendOrder(orderId)
    
    // 立即更新本地状态，避免刷新延迟期间按钮显示错误
    localSupervisionStatus.value = 6
    
    ElMessage.success('已中止督办，只有主任/副主任/管理员可见')
    
    // 关闭弹窗并刷新状态
    resetSuspendDialog()
    emit('success')

  } catch (error) {
    console.error('中止督办失败:', error)
    const errorMsg = extractErrorMessage(error) || '中止督办失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    suspendLoading.value = false
  }
}

/** 处理恢复操作 */
const handleResume = () => {
  resumeDialogVisible.value = true
}

/** 重置恢复弹窗 */
const resetResumeDialog = () => {
  resumeDialogVisible.value = false
}

/** 确认恢复 */
const confirmResume = async () => {
  try {
    resumeLoading.value = true

    // 获取督办单ID
    const orderId = props.processInstance?.supervisionOrderId || 
                   props.processInstance?.businessKey
    if (!orderId) {
      ElMessage.error('无法获取督办单信息')
      return
    }

    // 调用恢复接口
    await OrderApi.resumeOrder(orderId)
    
    // 立即更新本地状态，避免刷新延迟期间按钮显示错误
    localSupervisionStatus.value = 1
    
    ElMessage.success('已恢复督办，相关人员现在可以看到此督办')
    
    // 关闭弹窗并刷新状态
    resetResumeDialog()
    emit('success')

  } catch (error) {
    console.error('恢复督办失败:', error)
    const errorMsg = extractErrorMessage(error) || '恢复督办失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    resumeLoading.value = false
  }
}

/** 检查当前节点是否为督查办管理员节点 */
const checkIsSupervisionAdminNode = (): boolean => {
  if (!runningTask.value) {
    return false
  }

  const taskKey = runningTask.value.taskDefinitionKey || ''

  // 根据 taskDefinitionKey 判断是否为督查办主任或者副主任节点
  return taskKey === 'de_director_check' || taskKey === 'director_check' ||
         taskKey === 'de_director_recheck' || taskKey === 'director_recheck'
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



/** 标准的督办单数据更新流程 */
const handleStandardSupervisionUpdate = async () => {
  // 验证督办详情组件状态
  if (!props.supervisionDetailRef) {
    throw new Error('督办详情组件未加载')
  }

  // 验证牵头单位和协办单位负责人的必填项
  const leadDeptValidation = await validateLeadDeptRequirements()
  if (!leadDeptValidation) return

  // 更新督办单数据（由详情页内部判断是否有实际变更）
  const taskKey = runningTask.value?.taskDefinitionKey || ''
  const updateResult = await props.supervisionDetailRef.updateSupervisionOrder(approveReasonForm.nextAssignees, taskKey)
  if (!updateResult.success) {
    throw new Error('更新督办单数据失败')
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
const openRejectAt = (el: HTMLElement) => {
  if (!runningTask.value || !isHandleTaskStatus()) return
  
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

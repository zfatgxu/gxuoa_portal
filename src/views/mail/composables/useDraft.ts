import { ref, nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createDraft,
  updateDraft,
  getDraft,
  autoSaveDraft as autoSaveDraftAPI,
  type LetterDraftCreateReqVO,
  type LetterDraftUpdateReqVO,
  type LetterDraftRespVO
} from '@/api/mail/draft'
import type { MailForm } from '../types/mail'

/**
 * 草稿管理 Composable
 * 负责草稿的保存、加载、更新等功能
 */
export function useDraft(options: {
  mailForm: Ref<MailForm>
  editorInstance: Ref<any>
  processRecipients: (recipients: string[]) => Promise<string[]>
  replyOriginalIds?: Ref<number[]> // 原始邮件ID列表
  relationType?: Ref<number | null> // 关系类型：1-回复，2-转发
  sharedCurrentDraftId?: Ref<number | null> // 共享的草稿ID（可选）
}) {
  // 状态 - 使用共享的 ref 或创建新的
  const currentDraftId = options.sharedCurrentDraftId || ref<number | null>(null)
  
  /**
   * 保存草稿
   * 返回保存是否成功以及最后保存时间
   */
  const saveDraft = async (): Promise<{ success: boolean; lastSaveTime?: string }> => {
    try {
      // 获取编辑器内容
      let editorContent = ''
      try {
        // 安全地获取编辑器内容
        if (options.editorInstance.value && typeof options.editorInstance.value.getHtml === 'function') {
          editorContent = options.editorInstance.value.getHtml() || ''
        } else {
          // 编辑器未初始化，使用表单中的内容
          editorContent = options.mailForm.value.content || ''
        }
      } catch (e) {
        editorContent = options.mailForm.value.content || ''
      }
      
      const processedRecipients = await options.processRecipients(options.mailForm.value.recipients)
      const processedCc = options.mailForm.value.cc.length > 0 
        ? await options.processRecipients(options.mailForm.value.cc) 
        : []
      const processedBcc = options.mailForm.value.bcc.length > 0 
        ? await options.processRecipients(options.mailForm.value.bcc) 
        : []
      
      const recipients: Array<{ recipientIdCard: string; recipientType: number }> = []
      processedRecipients.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 1 }))
      processedCc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 2 }))
      processedBcc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 3 }))
      
      const baseDraftData: LetterDraftCreateReqVO = {
        subject: options.mailForm.value.subject || '',
        content: editorContent,
        priority: options.mailForm.value.priority || 1,
        requestReadReceipt: options.mailForm.value.requestReadReceipt || false,
        draftStatus: 1,
        scheduledSendTime: null,
        isStarred: false,
        recipients
      }
      
      // 如果有原始邮件ID列表（回复/转发场景），构建关系数据
      const draftDataWithExtras: any = { ...baseDraftData }
      if (options.replyOriginalIds && options.replyOriginalIds.value.length > 0 && options.relationType && options.relationType.value !== null) {
        const relationType = options.relationType.value
        draftDataWithExtras.relations = options.replyOriginalIds.value.map(letterId => ({
          originalLetterId: letterId,
          relationType: relationType,
          remark: null
        }))
      }
      
      let draftId: number
      if (currentDraftId.value) {
        // 更新草稿
        const updateData: LetterDraftUpdateReqVO = { 
          id: currentDraftId.value, 
          ...draftDataWithExtras 
        }
        const ok = await updateDraft(updateData)
        if (ok) {
          ElMessage.success('草稿已更新')
          draftId = currentDraftId.value
        } else {
          ElMessage.warning('草稿未更新')
          return { success: false }
        }
      } else {
        // 创建草稿
        draftId = await createDraft(draftDataWithExtras)
        currentDraftId.value = draftId
        ElMessage.success('草稿已创建并保存')
      }
      
      // 获取草稿详情以获取真实的最后保存时间
      const draftDetail = await getDraft(draftId)
      const lastSaveTime = draftDetail.lastSaveTime || ''
      
      return { success: true, lastSaveTime }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
      ElMessage.error(`保存失败: ${errorMsg}`)
      return { success: false }
    }
  }
  
  /**
   * 加载草稿
   * 返回原始邮件ID列表、关系类型和最后保存时间（如果有）
   */
  const loadDraft = async (draftId: number): Promise<{ success: boolean; replyOriginalIds?: number[]; relationType?: number; lastSaveTime?: string }> => {
    try {
      const draft: LetterDraftRespVO = await getDraft(draftId)
      
      // 设置当前草稿ID
      currentDraftId.value = draft.id
      
      // 填充表单数据
      options.mailForm.value.subject = draft.subject || ''
      options.mailForm.value.content = draft.content || ''
      options.mailForm.value.requestReadReceipt = draft.requestReadReceipt || false
      options.mailForm.value.priority = draft.priority || 1
      
      // 设置编辑器内容
      if (options.editorInstance.value && draft.content) {
        await nextTick()
        try {
          options.editorInstance.value.setHtml(draft.content)
        } catch (e) {
          // 忽略设置失败
        }
      }
      
      const toList: string[] = []
      const ccList: string[] = []
      const bccList: string[] = []
      
      if (Array.isArray(draft.recipients)) {
        draft.recipients.forEach(r => {
          const display = r.recipientName || r.recipientIdCard
          
          if (r.recipientType === 1) toList.push(display)
          else if (r.recipientType === 2) ccList.push(display)
          else if (r.recipientType === 3) bccList.push(display)
        })
      }
      
      options.mailForm.value.recipients = toList
      options.mailForm.value.cc = ccList
      options.mailForm.value.bcc = bccList
      
      // 加载草稿的附件ID（如果有）
      const draftAttachmentIds = (draft as any).attachmentIds
      if (draftAttachmentIds && Array.isArray(draftAttachmentIds)) {
        options.mailForm.value.attachmentIds = draftAttachmentIds
      }
      
      // 提取原始邮件关系列表（回复/转发场景）
      const relations = (draft as any).relations
      let replyOriginalIds: number[] | undefined
      let relationType: number | undefined
      
      if (relations && Array.isArray(relations) && relations.length > 0) {
        replyOriginalIds = relations.map((r: any) => r.originalLetterId)
        // 取第一个关系的类型（通常同一个草稿的关系类型是一致的）
        relationType = relations[0].relationType
      }
      
      // 获取最后保存时间
      const lastSaveTime = draft.lastSaveTime || ''
      
      ElMessage.success('已加载草稿')
      return { 
        success: true, 
        replyOriginalIds,
        relationType,
        lastSaveTime
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '加载草稿失败'
      ElMessage.error(errorMsg)
      return { success: false }
    }
  }
  
  /**
   * 自动保存草稿（轻量级保存，只保存内容，不保存收件人和附件）
   * 返回保存是否成功以及最后保存时间
   */
  const autoSaveDraft = async (): Promise<{ success: boolean; lastSaveTime?: string }> => {
    // 必须有草稿ID才能自动保存
    if (!currentDraftId.value) {
      console.warn('[useDraft] 自动保存失败：无草稿ID')
      return { success: false }
    }
    
    try {
      // 获取编辑器内容
      let editorContent = ''
      try {
        if (options.editorInstance.value && typeof options.editorInstance.value.getHtml === 'function') {
          editorContent = options.editorInstance.value.getHtml() || ''
        } else {
          editorContent = options.mailForm.value.content || ''
        }
      } catch (e) {
        editorContent = options.mailForm.value.content || ''
      }
      
      // 调用自动保存 API（只保存基本内容）
      const success = await autoSaveDraftAPI({
        id: currentDraftId.value,
        subject: options.mailForm.value.subject || '',
        content: editorContent,
        priority: options.mailForm.value.priority || 1,
        requestReadReceipt: options.mailForm.value.requestReadReceipt || false
      })
      
      if (success) {
        // 获取草稿详情以获取真实的保存时间
        const draftDetail = await getDraft(currentDraftId.value)
        const lastSaveTime = draftDetail.lastSaveTime || ''
        
        return { success: true, lastSaveTime }
      } else {
        return { success: false }
      }
    } catch (error: any) {
      console.error('[useDraft] 自动保存失败:', error)
      return { success: false }
    }
  }
  
  /**
   * 清除草稿状态
   */
  const clearDraft = () => {
    currentDraftId.value = null
  }
  
  return {
    currentDraftId,
    saveDraft,
    loadDraft,
    autoSaveDraft,
    clearDraft
  }
}


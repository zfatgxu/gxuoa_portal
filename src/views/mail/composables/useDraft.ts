import { ref, nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createDraft,
  updateDraft,
  getDraft,
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
}) {
  // 状态
  const currentDraftId = ref<number | null>(null)
  
  /**
   * 保存草稿
   */
  const saveDraft = async (): Promise<boolean> => {
    try {
      // 获取编辑器内容
      const editorContent = options.editorInstance.value?.getHtml() || options.mailForm.value.content
      
      // 处理收件人
      const processedRecipients = await options.processRecipients(options.mailForm.value.recipients)
      const processedCc = options.mailForm.value.cc.length > 0 
        ? await options.processRecipients(options.mailForm.value.cc) 
        : []
      const processedBcc = options.mailForm.value.bcc.length > 0 
        ? await options.processRecipients(options.mailForm.value.bcc) 
        : []
      
      // 组装收件人数组
      const recipients: Array<{ recipientIdCard: string; recipientType: number }> = []
      processedRecipients.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 1 }))
      processedCc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 2 }))
      processedBcc.forEach(idCard => recipients.push({ recipientIdCard: idCard, recipientType: 3 }))
      
      const baseDraftData: LetterDraftCreateReqVO = {
        subject: options.mailForm.value.subject || '',
        content: editorContent || '',
        priority: 1,
        requestReadReceipt: false,
        draftStatus: 1,
        scheduledSendTime: null,
        isStarred: false,
        recipients
      }
      
      console.log('保存草稿数据:', baseDraftData)
      console.log('📝 草稿HTML内容预览:', editorContent)
      console.log('📎 草稿附件ID列表:', options.mailForm.value.attachmentIds)
      
      if (currentDraftId.value) {
        // 更新草稿
        const updateData: LetterDraftUpdateReqVO = { 
          id: currentDraftId.value, 
          ...baseDraftData 
        }
        const ok = await updateDraft(updateData)
        if (ok) {
          ElMessage.success('草稿已更新')
        } else {
          ElMessage.warning('草稿未更新')
        }
      } else {
        // 创建草稿
        currentDraftId.value = await createDraft(baseDraftData)
        ElMessage.success('草稿已创建并保存')
      }
      
      return true
    } catch (error: any) {
      console.error('保存草稿失败:', error)
      const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
      ElMessage.error(`保存失败: ${errorMsg}`)
      return false
    }
  }
  
  /**
   * 加载草稿
   */
  const loadDraft = async (draftId: number): Promise<boolean> => {
    try {
      const draft: LetterDraftRespVO = await getDraft(draftId)
      
      // 设置当前草稿ID
      currentDraftId.value = draft.id
      
      // 填充表单数据
      options.mailForm.value.subject = draft.subject || ''
      options.mailForm.value.content = draft.content || ''
      
      // 设置编辑器内容
      if (options.editorInstance.value && draft.content) {
        await nextTick()
        try {
          options.editorInstance.value.setHtml(draft.content)
        } catch (e) {
          console.warn('设置编辑器内容失败:', e)
        }
      }
      
      // 解析收件人
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
      
      ElMessage.success('已加载草稿')
      return true
    } catch (error: any) {
      console.error('加载草稿失败:', error)
      const errorMsg = error?.response?.data?.message || error?.message || '加载草稿失败'
      ElMessage.error(errorMsg)
      return false
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
    clearDraft
  }
}


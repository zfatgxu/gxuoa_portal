import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  sendLetter,
  replyLetter,
  forwardLetter,
  type LetterSendReqVO,
  type LetterReplyReqVO,
  type LetterForwardReqVO
} from '@/api/mail/letter'
import { sendDraft as sendDraftAPI } from '@/api/mail/draft'
import type { MailForm } from '../types/mail'
import { isIdCardFormat } from '../utils/mailHelpers'

/**
 * 邮件发送 Composable
 * 负责邮件发送、收件人处理、表单验证等功能
 */
export function useMailSend(options: {
  mailForm: Ref<MailForm>
  editorInstance: Ref<any>
  attachmentIds: Ref<number[]>
  allUsers: Ref<any[]>
  currentDraftId?: Ref<number | null>
}) {
  // 状态
  const sending = ref(false)
  const loading = ref(false)
  
  /**
   * 处理收件人：将姓名转换为身份证号
   */
  const processRecipients = async (recipients: string[]): Promise<string[]> => {
    const processedIdCards: string[] = []
    const errors: string[] = []
    
    const users = options.allUsers.value
    
    if (!users || users.length === 0) {
      throw new Error('用户列表未加载，无法处理收件人')
    }
    
    for (const recipient of recipients) {
      const isIdCard = isIdCardFormat(recipient)
      
      if (isIdCard) {
        processedIdCards.push(recipient)
      } else {
        const user = users.find((u: any) => 
          u.nickname === recipient || 
          u.id?.toString() === recipient ||
          (u.nickname && u.nickname.toLowerCase().includes(recipient.toLowerCase()))
        )
        
        if (user) {
          if (user.idCard) {
            processedIdCards.push(user.idCard)
          } else {
            errors.push(`用户 "${recipient}" 缺少身份证号信息`)
          }
        } else {
          errors.push(`找不到用户 "${recipient}"`)
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
    
    return processedIdCards
  }
  
  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    if (!options.mailForm.value.recipients.length) {
      ElMessage.warning('请选择收件人')
      return false
    }
    return true
  }
  
  /**
   * 发送邮件
   */
  const sendMail = async (
    type?: 'send' | 'reply' | 'forward',
    replyId?: number
  ): Promise<boolean> => {
    try {
      sending.value = true
      loading.value = true
      
      // 验证表单
      if (!validateForm()) {
        return false
      }
      
      // 检查是否是从草稿发送
      const draftId = options.currentDraftId?.value
      if (draftId) {
        await sendDraftAPI({ id: draftId, sendNow: true })
        ElMessage.success('草稿发送成功')
        return true
      }
      
      // 获取编辑器内容
      const editorContent = options.editorInstance.value?.getHtml() || options.mailForm.value.content
      
      // 处理收件人
      const processedRecipients = await processRecipients(options.mailForm.value.recipients)
      const processedCc = options.mailForm.value.cc.length > 0 
        ? await processRecipients(options.mailForm.value.cc) 
        : []
      const processedBcc = options.mailForm.value.bcc.length > 0 
        ? await processRecipients(options.mailForm.value.bcc) 
        : []
      
      // 构造基础发送数据
      const base = {
        subject: options.mailForm.value.subject || '(无主题)',
        content: editorContent,
        priority: 1,
        requestReadReceipt: false,
        recipientIdCards: processedRecipients,
        ccIdCards: processedCc.length > 0 ? processedCc : undefined,
        bccIdCards: processedBcc.length > 0 ? processedBcc : undefined,
        attachmentIds: options.attachmentIds.value.length > 0 ? options.attachmentIds.value : undefined
      }
      
      // 根据类型调用不同的API
      if (type === 'reply' && replyId) {
        const data: LetterReplyReqVO = {
          originalLetterId: replyId,
          ...base
        }
        await replyLetter(data)
        ElMessage.success('回复发送成功')
      } else if (type === 'forward' && replyId) {
        const data: LetterForwardReqVO = {
          originalLetterId: replyId,
          ...base
        }
        await forwardLetter(data)
        ElMessage.success('转发发送成功')
      } else {
        const sendData: LetterSendReqVO = base
        await sendLetter(sendData)
        ElMessage.success('邮件发送成功')
      }
      
      return true
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试'
      ElMessage.error(`发送失败: ${errorMsg}`)
      return false
    } finally {
      sending.value = false
      loading.value = false
    }
  }
  
  return {
    sending,
    loading,
    sendMail,
    processRecipients,
    validateForm
  }
}


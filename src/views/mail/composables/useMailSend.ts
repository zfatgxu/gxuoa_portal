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
}) {
  // 状态
  const sending = ref(false)
  const loading = ref(false)
  
  /**
   * 处理收件人：将姓名转换为身份证号
   */
  const processRecipients = async (recipients: string[]): Promise<string[]> => {
    const processedIdCards: string[] = []
    
    try {
      const users = options.allUsers.value
      console.log('📋 使用用户列表处理收件人:', users)
      
      for (const recipient of recipients) {
        console.log(`🔍 处理收件人: "${recipient}"`)
        
        // 检查是否已经是身份证号格式
        if (isIdCardFormat(recipient)) {
          console.log(`✅ 身份证号格式，直接添加: ${recipient}`)
          processedIdCards.push(recipient)
        } else {
          // 如果是姓名或用户ID，尝试查找对应的身份证号
          const user = users.find((u: any) => 
            u.nickname === recipient || 
            u.id?.toString() === recipient ||
            (u.nickname && u.nickname.toLowerCase().includes(recipient.toLowerCase()))
          )
          if (user && user.idCard) {
            console.log(`✅ 通过姓名/ID找到用户身份证号: ${user.idCard}`)
            processedIdCards.push(user.idCard)
          } else {
            console.log(`⚠️ 通过姓名/ID未找到用户，使用原始值: ${recipient}`)
            processedIdCards.push(recipient)
          }
        }
      }
      
      console.log('📤 处理后的收件人身份证号列表:', processedIdCards)
    } catch (error) {
      console.error('❌ 处理收件人失败，使用原始信息:', error)
      return recipients
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
      
      console.log('📧 构造发送数据:', base)
      
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
      console.error('发送邮件失败:', error)
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


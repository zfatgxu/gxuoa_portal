import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Email } from '../types/mail'
import { getLetterDetail, sendReadReceipt } from '@/api/mail/letter'
import { useUserStore } from '@/store/modules/user'
import { useUserCache } from './useUserCache'
import { formatDisplayTime } from '../utils/mailHelpers'

interface OriginalMail {
  id: number
  subject: string
  fromUserName?: string
  toUserNames?: string
  toRecipients?: string
  ccRecipients?: string
  bccRecipients?: string
  sendTime?: string
  attachments?: any[]
}

export function useMailDetail() {
  const userStore = useUserStore()
  const { getUserByIdCardCached } = useUserCache()

  // 邮件详情显示相关
  const selectedEmailDetail = ref<Email | null>(null)
  const senderAvatar = ref<string>('')
  const avatarLoading = ref<boolean>(false)
  const isLoadingAttachments = ref<boolean>(false)

  // 原始邮件详情（用于回复/转发时展示）
  const originalMail = ref<OriginalMail | null>(null)
  const originalMailHtml = ref<string>('')

  // 已读回执：记录已经显示过弹窗的邮件ID
  const readReceiptShownIds = ref<Set<number>>(new Set())

  /**
   * 加载发件人头像
   */
  const loadSenderAvatar = async (emailDetail: any) => {
    if (senderAvatar.value) {
      return
    }

    try {
      avatarLoading.value = true

      let senderIdCard = ''

      if (emailDetail.senders && emailDetail.senders.length > 0) {
        senderIdCard = emailDetail.senders[0].senderIdCard
      }

      if (!senderIdCard) {
        senderIdCard = emailDetail.fromUserIdCard || emailDetail.fromIdCard || ''
      }

      if (senderIdCard) {
        const userDetail = await getUserByIdCardCached(senderIdCard)
        senderAvatar.value = userDetail && userDetail.avatar ? userDetail.avatar : ''
      } else {
        senderAvatar.value = ''
      }
    } catch (error: any) {
      senderAvatar.value = ''
    } finally {
      avatarLoading.value = false
    }
  }

  /**
   * 解析收件人信息
   */
  const parseRecipients = async (recipients: string): Promise<string> => {
    if (!recipients) return ''

    const recipientList = recipients.split(',').map(r => r.trim())

    const idCardRecipients: string[] = []
    const otherRecipients: string[] = []

    recipientList.forEach(recipient => {
      if (!recipient) return

      if (/^\d{18}$/.test(recipient)) {
        idCardRecipients.push(recipient)
      } else {
        otherRecipients.push(recipient)
      }
    })

    const userDetailPromises = idCardRecipients.map(async (idCard) => {
      try {
        const userDetail = await getUserByIdCardCached(idCard)
        return userDetail && userDetail.nickname ? userDetail.nickname : null
      } catch (error) {
        return null
      }
    })

    const parsedIdCardNames = await Promise.all(userDetailPromises)
    const validNames = parsedIdCardNames.filter(name => name !== null)

    const allNames = [...otherRecipients, ...validNames]
    return allNames.join(', ')
  }

  /**
   * 更新邮件详情
   */
  const updateEmailDetail = async (emailDetail: any) => {
    if (emailDetail && selectedEmailDetail.value) {
      const currentDetail = selectedEmailDetail.value
      const rawContent = emailDetail.content?.content || emailDetail.content || ''
      const originalSendTime = emailDetail.content?.sendTime || emailDetail.sendTime || currentDetail.originalSendTime
      const hasAttachments = emailDetail.attachments && emailDetail.attachments.length > 0

      if (hasAttachments && !currentDetail.attachments?.length) {
        isLoadingAttachments.value = true
      }

      // 先解析收件人信息，按类型分组
      let parsedToRecipients = ''
      let parsedCcRecipients = ''
      let parsedBccRecipients = ''

      if (emailDetail.recipients && Array.isArray(emailDetail.recipients)) {
        // 按 recipientType 分组
        const toRecipients: string[] = []
        const ccRecipients: string[] = []
        const bccRecipients: string[] = []

        emailDetail.recipients.forEach((r: any) => {
          const idCard = r.recipientIdCard
          if (!idCard) return

          const recipientType = r.recipientType || 1 // 默认为主收件人
          if (recipientType === 1) {
            toRecipients.push(idCard)
          } else if (recipientType === 2) {
            ccRecipients.push(idCard)
          } else if (recipientType === 3) {
            bccRecipients.push(idCard)
          }
        })

        // 解析每组收件人的姓名
        try {
          if (toRecipients.length > 0) {
            parsedToRecipients = await parseRecipients(toRecipients.join(', '))
          }
          if (ccRecipients.length > 0) {
            parsedCcRecipients = await parseRecipients(ccRecipients.join(', '))
          }
          if (bccRecipients.length > 0) {
            parsedBccRecipients = await parseRecipients(bccRecipients.join(', '))
          }
        } catch (error) {
          // 忽略解析失败
        }
      }

      // 兼容旧数据：如果没有 recipients 数组，尝试使用 toMail
      let parsedToMail = currentDetail.toMail || '无'
      if (!parsedToRecipients && !parsedCcRecipients && !parsedBccRecipients) {
        const recipientsStr = emailDetail.toMail || ''
        if (recipientsStr && recipientsStr !== currentDetail.toMail) {
          try {
            parsedToMail = await parseRecipients(recipientsStr)
            parsedToRecipients = parsedToMail
          } catch (error) {
            parsedToMail = currentDetail.toMail || '无'
          }
        }
      }

      // 数据准备完成后，一次性更新所有信息，移除加载状态
      selectedEmailDetail.value = {
        ...currentDetail,
        ...emailDetail,
        content: rawContent,
        priority: emailDetail.content?.priority,
        requestReadReceipt: emailDetail.content?.requestReadReceipt,
        attachments: emailDetail.attachments || [],
        originalSendTime: originalSendTime,
        toMail: parsedToMail,
        toRecipients: parsedToRecipients || undefined,
        ccRecipients: parsedCcRecipients || undefined,
        bccRecipients: parsedBccRecipients || undefined,
        isLoading: false // 移除加载状态
      }

      if (hasAttachments) {
        isLoadingAttachments.value = false
      }

      if (emailDetail.senders && emailDetail.senders.length > 0) {
        const sender = emailDetail.senders[0]
        const senderIdCard = sender.senderIdCard

        if (senderIdCard) {
          try {
            const userDetail = await getUserByIdCardCached(senderIdCard)
            if (userDetail && userDetail.nickname && selectedEmailDetail.value) {
              selectedEmailDetail.value.sender = userDetail.nickname
            }
          } catch (error) {
            // 获取失败时保持原有值
          }
        }
      }

      loadSenderAvatar(emailDetail)

      // 如果是回复/转发场景，尝试加载原始邮件详情展示
      try {
        const maybeOriginalId =
          emailDetail.originalLetterId || emailDetail.content?.originalLetterId || emailDetail.content?.originalId
        if (maybeOriginalId) {
          const detail = await getLetterDetail(Number(maybeOriginalId))
          if (detail) {
            // 构造原始邮件展示数据
            const oSubject = detail?.content?.subject || (detail as any).subject || ''
            const oSendTime = detail?.content?.sendTime || ''
            originalMail.value = {
              id: Number(maybeOriginalId),
              subject: oSubject,
              fromUserName: '',
              toUserNames: '',
              sendTime: oSendTime,
              attachments: Array.isArray((detail as any).attachments) ? (detail as any).attachments : []
            }
            // 计算原始正文 HTML
            try {
              const c: any = (detail as any)?.content
              const html = c && (c.content || c.html) ? c.content || c.html : typeof c === 'string' ? c : ''
              originalMailHtml.value = html || ''
            } catch {
              originalMailHtml.value = ''
            }

            // 发件人：从 senders 取第一个的身份证号查询姓名
            try {
              let firstSenderId = ''
              if (Array.isArray((detail as any).senders) && (detail as any).senders.length > 0) {
                firstSenderId = (detail as any).senders[0]?.senderIdCard || ''
              }
              if (firstSenderId) {
                const u = await getUserByIdCardCached(firstSenderId)
                if (originalMail.value) originalMail.value.fromUserName = u && u.nickname ? u.nickname : ''
              }
            } catch {}

            // 收件人：从 recipients[].recipientIdCard 获取姓名并拼接，按类型分组
            try {
              const recipientsArr = (detail as any)?.recipients
              if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
                const toNames: string[] = []
                const ccNames: string[] = []
                const bccNames: string[] = []

                for (const r of recipientsArr) {
                  const idCard = (r?.recipientIdCard || '').toString().trim()
                  const recipientType = r?.recipientType || 1
                  if (idCard) {
                    const u = await getUserByIdCardCached(idCard)
                    const displayName = u?.nickname || idCard

                    if (recipientType === 1) {
                      toNames.push(displayName)
                    } else if (recipientType === 2) {
                      ccNames.push(displayName)
                    } else if (recipientType === 3) {
                      bccNames.push(displayName)
                    }
                  }
                }
                if (originalMail.value) {
                  originalMail.value.toUserNames = toNames.join('、')
                  originalMail.value.toRecipients = toNames.join('、') || undefined
                  originalMail.value.ccRecipients = ccNames.join('、') || undefined
                  originalMail.value.bccRecipients = bccNames.join('、') || undefined
                }
              }
            } catch {}
          }
        } else {
          originalMail.value = null
          originalMailHtml.value = ''
        }
      } catch (e) {
        originalMail.value = null
        originalMailHtml.value = ''
      }

      // 检查是否需要显示已读回执弹窗
      const letterId = emailDetail.id || emailDetail.content?.id
      const requestReadReceipt = emailDetail.content?.requestReadReceipt

      if (letterId && requestReadReceipt && !readReceiptShownIds.value.has(letterId)) {
        // 检查当前用户是否是发件人
        const currentUserIdCard = userStore.getUser?.idCard
        const senders = emailDetail.senders || []
        const isSender = senders.some((sender: any) => sender.senderIdCard === currentUserIdCard)

        // 如果当前用户是发件人，不显示回执弹窗
        if (isSender) {
          // 标记为已显示，避免下次还判断
          readReceiptShownIds.value.add(letterId)
          return
        }

        // 检查当前用户是否是主收件人（recipientType=1）
        // 只有主收件人才需要发送已读回执，抄送人和密送人不需要
        const recipients = emailDetail.recipients || []
        const isMainRecipient = recipients.some(
          (recipient: any) => recipient.recipientIdCard === currentUserIdCard && recipient.recipientType === 1
        )

        if (!isMainRecipient) {
          // 当前用户不是主收件人，不显示回执弹窗
          readReceiptShownIds.value.add(letterId)
          return
        }

        // 标记为已显示，避免重复弹窗
        readReceiptShownIds.value.add(letterId)

        // 延迟一下显示弹窗，让邮件内容先加载完成
        setTimeout(async () => {
          try {
            await ElMessageBox.confirm('发件人请求已读回执。是否向发件人发送已读回执通知？', '已读回执', {
              confirmButtonText: '发送',
              cancelButtonText: '不发送',
              type: 'info',
              distinguishCancelAndClose: true
            })

            // 用户同意发送回执
            try {
              await sendReadReceipt(letterId)
              ElMessage.success('已发送已读回执')
            } catch (error: any) {
              const errorMsg = error?.response?.data?.message || error?.message || '发送已读回执失败'
              ElMessage.error(errorMsg)
            }
          } catch (action) {
            // 用户取消或关闭弹窗，不做任何操作
            if (action === 'cancel') {
              ElMessage.info('已取消发送已读回执')
            }
          }
        }, 500)
      }
    }
  }

  /**
   * 关闭邮件详情
   */
  const closeEmailDetail = () => {
    selectedEmailDetail.value = null
    senderAvatar.value = ''
    avatarLoading.value = false
    originalMail.value = null
    originalMailHtml.value = ''
  }

  /**
   * 查看邮件详情（设置初始状态）
   */
  const viewEmailDetail = (email: Email) => {
    // 设置加载状态，不立即显示详情
    selectedEmailDetail.value = {
      ...email,
      content: '',
      originalSendTime: email.time,
      toMail: email.toMail || '无',
      attachments: [],
      priority: undefined,
      requestReadReceipt: undefined,
      isLoading: true // 添加加载状态标识
    }

    senderAvatar.value = ''
    avatarLoading.value = false
  }

  return {
    // 状态
    selectedEmailDetail,
    senderAvatar,
    avatarLoading,
    isLoadingAttachments,
    originalMail,
    originalMailHtml,

    // 方法
    updateEmailDetail,
    closeEmailDetail,
    viewEmailDetail,
    formatDisplayTime
  }
}


import type { MailListItemVO } from '@/api/mail/letter'
import { formatMailTime } from './mailHelpers'

/**
 * Email 类型定义
 */
export interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string
  deletedAt?: string
  isDraft?: boolean
  isStarred?: boolean
  starredAt?: string
  fromMail?: string
  toMail?: string
  content?: string
  isRead?: boolean
  isTrash?: boolean
  trashTime?: string
  isSelfSent?: boolean
  isLoading?: boolean
}

/**
 * 解析收件人信息，将身份证号转换为真实姓名
 */
export async function parseRecipients(
  recipients: string,
  getUserDetailByIdCard: (idCard: string) => Promise<any>
): Promise<string> {
  if (!recipients) return '无'
  
  const recipientList = recipients.split(',').map(r => r.trim())
  const parsedNames: string[] = []
  
  for (const recipient of recipientList) {
    if (!recipient) continue
    
    // 判断是否为身份证号（18位数字）
    if (/^\d{18}$/.test(recipient)) {
      const userDetail = await getUserDetailByIdCard(recipient)
      if (userDetail && userDetail.nickname) {
        parsedNames.push(userDetail.nickname)
      } else {
        parsedNames.push(recipient)
      }
    } else {
      parsedNames.push(recipient)
    }
  }
  
  return parsedNames.join(', ')
}

/**
 * 解析邮件内容，处理HTML标签和格式
 */
export function parseEmailContent(content: string): string {
  if (!content) return '无内容'
  
  // 创建一个临时的div元素来解析HTML
  const temp = document.createElement('div')
  temp.innerHTML = content
  
  // 获取纯文本内容
  let textContent = temp.textContent || temp.innerText || ''
  
  // 清理多余的空白字符
  textContent = textContent.replace(/\s+/g, ' ').trim()
  
  // 处理换行符
  textContent = textContent.replace(/\n\s*\n/g, '\n\n')
  
  // 处理特殊字符
  textContent = textContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  return textContent
}

/**
 * 格式化邮件内容，添加适当的换行和段落
 */
export function formatEmailContent(content: string): string {
  if (!content) return '无内容'
  
  const parsedContent = parseEmailContent(content)
  
  const formattedContent = parsedContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n')
  
  if (!formattedContent.trim()) {
    return '无内容'
  }
  
  return formattedContent
}

/**
 * 转换后端邮件数据为前端格式
 */
export async function convertMailToEmail(
  mail: MailListItemVO,
  options: {
    parseRecipients: (recipients: string) => Promise<string>
    formatEmailContent: (content: string) => string
    currentUserIdCard: string
  }
): Promise<Email> {
  const date = mail.sendTime
  const dateStr = new Date(date).toISOString().split('T')[0]
  
  // 使用统一的时间格式化函数
  const displayTime = formatMailTime(date)
  
  // 解析收件人信息
  const parsedToMail = await options.parseRecipients(mail.toUserNames || '')
  
  // 解析邮件内容
  const formattedContent = options.formatEmailContent(mail.content || '')
  
  // 识别是否自己发送
  const fromUserIdCard = (mail as any).fromUserIdCard || (mail as any).fromIdCard || ''
  const isSelfSent = fromUserIdCard && options.currentUserIdCard && fromUserIdCard === options.currentUserIdCard
  
  const result = {
    id: mail.id,
    sender: mail.fromUserName,
    subject: mail.subject,
    time: displayTime,
    date: dateStr,
    deletedAt: mail.deletedAt ? new Date(mail.deletedAt).toISOString().split('T')[0] : undefined,
    isDraft: (mail as any).isDraft || false,
    isStarred: mail.isStarred,
    starredAt: mail.starredAt ? new Date(mail.starredAt).toISOString().split('T')[0] : undefined,
    fromMail: mail.fromUserName,
    toMail: parsedToMail,
    content: formattedContent,
    isRead: mail.isRead,
    isTrash: mail.isTrash || false,
    trashTime: mail.trashTime ? new Date(mail.trashTime).toISOString().split('T')[0] : undefined,
    isSelfSent
  }
  
  return result
}


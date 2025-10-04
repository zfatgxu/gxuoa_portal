import type { LetterContactStarRespVO } from '@/api/mail/letter'
import type { LetterAttachmentRespVO } from '@/api/mail/attachment'

/**
 * 邮件表单数据
 */
export interface MailForm {
  recipients: string[]        // 收件人列表
  cc: string[]                // 抄送人列表
  bcc: string[]               // 密送人列表
  subject: string             // 邮件主题
  content: string             // 邮件内容（HTML）
  attachments: File[]         // 本地文件列表（待上传）
  attachmentIds: number[]     // 已上传的附件ID列表
}

/**
 * 原始邮件信息（用于回复/转发场景）
 */
export interface OriginalMailInfo {
  id: number
  subject: string
  fromUserName?: string
  toUserNames?: string
  sendTime?: string
  content?: string
  attachments?: LetterAttachmentRespVO[]
}

/**
 * 右键菜单状态
 */
export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  contact: any
  type: 'recent' | 'starred'
}

/**
 * 联系人选项
 */
export interface UserOption {
  value: string              // 用户ID（字符串形式）
  label: string              // 显示标签
  avatar: string             // 头像URL
  name: string               // 用户姓名
  userId: number             // 用户ID（数字形式）
  deptName: string           // 部门名称
  workId?: string            // 工号
  email?: string             // 邮箱
}

/**
 * 最近联系人
 */
export interface RecentContact {
  name: string               // 联系人姓名
  lastSendTime: string       // 最后发送时间
  sendCount: number          // 发送次数
  idCard?: string            // 身份证号
}

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  valid: boolean
  message: string
}

/**
 * 附件上传配置
 */
export interface AttachmentConfig {
  maxFileSize: number        // 单个文件最大大小（字节）
  maxTotalSize: number       // 总大小限制（字节）
  maxFileCount: number       // 最大文件数量
  allowedTypes: string[]     // 允许的MIME类型
  allowedExtensions: string[] // 允许的文件扩展名
}


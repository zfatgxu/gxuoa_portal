import request from '@/config/axios'
import type {PageParam} from '@/api/supervision'

// ==================== 信件内容相关VO ====================

// 信件内容响应VO - 对应后端 LetterContentRespVO
export interface LetterContentRespVO {
  id: number                   // 信件ID
  subject: string              // 信件主题
  content: string              // 信件内容
  priority: number             // 优先级(1-普通,2-重要,3-紧急)
  status: number               // 信件状态(0-正常,1-撤回)
  requestReadReceipt: boolean  // 是否请求已读回执
  sendTime: string             // 发送时间
  creator: string              // 创建者
  createTime: string           // 创建时间
  updater: string              // 更新者
  updateTime: string           // 更新时间
  tenantId: number             // 租户编号
}


// ==================== 收件人相关VO ====================

// 收件人关联响应VO - 对应后端 LetterRecipientRespVO
export interface LetterRecipientRespVO {
  id: number                   // 记录ID
  letterId: number             // 信件ID
  userId: number               // 用户ID
  userName: string             // 用户姓名
  recipientIdCard: string      // 收件人身份证号
  recipientType: number        // 收件人类型(1-主收件人,2-抄送人)
  isRead: boolean              // 是否已读
  isDeleted: boolean           // 是否丢弃
  isStarred: boolean           // 是否标星
  readTime: string             // 阅读时间
  deletedTime: string          // 丢弃时间
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
  tenantId: number             // 租户编号
}

// 收件人状态更新请求VO - 对应后端 LetterRecipientUpdateReqVO
export interface LetterRecipientUpdateReqVO {
  id: number                   // 记录ID
  isRead?: boolean             // 是否已读
  isDeleted?: boolean          // 是否丢弃
  isStarred?: boolean          // 是否标星
}

// 收件人分页查询请求VO - 对应后端 LetterRecipientPageReqVO
export interface LetterRecipientPageReqVO extends PageParam {
  letterId?: number            // 信件ID
  recipientIdCard?: string     // 收件人身份证号
  recipientType?: number       // 收件人类型
  isRead?: boolean             // 是否已读
  isDeleted?: boolean          // 是否丢弃
  isStarred?: boolean          // 是否标星
}

// ==================== 发件人相关VO ====================

// 发件人关联响应VO - 对应后端 LetterSenderRespVO
export interface LetterSenderRespVO {
  id: number                   // 记录ID
  letterId: number             // 信件ID
  userId: number               // 用户ID
  userName: string             // 用户姓名
  senderIdCard: string         // 发件人身份证号
  isRead: boolean              // 是否已读
  isDeleted: boolean           // 是否丢弃
  isStarred: boolean           // 是否标星
  readTime: string             // 阅读时间
  deletedTime: string          // 丢弃时间
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
  tenantId: number             // 租户编号
}

// 发件人状态更新请求VO - 对应后端 LetterSenderUpdateReqVO
export interface LetterSenderUpdateReqVO {
  id: number                   // 记录ID
  isRead?: boolean             // 是否已读
  isDeleted?: boolean          // 是否丢弃
  isStarred?: boolean          // 是否标星
}

// 发件人分页查询请求VO - 对应后端 LetterSenderPageReqVO
export interface LetterSenderPageReqVO extends PageParam {
  letterId?: number            // 信件ID
  senderIdCard?: string        // 发件人身份证号
  isRead?: boolean             // 是否已读
  isDeleted?: boolean          // 是否丢弃
  isStarred?: boolean          // 是否标星
}

// ==================== 联系人星标相关VO ====================

// 联系人星标响应VO - 对应后端 LetterContactStarRespVO
export interface LetterContactStarRespVO {
  id: number                   // 记录ID
  userIdCard: string           // 用户身份证号
  contactIdCard: string        // 联系人身份证号
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
  tenantId: number             // 租户编号
}

// 联系人星标创建请求VO - 对应后端 LetterContactStarCreateReqVO
export interface LetterContactStarCreateReqVO {
  userId: number               // 用户ID
  userName: string             // 用户姓名
  contactIdCard: string        // 联系人身份证号
  remark: string               // 备注
}

// 联系人星标分页查询请求VO - 对应后端 LetterContactStarPageReqVO
export interface LetterContactStarPageReqVO extends PageParam {
  userName?: string            // 用户姓名
  contactIdCard?: string       // 联系人身份证号
}

// ==================== 综合详情VO ====================

// 用户信件状态VO - 对应后端 UserLetterStatusVO
export interface UserLetterStatusVO {
  userIdCard: string           // 用户身份证号
  userRole: number             // 用户角色(1-发件人,2-收件人,3-抄送人)
  isRead: boolean              // 是否已读
  isDeleted: boolean           // 是否丢弃
  isStarred: boolean           // 是否标星
  readTime: string             // 阅读时间
  deletedTime: string          // 丢弃时间
}

// 信件详情响应VO - 对应后端 LetterDetailRespVO
export interface LetterDetailRespVO {
  content: LetterContentRespVO        // 信件内容信息
  senders: LetterSenderRespVO[]       // 发件人信息列表
  recipients: LetterRecipientRespVO[] // 收件人信息列表
  attachments: MailAttachmentRespVO[] // 附件信息列表
  userStatus: UserLetterStatusVO      // 当前用户状态
  isTrash: boolean                    // 是否在垃圾箱
  trashTime: string                   // 移入垃圾箱时间
}

// ==================== 邮件附件相关VO ====================

// 邮件附件响应VO - 对应后端 MailAttachmentRespVO
export interface MailAttachmentRespVO {
  id: number                   // 附件ID
  mailId: number               // 邮件ID
  fileName: string             // 附件名称
  fileSize: number             // 附件大小
  contentType: string          // 文件类型
  filePath: string             // 文件路径
  downloadUrl: string          // 下载URL
  isInline: boolean            // 是否内嵌
  contentId: string            // 内容ID
  createTime: string           // 创建时间
}

// 附件信息响应VO - 对应后端 AttachmentInfoRespVO
export interface AttachmentInfoRespVO {
  id: number                   // 附件ID
  fileName: string             // 原始文件名
  fileSize: number             // 文件大小(字节)
  fileType: string             // 文件类型(MIME类型)
  fileExtension: string        // 文件扩展名
  uploadUserIdCard: string     // 上传用户身份证号
  uploadTime: string           // 上传时间
  downloadCount: number        // 下载次数
  isTemp: boolean              // 是否临时文件
  tempExpireTime?: string      // 临时文件过期时间
  createTime: string           // 创建时间
}

// 批量删除附件请求VO
export interface BatchDeleteAttachmentReqVO {
  attachmentIds: number[]      // 附件ID列表
}

// 临时附件转正式附件请求VO
export interface ConvertToFormalReqVO {
  attachmentIds: number[]      // 附件ID列表
}

// 附件统计信息响应VO
export interface AttachmentStatsRespVO {
  totalCount: number           // 附件总数量
  totalSize: number            // 附件总大小(字节)
}



// 邮件列表项接口
export interface MailListItemVO {
  id: number                    // 邮件ID
  fromUserId: number            // 发件人用户ID
  fromUserName: string          // 发件人姓名
  toUserIds: string             // 收件人用户ID列表
  toUserNames: string           // 收件人姓名列表
  subject: string               // 邮件主题
  content: string               // 邮件内容
  isRead: boolean               // 是否已读
  isStarred: boolean            // 是否星标
  isTrash: boolean              // 是否在垃圾箱
  trashTime: string             // 移入垃圾箱时间
  starredAt: string             // 星标时间，
  deletedAt: string             // 删除时间
  sendTime: string              // 发送时间
  createTime: string            // 创建时间
  updateTime: string            // 更新时间
}



// 邮件统计信息接口 - 对应后端 MailStatsVO
export interface MailStatsVO {
  inboxCount: number                 // 收件箱邮件数量
  inboxUnreadCount: number           // 收件箱未读邮件数量
  sentCount: number                  // 已发送邮件数量
  draftsCount: number                // 草稿箱邮件数量
  starredCount: number               // 星标邮件数量
  deletedCount: number               // 已删除邮件数量
  trashCount: number                 // 垃圾箱邮件数量
  totalUnreadCount: number           // 总未读邮件数量
  totalCount: number                 // 总邮件数量
}


// ==================== 发信功能相关VO ====================

// 信件发送请求VO - 对应后端 LetterSendReqVO
export interface LetterSendReqVO {
  subject: string                    // 邮件主题，必填
  content: string                    // 邮件内容，必填
  priority?: number                  // 优先级(1-普通,2-重要,3-紧急)，可选
  requestReadReceipt?: boolean       // 是否请求已读回执，可选
  recipientIdCards: string[]         // 收件人身份证号列表，必填
  ccIdCards?: string[]               // 抄送人身份证号列表，可选
  bccIdCards?: string[]              // 密送人身份证号列表，可选
  attachmentIds?: number[]           // 附件ID列表，可选
}

// 搜索信件请求VO
export interface SearchLetterReqVO {
  keyword: string                    // 搜索关键词，必填
  pageNo?: number                    // 页码，可选，默认1
  pageSize?: number                  // 每页大小，可选，默认10
}

// ==================== 信件内容相关API ====================

/**
 * 获取信件详情
 * @param id 信件ID
 * @returns Promise<LetterDetailRespVO>
 */
export const getLetterDetail = async (id: number): Promise<LetterDetailRespVO> => {
  return await request.get({url: `/letter/detail?id=${id}`})
}

/**
 * 搜索信件
 * @param params 搜索参数
 * @returns Promise<{list: LetterContentRespVO[], total: number}>
 */
export const searchLetters = async (params: SearchLetterReqVO): Promise<{list: LetterContentRespVO[], total: number}> => {
  return await request.get({url: '/letter/search', params})
}

// ==================== 收件人相关API ====================

/**
 * 更新收件人状态
 * @param data 更新收件人状态请求参数
 * @returns Promise<boolean>
 */
export const updateLetterRecipient = async (data: LetterRecipientUpdateReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/recipient/update', data })
}

/**
 * 获取收件人分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterRecipientRespVO[], total: number}>
 */
export const getLetterRecipientPage = async (params: LetterRecipientPageReqVO): Promise<{list: LetterRecipientRespVO[], total: number}> => {
  return await request.get({ url: '/letter/recipient/page', params })
}

/**
 * 获取收件人
 * @param id 收件人记录ID
 * @returns Promise<LetterRecipientRespVO>
 */
export const getLetterRecipient = async (id: number): Promise<LetterRecipientRespVO> => {
  return await request.get({ url: `/letter/recipient/get?id=${id}` })
}

// ==================== 发件人相关API ====================

/**
 * 更新发件人状态
 * @param data 更新发件人状态请求参数
 * @returns Promise<boolean>
 */
export const updateLetterSender = async (data: LetterSenderUpdateReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/sender/update', data })
}

/**
 * 获取发件人分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterSenderRespVO[], total: number}>
 */
export const getLetterSenderPage = async (params: LetterSenderPageReqVO): Promise<{list: LetterSenderRespVO[], total: number}> => {
  return await request.get({url: '/letter/sender/page', params})
}

/**
 * 获取发件人
 * @param id 发件人记录ID
 * @returns Promise<LetterSenderRespVO>
 */
export const getLetterSender = async (id: number): Promise<LetterSenderRespVO> => {
  return await request.get({url: `/letter/sender/get?id=${id}`})
}

// ==================== 联系人星标相关API ====================

/**
 * 创建联系人星标
 * @param data 创建联系人星标请求参数
 * @returns Promise<number>
 */
export const createLetterContactStar = async (data: LetterContactStarCreateReqVO): Promise<number> => {
  return await request.post({ url: '/letter/contact/create', data })
}

/**
 * 删除联系人星标
 * @param id 星标记录ID
 * @returns Promise<boolean>
 */
export const deleteLetterContactStar = async (id: number): Promise<boolean> => {
  return await request.delete({ url: `/letter/contact/delete?id=${id}` })
}

/**
 * 获取联系人星标分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterContactStarRespVO[], total: number}>
 */
export const getLetterContactStarPage = async (params: LetterContactStarPageReqVO): Promise<{list: LetterContactStarRespVO[], total: number}> => {
  return await request.get({url: '/letter/contact/page', params})
}

/**
 * 获取联系人星标
 * @param id 联系人星标ID
 * @returns Promise<LetterContactStarRespVO>
 */
export const getLetterContactStar = async (id: number): Promise<LetterContactStarRespVO> => {
  return await request.get({url: `/letter/contact/get?id=${id}`})
}

// ==================== 邮件列表相关API ====================

/**
 * 获取收件箱邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getInboxMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/inbox', params})
}

/**
 * 获取已发送邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getSentMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/sent', params})
}

/**
 * 获取草稿邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getDraftMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/drafts', params})
}

/**
 * 获取星标邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getStarredMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/starred', params})
}

/**
 * 获取已删除邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getDeletedMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/deleted', params})
}

/**
 * 获取未读邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getUnreadMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/unread', params})
}

/**
 * 获取垃圾箱邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getTrashMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  return await request.get({url: '/letter/mail/trash', params})
}



/**
 * 切换信件星标状态
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const toggleStar = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/toggle-star', data})
}

/**
 * 获取邮件统计信息
 * @returns Promise<MailStatsVO>
 */
export const getMailStats = async (): Promise<MailStatsVO> => {
  return await request.get({url: '/letter/mail/stats'})
}

// ==================== 发信功能相关API ====================

/**
 * 发送信件
 * @param data 发送信件请求参数
 * @returns Promise<number> 返回创建的信件ID
 */
export const sendLetter = async (data: LetterSendReqVO): Promise<number> => {
  return await request.post({url: '/letter/send', data})
}

/**
 * 保存草稿
 * @param data 保存草稿请求参数
 * @returns Promise<number> 返回创建的信件ID
 */
export const saveDraft = async (data: LetterSendReqVO): Promise<number> => {
  return await request.post({url: '/letter/save-draft', data})
}

// ==================== 信件状态管理API ====================

/**
 * 标记信件为已读
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const markAsRead = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/mark-read', data})
}

/**
 * 标记信件为未读
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const markAsUnread = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/mark-unread', data})
}


/**
 * 移动信件到回收站
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const moveToTrash = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/move-to-trash', data})
}

/**
 * 从垃圾箱恢复信件
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const restoreFromTrash = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/restore-from-trash', data})
}

/**
 * 彻底删除信件
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const permanentDelete = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.delete({url: '/letter/permanent-delete', data})
}

// ==================== 垃圾箱标记功能API ====================

/**
 * 标记为垃圾邮件
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const markAsTrash = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/mark-trash', data})
}

/**
 * 取消垃圾邮件标记
 * @param data 信件ID列表
 * @returns Promise<boolean>
 */
export const restoreFromTrashFlag = async (data: { ids: number[] }): Promise<boolean> => {
  return await request.put({url: '/letter/restore-trash-flag', data})
}

// ==================== 邮件附件相关API ====================

/**
 * 单文件上传
 * @param file 上传的文件
 * @returns Promise<number> 返回附件ID
 */
export const uploadAttachment = async (file: File): Promise<number> => {
  const formData = new FormData()
  formData.append('file', file)
  return await request.post({url: '/letter/attachment/upload', data: formData, headers: {'Content-Type': 'multipart/form-data'}})
}

/**
 * 批量文件上传
 * @param files 上传的文件列表
 * @returns Promise<number[]> 返回附件ID列表
 */
export const uploadAttachmentsBatch = async (files: File[]): Promise<number[]> => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return await request.post({url: '/letter/attachment/upload-batch', data: formData, headers: {'Content-Type': 'multipart/form-data'}})
}

/**
 * 下载附件
 * @param attachmentId 附件ID
 * @returns Promise<Blob> 返回文件二进制内容
 */
export const downloadAttachment = async (attachmentId: number): Promise<Blob> => {
  return await request.get({url: `/letter/attachment/download/${attachmentId}`, responseType: 'blob'})
}

/**
 * 获取附件信息
 * @param attachmentId 附件ID
 * @returns Promise<AttachmentInfoRespVO>
 */
export const getAttachmentInfo = async (attachmentId: number): Promise<AttachmentInfoRespVO> => {
  return await request.get({url: `/letter/attachment/info/${attachmentId}`})
}

/**
 * 获取指定邮件的附件列表
 * @param letterId 邮件ID
 * @returns Promise<AttachmentInfoRespVO[]>
 */
export const getLetterAttachments = async (letterId: number): Promise<AttachmentInfoRespVO[]> => {
  return await request.get({url: `/letter/attachment/letter/${letterId}`})
}

/**
 * 获取用户附件统计信息
 * @returns Promise<AttachmentStatsRespVO>
 */
export const getAttachmentStats = async (): Promise<AttachmentStatsRespVO> => {
  const data = await request.get({url: '/letter/attachment/stats'})
  return {
    totalCount: data[0],
    totalSize: data[1]
  }
}

/**
 * 删除附件
 * @param attachmentId 附件ID
 * @returns Promise<boolean>
 */
export const deleteAttachment = async (attachmentId: number): Promise<boolean> => {
  return await request.delete({url: `/letter/attachment/${attachmentId}`})
}

/**
 * 批量删除附件
 * @param data 批量删除请求参数
 * @returns Promise<boolean>
 */
export const batchDeleteAttachments = async (data: BatchDeleteAttachmentReqVO): Promise<boolean> => {
  return await request.delete({url: '/letter/attachment/batch', data})
}

/**
 * 将临时附件转为正式附件
 * @param data 转换请求参数
 * @returns Promise<boolean>
 */
export const convertToFormalAttachments = async (data: ConvertToFormalReqVO): Promise<boolean> => {
  return await request.put({url: '/letter/attachment/convert-to-formal', data})
}

/**
 * 清理过期临时附件（管理员权限）
 * @returns Promise<boolean>
 */
export const cleanExpiredAttachments = async (): Promise<boolean> => {
  return await request.post({url: '/letter/attachment/clean-expired'})
}

// ==================== 文件上传下载工具函数 ====================

/**
 * 文件大小格式化工具
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 下载文件到本地
 * @param attachmentId 附件ID
 * @param fileName 文件名（可选，如果不提供会从响应头获取）
 * @returns Promise<void>
 */
export const downloadFileToLocal = async (attachmentId: number, fileName?: string): Promise<void> => {
  try {
    const blob = await downloadAttachment(attachmentId)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || '附件'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('文件下载失败:', error)
    throw new Error('文件下载失败')
  }
}

/**
 * 文件上传进度回调类型
 */
export type UploadProgressCallback = (progress: number) => void

/**
 * 带进度条的文件上传
 * @param file 上传的文件
 * @param onProgress 进度回调函数
 * @returns Promise<number> 返回附件ID
 */
export const uploadAttachmentWithProgress = async (
  file: File, 
  onProgress?: UploadProgressCallback
): Promise<number> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })
    }
    
    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            resolve(response.data)
          } else {
            reject(new Error(response.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应解析失败'))
        }
      } else {
        reject(new Error(`上传失败，状态码: ${xhr.status}`))
      }
    })
    
    // 监听请求错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'))
    })
    
    // 发送请求
    xhr.open('POST', '/letter/attachment/upload')
    xhr.send(formData)
  })
}

/**
 * 批量文件上传（带进度）
 * @param files 文件列表
 * @param onProgress 进度回调函数
 * @returns Promise<number[]> 返回附件ID列表
 */
export const uploadAttachmentsBatchWithProgress = async (
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<number[]> => {
  const results: number[] = []
  let completed = 0
  
  for (const file of files) {
    try {
      const attachmentId = await uploadAttachment(file)
      results.push(attachmentId)
      completed++
      if (onProgress) {
        onProgress(completed, files.length)
      }
    } catch (error) {
      console.error(`文件 ${file.name} 上传失败:`, error)
      // 可以选择继续上传其他文件或者抛出错误
      throw error
    }
  }
  
  return results
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否允许该文件类型
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type) || allowedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()))
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 是否在允许的大小范围内
 */
export const validateFileSize = (file: File, maxSize: number = 1024 * 1024 * 1024): boolean => {
  return file.size <= maxSize
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 文件扩展名（不包含点号）
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

/**
 * 根据文件扩展名获取文件类型图标
 * @param fileName 文件名
 * @returns 文件类型图标类名
 */
export const getFileTypeIcon = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  
  const iconMap: Record<string, string> = {
    // 文档类型
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'xls': 'file-excel',
    'xlsx': 'file-excel',
    'ppt': 'file-powerpoint',
    'pptx': 'file-powerpoint',
    'txt': 'file-text',
    
    // 图片类型
    'jpg': 'file-image',
    'jpeg': 'file-image',
    'png': 'file-image',
    'gif': 'file-image',
    'bmp': 'file-image',
    'svg': 'file-image',
    
    // 压缩文件
    'zip': 'file-zip',
    'rar': 'file-zip',
    '7z': 'file-zip',
    'tar': 'file-zip',
    'gz': 'file-zip',
    
    // 视频文件
    'mp4': 'file-video',
    'avi': 'file-video',
    'mov': 'file-video',
    'wmv': 'file-video',
    'flv': 'file-video',
    
    // 音频文件
    'mp3': 'file-audio',
    'wav': 'file-audio',
    'flac': 'file-audio',
    'aac': 'file-audio',
  }
  
  return iconMap[extension] || 'file'
}

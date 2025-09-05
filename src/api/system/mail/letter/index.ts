import request from '@/config/axios'
import type { PageParam } from '@/api/supervision'

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
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
}

// 信件内容创建请求VO - 对应后端 LetterContentCreateReqVO
export interface LetterContentCreateReqVO {
  subject: string              // 信件主题
  content: string              // 信件内容
  recipientIdCards: string[]   // 收件人身份证号列表
  ccIdCards?: string[]         // 抄送人身份证号列表
  priority?: number            // 邮件优先级(1-普通,2-重要,3-紧急)
  isDraft?: boolean            // 是否为草稿
  requestReadReceipt?: boolean // 是否请求已读回执
  attachmentIds?: string[]     // 附件ID列表
}

// 信件内容更新请求VO - 对应后端 LetterContentUpdateReqVO
export interface LetterContentUpdateReqVO {
  id: number                   // 信件ID
  subject?: string             // 信件主题
  content?: string             // 信件内容
  priority?: number            // 邮件优先级(1-普通,2-重要,3-紧急)
  status?: number              // 信件状态(0-正常,1-撤回)
  requestReadReceipt?: boolean // 是否请求已读回执
}

// 信件内容分页查询请求VO - 对应后端 LetterContentPageReqVO
export interface LetterContentPageReqVO extends PageParam {
  subject?: string             // 信件主题
  priority?: number            // 优先级
  status?: number              // 信件状态
  sendTimeStart?: string       // 发送时间开始
  sendTimeEnd?: string         // 发送时间结束
}

// ==================== 收件人相关VO ====================

// 收件人关联响应VO - 对应后端 LetterRecipientRespVO
export interface LetterRecipientRespVO {
  id: number                   // 记录ID
  letterId: number             // 信件ID
  recipientIdCard: string      // 收件人身份证号
  recipientType: number        // 收件人类型(1-主收件人,2-抄送人)
  isRead: boolean              // 是否已读
  isDeleted: boolean           // 是否丢弃
  isStarred: boolean           // 是否标星
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
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
  senderIdCard: string         // 发件人身份证号
  isDraft: boolean             // 是否为草稿(0-已发送,1-草稿)
  isRead: boolean              // 是否已读
  isDeleted: boolean           // 是否丢弃
  isStarred: boolean           // 是否标星
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
}

// 发件人状态更新请求VO - 对应后端 LetterSenderUpdateReqVO
export interface LetterSenderUpdateReqVO {
  id: number                   // 记录ID
  isDraft?: boolean            // 是否为草稿
  isRead?: boolean             // 是否已读
  isDeleted?: boolean          // 是否丢弃
  isStarred?: boolean          // 是否标星
}

// 发件人分页查询请求VO - 对应后端 LetterSenderPageReqVO
export interface LetterSenderPageReqVO extends PageParam {
  letterId?: number            // 信件ID
  senderIdCard?: string        // 发件人身份证号
  isDraft?: boolean            // 是否为草稿
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
}

// 联系人星标创建请求VO - 对应后端 LetterContactStarCreateReqVO
export interface LetterContactStarCreateReqVO {
  contactIdCard: string        // 联系人身份证号
}

// 联系人星标分页查询请求VO - 对应后端 LetterContactStarPageReqVO
export interface LetterContactStarPageReqVO extends PageParam {
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
  isDraft: boolean             // 是否为草稿(仅发件人有效)
}

// 信件详情响应VO - 对应后端 LetterDetailRespVO
export interface LetterDetailRespVO {
  content: LetterContentRespVO        // 信件内容信息
  senders: LetterSenderRespVO[]       // 发件人信息列表
  recipients: LetterRecipientRespVO[] // 收件人信息列表
  attachments: MailAttachmentRespVO[] // 附件信息列表
  userStatus: UserLetterStatusVO      // 当前用户状态
}

// ==================== 邮件附件相关VO ====================

// 邮件附件响应VO - 保留原有接口
export interface MailAttachmentRespVO {
  id: number                   // 附件ID
  letterId: number             // 信件ID
  fileName: string             // 文件名
  fileSize: number             // 文件大小
  filePath: string             // 文件路径
  mimeType: string             // MIME类型
  createTime: string           // 创建时间
}


// 邮件详情响应接口
export interface MailDetailVO {
  id: number
  subject: string
  content: string
  status: number
  folder: string
  senderId: number
  sender: {
    id: number
    nickname: string
    email: string
    workId: string
  }
  receiverIds: string
  receivers: Array<{
    id: number
    nickname: string
    email: string
  }>
  ccUserIds?: string
  ccUsers?: Array<{
    id: number
    nickname: string
    email: string
  }>
  sendTime: string
  receiveTime: string
  isRead: boolean
  isStarred: boolean
  isDraft: boolean
  priority: number
  requestReadReceipt: boolean
  size: number
  attachmentCount: number
  attachmentIds?: string
  starredAt?: string
  createTime: string
  updateTime: string
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
  isDraft: boolean              // 是否为草稿
  isStarred: boolean            // 是否星标
  starredAt: string             // 星标时间，
  deletedAt: string             // 删除时间
  sendTime: string              // 发送时间
  createTime: string            // 创建时间
  updateTime: string            // 更新时间
}

// 邮件分页响应接口
export interface MailPageVO {
  list: MailListItemVO[]
  total: number
}

// 联系人接口
export interface ContactVO {
  id: number
  email: string
  name: string
  department?: string
  position?: string
  mailCount?: number
  lastMailTime?: string
  avatarUrl?: string
  contactType: 'internal' | 'external'
}

// 邮件统计信息接口
export interface MailStatsVO {
  inboxCount: number
  inboxUnreadCount: number
  sentCount: number
  draftsCount: number
  starredCount: number
  deletedCount: number
  totalCount: number
  totalUnreadCount: number
}

// 批量操作请求参数接口
export interface BatchOperationReqVO {
  ids: number[]
  operation: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'restore' | 'permanent_delete' | 'move'
  folder?: string  // 移动操作时使用
}

// 标记已读/未读请求参数接口
export interface MarkReadReqVO {
  ids: number[]
}

// 移动邮件请求参数接口
export interface MoveMailReqVO {
  ids: number[]
  folder: string
}

// 搜索邮件请求参数接口
export interface SearchMailReqVO {
  keyword: string
  pageNo?: number
  pageSize?: number
}

// ==================== 发信功能相关VO ====================

// 发送邮件请求VO
export interface SendMailReqVO {
  subject: string                    // 邮件主题，必填
  content: string                    // 邮件内容，必填
  priority?: number                  // 优先级(1-普通,2-重要,3-紧急)，可选
  requestReadReceipt?: boolean       // 是否请求已读回执，可选
  recipientIdCards: string[]         // 收件人身份证号列表，必填
  ccIdCards?: string[]               // 抄送人身份证号列表，可选
  isDraft?: boolean                  // 是否为草稿，可选
}

// 保存草稿请求VO（收件人字段可选）
export interface SaveDraftReqVO {
  subject: string                    // 邮件主题，必填
  content: string                    // 邮件内容，必填
  priority?: number                  // 优先级(1-普通,2-重要,3-紧急)，可选
  requestReadReceipt?: boolean       // 是否请求已读回执，可选
  recipientIdCards?: string[]        // 收件人身份证号列表，可选（草稿可以不填收件人）
  ccIdCards?: string[]               // 抄送人身份证号列表，可选
  isDraft?: boolean                  // 是否为草稿，可选
}

// 发信响应VO
export interface SendMailRespVO {
  id: number                         // 创建的信件ID
}

// ==================== 信件内容相关API ====================

/**
 * 创建信件内容
 * @param data 创建信件内容请求参数
 * @returns Promise<any>
 */
export const createLetterContent = async (data: LetterContentCreateReqVO) => {
  return await request.post({ url: '/system/letter/content/create', data })
}

/**
 * 更新信件内容
 * @param data 更新信件内容请求参数
 * @returns Promise<any>
 */
export const updateLetterContent = async (data: LetterContentUpdateReqVO) => {
  return await request.put({ url: '/system/letter/content/update', data })
}

/**
 * 删除信件内容
 * @param id 信件ID
 * @returns Promise<any>
 */
export const deleteLetterContent = async (id: number) => {
  return await request.delete({ url: `/system/letter/content/delete/${id}` })
}

/**
 * 获取信件详情
 * @param id 信件ID
 * @returns Promise<LetterDetailRespVO>
 */
export const getLetterDetail = async (id: number): Promise<LetterDetailRespVO> => {
  const response = await request.get({ url: `/system/letter/content/detail/${id}` })
  return response.data
}

/**
 * 获取信件分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterContentRespVO[], total: number}>
 */
export const getLetterPage = async (params: LetterContentPageReqVO): Promise<{list: LetterContentRespVO[], total: number}> => {
  const response = await request.get({ url: '/system/letter/content/page', params })
  return response.data
}

// ==================== 收件人相关API ====================

/**
 * 更新收件人状态
 * @param data 更新收件人状态请求参数
 * @returns Promise<any>
 */
export const updateLetterRecipient = async (data: LetterRecipientUpdateReqVO) => {
  return await request.put({ url: '/system/letter/recipient/update', data })
}

/**
 * 获取收件人分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterRecipientRespVO[], total: number}>
 */
export const getLetterRecipientPage = async (params: LetterRecipientPageReqVO): Promise<{list: LetterRecipientRespVO[], total: number}> => {
  const response = await request.get({ url: '/system/letter/recipient/page', params })
  return response.data
}

// ==================== 发件人相关API ====================

/**
 * 更新发件人状态
 * @param data 更新发件人状态请求参数
 * @returns Promise<any>
 */
export const updateLetterSender = async (data: LetterSenderUpdateReqVO) => {
  return await request.put({ url: '/system/letter/sender/update', data })
}

/**
 * 获取发件人分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterSenderRespVO[], total: number}>
 */
export const getLetterSenderPage = async (params: LetterSenderPageReqVO): Promise<{list: LetterSenderRespVO[], total: number}> => {
  const response = await request.get({ url: '/system/letter/sender/page', params })
  return response.data
}

// ==================== 联系人星标相关API ====================

/**
 * 创建联系人星标
 * @param data 创建联系人星标请求参数
 * @returns Promise<any>
 */
export const createLetterContactStar = async (data: LetterContactStarCreateReqVO) => {
  return await request.post({ url: '/system/letter/contact-star/create', data })
}

/**
 * 删除联系人星标
 * @param id 星标记录ID
 * @returns Promise<any>
 */
export const deleteLetterContactStar = async (id: number) => {
  return await request.delete({ url: `/system/letter/contact-star/delete/${id}` })
}

/**
 * 获取联系人星标分页列表
 * @param params 查询参数
 * @returns Promise<{list: LetterContactStarRespVO[], total: number}>
 */
export const getLetterContactStarPage = async (params: LetterContactStarPageReqVO): Promise<{list: LetterContactStarRespVO[], total: number}> => {
  const response = await request.get({ url: '/system/letter/contact-star/page', params })
  return response.data
}

// ==================== 邮件列表相关API ====================

/**
 * 获取收件箱邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getInboxMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/inbox', params })
  return response.data
}

/**
 * 获取已发送邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getSentMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/sent', params })
  return response.data
}

/**
 * 获取草稿邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getDraftMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/drafts', params })
  return response.data
}

/**
 * 获取星标邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getStarredMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/starred', params })
  return response.data
}

/**
 * 获取已删除邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getDeletedMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/deleted', params })
  return response.data
}

/**
 * 获取未读邮件
 * @param params 分页参数
 * @returns Promise<{list: MailListItemVO[], total: number}>
 */
export const getUnreadMails = async (params: { pageNo: number; pageSize: number }): Promise<{list: MailListItemVO[], total: number}> => {
  const response = await request.get({ url: '/api/system/mail/letter/unread', params })
  return response.data
}

/**
 * 批量删除邮件
 * @param data 删除请求参数
 * @returns Promise<boolean>
 */
export const deleteMails = async (data: { ids: number[] }): Promise<boolean> => {
  const response = await request.post({ url: '/api/system/mail/letter/delete', data })
  return response.data
}

/**
 * 切换邮件星标状态
 * @param id 邮件ID
 * @returns Promise<boolean>
 */
export const toggleMailStar = async (id: number): Promise<boolean> => {
  const response = await request.post({ url: `/api/system/mail/letter/${id}/toggle-star` })
  return response.data
}

/**
 * 获取邮件统计信息
 * @returns Promise<MailStatsVO>
 */
export const getMailStats = async (): Promise<MailStatsVO> => {
  const response = await request.get({ url: '/api/system/mail/letter/stats' })
  return response.data
}

// ==================== 发信功能相关API ====================

/**
 * 发送邮件
 * @param data 发送邮件请求参数
 * @returns Promise<number> 返回创建的信件ID
 */
export const sendMail = async (data: SendMailReqVO): Promise<number> => {
  const response = await request.post({ url: '/api/system/mail/letter/send', data })
  return response.data
}

/**
 * 保存草稿
 * @param data 保存草稿请求参数
 * @returns Promise<number> 返回创建的信件ID
 */
export const saveDraft = async (data: SaveDraftReqVO): Promise<number> => {
  const response = await request.post({ url: '/api/system/mail/letter/save-draft', data })
  return response.data
}

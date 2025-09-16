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
  userStatus: UserLetterStatusVO      // 当前用户状态
  isTrash: boolean                    // 是否在垃圾箱
  trashTime: string                   // 移入垃圾箱时间
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

// ==================== 邮件回复转发相关VO ====================

// 邮件回复请求VO
export interface LetterReplyReqVO {
  originalLetterId: number           // 必填，原邮件ID
  content: string                    // 必填，回复内容
  priority?: number                  // 可选，优先级(1-普通,2-重要,3-紧急)，默认1
  requestReadReceipt?: boolean       // 可选，是否请求已读回执，默认false
  recipientIdCards: string[]         // 必填，收件人身份证号列表
  ccIdCards?: string[]               // 可选，抄送人身份证号列表
  bccIdCards?: string[]              // 可选，密送人身份证号列表
  attachmentIds?: number[]           // 可选，附件ID列表
  remark?: string                    // 可选，回复备注
}

// 邮件转发请求VO
export interface LetterForwardReqVO {
  originalLetterId: number           // 必填，原邮件ID
  content: string                    // 必填，转发说明内容
  priority?: number                  // 可选，优先级(1-普通,2-重要,3-紧急)，默认1
  requestReadReceipt?: boolean       // 可选，是否请求已读回执，默认false
  recipientIdCards: string[]         // 必填，收件人身份证号列表
  ccIdCards?: string[]               // 可选，抄送人身份证号列表
  bccIdCards?: string[]              // 可选，密送人身份证号列表
  attachmentIds?: number[]           // 可选，附件ID列表
  remark?: string                    // 可选，转发备注
}

// ==================== 信件内容相关API ====================

/**
 * 获取信件详情
 * @param id 信件ID
 * @returns Promise<LetterDetailRespVO>
 */
export const getLetterDetail = async (id: number): Promise<LetterDetailRespVO> => {
  try {
    console.log('🌐 API调用: 获取信件详情，ID:', id)
    const result = await request.get({url: `/letter/detail?id=${id}`})
    console.log('📨 API返回结果:', result)
    
    // 验证返回的数据结构
    if (!result) {
      console.error('❌ API返回空数据')
      throw new Error('服务器返回空数据')
    }
    
    // 验证必要字段
    if (!result.content) {
      console.warn('⚠️ API返回数据缺少content字段:', result)
    }
    
    return result
  } catch (error: any) {
    console.error('❌ getLetterDetail API调用失败:', error)
    console.error('错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
    throw error
  }
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

// ==================== 邮件回复转发相关API ====================

/**
 * 回复邮件
 * @param data 回复邮件请求参数
 * @returns Promise<number> 返回回复邮件的ID
 */
export const replyLetter = async (data: LetterReplyReqVO): Promise<number> => {
  return await request.post({url: '/letter/reply', data})
}

/**
 * 转发邮件
 * @param data 转发邮件请求参数
 * @returns Promise<number> 返回转发邮件的ID
 */
export const forwardLetter = async (data: LetterForwardReqVO): Promise<number> => {
  return await request.post({url: '/letter/forward', data})
}



import request from '@/config/axios'
import type { PageParam } from '@/api/supervision'

// 身份证号工具函数
/**
 * 格式化身份证号显示（隐藏中间部分）
 * @param idCard 身份证号
 * @returns 格式化后的身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard || idCard.length !== 18) return idCard
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1****$2$3')
}

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否为有效身份证号
 */
export const isValidIdCard = (idCard: string): boolean => {
  return /^[0-9X]{18}$/.test(idCard)
}

/**
 * 获取当前用户身份证号（需要从用户信息中获取）
 * @returns 当前用户身份证号
 */
export const getCurrentUserIdCard = (): string => {
  // 这里需要根据实际的用户信息获取方式来实现
  // 例如从localStorage、store或其他地方获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo?.idCard || ''
}

// 邮件发送请求参数接口
export interface SendMailReqVO {
  toEmails: string[]           // 收件人邮箱列表
  ccEmails?: string[]          // 抄送人邮箱列表
  bccEmails?: string[]         // 密送人邮箱列表
  subject: string              // 邮件主题
  content: string              // 邮件内容
  priority?: number            // 邮件优先级(1-普通,2-重要,3-紧急)
  requestReadReceipt?: boolean // 是否请求已读回执
  attachmentIds?: string[]     // 附件ID列表
}

// 邮件内容创建请求参数接口
export interface CreateMailContentReqVO {
  subject: string              // 邮件主题
  content: string              // 邮件内容
  senderId: string             // 发件人ID（身份证号）
  receiverIds: string          // 收件人ID列表，逗号分隔
  ccUserIds?: string           // 抄送人ID列表，逗号分隔
  priority?: number            // 邮件优先级(1-普通,2-重要,3-紧急)
  isDraft?: boolean            // 是否草稿，默认false
  requestReadReceipt?: boolean // 是否请求已读回执，默认false
  status?: number              // 邮件状态(0-正常,1-撤回)，默认0
  folder?: string              // 文件夹类型，默认drafts
  attachmentIds?: string       // 附件ID列表，逗号分隔
}

// 邮件内容更新请求参数接口
export interface UpdateMailContentReqVO extends CreateMailContentReqVO {
  id: number                   // 邮件ID
}

// 邮件详情响应接口
export interface MailDetailVO {
  id: number
  subject: string
  content: string
  status: number
  folder: string
  senderId: string  // 发件人ID（身份证号）
  sender: {
    id: number
    nickname: string
    email: string
    workId: string
    idCard: string  // 新增身份证号字段
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
  id: number
  messageId?: string
  fromMail?: string
  fromName?: string
  toMail?: string[]
  ccMail?: string[]
  bccMail?: string[]
  subject: string
  content?: string
  htmlContent?: string
  attachments?: any[]
  sendTime?: string
  receiveTime?: string
  isRead: boolean
  isStarred: boolean
  isDraft: boolean
  isDeleted?: boolean
  deletedAt?: string
  starredAt?: string
  priority: number
  status: number
  folder: string
  inReplyTo?: string
  references?: string
  size: number
  requestReadReceipt: boolean
  createTime: string
  updateTime: string
  // 分页列表特有字段
  senderId?: string  // 发件人ID（身份证号）
  senderName?: string
  receiverNames?: string
  attachmentCount?: number
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

/**
 * 发送邮件 - 使用核心API接口
 * @param data 发送邮件请求参数
 * @returns Promise<any>
 */
export const sendMail = async (data: CreateMailContentReqVO) => {
  console.log('📧 发送邮件API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/content/create')
  
  try {
    const response = await request.post({ url: '/system/letter/content/create', data })
    console.log('✅ 发送邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 发送邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 保存草稿 - 使用核心API接口
 * @param data 草稿邮件请求参数
 * @returns Promise<any>
 */
export const saveDraft = async (data: CreateMailContentReqVO) => {
  console.log('💾 保存草稿API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/content/create')
  
  try {
    // 保存草稿时设置 isDraft 为 true
    const draftData = { ...data, isDraft: true }
    const response = await request.post({ url: '/system/letter/content/create', data: draftData })
    console.log('✅ 保存草稿API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 保存草稿API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 创建邮件内容
 * @param data 创建邮件内容请求参数
 * @returns Promise<any>
 */
export const createMailContent = async (data: CreateMailContentReqVO) => {
  console.log('➕ 创建邮件内容API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/content/create')
  
  try {
    const response = await request.post({ url: '/system/letter/content/create', data })
    console.log('✅ 创建邮件内容API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 创建邮件内容API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 更新邮件内容
 * @param data 更新邮件内容请求参数
 * @returns Promise<any>
 */
export const updateMailContent = async (data: UpdateMailContentReqVO) => {
  console.log('✏️ 更新邮件内容API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/content/update')
  
  try {
    const response = await request.put({ url: '/system/letter/content/update', data })
    console.log('✅ 更新邮件内容API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 更新邮件内容API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 删除邮件内容
 * @param id 邮件ID
 * @returns Promise<any>
 */
export const deleteMailContent = async (id: number) => {
  console.log('🗑️ 删除邮件内容API调用开始')
  console.log('📋 邮件ID:', id)
  console.log('🔗 API地址: /system/letter/content/delete/' + id)
  
  try {
    const response = await request.delete({ url: `/system/letter/content/delete/${id}` })
    console.log('✅ 删除邮件内容API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 删除邮件内容API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取邮件详情
 * @param id 邮件ID
 * @returns Promise<MailDetailVO>
 */
export const getMailDetail = async (id: number): Promise<MailDetailVO> => {
  console.log('👤 获取邮件详情API调用开始')
  console.log('📋 邮件ID:', id)
  console.log('🔗 API地址: /system/letter/content/detail/' + id)
  
  try {
    const response = await request.get({ url: `/system/letter/content/detail/${id}` })
    console.log('✅ 获取邮件详情API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取邮件详情API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取邮件分页列表
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getMailPage = async (params: PageParam): Promise<MailPageVO> => {
  console.log('📋 获取邮件分页列表API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/content/page')
  
  try {
    const response = await request.get({ url: '/system/letter/content/page', params })
    console.log('✅ 获取邮件分页列表API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取邮件分页列表API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取个人邮件分页列表
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getMyMailPage = async (params: PageParam): Promise<MailPageVO> => {
  console.log('📋 获取个人邮件分页列表API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/content/my-page')
  
  try {
    const response = await request.get({ url: '/system/letter/content/my-page', params })
    console.log('✅ 获取个人邮件分页列表API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取个人邮件分页列表API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取收件箱邮件
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getInboxMails = async (params: PageParam = {}): Promise<MailPageVO> => {
  console.log('📥 获取收件箱邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/inbox')
  
  try {
    const response = await request.get({ url: '/system/letter/inbox', params })
    console.log('✅ 获取收件箱邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取收件箱邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取已发送邮件
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getSentMails = async (params: PageParam = {}): Promise<MailPageVO> => {
  console.log('📤 获取已发送邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/sent')
  
  try {
    const response = await request.get({ url: '/system/letter/sent', params })
    console.log('✅ 获取已发送邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取已发送邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取草稿邮件
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getDraftMails = async (params: PageParam = {}): Promise<MailPageVO> => {
  console.log('📝 获取草稿邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/drafts')
  
  try {
    const response = await request.get({ url: '/system/letter/drafts', params })
    console.log('✅ 获取草稿邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取草稿邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取星标邮件
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getStarredMails = async (params: PageParam = {}): Promise<MailPageVO> => {
  console.log('⭐ 获取星标邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/starred')
  
  try {
    const response = await request.get({ url: '/system/letter/starred', params })
    console.log('✅ 获取星标邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取星标邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取已删除邮件
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getDeletedMails = async (params: PageParam = {}): Promise<MailPageVO> => {
  console.log('🗑️ 获取已删除邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/deleted')
  
  try {
    const response = await request.get({ url: '/system/letter/deleted', params })
    console.log('✅ 获取已删除邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取已删除邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 标记邮件为已读
 * @param data 标记已读请求参数
 * @returns Promise<any>
 */
export const markMailAsRead = async (data: MarkReadReqVO) => {
  console.log('✅ 标记邮件为已读API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/mark-read')
  
  try {
    const response = await request.put({ url: '/system/letter/mark-read', data })
    console.log('✅ 标记邮件为已读API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 标记邮件为已读API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 标记邮件为未读
 * @param data 标记未读请求参数
 * @returns Promise<any>
 */
export const markMailAsUnread = async (data: MarkReadReqVO) => {
  console.log('📬 标记邮件为未读API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/mark-unread')
  
  try {
    const response = await request.put({ url: '/system/letter/mark-unread', data })
    console.log('✅ 标记邮件为未读API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 标记邮件为未读API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 切换邮件星标状态
 * @param id 邮件ID
 * @returns Promise<any>
 */
export const toggleMailStar = async (id: number) => {
  console.log('⭐ 切换邮件星标状态API调用开始')
  console.log('📋 邮件ID:', id)
  console.log('🔗 API地址: /system/letter/toggle-star/' + id)
  
  try {
    const response = await request.put({ url: `/system/letter/toggle-star/${id}` })
    console.log('✅ 切换邮件星标状态API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 切换邮件星标状态API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 删除邮件（移动到已删除文件夹）
 * @param data 删除邮件请求参数
 * @returns Promise<any>
 */
export const deleteMails = async (data: MarkReadReqVO) => {
  console.log('🗑️ 删除邮件API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/delete')
  
  try {
    const response = await request.put({ url: '/system/letter/delete', data })
    console.log('✅ 删除邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 删除邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 彻底删除邮件
 * @param data 彻底删除邮件请求参数
 * @returns Promise<any>
 */
export const permanentDeleteMails = async (data: MarkReadReqVO) => {
  console.log('💥 彻底删除邮件API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/permanent-delete')
  
  try {
    const response = await request.delete({ url: '/system/letter/permanent-delete', data })
    console.log('✅ 彻底删除邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 彻底删除邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 恢复邮件
 * @param data 恢复邮件请求参数
 * @returns Promise<any>
 */
export const restoreMails = async (data: MarkReadReqVO) => {
  console.log('🔄 恢复邮件API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/restore')
  
  try {
    const response = await request.put({ url: '/system/letter/restore', data })
    console.log('✅ 恢复邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 恢复邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 批量操作邮件
 * @param data 批量操作请求参数
 * @returns Promise<any>
 */
export const batchOperationMails = async (data: BatchOperationReqVO) => {
  console.log('📦 批量操作邮件API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/batch')
  
  try {
    const response = await request.put({ url: '/system/letter/batch', data })
    console.log('✅ 批量操作邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 批量操作邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 移动邮件到指定文件夹
 * @param data 移动邮件请求参数
 * @returns Promise<any>
 */
export const moveMails = async (data: MoveMailReqVO) => {
  console.log('📁 移动邮件到指定文件夹API调用开始')
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/move')
  
  try {
    const response = await request.put({ url: '/system/letter/move', data })
    console.log('✅ 移动邮件到指定文件夹API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 移动邮件到指定文件夹API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 搜索邮件
 * @param params 搜索请求参数
 * @returns Promise<MailPageVO>
 */
export const searchMails = async (params: SearchMailReqVO): Promise<MailPageVO> => {
  console.log('🔍 搜索邮件API调用开始')
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/search')
  
  try {
    const response = await request.get({ url: '/system/letter/search', params })
    console.log('✅ 搜索邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 搜索邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取邮件统计信息
 * @returns Promise<MailStatsVO>
 */
export const getMailStats = async (): Promise<MailStatsVO> => {
  console.log('📊 获取邮件统计信息API调用开始')
  console.log('🔗 API地址: /system/letter/stats')
  
  try {
    const response = await request.get({ url: '/system/letter/stats' })
    console.log('✅ 获取邮件统计信息API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取邮件统计信息API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取联系人列表
 * @param keyword 搜索关键词
 * @returns Promise<ContactVO[]>
 */
export const getContactList = async (keyword?: string): Promise<ContactVO[]> => {
  console.log('👥 获取联系人列表API调用开始')
  console.log('📋 搜索关键词:', keyword)
  console.log('🔗 API地址: /system/letter/contacts')
  
  try {
    const params = keyword ? { keyword } : {}
    const response = await request.get({ url: '/system/letter/contacts', params })
    console.log('✅ 获取联系人列表API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取联系人列表API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取指定账号的收件箱邮件
 * @param accountId 账号ID
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getAccountInboxMails = async (accountId: number, params: PageParam = {}): Promise<MailPageVO> => {
  console.log('📥 获取指定账号的收件箱邮件API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/account/' + accountId + '/inbox')
  
  try {
    const response = await request.get({ url: `/system/letter/account/${accountId}/inbox`, params })
    console.log('✅ 获取指定账号的收件箱邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取指定账号的收件箱邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取指定账号的已发送邮件
 * @param accountId 账号ID
 * @param params 查询参数
 * @returns Promise<MailPageVO>
 */
export const getAccountSentMails = async (accountId: number, params: PageParam = {}): Promise<MailPageVO> => {
  console.log('📤 获取指定账号的已发送邮件API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('📋 请求参数:', params)
  console.log('🔗 API地址: /system/letter/account/' + accountId + '/sent')
  
  try {
    const response = await request.get({ url: `/system/letter/account/${accountId}/sent`, params })
    console.log('✅ 获取指定账号的已发送邮件API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取指定账号的已发送邮件API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取指定账号的邮件详情
 * @param accountId 账号ID
 * @param id 邮件ID
 * @returns Promise<MailDetailVO>
 */
export const getAccountMailDetail = async (accountId: number, id: number): Promise<MailDetailVO> => {
  console.log('👤 获取指定账号的邮件详情API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('📋 邮件ID:', id)
  console.log('🔗 API地址: /system/letter/account/' + accountId + '/detail/' + id)
  
  try {
    const response = await request.get({ url: `/system/letter/account/${accountId}/detail/${id}` })
    console.log('✅ 获取指定账号的邮件详情API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取指定账号的邮件详情API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 标记指定账号的邮件为已读/未读
 * @param accountId 账号ID
 * @param data 标记请求参数
 * @returns Promise<any>
 */
export const markAccountMailRead = async (accountId: number, data: { ids: number[], isRead: boolean }) => {
  console.log('✅ 标记指定账号的邮件为已读/未读API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('📋 请求数据:', data)
  console.log('🔗 API地址: /system/letter/account/' + accountId + '/mark-read')
  
  try {
    const response = await request.put({ url: `/system/letter/account/${accountId}/mark-read`, data })
    console.log('✅ 标记指定账号的邮件为已读/未读API调用成功')
    console.log('📊 响应数据:', response)
    return response
  } catch (error: any) {
    console.error('❌ 标记指定账号的邮件为已读/未读API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

/**
 * 获取指定账号的邮件统计信息
 * @param accountId 账号ID
 * @returns Promise<MailStatsVO>
 */
export const getAccountMailStats = async (accountId: number): Promise<MailStatsVO> => {
  console.log('📊 获取指定账号的邮件统计信息API调用开始')
  console.log('📋 账号ID:', accountId)
  console.log('🔗 API地址: /system/letter/account/' + accountId + '/stats')
  
  try {
    const response = await request.get({ url: `/system/letter/account/${accountId}/stats` })
    console.log('✅ 获取指定账号的邮件统计信息API调用成功')
    console.log('📊 响应数据:', response)
    return response.data
  } catch (error: any) {
    console.error('❌ 获取指定账号的邮件统计信息API调用失败')
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    })
    throw error
  }
}

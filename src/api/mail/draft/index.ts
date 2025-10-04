import request from '@/config/axios'

// ==================== 类型定义 ====================

export interface DraftRecipientItem {
  recipientIdCard: string
  recipientType: number // 1-TO, 2-CC, 3-BCC
}

export interface LetterDraftCreateReqVO {
  subject: string
  content: string
  priority?: number
  requestReadReceipt?: boolean
  draftStatus?: number // 1-草稿，2-定时发送
  scheduledSendTime?: string | null
  isStarred?: boolean
  recipients?: DraftRecipientItem[]
}

export interface LetterDraftUpdateReqVO extends LetterDraftCreateReqVO {
  id: number
}

export interface LetterDraftRespVO {
  id: number
  subject: string
  content: string
  priority: number
  priorityName?: string
  requestReadReceipt: boolean
  draftStatus: number
  draftStatusName?: string
  scheduledSendTime: string | null
  lastSaveTime?: string
  saveCount?: number
  senderIdCard?: string
  senderName?: string
  isStarred: boolean
  createTime: string
  updateTime: string
  recipients: Array<{
    id: number
    draftId: number
    recipientIdCard: string
    recipientName?: string
    recipientType: number
    recipientTypeName?: string
    createTime: string
  }>
}

export interface PageParam {
  pageNo?: number
  pageSize?: number
}

export interface LetterDraftPageReqVO extends PageParam {
  subject?: string
  priority?: number
  draftStatus?: number
  isStarred?: boolean
  startTime?: string
  endTime?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// ==================== 接口实现 ====================

// 1) 创建草稿
export const createDraft = async (data: LetterDraftCreateReqVO): Promise<number> => {
  return await request.post({ url: '/letter/draft/create', data })
}

// 2) 更新草稿
export const updateDraft = async (data: LetterDraftUpdateReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/draft/update', data })
}

// 3) 删除草稿
export const deleteDraft = async (id: number): Promise<boolean> => {
  return await request.delete({ url: `/letter/draft/delete?id=${id}` })
}

// 4) 批量删除草稿
export const batchDeleteDrafts = async (ids: number[]): Promise<boolean> => {
  return await request.delete({ url: '/letter/draft/batch-delete', data: ids })
}

// 5) 获取草稿详情
export const getDraft = async (id: number): Promise<LetterDraftRespVO> => {
  return await request.get({ url: `/letter/draft/get?id=${id}` })
}

// 6) 分页查询草稿
export const getDraftPage = async (params: LetterDraftPageReqVO): Promise<PageResult<LetterDraftRespVO>> => {
  return await request.get({ url: '/letter/draft/page', params })
}

// 7) 获取我的草稿列表
export const getMyDrafts = async (): Promise<LetterDraftRespVO[]> => {
  return await request.get({ url: '/letter/draft/my-drafts' })
}

// 8) 获取标星草稿列表
export const getStarredDrafts = async (): Promise<LetterDraftRespVO[]> => {
  return await request.get({ url: '/letter/draft/starred' })
}

// 9) 标星/取消标星
export const toggleDraftStar = async (id: number, isStarred: boolean): Promise<boolean> => {
  return await request.put({ url: `/letter/draft/star?id=${id}&isStarred=${isStarred}` })
}

// 10) 发送草稿
export const sendDraft = async (data: { id: number; sendNow: boolean }): Promise<boolean> => {
  return await request.post({ url: '/letter/draft/send', data })
}

// 11) 自动保存草稿
export const autoSaveDraft = async (data: LetterDraftUpdateReqVO): Promise<boolean> => {
  return await request.put({ url: '/letter/draft/auto-save', data })
}

// 12) 获取需定时发送的草稿
export const getScheduledDrafts = async (): Promise<LetterDraftRespVO[]> => {
  return await request.get({ url: '/letter/draft/scheduled' })
}

export type {
  LetterDraftCreateReqVO,
  LetterDraftUpdateReqVO,
  LetterDraftRespVO,
  LetterDraftPageReqVO,
  PageResult
}



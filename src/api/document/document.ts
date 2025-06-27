import request from '@/config/axios'

// 公文主表 VO
export interface DocumentVO {
  id: number // 公文主键id
  documentName: string // 公文标题名称
  documentType: number // 呈文类型
  publicityType: number // 公开类型
  deptId: number // 来文单位
  userId: number // 联系人
  documentPath: string // 公文地址
  documentNumber: string // 来文字号
  receiptNumber: string // 收文编号
  receiptTime: Date // 收文日期
  presentationContent?: string // 呈文内容
  deptName?: string // 部门名称
  userName?: string // 用户名称
  isUrgent?: boolean // 是否加急
  deadlineTime?: Date // 截止时间
  needReceipt?: boolean // 是否需要回执
  isMeeting?: boolean // 是否会议
}

export interface DocumentPageVO {
  circulationId: number // 流转记录ID
  deptName: string // 部门名称
  documentName: string // 文档名称
  id: number // 文档ID
  mobile: string // 手机号
  pageNo: number // 页码
  pageSize: number // 每页大小
  startTime?: number // 开始时间
  status?: number // 状态
  toBeCommittee?: number // 拟上常委会
  toBeDiscussed?: number // 拟上办公会
  type?: number // 类型
  typeName?: string // 类型名称
  updateTime?: number // 更新时间
  userName?: string // 用户名
  waitingCommittee?: number // 待上常委会
  waitingDiscuss?: number // 待上办公会
}

export interface DocumentInfoVO {
  id: number // 公文主键id
  circulationId: number // 当前用户的签办记录id
  message: string // 签办信息
  nextType: number // 下一步签办类型
  ids: number[] // 公文地址
}

export interface DocumentMeetingStatusVO {
  id: number // 公文主键id
  toBeDiscussed: number, // 拟上办公会
  waitingDiscuss: number, // 待上办公会
  toBeCommittee: number, // 拟上常委会
  waitingCommittee: number // 待上常委会
}

// 查询公文主表分页
export const getDocumentPage = async (params: any) => {
  return await request.get({ url: '/app/document/page', params })
}

// 查询公文主表详情
export const getDocument = async (id: number) => {
  return await request.get({ url: '/app/document/get', params: { id } })
}

// 新增公文主表
export const createDocument = async (data: DocumentVO) => {
  return await request.post({ url: '/app/document/create', data })
}

// 修改公文主表
export const updateDocument = async (data: DocumentVO) => {
  return await request.put({ url: '/app/document/update', data })
}

// 删除公文主表
export const deleteDocument = async (id: number) => {
  return await request.delete({ url: '/app/document/delete', params: { id } })
}

// 导出公文主表 Excel
export const exportDocument = async (params: any) => {
  return await request.get({ url: '/app/document/export-excel', params, responseType: 'blob' })
}

// 获取公文流转详情
export const getDocumentInfo = async (id: number, params?: { isTodo?: number }) => {
  console.log('发起文档信息请求，ID:', id, '参数:', params)
  return await request.get({ url: '/app/document/info', params: { id, ...params } })
}

// 保存用户签办信息
export const saveDocumentMessage = async (data: DocumentInfoVO) => {
  return await request.put({ url: '/app/document/saveMessage', data })
}

// 用户提交下一步签办事项
export const submitDocument = async (data: DocumentInfoVO) => {
  return await request.post({ url: '/app/document/submit', data })
}

// 更新公文上会状态
export const updateDocumentMeetingStatus = async (data: DocumentMeetingStatusVO) => {
  return await request.put({ url: '/app/document/updateMeetingStatus', data })
}

// 退回待办
export const cancelCirculation = async (data: DocumentInfoVO) => {
  return await request.post({ url: '/app/document/cancel', data })
}

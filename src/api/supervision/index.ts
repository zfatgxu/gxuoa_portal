import request from '@/config/axios'

// ========== 督办单相关 ==========

// 督办单分页查询参数
export interface OrderPageReqVO extends PageParam {
  content?: string // 督办内容（模糊查询）
  orderCode?: string // 督办编号（精确查询）
  leadDept?: string // 承办单位（模糊查询）
  orderType?: number // 督办类型：1=工作督办，2=专项督办
}

// 督办单保存请求
export interface OrderSaveReqVO {
  id?: number
  orderTitle: string // 督办标题
  type: number // 督办分类
  orderType?: number // 督办类型：1=工作督办，2=专项督办
  priority: number // 紧急程度
  deadline: string // 完成期限
  leadDept: number // 牵头单位ID
  supervisor: number // 督办人ID
  content: string // 督办内容
  undertakeMatter: string // 承办事项
  coDept?: string // 协办单位ID（逗号分隔）
  leadDeptDetail?: string // 牵头单位承办情况
}

// 督办单工作流更新请求（只传递修改的字段）
export interface OrderWorkflowUpdateReqVO {
  id: number // 督办单ID（必传）
  coDept?: string // 协办单位ID（逗号分隔）
  deptDetail?: string // 牵头单位承办情况
  startLeaderSelectAssignees?: Record<string, number[]> // 发起人自选审批人 Map，key为taskKey，value为用户ID数组
  fileLIst?: AttachmentFileInfo[] // 附件列表
}

// 附件文件信息
export interface AttachmentFileInfo {
  id?: number // 附件ID（可选，新上传的文件没有ID）
  name: string // 文件名
  url: string // 文件URL
  size: number // 文件大小（字节）
}

// 督办单完整信息（用于表单提交）
export interface OrderVO {
  id?: number
  orderCode?: string // 督办编号
  orderTitle: string // 督办标题
  type: number // 督办分类
  detailType?: string // 督办具体分类（从API获取的字符串）
  orderType?: number // 督办类型：1=工作督办，2=专项督办
  reason?: number // 督办依据
  priority: number // 紧急程度
  deadline: string // 完成期限
  leadDept: number // 牵头单位ID
  significance?: number // 重要程度
  coDept?: string // 协办单位ID（逗号分隔）
  supervisor: number // 督办人ID
  content: string // 督办内容
  undertakeMatter: string // 承办事项
  supervisionApprove?: number // 督察办审批状态
  leadDeptDetail?: string // 牵头单位承办情况
  supervisionReapprove?: number // 督察办复核状态
  summary?: string // 概述信息（字符串格式）
  startUserSelectAssignees?: Record<string, number[]> // 发起人自选审批人 Map，key为taskKey，value为用户ID数组
}

// 督办单响应 VO
export interface OrderRespVO {
  id: number // 督办单ID
  orderCode: string // 督办编号
  orderTitle: string // 督办标题
  type: number // 督办分类
  detailType?: string // 督办具体分类（字符串）
  reason: number // 督办依据
  priority: number // 紧急程度
  deadline: number // 完成期限（时间戳）
  leadDept: number | null // 牵头单位ID
  significance: number // 重要程度
  coDept: string | null // 协办单位
  supervisor: number // 督办人ID
  content: string // 督办内容
  undertakeMatter: string // 承办事项
  supervisionApprove: number | null // 督察办审批状态
  leadDeptDetail: string | null // 牵头单位承办情况
  supervisionReapprove: number | null // 督察办复核状态
  summary?: string // 概述信息
  officePhone?: string // 办公电话
  leader?: string // 分管领导
  processInstanceId: string // 流程实例ID
  createTime: number // 创建时间（时间戳）

  // 扩展字段（可能由后端计算返回）
  typeName?: string // 督办分类名称
  priorityName?: string // 紧急程度名称
  leadDeptName?: string // 牵头单位名称
  supervisorName?: string // 督办人姓名
  statusText?: string // 状态文本
  creatorName?: string // 创建人姓名
  isOverdue?: boolean // 是否超期
  remainingDays?: number // 剩余天数

  // 附件信息
  attachments?: AttachmentRespVO[] // 附件列表
}

// 督办分类选项接口响应
export interface SupervisionDetailTypeVO {
  value: number // 分类值
  label: string // 分类名称
}

// 督办单 API
export const OrderApi = {
  // 生成督办单唯一编码
  generateSupervisionOrderCode: async (): Promise<string> => {
    return await request.get({ url: `/bpm/supervision/generate-code` })
  },

  // 获取督办分类列表
  getSupervisionDetailTypes: async (type: number): Promise<string[]> => {
    return await request.get({ url: `/bpm/supervision/getListSupervisiondatailType/${type}` })
  },

  // 创建督办单
  createOrder: async (data: OrderVO) => {
    return await request.post({ url: `/bpm/supervision/create`, data })
  },

  // 更新督办单
  updateOrder: async (data: OrderSaveReqVO) => {
    return await request.put({ url: `/supervision/order/update`, data })
  },

  // 工作流中更新督办单（只传递修改的字段）
  updateOrderInWorkflow: async (data: OrderWorkflowUpdateReqVO) => {
    return await request.post({ url: `/bpm/supervision/update`, data })
  },

  // 删除督办单
  deleteOrder: async (id: number) => {
    return await request.delete({ url: `/supervision/order/delete?id=` + id })
  },

  // 获取督办单详情
  getOrder: async (id: number): Promise<OrderRespVO> => {
    return await request.get({ url: `/supervision/order/get?id=` + id })
  },

  // 根据流程实例ID获取督办单详情
  getOrderByProcessInstanceId: async (processInstanceId: string): Promise<OrderRespVO> => {
    return await request.get({ url: `/supervision/order/get/${processInstanceId}` })
  },

  // 查询督办单分页
  getOrderPage: async (params: OrderPageReqVO) => {
    return await request.get({ url: `/supervision/order/page`, params })
  },

  // 导出督办单 Excel
  exportOrder: async (params: OrderPageReqVO) => {
    return await request.download({ url: `/supervision/order/export-excel`, params })
  }
}

// 督办任务 API
export const SupervisionTaskApi = {
  // 获取督办待办任务列表
  getTodoTaskPage: async (params: any) => {
    return await request.get({ url: `/supervision/task/todo/page`, params })
  },

  // 获取督办已办任务列表
  getDoneTaskPage: async (params: any) => {
    return await request.get({ url: `/supervision/task/done/page`, params })
  },

  // 获取督办单详情（用于任务处理）
  getOrderDetailForTask: async (orderId: number) => {
    return await request.get({ url: `/supervision/task/order-detail?orderId=` + orderId })
  }
}

// ========== 督办任务相关 ==========

// 督办任务分页查询参数
export interface TaskPageReqVO extends PageParam {
  taskTitle?: string // 任务标题（模糊查询）
  orderId?: number // 督办单ID
  assignee?: number // 任务负责人ID
  status?: number // 任务状态
  orderType?: number // 督办类型：1=工作督办，2=专项督办
  orderCode?: string // 督办编号（精确查询）
}

// 督办任务保存请求
export interface TaskSaveReqVO {
  id?: number
  orderId: number // 督办单ID
  taskTitle: string // 任务标题
  taskContent: string // 任务内容
  assignee: number // 任务负责人ID
  deadline: string // 任务截止时间
  priority: number // 任务优先级
}

// 督办任务响应 VO
export interface TaskRespVO {
  id: number // 任务ID
  orderId: number // 督办单ID
  orderTitle: string // 督办单标题
  orderCode?: string // 督办编号
  orderType?: number // 督办类型：1=工作督办，2=专项督办
  taskTitle: string // 任务标题
  taskContent: string // 任务内容
  assignee: number // 任务负责人ID
  assigneeName: string // 任务负责人姓名
  deadline: string // 任务截止时间
  priority: number // 任务优先级
  priorityName: string // 优先级名称
  status: number // 任务状态
  statusText: string // 状态文本
  createTime: string // 创建时间
  creatorName: string // 创建人姓名
  isOverdue: boolean // 是否超期
  remainingDays: number // 剩余天数
}

// 督办任务 API
export const TaskApi = {
  // 创建督办任务
  createTask: async (data: TaskSaveReqVO) => {
    return await request.post({ url: `/supervision/task/create`, data })
  },

  // 更新督办任务
  updateTask: async (data: TaskSaveReqVO) => {
    return await request.put({ url: `/supervision/task/update`, data })
  },

  // 删除督办任务
  deleteTask: async (id: number) => {
    return await request.delete({ url: `/supervision/task/delete?id=` + id })
  },

  // 获取督办任务详情
  getTask: async (id: number): Promise<TaskRespVO> => {
    return await request.get({ url: `/supervision/task/get?id=` + id })
  },

  // 查询督办任务分页
  getTaskPage: async (params: TaskPageReqVO) => {
    return await request.get({ url: `/supervision/task/page`, params })
  },

  // 导出督办任务 Excel
  exportTask: async (params: TaskPageReqVO) => {
    return await request.download({ url: `/supervision/task/export-excel`, params })
  }
}

// ========== 督办附件相关 ==========

// 附件分页查询参数
export interface AttachmentPageReqVO extends PageParam {
  orderId?: number // 督办单ID
  fileName?: string // 文件名（模糊查询）
  fileType?: string // 文件类型
  category?: string // 附件分类
}

// 附件保存请求
export interface AttachmentSaveReqVO {
  id?: number
  fileName: string // 文件名
  category?: string // 附件分类
}

// 附件响应 VO
export interface AttachmentRespVO {
  id?: number // 附件ID
  orderId: number // 督办单ID
  name: string // 文件名
  url: string // 文件URL
  size: number // 文件大小（字节）
  type: string // 文件类型
  category: string // 附件分类
  categoryName?: string // 分类名称
  createTime?: string // 上传时间
  uploader?: number // 上传人ID
  uploaderName?: string // 上传人姓名
  canDelete?: boolean // 是否可删除
  canDownload?: boolean // 是否可下载
}

// 督办附件 API
export const AttachmentApi = {
  // 上传附件
  uploadAttachment: async (orderId: number, file: File, category: string = 'order') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('orderId', orderId.toString())
    formData.append('category', category)
    return await request.upload({ url: `/supervision/attachment/upload`, data: formData })
  },

  // 批量上传附件
  batchUploadAttachment: async (orderId: number, files: File[], category: string = 'order') => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('orderId', orderId.toString())
    formData.append('category', category)
    return await request.upload({ url: `/supervision/attachment/batch-upload`, data: formData })
  },

  // 查询附件详情
  getAttachment: async (id: number): Promise<AttachmentRespVO> => {
    return await request.get({ url: `/supervision/attachment/get?id=` + id })
  },

  // 获取附件列表
  getAttachmentList: async (orderId: number, category?: string): Promise<AttachmentRespVO[]> => {
    return await request.get({ url: `/supervision/attachment/list`, params: { orderId, category } })
  },

  // 创建附件记录
  createAttachment: async (data: AttachmentSaveReqVO) => {
    return await request.post({ url: `/supervision/attachment/create`, data })
  },

  // 删除附件
  deleteAttachment: async (id: number) => {
    return await request.delete({ url: `/supervision/attachment/delete?id=` + id })
  },

  // 查询附件分页
  getAttachmentPage: async (params: AttachmentPageReqVO) => {
    return await request.get({ url: `/supervision/attachment/page`, params })
  },

  // 更新附件信息
  updateAttachment: async (data: AttachmentSaveReqVO) => {
    return await request.put({ url: `/supervision/attachment/update`, data })
  },

  // 删除附件
  deleteAttachment: async (id: number) => {
    return await request.delete({ url: `/supervision/attachment/delete?id=` + id })
  },

  // 下载附件
  downloadAttachment: async (id: number) => {
    return await request.download({ url: `/supervision/attachment/download`, params: { id } })
  },

  // 导出附件 Excel
  exportAttachment: async (params: AttachmentPageReqVO) => {
    return await request.download({ url: `/supervision/attachment/export-excel`, params })
  }
}

// ========== 部门详情相关 ==========

// 部门详情统计数据响应
export interface DeptStatisticsRespVO {
  myTaskCount: number      // 我的任务数量
  ongoingCount: number     // 进行中任务数量 
  completedCount: number   // 已完成任务数量
  overdueCount: number     // 超时任务数量
}

// 部门任务项响应
export interface DeptTaskRespVO {
  id: number               // 任务ID
  title: string            // 任务标题
  description?: string     // 任务描述
  instruction?: string     // 领导批示
  issuer: string           // 下发单位
  collaborators: string[]  // 协办部门
  supervisor: string       // 分管领导
  deadline: string         // 截止日期
  createTime: string       // 创建时间
  remainingDays: number    // 剩余天数
  priority: string         // 优先级
  status: string           // 状态
  mainContent?: string     // 主要内容
  undertakingContent?: string  // 承办内容
}

// 部门任务分页查询参数
export interface DeptTaskPageReqVO extends PageParam {
  keyword?: string         // 搜索关键词
  department?: string      // 部门筛选
  status?: string          // 状态筛选
  tab?: string             // 当前选项卡
}

// 部门详情相关API
export const DeptApi = {
  // 获取部门统计数据
  getDeptStatistics: async (): Promise<DeptStatisticsRespVO> => {
    return await request.get({ url: `/supervision/dept/statistics` })
  },

  // 获取部门任务列表（分页）
  getDeptTaskPage: async (params: DeptTaskPageReqVO): Promise<PageResult<DeptTaskRespVO>> => {
    return await request.get({ url: `/supervision/dept/task/page`, params })
  },
  
  // 获取部门任务详情
  getDeptTask: async (id: number): Promise<DeptTaskRespVO> => {
    return await request.get({ url: `/supervision/dept/task/detail`, params: { id } })
  },
  
  // 添加任务进度
  addTaskProgress: async (taskId: number, data: { description: string, percentage: number }) => {
    return await request.post({ url: `/supervision/dept/task/progress`, data: { taskId, ...data } })
  }
}

// 分页结果基类
export interface PageResult<T> {
  list: T[]                // 数据列表
  total: number            // 总数据条数
  pageNo: number           // 当前页码
  pageSize: number         // 每页大小
}

// ========== 通用类型定义 ==========

// 分页参数基类
export interface PageParam {
  pageNo?: number // 页码，默认1
  pageSize?: number // 每页大小，默认20
}

import request from '@/config/axios'

// ========== 督办单相关 ==========

// 督办单分页查询参数
export interface OrderPageReqVO extends PageParam {
  content?: string // 督办内容（模糊查询）
  orderCode?: string // 督办编号（精确查询）
  leadDept?: string // 承办单位（模糊查询）
  type?: number // 督办类型：1=工作督办，2=专项督办
}

// ========== 督办流程实例 API ==========
export const SupervisionProcessApi = {
  // 通过流程定义 Key 启动督办相关流程（支持 businessKey）
  createProcessInstanceByKey: async (data: {
    processDefinitionKey: string
    businessKey: string
    variables?: Record<string, any>
    startUserSelectAssignees?: Record<string, number[]>
  }) => {
    return await request.post({ url: '/bpm/supervision/process-instance/create-by-key', data })
  }
}

// 督办单导出参数（专门用于导出功能）
export interface OrderExportReqVO {
  ids?: number[] // 要导出的督办单ID列表（可选，用于导出选中的特定行）
  content?: string // 督办内容（模糊查询）
  orderCode?: string // 督办编号（精确查询）
  leadDept?: string // 承办单位（模糊查询）
  type?: number // 督办类型：1=工作督办，2=专项督办
  supervisionStatus?: string // 督办状态：流程中、办结文件、否决文件
  createTimeStart?: string // 创建时间开始
  createTimeEnd?: string // 创建时间结束
  deadlineStart?: string // 完成期限开始
  deadlineEnd?: string // 完成期限结束
}

// 督办单工作流更新请求（只传递修改的字段）
export interface OrderWorkflowUpdateReqVO {
  id: number // 督办单ID（必传）
  leadDept?: string // 牵头单位ID（逗号分隔，支持多选）
  coDept?: string // 协办单位ID（逗号分隔）
  deptDetail?: string // 牵头单位承办情况
  detailType?: number // 督办具体分类ID
  fileList?: AttachmentFileInfo[] // 附件列表
  // 是否变更了办理/协办单位：1=有变更，2=无变更（仅 select_leaddept 节点计算并传递）
  deptChangeFlag?: number
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
  detailType?: number // 督办具体分类（数字ID）
  orderType?: number // 督办类型：1=工作督办，2=专项督办
  reason?: number // 督办依据
  priority: number // 紧急程度
  deadline: string // 完成期限
  leadDept: string // 牵头单位ID（逗号分隔，支持多选），创建时可为空字符串
  coDept?: string // 协办单位ID（逗号分隔）
  supervisor: string // 督办人ID（支持多选，逗号分隔），创建时必填
  content: string // 督办内容
  undertakeMatter?: string // 承办事项 - 创建时不传递，由后续流程填写
  reportFrequency?: number // 汇报频次 (对应数据库 report_frequency)
  isProjectSupervision?: boolean // 是否立项督办 (对应数据库 isProjectSupervision) - 创建时不传递
  isSupervisionClosed?: boolean // 是否结束督办 (对应数据库 isSupervisionClosed) - 创建时不传递
  leader?: number // 分管校领导ID，由后端根据牵头单位自动获取，前端不传递
  otherLeaders?: string // 其他校领导ID（逗号分隔，对应数据库 other_leaders）
  summary?: string // 概述信息（字符串格式）
  officePhone?: string // 办公电话
  // 发起人角色类型：1=督查办管理员(dcb_gly)，2=其他，3=督查办副主任(dcb_fzr)，4=督查办主任(dcb_zr)
  initiatorRoleType?: number
  // 工作流审批人配置由后端自动设置，前端不传递
  // 以下字段已废弃但保留兼容性，前端不需要传递
  significance?: number // 重要程度 (已废弃)
  supervisionApprove?: number // 督查办审批状态 (已废弃)
  leadDeptDetail?: string // 牵头单位承办情况 (已废弃)
  supervisionReapprove?: number // 督查办复核状态 (已废弃)
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
  leadDept: string | null // 牵头单位ID（逗号分隔，支持多选）
  coDept: string | null // 协办单位
  supervisors: Array<{
    id: number
    name: string
    phone: string
  }> // 督办人数组（包含详细信息）
  leadLeaders: Array<{
    id: number
    name: string
    type: string // "分管领导" 或 "其他分管领导"
  }> // 分管领导和其他校领导数组
  content: string // 督办内容
  deptDetail?: string | null // 工作推进情况
  reportFrequency?: number // 汇报频次
  isProjectSupervision?: boolean | null // 是否立项督办
  isSupervisionClosed?: boolean | null // 是否结束督办
  summary?: string // 概述信息
  processInstanceId?: string // 流程实例ID
  supervisionStatus?: number // 督办状态（1进行中、6已中止等）
  createTime: number // 创建时间（时间戳）
}

// 督办分类选项接口响应
export interface SupervisionDetailTypeVO {
  value: number // 分类值
  label: string // 分类名称
}

// 督办分类保存请求VO
export interface SupervisionTypeSaveReqVO {
  id?: number // 表id
  supervisionOrderType: number // 督办单类型：1=工作督办，2=专项督办
  type: string // 具体类型
  deleted?: boolean // 删除标识
}

// 督办分类响应VO
export interface SupervisionTypeRespVO {
  id: number // 表id
  supervisionOrderType: number // 督办单类型：1=工作督办，2=专项督办
  type: string // 具体类型
  deleted?: boolean // 删除标识
}

// 督办单 API
export const OrderApi = {
  // 生成督办单唯一编码
  generateSupervisionOrderCode: async (type: number): Promise<string> => {
    return await request.get({ url: `/bpm/supervision/generate-code`, params: { type } })
  },

  // 获取督办分类列表
  getSupervisionDetailTypes: async (type: number): Promise<SupervisionTypeRespVO[]> => {
    return await request.get({ url: `/bpm/supervision/getListSupervisiondatailType/${type}` })
  },

  // 创建督办分类
  createSupervisionType: async (data: SupervisionTypeSaveReqVO): Promise<number> => {
    return await request.post({ url: `/supervision/type/create`, data })
  },

  // 删除督办分类
  deleteSupervisionType: async (id: number) => {
    return await request.delete({ url: `/supervision/type/delete?id=${id}` })
  },

  // 创建督办单
  createOrder: async (data: OrderVO) => {
    return await request.post({ url: `/bpm/supervision/create`, data })
  },

  // 工作流中更新督办单（只传递修改的字段）
  updateOrderInWorkflow: async (data: OrderWorkflowUpdateReqVO) => {
    return await request.post({ url: `/bpm/supervision/update`, data })
  },

  // 删除督办单
  deleteOrder: (id: number) => {
    return request.delete({ url: `/supervision/order/${id}` })
  },

  // 中止督办单
  suspendOrder: (id: number) => {
    return request.post({ 
      url: `/supervision/order/${id}/suspend`
    })
  },

  // 恢复督办单
  resumeOrder: (id: number) => {
    return request.post({ url: `/supervision/order/${id}/resume` })
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
    return await request.get({ url: `bpm/supervision/page-with-participants`, params })
  },

  // 导出督办单 Excel
  exportOrder: async (params: OrderExportReqVO) => {
    return await request.download({ url: `/supervision/order/export-excel`, params })
  },

  // 根据督办人ID获取手机号
  getSupervisorPhone: async (supervisorId: number): Promise<string> => {
    return await request.get({ url: `/bpm/supervision/getSupervisorPhone/${supervisorId}` })
  },

  // 根据流程实例ID获取督办单任务详情
  getSupervisionOrderTaskDetail: async (processInstanceId: string) => {
    return await request.get({ url: `/bpm/supervision/getSupervisionOrderTaskDetail/${processInstanceId}` })
  },

  // 获取督办任务进度更新记录
  getSupervisionTaskDetail: async (processInstanceId: string, showAll?: boolean) => {
    const params = showAll ? { showAll: true } : {}
    return await request.get({
      url: `/bpm/supervision/getSupervisionTaskDetail/${processInstanceId}`,
      params
    })
  },

  // 根据流程实例ID获取附件列表
  getAttachments: async (processInstanceId: string) => {
    return await request.get({ url: `/bpm/supervision/getAttachments/${processInstanceId}` })
  },

  // 添加督办进度更新记录
  insertSupervisionOrderTaskNew: async (data: {
    processInstanceId: string
    deptDetail: string
    planTime?: string
    fileList?: Array<{
      name: string
      url: string
      size?: string
      // 注意：新上传的文件不需要传id，后端会自动生成
    }>
  }) => {
    return await request.post({ url: '/bpm/supervision/insertSupervisionOrderTaskNew', data })
  },
  
}

// 督办任务 API
export const SupervisionTaskApi = {

  // 获取督办单详情（用于任务处理）
  getOrderDetailForTask: async (orderId: number) => {
    return await request.get({ url: `/supervision/task/order-detail?orderId=` + orderId })
  },

  // 获取督办待办任务列表（新接口）
  getSupervisionTodoPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/lead-dept-todo-page`, params })
  },

  // 获取督办已办任务列表（新接口）
  getSupervisionDonePage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/done-page`, params })
  },

  // 获取协办部门待办任务列表
  getCoDeptTodoPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/co-dept-todo-page`, params })
  },

  // 获取全部事项任务列表（领导界面）
  getAllTasksPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/all-tasks-page`, params })
  },

  // 获取需要关注任务列表（领导界面）
  getAttentionTasksPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/attention-tasks-page`, params })
  },

  // 获取督办待办任务列表（督查督办首页）
  getTodoPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/todo-page`, params })
  },

  // 获取合并的全部任务（待办+已办）按最新进展时间排序
  getMergedAllTasksPage: async (params: any) => {
    return await request.get({ url: `/bpm/supervision/merged-all-tasks-page`, params })
  }
}


// ========== 督办首页相关 ==========

// 督办单参与者用户信息
export interface ParticipantUserVO {
  nickname: string // 用户昵称
  deptId: number // 部门ID
  userId: string // 用户ID
}

// 督办单详细信息（首页接口返回）
export interface SupervisionOrderDetailVO {
  createTime: number // 创建时间（时间戳）
  updateTime: number // 更新时间（时间戳）
  creator: string // 创建人ID
  updater: string // 更新人ID
  deleted: boolean // 是否删除
  id: number // 督办单ID
  orderCode: string // 督办编号
  orderTitle: string // 督办标题
  type: number // 督办类型：1=工作督办，2=专项督办
  reason: number | null // 督办依据
  priority: number // 紧急程度
  deadline: number | null // 完成期限（时间戳）
  leadDept: number // 牵头单位ID
  leadDeptName?: string // 牵头单位名称
  significance: number | null // 重要程度
  coDept: string | null // 协办单位ID（逗号分隔）
  coDeptNameMap?: Record<string, string> | null // 协办单位名称映射
  supervisor: number // 督办人ID
  leaderNickname?: string // 分管领导姓名
  content: string // 督办内容
  undertakeMatter: string // 承办事项
  supervisionApprove: number // 督查办审批状态
  deptDetail: string // 牵头单位承办情况
  supervisionReapprove: number | null // 督查办复核状态
  processInstanceId: string // 流程实例ID
  summary: string // 概述信息
  supervisionStatus?: string // 督办状态
  participants: string[] // 参与者用户ID数组
  participantUsers: ParticipantUserVO[] // 参与者用户详细信息
}

// 督办统计数据响应接口
export interface SupervisionStatisticsVO {
  monthInProgress: number // 本月进行中
  monthOverdue: number // 本月超时
  monthTotal: number // 本月总数
  monthCompleted: number // 本月完成
  specialSupervision: number // 专项督办总数
  workSupervision: number // 工作督办总数
  // 新增字段
  ongoingCount: number // 进行中数量
  overtimeCount: number // 已超时数量
  completedCount: number // 已结束数量
  monthlyData: MonthlyDataItem[] // 月度数据
}

// 月度数据项接口
export interface MonthlyDataItem {
  categoryType: 'type' | 'category' // 分类类型：type=督办类型，category=督办分类
  month: number // 月份
  count: number // 数量
  categoryName: string // 分类名称
}

// 部门月度任务统计数据响应接口
export interface DeptMonthTaskStatisticsVO {
  monthInProgress: number // 本月进行中
  monthOverdue: number // 本月超时提醒
  monthCompleted: number // 本月已完成
  monthNew: number // 本月我的任务
}

// 分管领导月度任务统计数据响应接口
export interface LeaderMonthTaskStatisticsVO {
  monthInProgress: number // 本月进行中
  monthOverdue: number // 本月需要关注
  monthNew: number // 本月我的分管事项
  monthRemark: number // 本月已批示
}

// 督办首页API
export const SupervisionIndexApi = {
  // 获取督办首页数据（支持分页、类型过滤和搜索）
  getIndexData(params?: {
    pageNo?: number;
    pageSize?: number;
    type?: number | number[]; // 督办类型（单个或数组）
    orderTitle?: string;
    priority?: number | number[]; // 优先级（单个或数组）
    supervisionStatus?: number;
    supervisionStatusList?: number[];
    // 高级筛选参数
    startTime?: string;
    endTime?: string;
    supervisionTypes?: number[]; // 督办分类
    remarkStatus?: number[]; // 批示状态
    schoolLeaders?: string; // 校领导ID，逗号分隔
    supervisors?: string; // 督办人ID，逗号分隔
    leadDept?: string; // 牵头单位ID，逗号分隔
    coDept?: string; // 协办单位ID，逗号分隔
  }): Promise<{ list: SupervisionOrderDetailVO[]; total: number }> {
    return request.get({
      url: '/bpm/supervision/page-with-participants',
      params: {
        pageNo: params?.pageNo || 1,
        pageSize: params?.pageSize || 10,
        type: params?.type,
        orderTitle: params?.orderTitle,
        priority: params?.priority,
        supervisionStatus: params?.supervisionStatus,
        supervisionStatusList: params?.supervisionStatusList,
        // 高级筛选参数
        startTime: params?.startTime,
        endTime: params?.endTime,
        supervisionTypes: params?.supervisionTypes,
        remarkStatus: params?.remarkStatus,
        schoolLeaders: params?.schoolLeaders,
        supervisors: params?.supervisors,
        leadDept: params?.leadDept,
        coDept: params?.coDept
      }
    }).then(response => {
      // 简化响应格式处理，优先使用最常见的格式
      const data = response?.data || response
      const list = data?.list || (Array.isArray(data) ? data : [])
      const total = data?.total || list.length

      return {
        list,
        total
      }
    })
  },

  // 获取督办统计数据
  getStatistics(): Promise<SupervisionStatisticsVO> {
    return request.get({ url: '/bpm/supervision/getStatistics' })
  },

  // 获取部门月度任务统计数据
  getDeptMonthTaskStatistics(): Promise<DeptMonthTaskStatisticsVO> {
    return request.get({ url: '/bpm/supervision/getMyMonthTaskStatistics' })
  },

  // 获取分管领导月度任务统计数据
  getLeaderMonthTaskStatistics(): Promise<LeaderMonthTaskStatisticsVO> {
    return request.get({ url: '/bpm/supervision/getLeaderMonthTaskStatistics' })
  },

  // 督办拒绝接口
  supervisionReject(processInstanceId: string): Promise<void> {
    return request.get({ url: `/bpm/supervision/supervision-reject/${processInstanceId}` })
  }
}

// ========== 批示相关接口 ==========

// 批示信息接口
export interface LeaderRemarkVO {
  leaderId: number // 领导ID
  leaderNickName: string // 领导姓名
  remark: string // 批示内容
  leadDeptName: string // 部门名称
}

// 新增批示请求接口
export interface InsertLeaderRemarkReqVO {
  processInstanceId: string // 流程实例ID
  remark: string // 批示内容
}

// 批示相关API
export const LeaderRemarkApi = {
  // 新增批示
  insertLeaderRemark: async (data: InsertLeaderRemarkReqVO) => {
    return await request.post({ url: '/bpm/supervision/insertLeaderRemark', data })
  },

  // 获取批示列表
  getLeaderRemark: async (processInstanceId: string): Promise<LeaderRemarkVO[]> => {
    return await request.get({
      url: `/bpm/supervision/getLeaderRemark/${processInstanceId}`
    })
  }
}

// ========== 关注相关接口 ==========

// 关注督办单请求参数
export interface SupervisionOrderFollowReqVO {
  processInstanceId: string // 流程实例ID
  followStatus: boolean // 关注状态：true=关注，false=取消关注
}

// 关注相关API
export const SupervisionFollowApi = {
  // 关注/取消关注督办单
  toggleFollow: async (data: SupervisionOrderFollowReqVO) => {
    return await request.post({ url: '/supervision/follow/toggle', data })
  },

  // 获取我的关注列表
  getMyFollowList: async (params: PageParam) => {
    return await request.get({ url: '/supervision/follow/my-follows', params })
  }
}

// ========== 标记已读相关接口 ==========

// 标记已读请求参数
export interface MarkReadReqVO {
  orderId: number // 督办单ID
}

// 标记已读相关API
export const MarkReadApi = {
  // 标记督办单已读
  markRead: async (orderId: number) => {
    return await request.post({ url: '/supervision/order/read/mark', data: { orderId } })
  }
}

// ========== 任务操作相关接口 ==========

// 撤回代管请求参数
export interface RevokeTaskDelegationReqVO {
  taskId: string // 任务ID
  reason?: string // 撤回理由（可选）
}

// 任务操作相关API
export const SupervisionTaskOperationApi = {
  // 撤回代管（督办专用）
  revokeTaskDelegation: async (data: RevokeTaskDelegationReqVO) => {
    return await request.post({ url: '/bpm/supervision/task/revoke-delegation', data })
  }
}

// ========== 督办计划记录相关 API ==========

// 督办计划记录提交请求
export interface PlanEntrySubmitReqVO {
  processInstanceId: string // 流程实例ID
  targetUserId: number // 办理人用户ID
  targetUserName: string // 办理人用户名
  targetDeptName: string // 办理人部门名称
  periodDate: string // 期次日期 (YYYY-MM-DD)
  summary?: string // 计划内容摘要
  fileList?: AttachmentFileInfo[] // 附件列表
}

// 督办计划记录审核请求
export interface PlanEntryAuditReqVO {
  processInstanceId: string // 流程实例ID
  targetUserId: number // 办理人用户ID
  periodDate: string // 期次日期 (YYYY-MM-DD)
  decision: number // 审核决策：1-通过，2-不通过
  remark?: string // 审核备注
  delayNext?: boolean // 是否顺延到下一期
  reportFrequency?: number // 汇报频次
  deadline?: string // 截止日期 (YYYY-MM-DD)
}

// 督办计划记录响应
export interface PlanEntryRespVO {
  id: number // 记录ID
  processInstanceId: string // 流程实例ID
  targetUserId: number // 办理人用户ID
  targetUserName: string // 办理人用户名
  targetDeptName: string // 办理人部门名称
  periodDate: string // 期次日期
  summary?: string // 计划内容摘要
  status: string // 状态：draft/submitted/approved/rejected/pending_delay
  statusDisplay: string // 状态显示名称
  isDelayedPlaceholder: boolean // 是否为顺延占位记录
  sourceEntryId?: number // 源记录ID（顺延时）
  fileCount: number // 附件数量
  attachmentInfo?: string // 附件信息（JSON格式）
  version: number // 版本号
  createTime: string // 创建时间
  updateTime: string // 更新时间
}

// 督办计划记录审核结果
export interface PlanEntryAuditResultVO {
  currentEntry: PlanEntryRespVO // 当前记录
  hasNextPeriod: boolean // 是否有下一期记录
  nextPeriodEntry?: PlanEntryRespVO // 下一期记录（顺延时）
}

// 督办计划记录批量提交请求
export interface PlanEntryBatchSubmitReqVO {
  processInstanceId: string // 流程实例ID
  targetUserId: number // 办理人用户ID
  targetUserName: string // 办理人用户名
  targetDeptName: string // 办理人部门名称
  entries: PlanEntryBatchItem[] // 计划记录列表
}

// 批量提交的计划记录项
export interface PlanEntryBatchItem {
  periodDate: string // 期次日期 (YYYY-MM-DD)
  summary?: string // 计划内容摘要
  fileList?: AttachmentFileInfo[] // 附件列表
}

// 督办计划记录批量提交结果
export interface PlanEntryBatchSubmitResultVO {
  submittedEntries: PlanEntryRespVO[] // 成功提交的记录列表
  totalCount: number // 总记录数
  successCount: number // 成功提交数
  allSuccess: boolean // 是否全部成功
}

// 督办计划记录 API
export const PlanEntryApi = {
  // 提交计划记录
  submit: async (data: PlanEntrySubmitReqVO) => {
    return await request.post({ url: '/supervision/plan/entry/submit', data })
  },
  
  // 查询计划记录列表
  list: async (processInstanceId: string, targetUserId?: number) => {
    const params: any = { processInstanceId }
    if (targetUserId) {
      params.targetUserId = targetUserId
    }
    return await request.get({ url: '/supervision/plan/entry/list', params })
  },
  
  // 按版本类型查询计划记录列表
  listByVersionType: async (processInstanceId: string, versionType: string, targetUserId?: number) => {
    const params: any = { processInstanceId, versionType }
    if (targetUserId) {
      params.targetUserId = targetUserId
    }
    return await request.get({ url: '/supervision/plan/entry/list-by-version', params })
  },
  
  // 查询单个计划记录
  get: async (processInstanceId: string, targetUserId: number, periodDate: string) => {
    return await request.get({ 
      url: '/supervision/plan/entry/get', 
      params: { processInstanceId, targetUserId, periodDate }
    })
  },
  
  // 审核计划记录
  audit: async (data: PlanEntryAuditReqVO) => {
    return await request.post({ url: '/supervision/plan/entry/audit', data })
  },
  
  // 批量提交模板版计划记录
  submitBatchTemplate: async (data: PlanEntryBatchSubmitReqVO) => {
    return await request.post({ url: '/supervision/plan/entry/submit-batch-template', data })
  }
}

// ========== 通用类型定义 ==========

// 分页参数基类
export interface PageParam {
  pageNo?: number // 页码，默认1
  pageSize?: number
}

import request from '@/config/axios'

export interface PetitionVO {
  id: number
  petitionNo: string
  title: string
  content: string
  visitorName: string
  visitorPhone: string
  visitorEmail: string
  visitorAddress: string
  visitorIdentity: string
  sourceType: number
  petitionType: number
  categoryType: number
  urgencyLevel: number
  status: number
  isPublic: boolean
  isAnonymous: boolean
  isNational: boolean
  isIllegal: boolean
  isFake: boolean
  satisfaction: number
  deptId: number
  deptName: string
  userId: number
  userName: string
  processInstanceId: string
  receiveTime: Date
  deadline: Date
  completeTime: Date
  remark: string
  createTime: Date
  attachments: string[]
}

export interface PetitionPageReqVO extends PageParam {
  petitionNo?: string
  title?: string
  visitorName?: string
  visitorPhone?: string
  sourceType?: number
  petitionType?: number
  categoryType?: number
  urgencyLevel?: number
  status?: number
  deptId?: number
  userId?: number
  createTime?: Date[]
}

export interface PetitionExportReqVO {
  petitionNo?: string
  title?: string
  visitorName?: string
  visitorPhone?: string
  sourceType?: number
  petitionType?: number
  categoryType?: number
  urgencyLevel?: number
  status?: number
  deptId?: number
  userId?: number
  createTime?: Date[]
}

export interface PetitionHandleVO {
  id: number
  petitionId: number
  deptId: number
  deptName: string
  userId: number
  userName: string
  handleType: number
  handleResult: number
  handleContent: string
  handleTime: Date
  isPublic: boolean
  processInstanceId: string
  taskId: string
  remark: string
  createTime: Date
}

// 创建信访
export const createPetition = (data: PetitionVO) => {
  return request.post({ url: '/petition/create', data })
}

// 更新信访
export const updatePetition = (data: PetitionVO) => {
  return request.put({ url: '/petition/update', data })
}

// 删除信访
export const deletePetition = (id: number) => {
  return request.delete({ url: `/petition/delete?id=${id}` })
}

// 获取信访
export const getPetition = (id: number) => {
  return request.get<PetitionVO>({ url: `/petition/get?id=${id}` })
}

// 获取信访分页
export const getPetitionPage = (params: PetitionPageReqVO) => {
  return request.get<PageResult<PetitionVO>>({ url: '/petition/page', params })
}

// 导出信访
export const exportPetition = (params: PetitionExportReqVO) => {
  return request.download({ url: '/petition/export', params })
}

// 获取信访处理记录
export const getPetitionHandleList = (petitionId: number) => {
  return request.get<PetitionHandleVO[]>({ url: `/petition/handle/list?petitionId=${petitionId}` })
}

// 处理信访
export const handlePetition = (data: PetitionHandleVO) => {
  return request.post({ url: '/petition/handle/create', data })
}

// 取消信访
export const cancelPetition = (id: number) => {
  return request.put({ url: `/petition/cancel?id=${id}` })
}

// 获取流程详情
export const getProcessDetail = (processInstanceId: string) => {
  return request.get({ url: `/bpm/process-instance/get?id=${processInstanceId}` })
}

// Mock数据
export const mockPetitionList: PetitionVO[] = [
  {
    id: 1,
    petitionNo: 'XF202504300001',
    title: '关于学校食堂饭菜质量问题的投诉',
    content: '学校食堂的饭菜质量近期有所下降，希望学校能够重视并改进。',
    visitorName: '张三',
    visitorPhone: '13800138000',
    visitorEmail: 'zhangsan@example.com',
    visitorAddress: '广西壮族自治区南宁市',
    visitorIdentity: '450100199001010001',
    sourceType: 1,
    petitionType: 3,
    categoryType: 1,
    urgencyLevel: 2,
    status: 2,
    isPublic: true,
    isAnonymous: false,
    isNational: false,
    isIllegal: false,
    isFake: false,
    satisfaction: null,
    deptId: 101,
    deptName: '后勤管理处',
    userId: 1001,
    userName: '李四',
    processInstanceId: 'PROC-1001',
    receiveTime: new Date('2025-04-22 10:00:00'),
    deadline: new Date('2025-05-06 10:00:00'),
    completeTime: null,
    remark: '',
    createTime: new Date('2025-04-21 09:30:00'),
    attachments: ['evidence1.jpg', 'evidence2.jpg']
  },
  {
    id: 2,
    petitionNo: 'XF202504300002',
    title: '关于教师教学态度的建议',
    content: '希望学校能够加强对教师教学态度的监督，提高教学质量。',
    visitorName: '李明',
    visitorPhone: '13900139000',
    visitorEmail: 'liming@example.com',
    visitorAddress: '广西壮族自治区桂林市',
    visitorIdentity: '450300199203030003',
    sourceType: 2,
    petitionType: 2,
    categoryType: 2,
    urgencyLevel: 3,
    status: 3,
    isPublic: false,
    isAnonymous: false,
    isNational: false,
    isIllegal: false,
    isFake: false,
    satisfaction: 1,
    deptId: 102,
    deptName: '教务处',
    userId: 1002,
    userName: '王五',
    processInstanceId: 'PROC-1002',
    receiveTime: new Date('2025-04-15 14:00:00'),
    deadline: new Date('2025-04-29 14:00:00'),
    completeTime: new Date('2025-04-28 16:30:00'),
    remark: '已解决',
    createTime: new Date('2025-04-15 13:45:00'),
    attachments: []
  },
  {
    id: 3,
    petitionNo: 'XF202504300003',
    title: '关于学生宿舍管理的咨询',
    content: '想了解学校对学生宿舍管理的相关规定和政策。',
    visitorName: '王丽',
    visitorPhone: '13700137000',
    visitorEmail: 'wangli@example.com',
    visitorAddress: '广西壮族自治区北海市',
    visitorIdentity: '450500199405050005',
    sourceType: 3,
    petitionType: 1,
    categoryType: 3,
    urgencyLevel: 3,
    status: 1,
    isPublic: true,
    isAnonymous: false,
    isNational: false,
    isIllegal: false,
    isFake: false,
    satisfaction: null,
    deptId: null,
    deptName: '',
    userId: null,
    userName: '',
    processInstanceId: null,
    receiveTime: null,
    deadline: null,
    completeTime: null,
    remark: '',
    createTime: new Date('2025-04-29 16:20:00'),
    attachments: []
  }
]

export const mockPetitionHandleList: PetitionHandleVO[] = [
  {
    id: 1,
    petitionId: 1,
    deptId: 101,
    deptName: '广西壮族自治区信访局',
    userId: 1001,
    userName: '管理员',
    handleType: 1,
    handleResult: 1,
    handleContent: '已收到信访件，转交相关部门处理',
    handleTime: new Date('2025-04-22 15:50:18'),
    isPublic: true,
    processInstanceId: 'PROC-1001',
    taskId: 'TASK-1001',
    remark: '',
    createTime: new Date('2025-04-22 15:50:18')
  },
  {
    id: 2,
    petitionId: 1,
    deptId: 102,
    deptName: '自治区教育厅信访处',
    userId: 1002,
    userName: '处理员',
    handleType: 2,
    handleResult: 1,
    handleContent: '已审核，转交教育厅处理',
    handleTime: new Date('2025-04-22 15:55:19'),
    isPublic: true,
    processInstanceId: 'PROC-1001',
    taskId: 'TASK-1002',
    remark: '',
    createTime: new Date('2025-04-22 15:55:19')
  },
  {
    id: 3,
    petitionId: 1,
    deptId: 103,
    deptName: '广西大学广西大学',
    userId: 1003,
    userName: '学校管理员',
    handleType: 3,
    handleResult: 1,
    handleContent: '已接收，正在处理中',
    handleTime: new Date('2025-04-25 11:55:40'),
    isPublic: true,
    processInstanceId: 'PROC-1001',
    taskId: 'TASK-1003',
    remark: '',
    createTime: new Date('2025-04-25 11:55:40')
  }
]

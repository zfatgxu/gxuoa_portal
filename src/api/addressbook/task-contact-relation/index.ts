import request from '@/config/axios'

// 任务参与单位信息
export interface TaskContactDO {
  id: number
  taskId: number
  deptId: number
  deptName: string
  processInstanceId?: string
  workflowVersion?: number
  parentRecordId?: number
  submitTime?: string
  submitUserId?: number
  submitUserName?: string
  signature?: string
  status: string
  result?: number
  createTime: string
  updateTime: string
  approver: string
}

// 联系人信息
export interface ContactDO {
  id: number
  taskContactId: number
  name: string
  position?: string
  phone1?: string
  phone2?: string
  extension1?: string
  extension2?: string
  createTime: string
  updateTime: string
}

// 通讯录提交流程信息
export interface ContactsSubmitDO {
  id: number
  processInstanceId: string
  submitterName: string
  submitterPhone: string
  submitTime: string
  contactsDescription: string
  status: number
  result: number
  createTime: string
  updateTime: string
}

// 工作流联系人响应类型
export interface WorkflowContactsRespVO {
  processInstanceId: string
  taskId: number
  taskName: string
  deptId: number
  deptName: string
  taskContactId: number
  submitTime: string
  submitUserId: number
  submitUserName: string
  signature: string
  status: number
  result: number
  contacts: ContactDO[]
  contactsSubmit: ContactsSubmitDO
  createTime: string
  updateTime: string
}

// 任务联系人关联 API
export const taskContactRelationApi = {
  // 根据工作流ID获取联系人数据
  getWorkflowContacts: async (processInstanceId: string) => {
    return await request.get<WorkflowContactsRespVO>({ 
      url: `/addressbook/task-contact-relation/workflow-contacts`, 
      params: { processInstanceId } 
    })
  },

  // 获取最新版本的任务参与单位记录
  getLatestTaskContact: async (taskId: number, deptId: number) => {
    return await request.get<TaskContactDO>({ 
      url: `/addressbook/task-contact-relation/latest-task-contact`, 
      params: { taskId, deptId } 
    })
  }
}

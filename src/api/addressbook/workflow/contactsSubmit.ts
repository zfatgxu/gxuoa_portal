import request from '@/config/axios'

// 创建联系人并提交工作流
export interface CreateWithContactsReqVO {
  mode?: "create" | "existing"  // 处理模式
  taskId?: number               // 任务ID
  deptId?: number               // 部门ID
  taskContactId?: number        // 现有的任务参与单位ID
  contacts?: Array<{
    name: string
    position?: string
    phone1?: string
    phone2?: string
    extension1?: string
    extension2?: string
  }>
  submitterName: string
  submitterPhone: string
  submitTime: string
  contactsDescription?: string
  startUserSelectAssignees?: Record<string, number[]>
}

export const createWithContacts = async (data: CreateWithContactsReqVO) => {
  return await request.post({ url: '/addressbook/contacts-submit/create-with-contacts', data })
}


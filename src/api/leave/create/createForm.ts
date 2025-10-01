import request from '@/config/axios';
export interface RegisterFileVO {
  leaveRegisterId: number // 关联LEAVE_REGISTER
  leaveFileUrl: string // 证明材料路径
  leaveFileName: string // 证明材料名称
  leaveFileSize: number // 证明材料大小
}

// 请假登记 API
export const RegisterApi = {
  // 查询请假登记分页
  getRegisterPage: async (params: any) => {
    return await request.get({ url: `/leave/register/page`, params })
  },

  // 查询请假待办分页
  getRegisterTodoPage: async (params: any) => {
    return await request.get({ url: `/leave/register/todo-page`, params })
  },

  // 查询请假待办分页
  getRegisterDonePage: async (params: any) => {
    return await request.get({ url: `/leave/register/done-page`, params })
  },

  // 查询请假登记详情
  getRegister: async (id: number) => {
    return await request.get({ url: `/leave/register/get?id=` + id })
  },

  getRegisterId: async (processInstanceId: string) => {
    return await request.get({ url: `/leave/register/getId?processInstanceId=` + processInstanceId })
  },

  // 新增请假登记
  createRegister: async (data: any) => {
    return await request.post({ url: `/leave/register/create`, data })
  },

  // 修改请假登记
  updateRegister: async (data: any) => {
    return await request.put({ url: `/leave/register/update`, data })
  },

  // 删除请假登记
  deleteRegister: async (id: number) => {
    return await request.delete({ url: `/leave/register/delete?id=` + id })
  },

  // 导出请假登记 Excel
  exportRegister: async (params) => {
    return await request.download({ url: `/leave/register/export-excel`, params })
  },
}
// 请假理由附件 API
export const RegisterFileApi = {
  // 查询请假理由附件分页
  getRegisterFilePage: async (params: any) => {
    return await request.get({ url: `/leave/register-file/page`, params })
  },

  // 查询请假理由附件详情
  getRegisterFile: async (id: number) => {
    return await request.get({ url: `/leave/register-file/getlist?registerId=` + id })
  },

  // 新增请假理由附件
  createRegisterFile: async (data: RegisterFileVO) => {
    return await request.post({ url: `/leave/register-file/create`, data })
  },

  // 修改请假理由附件
  updateRegisterFile: async (data: RegisterFileVO) => {
    return await request.put({ url: `/leave/register-file/update`, data })
  },

  // 删除请假理由附件
  deleteRegisterFile: async (id: number) => {
    return await request.delete({ url: `/leave/register-file/delete?id=` + id })
  },

  // 导出请假理由附件 Excel
  exportRegisterFile: async (params) => {
    return await request.download({ url: `/leave/register-file/export-excel`, params })
  },
}
// 请假理由表单 API
export const ReasonFormApi = {
  // 查询请假理由表单分页
  getReasonFormPage: async (params: any) => {
    return await request.get({ url: `/leave/reason-form/page`, params })
  },

  // 查询请假理由表单详情
  getReasonForm: async (id: number) => {
    return await request.get({ url: `/leave/reason-form/getlist?registerId=` + id })
  },

  // 新增请假理由表单
  createReasonForm: async (data: any) => {
    return await request.post({ url: `/leave/reason-form/create`, data })
  },

  // 修改请假理由表单
  updateReasonForm: async (data: any) => {
    return await request.put({ url: `/leave/reason-form/update`, data })
  },

  // 删除请假理由表单
  deleteReasonForm: async (id: number) => {
    return await request.delete({ url: `/leave/reason-form/delete?id=` + id })
  },

  // 导出请假理由表单 Excel
  exportReasonForm: async (params) => {
    return await request.download({ url: `/leave/reason-form/export-excel`, params })
  },
}
// 销假 API
export const CancelFormApi = {
  // 新增销假流程
  createCancelForm: async (params:any) => {
    return await request.get({ url: `/leave/app-cancel-form/create`,params})
  },
  // 查询销假表单id
  getCancelFormId: async (processInstanceId: string) => {
    return await request.get({ url: `/leave/app-cancel-form/get-leaveRegisterId`, params: { processInstanceId: processInstanceId } })
  },
  // 查询销假表单分页
  getCancelFormPage: async (params: any) => {
    return await request.get({ url: `/leave/app-cancel-form/page`, params })
  },
}
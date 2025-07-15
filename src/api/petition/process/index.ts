import request from '@/config/axios'

// 信访办理信息 VO
export interface ProcessVO {
  id: number // 处理过程ID
  petitionId: number // 信访ID
  department: string // 处理部门
  processType: string // 处理类型
  targetDepartment: string // 目标部门
  processTime: Date // 处理时间
  operation: string // 操作
}

// 信访办理信息 API
export const ProcessApi = {
  // 查询信访办理信息分页
  getProcessPage: async (params: any) => {
    return await request.get({ url: `/petition/process/page`, params })
  },

  // 查询信访办理信息详情
  getProcess: async (id: number) => {
    return await request.get({ url: `/petition/process/get?id=` + id })
  },

  // 新增信访办理信息
  createProcess: async (data: ProcessVO) => {
    return await request.post({ url: `/petition/process/create`, data })
  },

  // 修改信访办理信息
  updateProcess: async (data: ProcessVO) => {
    return await request.put({ url: `/petition/process/update`, data })
  },

  // 删除信访办理信息
  deleteProcess: async (id: number) => {
    return await request.delete({ url: `/petition/process/delete?id=` + id })
  },

  // 根据信访ID获取办理流程列表
  getProcessListByPetitionId: async (petitionId: number) => {
    return await request.get({ url: `/petition/process/list-by-petition-id?petitionId=` + petitionId })
  },

  // 导出信访办理信息 Excel
  exportProcess: async (params) => {
    return await request.download({ url: `/petition/process/export-excel`, params })
  },
}
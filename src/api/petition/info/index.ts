import request from '@/config/axios'

// 信访信息 API
export const InfoApi = {
  // 查询信访信息分页
  getInfoPage: async (params: any) => {
    return await request.get({ url: `/petition/info/page`, params })
  },

  // 查询信访信息详情
  getInfo: async (id: number) => {
    return await request.get({ url: `/petition/info/get?id=` + id })
  },

  // 新增信访信息
  createInfo: async (data: any) => {
    return await request.post({ url: `/petition/info/create`, data })
  },

  // 修改信访信息
  updateInfo: async (data: any) => {
    return await request.put({ url: `/petition/info/update`, data })
  },

  // 删除信访信息
  deleteInfo: async (id: number) => {
    return await request.delete({ url: `/petition/info/delete?id=` + id })
  },

  // 导出信访信息 Excel
  exportInfo: async (params) => {
    return await request.download({ url: `/petition/info/export-excel`, params })
  },
  
  // 根据处理状态查询信访信息分页
  getInfoPageByProcessStatus: async (processStatus: string, params: any) => {
    return await request.get({ url: `/petition/info/page-by-process-status?processStatus=${processStatus}`, params })
  },
}

import request from '@/config/axios'

// 信访信息 VO
export interface InfoVO {
  id: number                // 信访 ID
  receiptNo: string         // 受理编号
  title: string             // 标题
  content: string           // 内容（缺失，需补上）
  deptId: number            // 处理单位 ID
  deptName: string          // 处理单位名称
  recipientId: number       // 接收人 ID
  recipientName: string     // 接收人姓名（缺失，需补上）
  source: string            // 来源（如“信访系统”）
}

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
  createInfo: async (data: InfoVO) => {
    return await request.post({ url: `/petition/info/create`, data })
  },

  // 修改信访信息
  updateInfo: async (data: InfoVO) => {
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

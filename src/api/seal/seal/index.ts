import request from '@/config/axios'

// 印章 VO
export interface sealVO {
  id: number // 印章表表单ID
  sealId: string // 印章编号
  sealName: string // 印章名称
  orgName: string // 所属单位
  orgId: number // 所属单位ID
  createName: string // 上传人名称
  enableFlag: boolean // 启用表示： 1=启用，0=停用
}

// 印章 API
export const sealApi = {
  // 查询印章分页
  getsealPage: async (params: any) => {
    return await request.get({ url: `/seal/seal/page`, params })
  },

  // 查询印章详情
  getseal: async (id: number) => {
    return await request.get({ url: `/seal/seal/get?id=` + id })
  },

  // 查询拥有印章的单位
  getsealDept: async () => {
    return await request.get({ url: `/seal/seal/get-sealdept`})
  },

  // 新增印章
  createseal: async (data: sealVO) => {
    return await request.post({ url: `/seal/seal/create`, data })
  },

  // 修改印章
  updateseal: async (data: sealVO) => {
    return await request.put({ url: `/seal/seal/update`, data })
  },

  // 删除印章
  deleteseal: async (id: number) => {
    return await request.delete({ url: `/seal/seal/delete?id=` + id })
  },

  // 导出印章 Excel
  exportseal: async (params) => {
    return await request.download({ url: `/seal/seal/export-excel`, params })
  },
}

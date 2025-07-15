import request from '@/config/axios'

// 信访人与信访关联 VO
export interface VisitorRelationVO {
  id: number // 关联ID
  petitionId: number // 信访ID
  visitorId: number // 信访人ID
  isPrimary: boolean // 是否主要信访人
}

// 信访人与信访关联 API
export const VisitorRelationApi = {
  // 查询信访人与信访关联分页
  getVisitorRelationPage: async (params: any) => {
    return await request.get({ url: `/petition/visitor-relation/page`, params })
  },

  // 查询信访人与信访关联详情
  getVisitorRelation: async (id: number) => {
    return await request.get({ url: `/petition/visitor-relation/get?id=` + id })
  },

  // 新增信访人与信访关联
  createVisitorRelation: async (data: VisitorRelationVO) => {
    return await request.post({ url: `/petition/visitor-relation/create`, data })
  },

  // 修改信访人与信访关联
  updateVisitorRelation: async (data: VisitorRelationVO) => {
    return await request.put({ url: `/petition/visitor-relation/update`, data })
  },

  // 删除信访人与信访关联
  deleteVisitorRelation: async (id: number) => {
    return await request.delete({ url: `/petition/visitor-relation/delete?id=` + id })
  },

  // 导出信访人与信访关联 Excel
  exportVisitorRelation: async (params) => {
    return await request.download({ url: `/petition/visitor-relation/export-excel`, params })
  },
}
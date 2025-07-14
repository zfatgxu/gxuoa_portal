import request from '@/config/axios'

// 信访诉求 VO
export interface AppealVO {
  id: number // 诉求ID
  petitionId: number // 信访ID
  mainFacts: string // 主要事实
  mainRequest: string // 主要诉求
  content: string // 概况信息
}

// 信访诉求 API
export const AppealApi = {
  // 查询信访诉求分页
  getAppealPage: async (params: any) => {
    return await request.get({ url: `/petition/appeal/page`, params })
  },

  // 查询信访诉求详情
  getAppeal: async (id: number) => {
    return await request.get({ url: `/petition/appeal/get?id=` + id })
  },

  // 新增信访诉求
  createAppeal: async (data: AppealVO) => {
    return await request.post({ url: `/petition/appeal/create`, data })
  },

  // 修改信访诉求
  updateAppeal: async (data: AppealVO) => {
    return await request.put({ url: `/petition/appeal/update`, data })
  },

  // 删除信访诉求
  deleteAppeal: async (id: number) => {
    return await request.delete({ url: `/petition/appeal/delete?id=` + id })
  },

  // 根据信访ID查诉求详情
  getAppealByPetitionId: async (petitionId: number) => {
    return await request.get({ url: `/petition/appeal/get-by-petition-id?petitionId=` + petitionId })
  },

  // 导出信访诉求 Excel
  exportAppeal: async (params) => {
    return await request.download({ url: `/petition/appeal/export-excel`, params })
  },
}
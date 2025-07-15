import request from '@/config/axios'
export interface AcceptanceOpinion {
  petitionId: number // 申请ID
  opinion: string
}
export const AcceptanceOpinionApi = {
  // 查询审核意见详情
  getOpinion: async (id: string) => {
    return await request.get({ url: `/petition/opinion/get?petitionId=${id}` })
  },

  // 新增审核意见
  createOpinion: async (data: any) => {
    return await request.post({ url: `/petition/opinion/create`, data })
  },

  // 修改审核意见
  updateOpinion: async (data: any) => {
    return await request.put({ url: `/petition/opinion/update`, data })
  },

  // 删除审核意见
  deleteOpinion: async (id: number) => {
    return await request.delete({ url: `/petition/opinion/delete?petitionId=${id}` })
  },
}

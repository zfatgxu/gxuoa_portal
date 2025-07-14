import request from '@/config/axios'

// 信访附件 VO
export interface AttachmentVO {
  id: number // 附件ID
  petitionId: number // 信访ID
  fileName: string // 文件名
  fileUrl: string // 文件URL
  fileSize: string // 文件大小
}

// 信访附件 API
export const AttachmentApi = {
  // 查询信访附件分页
  getAttachmentPage: async (params: any) => {
    return await request.get({ url: `/petition/attachment/page`, params })
  },

  // 查询信访附件详情
  getAttachment: async (id: number) => {
    return await request.get({ url: `/petition/attachment/get?id=` + id })
  },

  // 新增信访附件
  createAttachment: async (data: AttachmentVO) => {
    return await request.post({ url: `/petition/attachment/create`, data })
  },

  // 修改信访附件
  updateAttachment: async (data: AttachmentVO) => {
    return await request.put({ url: `/petition/attachment/update`, data })
  },

  // 删除信访附件
  deleteAttachment: async (id: number) => {
    return await request.delete({ url: `/petition/attachment/delete?id=` + id })
  },

  // 根据信访ID查询附件列表
  getAttachmentListByPetitionId: async (petitionId: number) => {
    return await request.get({ url: `/petition/attachment/list-by-petition-id?petitionId=` + petitionId })
  },

  // 导出信访附件 Excel
  exportAttachment: async (params) => {
    return await request.download({ url: `/petition/attachment/export-excel`, params })
  },
  
  // 直接上传文件并创建附件记录
  uploadAttachment: async (formData: FormData) => {
    return await request.upload({ url: `/petition/attachment/upload`, data: formData })
  },
}
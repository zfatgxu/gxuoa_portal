import request from '@/config/axios'

// 会议申请上传文件 VO
export interface RoomApplyFileVO {
  meetingApplyId: number // 会议申请ID
  fileName: string // 上传的文件名或路径
  fileSize: number //上传文件大小
  fileUrl: string
}

// 会议申请上传文件 API
export const RoomApplyFileApi = {
  // 查询文件列表（根据会议申请ID）
  getFilesByApplyId: async (meetingApplyId: number) => {
    const res = await request.get({ url: `/meetingroom/room-apply-file/list`, params: { meetingApplyId } })
    return res
  },

  // 查询文件详情
  getFile: async (id: number) => {
    const res = await request.get({ url: `/meetingroom/room-apply-file/get?id=${id}` })
    return res
  },

  // 新增上传文件记录
  createFile: async (data: RoomApplyFileVO) => {
    const res = await request.post({ url: '/meetingroom/room-apply-file/create', data })
    return res
  },

  // 删除文件记录
  deleteFile: async (id: number) => {
    const res = await request.delete({ url: `/meetingroom/room-apply-file/delete?id=${id}` })
    return res
  }
}

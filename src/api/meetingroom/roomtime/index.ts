import request from '@/config/axios'

// 占用信息接口
export interface OccupationInfo {
  id: number
  occupationType: number
  occupationTypeName: string
  occupationTypeColor: string
  occupationReason: string
  creator: string
  createTime: string
}

// 会议室时间 VO
export interface RoomTimeVO {
  id: number // 会议室时间段id
  meetingRoomId: number // 会议室id
  startTime: string  // 开始时间
  endTime: string // 结束时间
  enable: boolean // 启用
  unable: boolean // 禁用
  // 新增字段：占用状态相关
  occupied?: boolean // 是否被占用
  occupationInfo?: OccupationInfo | null // 占用详情
}

// 会议室时间 API
export const RoomTimeApi = {
  // 查询会议室时间分页
  getRoomTimePage: async (params: any) => {
    return await request.get({ url: `/meetingroom/room-time/page`, params })
  },
  // 条件查询会议室分页
  getRoomSearchPage: async (params: any) => {
    return await request.get({ url: `/meetingroom/room-time/search`, params })
  },
  // 查询会议室时间详情
  getRoomTime: async (id: number) => {
    return await request.get({ url: `/meetingroom/room-time/get?id=` + id })
  },

  // 新增会议室时间
  createRoomTime: async (data: RoomTimeVO) => {
    return await request.post({ url: `/meetingroom/room-time/create`, data })
  },

  // 修改会议室时间
  updateRoomTime: async (data: RoomTimeVO) => {
    return await request.put({ url: `/meetingroom/room-time/update`, data })
  },

  // 删除会议室时间
  deleteRoomTime: async (id: number) => {
    return await request.delete({ url: `/meetingroom/room-time/delete?id=` + id })
  },

  // 导出会议室时间 Excel
  exportRoomTime: async (params) => {
    return await request.download({ url: `/meetingroom/room-time/export-excel`, params })
  },

  timeSlotRoomId: async (params: any) => {
  return await request.get({ url: `/meetingroom/room-time/timeSlot`, params })
},
}

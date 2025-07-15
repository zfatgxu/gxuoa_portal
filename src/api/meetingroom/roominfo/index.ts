import request from '@/config/axios'

// 会议室信息 VO
export interface RoomInfoVO {
  id: number // 会议室ID
  name: string // 会议室名称
  location: string // 位置
  capacity: number // 容量
  equipment: string // 设备设施
  manager: string // 管理员
  status: number // 状态：0-禁用 1-启用
  open: number //0-内部使用 1-开放使用
  deptId?: number // 所属部门ID
  deptName?: string // 所属部门名称
}

// 会议室信息 API
export const RoomInfoApi = {
  // 查询会议室信息分页
  getRoomInfoPage: async (params: any) => {
    return await request.get({ url: `/meetingroom/room-info/page`, params })
  },

  // 根据部门ID查询会议室列表
  getRoomInfoByDeptId: async (deptId: number) => {
    return await request.get({ url: `/meetingroom/room-info/page`, params: { deptId } })
  },

  // 查询会议室信息详情
  getRoomInfo: async (id: number) => {
    return await request.get({ url: `/meetingroom/room-info/get?id=` + id })
  },

  // 新增会议室信息
  createRoomInfo: async (data: RoomInfoVO) => {
    return await request.post({ url: `/meetingroom/room-info/create`, data })
  },

  // 修改会议室信息
  updateRoomInfo: async (data: RoomInfoVO) => {
    return await request.put({ url: `/meetingroom/room-info/update`, data })
  },

  // 删除会议室信息
  deleteRoomInfo: async (id: number) => {
    return await request.delete({ url: `/meetingroom/room-info/delete?id=` + id })
  },

  // 导出会议室信息 Excel
  exportRoomInfo: async (params) => {
    return await request.download({ url: `/meetingroom/room-info/export-excel`, params })
  },
}

import request from '@/config/axios'

// 会议室设备 VO
export interface RoomEquipmentVO {
  id: number
  meetingRoomId: number  // 会议室 ID
  equipmentName: string  // 设备名称
  detail: string        // 设备详情
  num: number       // 数量
}


export const RoomEquipmentApi = {
  // 查询设备分页
  getEquipmentPage: async (params: any) => {
    return await request.get({ url: `/meetingroom/room-equipment/page`, params })
  },

  // 查询指定会议室的设备列表
  getEquipmentByRoomId: async (roomId: number) => {
    return await request.get({ url: `/meetingroom/room-equipment/list`, params: { meetingRoomId: roomId } })
  },

  // 查询设备详情
  getEquipment: async (id: number) => {
    return await request.get({ url: `/meetingroom/room-equipment/get?id=` + id })
  },

  // 新增设备
  createEquipment: async (data: RoomEquipmentVO) => {
    return await request.post({ url: `/meetingroom/room-equipment/create`, data })
  },

  // 修改设备
  updateEquipment: async (data: RoomEquipmentVO) => {
    return await request.put({ url: `/meetingroom/room-equipment/update`, data })
  },

  // 删除所有设备
  deleteAllEquipment: async (meetingRoomId: number) => {
    return await request.delete({ url: `/meetingroom/room-equipment/deleteAll?meetingRoomId=` + meetingRoomId })
  },

  // 删除设备
  deleteEquipment: async (id: number) => {
    return await request.delete({ url: `/meetingroom/room-equipment/delete?id=` + id })
  },

  // 批量导出设备信息
  exportEquipment: async (params) => {
    return await request.download({ url: `/meetingroom/room-equipment/export-excel`, params })
  },
}

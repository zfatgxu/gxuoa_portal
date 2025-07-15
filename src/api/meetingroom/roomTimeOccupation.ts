import request from '@/config/axios'

export const OCCUPATION_TYPES = {
  MAINTENANCE: { value: 1, label: '维护', color: 'red' },
  OTHER: { value: 2, label: '其他', color: 'gray' }
} as const

export const OCCUPATION_STATUS = {
  CANCELLED: { value: 0, label: '已取消' },
  OCCUPIED: { value: 1, label: '占用中' }
} as const
export interface OccupationInfo {
  id?: number
  occupationType: number
  occupationTypeName: string
  occupationTypeColor: string
  occupationReason: string
  creator: string
  createTime: string
}


export interface OccupationRecord {
  id: number
  roomTimeId: number
  meetingRoomId: number
  occupationType: number
  occupationTypeName: string
  occupationTypeColor: string
  occupationReason: string
  status: number
  statusName: string
  creator: string
  createTime: string
  updater: string
  updateTime: string
  startTime: string
  endTime: string

  timeRange?: string
  timeRangeSimple?: string
  occupationDate?: string
  batchTimeRange?: string
}

/**
 * 时间段接口（包含占用信息）
 */
export interface RoomTimeSlot {
  id: number
  meetingRoomId: number
  startTime: string
  endTime: string
  enable: boolean
  unable: boolean
  occupied: boolean
  occupationInfo: OccupationInfo | null
}

export interface CreateOccupationRequest {
  roomTimeId: number
  meetingRoomId: number
  occupationType: number
  occupationReason: string
  startTime: string
  endTime: string
}

export interface PageResponse<T> {
  list: T[]
  total: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}
export const createOccupation = async (data: CreateOccupationRequest): Promise<ApiResponse<number>> => {
  return await request.post({ url: '/meetingroom/room-time-occupation/create', data })
}

export const cancelOccupation = async (id: number): Promise<ApiResponse<boolean>> => {
  return await request.delete({ url: `/meetingroom/room-time-occupation/cancel?id=${id}` })
}

export const getOccupationRecord = async (id: number): Promise<ApiResponse<OccupationRecord>> => {
  return await request.get({ url: `/meetingroom/room-time-occupation/get?id=${id}` })
}

export const getOccupationByRoomTime = async (roomTimeId: number): Promise<ApiResponse<OccupationRecord | null>> => {
  return await request.get({ url: `/meetingroom/room-time-occupation/get-by-room-time?roomTimeId=${roomTimeId}` })
}

export const getOccupationsByMeetingRoom = async (meetingRoomId: number): Promise<ApiResponse<OccupationRecord[]>> => {
  return await request.get({ url: `/meetingroom/room-time-occupation/list-by-meeting-room?meetingRoomId=${meetingRoomId}` })
}

export const getOccupationsByDate = async (meetingRoomId: number, date: string): Promise<ApiResponse<OccupationRecord[]>> => {
  return await request.get({ url: `/meetingroom/room-time-occupation/list-by-date?meetingRoomId=${meetingRoomId}&date=${date}` })
}

export const checkOccupiedTimeSlots = async (roomTimeIds: number[]): Promise<ApiResponse<number[]>> => {
  return await request.post({ url: '/meetingroom/room-time-occupation/check-occupied', data: roomTimeIds })
}

export const checkPermission = async (meetingRoomId: number): Promise<ApiResponse<boolean>> => {
  return await request.get({ url: `/meetingroom/room-time-occupation/check-permission?meetingRoomId=${meetingRoomId}` })
}


export const getOccupationTypeOptions = () => {
  return Object.values(OCCUPATION_TYPES).map(type => ({
    value: type.value,
    label: type.label,
    color: type.color
  }))
}


export const getTagType = (occupationType: number): string => {
  const typeMap: Record<number, string> = {
    1: 'danger',  // 维护 - red
    2: 'info'     // 其他 - gray
  }
  return typeMap[occupationType] || 'info'
}


export const getTagTypeByColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    orange: 'warning',
    red: 'danger',
    blue: 'primary',
    gray: 'info',
    green: 'success'
  }
  return colorMap[color] || 'info'
}


export const validateCreateOccupationRequest = (data: CreateOccupationRequest): string | null => {
  if (!data.roomTimeId) {
    return '时间段ID不能为空'
  }
  if (!data.meetingRoomId) {
    return '会议室ID不能为空'
  }
  if (!data.occupationType || data.occupationType < 1 || data.occupationType > 4) {
    return '请选择有效的占用类型'
  }
  if (!data.occupationReason || data.occupationReason.trim().length < 1) {
    return '占用原因不能为空'
  }
  if (data.occupationReason.trim().length > 200) {
    return '占用原因不能超过200个字符'
  }
  if (!data.startTime) {
    return '开始时间不能为空'
  }
  if (!data.endTime) {
    return '结束时间不能为空'
  }
  if (new Date(data.startTime) >= new Date(data.endTime)) {
    return '开始时间必须早于结束时间'
  }
  return null
}


export const handleApiError = (error: any): string => {
  if (error?.response?.data?.code) {
    const { code, msg } = error.response.data
    
    switch (code) {
      case 100900010:
        return '会议室信息不存在'
      case 100900012:
        return '会议室时间不存在'
      case 100900020:
        return '会议室时间段占用记录不存在'
      case 100900021:
        return '会议室时间段已被占用'
      case 100900022:
        return '没有权限管理该会议室的时间段占用'
      case 100900023:
        return '被占用的时间段无法删除，请先取消占用'
      case 400:
        return msg || '请求参数不正确'
      case 401:
        return '账号未登录'
      case 403:
        return '没有该操作权限'
      default:
        return msg || '操作失败，请稍后重试'
    }
  }
  
  return '网络错误，请稍后重试'
}

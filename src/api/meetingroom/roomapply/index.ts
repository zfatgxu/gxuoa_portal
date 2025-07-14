import request from '@/config/axios'

// 会议室申请 VO
export interface RoomApplyVO {
  id: number // 申请ID
  conferenceRoom: string // 会议室名称
  department: string // 申请单位
  applicant: string // 申请人
  phone: string // 手机号码
  activityTheme: string // 活动主题
  banner: string // 横幅内容
  setupTime: number // 布台时间
  startTime: number // 开始时间
  endTime: number // 结束时间
  participants: string // 参加人员及人数
  purpose: string // 使用事由及要求
  departmentOpinion: string // 使用单位意见
  departmentHead: string // 部门负责人
  departmentApprovalDate: number // 部门审批时间
  adminOpinion: string // 管理单位意见
  adminPerson: string // 管理员
  adminApprovalDate: number // 管理员审批时间
  status: number // 审核状态：0-待审核 1-已通过 2-已拒绝
  remark: string // 备注
  createTime: number // 创建时间
  creator: string // 创建人
  meetingRoomId: number
  meetingRoomTimeId: number
  participantsNum: number
  equipments: String,
  meetingRoomTimeId: number
}

// 会议室申请 API
export const RoomApplyApi = {
  // 查询会议室申请分页
  getRoomApplyPage: async (params: any) => {
    const res = await request.get({ url: '/meetingroom/room-apply/page', params })
    return res
  },

  // 查询所有会议室
  getRoomApplyAll: async (params: any) => {
    const res = await request.get({ url: '/meetingroom/room-apply/all', params })
    return res
  },

  // 查询会议室申请详情
  getRoomApply: async (id: number) => {
    const res = await request.get({ url: `/meetingroom/room-apply/get?id=${id}` })
    return res // 返回完整响应对象
  },

  // 新增会议室申请
  createRoomApply: async (data: RoomApplyVO) => {
    const res = await request.post({ url: '/meetingroom/room-apply/create', data })
    return res
  },

  // 修改会议室申请
  updateRoomApply: async (data: RoomApplyVO) => {
    const res = await request.put({ url: '/meetingroom/room-apply/update', data })
    return res
  },

  // 删除会议室申请
  deleteRoomApply: async (id: number) => {
    const res = await request.delete({ url: `/meetingroom/room-apply/delete?id=${id}` })
    return res
  },

  // 导出会议室申请 Excel
  exportRoomApply: async (params: any) => {
    const res = await request.download({ url: '/meetingroom/room-apply/export-excel', params })
    return res
  },

  getAdminApply: async (params: any) => {
    const res = await request.get({ url: '/meetingroom/room-apply/admin-page', params })
    return res
  },

  // 获取审核意见模板
  getReviewTemplates: async () => {
    const res = await request.get({ url: '/meetingroom/room-apply/review-templates' })
    return res
  },

  // 根据部门ID获取部门负责人信息
  getDeptLeaderByDeptId: async (deptId: number) => {
    const res = await request.get({ url: `/meetingroom/room-apply/dept-leader?deptId=${deptId}` })
    return res
  },

  // 根据会议室ID获取管理部门信息
  getRoomDeptInfo: async (roomId: number) => {
    console.log('🔍 调用会议室信息API，URL:', `/meetingroom/room-info/get?id=${roomId}`)
    const res = await request.get({ url: `/meetingroom/room-info/get?id=${roomId}` })
    console.log('📋 后端API原始返回数据:', JSON.stringify(res, null, 2))

    // 检查是否包含deptId字段
    if (res) {
      console.log('🔍 检查返回数据中的部门相关字段:')
      console.log('- res.deptId:', res.deptId)
      console.log('- res.dept_id:', res.dept_id)
      console.log('- res.departmentId:', res.departmentId)
      console.log('- res.department_id:', res.department_id)
      console.log('- 所有字段名:', Object.keys(res))

      if (!res.deptId && !res.dept_id && !res.departmentId && !res.department_id) {
        console.error('❌ 后端API未返回任何部门ID字段！')
        console.error('请检查后端 /meetingroom/room-info/get 接口是否正确返回了 deptId 字段')
      } else {
        console.log('✅ 找到部门ID字段')
      }
    }

    return res
  }
}

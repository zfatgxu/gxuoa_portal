import request from '@/config/axios'

// 信访人信息 VO
export interface VisitorVO {
  id: number // 信访人ID
  avatar: string // 头像
  name: string // 姓名
  gender: number // 性别（1-男 2-女）
  phone: string // 联系电话
  idCard: string // 身份证号
  address: string // 地址
  email: string // 邮箱
}
// 信访人信息 API
export const VisitorApi = {
  // 查询信访人信息分页
  getVisitorPage: async (params: any) => {
    return await request.get({ url: `/petition/visitor/page`, params })
  },

  // 根据信访id获得信访人信息列表
  getVisitorListByPetitionID: async (id: number) => {
    return await request.get({ url: `/petition/visitor/list?id=` + id })
  },

  // 查询信访人信息详情
  getVisitor: async (id: number) => {
    return await request.get({ url: `/petition/visitor/get?id=` + id })
  },

  // 新增信访人信息
  createVisitor: async (data: VisitorVO) => {
    return await request.post({ url: `/petition/visitor/create`, data })
  },

  // 修改信访人信息
  updateVisitor: async (data: VisitorVO) => {
    return await request.put({ url: `/petition/visitor/update`, data })
  },

  // 删除信访人信息
  deleteVisitor: async (id: number) => {
    return await request.delete({ url: `/petition/visitor/delete?id=` + id })
  },

  // 导出信访人信息 Excel
  exportVisitor: async (params) => {
    return await request.download({ url: `/petition/visitor/export-excel`, params })
  },
}

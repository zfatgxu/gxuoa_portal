import request from '@/config/axios'

// 信访基本信息 VO
export interface BaseInfoVO {
  id: number // 基本信息ID
  petitionId: number // 信访ID
  acceptanceNo: string // 受理编号
  businessNo: string // 业务编号
  queryCode: string // 查询码
  petitionType: string // 信访类型
  petitionDate: Date // 信访日期
  registrationOrg: string // 登记机构
  registrationTime: Date // 登记时间
  deadline: Date // 截止日期
  involvedCount: number // 涉及人数
  petitionerCount: number // 信访人数
  petitionReason: string // 信访原因
  belongSystem: string // 所属系统
  problemLocation: string // 问题所在地
  contentCategory: string // 内容类别
  isOverdue: boolean // 是否逾期
  processStatus: string // 处理状态
  satisfaction: number // 满意度（1-非常满意 2-满意 3-一般 4-不满意 5-非常不满意）
}

// 信访基本信息 API
export const BaseInfoApi = {
  // 查询信访基本信息分页
  getBaseInfoPage: async (params: any) => {
    return await request.get({ url: `/petition/base-info/page`, params })
  },

  // 查询信访基本信息详情
  getBaseInfo: async (id: number) => {
    return await request.get({ url: `/petition/base-info/get?id=` + id })
  },

  // 新增信访基本信息
  createBaseInfo: async (data: BaseInfoVO) => {
    return await request.post({ url: `/petition/base-info/create`, data })
  },

  // 修改信访基本信息
  updateBaseInfo: async (data: BaseInfoVO) => {
    return await request.put({ url: `/petition/base-info/update`, data })
  },

  // 删除信访基本信息
  deleteBaseInfo: async (id: number) => {
    return await request.delete({ url: `/petition/base-info/delete?id=` + id })
  },

  // 根据信访ID查询基础信息
  getBaseInfoByPetitionId: async (petitionId: number) => {
    return await request.get({ url: `/petition/base-info/get-by-petition-id?petitionId=` + petitionId })
  },

  // 导出信访基本信息 Excel
  exportBaseInfo: async (params) => {
    return await request.download({ url: `/petition/base-info/export-excel`, params })
  },
}
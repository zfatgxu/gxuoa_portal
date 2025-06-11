import api from '../../index';

// 岗位与流转类型关联 VO
export interface CirculationPostVO {
  id: number // 岗位与流转类型关联表主键
  name: string // 名称
  postCode: string // 岗位代码(数组)
  dictType: string // 字典类型
  dictValue: string // 字典值(数组)
  enable: string // 启用状态(0-启用, 1-禁用)
}

// 岗位与流转类型关联 API
export const CirculationPostApi = {
  // 查询岗位与流转类型关联分页
  getCirculationPostPage: async (params: any) => {
    return await api.get('/app/document/circulation-post/page', { params })
  },

  // 查询岗位与流转类型关联详情
  getCirculationPost: async (id: number) => {
    return await api.get('/app/document/circulation-post/get', { params: { id } })
  },

  // 新增岗位与流转类型关联
  createCirculationPost: async (data: CirculationPostVO) => {
    return await api.post('/app/document/circulation-post/create', data)
  },

  // 修改岗位与流转类型关联
  updateCirculationPost: async (data: CirculationPostVO) => {
    return await api.put('/app/document/circulation-post/update', data)
  },

  // 删除岗位与流转类型关联
  deleteCirculationPost: async (id: number) => {
    return await api.delete('/app/document/circulation-post/delete', { params: { id } })
  },

  // 获取当前用户流转类型列表
  simpleList : async (type: number) => {
    return await api.get('/app/document/circulation-post/simple-list', { params: { type } })
  },
}

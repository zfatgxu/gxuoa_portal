import api from '../../index';

export type DictTypeVO = {
  id: number | undefined
  name: string
  type: string
  status: number
  remark: string
  createTime: Date
}

// 查询字典（精简)列表
export const getSimpleDictTypeList = () => {
  return api.get(`/app/dict-type/list-all-simple`)
}

// 查询字典列表
export const getDictTypePage = (params: PageParam) => {
  return api.get(`/app/dict-type/page`, { params })
}

// 查询字典详情
export const getDictType = (id: number) => {
  return api.get(`/app/dict-type/get?id=${id}`)
}

// 新增字典
export const createDictType = (data: DictTypeVO) => {
  return api.post(`/app/dict-type/create`, data)
}

// 修改字典
export const updateDictType = (data: DictTypeVO) => {
  return api.put(`/app/dict-type/update`, data)
}

// 删除字典
export const deleteDictType = (id: number) => {
  return api.delete(`/app/dict-type/delete?id=${id}`)  
}
// 导出字典类型
export const exportDictType = (params) => {
  return api.download(`/app/dict-type/export`, params)
}

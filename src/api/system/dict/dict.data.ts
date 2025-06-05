import api from '../../index';

export type DictDataVO = {
  id: number | undefined
  sort: number | undefined
  label: string
  value: string
  dictType: string
  status: number
  colorType: string
  cssClass: string
  remark: string
  createTime: Date
}

// 查询字典数据（精简)列表
export const getSimpleDictDataList = () => {
  return api.get('/app/dict-data/simple-list')
}

// 查询字典数据列表
export const getDictDataPage = (params: PageParam) => {
  return api.get('/app/dict-data/page', { params })
}

// 查询字典数据详情
export const getDictData = (id: number) => {
  return api.get(`/app/dict-data/get?id=${id}`) 
}

// 新增字典数据
export const createDictData = (data: DictDataVO) => {
  return api.post('/app/dict-data/create', data)
}

// 修改字典数据
export const updateDictData = (data: DictDataVO) => {
  return api.put('/app/dict-data/update', data)
}

// 删除字典数据
export const deleteDictData = (id: number) => {
  return api.delete(`/app/dict-data/delete?id=${id}`)
}

// 导出字典类型数据
export const exportDictData = (params) => {
  return api.get('/app/dict-data/export', { params, responseType: 'blob' })
}

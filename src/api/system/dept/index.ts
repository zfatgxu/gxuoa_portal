import api from '@/api/index'

export interface DeptVO {
  id?: number
  name: string
  parentId: number
  status: number
  sort: number
  leaderUserId: number
  phone: string
  email: string
  createTime: Date
}

// 查询部门（精简)列表
export const getSimpleDeptList = (): Promise<DeptVO[]> => {
  const response = api.get('/app/dept/simple-list')
  return response
}

// 查询部门列表
export const getDeptPage = (params: PageParam) => {
  const response = api.get('/app/dept/list', { params })
  return response
}

// 查询部门详情
export const getDept = (id: number) => {
  const response = api.get(`/app/dept/get?id=${id}`)
  return response
}

// 新增部门
export const createDept = (data: DeptVO) => {
  const response = api.post('/app/dept/create', data)
  return response
}

// 修改部门
export const updateDept = (params: DeptVO) => {
  const response = api.put('/app/dept/update', params)
  return response
}

// 删除部门
export const deleteDept = (id: number) => {
  const response = api.delete(`/app/dept/delete?id=${id}`)
  return response
}

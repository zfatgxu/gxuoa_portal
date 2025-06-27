import request from '@/config/axios'

export interface CirculationParams {
  pageNo?: number
  pageSize?: number
  [key: string]: any
}

export interface CirculationSavePayload {
  id?: number
  // 添加你需要的字段
  [key: string]: any
}


// 获取公文流转分页列表
export const getPage = async (params: CirculationParams) => {
  return await request.get({ url: '/document/circulation/page', params })
}

// 获取待办公文流转分页
export const getTodoPage = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/todo', 
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      completed: 0,  // 表示待办事项
    }
  })
}

// 获取校内文件分页
export const getSchoolDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/school', 
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 1,       // 表示校内文件
    }
  })
}

// 获取校外发文分页
export const getExternalDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/external', 
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 2,       // 表示校外发文
    }
  })
}

// 获取学校发文分页
export const getUniversityDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/university', 
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 3,       // 表示学校发文
    }
  })
}

// 获取全部校内文件分页
export const getAllSchoolDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/all-school', 
    params: {
      ...params,
      personal: 0,  // 表示校内文件
    }
  })
}

// 获取部门文件分页
export const getDeptDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/dept', 
    params
  })
}

// 获取请假文件分页
export const getLeaveDocuments = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/circulation/leave', 
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 5,       // 表示请假文件
    }
  })
}

// 根据公文 ID 获取流转记录列表
export const getListByDocumentId = async (id: number) => {
  return await request.get({ 
    url: '/app/document/circulation/list', 
    params: { id } 
  })
}

// 获取单条记录详情
export const getById = async (id: number) => {
  return await request.get({ 
    url: '/app/document/circulation/get', 
    params: { id } 
  })
}

// 创建公文流转记录
export const create = async (data: CirculationSavePayload) => {
  return await request.post({ 
    url: '/app/document/circulation/create', 
    data 
  })
}

// 更新公文流转记录
export const update = async (data: CirculationSavePayload) => {
  return await request.put({ 
    url: '/app/document/circulation/update', 
    data 
  })
}

// 删除记录
export const deleteCirculation = async (id: number) => {
  return await request.delete({ 
    url: '/app/document/circulation/delete', 
    params: { id } 
  })
}

// 导出 Excel
export const exportExcel = async (params: CirculationParams) => {
  return await request.get({ 
    url: '/app/document/circulation/export-excel', 
    params,
    responseType: 'blob'
  })
}

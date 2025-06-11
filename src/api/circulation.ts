import request from './index'

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

const circulationApi = {
  // 获取公文流转分页列表
  getPage: (params: CirculationParams) =>
    request({
      url: '/document/circulation/page',
      method: 'get',
      params
    }),

  // 获取待办公文流转分页
getTodoPage: (params: CirculationParams) =>
  request({
    url: '/app/circulation/todo',
    method: 'get',
    params: {
      ...params,
      personal: 1,  // 表示只查询个人的文件
      completed: 1,  // 表示待办事项
      
    }
  }),

  // 获取校内文件分页
getSchoolDocuments: (params: CirculationParams) =>
  request({
    url: '/app/circulation/school',
    method: 'get',
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 1,       // 表示校内文件
      
    }
  }),

  // 获取校外发文分页
getExternalDocuments: (params: CirculationParams) =>
  request({
    url: '/app/circulation/external',
    method: 'get',
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 2,       // 表示校外发文
      
    }
  }),

  // 获取学校发文分页
getUniversityDocuments: (params: CirculationParams) =>
  request({
    url: '/app/circulation/university',
    method: 'get',
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 3,       // 表示学校发文
      
    }
  }),

  // 获取全部校内文件分页
getAllSchoolDocuments: (params: CirculationParams) =>
  request({
    url: '/app/circulation/all-school',
    method: 'get',
    params: {
      ...params,
      personal: 0,
          // 表示校内文件
    }
  }),

  // 获取请假文件分页
getLeaveDocuments: (params: CirculationParams) =>
  request({
    url: '/app/circulation/leave',
    method: 'get',
    params: {
      ...params,
      personal: 0,  // 表示只查询个人的文件
      type: 5,       // 表示请假文件
      
    }
  }),

  // 根据公文 ID 获取流转记录列表
  getListByDocumentId: (id: number) =>
    request({
      url: '/document/circulation/list',
      method: 'get',
      params: { id }
    }),

  // 获取单条记录详情
  getById: (id: number) =>
    request({
      url: '/document/circulation/get',
      method: 'get',
      params: { id }
    }),

  // 创建公文流转记录
  create: (data: CirculationSavePayload) =>
    request({
      url: '/document/circulation/create',
      method: 'post',
      data
    }),

  // 更新公文流转记录
  update: (data: CirculationSavePayload) =>
    request({
      url: '/document/circulation/update',
      method: 'put',
      data
    }),

  // 删除记录
  delete: (id: number) =>
    request({
      url: '/document/circulation/delete',
      method: 'delete',
      params: { id }
    }),

  // 导出 Excel
  exportExcel: (params: CirculationParams) =>
    request({
      url: '/document/circulation/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
}

export default circulationApi

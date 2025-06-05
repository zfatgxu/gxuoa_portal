import api from '../../index';

// 公文流转记录表 VO
export interface CirculationVO {
  id: number // 公文流转id
  documentId: number // 公文id
  type: number // 处理类型(0-校党政领导批示、1-党办校办拟办意见、2-办文情况、3-主要领导批示阅处、4-会签、5-呈文单位负责人签字、6-校属单位处理、7-科室处理意见、8-文件传阅、9-提交校办秘书岗、10-鉴印、11-办结、12-退回修改、13-阅知、14-填写建议列席会议单位、15-会前传阅)
  userId: number // 签办人id
  message: string // 签办信息
  deptId: number // 签办单位id
  templateId: number // 流转模板
  isShow: boolean // 是否显示流转信息(0-是、1-否)
  isSms: boolean // 是否短信通知(0-是、1-否)
  status: boolean // 是否完成(标识本次流转步骤是否完成0-是、1-否)
  createTime?: number // 创建时间
  updateTime?: number // 更新时间
  typeName?: string // 流转类型名称
  circulationStatus?: string // 流转状态名称
}

// 查询参数类型
export interface CirculationQuery {
  documentId?: number // 公文ID
  circulationId?: number // 流转ID
  status?: number // 状态
  type?: number // 类型
  pageNo?: number // 页码
  pageSize?: number // 每页条数
  beginTime?: string // 开始时间
  endTime?: string // 结束时间
}

/**
 * 公文流转记录表 API
 */
export const CirculationApi = {
  // 查询公文流转记录表分页
  getCirculationPage: (params: CirculationQuery) => 
    api.get<CirculationPageVO>('/app/document/circulation/page', { params }),

  // 查询公文流转记录表详情
  getCirculation: (id: number) => 
    api.get<CirculationVO>(`/app/document/circulation/get`, { params: { id } }),

  // 新增公文流转记录表
  createCirculation: (data: CirculationVO) => 
    api.post<CirculationVO>('/app/document/circulation/create', data),

  // 修改公文流转记录表
  updateCirculation: (data: CirculationVO) => 
    api.put<CirculationVO>('/app/document/circulation/update', data),

  // 删除公文流转记录表
  deleteCirculation: (id: number) => 
    api.delete('/app/document/circulation/delete', { params: { id } }),

  // 导出公文流转记录表 Excel
  exportCirculation: (params: CirculationQuery) => 
    api.download('/app/document/circulation/export-excel', { params }),

  
  
  // 获取流转列表
  getCirculationList: (id: number) => 
    api.get('/app/document/circulation/list', { params: { id } }),

  // 查询公文流转待办分页
  getCirculationTodoPage: (params: CirculationQuery) => 
    api.get('/app/document/circulation/todo', { params }),
  
  
}

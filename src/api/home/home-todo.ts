import api from '@/api/index'

export interface HomeToDoPageParams {
  pageNo?: number
  pageSize?: number
  [key: string]: any
}

export interface HomeToDoItem {
  id: string
  title: string
  type: string
  deadline: string
  priority: string
  url: string
}

export interface HomeToDoModule {
  module: string
  items: HomeToDoItem[]
}

const homeTodoApi = {
  // 获取主页待办事项聚合列表
  getHomeToDoPage: (params: HomeToDoPageParams) =>
    api.get('/document/app/home-todo/page', {
      params
    })
}

export default homeTodoApi
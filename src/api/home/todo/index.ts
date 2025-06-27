import request from '@/config/axios'

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

// 获取主页待办事项聚合列表
export const getHomeToDoPage = async (params: HomeToDoPageParams) => {
  return await request.get({ url:'/document/app/home-todo/page', params })
}


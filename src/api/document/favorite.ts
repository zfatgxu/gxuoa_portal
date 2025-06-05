import request from '../index'

export interface DocumentFavoriteCreateReqVO {
  documentId: number
  remark?: string
}

export interface DocumentFavoritePageReqVO {
  pageNo: number
  pageSize: number
  documentName?: string
  createTime?: Date[]
}

const documentFavoriteApi = {
  // 创建公文收藏
  createDocumentFavorite: (data: DocumentFavoriteCreateReqVO) =>
    request({
      url: '/document/favorite/create',
      method: 'post',
      data
    }),

  // 删除公文收藏
  deleteDocumentFavorite: (id: number) =>
    request({
      url: '/document/favorite/delete',
      method: 'delete',
      params: { id }
    }),

  // 取消收藏公文
  cancelDocumentFavorite: (documentId: number) =>
    request({
      url: '/document/favorite/cancel',
      method: 'delete',
      params: { documentId }
    }),

  // 获取公文收藏分页
  getDocumentFavoritePage: (params: DocumentFavoritePageReqVO) =>
    request({
      url: '/document/favorite/page',
      method: 'get',
      params
    }),

  // 检查是否已收藏公文
  isFavorite: (documentId: number) =>
    request({
      url: '/document/favorite/is-favorite',
      method: 'get',
      params: { documentId }
    })
}

export default documentFavoriteApi

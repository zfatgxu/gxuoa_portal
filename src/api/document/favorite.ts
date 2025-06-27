import request from '@/config/axios'

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

// 创建公文收藏
export const createDocumentFavorite = async (data: DocumentFavoriteCreateReqVO) => {
  return await request.post({
    url: '/document/favorite/create',
    data
  })
}

// 删除公文收藏
export const deleteDocumentFavorite = async (id: number) => {
  return await request.delete({
    url: '/document/favorite/delete',
    params: { id }
  })
}

// 取消收藏公文
export const cancelDocumentFavorite = async (documentId: number) => {
  return await request.delete({
    url: '/document/favorite/cancel',
    params: { documentId }
  })
}

// 获取公文收藏分页
export const getDocumentFavoritePage = async (params: DocumentFavoritePageReqVO) => {
  return await request.get({
    url: '/document/favorite/page',
    params
  })
}

// 检查是否已收藏公文
export const isFavorite = async (documentId: number) => {
  return await request.get({
    url: '/document/favorite/is-favorite',
    params: { documentId }
  })
}

import api from '../index'

/**
 * 获取站内信详情
 * @param id 站内信ID
 * @returns 站内信详情
 */
export function getNotifyMessage(id: number) {
  return api.get(`/app/notify-message/get`, {
    params: { id }
  })
}

/**
 * 获取我的站内信分页列表
 * @param params 查询参数
 * @returns 站内信分页列表
 */
export function getMyNotifyMessagePage(params: any) {
  return api.get(`/app/notify-message/my-page`, {
    params
  })
}

/**
 * 标记站内信为已读
 * @param ids 站内信ID列表
 * @returns 操作结果
 */
export function updateNotifyMessageRead(ids: number[]) {
  // 将数组转换为逗号分隔的字符串
  const idsStr = ids.join(',')
  return api.put(`/app/notify-message/update-read?ids=${idsStr}`)
}

/**
 * 标记所有站内信为已读
 * @returns 操作结果
 */
export function updateAllNotifyMessageRead() {
  return api.put(`/app/notify-message/update-all-read`)
}

/**
 * 获取未读站内信列表
 * @param size 获取数量，默认10条
 * @returns 未读站内信列表
 */
export function getUnreadNotifyMessageList(size = 10) {
  return api.get(`/app/notify-message/get-unread-list`, {
    params: { size }
  })
}

/**
 * 获取未读站内信数量
 * @returns 未读站内信数量
 */
export function getUnreadNotifyMessageCount() {
  return api.get(`/app/notify-message/get-unread-count`)
}

/**
 * 发送站内信
 * @param data 发送参数
 * @returns 操作结果
 */
export function sendNotify(data: any) {
  return api.post(`/app/notify-message/send-notify`, data)
}

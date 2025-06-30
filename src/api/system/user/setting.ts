import request from '@/config/axios'

// 查询用户设置
export const getUserSetting = () => {
  return request.get({ url: '/homepage/user-card-config/get' })
}

// 修改用户设置
export const updateUserSetting = (data: any) => {
  return request.put({ url: '/homepage/user-card-config/update', data })
}

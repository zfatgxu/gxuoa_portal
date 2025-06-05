import api from '../index'
import { 
  AppUserInfoRespVO, 
  AppUserUpdateReqVO, 
  AppUserUpdateMobileReqVO,
  AppUserUpdateMobileByWeixinReqVO,
  AppUserUpdatePasswordReqVO,
  AppUserResetPasswordReqVO
} from './types'

/**
 * 用户个人中心 API
 */
const userApi = {
  // 获取用户基本信息
  getUserInfo: () => 
    api.get<AppUserInfoRespVO>('/app/user/get'),

  // 修改用户基本信息
  updateUser: (data: AppUserUpdateReqVO) => 
    api.put('/app/user/update', data),

  // 修改用户手机号
  updateUserMobile: (data: AppUserUpdateMobileReqVO) => 
    api.put('/app/user/update-mobile', data),

  // 基于微信小程序授权码修改用户手机号
  updateUserMobileByWeixin: (data: AppUserUpdateMobileByWeixinReqVO) => 
    api.put('/app/user/update-mobile-by-weixin', data),

  // 修改用户密码
  updateUserPassword: (data: AppUserUpdatePasswordReqVO) => 
    api.put('/app/user/update-password', data),

  // 重置用户密码（忘记密码时使用）
  resetUserPassword: (data: AppUserResetPasswordReqVO) => 
    api.put('/app/user/reset-password', data),

  // 获取用户精简信息列表
  getSimpleUserList: () => {
    const response = api.get('/app/user/list-all-simple')
    return response
  }
}





export default userApi

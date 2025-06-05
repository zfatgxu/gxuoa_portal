import api from '../index'
import { LoginParams, SmsLoginParams, LoginResponse, UserInfoVO } from './types'

// 账号密码登录
export function login(data: LoginParams) {
  return api.post(`/app/auth/login`, data)
}

// 短信验证码登录
export function smsLogin(data: SmsLoginParams) {
  return api.post(`/app/auth/sms-login`, data)
}

// 发送短信验证码
export function sendSmsCode(mobile: string) {
  return api.post(`/app/auth/send-sms-code`, {
    mobile,
    scene: 1 // 1代表登录场景
  })
}

// 登出
export function logout() {
  return api.post(`/app/auth/logout`)
}

// 刷新令牌
export function refreshToken(refreshToken: string) {
  return api.post(`/app/auth/refresh-token?refreshToken=${refreshToken}`)
}

// 获取用户信息
export function getInfo() {
  return api.get('/app/auth/get-permission-info')
}

// 退出登录
export function loginOut() {
  return api.post('/app/auth/logout')
}

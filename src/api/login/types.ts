// 定义登录请求参数接口
export interface LoginParams {
  username: string // 用户名
  password: string // 密码
}

// 定义短信登录请求参数接口
export interface SmsLoginParams {
  mobile: string // 手机号
  code: string // 验证码
}

// 定义登录响应接口
export interface LoginResponse {
  userId: number
  accessToken: string
  refreshToken: string
  expiresTime: number
}

// Token类型
export interface TokenType {
  accessToken: string
  refreshToken: string
}

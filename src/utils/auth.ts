import { useCache, CACHE_KEY } from '@/hooks/web/useCache'
import { TokenType } from '@/api/login/types'
import { decrypt, encrypt } from '@/utils/jsencrypt'

const { wsCache } = useCache()

const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'

// 获取token
export const getAccessToken = () => {
  // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
  const accessToken = wsCache.get(AccessTokenKey)
  return accessToken ? accessToken : wsCache.get('ACCESS_TOKEN')
}

// 刷新token
export const getRefreshToken = () => {
  return wsCache.get(RefreshTokenKey)
}

// 设置token
export const setToken = (token: TokenType) => {
  wsCache.set(RefreshTokenKey, token.refreshToken)
  wsCache.set(AccessTokenKey, token.accessToken)
  
  // 同时使用localStorage存储（用于请求拦截器）
  localStorage.setItem('token', token.accessToken)
  console.log('在auth.ts中存储令牌：', token.accessToken)
}

// 删除token
export const removeToken = () => {
  // 清除wsCache中的令牌
  wsCache.delete(AccessTokenKey)
  wsCache.delete(RefreshTokenKey)
  
  // 清除localStorage中的所有令牌和认证相关项
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpiresTime')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('ACCESS_TOKEN')
  localStorage.removeItem('REFRESH_TOKEN')
  
  // 清除可能存在的会话存储
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  
  // 删除可能存在的cookie
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  
  console.log('所有令牌和登录状态已清除')
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token
}
// ========== 账号相关 ==========

export type LoginFormType = {
  tenantName: string
  username: string
  password: string
  rememberMe: boolean
}

export const getLoginForm = () => {
  const loginForm: LoginFormType = wsCache.get(CACHE_KEY.LoginForm)
  if (loginForm) {
    loginForm.password = decrypt(loginForm.password) as string
  }
  return loginForm
}

export const setLoginForm = (loginForm: LoginFormType) => {
  loginForm.password = encrypt(loginForm.password) as string
  wsCache.set(CACHE_KEY.LoginForm, loginForm, { exp: 30 * 24 * 60 * 60 })
}

export const removeLoginForm = () => {
  wsCache.delete(CACHE_KEY.LoginForm)
}

// ========== 租户相关 ==========

export const getTenantId = () => {
  return wsCache.get(CACHE_KEY.TenantId)
}

export const setTenantId = (username: string) => {
  wsCache.set(CACHE_KEY.TenantId, username)
}

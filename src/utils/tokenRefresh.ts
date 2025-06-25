import { refreshToken } from '@/api/login'
import { getRefreshToken, setToken } from '@/utils/auth'

// 定义常量
const TOKEN_REFRESH_BUFFER = 30 * 1000 // 提前30秒刷新token（改为30秒，更符合测试场景）
const DEBOUNCE_TIME = 5 * 1000 // 防抖时间：5秒

// 防抖变量
let isRefreshing = false
let lastRefreshTime = 0

/**
 * 初始化token刷新管理
 */
export function initTokenRefresh() {
  console.log('初始化token刷新管理 - ' + new Date().toLocaleTimeString())
  
  // 立即检查一次token状态
  setTimeout(() => {
    console.log('初始检查token状态')
    checkTokenStatus()
  }, 1000)
  
  // 添加用户活动监听器
  addActivityListeners()
  
  // 添加定期检查（每15秒检查一次，作为备份机制）
  setInterval(() => {
    console.log('定期检查token状态 - ' + new Date().toLocaleTimeString())
    checkTokenStatus()
  }, 15 * 1000)
}

/**
 * 添加用户活动监听器
 */
function addActivityListeners() {
  // 监听用户交互事件
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
  
  // 先移除可能存在的旧监听器
  events.forEach(eventType => {
    document.removeEventListener(eventType, handleUserActivity)
  })
  
  // 添加新监听器
  events.forEach(eventType => {
    document.addEventListener(eventType, handleUserActivity, { passive: true })
    console.log(`已添加${eventType}事件监听器`)
  })
  
  // 监听页面可见性变化
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  console.log('已添加visibilitychange事件监听器')
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    console.log('页面变为可见，检查token状态')
    handleUserActivity()
  }
}

/**
 * 处理用户活动
 */
function handleUserActivity() {
  console.log('检测到用户活动 - ' + new Date().toLocaleTimeString())
  checkTokenStatus()
}

/**
 * 检查token状态并决定是否刷新
 */
function checkTokenStatus() {
  // 检查是否需要刷新token
  const tokenExpiresTime = localStorage.getItem('tokenExpiresTime')
  if (tokenExpiresTime) {
    const expiresTime = parseInt(tokenExpiresTime)
    const now = Date.now()
    const timeToExpire = expiresTime - now
    
    console.log(`Token过期时间: ${new Date(expiresTime).toLocaleTimeString()}, 剩余时间: ${Math.round(timeToExpire/1000)}秒`)
    
    // 如果token即将过期（在缓冲时间内），则刷新token
    if (timeToExpire < TOKEN_REFRESH_BUFFER && timeToExpire > 0) {
      console.log(`Token即将在${Math.round(timeToExpire/1000)}秒后过期，尝试刷新`)
      refreshTokenIfNeeded()
    }
  } else {
    console.log('未找到token过期时间')
  }
}

/**
 * 如果需要，刷新token（带防抖功能）
 */
async function refreshTokenIfNeeded() {
  const now = Date.now()
  
  // 如果正在刷新或者距离上次刷新时间小于防抖时间，则不执行
  if (isRefreshing) {
    console.log('已有刷新请求在进行中，跳过本次刷新')
    return
  }
  
  if (now - lastRefreshTime < DEBOUNCE_TIME) {
    console.log(`距离上次刷新不足${DEBOUNCE_TIME/1000}秒，跳过本次刷新`)
    return
  }
  
  try {
    isRefreshing = true
    
    const refreshTokenValue = getRefreshToken()
    if (!refreshTokenValue) {
      console.error('刷新令牌不存在，无法刷新token')
      forceLogout('刷新令牌不存在，请重新登录')
      return
    }
    
    console.log('发送刷新token请求...')
    const res = await refreshToken(refreshTokenValue)
    
    if (res && res.code === 0 && res.data) {
      // 更新token
      setToken({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken
      })
      
      // 更新过期时间
      if (res.data.expiresTime) {
        localStorage.setItem('tokenExpiresTime', res.data.expiresTime.toString())
        console.log('token刷新成功，新的过期时间：', new Date(res.data.expiresTime).toLocaleString())
      }
      
      // 记录刷新时间
      lastRefreshTime = now
    } else {
      console.error('刷新token失败：', res)
      
      // 处理刷新token失败的情况
      if (res && res.code === 401) {
        forceLogout(res.msg || '刷新令牌已过期，请重新登录')
      }
    }
  } catch (error) {
    console.error('刷新token时发生错误：', error)
    forceLogout('刷新token时发生错误，请重新登录')
  } finally {
    isRefreshing = false
  }
}

/**
 * 强制退出登录
 * @param message 提示消息
 */
function forceLogout(message: string) {
  console.log('强制退出登录：', message)
  
  // 清除所有令牌和认证相关数据
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
  
 
  
  // 跳转到登录页
  window.location.href = '/'
}

/**
 * 清理资源
 */
export function cleanupTokenRefresh() {
  // 移除事件监听器
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
  events.forEach(eventType => {
    document.removeEventListener(eventType, handleUserActivity)
  })
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

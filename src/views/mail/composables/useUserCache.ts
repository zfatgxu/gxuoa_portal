import { ref } from 'vue'
import { getUserByIdCard } from '@/api/system/user'
import { useCache } from '@/hooks/web/useCache'

/**
 * 统一的用户信息缓存服务
 * 两级缓存策略：
 * 1. 一级缓存：内存缓存（Map）- 极快，会话期间有效
 * 2. 二级缓存：localStorage - 较慢，持久化存储（可选）
 */
export function useUserCache(options = { usePersistCache: false }) {
  // 一级缓存：内存缓存（Map）
  const memoryCache = ref<Map<string, any>>(new Map())
  
  // 二级缓存：localStorage（可选）
  const { wsCache } = useCache()
  const CACHE_PREFIX = 'user_detail_'
  
  /**
   * 从二级缓存读取
   */
  const getFromPersistCache = (idCard: string): any | null => {
    if (!options.usePersistCache) return null
    
    try {
      return wsCache.get(`${CACHE_PREFIX}${idCard}`)
    } catch {
      return null
    }
  }
  
  /**
   * 写入二级缓存
   */
  const setToPersistCache = (idCard: string, user: any) => {
    if (!options.usePersistCache) return
    
    try {
      // 设置1小时过期
      wsCache.set(`${CACHE_PREFIX}${idCard}`, user, { exp: 3600 })
    } catch (error) {
      console.warn('写入持久化缓存失败:', error)
    }
  }
  
  /**
   * 通过身份证号获取用户信息（带两级缓存）
   */
  const getUserByIdCardCached = async (idCard: string): Promise<any> => {
    if (!idCard) return null
    
    // 1. 检查一级缓存（内存）
    if (memoryCache.value.has(idCard)) {
      return memoryCache.value.get(idCard)
    }
    
    // 2. 检查二级缓存（localStorage，可选）
    const persistCached = getFromPersistCache(idCard)
    if (persistCached) {
      // 写入一级缓存
      memoryCache.value.set(idCard, persistCached)
      return persistCached
    }
    
    // 3. 从API获取
    try {
      const userDetail = await getUserByIdCard(idCard)
      
      if (userDetail) {
        // 写入一级缓存
        memoryCache.value.set(idCard, userDetail)
        // 写入二级缓存（可选）
        setToPersistCache(idCard, userDetail)
      }
      
      return userDetail
    } catch (error: any) {
      console.error('获取用户详情失败:', error)
      return null
    }
  }
  
  /**
   * 批量获取用户信息
   */
  const getUsersBatch = async (idCards: string[]): Promise<Map<string, any>> => {
    const results = new Map<string, any>()
    
    await Promise.all(
      idCards.map(async (idCard) => {
        const user = await getUserByIdCardCached(idCard)
        if (user) {
          results.set(idCard, user)
        }
      })
    )
    
    return results
  }
  
  /**
   * 获取用户昵称
   */
  const getUserNickname = async (idCard: string): Promise<string> => {
    const user = await getUserByIdCardCached(idCard)
    return user?.nickname || '未知用户'
  }
  
  /**
   * 预加载用户信息（用于性能优化）
   */
  const preloadUsers = async (idCards: string[]) => {
    await getUsersBatch(idCards)
  }
  
  /**
   * 清除一级缓存（内存）
   */
  const clearMemoryCache = () => {
    memoryCache.value.clear()
  }
  
  /**
   * 清除二级缓存（localStorage）
   */
  const clearPersistCache = () => {
    if (!options.usePersistCache) return
    
    // 清除所有用户详情缓存
    // 注意：这需要枚举所有 key，性能较差
    // 实际使用中可以考虑其他方案
    console.warn('清除持久化缓存功能暂未实现')
  }
  
  /**
   * 清除所有缓存
   */
  const clearAllCache = () => {
    clearMemoryCache()
    clearPersistCache()
  }
  
  /**
   * 获取缓存大小
   */
  const getCacheSize = () => {
    return memoryCache.value.size
  }
  
  /**
   * 检查用户是否已缓存（仅检查一级缓存）
   */
  const isCached = (idCard: string): boolean => {
    return memoryCache.value.has(idCard)
  }
  
  return {
    getUserByIdCardCached,
    getUsersBatch,
    getUserNickname,
    preloadUsers,
    clearMemoryCache,
    clearPersistCache,
    clearAllCache,
    getCacheSize,
    isCached
  }
}

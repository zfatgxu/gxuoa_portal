import { ref } from 'vue'
import { getLetterDetail } from '@/api/mail/letter'
import type { Email } from '../utils/mailFormatter'
import { useUserCache } from './useUserCache'

export function useDataCache() {
  // 状态
  const emailDetailsCache = ref<Record<number, any>>({})
  
  // 使用统一的用户缓存服务
  const { getUserByIdCardCached } = useUserCache()
  
  // 兼容性：保留原接口名称
  const getUserDetailByIdCard = getUserByIdCardCached
  
  const getEmailDetail = async (emailId: number): Promise<any> => {
    // 优先从缓存中获取
    if (emailDetailsCache.value[emailId]) {
      return emailDetailsCache.value[emailId]
    }
    
    const emailDetail = await getLetterDetail(emailId)
    
    if (emailDetail) {
      // 缓存邮件详情
      emailDetailsCache.value[emailId] = emailDetail
    }
    
    return emailDetail
  }
  
  const preloadEmailDetails = async (emails: Email[], pageSize: number = 15) => {
    // 过滤掉草稿邮件，草稿没有详情API
    const validEmails = emails.filter(email => !email.isDraft)
    const pageEmails = validEmails.slice(0, pageSize)
    
    const preloadPromises = pageEmails.map(async (email) => {
      if (emailDetailsCache.value[email.id]) {
        return
      }
      
      try {
        const emailDetail = await getLetterDetail(email.id)
        if (emailDetail) {
          emailDetailsCache.value[email.id] = emailDetail
        }
      } catch (error: any) {
        // 预加载失败不影响用户体验
      }
    })
    
    await Promise.allSettled(preloadPromises)
  }
  
  const clearCache = () => {
    emailDetailsCache.value = {}
  }
  
  return {
    emailDetailsCache,
    getUserDetailByIdCard,
    getEmailDetail,
    preloadEmailDetails,
    clearCache
  }
}


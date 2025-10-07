import { ref } from 'vue'
import { getMailStats, type MailStatsVO } from '@/api/mail/letter'

export function useMailStats() {
  // 状态
  const mailStats = ref<MailStatsVO>({
    inboxCount: 0,
    sentCount: 0,
    draftsCount: 0,
    starredCount: 0,
    deletedCount: 0,
    trashCount: 0,
    totalUnreadCount: 0,
    totalCount: 0,
    inboxUnreadCount: 0
  })
  
  // 方法
  const loadMailStats = async () => {
    try {
      const response = await getMailStats()
      if (response) {
        mailStats.value = response
      }
    } catch (error: any) {
      // 忽略加载失败
    }
  }
  
  const getInboxCount = () => mailStats.value.inboxCount ?? 0
  const getSentCount = () => mailStats.value.sentCount ?? 0
  const getDraftCount = () => mailStats.value.draftsCount ?? 0
  const getStarredCount = () => mailStats.value.starredCount ?? 0
  const getDeletedCount = () => mailStats.value.deletedCount ?? 0
  const getTrashCount = () => mailStats.value.trashCount ?? 0
  
  return {
    mailStats,
    loadMailStats,
    getInboxCount,
    getSentCount,
    getDraftCount,
    getStarredCount,
    getDeletedCount,
    getTrashCount
  }
}


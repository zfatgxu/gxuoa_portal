import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Email } from '../types/mail'
import type { SearchCriteria } from '../components/AdvancedSearchDialog.vue'
import { searchLettersByAttachment } from '@/api/mail/letter'
import { formatMailTime, formatDate, stripHtml } from '../utils/mailHelpers'

interface UseMailSearchOptions {
  allFoldersEmails?: Record<string, Email[]>
  currentEmails?: () => Email[]  // 改为可选函数，确保响应式
}

export function useMailSearch(options: UseMailSearchOptions) {
  // 搜索相关状态
  const quickSearchKeyword = ref('')
  const showAdvancedSearch = ref(false)
  const activeSearchCriteria = ref<SearchCriteria | null>(null)
  const isLoadingAllFolders = ref(false)
  const allFoldersLoaded = ref(false)
  const backendSearchResults = ref<Email[]>([])
  const isUsingBackendSearch = ref(false)

  // 过滤后的邮件列表（根据搜索关键词和类型）
  const filteredEmails = computed(() => {
    // 如果使用后端搜索（附件名搜索），直接返回后端搜索结果
    if (isUsingBackendSearch.value) {
      return backendSearchResults.value
    }

    // 获取当前邮件列表，添加保护措施
    const currentEmails = options.currentEmails?.() || []
    
    if (!activeSearchCriteria.value) {
      return currentEmails
    }

    const criteria = activeSearchCriteria.value

    // 确定搜索范围：如果没有指定文件夹且提供了所有文件夹的邮件，则搜索所有文件夹
    let emailsToSearch: Email[] = currentEmails

    if (!criteria.folder && options.allFoldersEmails) {
      // 没有指定文件夹，搜索所有文件夹（排除星标邮件文件夹）
      const emailMap = new Map<number, Email>()
      // 文件夹标签映射
      const folderLabels: Record<string, string> = {
        inbox: '收件箱',
        sent: '已发送',
        drafts: '草稿箱',
        deleted: '已删除',
        trash: '垃圾箱'
      }

      Object.entries(options.allFoldersEmails).forEach(([folderKey, folderEmails]) => {
        // 排除星标邮件文件夹
        if (folderKey === 'starred') {
          return
        }
        const folderLabel = folderLabels[folderKey] || ''
        folderEmails.forEach(email => {
          // 使用 Map 去重，同一封邮件只保留一次
          if (!emailMap.has(email.id)) {
            // 为邮件添加文件夹来源标签
            emailMap.set(email.id, {
              ...email,
              folderSource: folderLabel
            })
          }
        })
      })
      emailsToSearch = Array.from(emailMap.values())
    } else if (criteria.folder) {
      // 指定了文件夹，只搜索该文件夹，但也要添加文件夹标签
      const folderKey = criteria.folder
      const folderLabels: Record<string, string> = {
        inbox: '收件箱',
        sent: '已发送',
        drafts: '草稿箱',
        deleted: '已删除',
        trash: '垃圾箱'
      }
      const folderLabel = folderLabels[folderKey] || ''

      // 如果有 allFoldersEmails 且该文件夹已加载，使用该文件夹的数据
      // 否则使用当前 currentEmails（假设用户在该文件夹中搜索）
      let folderEmails: Email[] = []
      if (options.allFoldersEmails && options.allFoldersEmails[folderKey]) {
        folderEmails = options.allFoldersEmails[folderKey]
      } else {
        // 使用当前文件夹的邮件
        folderEmails = options.currentEmails?.() || []
      }

      // 为每封邮件添加文件夹标签
      emailsToSearch = folderEmails.map(email => ({
        ...email,
        folderSource: folderLabel
      }))
    }

    return emailsToSearch.filter(email => {
      // 1. 关键字过滤
      if (criteria.keyword) {
        const keyword = criteria.keyword.toLowerCase().trim()
        let keywordMatch = false

        if (criteria.keywordLocation) {
          // 指定位置搜索
          switch (criteria.keywordLocation) {
            case 'sender':
              keywordMatch = email.sender?.toLowerCase().includes(keyword) || false
              break
            case 'subject':
              keywordMatch = email.subject?.toLowerCase().includes(keyword) || false
              break
            case 'content':
              keywordMatch = email.content ? stripHtml(email.content).toLowerCase().includes(keyword) : false
              break
            case 'recipient':
              keywordMatch = email.toMail?.toLowerCase().includes(keyword) || false
              break
          }
        } else {
          // 全部位置搜索
          const senderMatch = email.sender?.toLowerCase().includes(keyword) || false
          const subjectMatch = email.subject?.toLowerCase().includes(keyword) || false
          const contentMatch = email.content ? stripHtml(email.content).toLowerCase().includes(keyword) : false
          const recipientMatch = email.toMail?.toLowerCase().includes(keyword) || false
          keywordMatch = senderMatch || subjectMatch || contentMatch || recipientMatch
        }

        if (!keywordMatch) return false
      }

      // 2. 发件人过滤
      if (criteria.sender) {
        const senderKeyword = criteria.sender.toLowerCase().trim()
        if (!email.sender?.toLowerCase().includes(senderKeyword)) {
          return false
        }
      }

      // 3. 收件人过滤
      if (criteria.recipient) {
        const recipientKeyword = criteria.recipient.toLowerCase().trim()
        if (!email.toMail?.toLowerCase().includes(recipientKeyword)) {
          return false
        }
      }

      // 4. 时间范围过滤
      if (criteria.timeRange) {
        const emailDate = new Date(email.date || email.sendTime || email.time)
        const now = new Date()

        // 自定义时间范围
        if (criteria.timeRange === 'custom' && criteria.customStartDate && criteria.customEndDate) {
          const startDate = new Date(criteria.customStartDate)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(criteria.customEndDate)
          endDate.setHours(23, 59, 59, 999)

          if (emailDate < startDate || emailDate > endDate) return false
        } else {
          // 预设时间范围
          switch (criteria.timeRange) {
            case 'oneDay':
              // 一天内（24小时）
              const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
              if (emailDate < oneDayAgo) return false
              break
            case 'oneWeek':
              // 一周内（7天）
              const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              if (emailDate < oneWeekAgo) return false
              break
            case 'oneMonth':
              // 一个月内（30天）
              const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              if (emailDate < oneMonthAgo) return false
              break
            case 'sixMonths':
              // 六个月内（180天）
              const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
              if (emailDate < sixMonthsAgo) return false
              break
            case 'oneYear':
              // 一年内（365天）
              const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
              if (emailDate < oneYearAgo) return false
              break
          }
        }
      }

      // 5. 附件过滤
      if (criteria.hasAttachment) {
        const hasAttachments = email.hasAttachment || false
        if (criteria.hasAttachment === 'true' && !hasAttachments) return false
        if (criteria.hasAttachment === 'false' && hasAttachments) return false
      }

      // 6. 已读/未读过滤
      if (criteria.readStatus) {
        if (criteria.readStatus === 'read' && !email.isRead) return false
        if (criteria.readStatus === 'unread' && email.isRead) return false
      }

      // 文件夹过滤已在上面的 emailsToSearch 选择中处理

      // 所有条件都通过
      return true
    })
  })

  // 打开高级搜索弹窗
  const handleOpenAdvancedSearch = () => {
    showAdvancedSearch.value = true
  }

  // 快速搜索（按回车触发）
  const handleQuickSearch = async (loadAllFoldersCallback?: () => void) => {
    if (quickSearchKeyword.value.trim()) {
      // 如果还没有加载所有文件夹，先触发加载
      if (!allFoldersLoaded.value && !isLoadingAllFolders.value && loadAllFoldersCallback) {
        isLoadingAllFolders.value = true
        loadAllFoldersCallback()
        // 等待一小段时间让父组件加载数据
        await new Promise(resolve => setTimeout(resolve, 100))
        allFoldersLoaded.value = true
        isLoadingAllFolders.value = false
      }

      activeSearchCriteria.value = {
        keyword: quickSearchKeyword.value.trim(),
        keywordLocation: '', // 全部位置
        sender: '',
        recipient: '',
        timeRange: '',
        folder: '',
        hasAttachment: '',
        readStatus: ''
      }
    }
  }

  // 清除快速搜索
  const clearQuickSearch = () => {
    quickSearchKeyword.value = ''
    activeSearchCriteria.value = null
    isUsingBackendSearch.value = false
    backendSearchResults.value = []
  }

  // 从搜索结果返回到先前的文件夹
  const handleBackFromSearch = () => {
    quickSearchKeyword.value = ''
    activeSearchCriteria.value = null
    isUsingBackendSearch.value = false
    backendSearchResults.value = []
  }

  // 高级搜索（通过弹窗提交）
  const handleAdvancedSearch = async (
    criteria: SearchCriteria,
    callbacks?: {
      loadAllFolders?: () => void
      loadSpecificFolder?: (folderKey: string) => void
    }
  ) => {
    // 如果是附件名搜索，直接调用后端接口
    if (criteria.keyword && criteria.keywordLocation === 'attachment') {
      try {
        const result = await searchLettersByAttachment({
          attachmentName: criteria.keyword,
          pageNo: 1,
          pageSize: 1000 // 获取所有结果，前端再分页
        })

        // 将后端返回的数据转换为前端Email格式
        backendSearchResults.value = result.list.map((item: any) => ({
          id: item.id,
          sender: item.fromUserName || '',
          subject: item.subject || '(无主题)',
          time: formatMailTime(item.sendTime),
          date: formatDate(item.sendTime),
          sendTime: item.sendTime,
          content: item.content || '',
          isRead: item.isRead,
          isStarred: item.isStarred,
          isDraft: false,
          toMail: item.toUserNames || '',
          hasAttachment: item.hasAttachment || false,
          priority: item.priority || 1
        }))

        isUsingBackendSearch.value = true
        activeSearchCriteria.value = criteria

        if (result.list.length === 0) {
          ElMessage.info('未找到包含该附件名的邮件')
        } else {
          ElMessage.success(`找到 ${result.list.length} 封包含该附件的邮件`)
        }
        return
      } catch (error: any) {
        console.error('附件名搜索失败:', error)
        ElMessage.error('搜索失败，请稍后重试')
        return
      }
    }

    // 非附件名搜索，使用前端过滤方式
    isUsingBackendSearch.value = false
    backendSearchResults.value = []

    if (!criteria.folder) {
      // 没有指定文件夹，需要加载所有文件夹
      if (!allFoldersLoaded.value && !isLoadingAllFolders.value && callbacks?.loadAllFolders) {
        isLoadingAllFolders.value = true
        callbacks.loadAllFolders()
        // 等待一小段时间让父组件加载数据
        await new Promise(resolve => setTimeout(resolve, 100))
        allFoldersLoaded.value = true
        isLoadingAllFolders.value = false
      }
    } else {
      // 指定了文件夹，需要确保该文件夹数据已加载
      const folderKey = criteria.folder
      if (
        callbacks?.loadSpecificFolder &&
        (!options.allFoldersEmails ||
          !options.allFoldersEmails[folderKey] ||
          options.allFoldersEmails[folderKey].length === 0)
      ) {
        // 该文件夹数据未加载，触发加载
        callbacks.loadSpecificFolder(folderKey)
        // 等待一小段时间让父组件加载数据
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    activeSearchCriteria.value = criteria
  }

  return {
    // 状态
    quickSearchKeyword,
    showAdvancedSearch,
    activeSearchCriteria,
    isLoadingAllFolders,
    allFoldersLoaded,
    backendSearchResults,
    isUsingBackendSearch,
    filteredEmails,

    // 方法
    handleOpenAdvancedSearch,
    handleQuickSearch,
    clearQuickSearch,
    handleBackFromSearch,
    handleAdvancedSearch
  }
}


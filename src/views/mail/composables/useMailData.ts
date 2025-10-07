import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getInboxMails,
  getSentMails,
  getDraftMails,
  getStarredMails,
  getDeletedMails,
  getTrashMails
} from '@/api/mail/letter'
import { getFolderMails } from '@/api/mail/folder'
import { getStarredDrafts } from '@/api/mail/draft'
import { convertMailToEmail, formatEmailContent, parseRecipients, type Email } from '../utils/mailFormatter'
import { useUserStoreWithOut } from '@/store/modules/user'

export function useMailData(getUserDetailByIdCard: (idCard: string) => Promise<any>) {
  // 状态
  const allEmails = reactive<Record<string, Email[]>>({
    inbox: [],
    starred: [],
    sent: [],
    drafts: [],
    deleted: [],
    trash: []
  })
  
  const folderEmails = reactive<Record<number, Email[]>>({})
  const loading = ref(false)
  
  // 缓存当前用户身份证号
  let cachedUserIdCard: string | null = null
  
  // 获取当前用户身份证号
  const getCurrentUserIdCard = async (): Promise<string> => {
    // 如果已缓存，直接返回
    if (cachedUserIdCard) {
      return cachedUserIdCard
    }
    
    try {
      // 从 API 获取用户信息
      const userInfo = await import('@/api/login').then(m => m.getInfo())
      const idCard = userInfo?.user?.idCard || ''
      
      // 缓存起来
      cachedUserIdCard = idCard
      return idCard
    } catch (error) {
      return ''
    }
  }
  
  // 方法
  const loadFolderEmails = async (folder: string) => {
    try {
      loading.value = true
      
      let response
      
      switch (folder) {
        case 'inbox':
          response = await getInboxMails({ pageNo: 1, pageSize: 100 })
          break
        case 'sent':
          response = await getSentMails({ pageNo: 1, pageSize: 100 })
          break
        case 'drafts':
          response = await getDraftMails({ pageNo: 1, pageSize: 100 })
          // 草稿箱的邮件标记为草稿，并使用 updateTime 作为排序时间
          if (response && Array.isArray(response.list)) {
            response.list.forEach((mail: any) => {
              mail.isDraft = true
              // 草稿应该使用 updateTime（最后更新时间）作为排序和分组的依据
              // 因为 updateTime 代表了草稿最后一次保存的时间
              if (mail.updateTime) {
                mail.sendTime = mail.updateTime
              }
            })
          }
          break
        case 'starred':
          // 星标邮件需要合并正式邮件和草稿的星标
          const [starredMailsResponse, starredDraftsResponse] = await Promise.all([
            getStarredMails({ pageNo: 1, pageSize: 100 }),
            getStarredDrafts()
          ])
          
          // 合并两个列表
          const starredMailsList = starredMailsResponse?.list || []
          const starredDraftsList = starredDraftsResponse || []
          
          // 将草稿转换为MailListItemVO格式
          const draftsAsMailItems = starredDraftsList.map((draft: any) => ({
            id: draft.id,
            subject: (draft.subject && draft.subject.trim()) ? draft.subject.trim() : '(无主题)',
            content: draft.content,
            fromUserName: draft.senderName,
            // 提取所有收件人（包括主收件人、抄送、密送）
            toUserNames: draft.recipients?.map((r: any) => r.recipientName || r.recipientIdCard).filter(Boolean).join(',') || '',
            sendTime: draft.lastSaveTime,
            isRead: true, // 草稿默认已读
            isStarred: draft.isStarred,
            starredAt: draft.updateTime,
            isDraft: true,
            isTrash: false
          }))
          
          response = {
            list: [...starredMailsList, ...draftsAsMailItems],
            total: starredMailsList.length + draftsAsMailItems.length
          }
          break
        case 'deleted':
          response = await getDeletedMails({ pageNo: 1, pageSize: 100 })
          break
        case 'trash':
          response = await getTrashMails({ pageNo: 1, pageSize: 100 })
          break
        default:
          return
      }
      
      if (response && Array.isArray(response.list)) {
        const currentUserIdCard = await getCurrentUserIdCard()
        const convertedEmails = await Promise.all(
          response.list.map(mail =>
            convertMailToEmail(mail, {
              parseRecipients: (recipients) => parseRecipients(recipients, getUserDetailByIdCard),
              formatEmailContent,
              currentUserIdCard
            })
          )
        )
        
        allEmails[folder] = convertedEmails
      } else {
        allEmails[folder] = []
      }
    } catch (error: any) {
      const folderLabels: Record<string, string> = {
        inbox: '收件箱',
        starred: '星标邮件',
        sent: '已发送',
        drafts: '草稿箱',
        deleted: '已删除',
        trash: '垃圾箱'
      }
      
      let errorMsg = '未知错误'
      if (error?.response?.status === 401) {
        errorMsg = '用户未登录，请重新登录'
      } else if (error?.response?.status === 403) {
        errorMsg = '权限不足，无法访问邮件'
      } else if (error?.response?.status === 404) {
        errorMsg = '邮件服务不可用'
      } else if (error?.response?.data?.msg) {
        errorMsg = error.response.data.msg
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      ElMessage.error(`加载${folderLabels[folder] || folder}失败: ${errorMsg}`)
      allEmails[folder] = []
    } finally {
      loading.value = false
    }
  }
  
  const loadFolderEmailsById = async (folderId: number) => {
    try {
      const response = await getFolderMails(folderId, 1, 100)
      
      if (response && Array.isArray(response.list)) {
        const currentUserIdCard = await getCurrentUserIdCard()
        const convertedEmails = await Promise.all(
          response.list.map(mail =>
            convertMailToEmail(mail, {
              parseRecipients: (recipients) => parseRecipients(recipients, getUserDetailByIdCard),
              formatEmailContent,
              currentUserIdCard
            })
          )
        )
        folderEmails[folderId] = convertedEmails
      } else {
        folderEmails[folderId] = []
      }
    } catch (error: any) {
      ElMessage.error(`加载文件夹邮件失败: ${error?.response?.data?.msg || error?.message || '未知错误'}`)
      folderEmails[folderId] = []
    }
  }
  
  const getCurrentEmails = (selectedFolder: string, selectedFolderId: number | null): Email[] => {
    if (selectedFolder === 'custom' && selectedFolderId) {
      return folderEmails[selectedFolderId] || []
    }
    return allEmails[selectedFolder] || []
  }
  
  const updateEmailStatusInAllFolders = (
    emailIds: number[],
    updateFn: (email: Email) => void
  ) => {
    // 更新系统文件夹中的邮件状态
    emailIds.forEach(emailId => {
      Object.keys(allEmails).forEach(folderKey => {
        const email = allEmails[folderKey].find(e => e.id === emailId)
        if (email) {
          updateFn(email)
        }
      })
    })
    
    // 更新自定义文件夹中的邮件状态
    emailIds.forEach(emailId => {
      Object.keys(folderEmails).forEach(folderId => {
        const email = folderEmails[folderId].find(e => e.id === emailId)
        if (email) {
          updateFn(email)
        }
      })
    })
  }
  
  return {
    allEmails,
    folderEmails,
    loading,
    loadFolderEmails,
    loadFolderEmailsById,
    getCurrentEmails,
    updateEmailStatusInAllFolders
  }
}


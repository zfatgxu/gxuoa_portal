import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getLetterContactStarPage,
  getSentMails,
  createLetterContactStar,
  deleteLetterContactStar,
  type LetterContactStarRespVO,
  type LetterContactStarCreateReqVO,
  type MailListItemVO
} from '@/api/mail/letter'
import { getSimpleUserList } from '@/api/system/user'
import type { RecentContact, UserOption } from '../types/mail'
import { useUserCache } from './useUserCache'

/**
 * 联系人管理 Composable
 * 负责管理最近联系人、星标联系人和用户搜索
 */
export function useContacts() {
  // 使用统一的用户缓存服务
  const { getUserNickname, getUserByIdCardCached } = useUserCache()
  
  // 状态
  const recentContacts = ref<RecentContact[]>([])
  const recentContactDepartments = ref<Map<string, string>>(new Map())
  const recentContactAvatars = ref<Map<string, string>>(new Map())
  const starredContacts = ref<LetterContactStarRespVO[]>([])
  const starredContactDisplayNames = ref<Map<number, string>>(new Map())
  const starredContactDepartments = ref<Map<number, string>>(new Map())
  const starredContactAvatars = ref<Map<number, string>>(new Map())
  const allUsers = ref<any[]>([])
  const userOptions = ref<UserOption[]>([])
  const loading = ref(false)
  const contactSearch = ref('')
  
  // 计算属性：过滤后的最近联系人
  const filteredRecentContacts = computed(() => {
    if (!contactSearch.value.trim()) {
      return recentContacts.value
    }
    
    const searchTerm = contactSearch.value.toLowerCase().trim()
    return recentContacts.value.filter(contact => 
      contact.name && contact.name.toLowerCase().startsWith(searchTerm)
    )
  })
  
  // 计算属性：过滤后的星标联系人
  const filteredStarredContacts = computed(() => {
    if (!contactSearch.value.trim()) {
      return starredContacts.value
    }
    
    const searchTerm = contactSearch.value.toLowerCase().trim()
    return starredContacts.value.filter(contact => {
      const displayName = starredContactDisplayNames.value.get(contact.id)
      return displayName && displayName.toLowerCase().startsWith(searchTerm)
    })
  })
  
  /**
   * 获取星标联系人的显示名称
   * 使用统一的用户缓存服务
   */
  const getStarredContactDisplayName = async (contact: LetterContactStarRespVO): Promise<string> => {
    try {
      return await getUserNickname(contact.contactIdCard)
    } catch (error) {
      return '未知用户'
    }
  }
  
  /**
   * 加载最近联系人
   */
  const loadRecentContacts = async () => {
    try {
      const response = await getSentMails({ pageNo: 1, pageSize: 50 })
      
      if (response && Array.isArray(response.list)) {
        // 提取收件人信息并去重
        const contactMap = new Map()
        
        response.list.forEach((mail: MailListItemVO) => {
          if (mail.toUserNames) {
            // 解析收件人姓名列表
            const recipients = mail.toUserNames.split(',').map(name => name.trim()).filter(name => name)
            
            recipients.forEach(recipientName => {
              if (recipientName && !contactMap.has(recipientName)) {
                contactMap.set(recipientName, {
                  name: recipientName,
                  lastSendTime: mail.sendTime,
                  sendCount: 1
                })
              } else if (contactMap.has(recipientName)) {
                // 更新发送次数和最新发送时间
                const existing = contactMap.get(recipientName)
                existing.sendCount += 1
                if (new Date(mail.sendTime) > new Date(existing.lastSendTime)) {
                  existing.lastSendTime = mail.sendTime
                }
              }
            })
          }
        })
        
        // 转换为数组并按最后发送时间倒序排列
        recentContacts.value = Array.from(contactMap.values())
          .sort((a, b) => new Date(b.lastSendTime).getTime() - new Date(a.lastSendTime).getTime())
          .slice(0, 20) // 只显示最近20个联系人
        
        // 确保用户列表已加载
        if (allUsers.value.length === 0) {
          await loadAllUsers()
        }
        
        // 异步加载每个最近联系人的部门信息和头像（使用 getUserByIdCardCached 获取完整信息）
        for (const contact of recentContacts.value) {
          const user = allUsers.value.find((u: any) => u.nickname === contact.name)
          if (user) {
            contact.idCard = user.idCard || ''
            
            // 使用 getUserByIdCardCached 获取完整的用户信息（包括头像）
            try {
              const userDetail = await getUserByIdCardCached(user.idCard)
              if (userDetail) {
                const department = userDetail.deptNamesStr || userDetail.deptNames?.join('、') || '未知部门'
                recentContactDepartments.value.set(contact.name, department)
                // 从完整用户信息中获取头像
                const avatar = userDetail.avatar || ''
                recentContactAvatars.value.set(contact.name, avatar)
              } else {
                throw new Error('用户详情为空')
              }
            } catch (error) {
              // API调用失败或获取详情失败时，使用简化信息
              const department = user.deptNamesStr || user.deptNames?.join('、') || '未知部门'
              recentContactDepartments.value.set(contact.name, department)
              recentContactAvatars.value.set(contact.name, '')
            }
          } else {
            recentContactDepartments.value.set(contact.name, '未知部门')
            recentContactAvatars.value.set(contact.name, '')
          }
        }
      } else {
        recentContacts.value = []
      }
    } catch (error: any) {
      recentContacts.value = []
    }
  }
  
  /**
   * 加载星标联系人
   */
  const loadStarredContacts = async () => {
    try {
      const response = await getLetterContactStarPage({ pageNo: 1, pageSize: 50 })
      
      if (response && Array.isArray(response.list)) {
        starredContacts.value = response.list
          .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
          .slice(0, 20) // 只显示最近20个星标联系人
        
        // 异步加载每个联系人的显示名称、部门信息和头像
        for (const contact of starredContacts.value) {
          try {
            const displayName = await getStarredContactDisplayName(contact)
            starredContactDisplayNames.value.set(contact.id, displayName)
            
            // 获取用户完整信息以获取部门和头像
            const userInfo = await getUserByIdCardCached(contact.contactIdCard)
            const department = userInfo?.deptNamesStr || userInfo?.deptNames?.join('、') || '未知部门'
            starredContactDepartments.value.set(contact.id, department)
            // 获取头像
            const avatar = userInfo?.avatar || ''
            starredContactAvatars.value.set(contact.id, avatar)
          } catch (error) {
            starredContactDisplayNames.value.set(contact.id, '未知用户')
            starredContactDepartments.value.set(contact.id, '未知部门')
            starredContactAvatars.value.set(contact.id, '')
          }
        }
      } else {
        starredContacts.value = []
      }
    } catch (error: any) {
      starredContacts.value = []
    }
  }
  
  /**
   * 加载所有用户列表
   */
  const loadAllUsers = async () => {
    try {
      const users = await getSimpleUserList()
      if (users && Array.isArray(users)) {
        allUsers.value = users
        
        // 初始化用户选项列表（显示前20个）
        userOptions.value = users.slice(0, 20).map((user: any) => ({
          value: user.id.toString(),
          label: `${user.nickname || '未知用户'} <${user.deptNames ? user.deptNames.join(', ') : ''}>`,
          avatar: user.avatar || '',
          name: user.nickname || '未知用户',
          userId: user.id,
          deptName: user.deptNames ? user.deptNames.join(', ') : ''
        }))
      }
    } catch (error) {
      allUsers.value = []
    }
  }
  
  /**
   * 搜索用户（基于预加载的用户列表）
   */
  const searchUsers = async (query: string) => {
    try {
      loading.value = true
      
      // 如果输入为空，清空联想选项
      if (!query || !query.trim()) {
        userOptions.value = []
        return
      }
      
      // 如果还没有预加载用户列表，先加载
      if (allUsers.value.length === 0) {
        await loadAllUsers()
      }
      
      const searchTerm = query.toLowerCase().trim()
      
      // 搜索词太短，不进行过滤
      if (searchTerm.length < 1) {
        userOptions.value = []
        return
      }
      
      // 基于预加载的用户列表进行过滤
      const filteredUsers = allUsers.value.filter(user => {
        const nickname = (user.nickname || '').toLowerCase()
        const workId = (user.workId || '').toLowerCase()
        const email = (user.email || '').toLowerCase()
        
        return nickname.includes(searchTerm) || 
               workId.startsWith(searchTerm) || 
               email.startsWith(searchTerm)
      })
      
      // 按姓名排序
      filteredUsers.sort((a, b) => {
        const aName = (a.nickname || '').toLowerCase()
        const bName = (b.nickname || '').toLowerCase()
        return aName.localeCompare(bName)
      })
      
      // 转换为前端需要的格式
      userOptions.value = filteredUsers.slice(0, 50).map((user: any) => {
        const nickname = user.nickname || '未知用户'
        const deptName = user.deptNames ? user.deptNames.join(', ') : ''
        const workId = user.workId || ''
        const email = user.email || ''
        
        let label = nickname
        if (deptName) label += ` <${deptName}>`
        if (workId) label += ` <工号:${workId}>`
        if (email) label += ` <${email}>`
        
        return {
          value: user.id.toString(),
          label: label,
          avatar: user.avatar || '',
          name: nickname,
          userId: user.id,
          deptName: deptName,
          workId: workId,
          email: email
        }
      })
    } catch (error: any) {
      userOptions.value = []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 切换联系人星标状态
   */
  const toggleContactStar = async (
    contact: any, 
    isStarred: boolean, 
    type: 'recent' | 'starred',
    currentUserId: number,
    currentUserName: string
  ) => {
    try {
      if (isStarred) {
        // 取消星标
        let starredContact
        if (type === 'starred') {
          starredContact = contact
        } else {
          starredContact = starredContacts.value.find(starred => {
            const starredDisplayName = starredContactDisplayNames.value.get(starred.id)
            return starredDisplayName === contact.name || starred.contactIdCard === contact.idCard
          })
        }
        
        if (starredContact) {
          await deleteLetterContactStar(starredContact.id)
          const displayName = starredContactDisplayNames.value.get(starredContact.id) || contact.name || '该联系人'
          ElMessage.success(`已取消 ${displayName} 的星标`)
        }
      } else {
        // 添加星标
        let contactIdCard = contact.idCard
        if (!contactIdCard) {
          const user = allUsers.value.find((u: any) => u.nickname === contact.name)
          if (user?.idCard) {
            contactIdCard = user.idCard
          } else {
            contactIdCard = user?.id?.toString() || contact.name
          }
        }
        
        if (!currentUserId || !currentUserName || !contactIdCard) {
          throw new Error('用户信息或联系人信息不完整')
        }
        
        const starData: LetterContactStarCreateReqVO = {
          userId: currentUserId,
          userName: currentUserName,
          contactIdCard: contactIdCard,
          remark: `从最近联系人添加`
        }
        
        await createLetterContactStar(starData)
        ElMessage.success(`已为 ${contact.name} 添加星标`)
      }
      
      // 重新加载星标联系人列表
      await loadStarredContacts()
      
      return true
    } catch (error: any) {
      let errorMsg = '操作失败，请稍后重试'
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      if (errorMsg === '系统异常') {
        errorMsg = '系统异常，可能是数据格式不正确或权限不足。请检查用户信息是否完整。'
      }
      
      ElMessage.error(`操作失败: ${errorMsg}`)
      return false
    }
  }
  
  /**
   * 初始化所有联系人数据（并发加载）
   */
  const initContacts = async () => {
    try {
      await Promise.allSettled([
        loadAllUsers(),
        loadRecentContacts(),
        loadStarredContacts()
      ])
    } catch (error) {
      // 忽略错误
    }
  }
  
  return {
    // 状态
    recentContacts,
    recentContactDepartments,
    recentContactAvatars,
    starredContacts,
    starredContactDisplayNames,
    starredContactDepartments,
    starredContactAvatars,
    allUsers,
    userOptions,
    loading,
    contactSearch,
    
    // 计算属性
    filteredRecentContacts,
    filteredStarredContacts,
    
    // 方法
    initContacts,
    loadRecentContacts,
    loadStarredContacts,
    loadAllUsers,
    searchUsers,
    toggleContactStar,
    getStarredContactDisplayName
  }
}


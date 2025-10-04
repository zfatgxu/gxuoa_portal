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
  const starredContacts = ref<LetterContactStarRespVO[]>([])
  const starredContactDisplayNames = ref<Map<number, string>>(new Map())
  const starredContactDepartments = ref<Map<number, string>>(new Map())
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
      // 直接使用统一缓存服务获取用户昵称
      return await getUserNickname(contact.contactIdCard)
    } catch (error) {
      console.error('获取星标联系人用户信息失败:', error)
      return '未知用户'
    }
  }
  
  /**
   * 加载最近联系人
   */
  const loadRecentContacts = async () => {
    try {
      console.log('📡 开始加载最近联系人...')
      const response = await getSentMails({ pageNo: 1, pageSize: 50 })
      
      if (response && Array.isArray(response.list)) {
        console.log(`📊 获取到 ${response.list.length} 封已发送邮件`)
        
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
        
        console.log(`✅ 最近联系人加载成功，共 ${recentContacts.value.length} 个联系人`)
        
        // 确保用户列表已加载
        if (allUsers.value.length === 0) {
          await loadAllUsers()
        }
        
        // 加载每个最近联系人的部门信息
        recentContacts.value.forEach(contact => {
          const user = allUsers.value.find((u: any) => u.nickname === contact.name)
          if (user) {
            const department = user.deptNamesStr || user.deptNames?.join('、') || '未知部门'
            recentContactDepartments.value.set(contact.name, department)
          } else {
            recentContactDepartments.value.set(contact.name, '未知部门')
          }
        })
      } else {
        console.log('⚠️ 已发送邮件响应格式异常')
        recentContacts.value = []
      }
    } catch (error: any) {
      console.error('❌ 加载最近联系人失败:', error)
      recentContacts.value = []
    }
  }
  
  /**
   * 加载星标联系人
   */
  const loadStarredContacts = async () => {
    try {
      console.log('📡 开始加载星标联系人...')
      const response = await getLetterContactStarPage({ pageNo: 1, pageSize: 50 })
      
      if (response && Array.isArray(response.list)) {
        console.log(`📊 获取到 ${response.list.length} 个星标联系人`)
        
        starredContacts.value = response.list
          .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
          .slice(0, 20) // 只显示最近20个星标联系人
        
        console.log(`✅ 星标联系人加载成功，共 ${starredContacts.value.length} 个联系人`)
        
        // 异步加载每个联系人的显示名称和部门信息
        for (const contact of starredContacts.value) {
          try {
            const displayName = await getStarredContactDisplayName(contact)
            starredContactDisplayNames.value.set(contact.id, displayName)
            
            // 获取用户完整信息以获取部门
            const userInfo = await getUserByIdCardCached(contact.contactIdCard)
            const department = userInfo?.deptNamesStr || userInfo?.deptNames?.join('、') || '未知部门'
            starredContactDepartments.value.set(contact.id, department)
          } catch (error) {
            console.error(`获取联系人 ${contact.contactIdCard} 的显示名称失败:`, error)
            starredContactDisplayNames.value.set(contact.id, '未知用户')
            starredContactDepartments.value.set(contact.id, '未知部门')
          }
        }
      } else {
        console.log('⚠️ 星标联系人响应格式异常')
        starredContacts.value = []
      }
    } catch (error: any) {
      console.error('❌ 加载星标联系人失败:', error)
      starredContacts.value = []
    }
  }
  
  /**
   * 加载所有用户列表
   */
  const loadAllUsers = async () => {
    try {
      console.log('📡 加载用户列表...')
      const users = await getSimpleUserList()
      if (users && Array.isArray(users)) {
        console.log(`✅ 用户列表加载成功，共 ${users.length} 个用户`)
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
      console.error('❌ 加载用户列表失败:', error)
      allUsers.value = []
    }
  }
  
  /**
   * 搜索用户（基于预加载的用户列表）
   */
  const searchUsers = async (query: string) => {
    console.log(`🔍 开始搜索联系人，关键词: "${query}"`)
    
    try {
      loading.value = true
      
      // 如果输入为空，清空联想选项
      if (!query || !query.trim()) {
        console.log('🔍 输入为空，清空联想选项')
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
        console.log('🔍 搜索词太短，清空联想选项')
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
      
      console.log(`🔍 过滤后找到 ${filteredUsers.length} 个匹配用户`)
      
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
      
      console.log('🔄 更新用户选项列表:', userOptions.value)
    } catch (error: any) {
      console.error('❌ 搜索联系人失败:', error)
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
        console.log('🔍 开始添加星标联系人...')
        console.log('📋 当前联系人信息:', contact)
        
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
      console.error('❌ 切换星标状态失败:', error)
      
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
    console.log('🚀 开始并发加载所有联系人数据...')
    
    try {
      const results = await Promise.allSettled([
        loadAllUsers(),
        loadRecentContacts(),
        loadStarredContacts()
      ])
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ 并发加载任务 ${index + 1} 成功`)
        } else {
          console.error(`❌ 并发加载任务 ${index + 1} 失败:`, result.reason)
        }
      })
      
      const hasFailures = results.some(result => result.status === 'rejected')
      if (hasFailures) {
        console.warn('⚠️ 部分并发加载任务失败')
      }
      
      console.log('🏁 联系人数据加载完成')
    } catch (error) {
      console.error('❌ 并发加载过程中发生错误:', error)
    }
  }
  
  return {
    // 状态
    recentContacts,
    recentContactDepartments,
    starredContacts,
    starredContactDisplayNames,
    starredContactDepartments,
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


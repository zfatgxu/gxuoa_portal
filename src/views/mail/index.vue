<template>
  <div class="mail-container">
    <!-- 顶部标题栏 -->
    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 顶部按钮区域 -->
        <div class="sidebar-top">
          <button class="compose-btn" @click="goCompose">
            <span class="icon icon--compose">
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 14l8.5-8.5c.6-.6 1.6-.6 2.2 0l1.8 1.8c.6.6.6 1.6 0 2.2L7 18H3v-4z" fill="#f5a623"/>
                <path d="M12.3 3.7l4 4" stroke="#f5a623" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="btn-text">写信</span>
          </button>
          <div class="sidebar-divider"></div>
        </div>

        <!-- 文件夹列表 -->
        <div class="folder-list">
          <div class="folder-item" :class="{active: selectedFolder==='inbox'}" @click="selectFolder('inbox')">
    <span class="folder-icon">
      <!-- 信箱SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l8 6 8-6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">收件箱</span><span class="folder-badge">{{ getInboxCount() }}</span>
          </div>
          <div class="folder-item" :class="{active: selectedFolder==='starred'}" @click="selectFolder('starred')">
    <span class="folder-icon">
      <!-- 星标SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12,7.5 18,7.5 13,11.5 15,17 10,13.5 5,17 7,11.5 2,7.5 8,7.5" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">星标邮件</span><span class="folder-badge">{{ getStarredCount() }}</span>
          </div>
          <div class="folder-item" :class="{active: selectedFolder==='drafts'}" @click="selectFolder('drafts')">
    <span class="folder-icon">
      <!-- 文件夹SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">草稿箱</span><span class="folder-badge">{{ getDraftCount() }}</span>
          </div>
          <div class="folder-item" :class="{active: selectedFolder==='sent'}" @click="selectFolder('sent')">
    <span class="folder-icon">
      <!-- 纸飞机SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">已发送</span><span class="folder-badge">{{ getSentCount() }}</span>
          </div>
          <div class="folder-item" :class="{active: selectedFolder==='deleted'}" @click="selectFolder('deleted')">
    <span class="folder-icon">
      <!-- 垃圾桶SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="7" width="10" height="9" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M3 7h14" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M8 10v3" stroke="#ff9800" stroke-width="1.2"/><path d="M12 10v3" stroke="#ff9800" stroke-width="1.2"/></svg>
    </span>
            <span class="folder-name">已删除</span><span class="folder-badge">{{ getDeletedCount() }}</span>
          </div>
          <div class="folder-item">
    <span class="folder-icon">
      <!-- 文件夹SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">我的文件夹</span>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <MainContent 
        ref="mainContentRef"
        :folderName="folderLabels[selectedFolder]" 
        :emails="allEmails[selectedFolder] || []" 
        :isDeletedFolder="selectedFolder==='deleted'"
        :mailStats="mailStats"
        @delete-emails="handleDeleteEmails"
        @permanent-delete-emails="handlePermanentDeleteEmails"
        @mark-emails="handleMarkEmails"
        @show-message="handleShowMessage"
        @toggle-star="handleToggleStar"
        @sync-mails="handleSyncMails"
        @view-email-detail="handleViewEmailDetail"
        @get-email-detail="handleGetEmailDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainContent from './components/mainContent.vue'
import { ref, reactive, onMounted } from 'vue'
import '@/views/mail/mail.css'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { 
  getInboxMails, 
  getSentMails, 
  getDraftMails, 
  getStarredMails,
  getDeletedMails,
  moveToTrash,
  permanentDelete,
  markAsRead,
  markAsUnread,
  toggleStar as toggleStarAPI,
  getMailStats,
  getLetterDetail,
  type MailListItemVO,
  type MailStatsVO
} from '@/api/system/mail/letter/index'
import { getUserByIdCard } from '@/api/system/user/index'

interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string
  deletedAt?: string
  isDraft?: boolean
  isStarred?: boolean
  starredAt?: string
  fromMail?: string
  toMail?: string
  content?: string
  isRead?: boolean
}

// 邮件数据状态管理
const allEmails = reactive<Record<string, Email[]>>({
  inbox: [],
  starred: [],
  sent: [],
  drafts: [],
  deleted: []
})

const loading = ref(false)
const mainContentRef = ref<InstanceType<typeof MainContent> | null>(null)
const userDetailsCache = ref<Record<string, any>>({}) // 用户详情缓存
const mailStats = ref<MailStatsVO>({
  inboxCount: 0,
  sentCount: 0,
  draftsCount: 0,  // 修正为 draftsCount
  starredCount: 0,
  deletedCount: 0,
  totalUnreadCount: 0,
  totalCount: 0,
  inboxUnreadCount: 0
})


// 通过身份证获取用户详情
async function getUserDetailByIdCard(idCard: string): Promise<any> {
  if (!idCard) return null
  
  // 检查缓存
  if (userDetailsCache.value[idCard]) {
    return userDetailsCache.value[idCard]
  }
  
  try {
    console.log(`🔍 通过身份证获取用户详情: ${idCard}`)
    const userDetail = await getUserByIdCard(idCard)
    console.log(`✅ 用户详情获取成功:`, userDetail)
    
    // 缓存用户详情
    userDetailsCache.value[idCard] = userDetail
    return userDetail
  } catch (error: any) {
    console.error(`❌ 获取用户详情失败:`, error)
    return null
  }
}

// 解析收件人信息，将身份证号转换为真实姓名
async function parseRecipients(recipients: string): Promise<string> {
  if (!recipients) return '无'
  
  // 分割收件人（可能是多个，用逗号分隔）
  const recipientList = recipients.split(',').map(r => r.trim())
  const parsedNames: string[] = []
  
  for (const recipient of recipientList) {
    if (!recipient) continue
    
    // 判断是否为身份证号（18位数字）
    if (/^\d{18}$/.test(recipient)) {
      const userDetail = await getUserDetailByIdCard(recipient)
      if (userDetail && userDetail.nickname) {
        parsedNames.push(userDetail.nickname) // 只显示真实姓名
      } else {
        parsedNames.push(recipient) // 如果获取不到用户详情，显示原身份证号
      }
    } else {
      // 不是身份证号，直接显示
      parsedNames.push(recipient)
    }
  }
  
  return parsedNames.join(', ')
}

// 解析邮件内容，处理HTML标签和格式
function parseEmailContent(content: string): string {
  if (!content) return '无内容'
  
  // 创建一个临时的div元素来解析HTML
  const temp = document.createElement('div')
  temp.innerHTML = content
  
  // 获取纯文本内容
  let textContent = temp.textContent || temp.innerText || ''
  
  // 清理多余的空白字符
  textContent = textContent.replace(/\s+/g, ' ').trim()
  
  // 处理换行符，保持原有的段落结构
  textContent = textContent.replace(/\n\s*\n/g, '\n\n')
  
  // 处理特殊字符
  textContent = textContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  return textContent
}

// 格式化邮件内容，添加适当的换行和段落
function formatEmailContent(content: string): string {
  if (!content) return '无内容'
  
  // 解析HTML内容
  const parsedContent = parseEmailContent(content)
  
  // 添加段落分隔
  let formattedContent = parsedContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n')
  
  // 确保内容不为空
  if (!formattedContent.trim()) {
    return '无内容'
  }
  
  return formattedContent
}

// 转换后端邮件数据为前端格式
async function convertMailToEmail(mail: MailListItemVO): Promise<Email> {
  const date = mail.sendTime
  const dateStr = new Date(date).toISOString().split('T')[0]
  const timeStr = new Date(date).toTimeString().slice(0, 5)
  
  // 计算时间显示逻辑
  const today = new Date()
  const mailDate = new Date(date)
  
  // 获取今天的日期字符串 (YYYY-MM-DD)
  const todayStr = today.toISOString().split('T')[0]
  
  // 获取昨天的日期字符串
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  // 判断显示逻辑
  let displayTime: string
  if (dateStr === todayStr) {
    // 1. 假如是今天，显示 今天 hh:mm
    displayTime = `今天 ${timeStr}`
  } else if (dateStr === yesterdayStr) {
    // 2. 假如是昨天，显示 昨天 hh:mm
    displayTime = `昨天 ${timeStr}`
  } else {
    // 检查是否是今年
    const currentYear = today.getFullYear()
    const mailYear = mailDate.getFullYear()
    
    if (mailYear === currentYear) {
      // 3. 假如早于今天但在今年，显示 m月d日
      const month = mailDate.getMonth() + 1 // getMonth() 返回 0-11，需要 +1
      const day = mailDate.getDate()
      displayTime = `${month}月${day}日`
    } else {
      // 4. 假如早于今年，显示 yyyy/mm/dd
      const year = mailDate.getFullYear()
      const month = String(mailDate.getMonth() + 1).padStart(2, '0')
      const day = String(mailDate.getDate()).padStart(2, '0')
      displayTime = `${year}/${month}/${day}`
    }
  }
  
  // 解析收件人信息
  const parsedToMail = await parseRecipients(mail.toUserNames || '')
  
  // 解析邮件内容
  const formattedContent = formatEmailContent(mail.content || '')
  
  return {
    id: mail.id,
    sender: mail.fromUserName,
    subject: mail.subject,
    time: displayTime,
    date: dateStr,
    deletedAt: mail.deletedAt ? new Date(mail.deletedAt).toISOString().split('T')[0] : undefined,
    isDraft: mail.isDraft,
    isStarred: mail.isStarred,
    starredAt: mail.starredAt ? new Date(mail.starredAt).toISOString().split('T')[0] : undefined,
    fromMail: mail.fromUserName,
    toMail: parsedToMail,
    content: formattedContent,
    isRead: mail.isRead
  }
}

// 加载指定文件夹的邮件
async function loadFolderEmails(folder: string) {
  try {
    loading.value = true
    console.log(`📥 开始加载${folder}邮件...`)
    
    let response
    
    switch (folder) {
      case 'inbox':
        console.log('📨 调用收件箱API...')
        response = await getInboxMails({ pageNo: 1, pageSize: 100 })
        break
      case 'sent':
        console.log('📤 调用发件箱API...')
        response = await getSentMails({ pageNo: 1, pageSize: 100 })
        break
      case 'drafts':
        console.log('📝 调用草稿箱API...')
        response = await getDraftMails({ pageNo: 1, pageSize: 100 })
        break
      case 'starred':
        console.log('⭐ 调用星标邮件API...')
        response = await getStarredMails({ pageNo: 1, pageSize: 100 })
        break
      case 'deleted':
        console.log('🗑️ 调用已删除邮件API...')
        response = await getDeletedMails({ pageNo: 1, pageSize: 100 })
        break
      default:
        console.log(`❌ 未知文件夹类型: ${folder}`)
        return
    }
    
    console.log(`📊 ${folder}邮件API响应:`, response)
    
    if (response && Array.isArray(response.list)) {
      console.log(`📋 ${folder}邮件列表长度:`, response.list.length)
      // 使用 Promise.all 处理异步转换
      const convertedEmails = await Promise.all(response.list.map(convertMailToEmail))
      allEmails[folder] = convertedEmails
      console.log(`✅ ${folder}邮件加载成功，转换后数量:`, allEmails[folder].length)
    } else {
      console.log(`⚠️ ${folder}邮件响应格式异常:`, response)
      allEmails[folder] = []
    }
  } catch (error: any) {
    console.error(`❌ 加载${folder}邮件失败:`, error)
    console.error('🔍 错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
    
    // 根据错误类型显示不同的错误信息
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
    
    // 确保在错误情况下也清空对应文件夹的数据
    allEmails[folder] = []
  } finally {
    loading.value = false
    console.log(`🏁 ${folder}邮件加载流程结束`)
  }
}

// 加载邮件统计信息
async function loadMailStats() {
  try {
    console.log('📊 开始加载邮件统计信息...')
    const response = await getMailStats()
    console.log('📈 邮件统计API响应:', response)
    
    if (response) {
      mailStats.value = response
      console.log('✅ 邮件统计加载成功:', {
        inboxCount: response.inboxCount,
        sentCount: response.sentCount,
        draftsCount: response.draftsCount,
        starredCount: response.starredCount,
        deletedCount: response.deletedCount
      })
    } else {
      console.log('⚠️ 邮件统计响应为空')
    }
  } catch (error: any) {
    console.error('❌ 加载邮件统计失败:', error)
    console.error('🔍 统计错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
  }
}



// 同步邮件方法（简化版）
async function handleSyncMails() {
  console.log('🔄 同步邮件')
  try {
    const loadingInstance = ElLoading.service({ text: '正在同步邮件...' })
    
    console.log('🔄 重新加载当前文件夹邮件...')
    await loadFolderEmails(selectedFolder.value)
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    console.log('✅ 邮件同步完成')
    ElMessage.success('邮件同步成功')
    loadingInstance.close()
  } catch (error: any) {
    console.error('❌ 同步邮件失败:', error)
    ElMessage.error('同步邮件失败')
  }
}

const folderLabels: Record<string, string> = {
  inbox: '收件箱',
  starred: '星标邮件',
  sent: '已发送',
  drafts: '草稿箱',
  deleted: '已删除'
}

const selectedFolder = ref('inbox')
async function selectFolder(folder: string) {
  console.log(`📁 切换文件夹: ${folder}`)
  console.log(`🔄 更新选中文件夹状态: ${selectedFolder.value} -> ${folder}`)
  
  selectedFolder.value = folder
  console.log(`📥 开始加载文件夹 ${folder} 的邮件...`)
  
  // 如果是发件箱，添加特殊处理
  if (folder === 'sent') {
    console.log('📤 正在加载发件箱，检查是否有已发送的邮件...')
  }
  
  await loadFolderEmails(folder)
  
  console.log(`✅ 文件夹切换完成: ${folder}`)
  console.log(`📊 当前文件夹邮件数量:`, allEmails[folder]?.length || 0)
}

// 处理删除邮件
async function handleDeleteEmails(emailIds: number[]) {
  console.log(`🗑️ 开始删除邮件，ID列表:`, emailIds)
  console.log(`📁 当前文件夹: ${selectedFolder.value}`)
  
  try {
    loading.value = true
    console.log('📡 调用删除邮件API...')
    await moveToTrash({ ids: emailIds })
    
    console.log('🔄 从当前文件夹移除邮件...')
    const currentEmails = allEmails[selectedFolder.value]
    emailIds.forEach(emailId => {
      const emailIndex = currentEmails.findIndex(email => email.id === emailId)
      if (emailIndex !== -1) {
        console.log(`🗑️ 移除邮件: ${emailId}`)
        currentEmails.splice(emailIndex, 1)
      }
    })
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder.value !== 'deleted') {
      console.log('📥 重新加载已删除文件夹...')
      await loadFolderEmails('deleted')
    }
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    console.log(`✅ 成功删除 ${emailIds.length} 封邮件`)
    ElMessage.success(`成功删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    console.error('❌ 删除邮件失败:', error)
    console.error('🔍 删除错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
    ElMessage.error('删除邮件失败')
  } finally {
    loading.value = false
    console.log('🏁 删除邮件流程结束，loading状态:', loading.value)
  }
}

// 处理彻底删除邮件
async function handlePermanentDeleteEmails(emailIds: number[]) {
  console.log(`💀 开始彻底删除邮件，ID列表:`, emailIds)
  console.log(`📁 当前文件夹: ${selectedFolder.value}`)
  
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要彻底删除这 ${emailIds.length} 封邮件吗？此操作不可恢复！`,
      '彻底删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    loading.value = true
    console.log('📡 调用彻底删除邮件API...')
    await permanentDelete({ ids: emailIds })
    
    console.log('🔄 从当前文件夹移除邮件...')
    const currentEmails = allEmails[selectedFolder.value]
    emailIds.forEach(emailId => {
      const emailIndex = currentEmails.findIndex(email => email.id === emailId)
      if (emailIndex !== -1) {
        console.log(`💀 彻底移除邮件: ${emailId}`)
        currentEmails.splice(emailIndex, 1)
      }
    })
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder.value !== 'deleted') {
      console.log('📥 重新加载已删除文件夹...')
      await loadFolderEmails('deleted')
    }
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    console.log(`✅ 成功彻底删除 ${emailIds.length} 封邮件`)
    ElMessage.success(`成功彻底删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    if (error === 'cancel') {
      console.log('🚫 用户取消了彻底删除操作')
      return
    }
    
    console.error('❌ 彻底删除邮件失败:', error)
    console.error('🔍 彻底删除错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
    ElMessage.error('彻底删除邮件失败')
  } finally {
    loading.value = false
    console.log('🏁 彻底删除邮件流程结束，loading状态:', loading.value)
  }
}

// 处理显示消息
function handleShowMessage(data: { type: string, message: string }) {
  const { type, message } = data
  if (type === 'warning') {
    ElMessage.warning(message)
  } else if (type === 'error') {
    ElMessage.error(message)
  } else if (type === 'success') {
    ElMessage.success(message)
  } else {
    ElMessage.info(message)
  }
}

// 处理标记邮件操作
async function handleMarkEmails(data: { action: string, emailIds: number[] }) {
  const { action, emailIds } = data
  console.log(`🏷️ 开始标记邮件操作: ${action}，ID列表:`, emailIds)
  console.log(`📁 当前文件夹: ${selectedFolder.value}`)
  
  try {
    loading.value = true
    let successMessage = ''
    
    switch (action) {
      case 'read':
        console.log('📡 调用标记为已读API...')
        await markAsRead({ ids: emailIds })
        successMessage = `成功标记 ${emailIds.length} 封邮件为已读`
        
        // 更新本地状态
        emailIds.forEach(emailId => {
          Object.keys(allEmails).forEach(folderKey => {
            const email = allEmails[folderKey].find(e => e.id === emailId)
            if (email) {
              email.isRead = true
            }
          })
        })
        break
        
      case 'unread':
        console.log('📡 调用标记为未读API...')
        await markAsUnread({ ids: emailIds })
        successMessage = `成功标记 ${emailIds.length} 封邮件为未读`
        
        // 更新本地状态
        emailIds.forEach(emailId => {
          Object.keys(allEmails).forEach(folderKey => {
            const email = allEmails[folderKey].find(e => e.id === emailId)
            if (email) {
              email.isRead = false
            }
          })
        })
        break
        
      case 'star':
        console.log('📡 调用添加星标API...')
        await toggleStarAPI({ ids: emailIds })
        successMessage = `成功为 ${emailIds.length} 封邮件添加星标`
        
        // 更新本地状态
        const today = new Date().toISOString().split('T')[0]
        emailIds.forEach(emailId => {
          Object.keys(allEmails).forEach(folderKey => {
            const email = allEmails[folderKey].find(e => e.id === emailId)
            if (email) {
              email.isStarred = true
              email.starredAt = today
            }
          })
        })
        
        // 重新加载星标文件夹
        await loadFolderEmails('starred')
        break
        
      case 'unstar':
        console.log('📡 调用取消星标API...')
        await toggleStarAPI({ ids: emailIds })
        successMessage = `成功取消 ${emailIds.length} 封邮件的星标`
        
        // 更新本地状态
        emailIds.forEach(emailId => {
          Object.keys(allEmails).forEach(folderKey => {
            const email = allEmails[folderKey].find(e => e.id === emailId)
            if (email) {
              email.isStarred = false
              email.starredAt = undefined
              
              // 从星标文件夹中移除
              if (folderKey === 'starred') {
                const starredIndex = allEmails.starred.findIndex(e => e.id === emailId)
                if (starredIndex !== -1) {
                  allEmails.starred.splice(starredIndex, 1)
                }
              }
            }
          })
        })
        
        // 重新加载星标文件夹
        await loadFolderEmails('starred')
        break
        
      default:
        console.error(`❌ 未知的标记操作: ${action}`)
        ElMessage.error('未知的标记操作')
        return
    }
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    console.log(`✅ ${successMessage}`)
    ElMessage.success(successMessage)
    
  } catch (error: any) {
    console.error('❌ 标记邮件失败:', error)
    console.error('🔍 标记错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
    ElMessage.error('标记邮件失败')
  } finally {
    loading.value = false
    console.log('🏁 标记邮件流程结束，loading状态:', loading.value)
  }
}

// 处理星标切换
async function handleToggleStar(emailId: number) {
  console.log(`⭐ 开始切换邮件星标状态: ${emailId}`)
  
  try {
    console.log('📡 调用切换星标API...')
    await toggleStarAPI({ ids: [emailId] })
    
    console.log('🔄 在所有文件夹中查找并更新邮件的星标状态...')
    Object.keys(allEmails).forEach(folderKey => {
      const email = allEmails[folderKey].find(e => e.id === emailId)
      if (email) {
        const oldStatus = email.isStarred
        email.isStarred = !email.isStarred
        
        console.log(`📧 邮件 ${emailId} 在文件夹 ${folderKey} 中，星标状态: ${oldStatus} -> ${email.isStarred}`)
        
        const today = new Date().toISOString().split('T')[0]
        if (email.isStarred) {
          email.starredAt = today
          console.log(`⭐ 设置星标时间: ${today}`)
        } else {
          email.starredAt = undefined
          console.log(`❌ 清除星标时间`)
          
          // 从星标文件夹中移除
          if (folderKey === 'starred') {
            const starredIndex = allEmails.starred.findIndex(e => e.id === emailId)
            if (starredIndex !== -1) {
              console.log(`🗑️ 从星标文件夹移除邮件: ${emailId}`)
              allEmails.starred.splice(starredIndex, 1)
            }
          }
        }
      }
    })
    
    console.log('📥 重新加载星标文件夹...')
    await loadFolderEmails('starred')
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    console.log('✅ 星标切换完成')
    
  } catch (error: any) {
    console.error('❌ 切换星标失败:', error)
    console.error('🔍 星标切换错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
    ElMessage.error('操作失败')
  }
}

// 处理查看邮件详情
async function handleViewEmailDetail(emailId: number) {
  console.log(`📧 开始查看邮件详情，邮件ID: ${emailId}`)
  
  // 检查邮件是否已读，如果未读则标记为已读
  const currentEmail = Object.values(allEmails).flat().find(email => email.id === emailId)
  if (currentEmail && !currentEmail.isRead) {
    console.log('📖 邮件未读，开始标记为已读...')
    try {
      await markAsRead({ ids: [emailId] })
      
      // 更新本地状态
      Object.keys(allEmails).forEach(folderKey => {
        const email = allEmails[folderKey].find(e => e.id === emailId)
        if (email) {
          email.isRead = true
          console.log(`📧 邮件 ${emailId} 在文件夹 ${folderKey} 中标记为已读`)
        }
      })
      
      // 重新加载邮件统计
      await loadMailStats()
      
      console.log('✅ 邮件标记为已读成功')
    } catch (markError: any) {
      console.error('❌ 标记邮件为已读失败:', markError)
      // 即使标记失败，仍然显示邮件详情
    }
  } else {
    console.log('📖 邮件已经是已读状态，无需标记')
  }
}

// 处理获取邮件详情
async function handleGetEmailDetail(emailId: number) {
  console.log(`📧 开始获取邮件详情，邮件ID: ${emailId}`)
  
  try {
    console.log('📡 调用邮件详情API...')
    const emailDetail = await getLetterDetail(emailId)
    console.log('📊 邮件详情API响应:', emailDetail)
    
    // 验证返回的数据结构
    if (!emailDetail) {
      throw new Error('邮件详情数据为空')
    }
    
    // 将详细数据传递给子组件
    if (mainContentRef.value) {
      mainContentRef.value.updateEmailDetail(emailDetail)
    }
    
    console.log('✅ 邮件详情获取成功')
  } catch (error: any) {
    console.error('❌ 获取邮件详情失败:', error)
    console.error('🔍 邮件详情错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
    
    const errorMsg = error?.response?.data?.message || error?.message || '获取邮件详情失败'
    ElMessage.error(`查看邮件详情失败: ${errorMsg}`)
  }
}

// 获取各文件夹邮件数量（从统计数据获取）
function getDraftCount(): number {
  const count = mailStats.value.draftsCount || allEmails.drafts?.length || 0
  console.log(`📝 草稿箱数量: ${count} (统计: ${mailStats.value.draftsCount}, 本地: ${allEmails.drafts?.length})`)
  return count
}

function getDeletedCount(): number {
  const count = mailStats.value.deletedCount || allEmails.deleted?.length || 0
  console.log(`🗑️ 已删除数量: ${count} (统计: ${mailStats.value.deletedCount}, 本地: ${allEmails.deleted?.length})`)
  return count
}

function getStarredCount(): number {
  const count = mailStats.value.starredCount || allEmails.starred?.length || 0
  console.log(`⭐ 星标数量: ${count} (统计: ${mailStats.value.starredCount}, 本地: ${allEmails.starred?.length})`)
  return count
}

function getInboxCount(): number {
  const count = mailStats.value.inboxCount || allEmails.inbox?.length || 0
  console.log(`📥 收件箱数量: ${count} (统计: ${mailStats.value.inboxCount}, 本地: ${allEmails.inbox?.length})`)
  return count
}

function getSentCount(): number {
  const count = mailStats.value.sentCount || allEmails.sent?.length || 0
  console.log(`📤 已发送数量: ${count} (统计: ${mailStats.value.sentCount}, 本地: ${allEmails.sent?.length})`)
  return count
}


// 测试发件箱加载的调试函数
async function testSentMailLoading() {
  console.log('🧪 开始测试发件箱加载...')
  try {
    console.log('📤 直接调用发件箱API...')
    const response = await getSentMails({ pageNo: 1, pageSize: 100 })
    console.log('📊 发件箱API直接响应:', response)
    
    if (response && Array.isArray(response.list)) {
      console.log('✅ 发件箱API调用成功，邮件数量:', response.list.length)
      if (response.list.length > 0) {
        console.log('📧 第一封邮件示例:', response.list[0])
      }
    } else {
      console.log('⚠️ 发件箱API响应格式异常')
    }
  } catch (error: any) {
    console.error('❌ 发件箱API测试失败:', error)
    console.error('🔍 测试错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data
    })
  }
}

// 组件挂载时初始化数据
onMounted(async () => {
  console.log('🚀 邮件组件开始挂载...')
  console.log('📅 当前时间:', new Date().toISOString())
  
  try {
    console.log('📊 第一步: 加载邮件统计信息...')
    await loadMailStats()
    
    console.log('📥 第二步: 加载收件箱邮件...')
    await loadFolderEmails('inbox')
    
    // 测试发件箱加载
    console.log('🧪 第三步: 测试发件箱加载...')
    await testSentMailLoading()
    
    console.log('✅ 邮件组件初始化完成')
  } catch (error: any) {
    console.error('❌ 邮件组件初始化失败:', error)
    console.error('🔍 初始化错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
  }
})


const router = useRouter()
function goCompose() {
  console.log('✍️ 跳转到写信页面...')
  router.push('/mail/write')
}
</script>

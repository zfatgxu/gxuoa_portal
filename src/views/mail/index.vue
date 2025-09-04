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
          <button class="inbox-btn">
            <span class="icon icon--inbox">
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="16" height="10" rx="2" fill="#FFB74D"/>
                <rect x="6" y="4" width="8" height="6" rx="1" fill="#E3F2FD" stroke="#64B5F6" stroke-width="1"/>
                <path d="M6 7l4 2 4-2" fill="none" stroke="#64B5F6" stroke-width="1"/>
              </svg>
            </span>
            <span class="btn-text">收信</span>
          </button>
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
          <div class="folder-item" :class="{active: selectedFolder==='sent'}" @click="selectFolder('sent')">
    <span class="folder-icon">
      <!-- 纸飞机SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">已发送</span><span class="folder-badge">{{ getSentCount() }}</span>
          </div>
          <div class="folder-item" :class="{active: selectedFolder==='drafts'}" @click="selectFolder('drafts')">
    <span class="folder-icon">
      <!-- 文件夹SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
            <span class="folder-name">草稿箱</span><span class="folder-badge">{{ getDraftCount() }}</span>
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
      <!-- 垃圾箱SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><rect x="8" y="10" width="4" height="4" rx="1" stroke="#ff9800" stroke-width="1.2" fill="none"/></svg>
    </span>
            <span class="folder-name">垃圾箱</span><span class="folder-badge">8</span>
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
        :folderName="folderLabels[selectedFolder]" 
        :emails="allEmails[selectedFolder] || []" 
        :isDeletedFolder="selectedFolder==='deleted'"
        @deleteEmails="handleDeleteEmails"
        @toggleStar="handleToggleStar"
        @syncMails="handleSyncMails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainContent from './components/mainContent.vue'
import { ref, reactive, onMounted } from 'vue'
import '@/views/mail/mail.css'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { 
  getInboxMails, 
  getSentMails, 
  getDraftMails, 
  getStarredMails,
  getDeletedMails,
  deleteMails,
  toggleMailStar as toggleStarAPI,
  getMailStats,
  type MailListItemVO,
  type MailStatsVO
} from '@/api/system/mail/letter/index'
import { 
  getSimpleMailAccountList, 
  syncMailAccount,
  type MailAccountVO
} from '@/api/system/mail/account'

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

// 邮件账号相关状态
const mailAccounts = ref<MailAccountVO[]>([])
const selectedAccountId = ref<number>()
const syncStatus = ref<Record<number, { syncing: boolean; lastSync?: Date }>>({})

// 转换后端邮件数据为前端格式
function convertMailToEmail(mail: MailListItemVO): Email {
  const date = mail.receiveTime || mail.sendTime
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  const timeStr = date ? new Date(date).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5)
  
  return {
    id: mail.id!,
    sender: mail.fromMail || '未知发件人',
    subject: mail.subject || '无主题',
    time: timeStr,
    date: dateStr,
    deletedAt: mail.deletedAt ? new Date(mail.deletedAt).toISOString().split('T')[0] : undefined,
    isDraft: mail.isDraft,
    isStarred: mail.isStarred,
    starredAt: mail.starredAt ? new Date(mail.starredAt).toISOString().split('T')[0] : undefined,
    fromMail: mail.fromMail,
    toMail: Array.isArray(mail.toMail) ? mail.toMail.join(', ') : mail.toMail || '',  // 修复类型错误
    content: mail.content,
    isRead: mail.isRead
  }
}

// 加载指定文件夹的邮件
async function loadFolderEmails(folder: string) {
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
        break
      case 'starred':
        response = await getStarredMails({ pageNo: 1, pageSize: 100 })
        break
      case 'deleted':
        response = await getDeletedMails({ pageNo: 1, pageSize: 100 })
        break
      default:
        return
    }
    
    if (response.data && Array.isArray(response.data.list)) {
      allEmails[folder] = response.data.list.map(convertMailToEmail)
    }
  } catch (error: any) {
    console.error(`加载${folder}邮件失败:`, error)
    ElMessage.error(`加载邮件失败: ${error?.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

// 加载邮件统计信息
async function loadMailStats() {
  try {
    const response = await getMailStats()
    if (response) {
      mailStats.value = response
    }
  } catch (error) {
    console.error('加载邮件统计失败:', error)
  }
}

// 加载邮件账号列表
async function loadMailAccounts() {
  try {
    const response = await getSimpleMailAccountList()
    if (response.data) {
      mailAccounts.value = response.data
      if (mailAccounts.value.length > 0 && !selectedAccountId.value) {
        selectedAccountId.value = mailAccounts.value[0].id
      }
    }
  } catch (error) {
    console.error('加载邮件账号失败:', error)
  }
}

// 同步指定账号的邮件
async function handleSyncAccount(accountId?: number) {
  console.log('🔄 开始同步邮件账号:', accountId || selectedAccountId.value)
  
  const targetAccountId = accountId || selectedAccountId.value
  if (!targetAccountId) {
    console.warn('⚠️ 未选择邮件账号')
    ElMessage.warning('请先选择邮件账号')
    return
  }

  try {
    console.log('📡 设置同步状态为进行中...')
    syncStatus.value[targetAccountId] = { syncing: true }
    const loadingInstance = ElLoading.service({ text: '正在同步邮件...' })
    
    console.log('📥 调用同步接口: syncMailAccount')
    await syncMailAccount(targetAccountId)
    
    console.log('🔄 重新加载当前文件夹邮件...')
    await loadFolderEmails(selectedFolder.value)
    
    console.log('📊 重新加载邮件统计...')
    await loadMailStats()
    
    syncStatus.value[targetAccountId] = { 
      syncing: false, 
      lastSync: new Date() 
    }
    
    console.log('✅ 邮件同步完成')
    ElMessage.success('邮件同步成功')
    loadingInstance.close()
  } catch (error: any) {
    console.error('❌ 同步邮件失败:', error)
    console.error('🔍 同步错误详情:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status
    })
    syncStatus.value[targetAccountId] = { syncing: false }
    ElMessage.error('同步邮件失败')
  }
}

// 兼容原有的同步方法
async function handleSyncMails() {
  console.log('🔄 调用兼容同步方法')
  await handleSyncAccount()
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
  await loadFolderEmails(folder)
  
  console.log(`✅ 文件夹切换完成: ${folder}`)
}

// 处理删除邮件
async function handleDeleteEmails(emailIds: number[]) {
  console.log(`🗑️ 开始删除邮件，ID列表:`, emailIds)
  console.log(`📁 当前文件夹: ${selectedFolder.value}`)
  
  try {
    loading.value = true
    console.log('📡 调用删除邮件API...')
    await deleteMails({ ids: emailIds })
    
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

// 处理星标切换
async function handleToggleStar(emailId: number) {
  console.log(`⭐ 开始切换邮件星标状态: ${emailId}`)
  
  try {
    console.log('📡 调用切换星标API...')
    await toggleStarAPI(emailId)
    
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

function getSentCount(): number {
  const count = mailStats.value.sentCount || allEmails.sent?.length || 0
  console.log(`📤 已发送数量: ${count} (统计: ${mailStats.value.sentCount}, 本地: ${allEmails.sent?.length})`)
  return count
}

function getInboxCount(): number {
  const count = mailStats.value.inboxCount || allEmails.inbox?.length || 0
  console.log(`📥 收件箱数量: ${count} (统计: ${mailStats.value.inboxCount}, 本地: ${allEmails.inbox?.length})`)
  return count
}

// 组件挂载时初始化数据
onMounted(async () => {
  console.log('🚀 邮件组件开始挂载...')
  console.log('📅 当前时间:', new Date().toISOString())
  
  try {
    console.log('👤 第一步: 加载邮件账号列表...')
    await loadMailAccounts()
    
    console.log('📊 第二步: 加载邮件统计信息...')
    await loadMailStats()
    
    console.log('📥 第三步: 加载收件箱邮件...')
    await loadFolderEmails('inbox')
    
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

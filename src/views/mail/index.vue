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
        @delete-emails="handleDeleteEmails"
        @toggle-star="handleToggleStar"
        @sync-mails="handleSyncMails"
        @view-email-detail="handleViewEmailDetail"
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
  sendMail,
  saveDraft,
  getLetterDetail,
  type MailListItemVO,
  type MailStatsVO,
  type SendMailReqVO,
  type SaveDraftReqVO
} from '@/api/system/mail/letter/index'

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


// 转换后端邮件数据为前端格式
function convertMailToEmail(mail: MailListItemVO): Email {
  const date = mail.sendTime
  const dateStr = new Date(date).toISOString().split('T')[0]
  const timeStr = new Date(date).toTimeString().slice(0, 5)
  
  return {
    id: mail.id,
    sender: mail.fromUserName,
    subject: mail.subject,
    time: timeStr,
    date: dateStr,
    deletedAt: mail.deletedAt ? new Date(mail.deletedAt).toISOString().split('T')[0] : undefined,
    isDraft: mail.isDraft,
    isStarred: mail.isStarred,
    starredAt: mail.starredAt ? new Date(mail.starredAt).toISOString().split('T')[0] : undefined,
    fromMail: mail.fromUserName,
    toMail: mail.toUserNames,
    content: mail.content,
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
      allEmails[folder] = response.list.map(convertMailToEmail)
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
  
  try {
    console.log('📡 调用邮件详情API...')
    const emailDetail = await getLetterDetail(emailId)
    console.log('📊 邮件详情API响应:', emailDetail)
    
    // 验证返回的数据结构
    if (!emailDetail) {
      throw new Error('邮件详情数据为空')
    }
    
    if (!emailDetail.content) {
      throw new Error('邮件内容数据缺失')
    }
    
    // 这里可以跳转到邮件详情页面或显示弹窗
    // 暂时使用弹窗显示邮件详情
    ElMessageBox.alert(
      `
        <div style="text-align: left;">
          <h3>${emailDetail.content?.subject || '无主题'}</h3>
          <p><strong>发件人:</strong> ${emailDetail.senders?.[0]?.senderIdCard || '未知'}</p>
          <p><strong>收件人:</strong> ${emailDetail.recipients?.map(r => r.recipientIdCard).join(', ') || '无'}</p>
          <p><strong>发送时间:</strong> ${emailDetail.content?.sendTime ? new Date(emailDetail.content.sendTime).toLocaleString() : '未知'}</p>
          <p><strong>优先级:</strong> ${emailDetail.content?.priority === 1 ? '普通' : emailDetail.content?.priority === 2 ? '重要' : emailDetail.content?.priority === 3 ? '紧急' : '未知'}</p>
          <p><strong>已读回执:</strong> ${emailDetail.content?.requestReadReceipt ? '是' : '否'}</p>
          <hr>
          <div style="margin-top: 20px;">
            <strong>邮件内容:</strong>
            <div style="border: 1px solid #ddd; padding: 10px; margin-top: 10px; background: #f9f9f9; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
              ${emailDetail.content?.content || '无内容'}
            </div>
          </div>
          ${emailDetail.attachments && emailDetail.attachments.length > 0 ? `
            <div style="margin-top: 20px;">
              <strong>附件:</strong>
              <ul style="margin-top: 10px;">
                ${emailDetail.attachments.map(att => `<li>${att.fileName} (${(att.fileSize / 1024).toFixed(2)} KB)</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `,
      '邮件详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭',
        customClass: 'email-detail-dialog'
      }
    )
    
    console.log('✅ 邮件详情显示成功')
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

// 发信功能辅助函数
async function handleSendMail(mailData: SendMailReqVO) {
  try {
    // 参数校验
    if (!mailData.subject || mailData.subject.trim() === '') {
      ElMessage.error('邮件主题不能为空')
      return
    }
    
    if (!mailData.content || mailData.content.trim() === '') {
      ElMessage.error('邮件内容不能为空')
      return
    }
    
    if (!mailData.recipientIdCards || mailData.recipientIdCards.length === 0) {
      ElMessage.error('收件人不能为空')
      return
    }
    
    // 过滤掉空的身份证号
    const validRecipients = mailData.recipientIdCards.filter(id => id && id.trim() !== '')
    if (validRecipients.length === 0) {
      ElMessage.error('收件人身份证号不能为空')
      return
    }
    
    // 构建发送数据
    const sendData: SendMailReqVO = {
      subject: mailData.subject.trim(),
      content: mailData.content.trim(),
      recipientIdCards: validRecipients,
      priority: mailData.priority || 1,
      requestReadReceipt: mailData.requestReadReceipt || false,
      isDraft: false
    }
    
    // 如果有抄送人，也进行过滤
    if (mailData.ccIdCards && mailData.ccIdCards.length > 0) {
      const validCcRecipients = mailData.ccIdCards.filter(id => id && id.trim() !== '')
      if (validCcRecipients.length > 0) {
        sendData.ccIdCards = validCcRecipients
      }
    }
    
    console.log('📤 开始发送邮件...', sendData)
    const letterId = await sendMail(sendData)
    console.log('✅ 邮件发送成功，信件ID:', letterId)
    ElMessage.success('邮件发送成功')
    
    // 重新加载已发送文件夹
    await loadFolderEmails('sent')
    // 重新加载邮件统计
    await loadMailStats()
    
    return letterId
  } catch (error: any) {
    console.error('❌ 邮件发送失败:', error)
    ElMessage.error(`邮件发送失败: ${error?.message || '未知错误'}`)
    throw error
  }
}

async function handleSaveDraft(draftData: SaveDraftReqVO) {
  try {
    // 草稿的参数校验相对宽松，但基本字段还是需要检查
    if (!draftData.subject || draftData.subject.trim() === '') {
      ElMessage.error('邮件主题不能为空')
      return
    }
    
    if (!draftData.content || draftData.content.trim() === '') {
      ElMessage.error('邮件内容不能为空')
      return
    }
    
    // 构建草稿数据
    const saveData: SaveDraftReqVO = {
      subject: draftData.subject.trim(),
      content: draftData.content.trim(),
      priority: draftData.priority || 1,
      requestReadReceipt: draftData.requestReadReceipt || false,
      isDraft: true
    }
    
    // 如果有收件人，进行过滤
    if (draftData.recipientIdCards && draftData.recipientIdCards.length > 0) {
      const validRecipients = draftData.recipientIdCards.filter(id => id && id.trim() !== '')
      if (validRecipients.length > 0) {
        saveData.recipientIdCards = validRecipients
      }
    }
    
    // 如果有抄送人，也进行过滤
    if (draftData.ccIdCards && draftData.ccIdCards.length > 0) {
      const validCcRecipients = draftData.ccIdCards.filter(id => id && id.trim() !== '')
      if (validCcRecipients.length > 0) {
        saveData.ccIdCards = validCcRecipients
      }
    }
    
    console.log('💾 开始保存草稿...', saveData)
    const letterId = await saveDraft(saveData)
    console.log('✅ 草稿保存成功，信件ID:', letterId)
    ElMessage.success('草稿保存成功')
    
    // 重新加载草稿文件夹
    await loadFolderEmails('drafts')
    // 重新加载邮件统计
    await loadMailStats()
    
    return letterId
  } catch (error: any) {
    console.error('❌ 草稿保存失败:', error)
    ElMessage.error(`草稿保存失败: ${error?.message || '未知错误'}`)
    throw error
  }
}

const router = useRouter()
function goCompose() {
  console.log('✍️ 跳转到写信页面...')
  router.push('/mail/write')
}
</script>

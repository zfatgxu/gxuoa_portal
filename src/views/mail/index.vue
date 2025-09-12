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
          <!-- 垃圾箱 -->
          <div class="folder-item" :class="{active: selectedFolder==='trash'}" @click="selectFolder('trash')">
    <span class="folder-icon">
      <!-- 垃圾箱SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><rect x="8" y="10" width="4" height="4" rx="1" stroke="#ff9800" stroke-width="1.2" fill="none"/></svg>
    </span>
            <span class="folder-name">垃圾箱</span><span class="folder-badge">{{ getTrashCount() }}</span>
          </div>
          <!-- 我的文件夹标题 -->
          <div class="folder-item folder-title" @click="toggleMyFolders" @contextmenu.prevent="showFolderContextMenu($event)">
            <span class="expand-icon" :class="{ expanded: isMyFoldersExpanded }" style="margin-right: 8px;">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :style="{ transform: isMyFoldersExpanded ? 'rotate(180deg)' : 'rotate(270deg)', transition: 'transform 0.15s ease' }">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="folder-icon">
              <!-- 文件夹SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">我的文件夹</span>
            <span style="flex: 1 1 auto;"></span>
            <button class="add-folder-btn" @click.stop="createNewFolder" title="新建文件夹" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;background:transparent;cursor:pointer;padding:0;">
              <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1v12M1 7h12" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <!-- 自定义文件夹列表 -->
          <transition name="folder-expand" appear>
            <div v-if="isMyFoldersExpanded" class="folder-list-container">
              <div v-for="rootFolder in rootFolders" :key="rootFolder.id">
                <FolderTreeItem 
                  :folder="rootFolder" 
                  :selected-folder-id="selectedFolderId || undefined"
                  :level="0"
                  @select-folder="selectFolder"
                  @context-menu="onFolderContextMenu"
                />
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 主内容区域 -->
      <MainContent 
        ref="mainContentRef"
        :folderName="getCurrentFolderName()" 
        :emails="getCurrentEmails()" 
        :isDeletedFolder="selectedFolder==='deleted'"
        :isTrashFolder="selectedFolder==='trash'"
        :isCustomFolder="selectedFolder==='custom'"
        :currentCustomFolderId="selectedFolderId || undefined"
        :mailStats="mailStats"
        :customFolders="customFolders"
        @delete-emails="handleDeleteEmails"
        @permanent-delete-emails="handlePermanentDeleteEmails"
        @restore-emails="handleRestoreEmails"
        @mark-emails="handleMarkEmails"
        @move-emails="handleMoveEmails"
        @remove-from-folder="handleRemoveFromFolder"
        @show-message="handleShowMessage"
        @toggle-star="handleToggleStar"
        @sync-mails="handleSyncMails"
        @view-email-detail="handleViewEmailDetail"
        @get-email-detail="handleGetEmailDetail"
        @delete-folder="handleDeleteFolder"
      />
    </div>

    <!-- 文件夹右键上下文菜单（全局唯一） -->
    <div v-if="folderContextMenu.visible" class="context-menu" :style="{ left: folderContextMenu.x + 'px', top: folderContextMenu.y + 'px' }" @click.stop>
      <div v-if="!folderContextMenu.folderId" class="context-menu-item" @click="createNewFolder">新建文件夹</div>
      <div v-if="folderContextMenu.folderId" class="context-menu-item" @click="renameFolder">重命名</div>
      <div v-if="folderContextMenu.folderId" class="context-menu-item" @click="confirmDeleteContextFolder">删除文件夹</div>
    </div>

  </div>
</template>

<script setup lang="ts">
import MainContent from './components/mainContent.vue'
import FolderTreeItem from './components/FolderTreeItem.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import '@/views/mail/mail.css'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { 
  getInboxMails, 
  getSentMails, 
  getDraftMails, 
  getStarredMails,
  getDeletedMails,
  getTrashMails,
  moveToTrash,
  permanentDelete,
  getMailStats,
  getLetterDetail,
  markAsTrash,
  restoreFromTrash,
  restoreFromTrashFlag,
  getLetterAttachments,
  type MailListItemVO,
  type MailStatsVO
} from '@/api/system/mail/letter'
import { 
  getFolderTree,
  getFolderMails, 
  createFolder,
  updateFolder,
  moveMailToFolder,
  removeMailFromFolder,
  deleteFolder,
  setFolderMailsReadState,
  toggleFolderMailsStar,
  type FolderRespVO,
  type FolderCreateReqVO,
  type FolderUpdateReqVO
} from '@/api/system/mail/folder'
import { getUserByIdCard } from '@/api/system/user'
import { useUserStoreWithOut } from '@/store/modules/user'

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
  isTrash?: boolean
  trashTime?: string
  isSelfSent?: boolean
}

// 邮件数据状态管理
const allEmails = reactive<Record<string, Email[]>>({
  inbox: [],
  starred: [],
  sent: [],
  drafts: [],
  deleted: [],
  trash: []
})

// 文件夹数据状态管理
const customFolders = ref<FolderRespVO[]>([])
const folderEmails = reactive<Record<number, Email[]>>({})


// 计算根文件夹（parentId为0的文件夹）
const rootFolders = computed(() => {
  return customFolders.value.filter(folder => folder.parentId === 0)
})

// 文件夹右键上下文菜单状态
const folderContextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  folderId: null as number | null
})

const loading = ref(false)
const mainContentRef = ref<InstanceType<typeof MainContent> | null>(null)
const userDetailsCache = ref<Record<string, any>>({}) // 用户详情缓存
const emailDetailsCache = ref<Record<number, any>>({}) // 邮件详情缓存
const mailStats = ref<MailStatsVO>({
  inboxCount: 0,
  sentCount: 0,
  draftsCount: 0,  // 修正为 draftsCount
  starredCount: 0,
  deletedCount: 0,
  trashCount: 0,
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
    const userDetail = await getUserByIdCard(idCard)
    // 缓存用户详情
    userDetailsCache.value[idCard] = userDetail
    return userDetail
  } catch (error: any) {
    console.error('获取用户详情失败:', error)
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
  
  // 解析neng 信息
  const parsedToMail = await parseRecipients(mail.toUserNames || '')
  
  // 解析邮件内容
  const formattedContent = formatEmailContent(mail.content || '')
  
  // 识别是否自己发送：使用身份证号判断
  const userStore = useUserStoreWithOut()
  const currentUser = userStore.getUser
  const currentIdCard = (currentUser as any)?.idCard || ''
  const fromUserIdCard = (mail as any).fromUserIdCard || (mail as any).fromIdCard || ''
  const isSelfSent = fromUserIdCard && currentIdCard && fromUserIdCard === currentIdCard

  return {
    id: mail.id,
    sender: mail.fromUserName,
    subject: mail.subject,
    time: displayTime,
    date: dateStr,
    deletedAt: mail.deletedAt ? new Date(mail.deletedAt).toISOString().split('T')[0] : undefined,
    isDraft: (mail as any).isDraft || false,
    isStarred: mail.isStarred,
    starredAt: mail.starredAt ? new Date(mail.starredAt).toISOString().split('T')[0] : undefined,
    fromMail: mail.fromUserName,
    toMail: parsedToMail,
    content: formattedContent,
    isRead: mail.isRead,
    isTrash: mail.isTrash || false,
    trashTime: mail.trashTime ? new Date(mail.trashTime).toISOString().split('T')[0] : undefined,
    isSelfSent
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
      case 'trash':
        response = await getTrashMails({ pageNo: 1, pageSize: 100 })
        break
      default:
        return
    }
    
    if (response && Array.isArray(response.list)) {
      const convertedEmails = await Promise.all(response.list.map(convertMailToEmail))
      allEmails[folder] = convertedEmails
    } else {
      allEmails[folder] = []
    }
  } catch (error: any) {
    console.error(`加载${folder}邮件失败:`, error)
    
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

// 加载邮件统计信息
async function loadMailStats() {
  try {
    const response = await getMailStats()
    if (response) {
      mailStats.value = response
    }
  } catch (error: any) {
    console.error('加载邮件统计失败:', error)
  }
}

// 加载自定义文件夹列表
async function loadCustomFolders() {
  try {
    const response = await getFolderTree()
    
    if (response && Array.isArray(response)) {
      // 将树形结构扁平化为数组，便于后续处理
      const flattenFolders = (folders: FolderRespVO[]): FolderRespVO[] => {
        const result: FolderRespVO[] = []
        folders.forEach(folder => {
          result.push(folder)
          if (folder.children && folder.children.length > 0) {
            result.push(...flattenFolders(folder.children))
          }
        })
        return result
      }
      
      customFolders.value = flattenFolders(response)
    } else {
      customFolders.value = []
    }
  } catch (error: any) {
    console.error('加载自定义文件夹失败:', error)
    customFolders.value = []
  }
}

// 加载指定文件夹的邮件
async function loadFolderEmailsById(folderId: number) {
  try {
    const response = await getFolderMails(folderId, 1, 100)
    
    if (response && Array.isArray(response.list)) {
      const convertedEmails = await Promise.all(response.list.map(convertMailToEmail))
      folderEmails[folderId] = convertedEmails
    } else {
      folderEmails[folderId] = []
    }
  } catch (error: any) {
    console.error(`加载文件夹 ${folderId} 邮件失败:`, error)
    ElMessage.error(`加载文件夹邮件失败: ${error?.response?.data?.msg || error?.message || '未知错误'}`)
    folderEmails[folderId] = []
  }
}



// 同步邮件方法
async function handleSyncMails() {
  try {
    const loadingInstance = ElLoading.service({ text: '正在同步邮件...' })
    
    // 根据当前选中的文件夹类型选择正确的加载方法
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      await loadFolderEmailsById(selectedFolderId.value)
    } else {
      await loadFolderEmails(selectedFolder.value)
    }
    
    await loadMailStats()
    ElMessage.success('邮件同步成功')
    loadingInstance.close()
  } catch (error: any) {
    console.error('同步邮件失败:', error)
    ElMessage.error('同步邮件失败')
  }
}

const folderLabels: Record<string, string> = {
  inbox: '收件箱',
  starred: '星标邮件',
  sent: '已发送',
  drafts: '草稿箱',
  deleted: '已删除',
  trash: '垃圾箱',
  custom: '自定义文件夹'
}

// 获取当前文件夹名称
function getCurrentFolderName(): string {
  if (selectedFolder.value === 'custom' && selectedFolderId.value) {
    const folder = customFolders.value.find(f => f.id === selectedFolderId.value)
    return folder ? folder.folderName : '未知文件夹'
  }
  return folderLabels[selectedFolder.value] || '未知文件夹'
}

// 获取当前文件夹的邮件
function getCurrentEmails(): Email[] {
  if (selectedFolder.value === 'custom' && selectedFolderId.value) {
    return folderEmails[selectedFolderId.value] || []
  }
  return allEmails[selectedFolder.value] || []
}

// 显示文件夹右键上下文菜单
function showFolderContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  
  // 打开顶层菜单（不绑定具体文件夹）
  folderContextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    folderId: null
  }
  
  // 点击其他地方隐藏菜单
  setTimeout(() => {
    document.addEventListener('click', hideFolderContextMenu, { once: true })
  }, 0)
}

// 来自子项的右键事件：全局唯一——先关闭再打开
function onFolderContextMenu(payload: { x: number, y: number, folderId: number }) {
  hideFolderContextMenu()
  folderContextMenu.value = {
    visible: true,
    x: payload.x,
    y: payload.y,
    folderId: payload.folderId
  }
  setTimeout(() => {
    document.addEventListener('click', hideFolderContextMenu, { once: true })
    // 滚轮滚动时隐藏文件夹右键菜单（一次性）
    document.addEventListener('wheel', hideFolderContextMenu, { once: true })
  }, 0)
}

// 隐藏文件夹右键上下文菜单
function hideFolderContextMenu() {
  folderContextMenu.value.visible = false
  folderContextMenu.value.folderId = null
}

// 新建文件夹
async function createNewFolder() {
  hideFolderContextMenu()
  
  try {
    const { value: folderName } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间'
    })
    
    if (folderName && folderName.trim()) {
      // 显示加载状态
      const loadingInstance = ElLoading.service({ text: '正在创建文件夹...' })
      
      try {
        // 调用创建文件夹API，默认创建在根目录
        const createData: FolderCreateReqVO = {
          folderName: folderName.trim(),
          parentId: 0, // 根目录
          description: '' // 暂时不设置描述
        }
        
        await createFolder(createData)
        
        // 重新加载文件夹列表
        await loadCustomFolders()
        
        ElMessage.success(`文件夹"${folderName.trim()}"创建成功`)
        
      } catch (error: any) {
        console.error('❌ 创建文件夹失败:', error)
        
        // 根据错误类型显示不同的错误信息
        let errorMsg = '创建文件夹失败'
        if (error?.response?.data?.msg) {
          errorMsg = error.response.data.msg
        } else if (error?.message) {
          errorMsg = error.message
        }
        
        ElMessage.error(errorMsg)
      } finally {
        loadingInstance.close()
      }
    }
  } catch (error: any) {
    // 用户取消输入
    if (error !== 'cancel') {
      console.error('❌ 新建文件夹操作失败:', error)
    }
  }
}

// 删除文件夹
async function handleDeleteFolder(folderId: number) {
  try {
    // 获取文件夹信息
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      throw new Error('文件夹不存在')
    }

    // 如果文件夹内仍有邮件，禁止删除并提示
    if ((folder.mailCount || 0) > 0) {
      ElMessage.warning('该文件夹内仍有邮件，无法删除')
      return
    }
    
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除文件夹"${folder.folderName}"吗？`,
      '删除文件夹',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // 显示加载状态
    const loadingInstance = ElLoading.service({ text: '正在删除文件夹...' })
    
    try {
      await deleteFolder(folderId)
      
      // 如果当前正在查看被删除的文件夹，切换到收件箱
      if (selectedFolder.value === 'custom' && selectedFolderId.value === folderId) {
        await selectFolder('inbox')
      }
      
      // 重新加载文件夹列表
      await loadCustomFolders()
      
      // 重新加载邮件统计
      await loadMailStats()
      
      ElMessage.success(`文件夹"${folder.folderName}"删除成功`)
      
    } catch (error: any) {
      console.error('删除文件夹失败:', error)
      
      const errorMsg = error?.response?.data?.msg || error?.message || '删除文件夹失败'
      ElMessage.error(`删除文件夹失败: ${errorMsg}`)
    } finally {
      loadingInstance.close()
    }
    
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    
    console.error('删除文件夹操作失败:', error)
    ElMessage.error('删除文件夹失败')
  }
}

// 顶层菜单中的"删除文件夹"动作
async function confirmDeleteContextFolder() {
  if (folderContextMenu.value.folderId) {
    const id = folderContextMenu.value.folderId
    hideFolderContextMenu()
    await handleDeleteFolder(id)
  }
}

// 重命名文件夹
async function renameFolder() {
  if (!folderContextMenu.value.folderId) {
    return
  }
  
  const folderId = folderContextMenu.value.folderId
  hideFolderContextMenu()
  
  try {
    // 获取当前文件夹信息
    const folder = customFolders.value.find(f => f.id === folderId)
    if (!folder) {
      ElMessage.error('文件夹不存在')
      return
    }
    
    const { value: newFolderName } = await ElMessageBox.prompt('请输入新的文件夹名称', '重命名文件夹', {
      confirmButtonText: '重命名',
      cancelButtonText: '取消',
      inputValue: folder.folderName,
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间'
    })
    
    if (newFolderName && newFolderName.trim() && newFolderName.trim() !== folder.folderName) {
      // 显示加载状态
      const loadingInstance = ElLoading.service({ text: '正在重命名文件夹...' })
      
      try {
        // 调用更新文件夹API
        const updateData: FolderUpdateReqVO = {
          id: folderId,
          folderName: newFolderName.trim(),
          parentId: folder.parentId,
          sortOrder: folder.sortOrder,
          description: folder.description
        }
        
        await updateFolder(updateData)
        
        // 重新加载文件夹列表
        await loadCustomFolders()
        
        ElMessage.success(`文件夹重命名为"${newFolderName.trim()}"成功`)
        
      } catch (error: any) {
        console.error('❌ 重命名文件夹失败:', error)
        
        // 根据错误类型显示不同的错误信息
        let errorMsg = '重命名文件夹失败'
        if (error?.response?.data?.msg) {
          errorMsg = error.response.data.msg
        } else if (error?.message) {
          errorMsg = error.message
        }
        
        ElMessage.error(errorMsg)
      } finally {
        loadingInstance.close()
      }
    } else if (newFolderName && newFolderName.trim() === folder.folderName) {
      ElMessage.info('文件夹名称未发生变化')
    }
  } catch (error: any) {
    // 用户取消输入
    if (error !== 'cancel') {
      console.error('❌ 重命名文件夹操作失败:', error)
    }
  }
}

const selectedFolder = ref('inbox')
const selectedFolderId = ref<number | null>(null)
const isMyFoldersExpanded = ref(false) // 我的文件夹展开状态，默认收起

// 切换我的文件夹展开/收起状态
function toggleMyFolders() {
  isMyFoldersExpanded.value = !isMyFoldersExpanded.value
}

async function selectFolder(folder: string | number) {
  // 重置文件夹ID
  selectedFolderId.value = null

  // 若当前在邮件详情界面，切换邮箱时直接退出详情视图
  if (mainContentRef.value && typeof (mainContentRef.value as any).closeEmailDetail === 'function') {
    ;(mainContentRef.value as any).closeEmailDetail()
  }
  
  if (typeof folder === 'string') {
    // 系统文件夹
    selectedFolder.value = folder
    await loadFolderEmails(folder)
  } else {
    // 自定义文件夹
    selectedFolder.value = 'custom'
    selectedFolderId.value = folder
    await loadFolderEmailsById(folder)
  }
  
  // 预加载当前分页的邮件详情
  preloadCurrentPageEmailDetails()
}

// 处理删除邮件
async function handleDeleteEmails(emailIds: number[]) {
  try {
    loading.value = true
    await moveToTrash({ ids: emailIds })
    
    // 根据当前文件夹类型选择正确的邮件列表
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      // 自定义文件夹
      const currentEmails = folderEmails[selectedFolderId.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    } else {
      // 系统文件夹
      const currentEmails = allEmails[selectedFolder.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder.value !== 'deleted') {
      await loadFolderEmails('deleted')
    }
    
    await loadCustomFolders()
    await loadMailStats()
    
    ElMessage.success(`成功删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    console.error('删除邮件失败:', error)
    ElMessage.error('删除邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理恢复邮件
async function handleRestoreEmails(emailIds: number[]) {
  try {
    loading.value = true
    await restoreFromTrash({ ids: emailIds })
    
    // 从已删除文件夹中移除邮件
    const currentEmails = allEmails.deleted
    if (currentEmails) {
      emailIds.forEach(emailId => {
        const emailIndex = currentEmails.findIndex(email => email.id === emailId)
        if (emailIndex !== -1) {
          currentEmails.splice(emailIndex, 1)
        }
      })
    }
    
    // 重新加载收件箱（恢复的邮件会回到收件箱）
    await loadFolderEmails('inbox')
    await loadMailStats()
    
    ElMessage.success(`成功恢复 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    console.error('恢复邮件失败:', error)
    ElMessage.error('恢复邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理彻底删除邮件
async function handlePermanentDeleteEmails(emailIds: number[]) {
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
    await permanentDelete({ ids: emailIds })
    
    // 根据当前文件夹类型选择正确的邮件列表
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      // 自定义文件夹
      const currentEmails = folderEmails[selectedFolderId.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    } else {
      // 系统文件夹
      const currentEmails = allEmails[selectedFolder.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载已删除文件夹（如果需要）
    if (selectedFolder.value !== 'deleted') {
      await loadFolderEmails('deleted')
    }
    
    await loadCustomFolders()
    await loadMailStats()
    
    ElMessage.success(`成功彻底删除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    
    console.error('彻底删除邮件失败:', error)
    ElMessage.error('彻底删除邮件失败')
  } finally {
    loading.value = false
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


// 处理移动邮件操作
async function handleMoveEmails(data: { folderId: number, emailIds: number[] }) {
  const { folderId, emailIds } = data
  
  try {
    loading.value = true
    
    // 获取目标文件夹信息（现在只支持自定义文件夹）
    const targetFolder = customFolders.value.find(f => f.id === folderId)
    if (!targetFolder) {
      throw new Error('目标文件夹不存在')
    }
    const targetFolderName = targetFolder.folderName
    
    // 调用移动邮件API
    await moveMailToFolder({
      letterIds: emailIds,
      folderId: folderId,
      mailType: 1 // 1-收件，2-发件，这里默认为收件
    })
    
    // 移动成功后刷新自定义文件夹树状态（名称、数量等）
    await loadCustomFolders()
    
    // 根据源文件夹类型处理本地状态
    if (selectedFolder.value === 'custom' && selectedFolderId.value) {
      // 自定义文件夹 → 自定义文件夹：真正移动（移除）
      const currentEmails = folderEmails[selectedFolderId.value]
      if (currentEmails) {
        emailIds.forEach(emailId => {
          const emailIndex = currentEmails.findIndex(email => email.id === emailId)
          if (emailIndex !== -1) {
            currentEmails.splice(emailIndex, 1)
          }
        })
      }
    }
    
    // 重新加载目标文件夹的邮件（如果当前正在查看该文件夹）
    if (selectedFolder.value === 'custom' && selectedFolderId.value === folderId) {
      await loadFolderEmailsById(folderId)
    }
    
    await loadMailStats()
    
    ElMessage.success(`成功移动 ${emailIds.length} 封邮件到文件夹"${targetFolderName}"`)
    
  } catch (error: any) {
    console.error('移动邮件失败:', error)
    
    const errorMsg = error?.response?.data?.msg || error?.message || '移动邮件失败'
    ElMessage.error(`移动邮件失败: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

// 处理从当前自定义文件夹移除邮件
async function handleRemoveFromFolder(data: { folderId: number, emailIds: number[] }) {
  const { folderId, emailIds } = data
  
  try {
    loading.value = true
    await removeMailFromFolder(folderId, emailIds)

    // 本地移除
    const currentEmails = folderEmails[folderId]
    if (currentEmails) {
      emailIds.forEach(emailId => {
        const emailIndex = currentEmails.findIndex(email => email.id === emailId)
        if (emailIndex !== -1) {
          currentEmails.splice(emailIndex, 1)
        }
      })
    }

    // 刷新该自定义文件夹与统计、文件夹树
    await loadFolderEmailsById(folderId)
    await loadMailStats()
    await loadCustomFolders()

    ElMessage.success(`已从当前文件夹移除 ${emailIds.length} 封邮件`)
  } catch (error: any) {
    console.error('从文件夹移除失败:', error)
    ElMessage.error('从文件夹移除失败')
  } finally {
    loading.value = false
  }
}

// 辅助函数：更新所有文件夹中的邮件状态
function updateEmailStatusInAllFolders(emailIds: number[], updateFn: (email: Email) => void) {
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

// 处理标记邮件操作
async function handleMarkEmails(data: { action: string, emailIds: number[] }) {
  const { action, emailIds } = data
  
  try {
    loading.value = true
    let successMessage = ''
    
    switch (action) {
      case 'read':
        await setFolderMailsReadState(emailIds, true)
        successMessage = `成功标记 ${emailIds.length} 封邮件为已读`
        
        // 更新本地状态
        updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isRead = true
        })
        break
        
      case 'unread':
        await setFolderMailsReadState(emailIds, false)
        successMessage = `成功标记 ${emailIds.length} 封邮件为未读`
        
        // 更新本地状态
        updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isRead = false
        })
        break
        
      case 'star':
        await toggleFolderMailsStar(emailIds)
        successMessage = `成功为 ${emailIds.length} 封邮件添加星标`
        
        // 更新本地状态
        const today = new Date().toISOString().split('T')[0]
        updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isStarred = true
          email.starredAt = today
        })
        
        // 重新加载星标文件夹
        await loadFolderEmails('starred')
        break
        
      case 'unstar':
        await toggleFolderMailsStar(emailIds)
        successMessage = `成功取消 ${emailIds.length} 封邮件的星标`
        
        // 更新本地状态
        updateEmailStatusInAllFolders(emailIds, (email) => {
          email.isStarred = false
          email.starredAt = undefined
        })
        
        // 从星标文件夹中移除邮件
        emailIds.forEach(emailId => {
          const starredIndex = allEmails.starred.findIndex(e => e.id === emailId)
          if (starredIndex !== -1) {
            allEmails.starred.splice(starredIndex, 1)
          }
        })
        
        // 重新加载星标文件夹
        await loadFolderEmails('starred')
        break
        
      case 'spam':
        await markAsTrash({ ids: emailIds })
        successMessage = `成功将 ${emailIds.length} 封邮件标记为垃圾邮件`
        
        // 从当前文件夹移除邮件
        if (selectedFolder.value === 'custom' && selectedFolderId.value) {
          // 自定义文件夹
          const currentEmails = folderEmails[selectedFolderId.value]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        } else {
          // 系统文件夹
          const currentEmails = allEmails[selectedFolder.value]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        }
        
        // 重新加载相关文件夹和统计信息
        await loadFolderEmails('trash')
        
        // 如果当前不在垃圾箱，重新加载当前文件夹
        if (selectedFolder.value !== 'trash') {
          if (selectedFolder.value === 'custom' && selectedFolderId.value) {
            await loadFolderEmailsById(selectedFolderId.value)
          } else {
            await loadFolderEmails(selectedFolder.value)
          }
        }
        
        // 重新加载自定义文件夹树（更新邮件数量）
        await loadCustomFolders()
        break
        
      case 'unspam':
        await restoreFromTrashFlag({ ids: emailIds })
        successMessage = `成功取消 ${emailIds.length} 封邮件的垃圾邮件标记`
        
        // 从当前文件夹移除邮件
        if (selectedFolder.value === 'custom' && selectedFolderId.value) {
          // 自定义文件夹
          const currentEmails = folderEmails[selectedFolderId.value]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        } else {
          // 系统文件夹
          const currentEmails = allEmails[selectedFolder.value]
          if (currentEmails) {
            emailIds.forEach(emailId => {
              const emailIndex = currentEmails.findIndex(email => email.id === emailId)
              if (emailIndex !== -1) {
                currentEmails.splice(emailIndex, 1)
              }
            })
          }
        }
        
        // 重新加载相关文件夹和统计信息
        await loadFolderEmails('inbox')
        
        // 如果当前不在收件箱，重新加载当前文件夹
        if (selectedFolder.value !== 'inbox') {
          if (selectedFolder.value === 'custom' && selectedFolderId.value) {
            await loadFolderEmailsById(selectedFolderId.value)
          } else {
            await loadFolderEmails(selectedFolder.value)
          }
        }
        
        // 重新加载自定义文件夹树（更新邮件数量）
        await loadCustomFolders()
        break
        
      default:
        ElMessage.error('未知的标记操作')
        return
    }
    
    await loadMailStats()
    ElMessage.success(successMessage)
    
  } catch (error: any) {
    console.error('标记邮件失败:', error)
    ElMessage.error('标记邮件失败')
  } finally {
    loading.value = false
  }
}

// 处理星标切换
async function handleToggleStar(emailId: number) {
  try {
    await toggleFolderMailsStar([emailId])
    
    // 更新系统文件夹中的邮件状态
    Object.keys(allEmails).forEach(folderKey => {
      const email = allEmails[folderKey].find(e => e.id === emailId)
      if (email) {
        email.isStarred = !email.isStarred
        
        const today = new Date().toISOString().split('T')[0]
        if (email.isStarred) {
          email.starredAt = today
        } else {
          email.starredAt = undefined
          
          // 从星标文件夹中移除
          if (folderKey === 'starred') {
            const starredIndex = allEmails.starred.findIndex(e => e.id === emailId)
            if (starredIndex !== -1) {
              allEmails.starred.splice(starredIndex, 1)
            }
          }
        }
      }
    })
    
    // 更新自定义文件夹中的邮件状态
    Object.keys(folderEmails).forEach(folderId => {
      const email = folderEmails[folderId].find(e => e.id === emailId)
      if (email) {
        email.isStarred = !email.isStarred
        
        const today = new Date().toISOString().split('T')[0]
        if (email.isStarred) {
          email.starredAt = today
        } else {
          email.starredAt = undefined
        }
      }
    })
    
    await loadFolderEmails('starred')
    await loadMailStats()
    
  } catch (error: any) {
    console.error('切换星标失败:', error)
    ElMessage.error('操作失败')
  }
}

// 处理查看邮件详情
async function handleViewEmailDetail(emailId: number) {
  // 草稿箱点击直接跳转到写信界面，而不是查看详情
  if (selectedFolder.value === 'drafts') {
    await router.push({ path: '/mail/write', query: { draftId: String(emailId) } })
    return
  }
  
  // 检查邮件是否已读，如果未读则标记为已读
  // 首先在系统文件夹中查找
  let currentEmail = Object.values(allEmails).flat().find(email => email.id === emailId)
  
  // 如果在系统文件夹中没找到，在自定义文件夹中查找
  if (!currentEmail) {
    currentEmail = Object.values(folderEmails).flat().find(email => email.id === emailId)
  }
  
  if (currentEmail && !currentEmail.isRead) {
    try {
      await setFolderMailsReadState([emailId], true)
      
      // 更新本地状态 - 使用辅助函数更新所有文件夹中的邮件状态
      updateEmailStatusInAllFolders([emailId], (email) => {
        email.isRead = true
      })
      
      // 重新加载邮件统计
      await loadMailStats()
      
    } catch (markError: any) {
      console.error('标记邮件为已读失败:', markError)
      // 即使标记失败，仍然显示邮件详情
    }
  }
}

// 预加载当前分页的邮件详情
async function preloadCurrentPageEmailDetails() {
  try {
    // 获取当前显示的邮件列表
    const currentEmails = getCurrentEmails()
    if (!currentEmails || currentEmails.length === 0) {
      return
    }
    
    // 获取当前分页的邮件（假设每页15封邮件）
    const pageSize = 15
    const currentPage = 1 // 这里可以根据实际分页逻辑调整
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageEmails = currentEmails.slice(startIndex, endIndex)
    
    // 并发预加载邮件详情
    const preloadPromises = pageEmails.map(async (email) => {
      // 检查缓存中是否已有详情
      if (emailDetailsCache.value[email.id]) {
        return
      }
      
      try {
        const emailDetail = await getLetterDetail(email.id)
        
        if (emailDetail) {
          // 缓存邮件详情
          emailDetailsCache.value[email.id] = emailDetail
        }
      } catch (error: any) {
        // 预加载失败不影响用户体验，继续处理其他邮件
      }
    })
    
    // 等待所有预加载完成
    await Promise.allSettled(preloadPromises)
    
  } catch (error: any) {
    // 预加载失败不影响主要功能
  }
}

// 处理获取邮件详情
async function handleGetEmailDetail(emailId: number) {
  try {
    let emailDetail: any = null
    
    // 优先从缓存中获取
    if (emailDetailsCache.value[emailId]) {
      emailDetail = emailDetailsCache.value[emailId]
    } else {
      emailDetail = await getLetterDetail(emailId)
      
      // 缓存邮件详情
      if (emailDetail) {
        emailDetailsCache.value[emailId] = emailDetail
      }
    }
    
    // 验证返回的数据结构
    if (!emailDetail) {
      throw new Error('邮件详情数据为空')
    }
    
    // 获取邮件附件列表
    try {
      const attachments = await getLetterAttachments(emailId)
      
      // 将附件信息添加到邮件详情中
      emailDetail.attachments = attachments || []
    } catch (attachmentError: any) {
      console.error('获取邮件附件失败:', attachmentError)
      // 附件获取失败不影响邮件详情显示，设置为空数组
      emailDetail.attachments = []
    }
    
    // 将详细数据传递给子组件
    if (mainContentRef.value) {
      mainContentRef.value.updateEmailDetail(emailDetail)
    }
    
  } catch (error: any) {
    console.error('获取邮件详情失败:', error)
    
    const errorMsg = error?.response?.data?.message || error?.message || '获取邮件详情失败'
    ElMessage.error(`查看邮件详情失败: ${errorMsg}`)
  }
}

// 获取各文件夹邮件数量（从统计数据获取）
function getDraftCount(): number {
  return (mailStats.value.draftsCount ?? allEmails.drafts?.length ?? 0)
}

function getDeletedCount(): number {
  return (mailStats.value.deletedCount ?? allEmails.deleted?.length ?? 0)
}

function getStarredCount(): number {
  return (mailStats.value.starredCount ?? allEmails.starred?.length ?? 0)
}

function getInboxCount(): number {
  return (mailStats.value.inboxCount ?? allEmails.inbox?.length ?? 0)
}

function getSentCount(): number {
  return (mailStats.value.sentCount ?? allEmails.sent?.length ?? 0)
}

function getTrashCount(): number {
  return (mailStats.value.trashCount ?? 0)
}

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    await loadMailStats()
    await loadCustomFolders()
    await loadFolderEmails('inbox')
  } catch (error: any) {
    console.error('邮件组件初始化失败:', error)
  }
})


const router = useRouter()
function goCompose() {
  router.push('/mail/write')
}

</script>

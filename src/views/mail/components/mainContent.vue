<template>
  <div class="main-content">
    <div class="header" v-show="!selectedEmailDetail">
      <div class="header-left">
        <img class="header-image" :src="topImage" alt="header" />
      </div>
      <div class="header-right">
        <div class="header-search">
    <span class="search-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
        <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </span>
          <input class="search-input" type="text" placeholder="搜索" />
        </div>
      </div>
    </div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" v-if="selectedEmailDetail" @click="closeEmailDetail">← 返回</button>
        <input type="checkbox" v-model="allSelected" class="select-all-checkbox" title="全选/取消全选" v-show="!selectedEmailDetail" />
        <span class="toolbar-inbox-label" v-show="!selectedEmailDetail">
          {{ folderName }}
        </span>
        <button class="tool-btn" @click="deleteSelectedEmails" :disabled="!hasOperationTarget">
          {{ (isDeletedFolder || isTrashFolder) ? '彻底删除' : '删除' }}
        </button>
        <button class="tool-btn">
          转发
        </button>
        <button v-if="folderName === '收件箱'" class="tool-btn" @click="markAsSpam">
          这是垃圾邮件
        </button>
        <button v-if="isTrashFolder" class="tool-btn" @click="markAsSpam">
          这不是垃圾邮件
        </button>
        <button v-if="isDeletedFolder" class="tool-btn" @click="restoreSelectedEmails" :disabled="!hasOperationTarget">
          恢复
        </button>
        <button class="tool-btn" @click="markAllAsRead" v-show="!selectedEmailDetail && folderName !== '草稿箱'">
          全部已读
        </button>
        <select class="tool-select" v-model="markAsValue" @change="handleMarkAsChange">
          <option value="" disabled selected style="display: none;">标记为...</option>
          <option v-if="folderName !== '草稿箱' && !selectedEmailDetail" value="read">已读邮件</option>
          <option v-if="folderName !== '草稿箱' && !selectedEmailDetail" value="unread">未读邮件</option>
          <option v-if="folderName !== '星标邮件'" value="star">星标邮件</option>
          <option value="unstar">取消星标</option>
        </select>
        <select v-if="!isDeletedFolder && !isTrashFolder" class="tool-select move-select" v-model="moveToValue" @change="handleMoveToChange">
          <option value="" disabled selected style="display: none;">移动...</option>
          <!-- 自定义文件夹选项 -->
          <option v-for="folder in props.customFolders" :key="folder.id" :value="folder.id">
            {{ folder.folderName }}
          </option>
        </select>
      </div>
      <div class="toolbar-right">
        <span v-show="!selectedEmailDetail" class="email-count">{{ emailCountText }} ⬇</span>
        <span v-show="!selectedEmailDetail" class="refresh-icon" @click="$emit('syncMails')" style="cursor: pointer" title="同步邮件">🔄</span>
      </div>
    </div>

    <!-- 邮件列表或详情显示区域 -->
    <div class="email-content-container">
      <!-- 邮件列表分组显示 -->
      <div v-if="!selectedEmailDetail" class="email-list">
        <template v-for="group in groupedEmails" :key="group.label">
          <div class="group-label-bar">
            <span class="group-label">{{ group.label }}({{ group.emails.length }}封)</span>
          </div>
        <div v-for="email in group.emails" :key="email.id" class="email-item" :class="{draft: email.isDraft, deleted: email.deletedAt, unread: folderName !== '草稿箱' && !email.isRead}" @click="viewEmailDetail(email.id)" @contextmenu.prevent="showContextMenu($event, email)">
          <input type="checkbox" class="email-checkbox" v-model="selectedEmails" :value="email.id" @click.stop />
          <span class="email-icon">✉️</span>
          <span class="sender">
            <template v-if="folderName === '已发送' || folderName === '草稿箱'">
              {{ formatRecipientsForList(email) }}
            </template>
            <template v-else>
              {{ email.sender }}
            </template>
          </span>
          <span class="subject">
            {{ email.subject }}
            <span v-if="email.content" class="email-content"> - {{ stripHtml(email.content) }}</span>
            <span v-if="email.isDraft" class="draft-label">[草稿]</span>
          </span>
          <span class="time">{{ email.time }}</span>
          <span class="star-btn" :class="{starred: email.isStarred}" @click.stop="toggleStar(email.id)">
            {{ email.isStarred ? '★' : '☆' }}
          </span>
        </div>
        </template>
      </div>

      <!-- 邮件详情显示区域 -->
      <div v-else class="email-detail-panel">
        <!-- 加载状态显示 -->
        <div v-if="selectedEmailDetail.isLoading" class="email-detail-loading">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <span>正在加载邮件详情...</span>
          </div>
        </div>
        
        <!-- 邮件详情内容 -->
        <div v-else>
          <!-- 主题区域 -->
          <div class="detail-title-section">
            <h3 class="detail-title">{{ selectedEmailDetail.subject || '无主题' }}</h3>
          </div>
          
          <!-- 发件人信息区域 -->
          <div class="detail-header">
            <div class="sender-avatar">
              <img 
                v-if="senderAvatar && !avatarLoading" 
                :src="senderAvatar" 
                :alt="selectedEmailDetail.sender || '发件人'"
                class="avatar-img"
                @error="handleAvatarError"
              />
              <div v-else class="avatar-placeholder" :class="{ 'loading': avatarLoading }">
                {{ getAvatarText(selectedEmailDetail.sender) }}
              </div>
            </div>
            <div class="header-content">
              <div class="sender-info">
                <span class="sender-name">{{ selectedEmailDetail.sender || '未知' }}</span>
              </div>
              <div class="sender-meta">
                <div class="meta-item">
                  <span class="meta-label">收件人</span>
                  <span class="meta-value">{{ selectedEmailDetail.toMail || '无' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">时间</span>
                  <span class="meta-value">{{ formatDisplayTime(selectedEmailDetail.originalSendTime) || '未知' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 附件列表区域 - 显示在正文上方 -->
          <div v-if="selectedEmailDetail.attachments && selectedEmailDetail.attachments.length > 0" class="detail-attachments">
            <div class="attachments-list">
              <div 
                v-for="att in selectedEmailDetail.attachments" 
                :key="att.id" 
                class="attachment-item"
              >
                <div class="attachment-info">
                  <div class="attachment-name">{{ att.fileName }}</div>
                  <div class="attachment-actions">
                    <!-- 统一使用下载功能 -->
                    <template v-if="att.fileUrl">
                      <el-link 
                        type="primary"
                        :download="att.fileName"
                        :href="att.fileUrl"
                        :underline="false"
                        target="_blank"
                        :title="`下载 ${att.fileName}`"
                      >下载</el-link>
                    </template>
                  </div>
                </div>
                <div class="attachment-details">
                  <span class="file-size">{{ formatFileSizeFromString(att.fileSize) }}</span>
                  <span v-if="getFileExtension(att.fileName)" class="file-type">{{ getFileExtension(att.fileName).toUpperCase() }}</span>
                  <span v-if="att.isTemp" class="temp-badge">临时</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 附件加载状态提示 -->
          <div v-if="isLoadingAttachments" class="attachments-loading">
            <div class="loading-spinner"></div>
            <span>正在加载附件...</span>
          </div>
          
          <!-- 邮件正文内容区域 -->
          <div class="detail-content">
            <div v-if="!selectedEmailDetail.content" class="content-loading">
              <div class="loading-spinner"></div>
              <span>正在加载邮件内容...</span>
            </div>
            <div v-else class="content-body" v-html="selectedEmailDetail.content">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div v-if="!selectedEmailDetail" class="pagination">
      <div class="pagination-numbers">
      <button v-for="n in totalPages" :key="n" class="page-btn" :class="{active: n===currentPage}" @click="currentPage=n">{{ n }}</button>
      <span v-if="totalPages > 7" class="dots">...</span>
      <span class="page-info">{{ pageSize }}条/页</span>
    </div>
    <div class="pagination-actions">
      <button class="action-btn" @click="currentPage=1">首页</button>
      <button class="action-btn" @click="currentPage=Math.max(1,currentPage-1)">上一页</button>
      <button class="action-btn" @click="currentPage=Math.min(totalPages,currentPage+1)">下一页</button>
      <button class="action-btn" @click="currentPage=totalPages">末页</button>
    </div>
    </div>

    <!-- 右键上下文菜单 -->
    <div v-if="contextMenu.visible" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
      <!-- 根据邮件状态显示不同的菜单选项 -->
      <div v-if="contextMenu.email && folderName !== '草稿箱' && !contextMenu.email.isRead" class="context-menu-item" @click="markAsRead">
        标记为已读
      </div>
      <div v-if="contextMenu.email && folderName !== '草稿箱' && contextMenu.email.isRead" class="context-menu-item" @click="markAsUnread">
        标记为未读
      </div>
      <div v-if="contextMenu.email && !contextMenu.email.deletedAt && !isTrashFolder" class="context-menu-item" @click="deleteEmail">
        删除
      </div>
      <div v-if="contextMenu.email && (contextMenu.email.deletedAt || isTrashFolder)" class="context-menu-item" @click="permanentDeleteEmail">
        彻底删除
      </div>
      <div v-if="contextMenu.email && isDeletedFolder" class="context-menu-item" @click="restoreEmail">
        恢复
      </div>
      <!-- 垃圾邮件相关选项 -->
      <div v-if="contextMenu.email && folderName === '收件箱'" class="context-menu-item" @click="markAsSpamFromContext">
        这是垃圾邮件
      </div>
      <div v-if="contextMenu.email && isTrashFolder" class="context-menu-item" @click="markAsSpamFromContext">
        这不是垃圾邮件
      </div>
      <div 
        v-if="contextMenu.email && !isDeletedFolder && props.isCustomFolder && props.currentCustomFolderId"
        class="context-menu-item"
        @click="removeFromCurrentFolder">
        从当前文件夹移除
      </div>
      <!-- 移动到... 悬浮子菜单 -->
      <div 
        v-if="!isDeletedFolder && !isTrashFolder"
        class="context-menu-item"
        style="position: relative;"
        @mouseenter="contextMenu.showMoveSubmenu = true"
        @mouseleave="contextMenu.showMoveSubmenu = false">
        移动到...
        <div
          v-if="contextMenu.showMoveSubmenu"
          class="context-menu context-submenu"
          :style="{ left: '100%', top: '0px', position: 'absolute', zIndex: 2000 }"
          @mouseenter.stop="contextMenu.showMoveSubmenu = true"
          @mouseleave="contextMenu.showMoveSubmenu = false"
          @click.stop>
          <div
            v-for="item in moveTargetFolders"
            :key="item.id"
            class="context-menu-item"
            :style="{ paddingLeft: (8 + item.level * 12) + 'px' }"
            @click="moveEmailToFolder(item.id)">
            {{ item.folderName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import topImage from '@/views/mail/image/top.png'
import { getUserByIdCard } from '@/api/system/user'
import { formatFileSizeFromString, getFileExtension } from '@/api/system/mail/attachment'
// import { ElMessage } from 'element-plus'

//

interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string
  deletedAt?: string
  isDraft?: boolean
  isStarred?: boolean
  starredAt?: string // 新增：星标日期字段
  content?: string // 新增：邮件内容字段
  isRead?: boolean // 新增：是否已读字段
  toMail?: string // 新增：收件人字段
  priority?: number // 新增：优先级字段
  requestReadReceipt?: boolean // 新增：已读回执字段
  originalSendTime?: string // 新增：原始发送时间字段
  isLoading?: boolean // 新增：加载状态字段
  attachments?: Array<{
    id: number, 
    fileName: string, 
    fileSize: string, 
    fileType: string,
    fileExtension: string,
    url?: string,
    fileUrl?: string,
    uploadUserIdCard: string,
    uploadTime: string,
    downloadCount: number,
    isTemp: boolean,
    tempExpireTime?: string,
    createTime: string
  }> // 新增：附件字段
  isSelfSent?: boolean
}

const props = defineProps<{ 
  folderName: string, 
  emails: Array<Email>,
  isDeletedFolder: boolean,
  isTrashFolder?: boolean,
  isCustomFolder?: boolean,
  currentCustomFolderId?: number,
  mailStats?: {
    totalCount: number,
    totalUnreadCount: number,
    inboxUnreadCount: number
  },
  customFolders: Array<{
    id: number,
    folderName: string,
    parentId: number,
    mailCount: number,
    children?: any[]
  }>
}>()

const emit = defineEmits<{
  deleteEmails: [emailIds: number[]]
  permanentDeleteEmails: [emailIds: number[]]
  restoreEmails: [emailIds: number[]]
  markEmails: [data: { action: string, emailIds: number[] }]
  moveEmails: [data: { folderId: number, emailIds: number[] }]
  removeFromFolder: [data: { folderId: number, emailIds: number[] }]
  showMessage: [data: { type: string, message: string }]
  toggleStar: [emailId: number]
  syncMails: []
  viewEmailDetail: [emailId: number]
  getEmailDetail: [emailId: number]
}>()

// 邮件选择和操作相关
const selectedEmails = ref<(string|number)[]>([])
const markAsValue = ref('')
const moveToValue = ref('')

// 附件加载状态
const isLoadingAttachments = ref<boolean>(false)

// 邮件详情显示相关
const selectedEmailDetail = ref<Email | null>(null)
const senderAvatar = ref<string>('')
const avatarLoading = ref<boolean>(false)
const userDetailsCache = ref<Record<string, any>>({})
const updateTimeout = ref<NodeJS.Timeout | null>(null)

// 计算属性
const hasOperationTarget = computed(() => !!selectedEmailDetail.value || selectedEmails.value.length > 0)
const allSelected = computed({
  get() {
    return props.emails.length > 0 && selectedEmails.value.length === props.emails.length
  },
  set(value: boolean) {
    if (value) {
      selectedEmails.value = props.emails.map(email => email.id)
    } else {
      selectedEmails.value = []
    }
  }
})

// 监听邮件列表变化，重置选择状态
watch(() => props.emails, () => {
  selectedEmails.value = []
  selectedEmailDetail.value = null
})

// 右键上下文菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  email: null as Email | null,
  showMoveSubmenu: false
})

// 上下文菜单操作
function showContextMenu(event: MouseEvent, email: Email) {
  event.preventDefault()
  event.stopPropagation()
  
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    email: email,
    showMoveSubmenu: false
  }
  
  // 点击其他地方隐藏菜单
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true })
    document.addEventListener('wheel', hideContextMenu, { once: true })
  }, 0)
}

function hideContextMenu() {
  contextMenu.value.visible = false
  contextMenu.value.email = null
  contextMenu.value.showMoveSubmenu = false
}

// 右键菜单操作函数
function markAsRead() {
  if (contextMenu.value.email) {
    emit('markEmails', { action: 'read', emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

function markAsUnread() {
  if (contextMenu.value.email) {
    emit('markEmails', { action: 'unread', emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

function deleteEmail() {
  if (contextMenu.value.email) {
    emit('deleteEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

function permanentDeleteEmail() {
  if (contextMenu.value.email) {
    emit('permanentDeleteEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

function markAsSpamFromContext() {
  if (contextMenu.value.email) {
    const action = props.isTrashFolder ? 'unspam' : 'spam'
    emit('markEmails', { action, emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

function removeFromCurrentFolder() {
  if (contextMenu.value.email && props.currentCustomFolderId) {
    emit('removeFromFolder', { folderId: Number(props.currentCustomFolderId), emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

function restoreEmail() {
  if (contextMenu.value.email) {
    emit('restoreEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

// 计算移动目标文件夹列表
const moveTargetFolders = computed(() => {
  const build = (folders: any[], level = 0, acc: any[] = []) => {
    folders.forEach((f) => {
      acc.push({ ...f, level })
      if (f.children && f.children.length) {
        build(f.children, level + 1, acc)
      }
    })
    return acc
  }
  const roots = (props.customFolders || []).filter((f: any) => f.parentId === 0)
  return build(roots)
})

function moveEmailToFolder(folderId: number) {
  if (contextMenu.value.email) {
    emit('moveEmails', { folderId, emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 计算邮件数量显示文本
const emailCountText = computed(() => {
  const totalCount = props.emails.length
  const unreadCount = props.emails.filter(email => !email.isRead).length
  
  if (props.mailStats && props.folderName === '收件箱') {
    const stats = props.mailStats
    return stats.inboxUnreadCount > 0 
      ? `(共 ${stats.totalCount} 封，其中 未读邮件 ${stats.inboxUnreadCount} 封)`
      : `(共 ${stats.totalCount} 封)`
  } else {
    return unreadCount > 0 
      ? `(共 ${totalCount} 封，其中 未读邮件 ${unreadCount} 封)`
      : `(共 ${totalCount} 封)`
  }
})

// 邮件操作辅助函数
function getCurrentEmailIds(): number[] {
  return selectedEmailDetail.value
    ? [Number(selectedEmailDetail.value.id)]
    : selectedEmails.value.map(id => Number(id))
}

function clearSelection() {
  if (selectedEmailDetail.value) {
    selectedEmailDetail.value = null
  }
  selectedEmails.value = []
}

// 邮件操作函数
function deleteSelectedEmails() {
  const ids = getCurrentEmailIds()
  if (ids.length === 0) return
  
  if (props.isDeletedFolder || props.isTrashFolder) {
    emit('permanentDeleteEmails', ids)
  } else {
    emit('deleteEmails', ids)
  }
  clearSelection()
}

function restoreSelectedEmails() {
  const ids = getCurrentEmailIds()
  if (ids.length === 0) {
    emit('showMessage', { type: 'warning', message: '请先选择要恢复的邮件' })
    return
  }
  emit('restoreEmails', ids)
  clearSelection()
}


// 工具栏操作函数
function handleMarkAsChange() {
  if (markAsValue.value && markAsValue.value !== '') {
    const ids = getCurrentEmailIds()
    if (ids.length > 0) {
      emit('markEmails', { action: markAsValue.value, emailIds: ids })
    } else {
      emit('showMessage', { type: 'warning', message: '请先选择要标记的邮件' })
    }
    markAsValue.value = ''
    selectedEmails.value = []
  }
}

function handleMoveToChange() {
  if (moveToValue.value && moveToValue.value !== '') {
    const ids = getCurrentEmailIds()
    const folderId = Number(moveToValue.value)
    if (ids.length > 0) {
      emit('moveEmails', { folderId, emailIds: ids })
    } else {
      emit('showMessage', { type: 'warning', message: '请先选择要移动的邮件' })
    }
    moveToValue.value = ''
    selectedEmails.value = []
  }
}

function markAsSpam() {
  const ids = getCurrentEmailIds()
  if (ids.length > 0) {
    const action = props.isTrashFolder ? 'unspam' : 'spam'
    emit('markEmails', { action, emailIds: ids })
  } else {
    const message = props.isTrashFolder ? '请先选择要取消垃圾邮件标记的邮件' : '请先选择要标记为垃圾邮件的邮件'
    emit('showMessage', { type: 'warning', message })
  }
  selectedEmails.value = []
}

function markAllAsRead() {
  const allEmailIds = props.emails.map(email => email.id)
  if (allEmailIds.length > 0) {
    emit('markEmails', { action: 'read', emailIds: allEmailIds })
  } else {
    emit('showMessage', { type: 'warning', message: '当前文件夹没有邮件' })
  }
}

function toggleStar(emailId: number) {
  emit('toggleStar', emailId)
}

// 邮件详情操作
function viewEmailDetail(emailId: number) {
  const localEmail = props.emails.find(email => email.id === emailId)
  if (localEmail) {
    // 设置加载状态，不立即显示详情
    selectedEmailDetail.value = {
      ...localEmail,
      content: '',
      originalSendTime: localEmail.time,
      toMail: localEmail.toMail || '无',
      attachments: [],
      priority: undefined,
      requestReadReceipt: undefined,
      isLoading: true // 添加加载状态标识
    }
    
    senderAvatar.value = ''
    avatarLoading.value = false
  }
  
  emit('getEmailDetail', emailId)
  emit('viewEmailDetail', emailId)
}

function closeEmailDetail() {
  if (updateTimeout.value) {
    clearTimeout(updateTimeout.value)
    updateTimeout.value = null
  }
  
  selectedEmailDetail.value = null
  senderAvatar.value = ''
  avatarLoading.value = false
}


// 工具函数

function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '未知时间'
  
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) {
      return timeStr || '未知时间'
    }
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    return timeStr || '未知时间'
  }
}

function getAvatarText(senderName?: string): string {
  if (!senderName) return '?'
  return senderName.charAt(0).toUpperCase()
}

function handleAvatarError() {
  senderAvatar.value = ''
}

// 用户信息相关函数
async function getUserDetailByIdCard(idCard: string): Promise<any> {
  if (!idCard) return null
  
  if (userDetailsCache.value[idCard]) {
    return userDetailsCache.value[idCard]
  }
  
  try {
    const userDetail = await getUserByIdCard(idCard)
    userDetailsCache.value[idCard] = userDetail
    return userDetail
  } catch (error: any) {
    return null
  }
}

async function loadSenderAvatar(emailDetail: any) {
  if (senderAvatar.value) {
    return
  }
  
  try {
    avatarLoading.value = true
    
    let senderIdCard = ''
    
    if (emailDetail.senders && emailDetail.senders.length > 0) {
      senderIdCard = emailDetail.senders[0].senderIdCard
    }
    
    if (!senderIdCard) {
      senderIdCard = emailDetail.fromUserIdCard || emailDetail.fromIdCard || ''
    }
    
    if (senderIdCard) {
      const userDetail = await getUserDetailByIdCard(senderIdCard)
      senderAvatar.value = userDetail && userDetail.avatar ? userDetail.avatar : ''
    } else {
      senderAvatar.value = ''
    }
  } catch (error: any) {
    senderAvatar.value = ''
  } finally {
    avatarLoading.value = false
  }
}


// 收件人信息处理
async function parseRecipients(recipients: string): Promise<string> {
  if (!recipients) return ''
  
  const recipientList = recipients.split(',').map(r => r.trim())
  
  const idCardRecipients: string[] = []
  const otherRecipients: string[] = []
  
  recipientList.forEach(recipient => {
    if (!recipient) return
    
    if (/^\d{18}$/.test(recipient)) {
      idCardRecipients.push(recipient)
    } else {
      otherRecipients.push(recipient)
    }
  })
  
  const userDetailPromises = idCardRecipients.map(async (idCard) => {
    try {
      const userDetail = await getUserDetailByIdCard(idCard)
      return userDetail && userDetail.nickname ? userDetail.nickname : null
    } catch (error) {
      return null
    }
  })
  
  const parsedIdCardNames = await Promise.all(userDetailPromises)
  const validNames = parsedIdCardNames.filter(name => name !== null)
  
  const allNames = [...otherRecipients, ...validNames]
  return allNames.join(', ')
}

// 文本处理函数
function stripHtml(html: string): string {
  if (!html) return ''
  const temp = document.createElement('div')
  temp.innerHTML = html
  const text = temp.textContent || temp.innerText || ''
  return text.replace(/\s+/g, ' ').trim()
}

function formatRecipientsForList(email: Email): string {
  const recipients = (email.toMail || '').split(',').map(s => s.trim()).filter(Boolean)
  if (recipients.length === 0) {
    return '（收件人未填写）'
  }
  return recipients.join('、')
}

// 日期处理函数
function getDateLabel(dateStr: string) {
  const today = new Date()
  const d = new Date(dateStr)
  const diffDays = Math.floor((today.getTime()-d.getTime())/86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return '本周'
  if (diffDays < 14) return '上周'
  if (diffDays < 40) return '上月'
  if (today.getFullYear() === d.getFullYear()) return '今年'
  return '更早'
}
// 邮件分组计算
const groupedEmails = computed(() => {
  const groups: Record<string, any[]> = {}
  props.emails.forEach(email => {
    let dateForGrouping: string
    if (props.isDeletedFolder && email.deletedAt) {
      dateForGrouping = email.deletedAt
    } else if (props.folderName === '星标邮件' && email.starredAt) {
      dateForGrouping = email.starredAt
    } else {
      dateForGrouping = email.date
    }
    
    const label = getDateLabel(dateForGrouping)
    if (!groups[label]) groups[label] = []
    groups[label].push(email)
  })
  
  const order = ['今天','昨天','本周','上周']
  return order.map(label => ({ 
    label, 
    emails: (groups[label]||[]).sort((a,b)=> {
      if (props.isDeletedFolder) {
        const aDate = a.deletedAt || a.date
        const bDate = b.deletedAt || b.date
        if (aDate !== bDate) return bDate.localeCompare(aDate)
        return b.time.localeCompare(a.time)
      } else if (props.folderName === '星标邮件') {
        const aDate = a.starredAt || a.date
        const bDate = b.starredAt || b.date
        if (aDate !== bDate) return bDate.localeCompare(aDate)
        return b.time.localeCompare(a.time)
      } else {
        return b.date.localeCompare(a.date)||b.time.localeCompare(a.time)
      }
    }) 
  })).filter(g=>g.emails.length)
})

// 分页相关
const pageSize = ref(15)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.emails.length / pageSize.value))

watch([() => props.emails, pageSize], () => {
  currentPage.value = 1
})

// 邮件详情更新
async function updateEmailDetail(emailDetail: any) {
  if (emailDetail && selectedEmailDetail.value) {
    if (updateTimeout.value) {
      clearTimeout(updateTimeout.value)
    }
    
    const currentDetail = selectedEmailDetail.value
    const rawContent = emailDetail.content?.content || emailDetail.content || ''
    const originalSendTime = emailDetail.content?.sendTime || emailDetail.sendTime || currentDetail.originalSendTime
    const hasAttachments = emailDetail.attachments && emailDetail.attachments.length > 0
    
    if (hasAttachments && !currentDetail.attachments?.length) {
      isLoadingAttachments.value = true
    }
    
    // 先解析收件人信息，确保数据完整
    let parsedToMail = currentDetail.toMail || '无'
    const recipientsStr = emailDetail.recipients?.map((r: any) => r.recipientIdCard).join(', ') || emailDetail.toMail || ''
    if (recipientsStr && recipientsStr !== currentDetail.toMail) {
      try {
        parsedToMail = await parseRecipients(recipientsStr)
      } catch (error) {
        // 保持原有值，不更新
        parsedToMail = currentDetail.toMail || '无'
      }
    }
    
    // 数据准备完成后，一次性更新所有信息，移除加载状态
    selectedEmailDetail.value = {
      ...currentDetail,
      ...emailDetail,
      content: rawContent,
      priority: emailDetail.content?.priority,
      requestReadReceipt: emailDetail.content?.requestReadReceipt,
      attachments: emailDetail.attachments || [],
      originalSendTime: originalSendTime,
      toMail: parsedToMail,
      isLoading: false // 移除加载状态
    }
    
    if (hasAttachments) {
      isLoadingAttachments.value = false
    }
    
    if (emailDetail.senders && emailDetail.senders.length > 0) {
      const sender = emailDetail.senders[0]
      const senderIdCard = sender.senderIdCard
      
      if (senderIdCard) {
        try {
          const userDetail = await getUserDetailByIdCard(senderIdCard)
          if (userDetail && userDetail.nickname && selectedEmailDetail.value) {
            selectedEmailDetail.value.sender = userDetail.nickname
          }
        } catch (error) {
          // 获取失败时保持原有值
        }
      }
    }
    
    loadSenderAvatar(emailDetail)
  }
}

// 暴露方法给父组件调用
defineExpose({
  updateEmailDetail,
  closeEmailDetail
})
</script>

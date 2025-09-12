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
                  <button 
                    class="download-btn" 
                    @click="downloadAttachmentFile(att)"
                    :disabled="downloadingAttachments.includes(att.id)"
                    :title="`下载 ${att.fileName}`"
                  >
                    <svg v-if="!downloadingAttachments.includes(att.id)" width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M3 17v3a2 2 0 002 2h10a2 2 0 002-2v-3M8 12l4 4 4-4M12 16V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="download-spinner"></div>
                  </button>
                </div>
              </div>
              <div class="attachment-details">
                <span class="file-size">{{ formatFileSize(att.fileSize) }}</span>
                <span v-if="att.fileExtension" class="file-type">{{ att.fileExtension.toUpperCase() }}</span>
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
import { getUserByIdCard } from '@/api/system/user/index'
import { downloadAttachment, formatFileSize as apiFormatFileSize, getFileExtension } from '@/api/system/mail/letter'
import { ElMessage } from 'element-plus'

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
  attachments?: Array<{
    id: number, 
    fileName: string, 
    fileSize: number, 
    fileType: string,
    fileExtension: string,
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

// --- 全选逻辑 ---
const selectedEmails = ref<(string|number)[]>([])
const markAsValue = ref('')
const moveToValue = ref('')

// --- 附件下载相关 ---
const downloadingAttachments = ref<number[]>([]) // 正在下载的附件ID列表
const isLoadingAttachments = ref<boolean>(false) // 是否正在加载附件

// 统一判断当前是否有可操作目标：优先取详情中的当前邮件，否则取多选
const hasOperationTarget = computed(() => !!selectedEmailDetail.value || selectedEmails.value.length > 0)

// --- 邮件详情显示逻辑 ---
const selectedEmailDetail = ref<Email | null>(null)
const senderAvatar = ref<string>('')
const avatarLoading = ref<boolean>(false) // 头像加载状态
const userDetailsCache = ref<Record<string, any>>({}) // 用户详情缓存
const updateTimeout = ref<NodeJS.Timeout | null>(null) // 防抖定时器
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

// When the list of emails changes (e.g., folder switch), reset the selection
watch(() => props.emails, () => {
  selectedEmails.value = []
  // 切换邮箱/文件夹后，直接退出详情页
  selectedEmailDetail.value = null
})

// --- 右键上下文菜单逻辑 ---
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  email: null as Email | null,
  showMoveSubmenu: false
})

// 显示上下文菜单
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
    // 滚轮滚动时隐藏菜单（一次性）
    document.addEventListener('wheel', hideContextMenu, { once: true })
  }, 0)
}

// 隐藏上下文菜单
function hideContextMenu() {
  contextMenu.value.visible = false
  contextMenu.value.email = null
  contextMenu.value.showMoveSubmenu = false
}

// 标记为已读
function markAsRead() {
  if (contextMenu.value.email) {
    emit('markEmails', { action: 'read', emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 标记为未读
function markAsUnread() {
  if (contextMenu.value.email) {
    emit('markEmails', { action: 'unread', emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 删除邮件
function deleteEmail() {
  if (contextMenu.value.email) {
    emit('deleteEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

// 彻底删除邮件
function permanentDeleteEmail() {
  if (contextMenu.value.email) {
    emit('permanentDeleteEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

// 从右键菜单标记为垃圾邮件/取消垃圾邮件标记
function markAsSpamFromContext() {
  if (contextMenu.value.email) {
    const action = props.isTrashFolder ? 'unspam' : 'spam'
    emit('markEmails', { action, emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 从当前自定义文件夹中移除
function removeFromCurrentFolder() {
  if (contextMenu.value.email && props.currentCustomFolderId) {
    emit('removeFromFolder', { folderId: Number(props.currentCustomFolderId), emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 恢复邮件
function restoreEmail() {
  if (contextMenu.value.email) {
    emit('restoreEmails', [contextMenu.value.email.id])
    hideContextMenu()
  }
}

// 扁平化“我的文件夹”用于子菜单展示
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
  // 自根开始构建
  const roots = (props.customFolders || []).filter((f: any) => f.parentId === 0)
  return build(roots)
})

// 右键菜单：移动当前邮件到指定文件夹
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
    // 对于收件箱，使用统计数据
    const stats = props.mailStats
    if (stats.inboxUnreadCount > 0) {
      return `(共 ${stats.totalCount} 封，其中 未读邮件 ${stats.inboxUnreadCount} 封)`
    } else {
      return `(共 ${stats.totalCount} 封)`
    }
  } else {
    // 对于其他文件夹，使用当前显示的邮件数据
    if (unreadCount > 0) {
      return `(共 ${totalCount} 封，其中 未读邮件 ${unreadCount} 封)`
    } else {
      return `(共 ${totalCount} 封)`
    }
  }
})

// 删除选中的邮件
function deleteSelectedEmails() {
  const ids: number[] = selectedEmailDetail.value
    ? [Number(selectedEmailDetail.value.id)]
    : selectedEmails.value.map(id => Number(id))
  if (ids.length === 0) return
  if (props.isDeletedFolder || props.isTrashFolder) {
    emit('permanentDeleteEmails', ids)
  } else {
    emit('deleteEmails', ids)
  }
  // 若是详情页操作，返回列表视图
  if (selectedEmailDetail.value) {
    selectedEmailDetail.value = null
  }
  selectedEmails.value = []
}

// 恢复选中的邮件
function restoreSelectedEmails() {
  const ids: number[] = selectedEmailDetail.value
    ? [Number(selectedEmailDetail.value.id)]
    : selectedEmails.value.map(id => Number(id))
  if (ids.length === 0) {
    emit('showMessage', { type: 'warning', message: '请先选择要恢复的邮件' })
    return
  }
  emit('restoreEmails', ids)
  if (selectedEmailDetail.value) {
    selectedEmailDetail.value = null
  }
  selectedEmails.value = []
}


// 处理标记为操作
function handleMarkAsChange() {
  if (markAsValue.value && markAsValue.value !== '') {
    const ids: number[] = selectedEmailDetail.value
      ? [Number(selectedEmailDetail.value.id)]
      : selectedEmails.value.map(id => Number(id))
    if (ids.length > 0) {
      emit('markEmails', { action: markAsValue.value, emailIds: ids })
    } else {
      emit('showMessage', { type: 'warning', message: '请先选择要标记的邮件' })
    }
    markAsValue.value = ''
    selectedEmails.value = []
  }
}

// 处理移动到文件夹操作
function handleMoveToChange() {
  if (moveToValue.value && moveToValue.value !== '') {
    const ids: number[] = selectedEmailDetail.value
      ? [Number(selectedEmailDetail.value.id)]
      : selectedEmails.value.map(id => Number(id))
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

// 标记为垃圾邮件/取消垃圾邮件标记
function markAsSpam() {
  const ids: number[] = selectedEmailDetail.value
    ? [Number(selectedEmailDetail.value.id)]
    : selectedEmails.value.map(id => Number(id))
  if (ids.length > 0) {
    const action = props.isTrashFolder ? 'unspam' : 'spam'
    emit('markEmails', { action, emailIds: ids })
  } else {
    const message = props.isTrashFolder ? '请先选择要取消垃圾邮件标记的邮件' : '请先选择要标记为垃圾邮件的邮件'
    emit('showMessage', { type: 'warning', message })
  }
  selectedEmails.value = []
}

// 全部标记为已读
function markAllAsRead() {
  const allEmailIds = props.emails.map(email => email.id)
  if (allEmailIds.length > 0) {
    emit('markEmails', { action: 'read', emailIds: allEmailIds })
  } else {
    emit('showMessage', { type: 'warning', message: '当前文件夹没有邮件' })
  }
}

// 切换星标状态
function toggleStar(emailId: number) {
  emit('toggleStar', emailId)
}

// 查看邮件详情
function viewEmailDetail(emailId: number) {
  console.log('📧 查看邮件详情，邮件ID:', emailId)
  
  // 先查找本地邮件数据
  const localEmail = props.emails.find(email => email.id === emailId)
  if (localEmail) {
    // 创建一个临时的邮件详情对象，使用本地时间数据避免闪动
    selectedEmailDetail.value = {
      ...localEmail,
      content: '', // 先清空content，等待详细数据
      originalSendTime: localEmail.time, // 使用本地时间数据作为初始值
      toMail: localEmail.toMail || '无', // 使用本地收件人数据
      attachments: [], // 初始化为空数组，避免undefined
      priority: undefined, // 初始化为undefined
      requestReadReceipt: undefined // 初始化为undefined
    }
    
    // 重置头像状态，避免闪动
    senderAvatar.value = ''
    avatarLoading.value = false
  }
  
  // 通知父组件获取详细数据（会优先使用缓存）
  emit('getEmailDetail', emailId)
  emit('viewEmailDetail', emailId)
}

// 关闭邮件详情
function closeEmailDetail() {
  // 清理防抖定时器
  if (updateTimeout.value) {
    clearTimeout(updateTimeout.value)
    updateTimeout.value = null
  }
  
  selectedEmailDetail.value = null
  senderAvatar.value = ''
  avatarLoading.value = false
}

// 获取优先级文本
function getPriorityText(priority?: number): string {
  switch (priority) {
    case 1: return '普通'
    case 2: return '重要'
    case 3: return '紧急'
    default: return '未知'
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 下载附件
async function downloadAttachmentFile(attachment: any) {
  if (downloadingAttachments.value.includes(attachment.id)) {
    return // 防止重复下载
  }
  
  try {
    // 添加到下载列表
    downloadingAttachments.value.push(attachment.id)
    
    console.log(`📥 开始下载附件: ${attachment.fileName}`)
    
    // 检查是否为临时文件
    if (attachment.isTemp) {
      console.log(`⚠️ 附件为临时文件，过期时间: ${attachment.tempExpireTime}`)
    }
    
    // 调用下载API
    const blob = await downloadAttachment(attachment.id)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    console.log(`✅ 附件下载成功: ${attachment.fileName}`)
    ElMessage.success(`附件 "${attachment.fileName}" 下载成功`)
    
  } catch (error: any) {
    console.error(`❌ 附件下载失败: ${attachment.fileName}`, error)
    
    // 根据错误类型显示不同的错误信息
    let errorMsg = '下载失败'
    if (error?.response?.status === 404) {
      errorMsg = '附件不存在'
    } else if (error?.response?.status === 403) {
      errorMsg = '无权限访问该附件'
    } else if (error?.response?.data?.msg) {
      errorMsg = error.response.data.msg
    } else if (error?.message) {
      errorMsg = error.message
    }
    
    ElMessage.error(`下载失败: ${errorMsg}`)
  } finally {
    // 从下载列表中移除
    const index = downloadingAttachments.value.indexOf(attachment.id)
    if (index > -1) {
      downloadingAttachments.value.splice(index, 1)
    }
  }
}

// 格式化显示时间
function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '未知时间'
  
  try {
    // 尝试解析时间字符串（通常是ISO格式或标准日期格式）
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) {
      console.warn('时间解析失败:', timeStr)
      return timeStr || '未知时间' // 如果解析失败，返回原字符串或默认值
    }
    
    // 格式化为 yyyy年m月d日 hh:mm
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // getMonth() 返回 0-11
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch (error) {
    console.error('时间格式化失败:', error, '原始时间:', timeStr)
    return timeStr || '未知时间' // 出错时返回原字符串或默认值
  }
}

// 获取头像文本（用于默认头像显示）
function getAvatarText(senderName?: string): string {
  if (!senderName) return '?'
  return senderName.charAt(0).toUpperCase()
}

// 处理头像加载错误
function handleAvatarError() {
  senderAvatar.value = ''
}

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

// 加载发件人头像
async function loadSenderAvatar(emailDetail: any) {
  // 如果已经有头像了，不需要重新加载
  if (senderAvatar.value) {
    return
  }
  
  try {
    // 设置加载状态
    avatarLoading.value = true
    
    // 尝试从邮件详情中获取发件人身份证号
    let senderIdCard = ''
    
    // 从senders数组中获取发件人信息
    if (emailDetail.senders && emailDetail.senders.length > 0) {
      senderIdCard = emailDetail.senders[0].senderIdCard
    }
    
    // 如果从senders中获取不到，尝试从其他字段获取
    if (!senderIdCard) {
      senderIdCard = emailDetail.fromUserIdCard || emailDetail.fromIdCard || ''
    }
    
    if (senderIdCard) {
      console.log(`🖼️ 开始加载发件人头像，身份证号: ${senderIdCard}`)
      const userDetail = await getUserDetailByIdCard(senderIdCard)
      
      if (userDetail && userDetail.avatar) {
        senderAvatar.value = userDetail.avatar
        console.log(`✅ 发件人头像加载成功: ${userDetail.avatar}`)
      } else {
        console.log(`⚠️ 发件人没有头像或获取失败`)
        senderAvatar.value = ''
      }
    } else {
      console.log(`⚠️ 无法获取发件人身份证号`)
      senderAvatar.value = ''
    }
  } catch (error: any) {
    console.error(`❌ 加载发件人头像失败:`, error)
    senderAvatar.value = ''
  } finally {
    // 清除加载状态
    avatarLoading.value = false
  }
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

// 格式化内容用于显示，保持换行和段落结构
function formatContentForDisplay(content: string): string {
  if (!content) return '无内容'
  
  // 将换行符转换为HTML换行标签
  return content
    .replace(/\n/g, '<br>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\s{2,}/g, ' ') // 合并多个空格
}

// 解析收件人信息，将身份证号转换为真实姓名
async function parseRecipients(recipients: string): Promise<string> {
  if (!recipients) return ''
  
  // 分割收件人（可能是多个，用逗号分隔）
  const recipientList = recipients.split(',').map(r => r.trim())
  
  // 分离身份证号和其他类型的收件人
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
  
  // 并行查询所有身份证号对应的用户详情
  const userDetailPromises = idCardRecipients.map(async (idCard) => {
    try {
      const userDetail = await getUserDetailByIdCard(idCard)
      return userDetail && userDetail.nickname ? userDetail.nickname : null
    } catch (error) {
      console.error(`获取用户详情失败: ${idCard}`, error)
      return null
    }
  })
  
  // 等待所有用户详情查询完成
  const parsedIdCardNames = await Promise.all(userDetailPromises)
  
  // 只保留成功获取到姓名的结果
  const validNames = parsedIdCardNames.filter(name => name !== null)
  
  // 合并结果
  const allNames = [...otherRecipients, ...validNames]
  return allNames.join(', ')
}

// 去除HTML标签，只保留纯文本
function stripHtml(html: string): string {
  if (!html) return ''
  // 创建一个临时的div元素来解析HTML
  const temp = document.createElement('div')
  temp.innerHTML = html
  // 获取纯文本内容
  const text = temp.textContent || temp.innerText || ''
  // 清理多余的空白字符
  return text.replace(/\s+/g, ' ').trim()
}

// 列表展示用：在已发送/草稿箱显示收件人，草稿无收件人显示占位
function formatRecipientsForList(email: Email): string {
  // toMail 可能是逗号分隔的字符串，这里用中文顿号“、”连接
  const recipients = (email.toMail || '').split(',').map(s => s.trim()).filter(Boolean)
  if (recipients.length === 0) {
    return '（收件人未填写）'
  }
  return recipients.join('、')
}

// 日期分组辅助
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
const groupedEmails = computed(() => {
  // 先分组，再组内按时间倒序
  const groups: Record<string, any[]> = {}
  props.emails.forEach(email => {
    // 根据文件夹类型选择分组依据的日期
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
  // 只显示今天、昨天、一周内、一周前
  const order = ['今天','昨天','本周','上周']
  return order.map(label => ({ 
    label, 
    emails: (groups[label]||[]).sort((a,b)=> {
      // 根据文件夹类型选择排序依据的日期
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

const pageSize = ref(15)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.emails.length / pageSize.value))
watch([() => props.emails, pageSize], () => {
  currentPage.value = 1
})

// 接收父组件传递的详细邮件数据
async function updateEmailDetail(emailDetail: any) {
  if (emailDetail && selectedEmailDetail.value) {
    // 清除之前的防抖定时器
    if (updateTimeout.value) {
      clearTimeout(updateTimeout.value)
    }
    
    // 先更新基础数据，避免闪动
    const currentDetail = selectedEmailDetail.value
    
    // 使用原始 HTML 内容（来自后端/编辑器的 HTML）
    const rawContent = emailDetail.content?.content || emailDetail.content || ''
    
    // 获取原始发送时间用于格式化，优先使用详细数据中的时间
    const originalSendTime = emailDetail.content?.sendTime || emailDetail.sendTime || currentDetail.originalSendTime
    
    // 检查是否有附件需要加载
    const hasAttachments = emailDetail.attachments && emailDetail.attachments.length > 0
    if (hasAttachments && !currentDetail.attachments?.length) {
      isLoadingAttachments.value = true
    }
    
    // 立即更新基础数据，保持显示稳定
    selectedEmailDetail.value = {
      ...currentDetail,
      ...emailDetail,
      content: rawContent,
      priority: emailDetail.content?.priority,
      requestReadReceipt: emailDetail.content?.requestReadReceipt,
      attachments: emailDetail.attachments || [],
      originalSendTime: originalSendTime
    }
    
    // 如果附件已加载完成，隐藏加载状态
    if (hasAttachments) {
      isLoadingAttachments.value = false
    }
    
    // 使用防抖机制处理收件人信息解析
    updateTimeout.value = setTimeout(async () => {
      const recipientsStr = emailDetail.recipients?.map((r: any) => r.recipientIdCard).join(', ') || emailDetail.toMail || ''
      if (recipientsStr && recipientsStr !== currentDetail.toMail) {
        try {
          const parsedRecipients = await parseRecipients(recipientsStr)
          if (parsedRecipients && parsedRecipients !== currentDetail.toMail && selectedEmailDetail.value) {
            selectedEmailDetail.value.toMail = parsedRecipients
          }
        } catch (error) {
          console.error('解析收件人信息失败:', error)
          // 保持原有值，不更新
        }
      }
    }, 100) // 100ms防抖延迟
    
     // 异步获取发件人真实姓名
     if (emailDetail.senders && emailDetail.senders.length > 0) {
       const sender = emailDetail.senders[0]
       const senderIdCard = sender.senderIdCard
       
       if (senderIdCard) {
         try {
           // 调用 getUserByIdCard API 获取发件人真实姓名
           const userDetail = await getUserDetailByIdCard(senderIdCard)
           if (userDetail && userDetail.nickname && selectedEmailDetail.value) {
             selectedEmailDetail.value.sender = userDetail.nickname
             console.log(`✅ 通过身份证号获取发件人姓名成功: ${userDetail.nickname}`)
           }
         } catch (error) {
           console.error('❌ 获取发件人姓名失败:', error)
         }
       }
     }
     
     // 异步加载发件人头像
     loadSenderAvatar(emailDetail)
  }
}

// 暴露方法给父组件调用
defineExpose({
  updateEmailDetail,
  closeEmailDetail
})
</script>

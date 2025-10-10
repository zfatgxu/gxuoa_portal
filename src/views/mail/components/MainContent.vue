<template>
  <div class="main-content">
    <div class="header" v-show="!selectedEmailDetail">
      <div class="header-left">
        <img class="header-image" :src="topImage" alt="header" />
      </div>
      <div class="header-right">
        <div class="header-search-container">
          <div class="header-search">
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
                <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <input 
              class="search-input" 
              type="text" 
              placeholder="搜索" 
              v-model="quickSearchKeyword"
              @keyup.enter="handleQuickSearchWrapper"
            />
            <span 
              v-if="quickSearchKeyword" 
              class="clear-search-icon" 
              @click="clearQuickSearchWrapper"
              title="清除搜索"
            >✕</span>
          </div>
          <button 
            class="advanced-search-btn" 
            @click="handleOpenAdvancedSearch" 
            title="高级搜索"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 4px;">
              <rect x="2" y="2" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="2" y="12" width="12" height="2" rx="1" fill="currentColor"/>
            </svg>
            高级搜索
          </button>
        </div>
      </div>
    </div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" v-if="selectedEmailDetail" @click="closeEmailDetail">← 返回</button>
        <input type="checkbox" v-model="allSelected" class="select-all-checkbox" title="全选/取消全选" v-show="!selectedEmailDetail" />
        <span class="toolbar-inbox-label" v-show="!selectedEmailDetail">
          {{ displayFolderName }}
        </span>
        <button class="tool-btn" v-if="!selectedEmailDetail && activeSearchCriteria" @click="handleBackFromSearchWrapper">← 返回</button>
        <button class="tool-btn" @click="deleteSelectedEmails" :disabled="!hasOperationTarget">
          {{ (isDeletedFolder || isTrashFolder) ? '彻底删除' : '删除' }}
        </button>
        <button v-if="selectedEmailDetail && folderName === '收件箱'" class="tool-btn" @click="handleReply">
          回复
        </button>
        <button 
          v-if="(folderName === '收件箱' || folderName === '星标邮件' || folderName === '已发送') && !shouldRestrictDraftOperations"
          class="tool-btn"
          @click="handleForward"
        >
          转发
        </button>
        <button v-if="folderName === '收件箱' && !activeSearchCriteria" class="tool-btn" @click="markAsSpam">
          这是垃圾邮件
        </button>
        <button v-if="isTrashFolder && !activeSearchCriteria" class="tool-btn" @click="markAsSpam">
          这不是垃圾邮件
        </button>
        <button v-if="isDeletedFolder" class="tool-btn" @click="restoreSelectedEmails" :disabled="!hasOperationTarget">
          恢复
        </button>
        <button class="tool-btn" @click="markAllAsRead" v-show="!selectedEmailDetail && folderName !== '草稿箱' && !activeSearchCriteria">
          全部已读
        </button>
        <select class="tool-select" v-model="markAsValue" @change="handleMarkAsChange">
          <option value="" disabled selected style="display: none;">标记为...</option>
          <option v-if="folderName !== '草稿箱' && !selectedEmailDetail && !shouldRestrictDraftOperations" value="read">已读邮件</option>
          <option v-if="folderName !== '草稿箱' && !selectedEmailDetail && !shouldRestrictDraftOperations" value="unread">未读邮件</option>
          <option v-if="folderName !== '星标邮件'" value="star">星标邮件</option>
          <option value="unstar">取消星标</option>
        </select>
        <select v-if="!isDeletedFolder && !isTrashFolder && !isDraftFolder && !shouldRestrictDraftOperations" class="tool-select move-select" v-model="moveToValue" @change="handleMoveToChange">
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
        <div v-for="email in group.emails" :key="email.id" class="email-item" :class="{draft: email.isDraft, deleted: email.deletedAt, unread: !email.isDraft && folderName !== '草稿箱' && !email.isRead}" @click="viewEmailDetailWrapper(email.id)" @contextmenu.prevent="showContextMenu($event, email)">
          <input type="checkbox" class="email-checkbox" v-model="selectedEmails" :value="email.id" @click.stop />
          <span class="email-icon">✉️</span>
          <span class="sender">
            <template v-if="email.isDraft || email.isSelfSent">
              {{ formatRecipientsForList(email.toMail) }}
            </template>
            <template v-else>
              {{ email.sender }}
            </template>
          </span>
          <span class="subject">
            {{ email.subject ? email.subject : '(无主题)' }}
            <span v-if="email.content" class="email-content"> - {{ stripHtml(email.content) }}</span>
            <span v-if="email.isDraft" class="draft-label">草稿</span>
            <el-tag v-if="email.priority === 2" class="priority-tag" type="warning" size="small" :disable-transitions="true">重要</el-tag>
            <el-tag v-if="email.priority === 3" class="priority-tag" type="danger" size="small" :disable-transitions="true">紧急</el-tag>
            <el-tag v-if="email.requestReadReceipt" class="receipt-tag" type="info" size="small" :disable-transitions="true">已读回执</el-tag>
          </span>
          <span v-if="email.folderSource" class="folder-tag">{{ email.folderSource }}</span>
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
            <!-- 邮件设置标签 -->
            <div v-if="hasDetailSettings" class="detail-settings-tags">
              <el-tag v-if="selectedEmailDetail.priority === 2" type="warning" size="small" :disable-transitions="true">重要</el-tag>
              <el-tag v-if="selectedEmailDetail.priority === 3" type="danger" size="small" :disable-transitions="true">紧急</el-tag>
              <el-tag v-if="selectedEmailDetail.requestReadReceipt" type="info" size="small" :disable-transitions="true">要求已读回执</el-tag>
            </div>
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
                <div class="meta-item" v-if="selectedEmailDetail.toRecipients">
                  <span class="meta-label">收件人</span>
                  <span class="meta-value">{{ selectedEmailDetail.toRecipients || '无' }}</span>
                </div>
                <div class="meta-item" v-if="selectedEmailDetail.ccRecipients">
                  <span class="meta-label">抄送人</span>
                  <span class="meta-value">{{ selectedEmailDetail.ccRecipients }}</span>
                </div>
                <div class="meta-item" v-if="selectedEmailDetail.bccRecipients">
                  <span class="meta-label">密送人</span>
                  <span class="meta-value">{{ selectedEmailDetail.bccRecipients }}</span>
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
                    <el-link 
                      type="primary"
                      :underline="false"
                      :title="`下载 ${att.fileName}`"
                      @click.prevent="handleDownloadAttachment(att)"
                    >下载</el-link>
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

          <!-- 原始邮件（回复/转发场景）- 按写信页样式展示 -->
          <div v-if="originalMail" class="original-mail-block" style="padding: 12px 20px 16px 20px; background-color: #ffffff;">
            <div class="orig-mail-title">
              <span class="orig-mail-text">原始邮件</span>
              <span class="orig-mail-divider"></span>
            </div>
            <div style="background:#f5f7fa; border:1px solid #eeeeee; border-radius:6px; padding:10px 12px; margin: 0 0 8px 0;">
              <div style="font-size: 13px; color: #606266; display:grid; grid-template-columns: 72px 1fr; row-gap:6px; column-gap:8px; align-items:start;">
                <div style="color:#909399;">发件人：</div>
                <div>{{ originalMail.fromUserName || '' }}</div>
                <template v-if="originalMail.toRecipients || originalMail.toUserNames">
                  <div style="color:#909399;">收件人：</div>
                  <div>{{ originalMail.toRecipients || originalMail.toUserNames || '' }}</div>
                </template>
                <template v-if="originalMail.ccRecipients">
                  <div style="color:#909399;">抄送人：</div>
                  <div>{{ originalMail.ccRecipients }}</div>
                </template>
                <template v-if="originalMail.bccRecipients">
                  <div style="color:#909399;">密送人：</div>
                  <div>{{ originalMail.bccRecipients }}</div>
                </template>
                <div style="color:#909399;">发件时间：</div>
                <div>{{ formatDisplayTime(originalMail.sendTime) }}</div>
                <div style="color:#909399;">主题：</div>
                <div>{{ originalMail.subject || '' }}</div>
              </div>
            </div>
            <div v-if="originalMail?.attachments?.length" class="detail-attachments">
              <div class="attachments-list">
                <div 
                  v-for="att in originalMail.attachments" 
                  :key="att.id" 
                  class="attachment-item"
                >
                  <div class="attachment-info">
                    <div class="attachment-name">{{ att.fileName }}</div>
                    <div class="attachment-actions">
                      <el-link 
                        type="primary"
                        :underline="false"
                        :title="`下载 ${att.fileName}`"
                        @click.prevent="handleDownloadAttachment(att)"
                      >下载</el-link>
                    </div>
                  </div>
                  <div class="attachment-details">
                    <span class="file-size">{{ formatFileSizeFromString(att.fileSize) }}</span>
                    <span v-if="getFileExtension(att.fileName)" class="file-type">{{ getFileExtension(att.fileName).toUpperCase() }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="originalMailHtml" style="background:#fff; border:none; border-radius:6px; padding:12px;">
              <div style="font-size: 14px; color: #303133; line-height: 1.8;" v-html="originalMailHtml"></div>
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

    <!-- 邮件右键菜单 -->
    <EmailContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :email="contextMenu.email"
      :folder-name="folderName"
      :is-deleted-folder="isDeletedFolder"
      :is-trash-folder="isTrashFolder"
      :is-draft-folder="isDraftFolder"
      :is-custom-folder="isCustomFolder"
      :current-custom-folder-id="currentCustomFolderId"
      :custom-folders="customFolders"
      @mark-as-read="markAsRead"
      @mark-as-unread="markAsUnread"
      @delete="deleteEmail"
      @permanent-delete="permanentDeleteEmail"
      @restore="restoreEmail"
      @mark-as-spam="markAsSpamFromContext"
      @remove-from-folder="removeFromCurrentFolder"
      @move-to-folder="moveEmailToFolder"
      @close="hideContextMenu"
    />

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="showAdvancedSearch"
      @search="handleAdvancedSearchWrapper"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import topImage from '@/views/mail/image/top.png'
import { formatFileSizeFromString, getFileExtension, downloadAttachment } from '@/api/mail/attachment'
import type { Email } from '../types/mail'
import { 
  stripHtml, 
  formatRecipientsForList, 
  getDateLabel,
  getAvatarText,
  formatDisplayTime
} from '../utils/mailHelpers'
import { useMailSearch } from '../composables/useMailSearch'
import { useMailDetail } from '../composables/useMailDetail'
import AdvancedSearchDialog, { type SearchCriteria } from './AdvancedSearchDialog.vue'
import EmailContextMenu from './EmailContextMenu.vue'

const props = defineProps<{ 
  folderName: string, 
  emails: Array<Email>,
  isDeletedFolder: boolean,
  isTrashFolder?: boolean,
  isDraftFolder?: boolean,
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
  }>,
  allFoldersEmails?: Record<string, Array<Email>>  // 新增：所有文件夹的邮件
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
  replyEmail: [emailId: number]
  forwardEmail: [emailIdOrIds: number | number[]]
  loadAllFoldersForSearch: []  // 新增：通知父组件加载所有文件夹用于搜索
  loadSpecificFolderForSearch: [folderKey: string]  // 新增：加载指定文件夹用于搜索
}>()

// 使用邮件搜索 composable
const {
  quickSearchKeyword,
  showAdvancedSearch,
  activeSearchCriteria,
  filteredEmails,
  handleOpenAdvancedSearch,
  handleQuickSearch,
  clearQuickSearch,
  handleBackFromSearch,
  handleAdvancedSearch
} = useMailSearch({
  allFoldersEmails: props.allFoldersEmails,
  currentEmails: () => props.emails || []  // 传递函数以确保响应式，添加默认值保护
})

// 使用邮件详情 composable
const {
  selectedEmailDetail,
  senderAvatar,
  avatarLoading,
  isLoadingAttachments,
  originalMail,
  originalMailHtml,
  updateEmailDetail,
  closeEmailDetail,
  viewEmailDetail: setEmailDetailLoading
} = useMailDetail()

// 邮件选择和操作相关
const selectedEmails = ref<(string|number)[]>([])
const markAsValue = ref('')
const moveToValue = ref('')

// 计算属性
const hasOperationTarget = computed(() => !!selectedEmailDetail.value || selectedEmails.value.length > 0)
const allSelected = computed({
  get() {
    // 基于当前显示的邮件列表（可能是搜索结果）
    const currentEmails = paginatedEmails.value
    return currentEmails.length > 0 && selectedEmails.value.length === currentEmails.length
  },
  set(value: boolean) {
    if (value) {
      // 选中当前页面显示的所有邮件
      selectedEmails.value = paginatedEmails.value.map(email => email.id)
    } else {
      selectedEmails.value = []
    }
  }
})

// 显示的文件夹名称
const displayFolderName = computed(() => {
  // 如果正在搜索，统一显示"邮件搜索结果"
  if (activeSearchCriteria.value) {
    return '邮件搜索结果'
  }
  return props.folderName
})

// 计算属性 - 判断当前选中的邮件是否包含草稿（用于在星标邮件中限制操作）
const hasSelectedDrafts = computed(() => {
  // 如果正在查看详情
  if (selectedEmailDetail.value) {
    return selectedEmailDetail.value.isDraft || false
  }
  // 如果是多选
  if (selectedEmails.value.length > 0) {
    return selectedEmails.value.some(emailId => {
      // 优先从过滤列表中查找
      let email = filteredEmails.value.find(e => e.id === Number(emailId))
      if (!email) {
        email = props.emails.find(e => e.id === Number(emailId))
      }
      return email?.isDraft || false
    })
  }
  return false
})

// 计算属性 - 在星标邮件中且选中了草稿，需要限制某些操作
const shouldRestrictDraftOperations = computed(() => {
  return props.folderName === '星标邮件' && hasSelectedDrafts.value
})

// 计算属性 - 判断邮件详情是否有设置标签需要显示
const hasDetailSettings = computed(() => {
  if (!selectedEmailDetail.value) return false
  return selectedEmailDetail.value.priority !== 1 || selectedEmailDetail.value.requestReadReceipt
})

// 监听邮件列表变化，重置选择状态和搜索关键词
watch(() => props.emails, () => {
  selectedEmails.value = []
  selectedEmailDetail.value = null
  quickSearchKeyword.value = ''
  activeSearchCriteria.value = null
  currentPage.value = 1
})

// 右键上下文菜单
const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  email: Email | null
}>({
  visible: false,
  x: 0,
  y: 0,
  email: null
})

// 上下文菜单操作
function showContextMenu(event: MouseEvent, email: Email) {
  event.preventDefault()
  event.stopPropagation()
  
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    email: email
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

async function deleteEmail() {
  if (contextMenu.value.email) {
    const emailId = contextMenu.value.email.id
    const isDraft = contextMenu.value.email.isDraft || props.isDraftFolder
    
    // 先关闭右键菜单
    hideContextMenu()
    
    // 如果是草稿邮件，弹出确认框
    if (isDraft) {
      try {
        await ElMessageBox.confirm(
          '删除草稿后将无法恢复，是否要删除？',
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
      } catch (error) {
        // 用户点击取消
        return
      }
    }
    
    emit('deleteEmails', [emailId])
  }
}

async function permanentDeleteEmail() {
  if (contextMenu.value.email) {
    const emailId = contextMenu.value.email.id
    const isDraft = contextMenu.value.email.isDraft || props.isDraftFolder
    
    // 先关闭右键菜单
    hideContextMenu()
    
    // 如果是草稿邮件，弹出确认框
    if (isDraft) {
      try {
        await ElMessageBox.confirm(
          '删除草稿后将无法恢复，是否要删除？',
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
      } catch (error) {
        // 用户点击取消
        return
      }
    }
    
    emit('permanentDeleteEmails', [emailId])
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

function moveEmailToFolder(folderId: number) {
  if (contextMenu.value.email) {
    emit('moveEmails', { folderId, emailIds: [contextMenu.value.email.id] })
    hideContextMenu()
  }
}

// 计算邮件数量显示文本
const emailCountText = computed(() => {
  const totalCount = sortedEmails.value.length
  const unreadCount = sortedEmails.value.filter(email => !email.isRead).length
  
  // 如果正在搜索，显示搜索结果数量
  if (activeSearchCriteria.value) {
    return `(共 ${totalCount} 封)`
  }
  
  // 草稿箱不显示未读邮件数
  if (props.folderName === '草稿箱') {
    return `(共 ${totalCount} 封)`
  }
  
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
async function deleteSelectedEmails() {
  const ids = getCurrentEmailIds()
  if (ids.length === 0) return
  
  // 检查是否包含草稿邮件
  const isDraft = props.isDraftFolder || (selectedEmailDetail.value?.isDraft) || 
    selectedEmails.value.some(emailId => {
      // 优先从过滤列表中查找
      let email = filteredEmails.value.find(e => e.id === Number(emailId))
      if (!email) {
        email = props.emails.find(e => e.id === Number(emailId))
      }
      return email?.isDraft
    })
  
  // 如果是草稿邮件，弹出确认框
  if (isDraft) {
    try {
      await ElMessageBox.confirm(
        '删除草稿后将无法恢复，是否要删除？',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
    } catch (error) {
      // 用户点击取消
      return
    }
  }
  
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

// 回复邮件
function handleReply() {
  if (selectedEmailDetail.value) {
    emit('replyEmail', selectedEmailDetail.value.id)
  }
}

// 转发邮件
function handleForward() {
  if (selectedEmailDetail.value) {
    emit('forwardEmail', selectedEmailDetail.value.id)
    return
  }
  if (selectedEmails.value.length > 0) {
    const ids = selectedEmails.value.map(id => Number(id)).filter(n => !Number.isNaN(n))
    if (ids.length === 1) {
      emit('forwardEmail', ids[0])
      return
    }
    if (ids.length > 1) {
      emit('forwardEmail', ids)
      return
    }
  }
  emit('showMessage', { type: 'warning', message: '请先选择要转发的邮件' })
}

// 邮件详情操作
function viewEmailDetailWrapper(emailId: number) {
  // 优先从过滤后的邮件列表中查找（支持搜索结果）
  let localEmail = filteredEmails.value.find(email => email.id === emailId)
  
  // 如果过滤列表中没找到，再从原始列表中查找
  if (!localEmail) {
    localEmail = props.emails.find(email => email.id === emailId)
  }
  
  // 如果是草稿邮件，只触发跳转事件，不获取详情
  if (localEmail?.isDraft || props.folderName === '草稿箱') {
    emit('viewEmailDetail', emailId)
    return
  }
  
  if (localEmail) {
    setEmailDetailLoading(localEmail)
  }
  
  emit('getEmailDetail', emailId)
  emit('viewEmailDetail', emailId)
}


// 包装搜索函数以传递回调
async function handleQuickSearchWrapper() {
  await handleQuickSearch(() => emit('loadAllFoldersForSearch'))
  currentPage.value = 1
}

function clearQuickSearchWrapper() {
  clearQuickSearch()
  currentPage.value = 1
}

function handleBackFromSearchWrapper() {
  handleBackFromSearch()
  selectedEmails.value = []
  currentPage.value = 1
}

async function handleAdvancedSearchWrapper(criteria: SearchCriteria) {
  await handleAdvancedSearch(criteria, {
    loadAllFolders: () => emit('loadAllFoldersForSearch'),
    loadSpecificFolder: (folderKey: string) => emit('loadSpecificFolderForSearch', folderKey)
  })
  currentPage.value = 1
}

function handleAvatarError() {
  senderAvatar.value = ''
}

// 分页相关
const pageSize = ref(15)
const currentPage = ref(1)

// 排序后的邮件列表（按时间降序）
const sortedEmails = computed(() => {
  const emails = filteredEmails.value || []
  if (!emails.length) return []
  
  return [...emails].sort((a, b) => {
    // 使用原始的sendTime字段进行排序，确保最新的在最上面
    const aTime = a.sendTime || a.date || a.time
    const bTime = b.sendTime || b.date || b.time
    
    // 将时间字符串转换为Date对象进行比较
    const aDate = new Date(aTime)
    const bDate = new Date(bTime)
    
    // 降序排列：更新的时间在前面
    return bDate.getTime() - aDate.getTime()
  })
})

const totalPages = computed(() => Math.ceil(sortedEmails.value.length / pageSize.value))

// 计算当前页的邮件
const paginatedEmails = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedEmails.value.slice(start, end)
})

const groupedEmails = computed(() => {
  const emails = paginatedEmails.value || []
  if (!emails.length) return []
  
  const groups: Record<string, any[]> = {}
  emails.forEach(email => {
    if (!email) return
    
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
  
  // 日期分组标签：今天 -> 昨天 -> 本周 -> 上周 -> 更早
  const order = ['今天','昨天','本周','上周','更早']
  return order.map(label => ({ 
    label, 
    emails: groups[label] || []  // 邮件已在 sortedEmails 中排序，这里不需要再排序
  })).filter(g=>g.emails.length)
})

watch([() => props.emails, pageSize], () => {
  currentPage.value = 1
})

// 暴露方法给父组件调用
defineExpose({
  updateEmailDetail,
  closeEmailDetail
})

// 下载附件
function handleDownloadAttachment(att: { id: number; fileName: string }) {
  if (!att || !att.id) {
    return
  }
  try {
    downloadAttachment(att.id, att.fileName || '附件')
  } catch (e) {
    // 静默失败，由全局拦截处理
  }
}
</script>

<style>
/* 原始邮件标题行：与 write.vue 保持一致并增加灰色细线 */
.orig-mail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
}

.orig-mail-text {
  font-size: 12px;
  color: #909399;
  line-height: 1;
}

.orig-mail-divider {
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.original-mail-block .detail-attachments {
  padding: 0;
}

/* 邮件列表中的标签样式 */
.priority-tag,
.receipt-tag {
  margin-left: 6px;
  vertical-align: middle;
  display: inline-flex !important;
}

.priority-tag :deep(.el-tag__content),
.receipt-tag :deep(.el-tag__content) {
  line-height: 1;
}

/* 邮件详情中的设置标签区域 */
.detail-settings-tags {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-settings-tags :deep(.el-tag) {
  font-size: 12px;
}

/* 文件夹标签样式 */
.folder-tag {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 8px;
  font-size: 12px;
  color: #67c23a;
  background-color: #f0f9ff;
  border: 1px solid #b3e19d;
  border-radius: 3px;
  white-space: nowrap;
}

</style>
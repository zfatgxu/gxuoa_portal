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
              @keyup.enter="handleQuickSearch"
            />
            <span 
              v-if="quickSearchKeyword" 
              class="clear-search-icon" 
              @click="clearQuickSearch"
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
        <button class="tool-btn" v-if="!selectedEmailDetail && activeSearchCriteria" @click="handleBackFromSearch">← 返回</button>
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
        <div v-for="email in group.emails" :key="email.id" class="email-item" :class="{draft: email.isDraft, deleted: email.deletedAt, unread: !email.isDraft && folderName !== '草稿箱' && !email.isRead}" @click="viewEmailDetail(email.id)" @contextmenu.prevent="showContextMenu($event, email)">
          <input type="checkbox" class="email-checkbox" v-model="selectedEmails" :value="email.id" @click.stop />
          <span class="email-icon">✉️</span>
          <span class="sender">
            <template v-if="email.isDraft || email.isSelfSent">
              {{ formatRecipientsForList(email) }}
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

    <!-- 右键上下文菜单 -->
    <div v-if="contextMenu.visible" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
      <!-- 根据邮件状态显示不同的菜单选项 -->
      <div v-if="contextMenu.email && folderName !== '草稿箱' && !contextMenu.email.isRead && !(folderName === '星标邮件' && contextMenu.email.isDraft)" class="context-menu-item" @click="markAsRead">
        标记为已读
      </div>
      <div v-if="contextMenu.email && folderName !== '草稿箱' && contextMenu.email.isRead && !(folderName === '星标邮件' && contextMenu.email.isDraft)" class="context-menu-item" @click="markAsUnread">
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
        v-if="!isDeletedFolder && !isTrashFolder && !isDraftFolder && !(contextMenu.email && folderName === '星标邮件' && contextMenu.email.isDraft)"
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

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="showAdvancedSearch"
      @search="handleAdvancedSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import topImage from '@/views/mail/image/top.png'
import { getUserByIdCard } from '@/api/system/user'
import { formatFileSizeFromString, getFileExtension, downloadAttachment } from '@/api/mail/attachment'
import { getLetterDetail, sendReadReceipt } from '@/api/mail/letter'
import { useUserStore } from '@/store/modules/user'
import AdvancedSearchDialog, { type SearchCriteria } from './AdvancedSearchDialog.vue'
 

interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string
  sendTime?: string // 新增：原始发送时间用于排序
  deletedAt?: string
  isDraft?: boolean
  isStarred?: boolean
  starredAt?: string // 新增：星标日期字段
  content?: string // 新增：邮件内容字段
  isRead?: boolean // 新增：是否已读字段
  toMail?: string // 新增：收件人字段
  toRecipients?: string // 新增：主收件人字段
  ccRecipients?: string // 新增：抄送人字段
  bccRecipients?: string // 新增：密送人字段
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
  folderSource?: string // 新增：搜索结果中显示的文件夹来源标签
  hasAttachment?: boolean // 新增：是否有附件
}

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

// 邮件选择和操作相关
const selectedEmails = ref<(string|number)[]>([])
const markAsValue = ref('')
const moveToValue = ref('')

// 搜索相关
const quickSearchKeyword = ref('') // 快速搜索关键词
const showAdvancedSearch = ref(false) // 是否显示高级搜索弹窗
const activeSearchCriteria = ref<SearchCriteria | null>(null) // 当前激活的搜索条件
const isLoadingAllFolders = ref(false) // 是否正在加载所有文件夹
const allFoldersLoaded = ref(false) // 是否已加载所有文件夹

// 附件加载状态
const isLoadingAttachments = ref<boolean>(false)

// 邮件详情显示相关
const selectedEmailDetail = ref<Email | null>(null)
const senderAvatar = ref<string>('')
const avatarLoading = ref<boolean>(false)
const userDetailsCache = ref<Record<string, any>>({})
 

// 已读回执：记录已经显示过弹窗的邮件ID
const readReceiptShownIds = ref<Set<number>>(new Set())

// 获取用户信息
const userStore = useUserStore()

// 原始邮件详情（用于回复/转发时展示）
const originalMail = ref<null | {
  id: number
  subject: string
  fromUserName?: string
  toUserNames?: string
  toRecipients?: string
  ccRecipients?: string
  bccRecipients?: string
  sendTime?: string
  attachments?: any[]
}>(null)
const originalMailHtml = ref<string>('')

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
function viewEmailDetail(emailId: number) {
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
  
  selectedEmailDetail.value = null
  senderAvatar.value = ''
  avatarLoading.value = false
}


// 搜索相关函数
// 打开高级搜索弹窗
function handleOpenAdvancedSearch() {
  console.log('打开高级搜索弹窗')
  showAdvancedSearch.value = true
}

// 快速搜索（按回车触发）
async function handleQuickSearch() {
  if (quickSearchKeyword.value.trim()) {
    // 如果还没有加载所有文件夹，先触发加载
    if (!allFoldersLoaded.value && !isLoadingAllFolders.value) {
      isLoadingAllFolders.value = true
      emit('loadAllFoldersForSearch')
      // 等待一小段时间让父组件加载数据
      await new Promise(resolve => setTimeout(resolve, 100))
      allFoldersLoaded.value = true
      isLoadingAllFolders.value = false
    }
    
    activeSearchCriteria.value = {
      keyword: quickSearchKeyword.value.trim(),
      keywordLocation: '', // 全部位置
      sender: '',
      recipient: '',
      timeRange: '',
      folder: '',
      hasAttachment: '',
      readStatus: ''
    }
    currentPage.value = 1
  }
}

function clearQuickSearch() {
  quickSearchKeyword.value = ''
  activeSearchCriteria.value = null
  currentPage.value = 1
}

// 从搜索结果返回到先前的文件夹
function handleBackFromSearch() {
  quickSearchKeyword.value = ''
  activeSearchCriteria.value = null
  currentPage.value = 1
  selectedEmails.value = []
}

// 高级搜索（通过弹窗提交）
async function handleAdvancedSearch(criteria: SearchCriteria) {
  if (!criteria.folder) {
    // 没有指定文件夹，需要加载所有文件夹
    if (!allFoldersLoaded.value && !isLoadingAllFolders.value) {
      isLoadingAllFolders.value = true
      emit('loadAllFoldersForSearch')
      // 等待一小段时间让父组件加载数据
      await new Promise(resolve => setTimeout(resolve, 100))
      allFoldersLoaded.value = true
      isLoadingAllFolders.value = false
    }
  } else {
    // 指定了文件夹，需要确保该文件夹数据已加载
    const folderKey = criteria.folder
    if (!props.allFoldersEmails || !props.allFoldersEmails[folderKey] || props.allFoldersEmails[folderKey].length === 0) {
      // 该文件夹数据未加载，触发加载
      emit('loadSpecificFolderForSearch', folderKey)
      // 等待一小段时间让父组件加载数据
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  activeSearchCriteria.value = criteria
  currentPage.value = 1
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
    return '(收件人未填写)'
  }
  return recipients.join('、')
}

// 日期处理函数
function getDateLabel(dateStr: string) {
  // 获取今天的日期（只保留年月日，清零时分秒）
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 获取邮件的日期（只保留年月日，清零时分秒）
  const mailDate = new Date(dateStr)
  mailDate.setHours(0, 0, 0, 0)
  
  // 计算天数差（使用日期比较，而不是时间戳差值）
  const diffDays = Math.floor((today.getTime() - mailDate.getTime()) / 86400000)
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return '本周'
  if (diffDays < 14) return '上周'
  return '更早'  // 上周之后直接归为"更早"
}

// 邮件分组计算
// 分页相关
const pageSize = ref(15)
const currentPage = ref(1)

// 过滤后的邮件列表（根据搜索关键词和类型）
const filteredEmails = computed(() => {
  if (!activeSearchCriteria.value) {
    return props.emails
  }
  
  const criteria = activeSearchCriteria.value
  
  // 确定搜索范围：如果没有指定文件夹且提供了所有文件夹的邮件，则搜索所有文件夹
  let emailsToSearch: Email[] = props.emails
  
  if (!criteria.folder && props.allFoldersEmails) {
    // 没有指定文件夹，搜索所有文件夹（排除星标邮件文件夹）
    const emailMap = new Map<number, Email>()
    // 文件夹标签映射
    const folderLabels: Record<string, string> = {
      inbox: '收件箱',
      sent: '已发送',
      drafts: '草稿箱',
      deleted: '已删除',
      trash: '垃圾箱'
    }
    
    Object.entries(props.allFoldersEmails).forEach(([folderKey, folderEmails]) => {
      // 排除星标邮件文件夹
      if (folderKey === 'starred') {
        return
      }
      const folderLabel = folderLabels[folderKey] || ''
      folderEmails.forEach(email => {
        // 使用 Map 去重，同一封邮件只保留一次
        if (!emailMap.has(email.id)) {
          // 为邮件添加文件夹来源标签
          emailMap.set(email.id, {
            ...email,
            folderSource: folderLabel
          })
        }
      })
    })
    emailsToSearch = Array.from(emailMap.values())
  } else if (criteria.folder) {
    // 指定了文件夹，只搜索该文件夹，但也要添加文件夹标签
    const folderKey = criteria.folder
    const folderLabels: Record<string, string> = {
      inbox: '收件箱',
      sent: '已发送',
      drafts: '草稿箱',
      deleted: '已删除',
      trash: '垃圾箱'
    }
    const folderLabel = folderLabels[folderKey] || ''
    
    // 如果有 allFoldersEmails 且该文件夹已加载，使用该文件夹的数据
    // 否则使用当前 props.emails（假设用户在该文件夹中搜索）
    let folderEmails: Email[] = []
    if (props.allFoldersEmails && props.allFoldersEmails[folderKey]) {
      folderEmails = props.allFoldersEmails[folderKey]
    } else {
      // 使用当前文件夹的邮件
      folderEmails = props.emails
    }
    
    // 为每封邮件添加文件夹标签
    emailsToSearch = folderEmails.map(email => ({
      ...email,
      folderSource: folderLabel
    }))
  }
  
  return emailsToSearch.filter(email => {
    // 1. 关键字过滤
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase().trim()
      let keywordMatch = false
      
      if (criteria.keywordLocation) {
        // 指定位置搜索
        switch (criteria.keywordLocation) {
          case 'sender':
            keywordMatch = email.sender?.toLowerCase().includes(keyword) || false
            break
          case 'subject':
            keywordMatch = email.subject?.toLowerCase().includes(keyword) || false
            break
          case 'content':
            keywordMatch = email.content ? stripHtml(email.content).toLowerCase().includes(keyword) : false
            break
          case 'recipient':
            keywordMatch = email.toMail?.toLowerCase().includes(keyword) || false
            break
        }
      } else {
        // 全部位置搜索
        const senderMatch = email.sender?.toLowerCase().includes(keyword) || false
        const subjectMatch = email.subject?.toLowerCase().includes(keyword) || false
        const contentMatch = email.content ? stripHtml(email.content).toLowerCase().includes(keyword) : false
        const recipientMatch = email.toMail?.toLowerCase().includes(keyword) || false
        keywordMatch = senderMatch || subjectMatch || contentMatch || recipientMatch
      }
      
      if (!keywordMatch) return false
    }
    
    // 2. 发件人过滤
    if (criteria.sender) {
      const senderKeyword = criteria.sender.toLowerCase().trim()
      if (!email.sender?.toLowerCase().includes(senderKeyword)) {
        return false
      }
    }
    
    // 3. 收件人过滤
    if (criteria.recipient) {
      const recipientKeyword = criteria.recipient.toLowerCase().trim()
      if (!email.toMail?.toLowerCase().includes(recipientKeyword)) {
        return false
      }
    }
    
    // 4. 时间范围过滤
    if (criteria.timeRange) {
      const emailDate = new Date(email.date || email.sendTime || email.time)
      const now = new Date()
      
      // 自定义时间范围
      if (criteria.timeRange === 'custom' && criteria.customStartDate && criteria.customEndDate) {
        const startDate = new Date(criteria.customStartDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(criteria.customEndDate)
        endDate.setHours(23, 59, 59, 999)
        
        if (emailDate < startDate || emailDate > endDate) return false
      } else {
        // 预设时间范围
        switch (criteria.timeRange) {
          case 'oneDay':
            // 一天内（24小时）
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            if (emailDate < oneDayAgo) return false
            break
          case 'oneWeek':
            // 一周内（7天）
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (emailDate < oneWeekAgo) return false
            break
          case 'oneMonth':
            // 一个月内（30天）
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            if (emailDate < oneMonthAgo) return false
            break
          case 'sixMonths':
            // 六个月内（180天）
            const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
            if (emailDate < sixMonthsAgo) return false
            break
          case 'oneYear':
            // 一年内（365天）
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            if (emailDate < oneYearAgo) return false
            break
        }
      }
    }
    
    // 5. 附件过滤
    if (criteria.hasAttachment) {
      const hasAttachments = email.hasAttachment || false
      if (criteria.hasAttachment === 'true' && !hasAttachments) return false
      if (criteria.hasAttachment === 'false' && hasAttachments) return false
    }
    
    // 6. 已读/未读过滤
    if (criteria.readStatus) {
      if (criteria.readStatus === 'read' && !email.isRead) return false
      if (criteria.readStatus === 'unread' && email.isRead) return false
    }
    
    // 文件夹过滤已在上面的 emailsToSearch 选择中处理
    
    // 所有条件都通过
    return true
  })
})

// 排序后的邮件列表（按时间降序）
const sortedEmails = computed(() => {
  return [...filteredEmails.value].sort((a, b) => {
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
  const groups: Record<string, any[]> = {}
  paginatedEmails.value.forEach(email => {
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

// 邮件详情更新
async function updateEmailDetail(emailDetail: any) {
  if (emailDetail && selectedEmailDetail.value) {
    
    const currentDetail = selectedEmailDetail.value
    const rawContent = emailDetail.content?.content || emailDetail.content || ''
    const originalSendTime = emailDetail.content?.sendTime || emailDetail.sendTime || currentDetail.originalSendTime
    const hasAttachments = emailDetail.attachments && emailDetail.attachments.length > 0
    
    if (hasAttachments && !currentDetail.attachments?.length) {
      isLoadingAttachments.value = true
    }
    
    // 先解析收件人信息，按类型分组
    let parsedToRecipients = ''
    let parsedCcRecipients = ''
    let parsedBccRecipients = ''
    
    if (emailDetail.recipients && Array.isArray(emailDetail.recipients)) {
      // 按 recipientType 分组
      const toRecipients: string[] = []
      const ccRecipients: string[] = []
      const bccRecipients: string[] = []
      
      emailDetail.recipients.forEach((r: any) => {
        const idCard = r.recipientIdCard
        if (!idCard) return
        
        const recipientType = r.recipientType || 1 // 默认为主收件人
        if (recipientType === 1) {
          toRecipients.push(idCard)
        } else if (recipientType === 2) {
          ccRecipients.push(idCard)
        } else if (recipientType === 3) {
          bccRecipients.push(idCard)
        }
      })
      
      // 解析每组收件人的姓名
      try {
        if (toRecipients.length > 0) {
          parsedToRecipients = await parseRecipients(toRecipients.join(', '))
        }
        if (ccRecipients.length > 0) {
          parsedCcRecipients = await parseRecipients(ccRecipients.join(', '))
        }
        if (bccRecipients.length > 0) {
          parsedBccRecipients = await parseRecipients(bccRecipients.join(', '))
        }
      } catch (error) {
        // 忽略解析失败
      }
    }
    
    // 兼容旧数据：如果没有 recipients 数组，尝试使用 toMail
    let parsedToMail = currentDetail.toMail || '无'
    if (!parsedToRecipients && !parsedCcRecipients && !parsedBccRecipients) {
      const recipientsStr = emailDetail.toMail || ''
      if (recipientsStr && recipientsStr !== currentDetail.toMail) {
        try {
          parsedToMail = await parseRecipients(recipientsStr)
          parsedToRecipients = parsedToMail
        } catch (error) {
          parsedToMail = currentDetail.toMail || '无'
        }
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
      toRecipients: parsedToRecipients || undefined,
      ccRecipients: parsedCcRecipients || undefined,
      bccRecipients: parsedBccRecipients || undefined,
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

    // 如果是回复/转发场景，尝试加载原始邮件详情展示
    try {
      const maybeOriginalId = emailDetail.originalLetterId || emailDetail.content?.originalLetterId || emailDetail.content?.originalId
      if (maybeOriginalId) {
        const detail = await getLetterDetail(Number(maybeOriginalId))
        if (detail) {
          // 构造原始邮件展示数据
          const oSubject = (detail?.content?.subject) || (detail as any).subject || ''
          const oSendTime = detail?.content?.sendTime || ''
          originalMail.value = {
            id: Number(maybeOriginalId),
            subject: oSubject,
            fromUserName: '',
            toUserNames: '',
            sendTime: oSendTime,
            attachments: Array.isArray((detail as any).attachments) ? (detail as any).attachments : []
          }
          // 计算原始正文 HTML
          try {
            const c: any = (detail as any)?.content
            const html = (c && (c.content || c.html)) ? (c.content || c.html) : (typeof c === 'string' ? c : '')
            originalMailHtml.value = html || ''
          } catch { originalMailHtml.value = '' }

          // 发件人：从 senders 取第一个的身份证号查询姓名
          try {
            let firstSenderId = ''
            if (Array.isArray((detail as any).senders) && (detail as any).senders.length > 0) {
              firstSenderId = (detail as any).senders[0]?.senderIdCard || ''
            }
            if (firstSenderId) {
              const u = await getUserDetailByIdCard(firstSenderId)
              if (originalMail.value) originalMail.value.fromUserName = (u && u.nickname) ? u.nickname : ''
            }
          } catch {}

          // 收件人：从 recipients[].recipientIdCard 获取姓名并拼接，按类型分组
          try {
            const recipientsArr = (detail as any)?.recipients
            if (Array.isArray(recipientsArr) && recipientsArr.length > 0) {
              const toNames: string[] = []
              const ccNames: string[] = []
              const bccNames: string[] = []
              
              for (const r of recipientsArr) {
                const idCard = (r?.recipientIdCard || '').toString().trim()
                const recipientType = r?.recipientType || 1
                if (idCard) {
                  const u = await getUserDetailByIdCard(idCard)
                  const displayName = u?.nickname || idCard
                  
                  if (recipientType === 1) {
                    toNames.push(displayName)
                  } else if (recipientType === 2) {
                    ccNames.push(displayName)
                  } else if (recipientType === 3) {
                    bccNames.push(displayName)
                  }
                }
              }
              if (originalMail.value) {
                originalMail.value.toUserNames = toNames.join('、')
                originalMail.value.toRecipients = toNames.join('、') || undefined
                originalMail.value.ccRecipients = ccNames.join('、') || undefined
                originalMail.value.bccRecipients = bccNames.join('、') || undefined
              }
            }
          } catch {}
        }
      } else {
        originalMail.value = null
        originalMailHtml.value = ''
      }
    } catch (e) {
      originalMail.value = null
      originalMailHtml.value = ''
    }
    
    // 检查是否需要显示已读回执弹窗
    const letterId = emailDetail.id || emailDetail.content?.id
    const requestReadReceipt = emailDetail.content?.requestReadReceipt
    
    if (letterId && requestReadReceipt && !readReceiptShownIds.value.has(letterId)) {
      // 检查当前用户是否是发件人
      const currentUserIdCard = userStore.getUser?.idCard
      const senders = emailDetail.senders || []
      const isSender = senders.some((sender: any) => sender.senderIdCard === currentUserIdCard)
      
      // 如果当前用户是发件人，不显示回执弹窗
      if (isSender) {
        // 标记为已显示，避免下次还判断
        readReceiptShownIds.value.add(letterId)
        return
      }
      
      // 检查当前用户是否是主收件人（recipientType=1）
      // 只有主收件人才需要发送已读回执，抄送人和密送人不需要
      const recipients = emailDetail.recipients || []
      const isMainRecipient = recipients.some((recipient: any) => 
        recipient.recipientIdCard === currentUserIdCard && recipient.recipientType === 1
      )
      
      if (!isMainRecipient) {
        // 当前用户不是主收件人，不显示回执弹窗
        readReceiptShownIds.value.add(letterId)
        return
      }
      
      // 标记为已显示，避免重复弹窗
      readReceiptShownIds.value.add(letterId)
      
      // 延迟一下显示弹窗，让邮件内容先加载完成
      setTimeout(async () => {
        try {
          await ElMessageBox.confirm(
            '发件人请求已读回执。是否向发件人发送已读回执通知？',
            '已读回执',
            {
              confirmButtonText: '发送',
              cancelButtonText: '不发送',
              type: 'info',
              distinguishCancelAndClose: true
            }
          )
          
          // 用户同意发送回执
          try {
            await sendReadReceipt(letterId)
            ElMessage.success('已发送已读回执')
          } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || '发送已读回执失败'
            ElMessage.error(errorMsg)
          }
        } catch (action) {
          // 用户取消或关闭弹窗，不做任何操作
          if (action === 'cancel') {
            ElMessage.info('已取消发送已读回执')
          }
        }
      }, 500)
    }
  }
}

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

<style scoped>
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
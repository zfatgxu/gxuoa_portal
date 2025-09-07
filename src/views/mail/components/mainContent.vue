<template>
  <div class="main-content">
    <div class="header">
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
        <input type="checkbox" v-model="allSelected" class="select-all-checkbox" title="全选/取消全选" />
        <span class="toolbar-inbox-label">
          {{ folderName }}
        </span>
        <button class="tool-btn" @click="deleteSelectedEmails" :disabled="selectedEmails.length === 0">
          {{ isDeletedFolder ? '彻底删除' : '删除' }}
        </button>
        <button class="tool-btn" @click="permanentDeleteSelectedEmails" :disabled="selectedEmails.length === 0">
          彻底删除
        </button>
        <button class="tool-btn">
          转发
        </button>
        <button class="tool-btn" @click="markAllAsRead">
          全部标记为已读
        </button>
        <select class="tool-select" v-model="markAsValue" @change="handleMarkAsChange">
          <option value="" disabled selected style="display: none;">标记为...</option>
          <option value="read">已读邮件</option>
          <option value="unread">未读邮件</option>
          <option value="star">星标邮件</option>
          <option value="unstar">取消星标</option>
        </select>
        <select class="tool-select">
          <option>移动...</option>
        </select>
      </div>
      <div class="toolbar-right">
        <span class="email-count">{{ emailCountText }} ⬇</span>
        <span class="refresh-icon" @click="$emit('syncMails')" style="cursor: pointer" title="同步邮件">🔄</span>
      </div>
    </div>

    <!-- 邮件列表分组显示 -->
    <div class="email-list">
      <template v-for="group in groupedEmails" :key="group.label">
        <div class="group-label-bar">
          <span class="group-label">{{ group.label }}({{ group.emails.length }}封)</span>
        </div>
        <div v-for="email in group.emails" :key="email.id" class="email-item" :class="{draft: email.isDraft, deleted: email.deletedAt, unread: !email.isRead}" @click="viewEmailDetail(email.id)">
          <input type="checkbox" class="email-checkbox" v-model="selectedEmails" :value="email.id" @click.stop />
          <span class="email-icon">{{ email.isDraft ? '📝' : email.deletedAt ? '🗑️' : '📁' }}</span>
          <span class="sender">{{ email.sender }}</span>
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
    <!-- 分页 -->
    <div class="pagination">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import topImage from '@/views/mail/image/top.png'

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
}

const props = defineProps<{ 
  folderName: string, 
  emails: Array<Email>,
  isDeletedFolder: boolean,
  mailStats?: {
    totalCount: number,
    totalUnreadCount: number,
    inboxUnreadCount: number
  }
}>()

const emit = defineEmits<{
  deleteEmails: [emailIds: number[]]
  permanentDeleteEmails: [emailIds: number[]]
  markEmails: [data: { action: string, emailIds: number[] }]
  showMessage: [data: { type: string, message: string }]
  toggleStar: [emailId: number]
  syncMails: []
  viewEmailDetail: [emailId: number]
}>()

// --- 全选逻辑 ---
const selectedEmails = ref<(string|number)[]>([])
const markAsValue = ref('')
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
})

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
  if (selectedEmails.value.length > 0) {
    const emailIds = selectedEmails.value.map(id => Number(id))
    emit('deleteEmails', emailIds)
    selectedEmails.value = []
  }
}

// 彻底删除选中的邮件
function permanentDeleteSelectedEmails() {
  if (selectedEmails.value.length > 0) {
    const emailIds = selectedEmails.value.map(id => Number(id))
    emit('permanentDeleteEmails', emailIds)
    selectedEmails.value = []
  }
}

// 处理标记为操作
function handleMarkAsChange() {
  if (markAsValue.value && markAsValue.value !== '') {
    if (selectedEmails.value.length > 0) {
      const emailIds = selectedEmails.value.map(id => Number(id))
      emit('markEmails', { action: markAsValue.value, emailIds })
      markAsValue.value = '' // 重置选择
      selectedEmails.value = [] // 自动取消邮件选择
    } else {
      // 如果没有选中邮件，显示提示并重置选择
      emit('showMessage', { type: 'warning', message: '请先选择要标记的邮件' })
      markAsValue.value = '' // 重置选择
    }
  }
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
  emit('viewEmailDetail', emailId)
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
const pagedEmails = computed(() => {
  // 按日期和时间升序排列；根据文件夹类型选择排序依据
  const sorted = [...props.emails].sort((a, b) => {
    if (props.isDeletedFolder) {
      const aDate = a.deletedAt || a.date
      const bDate = b.deletedAt || b.date
      if (aDate !== bDate) return aDate.localeCompare(bDate)
      return a.time.localeCompare(b.time)
    } else if (props.folderName === '星标邮件') {
      const aDate = a.starredAt || a.date
      const bDate = b.starredAt || b.date
      if (aDate !== bDate) return aDate.localeCompare(bDate)
      return a.time.localeCompare(b.time)
    }
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.time.localeCompare(b.time)
  })
  const start = (currentPage.value - 1) * pageSize.value
  return sorted.slice(start, start + pageSize.value)
})
watch([() => props.emails, pageSize], () => {
  currentPage.value = 1
})
</script>

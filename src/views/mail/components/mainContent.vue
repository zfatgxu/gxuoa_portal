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
          <span class="inbox-toolbar-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 6l5-4 5 4"/>
              <path d="M3 11h14"/>
              <path d="M3 15h14"/>
            </svg>
          </span>
        </span>
        <button class="tool-btn" @click="deleteSelectedEmails" :disabled="selectedEmails.length === 0">
          <span class="tool-btn-icon">
            <el-icon><Delete /></el-icon>
          </span>
          {{ isDeletedFolder ? '彻底删除' : '删除' }}
        </button>
        <button class="tool-btn">
          <span class="tool-btn-icon">
            <!-- 转发：极简带右上角箭头的方框 -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
          </span>
          转发
        </button>
        <button class="tool-btn">
          <span class="tool-btn-icon">
            <!-- 全部标记为已读：信封 -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 16 16">
              <path d="M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.817l5.75 3.45L8 8.917l1.25.75L15 6.217V5.4a1 1 0 0 0-.53-.882l-6-3.2ZM15 7.383l-4.778 2.867L15 13.117V7.383Zm-.035 6.88L8 10.082l-6.965 4.18A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738ZM1 13.116l4.778-2.867L1 7.383v5.734Z"/>
            </svg>
          </span>
          全部标记为已读
        </button>
        <select class="tool-select">
          <option>标记为...</option>
        </select>
        <select class="tool-select">
          <option>移动...</option>
        </select>
      </div>
      <div class="toolbar-right">
        <span class="email-count">共{{ emails.length }}封 ⬇</span>
        <span class="refresh-icon" @click="$emit('syncMails')" style="cursor: pointer" title="同步邮件">🔄</span>
      </div>
    </div>

    <!-- 邮件列表分组显示 -->
    <div class="email-list">
      <template v-for="group in groupedEmails" :key="group.label">
        <div class="group-label-bar">
          <span class="group-label">{{ group.label }}({{ group.emails.length }}封)</span>
        </div>
        <div v-for="email in group.emails" :key="email.id" class="email-item" :class="{draft: email.isDraft, deleted: email.deletedAt}" @click="viewEmailDetail(email.id)">
          <input type="checkbox" class="email-checkbox" v-model="selectedEmails" :value="email.id" @click.stop />
          <span class="email-icon">{{ email.isDraft ? '📝' : email.deletedAt ? '🗑️' : '📁' }}</span>
          <span class="sender">{{ email.sender }}</span>
          <span class="subject">
            {{ email.subject }}
            <span v-if="email.isDraft" class="draft-label">[草稿]</span>
            <span v-if="email.deletedAt" class="deleted-info">(删除于: {{ email.deletedAt }})</span>
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
import { ElIcon } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
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
}

const props = defineProps<{ 
  folderName: string, 
  emails: Array<Email>,
  isDeletedFolder: boolean
}>()

const emit = defineEmits<{
  deleteEmails: [emailIds: number[]]
  toggleStar: [emailId: number]
  syncMails: []
  viewEmailDetail: [emailId: number]
}>()

// --- 全选逻辑 ---
const selectedEmails = ref<(string|number)[]>([])
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

// 删除选中的邮件
function deleteSelectedEmails() {
  if (selectedEmails.value.length > 0) {
    const emailIds = selectedEmails.value.map(id => Number(id))
    emit('deleteEmails', emailIds)
    selectedEmails.value = []
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

<template>
  <div class="main-content">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="toolbar-inbox-label">
          {{ folderName }}
          <span class="inbox-toolbar-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align: middle;">
              <g fill="none" stroke="#222" stroke-width="1.5">
                <path d="M3 16V8.5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1V16"/>
                <path d="M2 16h16"/>
                <path d="M7 10v2a3 3 0 0 0 6 0v-2"/>
              </g>
            </svg>
          </span>
        </span>
        <button class="tool-btn">
          <span class="tool-btn-icon">
            <el-icon><Delete /></el-icon>
          </span>
          删除
        </button>
        <button class="tool-btn">
          <span class="tool-btn-icon">
            <!-- 转发：极简带右上角箭头的方框 -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="7" width="10" height="10" rx="2"/>
              <path d="M15 9l4-4"/>
              <path d="M19 5v6h-6"/>
            </svg>
          </span>
          转发
        </button>
        <button class="tool-btn">
          <span class="tool-btn-icon">
            <!-- 全部标记为已读：信封 -->
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="12" height="8" rx="2"/>
              <path d="M3 5l6 5l6-5"/>
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
        <span class="refresh-icon">🔄</span>

      </div>
    </div>

    <!-- 邮件列表 -->
    <div class="email-list">
      <div class="email-item" v-for="email in pagedEmails" :key="email.id">
        <input type="checkbox" class="email-checkbox" />
        <span class="email-icon">📁</span>
        <span class="sender">{{ email.sender }}</span>
        <span class="subject">{{ email.subject }}</span>
        <span class="time">{{ email.time }}</span>
        <span class="star-btn">☆</span>
      </div>
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
import { ref,  watch } from 'vue'
import { ElIcon } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{ folderName: string, emails: Array<{ id: number, sender: string, subject: string, time: string, date: string }> }>()

// 日期分组辅助
import { computed } from 'vue'
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
    const label = getDateLabel(email.date)
    if (!groups[label]) groups[label] = []
    groups[label].push(email)
  })
  // 分组排序
  const order = ['今天','昨天','本周','上周','上月','今年','更早']
  return order.map(label => ({ label, emails: (groups[label]||[]).sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time)) })).filter(g=>g.emails.length)
})

const pageSize = ref(15)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.emails.length / pageSize.value))
const pagedEmails = computed(() => {
  // 按日期和时间升序排列
  const sorted = [...props.emails].sort((a, b) => {
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

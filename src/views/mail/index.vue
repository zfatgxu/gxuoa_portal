<template>
  <div class="mail-container">
    <!-- 顶部标题栏 -->
    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 顶部按钮区域 -->
        <div class="sidebar-top">
          <button class="compose-btn">
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
            <span class="folder-name">收件箱</span><span class="folder-badge">1</span>
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainContent from './components/mainContent.vue'
import { ref, computed, reactive } from 'vue'
import '@/views/mail/mail.css'

interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string // 新增日期字段 yyyy-MM-dd
  deletedAt?: string // 新增：删除时间字段
  isDraft?: boolean // 新增：是否为草稿
  isStarred?: boolean // 新增：是否已星标
  starredAt?: string // 新增：星标日期字段
}

// 使用 mockjs 生成 50 条以上假数据
import Mock from 'mockjs'

function genEmails(folder: string, count: number): Email[] {
  // 生成分布在不同时间段的日期
  const today = new Date()
  function formatDate(d: Date) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
  }
  // 四类日期分布
  const buckets = [
    { label: '今天', offset: () => 0 },
    { label: '昨天', offset: () => -1 },
    { label: '一周内', offset: () => -Math.floor(Math.random()*5)-2 }, // 随机-2~-6天
    { label: '一周前', offset: () => -Math.floor(Math.random()*20)-7 } // 随机-7~-26天
  ]
  return Array.from({length: count}).map((_, i) => {
    let bucketIdx
    const r = Math.random()
    if (r < 0.15) bucketIdx = 0 // 今天
    else if (r < 0.3) bucketIdx = 1 // 昨天
    else if (r < 0.7) bucketIdx = 2 // 一周内
    else bucketIdx = 3 // 一周前
    const offset = buckets[bucketIdx].offset()
    const date = formatDate(new Date(today.getTime() + offset*86400000))
    
    const email: Email = {
      id: i+1,
      sender: folder === 'sent' ? '我' : Mock.Random.cname(),
      subject: `${folder === 'inbox' ? '收件箱' : folder === 'starred' ? '星标' : folder === 'drafts' ? '草稿' : folder === 'deleted' ? '已删除' : '已发送'}邮件 - ` + Mock.Random.ctitle(8, 20),
      time: Mock.Random.time('HH:mm'),
      date,
      isStarred: folder === 'starred' ? true : Math.random() < 0.2 // 星标邮件默认已星标，其他20%概率星标
    }
    
    // 为草稿邮件添加标记
    if (folder === 'drafts') {
      email.isDraft = true
    }
    
    // 为已删除邮件添加删除时间（随机1-25天前删除）
    if (folder === 'deleted') {
      const deletedDaysAgo = Math.floor(Math.random() * 25) + 1
      email.deletedAt = formatDate(new Date(today.getTime() - deletedDaysAgo * 86400000))
    }
    
    // 为星标邮件添加星标时间（随机1-30天前星标）
    if (email.isStarred) {
      const starredDaysAgo = Math.floor(Math.random() * 30) + 1
      email.starredAt = formatDate(new Date(today.getTime() - starredDaysAgo * 86400000))
    }
    
    return email
  })
}

// 过滤30天内的已删除邮件
function filterValidDeletedEmails(emails: Email[]): Email[] {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000)
  
  return emails.filter(email => {
    if (!email.deletedAt) return true
    const deletedDate = new Date(email.deletedAt)
    return deletedDate >= thirtyDaysAgo
  })
}

const allEmails = reactive<Record<string, Email[]>>({
  inbox: genEmails('inbox', 60),
  starred: genEmails('starred', 55),
  sent: genEmails('sent', 52),
  drafts: genEmails('drafts', 15),
  deleted: filterValidDeletedEmails(genEmails('deleted', 25))
})

const folderLabels: Record<string, string> = {
  inbox: '收件箱',
  starred: '星标邮件',
  sent: '已发送',
  drafts: '草稿箱',
  deleted: '已删除'
}

const selectedFolder = ref('inbox')
function selectFolder(folder: string) {
  selectedFolder.value = folder
}

// 处理删除邮件
function handleDeleteEmails(emailIds: number[]) {
  const today = new Date()
  const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0')
  
  emailIds.forEach(emailId => {
    // 从当前文件夹中移除邮件
    const currentEmails = allEmails[selectedFolder.value]
    const emailIndex = currentEmails.findIndex(email => email.id === emailId)
    
    if (emailIndex !== -1) {
      const email = currentEmails[emailIndex]
      // 如果不是已删除文件夹，则移动到已删除文件夹
      if (selectedFolder.value !== 'deleted') {
        email.deletedAt = todayStr
        // 从当前文件夹移除
        currentEmails.splice(emailIndex, 1)
        // 添加到已删除文件夹
        allEmails.deleted.push(email)
      } else {
        // 如果已经在已删除文件夹，则永久删除
        currentEmails.splice(emailIndex, 1)
      }
    }
  })
}

// 处理星标切换
function handleToggleStar(emailId: number) {
  const today = new Date()
  const todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0')
  
  // 在所有文件夹中查找并更新邮件的星标状态
  Object.keys(allEmails).forEach(folderKey => {
    const email = allEmails[folderKey].find(e => e.id === emailId)
    if (email) {
      email.isStarred = !email.isStarred
      
      // 如果设置为星标，记录星标时间
      if (email.isStarred) {
        email.starredAt = todayStr
        // 如果不在星标文件夹中，则添加到星标文件夹
        if (folderKey !== 'starred') {
          const existsInStarred = allEmails.starred.some(e => e.id === emailId)
          if (!existsInStarred) {
            allEmails.starred.push({...email})
          }
        }
      } else {
        // 如果取消星标，清除星标时间
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
}

// 获取草稿箱邮件数量
function getDraftCount(): number {
  return allEmails.drafts?.length || 0
}

// 获取已删除邮件数量（30天内）
function getDeletedCount(): number {
  return allEmails.deleted?.length || 0
}

// 获取星标邮件数量
function getStarredCount(): number {
  return allEmails.starred?.length || 0
}

// 获取已发送邮件数量
function getSentCount(): number {
  return allEmails.sent?.length || 0
}

// 定期清理30天前的已删除邮件（可选：在实际应用中应该由后端定时任务处理）
function cleanupOldDeletedEmails() {
  allEmails.deleted = filterValidDeletedEmails(allEmails.deleted)
}

// 每小时检查一次（在实际应用中不需要这么频繁）
setInterval(cleanupOldDeletedEmails, 3600000)
</script>

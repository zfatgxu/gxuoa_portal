<template>
  <div class="mail-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="header-left header-left-icons">
  <span class="header-icon header-icon--bl">
    <svg width="1.5em" height="1.5em" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="16" rx="4" fill="#2196f3"/>
      <path d="M4 8l12 10l12-10" stroke="#fff" stroke-width="2" fill="none"/>
    </svg>
  </span>
  <span class="header-title">内部邮件</span>
  <span class="header-icon header-icon--tr">
    <svg width="1.5em" height="1.5em" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="8" width="24" height="16" rx="4" fill="#ffa726"/>
      <path d="M4 8l12 10l12-10" stroke="#fff" stroke-width="2" fill="none"/>
    </svg>
  </span>
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

    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 顶部按钮区域 -->
        <div class="sidebar-top">
          <button class="compose-btn active">
            <span class="icon">✏️</span>
            写信
          </button>
          <button class="inbox-btn">
            <span class="icon">📥</span>
            收件箱
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
    <span class="folder-name">星标邮件</span>
  </div>
  <div class="folder-item" :class="{active: selectedFolder==='sent'}" @click="selectFolder('sent')">
    <span class="folder-icon">
      <!-- 纸飞机SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="2,18 18,10 2,2 5,10 2,18" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
    <span class="folder-name">已发送</span>
  </div>
  <div class="folder-item">
    <span class="folder-icon">
      <!-- 文件夹SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="10" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l6-4 4 4h6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
    </span>
    <span class="folder-name">草稿箱</span><span class="folder-badge">4</span>
  </div>
  <div class="folder-item">
    <span class="folder-icon">
      <!-- 垃圾桶SVG -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="7" width="10" height="9" rx="2" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M3 7h14" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M8 10v3" stroke="#ff9800" stroke-width="1.2"/><path d="M12 10v3" stroke="#ff9800" stroke-width="1.2"/></svg>
    </span>
    <span class="folder-name">已删除</span>
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
      <MainContent :folderName="folderLabels[selectedFolder]" :emails="allEmails[selectedFolder]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainContent from './components/mainContent.vue'
import { ref } from 'vue'
import '@/views/mail/mail.css'

interface Email {
  id: number
  sender: string
  subject: string
  time: string
  date: string // 新增日期字段 yyyy-MM-dd
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
    return {
      id: i+1,
      sender: folder === 'sent' ? '我' : Mock.Random.cname(),
      subject: `${folder === 'inbox' ? '收件箱' : folder === 'starred' ? '星标' : '已发送'}邮件 - ` + Mock.Random.ctitle(8, 20),
      time: Mock.Random.time('HH:mm'),
      date
    }
  })
}

const allEmails: Record<string, Email[]> = {
  inbox: genEmails('inbox', 60),
  starred: genEmails('starred', 55),
  sent: genEmails('sent', 52)
}


const folderLabels: Record<string, string> = {
  inbox: '收件箱',
  starred: '星标邮件',
  sent: '已发送'
}

const selectedFolder = ref('inbox')
function selectFolder(folder: string) {
  selectedFolder.value = folder
}
</script>
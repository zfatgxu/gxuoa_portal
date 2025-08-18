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

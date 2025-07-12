<template>
  <div class="email-app">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Logo/Header -->
      <div class="sidebar-header">
        <div class="logo">
          <i class="icon-mail"></i>
          <span class="logo-text">内部邮</span>
        </div>
      </div>

      <!-- Compose Button -->
      <div class="compose-section">
        <button class="compose-btn">
          <i class="icon-edit"></i>
          写信
        </button>
        <button class="inbox-btn">
          <i class="icon-inbox"></i>
          收信
        </button>
      </div>

      <!-- Folder List -->
      <div class="folder-list">
        <div class="folder-item" :class="{ active: activeFolder === 'inbox' }" @click="setActiveFolder('inbox')">
          <i class="icon-folder"></i>
          <span>收件箱</span>
          <span class="count">(1)</span>
        </div>
        <div class="folder-item important" :class="{ active: activeFolder === 'important' }" @click="setActiveFolder('important')">
          <i class="icon-star"></i>
          <span>重要邮件</span>
          <i class="star-icon">★</i>
        </div>
        <div class="folder-item" :class="{ active: activeFolder === 'sent' }" @click="setActiveFolder('sent')">
          <i class="icon-sent"></i>
          <span>已发送</span>
        </div>
        <div class="folder-item" :class="{ active: activeFolder === 'drafts' }" @click="setActiveFolder('drafts')">
          <i class="icon-folder"></i>
          <span>草稿箱</span>
          <span class="count">(4)</span>
        </div>
        <div class="folder-item" :class="{ active: activeFolder === 'deleted' }" @click="setActiveFolder('deleted')">
          <i class="icon-folder"></i>
          <span>已删除</span>
        </div>
        <div class="folder-item" :class="{ active: activeFolder === 'spam' }" @click="setActiveFolder('spam')">
          <i class="icon-folder"></i>
          <span>垃圾邮件</span>
          <span class="count">(8)</span>
        </div>
        <div class="folder-item" :class="{ active: activeFolder === 'custom' }" @click="setActiveFolder('custom')">
          <i class="icon-folder"></i>
          <span>我的文件夹</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <div class="title-dropdown">
            <select v-model="selectedMailbox" class="mailbox-selector">
              <option value="inbox">收件箱</option>
              <option value="sent">已发送</option>
              <option value="starred">星标邮件</option>
            </select>
          </div>
        </div>
        <div class="header-right">
          <div class="search-box">
            <i class="icon-search"></i>
            <input type="text" placeholder="搜索" v-model="searchQuery" />
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary">
            <i class="icon-edit"></i>
            写信
          </button>
          <button class="btn">
            <i class="icon-checkbox"></i>
            已发送 ⏫
          </button>
          <button class="btn">
            <i class="icon-delete"></i>
            删除
          </button>
          <button class="btn">
            <i class="icon-forward"></i>
            转发
          </button>
          <button class="btn">
            <i class="icon-mark-read"></i>
            全部标记为已读
          </button>
          <select class="dropdown">
            <option>操作...</option>
          </select>
          <select class="dropdown">
            <option>移动到...</option>
          </select>
        </div>
        <div class="toolbar-right">
          <span class="email-count">共745封 ⏫</span>
          <i class="icon-refresh"></i>
        </div>
      </div>

      <!-- Email List -->
      <div class="email-list">
        <!-- Today Section -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">今天 (2封)</span>
          </div>
          <div class="email-item" v-for="email in todayEmails" :key="email.id" @click="selectEmail(email)">
            <input type="checkbox" class="email-checkbox" v-model="email.selected" />
            <i class="email-icon icon-folder"></i>
            <div class="email-content">
              <div class="email-sender">{{ email.sender }}</div>
              <div class="email-subject">{{ email.subject }}</div>
            </div>
            <div class="email-time">{{ email.time }}</div>
            <i class="star-icon" :class="{ starred: email.starred }" @click.stop="toggleStar(email)">☆</i>
          </div>
        </div>

        <!-- Yesterday Section -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">昨天 (1封)</span>
          </div>
          <div class="email-item" v-for="email in yesterdayEmails" :key="email.id" @click="selectEmail(email)">
            <input type="checkbox" class="email-checkbox" v-model="email.selected" />
            <i class="email-icon icon-attachment"></i>
            <div class="email-content">
              <div class="email-sender">{{ email.sender }}</div>
              <div class="email-subject">{{ email.subject }}</div>
            </div>
            <div class="email-time">{{ email.time }}</div>
            <i class="star-icon" :class="{ starred: email.starred }" @click.stop="toggleStar(email)">☆</i>
          </div>
        </div>

        <!-- Monday Section -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">周一 (2封)</span>
          </div>
          <div class="email-item" v-for="email in mondayEmails" :key="email.id" @click="selectEmail(email)">
            <input type="checkbox" class="email-checkbox" v-model="email.selected" />
            <i class="email-icon icon-attachment"></i>
            <div class="email-content">
              <div class="email-sender">{{ email.sender }}</div>
              <div class="email-subject">{{ email.subject }}</div>
            </div>
            <div class="email-time">{{ email.time }}</div>
            <i class="star-icon" :class="{ starred: email.starred }" @click.stop="toggleStar(email)">☆</i>
          </div>
        </div>

        <!-- Sunday Section -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">周日 (1封)</span>
          </div>
          <div class="email-item" v-for="email in sundayEmails" :key="email.id" @click="selectEmail(email)">
            <input type="checkbox" class="email-checkbox" v-model="email.selected" />
            <i class="email-icon icon-attachment"></i>
            <div class="email-content">
              <div class="email-sender">{{ email.sender }}</div>
              <div class="email-subject">{{ email.subject }}</div>
            </div>
            <div class="email-time">{{ email.time }}</div>
            <i class="star-icon" :class="{ starred: email.starred }" @click.stop="toggleStar(email)">☆</i>
          </div>
        </div>

        <!-- Last Week Section -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">上周 (19封)</span>
          </div>
          <div class="email-item" v-for="email in lastWeekEmails" :key="email.id" @click="selectEmail(email)">
            <input type="checkbox" class="email-checkbox" v-model="email.selected" />
            <i class="email-icon icon-attachment"></i>
            <div class="email-content">
              <div class="email-sender">{{ email.sender }}</div>
              <div class="email-subject">{{ email.subject }}</div>
            </div>
            <div class="email-time">{{ email.time }}</div>
            <i class="star-icon" :class="{ starred: email.starred }" @click.stop="toggleStar(email)">☆</i>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <div class="pagination-right">
          <div class="pagination-numbers">
            <button class="pagination-btn" @click="previousPage">‹</button>
            <button class="pagination-btn active" @click="goToPage(1)">1</button>
            <button class="pagination-btn" @click="goToPage(2)">2</button>
            <button class="pagination-btn" @click="goToPage(3)">3</button>
            <button class="pagination-btn" @click="goToPage(4)">4</button>
            <button class="pagination-btn" @click="goToPage(5)">5</button>
            <span class="pagination-dots">...</span>
            <button class="pagination-btn" @click="nextPage">›</button>
          </div>
          <div class="pagination-actions">
            <span class="pagination-text">7条/页</span>
            <button class="pagination-action-btn">首页</button>
            <button class="pagination-action-btn">上一页</button>
            <button class="pagination-action-btn primary">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import '@/views/mail/mail.css'
interface Email {
  id: number
  sender: string
  subject: string
  time: string
  selected: boolean
  starred: boolean
}

const activeFolder = ref('inbox')
const searchQuery = ref('')
const currentPage = ref(1)
const selectedMailbox = ref('inbox')

const todayEmails = reactive<Email[]>([
  {
    id: 1,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  },
  {
    id: 2,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  }
])

const yesterdayEmails = reactive<Email[]>([
  {
    id: 3,
    sender: '888',
    subject: '777 动态信风飞(6ewgqrgeabatbnhrrfnnsfdbraferfhgatfbdsnfgnarfgaergsbfgfsgazzdfbsbnfgnbgcdsbgftg...',
    time: '10:30',
    selected: false,
    starred: false
  }
])

const mondayEmails = reactive<Email[]>([
  {
    id: 4,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  },
  {
    id: 5,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  }
])

const sundayEmails = reactive<Email[]>([
  {
    id: 6,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  }
])

const lastWeekEmails = reactive<Email[]>([
  {
    id: 7,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  },
  {
    id: 8,
    sender: '宇体库字体库',
    subject: '思源黑体字体字 sdfbtgbnrsntynrstydtbhtdtr周天晚gdbfbsfgafbvrgastbfdqfgbntsgbndfnhhgdnbkbt...',
    time: '20:30',
    selected: false,
    starred: false
  }
])

const setActiveFolder = (folder: string) => {
  activeFolder.value = folder
}

const selectEmail = (email: Email) => {
  console.log('Selected email:', email)
}

const toggleStar = (email: Email) => {
  email.starred = !email.starred
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}
</script>

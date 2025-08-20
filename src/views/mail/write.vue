<template>
  <div class="mail-container">
    <!-- 主体内容区 -->
    <div class="content-wrapper">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 顶部按钮区域 -->
        <div class="sidebar-top">
          <button class="compose-btn active">
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
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 信箱SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="3" stroke="#ff9800" stroke-width="1.5" fill="none"/><path d="M2 6l8 6 8-6" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">收件箱</span><span class="folder-badge">1</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">
              <!-- 星标SVG -->
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12,7.5 18,7.5 13,11.5 15,17 10,13.5 5,17 7,11.5 2,7.5 8,7.5" stroke="#ff9800" stroke-width="1.5" fill="none"/></svg>
            </span>
            <span class="folder-name">星标邮件</span>
          </div>
          <div class="folder-item">
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
            <div class="tool-btn primary" @click="sendMail">
              <el-icon><Position /></el-icon>
              <span>发送</span>
            </div>
            <div class="tool-btn">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </div>
            <div class="tool-btn">
              <el-icon><Files /></el-icon>
              <span>附件</span>
            </div>

            <div class="tool-btn">
              <el-icon><Files /></el-icon>
              <span>超大附件</span>
            </div>
            <el-dropdown trigger="click">
              <div class="tool-btn">
                <el-icon><Setting /></el-icon>
                <span>发信设置</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>定时发送</el-dropdown-item>
                  <el-dropdown-item>请求已读回执</el-dropdown-item>
                  <el-dropdown-item>设置优先级</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="toolbar-right">
            <span class="time" style="min-width: 180px; white-space: nowrap;">已于{{ currentTime }}保存至草稿</span>
            <div class="tool-btn" @click="closeEditor">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>
        
        <!-- 邮件表单区域 -->
        <div class="mail-form">
          <!-- 收件人行 -->
          <div class="form-row">
            <div class="form-label">收件人：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.recipients"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入收件人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="form-actions">
              <span class="action-link" @click="showCc = !showCc">抄送</span>
              <span class="action-link" @click="showBcc = !showBcc">密送</span>
              <span>|</span>
              <span class="action-link">分别发送</span>
            </div>
          </div>
          
          <!-- 抄送行 -->
          <div class="form-row" v-if="showCc">
            <div class="form-label">抄送：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.cc"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入抄送人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          
          <!-- 密送行 -->
          <div class="form-row" v-if="showBcc">
            <div class="form-label">密送：</div>
            <div class="form-field">
              <el-select
                v-model="mailForm.bcc"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="请输入密送人"
                :remote-method="searchUsers"
                :loading="loading"
                class="recipient-select"
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="user-option">
                    <el-avatar :size="24" :src="item.avatar">{{ item.label.substring(0, 1) }}</el-avatar>
                    <span>{{ item.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          
          <!-- 主题行 -->
          <div class="form-row">
            <div class="form-label">主题：</div>
            <div class="form-field">
              <el-input placeholder="请输入邮件主题" v-model="mailForm.subject" />
            </div>
          </div>
        </div>
        
        <!-- 编辑器工具栏 -->
        <div class="editor-toolbar" style="background-color: #f5faff; border-bottom: 1px solid #e0e0e0; padding: 10px 20px;">
          <div class="toolbar-group">
            <div class="tool-btn">
              <el-icon><ArrowLeftBold /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><ArrowRightBold /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><PictureFilled /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Link /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Document /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Avatar /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-select">
              <span>默认字体</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <div class="tool-select">
              <span>字号</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-btn" @click="execFormatCommand('bold')" title="加粗">
              <font-awesome-icon :icon="['fas', 'bold']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('italic')" title="斜体">
              <font-awesome-icon :icon="['fas', 'italic']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('underline')" title="下划线">
              <font-awesome-icon :icon="['fas', 'underline']" />
            </div>
            <div class="tool-btn">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="tool-btn">
              <el-icon><Edit /></el-icon>
            </div>
          </div>
          
          <div class="toolbar-group">
            <div class="tool-btn" @click="execFormatCommand('insertUnorderedList')" title="无序列表">
              <font-awesome-icon :icon="['fas', 'list-ul']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('insertOrderedList')" title="有序列表">
              <font-awesome-icon :icon="['fas', 'list-ol']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyLeft')" title="左对齐">
              <font-awesome-icon :icon="['fas', 'align-left']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyCenter')" title="居中对齐">
              <font-awesome-icon :icon="['fas', 'align-center']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyRight')" title="右对齐">
              <font-awesome-icon :icon="['fas', 'align-right']" />
            </div>
            <div class="tool-btn" @click="execFormatCommand('justifyFull')" title="两端对齐">
              <font-awesome-icon :icon="['fas', 'align-justify']" />
            </div>
          </div>
        </div>
        
        <!-- 编辑器内容区 -->
        <div class="editor-content" contenteditable="true" @input="onEditorInput" style="flex: 1; padding: 20px; background-color: #ffffff; min-height: 300px; outline: none; border-radius: 0 0 4px 4px;">
          <p>请输入正文</p>
        </div>
        
        <!-- 发件人信息 -->
        <div class="sender-info">
          <span>发件人：</span>
          <span>{{ currentUser }}</span>
        </div>
      </div>
      
      <!-- 右侧联系人列表 -->
      <div class="contact-list" style="width: 220px; background-color: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-left: 8px; overflow: hidden;">
        <div class="contact-header" style="padding: 12px 15px; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e6e6e6; background-color: #f5faff;">
          <span>联系人</span>
        </div>
        
        <div class="contact-search" style="padding: 10px; border-bottom: 1px solid #e6e6e6;">
          <div class="header-search" style="width: 100%; height: 32px;">
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
                <path d="M12 12l-2.5-2.5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <input class="search-input" type="text" placeholder="搜索联系人" v-model="contactSearch" />
          </div>
        </div>
        
        <div class="contact-groups" style="flex: 1; overflow-y: auto; padding: 10px;">
          <div 
            v-for="(group, index) in contactGroups" 
            :key="index"
            class="contact-group"
            style="margin-bottom: 10px;"
          >
            <div 
              class="folder-item" 
              @click="toggleGroupExpand(index)"
              style="display: flex; align-items: center; padding: 6px 4px; cursor: pointer; font-size: 12px; color: #333; border-radius: 2px; margin-bottom: 2px;"
            >
              <span class="folder-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="#ff9800" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :transform="!group.expanded ? 'rotate(-90 8 8)' : ''"/>
                </svg>
              </span>
              <span class="folder-name">{{ group.name }}</span>
              <span class="folder-badge">{{ group.contacts.length }}</span>
            </div>
            
            <div class="group-contacts" v-if="group.expanded">
              <div 
                v-for="contact in filteredContacts(group.contacts)" 
                :key="contact.id"
                class="contact-item"
                @click="addRecipient(contact)"
              >
                <el-avatar :size="24">{{ contact.name.substring(0, 1) }}</el-avatar>
                <div class="contact-info" style="flex: 1; min-width: 0; overflow: hidden;">
                  <div class="contact-name" style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ contact.name }}</div>
                  <div class="contact-email" style="font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ contact.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import '@/views/mail/mail.css'
import topImage from '@/views/mail/image/top.png'

// 导入Font Awesome组件和图标
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline
)
import {
  Document,
  Edit,
  Star,
  Position,
  Files,
  Delete,
  Folder,
  Search,
  Plus,
  ArrowDown,
  ArrowRight,
  Setting,
  Back,
  Paperclip,
  Clock,
  CaretTop,
  CaretBottom,
  Avatar,
  PictureFilled,
  Link,
  ArrowRightBold,
  ArrowLeftBold,
  View,
  Close
} from '@element-plus/icons-vue'

// 导入mock数据
import { 
  sidebarItems as mockSidebarItems, 
  userOptions as mockUserOptions, 
  contactGroups as mockContactGroups,
  sendingOptions as mockSendingOptions,
  searchUsers
} from './mock/write.js'

const router = useRouter()

// 表单数据
const mailForm = ref({
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  content: ''
})

// UI状态
const showCc = ref(false)
const showBcc = ref(false)
const contactSearch = ref('')
const loading = ref(false)

// 使用mock数据
const sidebarItems = ref(mockSidebarItems)
const userOptions = ref(mockUserOptions)
const contactGroups = ref(mockContactGroups.map(group => ({ ...group, expanded: true })))
const sendingOptions = mockSendingOptions

// 当前用户信息
const userStore = useUserStore();
const currentUser = computed(() => userStore.getUser.nickname || '未登录用户');

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

// 菜单图标映射
const getMenuIcon = (iconName) => {
  const iconMap = {
    'Edit': ['fas', 'pen-to-square'],
    'Document': ['fas', 'envelope'],
    'Star': ['fas', 'star'],
    'Position': ['fas', 'paper-plane'],
    'Files': ['fas', 'file'],
    'Delete': ['fas', 'trash'],
    'Folder': ['fas', 'folder'],
    'Search': ['fas', 'search'],
    'Plus': ['fas', 'plus'],
    'Folder-Delete': ['fas', 'dumpster']
  }
  
  return iconMap[iconName] || ['fas', 'envelope'] // 默认图标
}

// 模拟搜索用户
const remoteSearch = (query) => {
  if (query) {
    loading.value = true
    searchUsers(query).then(results => {
      userOptions.value = results
      loading.value = false
    })
  } else {
    userOptions.value = mockUserOptions
  }
}

// 切换联系人列表显示 - 已移除折叠功能
const toggleContactList = () => {
  // 不再需要
}

// 切换分组展开状态
const toggleGroupExpand = (index) => {
  contactGroups.value[index].expanded = !contactGroups.value[index].expanded
}

// 过滤联系人
const filteredContacts = (contacts) => {
  if (!contactSearch.value) return contacts
  return contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.value.toLowerCase()) || 
    contact.email.toLowerCase().includes(contactSearch.value.toLowerCase())
  )
}

// 添加收件人
const addRecipient = (contact) => {
  const recipient = {
    value: contact.id,
    label: `${contact.name} <${contact.email}>`
  }
  if (!mailForm.value.recipients.some(item => item.value === recipient.value)) {
    mailForm.value.recipients.push(recipient)
  }
}

// 处理编辑器输入
const handleEditorInput = (e) => {
  mailForm.value.content = e.target.innerHTML
}

// 发送邮件
const sendMail = () => {
  if (!mailForm.value.recipients.length) {
    ElMessage.warning('请选择收件人')
    return
  }
  if (!mailForm.value.subject) {
    ElMessageBox.confirm('是否确认发送无主题邮件？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      doSendMail()
    }).catch(() => {})
    return
  }
  doSendMail()
}

// 执行发送邮件
const doSendMail = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('邮件发送成功')
    router.push('/mail/inbox')
  }, 1000)
}

// 关闭编辑器
const closeEditor = () => {
  ElMessageBox.confirm('是否保存草稿？', '提示', {
    confirmButtonText: '保存',
    cancelButtonText: '不保存',
    distinguishCancelAndClose: true,
    closeOnClickModal: false
  }).then(() => {
    // 保存草稿
    console.log('保存草稿:', mailForm.value)
    ElMessage.success('草稿保存成功')
    router.push('/mail/inbox')
  }).catch((action) => {
    if (action === 'cancel') {
      // 不保存，直接返回
      router.push('/mail/inbox')
    }
  })
}

// 上传附件
const uploadAttachment = () => {
  console.log('上传附件')
}

// 插入图片
const insertImage = () => {
  console.log('插入图片')
}

// 插入表格
const insertTable = () => {
  console.log('插入表格')
}

// 文本格式化命令
const execFormatCommand = (command) => {
  document.execCommand(command, false, null)
}

onMounted(() => {
  // 初始化编辑器
})
</script>



<style scoped>
/* 整体布局 */
.mail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  color: #303133;
  overflow: hidden; /* 防止溢出出现滚动条 */
}

/* 使用:deep选择器来正确应用按钮样式 */
.sidebar :deep(.sidebar-top) {
  margin: 0 -8px 20px -8px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  padding: 12px 8px 8px 8px;
  border-bottom: 2px solid #e3f2fd;
}

.sidebar :deep(.compose-btn), .sidebar :deep(.inbox-btn) {
  width: 100%;
  padding: 8px 6px;
  margin: 8px 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  color: #0b2a5a;
  font-weight: 800;
}

.sidebar :deep(.sidebar-divider) {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 2px;
}

.sidebar :deep(.compose-btn.active) { color: #0b2a5a; }

.sidebar :deep(.compose-btn:hover), .sidebar :deep(.inbox-btn:hover) { opacity: 0.9; }

.sidebar :deep(.compose-btn.active:hover) {
  background-color: #3367d6;
}

.folder-list {
  flex: 1;
  background: #fff;
  margin: 0 -8px -8px -8px;
  padding: 8px;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 8px 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-radius: 12px;
  margin-bottom: 3px;
}

.folder-icon {
  margin-right: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.folder-name {
  flex: 1;
  font-size: 13px;
}

.folder-badge {
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  color: #666;
  margin-left: 4px;
}

/* 顶部标题栏 */
.mail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.mail-logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 30px;
  height: 30px;
  background-color: #4e73df;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #4e73df;
}

.search-box {
  width: 240px;
}

/* 主体布局 */
.content-wrapper {
  display: flex;
  flex: 1;
  background-color: #f5f7f9;
  padding: 0 8px 8px 8px;
  gap: 8px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  height: 66px;
  background-color: #fff;
  border-bottom: 2px solid #e3f2fd;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tool-btn {
  height: 33px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  color: #222;
  display: flex;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
}

.tool-btn:hover {
  background-color: #f0f0f0;
}

.tool-btn.primary {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.tool-btn.primary:hover {
  background-color: #3367d6;
}

.tool-btn .el-icon {
  margin-right: 5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.time {
  font-size: 12px;
  color: #666;
  margin-right: 10px;
}

/* 邮件表单 */
.mail-form {
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-label {
  width: 70px;
  text-align: right;
  padding-right: 10px;
  font-size: 14px;
  color: #606266;
}

.form-field {
  flex: 1;
}

.form-actions {
  margin-left: 10px;
  display: flex;
  gap: 10px;
}

.action-link {
  color: #4e73df;
  cursor: pointer;
  font-size: 14px;
}

.action-link:hover {
  text-decoration: underline;
}

.recipient-select {
  width: 100%;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 编辑器工具栏 */
.editor-toolbar {
  padding: 8px 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background-color: #f5faff;
  align-items: center;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 10px;
  flex-wrap: wrap;
}

.tool-icon {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  padding: 0 5px;
  font-size: 12px;
}

.tool-icon:hover {
  background-color: #ecf5ff;
}

.format-btn {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.format-btn:hover {
  background-color: #ecf5ff;
}

.format-btn .el-icon {
  margin-left: 5px;
}

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  padding: 15px 20px;
  overflow-y: auto;
  min-height: 250px;
  outline: none;
  color: #303133;
  font-size: 14px;
}

/* 发件人信息 */
.sender-info {
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #606266;
  background-color: #f8f9fa;
}

.sender-name {
  color: #409eff;
  margin-left: 5px;
  cursor: pointer;
}

/* 联系人列表 */
.contact-list {
  width: 220px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-left: 8px;
  overflow: hidden;
}

.contact-header {
  padding: 12px 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4e73df;
  background-color: #f5faff;
}

.contact-search {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.contact-groups {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 120px); /* 调整高度以适应滚动 */
}

.contact-group {
  margin-bottom: 2px;
}

.group-header {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: #f5f7fa;
  font-size: 14px;
  color: #606266;
  border-radius: 4px;
  margin: 2px 4px;
}

.group-header .el-icon {
  margin-right: 5px;
  font-size: 12px;
  color: #909399;
}

.group-header .count {
  margin-left: 5px;
  font-size: 12px;
  color: #909399;
}

.group-contacts {
  padding: 2px 0;
}

.contact-item {
  padding: 6px 12px 6px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 2px 4px;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item .el-avatar {
  margin-right: 8px;
  background-color: #4e73df;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 13px;
  color: #303133;
}

.contact-email {
  font-size: 12px;
  color: #909399;
}
</style>